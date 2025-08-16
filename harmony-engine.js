// Real-time Harmony Generation Engine
class RealtimeHarmonyEngine {
    constructor(audioContext) {
        this.audioContext = audioContext;
        
        // Note buffer for analysis
        this.recentNotes = [];
        this.maxBufferTime = 4000; // 4 seconds of recent notes
        
        // Harmonic state
        this.currentKey = null;
        this.currentChord = null;
        this.currentChordRoot = null;
        this.lastChordChange = 0;
        this.harmonicRhythm = 2000; // ms between potential chord changes
        
        // Settings
        this.enabled = false;
        this.style = 'pop'; // pop, jazz, classical, folk
        this.complexity = 'simple'; // simple, rich
        this.harmonicSpeed = 'medium'; // slow, medium, fast
        
        // Audio synthesis
        this.synthNodes = [];
        this.masterGain = null;
        this.setupAudioSynthesis();
        
        // Music theory data
        this.initializeMusicTheory();
    }
    
    initializeMusicTheory() {
        // Key profiles for Krumhansl-Schmuckler key detection
        this.keyProfiles = {
            major: [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88],
            minor: [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]
        };
        
        // Common chord progressions by style
        this.progressions = {
            pop: [
                ['I', 'V', 'vi', 'IV'], // C-G-Am-F
                ['vi', 'IV', 'I', 'V'], // Am-F-C-G
                ['I', 'vi', 'IV', 'V'], // C-Am-F-G
                ['vi', 'V', 'IV', 'I']  // Am-G-F-C
            ],
            jazz: [
                ['ii7', 'V7', 'I', 'I'], // Dm7-G7-C-C
                ['I', 'VI7', 'ii7', 'V7'], // C-A7-Dm7-G7
                ['iii7', 'VI7', 'ii7', 'V7'], // Em7-A7-Dm7-G7
                ['vi7', 'ii7', 'V7', 'I'] // Am7-Dm7-G7-C
            ],
            classical: [
                ['I', 'IV', 'V', 'I'], // C-F-G-C
                ['I', 'vi', 'ii', 'V'], // C-Am-Dm-G
                ['vi', 'ii', 'V', 'I'], // Am-Dm-G-C
                ['I', 'V', 'vi', 'V'] // C-G-Am-G
            ],
            folk: [
                ['I', 'IV', 'I', 'V'], // C-F-C-G
                ['I', 'V', 'I', 'V'], // C-G-C-G
                ['vi', 'IV', 'I', 'V'], // Am-F-C-G
                ['I', 'vi', 'V', 'I'] // C-Am-G-C
            ]
        };
        
        // Roman numeral to chord mapping
        this.romanNumerals = {
            'I': [0, 4, 7], 'ii': [2, 5, 9], 'iii': [4, 7, 11], 'IV': [5, 9, 0], 'V': [7, 11, 2], 'vi': [9, 0, 4], 'vii°': [11, 2, 5],
            'I7': [0, 4, 7, 11], 'ii7': [2, 5, 9, 0], 'iii7': [4, 7, 11, 2], 'IV7': [5, 9, 0, 4], 'V7': [7, 11, 2, 5], 'vi7': [9, 0, 4, 7], 'vii7': [11, 2, 5, 9],
            'VI7': [9, 1, 4, 7] // Secondary dominant
        };
        
        this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    }
    
    setupAudioSynthesis() {
        if (!this.audioContext) return;
        
        // Create master gain node
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.15; // Quiet harmony
        this.masterGain.connect(this.audioContext.destination);
    }
    
    // Main processing function - called for each detected note
    processNote(note, timestamp, confidence) {
        if (!this.enabled || !note) return;
        
        // Add note to recent buffer
        this.addNoteToBuffer(note, timestamp, confidence);
        
        // Clean old notes from buffer
        this.cleanBuffer(timestamp);
        
        // Detect key if not established or needs updating
        this.updateKeyDetection();
        
        // Generate harmony if appropriate
        if (this.shouldGenerateNewChord(timestamp)) {
            this.generateAndPlayHarmony(timestamp);
        }
    }
    
