class MidiConverter {
    constructor() {
        this.notes = [];
        this.currentNote = null;
        this.noteStartTime = null;
        this.minNoteDuration = 0.1; // Minimum note duration in seconds
        this.pitchStabilityThreshold = 0.5; // How stable pitch needs to be
        this.recentPitches = [];
        this.maxRecentPitches = 10;
    }

    // Process a pitch detection result
    processPitchDetection(pitchResult, timestamp) {
        const { frequency, note, confidence, volume } = pitchResult;
        
        // If no clear pitch detected
        if (!note || confidence < 0.4 || volume < 0.01) {
            this.endCurrentNote(timestamp);
            return;
        }

        // Add to recent pitches for stability analysis
        this.recentPitches.push({ note: note.midi, timestamp, confidence });
        if (this.recentPitches.length > this.maxRecentPitches) {
            this.recentPitches.shift();
        }

        // Check if pitch is stable enough
        const stablePitch = this.getStablePitch();
        if (!stablePitch) {
            return;
        }

        // If this is the same note as current, continue it
        if (this.currentNote && Math.abs(this.currentNote.midi - stablePitch) <= 1) {
            return; // Continue current note
        }

        // End current note and start new one
        this.endCurrentNote(timestamp);
        this.startNewNote(stablePitch, timestamp, confidence);
    }

    getStablePitch() {
        if (this.recentPitches.length < 3) {
            return null;
        }

        // Find the most common pitch in recent detections
        const pitchCounts = {};
        let totalConfidence = 0;
        
        this.recentPitches.forEach(p => {
            const roundedPitch = Math.round(p.note);
            if (!pitchCounts[roundedPitch]) {
                pitchCounts[roundedPitch] = { count: 0, totalConfidence: 0 };
            }
            pitchCounts[roundedPitch].count++;
            pitchCounts[roundedPitch].totalConfidence += p.confidence;
            totalConfidence += p.confidence;
        });

        // Find pitch with highest weighted score (count * confidence)
        let bestPitch = null;
        let bestScore = 0;
        
        for (const [pitch, data] of Object.entries(pitchCounts)) {
            const score = (data.count / this.recentPitches.length) * (data.totalConfidence / data.count);
            if (score > bestScore && score > this.pitchStabilityThreshold) {
                bestScore = score;
                bestPitch = parseInt(pitch);
            }
        }

        return bestPitch;
    }

    startNewNote(midiNote, timestamp, confidence) {
        this.currentNote = {
            midi: midiNote,
            startTime: timestamp,
            confidence: confidence
        };
        this.noteStartTime = timestamp;
    }

    endCurrentNote(timestamp) {
        if (!this.currentNote || !this.noteStartTime) {
            return;
        }

        const duration = timestamp - this.noteStartTime;
        
        // Only add notes that are long enough
        if (duration >= this.minNoteDuration) {
            this.notes.push({
                midi: this.currentNote.midi,
                startTime: this.noteStartTime,
                duration: duration,
                velocity: Math.min(127, Math.max(40, Math.round(this.currentNote.confidence * 127)))
            });
        }

        this.currentNote = null;
        this.noteStartTime = null;
    }

    // Finalize recording and clean up any current note
    finalize(timestamp) {
        this.endCurrentNote(timestamp);
        return this.notes.slice(); // Return copy of notes
    }

    // Clear all notes
    clear() {
        this.notes = [];
        this.currentNote = null;
        this.noteStartTime = null;
        this.recentPitches = [];
    }

    // Convert notes to MIDI file
    generateMidiFile(notes = null) {
        const notesToUse = notes || this.notes;
        
        if (notesToUse.length === 0) {
            return null;
        }

        // Use our simple MIDI generator
        const midiGenerator = new SimpleMidiGenerator();
        return midiGenerator.generateMidiFile(notesToUse);
    }

    secondsToTicks(seconds) {
        // Convert seconds to MIDI ticks (assuming 480 ticks per quarter note at 120 BPM)
        const ticksPerSecond = (480 * 120) / 60; // 480 * (BPM / 60)
        const ticks = Math.round(seconds * ticksPerSecond);
        
        // Quantize to common note durations
        const commonDurations = [120, 240, 480, 960, 1920]; // 32nd, 16th, 8th, quarter, half
        let bestDuration = commonDurations[0];
        let bestDiff = Math.abs(ticks - bestDuration);
        
        for (const duration of commonDurations) {
            const diff = Math.abs(ticks - duration);
            if (diff < bestDiff) {
                bestDiff = diff;
                bestDuration = duration;
            }
        }
        
        return bestDuration.toString();
    }

    midiNumberToNoteName(midiNumber) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = Math.floor((midiNumber - 12) / 12);
        const noteIndex = (midiNumber - 12) % 12;
        return noteNames[noteIndex] + octave;
    }

    // Get current detected notes for UI display
    getNotes() {
        return this.notes.slice(); // Return copy
    }
}