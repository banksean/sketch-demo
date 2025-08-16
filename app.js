class HumToMidiApp {
    constructor() {
        this.audioContext = null;
        this.microphone = null;
        this.analyser = null;
        this.pitchDetector = null;
        this.midiConverter = null;
        this.isRecording = false;
        this.animationId = null;
        this.startTime = null;
        
        // Canvas for pitch visualization
        this.canvas = document.getElementById('pitchCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.pitchHistory = [];
        this.maxHistoryLength = 400; // About 10 seconds at 40fps
        
        this.initializeUI();
    }

    initializeUI() {
        // Button event listeners
        document.getElementById('startBtn').addEventListener('click', () => this.startRecording());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopRecording());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearNotes());
        document.getElementById('downloadMidiBtn').addEventListener('click', () => this.downloadMidi());
        
        // Initial UI state
        this.updateStatus('Click "Start Recording" to begin');
        this.drawCanvas();
    }

    async startRecording() {
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                } 
            });
            
            // Set up Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            
            this.analyser.fftSize = 4096;
            this.analyser.smoothingTimeConstant = 0.3;
            
            this.microphone.connect(this.analyser);
            
            // Initialize pitch detector and MIDI converter
            this.pitchDetector = new PitchDetector(this.audioContext, this.audioContext.sampleRate);
            this.midiConverter = new MidiConverter();
            
            this.isRecording = true;
            this.startTime = Date.now();
            
            // Update UI
            document.getElementById('startBtn').disabled = true;
            document.getElementById('stopBtn').disabled = false;
            document.getElementById('clearBtn').disabled = true;
            this.updateStatus('Recording... Start humming!');
            
            // Start processing audio
            this.processAudio();
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
            this.updateStatus('Error: Could not access microphone. Please check permissions.');
        }
    }

    stopRecording() {
        if (!this.isRecording) return;
        
        this.isRecording = false;
        
        // Clean up audio resources
        if (this.microphone) {
            this.microphone.disconnect();
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        // Finalize MIDI conversion
        if (this.midiConverter) {
            const currentTime = (Date.now() - this.startTime) / 1000;
            this.midiConverter.finalize(currentTime);
        }
        
        // Update UI
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        document.getElementById('clearBtn').disabled = false;
        document.getElementById('downloadMidiBtn').disabled = false;
        
        this.updateStatus('Recording stopped. Notes detected!');
        this.updateNotesDisplay();
        
        // Stop animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    processAudio() {
        if (!this.isRecording) return;
        
        const bufferLength = this.analyser.fftSize;
        const dataArray = new Float32Array(bufferLength);
        this.analyser.getFloatTimeDomainData(dataArray);
        
        // Detect pitch
        const pitchResult = this.pitchDetector.detectPitch(dataArray);
        const currentTime = (Date.now() - this.startTime) / 1000;
        
        // Process for MIDI conversion
        this.midiConverter.processPitchDetection(pitchResult, currentTime);
        
        // Update UI
        this.updatePitchDisplay(pitchResult);
        this.updateAudioLevel(pitchResult.volume);
        
        // Add to pitch history for visualization
        this.pitchHistory.push({
            frequency: pitchResult.frequency,
            note: pitchResult.note,
            confidence: pitchResult.confidence,
            timestamp: currentTime
        });
        
        if (this.pitchHistory.length > this.maxHistoryLength) {
            this.pitchHistory.shift();
        }
        
        // Draw visualization
        this.drawCanvas();
        
        // Continue processing
        this.animationId = requestAnimationFrame(() => this.processAudio());
    }

    updatePitchDisplay(pitchResult) {
        const noteElement = document.getElementById('currentNote');
        const freqElement = document.getElementById('currentFreq');
        
        if (pitchResult.note && pitchResult.confidence > 0.4) {
            noteElement.textContent = `${pitchResult.note.name}${pitchResult.note.octave}`;
            freqElement.textContent = `${pitchResult.frequency.toFixed(1)} Hz`;
            noteElement.style.color = '#4CAF50';
        } else {
            noteElement.textContent = '-';
            freqElement.textContent = '- Hz';
            noteElement.style.color = '#ccc';
        }
    }

    updateAudioLevel(volume) {
        const levelBar = document.getElementById('audioLevelBar');
        const percentage = Math.min(100, volume * 1000); // Scale up volume
        levelBar.style.width = `${percentage}%`;
    }

    updateStatus(message) {
        document.getElementById('statusText').textContent = message;
    }

    drawCanvas() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear canvas
        this.ctx.fillStyle = '#f9f9f9';
        this.ctx.fillRect(0, 0, width, height);
        
        if (this.pitchHistory.length === 0) {
            // Draw placeholder text
            this.ctx.fillStyle = '#ccc';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Pitch visualization will appear here', width / 2, height / 2);
            return;
        }
        
        // Draw grid lines
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;
        
        // Horizontal lines (frequency)
        const frequencyRange = { min: 80, max: 800 };
        const noteFrequencies = [82.4, 98, 110, 123.5, 146.8, 164.8, 185, 196, 220, 246.9, 277.2, 311.1]; // C2 to B3
        
        noteFrequencies.forEach(freq => {
            const y = height - ((freq - frequencyRange.min) / (frequencyRange.max - frequencyRange.min)) * height;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        });
        
        // Draw pitch history
        if (this.pitchHistory.length > 1) {
            this.ctx.strokeStyle = '#2196F3';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            let firstPoint = true;
            
            this.pitchHistory.forEach((point, index) => {
                if (point.frequency > 0) {
                    const x = (index / (this.maxHistoryLength - 1)) * width;
                    const y = height - ((point.frequency - frequencyRange.min) / (frequencyRange.max - frequencyRange.min)) * height;
                    
                    if (firstPoint) {
                        this.ctx.moveTo(x, y);
                        firstPoint = false;
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
            });
            
            this.ctx.stroke();
        }
    }

    updateNotesDisplay() {
        const notesList = document.getElementById('notesList');
        const notes = this.midiConverter.getNotes();
        
        if (notes.length === 0) {
            notesList.innerHTML = '<div style="color: #999; text-align: center; padding: 20px;">No notes detected yet</div>';
            return;
        }
        
        notesList.innerHTML = notes.map(note => {
            const noteName = this.midiConverter.midiNumberToNoteName(note.midi);
            const duration = note.duration.toFixed(2);
            return `<div class="note-item">
                        ${noteName}
                        <span class="note-duration">${duration}s</span>
                    </div>`;
        }).join('');
    }

    clearNotes() {
        if (this.midiConverter) {
            this.midiConverter.clear();
        }
        this.pitchHistory = [];
        this.updateNotesDisplay();
        this.drawCanvas();
        document.getElementById('downloadMidiBtn').disabled = true;
        this.updateStatus('Notes cleared');
    }

    downloadMidi() {
        if (!this.midiConverter) {
            return;
        }
        
        const midiDataUri = this.midiConverter.generateMidiFile();
        
        if (!midiDataUri) {
            alert('No notes to export!');
            return;
        }
        
        // Create download link
        const link = document.createElement('a');
        link.href = midiDataUri;
        link.download = `hummed-melody-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.mid`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.updateStatus('MIDI file downloaded!');
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new HumToMidiApp();
});