    addNoteToBuffer(note, timestamp, confidence) {
        this.recentNotes.push({
            midi: note.midi,
            name: note.name,
            octave: note.octave,
            timestamp: timestamp,
            confidence: confidence
        });
    }
    
    cleanBuffer(currentTime) {
        const cutoffTime = currentTime - this.maxBufferTime;
        this.recentNotes = this.recentNotes.filter(note => note.timestamp > cutoffTime);
    }
    
    updateKeyDetection() {
        if (this.recentNotes.length < 5) return; // Need enough notes
        
        const detectedKey = this.detectKey(this.recentNotes);
        
        // Only change key if we're confident
        if (detectedKey && detectedKey.confidence > 0.7) {
            if (!this.currentKey || detectedKey.key !== this.currentKey.key || detectedKey.mode !== this.currentKey.mode) {
                this.currentKey = detectedKey;
                console.log('Key detected:', this.currentKey.key, this.currentKey.mode);
            }
        }
    }
    
    detectKey(notes) {
        // Count note occurrences
        const noteCounts = new Array(12).fill(0);
        notes.forEach(note => {
            const pitchClass = note.midi % 12;
            noteCounts[pitchClass] += note.confidence || 1;
        });
        
        // Normalize counts
        const total = noteCounts.reduce((sum, count) => sum + count, 0);
        const noteDistribution = noteCounts.map(count => count / total);
        
        let bestKey = null;
        let bestScore = -1;
        
        // Test all 24 keys (12 major + 12 minor)
        for (let tonic = 0; tonic < 12; tonic++) {
            ['major', 'minor'].forEach(mode => {
                let score = 0;
                for (let i = 0; i < 12; i++) {
                    const keyIndex = (i - tonic + 12) % 12;
                    score += noteDistribution[i] * this.keyProfiles[mode][keyIndex];
                }
                
                if (score > bestScore) {
                    bestScore = score;
                    bestKey = {
                        key: this.noteNames[tonic],
                        mode: mode,
                        tonic: tonic,
                        confidence: score
                    };
                }
            });
        }
        
        return bestKey;
    }
    
    shouldGenerateNewChord(timestamp) {
        // Adjust harmonic rhythm based on speed setting
        const rhythmMap = { slow: 3000, medium: 2000, fast: 1000 };
        const rhythm = rhythmMap[this.harmonicSpeed] || 2000;
        
        return (timestamp - this.lastChordChange) >= rhythm;
    }
    
    generateAndPlayHarmony(timestamp) {
        if (!this.currentKey) return;
        
        const chord = this.generateChord();
        if (chord && chord !== this.currentChord) {
            this.currentChord = chord;
            this.lastChordChange = timestamp;
            this.playChord(chord);
            
            // Trigger UI update
            this.onChordChange?.(chord);
        }
    }
    
    generateChord() {
        if (!this.currentKey || this.recentNotes.length === 0) return null;
        
        // Analyze recent melody for chord implications
        const recentMelody = this.recentNotes.slice(-5); // Last 5 notes
        const chordTones = this.findImpliedChordTones(recentMelody);
        
        // Generate chord based on style
        return this.generateChordForStyle(chordTones);
    }
    
    findImpliedChordTones(notes) {
        const tonic = this.currentKey.tonic;
        const mode = this.currentKey.mode;
        
        // Find scale degrees of recent notes
        const scaleDegrees = notes.map(note => {
            let degree = (note.midi % 12 - tonic + 12) % 12;
            return this.chromaticToScaleDegree(degree, mode);
        }).filter(degree => degree !== null);
        
        return scaleDegrees;
    }
    
    chromaticToScaleDegree(chromatic, mode) {
        const scaleIntervals = {
            major: [0, 2, 4, 5, 7, 9, 11],
            minor: [0, 2, 3, 5, 7, 8, 10]
        };
        
        const intervals = scaleIntervals[mode];
        const index = intervals.indexOf(chromatic);
        return index >= 0 ? index + 1 : null; // 1-indexed scale degrees
    }
    
