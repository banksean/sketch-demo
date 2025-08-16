// Simple MIDI file generator
class SimpleMidiGenerator {
    constructor() {
        this.ticksPerQuarter = 480;
    }

    // Generate a basic MIDI file from notes
    generateMidiFile(notes) {
        if (!notes || notes.length === 0) {
            return null;
        }

        // MIDI file structure: Header + Track
        const header = this.createMidiHeader();
        const track = this.createMidiTrack(notes);
        
        // Combine header and track
        const midiData = this.combineArrays(header, track);
        
        // Convert to base64 data URI
        return this.arrayToDataUri(midiData);
    }

    createMidiHeader() {
        return [
            // MIDI Header Chunk
            0x4D, 0x54, 0x68, 0x64, // "MThd"
            0x00, 0x00, 0x00, 0x06, // Header length (6 bytes)
            0x00, 0x00,             // Format 0
            0x00, 0x01,             // 1 track
            0x01, 0xE0              // 480 ticks per quarter note
        ];
    }

    createMidiTrack(notes) {
        const trackData = [];
        
        // Track header
        trackData.push(...[0x4D, 0x54, 0x72, 0x6B]); // "MTrk"
        
        // We'll fill in the track length later
        const lengthPosition = trackData.length;
        trackData.push(0x00, 0x00, 0x00, 0x00);
        
        const trackEvents = [];
        
        // Set tempo (120 BPM)
        trackEvents.push(...this.createTempoEvent());
        
        // Sort notes by start time
        const sortedNotes = [...notes].sort((a, b) => a.startTime - b.startTime);
        
        let currentTime = 0;
        
        sortedNotes.forEach(note => {
            const startTicks = Math.round(note.startTime * this.ticksPerQuarter * 2); // 2 = 120BPM/60
            const durationTicks = Math.round(note.duration * this.ticksPerQuarter * 2);
            
            // Delta time to note start
            const deltaTime = startTicks - currentTime;
            
            // Note on event
            trackEvents.push(...this.encodeVariableLength(deltaTime));
            trackEvents.push(0x90); // Note on, channel 0
            trackEvents.push(note.midi);
            trackEvents.push(note.velocity || 80);
            
            // Note off event
            trackEvents.push(...this.encodeVariableLength(durationTicks));
            trackEvents.push(0x80); // Note off, channel 0
            trackEvents.push(note.midi);
            trackEvents.push(0x40); // Release velocity
            
            currentTime = startTicks + durationTicks;
        });
        
        // End of track
        trackEvents.push(0x00, 0xFF, 0x2F, 0x00);
        
        // Add track events to track data
        trackData.push(...trackEvents);
        
        // Update track length
        const trackLength = trackEvents.length;
        trackData[lengthPosition] = (trackLength >> 24) & 0xFF;
        trackData[lengthPosition + 1] = (trackLength >> 16) & 0xFF;
        trackData[lengthPosition + 2] = (trackLength >> 8) & 0xFF;
        trackData[lengthPosition + 3] = trackLength & 0xFF;
        
        return trackData;
    }

    createTempoEvent() {
        // Set tempo to 120 BPM
        // Microseconds per quarter note = 60,000,000 / BPM
        const microsecondsPerQuarter = Math.round(60000000 / 120);
        
        return [
            0x00, // Delta time
            0xFF, 0x51, 0x03, // Tempo meta event
            (microsecondsPerQuarter >> 16) & 0xFF,
            (microsecondsPerQuarter >> 8) & 0xFF,
            microsecondsPerQuarter & 0xFF
        ];
    }

    encodeVariableLength(value) {
        const result = [];
        result.unshift(value & 0x7F);
        value >>= 7;
        
        while (value > 0) {
            result.unshift((value & 0x7F) | 0x80);
            value >>= 7;
        }
        
        return result;
    }

    combineArrays(...arrays) {
        const result = [];
        for (const array of arrays) {
            result.push(...array);
        }
        return result;
    }

    arrayToDataUri(byteArray) {
        // Convert byte array to base64
        const binaryString = String.fromCharCode.apply(null, byteArray);
        const base64 = btoa(binaryString);
        return `data:audio/midi;base64,${base64}`;
    }
}