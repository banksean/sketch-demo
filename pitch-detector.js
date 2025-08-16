class PitchDetector {
    constructor(audioContext, sampleRate = 44100) {
        this.audioContext = audioContext;
        this.sampleRate = sampleRate;
        this.bufferSize = 4096;
        this.threshold = 0.01; // Minimum volume threshold
        this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    }

    // Autocorrelation pitch detection algorithm
    detectPitch(audioBuffer) {
        const data = new Float32Array(audioBuffer);
        
        // Check if there's enough volume
        const volume = this.getVolume(data);
        if (volume < this.threshold) {
            return { frequency: 0, note: null, confidence: 0, volume };
        }

        // Apply window function to reduce artifacts
        this.applyHammingWindow(data);
        
        // Perform autocorrelation
        const autocorrelation = this.autocorrelate(data);
        
        // Find the best period
        const period = this.findBestPeriod(autocorrelation);
        
        if (period === -1) {
            return { frequency: 0, note: null, confidence: 0, volume };
        }
        
        const frequency = this.sampleRate / period;
        
        // Filter out unrealistic frequencies for human humming (80Hz - 1000Hz)
        if (frequency < 80 || frequency > 1000) {
            return { frequency: 0, note: null, confidence: 0, volume };
        }
        
        const note = this.frequencyToNote(frequency);
        const confidence = autocorrelation[period];
        
        return { frequency, note, confidence, volume };
    }

    getVolume(data) {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i] * data[i];
        }
        return Math.sqrt(sum / data.length);
    }

    applyHammingWindow(data) {
        for (let i = 0; i < data.length; i++) {
            data[i] *= 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (data.length - 1));
        }
    }

    autocorrelate(data) {
        const autocorrelation = new Float32Array(data.length);
        
        for (let lag = 0; lag < data.length; lag++) {
            let sum = 0;
            for (let i = 0; i < data.length - lag; i++) {
                sum += data[i] * data[i + lag];
            }
            autocorrelation[lag] = sum / (data.length - lag);
        }
        
        // Normalize
        const maxVal = Math.max(...autocorrelation);
        if (maxVal > 0) {
            for (let i = 0; i < autocorrelation.length; i++) {
                autocorrelation[i] /= maxVal;
            }
        }
        
        return autocorrelation;
    }

    findBestPeriod(autocorrelation) {
        // Look for peaks in the autocorrelation function
        const minPeriod = Math.floor(this.sampleRate / 1000); // 1000 Hz max
        const maxPeriod = Math.floor(this.sampleRate / 80);    // 80 Hz min
        
        let bestPeriod = -1;
        let bestCorrelation = 0.3; // Minimum confidence threshold
        
        for (let period = minPeriod; period < Math.min(maxPeriod, autocorrelation.length); period++) {
            if (autocorrelation[period] > bestCorrelation) {
                // Check if this is a local maximum
                if (period === 0 || 
                    (autocorrelation[period] > autocorrelation[period - 1] && 
                     autocorrelation[period] > autocorrelation[period + 1])) {
                    bestCorrelation = autocorrelation[period];
                    bestPeriod = period;
                }
            }
        }
        
        return bestPeriod;
    }

    frequencyToNote(frequency) {
        // A4 = 440Hz = MIDI note 69
        const A4 = 440;
        const noteNumber = Math.round(12 * Math.log2(frequency / A4) + 69);
        const octave = Math.floor((noteNumber - 12) / 12);
        const noteIndex = (noteNumber - 12) % 12;
        
        return {
            name: this.noteNames[noteIndex],
            octave: octave,
            midi: noteNumber,
            frequency: frequency
        };
    }

    midiToFrequency(midiNote) {
        return 440 * Math.pow(2, (midiNote - 69) / 12);
    }
}