class DNATranscription {
    constructor() {
        this.canvas = document.getElementById('transcriptionCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 1.0;
        this.animationFrame = null;
        
        // DNA sequence for demonstration
        this.dnaSequence = 'ATCGGATCCGAATTCGCGGCCGC';
        this.rnaSequence = '';
        this.currentPosition = 0;
        this.polymerasePosition = 0;
        
        // Animation parameters
        this.baseWidth = 30;
        this.baseHeight = 20;
        this.strandSeparation = 60;
        this.polymeraseWidth = 40;
        this.polymeraseHeight = 30;
        this.helixAmplitude = 20;
        this.helixFrequency = 0.1;
        
        this.initializeEventListeners();
        this.reset();
    }
    
    initializeEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        
        const speedSlider = document.getElementById('speedSlider');
        speedSlider.addEventListener('input', (e) => {
            this.speed = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = `${this.speed.toFixed(1)}x`;
        });
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.animate();
            
            document.getElementById('startBtn').disabled = true;
            document.getElementById('pauseBtn').disabled = false;
            this.updateCurrentStep('RNA polymerase is transcribing DNA...');
        }
    }
    
    pause() {
        this.isPaused = true;
        this.isRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        this.updateCurrentStep('Transcription paused');
    }
    
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentPosition = 0;
        this.polymerasePosition = 0;
        this.rnaSequence = '';
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        
        this.updateSequenceDisplay();
        this.updateCurrentStep('Click Start to begin transcription');
        this.draw();
    }
    
    animate() {
        if (!this.isRunning) return;
        
        // Update transcription progress
        if (this.currentPosition < this.dnaSequence.length) {
            this.polymerasePosition += 0.5 * this.speed;
            
            if (this.polymerasePosition >= this.currentPosition + 1) {
                this.transcribeNextBase();
                this.currentPosition++;
            }
        } else if (this.polymerasePosition < this.dnaSequence.length + 2) {
            this.polymerasePosition += 0.5 * this.speed;
        } else {
            this.complete();
            return;
        }
        
        this.draw();
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    transcribeNextBase() {
        if (this.currentPosition < this.dnaSequence.length) {
            const dnaBase = this.dnaSequence[this.currentPosition];
            const rnaBase = this.getComplementaryRNABase(dnaBase);
            this.rnaSequence += rnaBase;
            this.updateSequenceDisplay();
        }
    }
    
    getComplementaryRNABase(dnaBase) {
        const complement = {
            'A': 'U',
            'T': 'A',
            'G': 'C',
            'C': 'G'
        };
        return complement[dnaBase] || 'X';
    }
    
    complete() {
        this.isRunning = false;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        this.updateCurrentStep('Transcription complete! RNA transcript has been synthesized.');
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw DNA strands
        this.drawDNAStrands();
        
        // Draw RNA polymerase
        this.drawRNAPolymerase();
        
        // Draw RNA strand
        this.drawRNAStrand();
    }
    
    drawDNAStrands() {
        const centerY = this.canvas.height / 2;
        const startX = 50;
        
        for (let i = 0; i < this.dnaSequence.length; i++) {
            const x = startX + i * this.baseWidth;
            const isUnwound = i >= this.polymerasePosition - 2 && i <= this.polymerasePosition + 1;
            
            if (isUnwound) {
                // Draw unwound DNA (separated strands)
                this.drawBase(this.dnaSequence[i], x, centerY - this.strandSeparation/2, true);
                this.drawBase(this.getComplementaryDNABase(this.dnaSequence[i]), x, centerY + this.strandSeparation/2, true);
            } else {
                // Draw wound DNA (helical)
                const helixOffset1 = Math.sin((i * this.helixFrequency) * 2 * Math.PI) * this.helixAmplitude;
                const helixOffset2 = Math.sin((i * this.helixFrequency + 0.5) * 2 * Math.PI) * this.helixAmplitude;
                
                this.drawBase(this.dnaSequence[i], x, centerY + helixOffset1 - 15, false);
                this.drawBase(this.getComplementaryDNABase(this.dnaSequence[i]), x, centerY + helixOffset2 + 15, false);
                
                // Draw connecting lines
                this.ctx.strokeStyle = '#ccc';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(x + this.baseWidth/2, centerY + helixOffset1 - 15 + this.baseHeight/2);
                this.ctx.lineTo(x + this.baseWidth/2, centerY + helixOffset2 + 15 + this.baseHeight/2);
                this.ctx.stroke();
            }
        }
    }
    
    drawRNAPolymerase() {
        if (this.polymerasePosition >= 0 && this.polymerasePosition <= this.dnaSequence.length + 1) {
            const x = 50 + this.polymerasePosition * this.baseWidth - this.polymeraseWidth/2;
            const y = this.canvas.height/2 - this.polymeraseHeight/2;
            
            // Draw polymerase as an oval
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.beginPath();
            this.ctx.ellipse(x + this.polymeraseWidth/2, y + this.polymeraseHeight/2, 
                           this.polymeraseWidth/2, this.polymeraseHeight/2, 0, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Add label
            this.ctx.fillStyle = 'white';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('RNA Pol', x + this.polymeraseWidth/2, y + this.polymeraseHeight/2 + 4);
        }
    }
    
    drawRNAStrand() {
        const centerY = this.canvas.height / 2;
        const startX = 50;
        
        for (let i = 0; i < this.rnaSequence.length; i++) {
            const x = startX + i * this.baseWidth;
            this.drawBase(this.rnaSequence[i], x, centerY - this.strandSeparation - 20, false, true);
        }
        
        // Draw RNA strand connection lines
        if (this.rnaSequence.length > 1) {
            this.ctx.strokeStyle = '#4ecdc4';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            for (let i = 0; i < this.rnaSequence.length - 1; i++) {
                const x1 = startX + i * this.baseWidth + this.baseWidth/2;
                const x2 = startX + (i + 1) * this.baseWidth + this.baseWidth/2;
                const y = centerY - this.strandSeparation - 20 + this.baseHeight/2;
                
                if (i === 0) {
                    this.ctx.moveTo(x1, y);
                }
                this.ctx.lineTo(x2, y);
            }
            this.ctx.stroke();
        }
    }
    
    drawBase(base, x, y, isUnwound = false, isRNA = false) {
        const colors = {
            'A': isRNA ? '#ff9f43' : '#f39c12',
            'T': '#e74c3c',
            'G': '#2ecc71',
            'C': '#3498db',
            'U': '#9b59b6'
        };
        
        this.ctx.fillStyle = colors[base] || '#bdc3c7';
        
        if (isUnwound || isRNA) {
            // Draw as rectangle for unwound DNA or RNA
            this.ctx.fillRect(x, y, this.baseWidth, this.baseHeight);
        } else {
            // Draw as circle for wound DNA
            this.ctx.beginPath();
            this.ctx.arc(x + this.baseWidth/2, y + this.baseHeight/2, this.baseWidth/3, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        
        // Draw base letter
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(base, x + this.baseWidth/2, y + this.baseHeight/2 + 5);
    }
    
    getComplementaryDNABase(base) {
        const complement = {
            'A': 'T',
            'T': 'A',
            'G': 'C',
            'C': 'G'
        };
        return complement[base] || 'X';
    }
    
    updateSequenceDisplay() {
        const dnaElement = document.getElementById('dnaSequence');
        const rnaElement = document.getElementById('rnaSequence');
        
        // Create colored sequence for DNA
        let dnaHTML = '';
        for (let i = 0; i < this.dnaSequence.length; i++) {
            const base = this.dnaSequence[i];
            const isActive = i < this.currentPosition;
            dnaHTML += `<span class="base ${base.toLowerCase()} ${isActive ? 'active' : ''}">${base}</span>`;
        }
        
        // Create colored sequence for RNA
        let rnaHTML = '';
        for (let i = 0; i < this.rnaSequence.length; i++) {
            const base = this.rnaSequence[i];
            rnaHTML += `<span class="base ${base.toLowerCase()} rna">${base}</span>`;
        }
        
        dnaElement.innerHTML = dnaHTML;
        rnaElement.innerHTML = rnaHTML;
    }
    
    updateCurrentStep(message) {
        document.getElementById('currentStep').textContent = message;
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.transcription = new DNATranscription();
});