    generateChordForStyle(scaleDegrees) {
        if (!scaleDegrees.length) return this.getDefaultChord();
        
        // Find most common scale degree
        const degreeCount = {};
        scaleDegrees.forEach(degree => {
            degreeCount[degree] = (degreeCount[degree] || 0) + 1;
        });
        
        const primaryDegree = Object.keys(degreeCount).reduce((a, b) => 
            degreeCount[a] > degreeCount[b] ? a : b
        );
        
        // Generate chord based on primary scale degree and style
        return this.getChordForDegree(parseInt(primaryDegree));
    }
    
    getChordForDegree(degree) {
        const tonic = this.currentKey.tonic;
        const mode = this.currentKey.mode;
        
        // Simple diatonic chord mapping
        const chordMap = {
            major: {
                1: 'I', 2: 'ii', 3: 'iii', 4: 'IV', 5: 'V', 6: 'vi', 7: 'vii°'
            },
            minor: {
                1: 'i', 2: 'ii°', 3: 'III', 4: 'iv', 5: 'v', 6: 'VI', 7: 'VII'
            }
        };
        
        let romanNumeral = chordMap[mode][degree] || 'I';
        
        // Add 7ths for jazz style
        if (this.style === 'jazz' && this.complexity === 'rich') {
            if (['ii', 'iii', 'vi', 'V'].includes(romanNumeral)) {
                romanNumeral += '7';
            }
        }
        
        return {
            roman: romanNumeral,
            root: tonic,
            notes: this.getChordNotes(romanNumeral, tonic)
        };
    }
    
    getDefaultChord() {
        if (!this.currentKey) return null;
        
        return {
            roman: 'I',
            root: this.currentKey.tonic,
            notes: this.getChordNotes('I', this.currentKey.tonic)
        };
    }
    
    getChordNotes(romanNumeral, root) {
        const intervals = this.romanNumerals[romanNumeral] || [0, 4, 7];
        return intervals.map(interval => (root + interval) % 12);
    }
    
    playChord(chord) {
        if (!this.audioContext || !chord) return;
        
        // Stop previous chord
        this.stopCurrentChord();
        
        // Play new chord with piano-like synthesis
        const now = this.audioContext.currentTime;
        const duration = 2.0; // Sustain chord
        
        chord.notes.forEach((note, index) => {
            const frequency = 440 * Math.pow(2, (note - 9) / 12); // MIDI note to frequency
            const octaveAdjust = index === 0 ? 0 : 1; // Bass note lower
            const adjustedFreq = frequency * Math.pow(2, octaveAdjust);
            
            this.createAndPlayTone(adjustedFreq, now, duration, 0.1 / (index + 1));
        });
    }
    
    createAndPlayTone(frequency, startTime, duration, volume) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();
        
        // Piano-like tone
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(frequency, startTime);
        
        // Low-pass filter for warmer sound
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(2000, startTime);
        filterNode.Q.setValueAtTime(1, startTime);
        
        // Envelope
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(volume * 0.3, startTime + duration * 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        // Connect nodes
        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        // Schedule
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
        
        // Store for cleanup
        this.synthNodes.push({ oscillator, gainNode, filterNode });
        
        // Auto-cleanup
        oscillator.onended = () => {
            this.synthNodes = this.synthNodes.filter(node => node.oscillator !== oscillator);
        };
    }
    
    stopCurrentChord() {
        const now = this.audioContext.currentTime;
        this.synthNodes.forEach(({ oscillator, gainNode }) => {
            try {
                gainNode.gain.cancelScheduledValues(now);
                gainNode.gain.setValueAtTime(gainNode.gain.value, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                oscillator.stop(now + 0.1);
            } catch (e) {
                // Ignore errors from already-stopped oscillators
            }
        });
    }
    
    // Control methods
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.stopCurrentChord();
            this.currentChord = null;
        }
    }
    
    setStyle(style) {
        this.style = style;
    }
    
    setComplexity(complexity) {
        this.complexity = complexity;
    }
    
    setHarmonicSpeed(speed) {
        this.harmonicSpeed = speed;
    }
    
    setVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = volume * 0.3; // Keep harmony quieter than melody
        }
    }
    
    // Cleanup
    destroy() {
        this.stopCurrentChord();
        if (this.masterGain) {
            this.masterGain.disconnect();
        }
    }
}