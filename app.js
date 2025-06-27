// Guitar Chord Progressions App
class ChordProgressionApp {
    constructor() {
        this.currentProgression = [];
        this.selectedChord = null;
        this.savedProgressions = JSON.parse(localStorage.getItem('savedProgressions')) || [];
        
        this.init();
    }

    init() {
        this.renderChordGrid();
        this.renderSavedProgressions();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Play progression button
        document.getElementById('playProgression').addEventListener('click', () => {
            this.playProgression();
        });

        // Clear progression button
        document.getElementById('clearProgression').addEventListener('click', () => {
            this.clearProgression();
        });

        // Save progression button
        document.getElementById('saveProgression').addEventListener('click', () => {
            this.saveProgression();
        });
    }

    renderChordGrid() {
        const chordGrid = document.getElementById('chordGrid');
        const chords = getAllChords();
        
        chordGrid.innerHTML = '';
        
        chords.forEach(chordName => {
            const button = document.createElement('button');
            button.className = 'chord-button';
            button.textContent = chordName;
            button.addEventListener('click', () => this.selectChord(chordName));
            chordGrid.appendChild(button);
        });
    }

    selectChord(chordName) {
        this.selectedChord = chordName;
        this.renderChordDiagram(chordName);
        this.addToProgression(chordName);
        
        // Update visual selection
        document.querySelectorAll('.chord-button').forEach(btn => {
            btn.classList.remove('selected');
        });
        event.target.classList.add('selected');
    }

    addToProgression(chordName) {
        this.currentProgression.push(chordName);
        this.renderProgression();
        this.updatePlayButton();
    }

    renderProgression() {
        const progressionChords = document.getElementById('progressionChords');
        
        if (this.currentProgression.length === 0) {
            progressionChords.innerHTML = '<div class="empty-progression">Click chords above to build your progression</div>';
            return;
        }

        progressionChords.innerHTML = '';
        
        this.currentProgression.forEach((chord, index) => {
            const chordElement = document.createElement('div');
            chordElement.className = 'progression-chord';
            chordElement.innerHTML = `
                ${chord}
                <button class="remove-chord" onclick="app.removeFromProgression(${index})">×</button>
            `;
            chordElement.addEventListener('click', () => this.renderChordDiagram(chord));
            progressionChords.appendChild(chordElement);
        });
    }

    removeFromProgression(index) {
        this.currentProgression.splice(index, 1);
        this.renderProgression();
        this.updatePlayButton();
    }

    renderChordDiagram(chordName) {
        const chordDiagram = document.getElementById('chordDiagram');
        const chordInfo = document.getElementById('chordInfo');
        const chord = getChord(chordName);
        
        if (!chord) {
            chordDiagram.innerHTML = '<div class="no-chord">Chord not found</div>';
            chordInfo.innerHTML = '';
            return;
        }

        // Render chord name and fretboard
        chordDiagram.innerHTML = `
            <div class="chord-name">${chord.name}</div>
            <div class="fretboard" id="fretboard"></div>
            <div class="string-names">
                <div>E</div><div>A</div><div>D</div><div>G</div><div>B</div><div>E</div>
            </div>
        `;

        // Render fretboard
        this.renderFretboard(chord.fingering);
        
        // Render chord info
        chordInfo.innerHTML = `
            <strong>Notes:</strong> ${chord.notes.join(' - ')}<br>
            <strong>Theory:</strong> ${chord.theory}
        `;
    }

    renderFretboard(fingering) {
        const fretboard = document.getElementById('fretboard');
        fretboard.innerHTML = '';
        
        // Create frets (5 frets, 6 strings)
        for (let fret = 0; fret < 5; fret++) {
            for (let string = 0; string < 6; string++) {
                const fretElement = document.createElement('div');
                fretElement.className = 'fret';
                
                // Check if this string/fret has a finger position
                const fingerPosition = fingering[string];
                if (fingerPosition !== null && fingerPosition === fret) {
                    const finger = document.createElement('div');
                    finger.className = 'finger';
                    finger.textContent = fret === 0 ? 'O' : fret;
                    fretElement.appendChild(finger);
                }
                
                fretboard.appendChild(fretElement);
            }
        }
    }

    clearProgression() {
        this.currentProgression = [];
        this.renderProgression();
        this.updatePlayButton();
    }

    updatePlayButton() {
        const playButton = document.getElementById('playProgression');
        playButton.disabled = this.currentProgression.length === 0;
    }

    playProgression() {
        if (this.currentProgression.length === 0) return;
        
        const playButton = document.getElementById('playProgression');
        playButton.textContent = '⏸ Playing...';
        playButton.disabled = true;
        
        // Simulate playing progression by highlighting each chord
        let currentIndex = 0;
        const chordElements = document.querySelectorAll('.progression-chord');
        
        const playInterval = setInterval(() => {
            // Remove previous highlight
            chordElements.forEach(el => el.style.transform = 'scale(1)');
            
            if (currentIndex < chordElements.length) {
                // Highlight current chord
                chordElements[currentIndex].style.transform = 'scale(1.1)';
                
                // Show chord diagram
                this.renderChordDiagram(this.currentProgression[currentIndex]);
                
                currentIndex++;
            } else {
                // End of progression
                clearInterval(playInterval);
                playButton.textContent = '▶ Play';
                playButton.disabled = false;
                
                // Reset all chord scales
                chordElements.forEach(el => el.style.transform = 'scale(1)');
            }
        }, 1000); // 1 second per chord
    }

    saveProgression() {
        if (this.currentProgression.length === 0) {
            alert('Add some chords to your progression first!');
            return;
        }
        
        const name = prompt('Enter a name for this progression:');
        if (!name) return;
        
        const progression = {
            id: Date.now().toString(),
            name: name,
            chords: [...this.currentProgression],
            created: new Date().toLocaleDateString()
        };
        
        this.savedProgressions.push(progression);
        this.saveTolocalStorage();
        this.renderSavedProgressions();
        
        alert('Progression saved!');
    }

    renderSavedProgressions() {
        const savedProgressions = document.getElementById('savedProgressions');
        
        if (this.savedProgressions.length === 0) {
            savedProgressions.innerHTML = '<div class="no-progressions">No saved progressions yet</div>';
            return;
        }
        
        savedProgressions.innerHTML = '';
        
        this.savedProgressions.forEach(progression => {
            const progressionElement = document.createElement('div');
            progressionElement.className = 'saved-progression';
            progressionElement.innerHTML = `
                <div class="progression-name">${progression.name}</div>
                <div class="progression-preview">
                    ${progression.chords.map(chord => `<span class="preview-chord">${chord}</span>`).join('')}
                </div>
                <div style="font-size: 0.8rem; color: #718096; margin-bottom: 15px;">Created: ${progression.created}</div>
                <div class="progression-actions">
                    <button class="load-btn" onclick="app.loadProgression('${progression.id}')">Load</button>
                    <button class="delete-btn" onclick="app.deleteProgression('${progression.id}')">Delete</button>
                </div>
            `;
            savedProgressions.appendChild(progressionElement);
        });
    }

    loadProgression(id) {
        const progression = this.savedProgressions.find(p => p.id === id);
        if (!progression) return;
        
        this.currentProgression = [...progression.chords];
        this.renderProgression();
        this.updatePlayButton();
        
        // Scroll to progression builder
        document.querySelector('.progression-builder').scrollIntoView({ behavior: 'smooth' });
    }

    deleteProgression(id) {
        if (!confirm('Are you sure you want to delete this progression?')) return;
        
        this.savedProgressions = this.savedProgressions.filter(p => p.id !== id);
        this.saveTolocalStorage();
        this.renderSavedProgressions();
    }

    saveTolocalStorage() {
        localStorage.setItem('savedProgressions', JSON.stringify(this.savedProgressions));
    }
}

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ChordProgressionApp();
    
    // Add some common progressions as suggestions
    const commonProgressions = getCommonProgressions();
    const savedProgressions = document.getElementById('savedProgressions');
    
    // Add a section for common progressions if there are no saved ones
    if (app.savedProgressions.length === 0) {
        const commonSection = document.createElement('div');
        commonSection.innerHTML = `
            <h3 style="margin: 20px 0 15px 0; color: #4a5568; font-size: 1.1rem;">Try These Common Progressions:</h3>
        `;
        
        Object.entries(commonProgressions).forEach(([name, chords]) => {
            const progressionElement = document.createElement('div');
            progressionElement.className = 'saved-progression';
            progressionElement.innerHTML = `
                <div class="progression-name">${name}</div>
                <div class="progression-preview">
                    ${chords.map(chord => `<span class="preview-chord">${chord}</span>`).join('')}
                </div>
                <div class="progression-actions">
                    <button class="load-btn" onclick="app.loadCommonProgression(['${chords.join("', '")}']), this.style.display='none'">Try It</button>
                </div>
            `;
            commonSection.appendChild(progressionElement);
        });
        
        savedProgressions.appendChild(commonSection);
    }
});

// Helper method to load common progressions
ChordProgressionApp.prototype.loadCommonProgression = function(chords) {
    this.currentProgression = chords;
    this.renderProgression();
    this.updatePlayButton();
    
    // Scroll to progression builder
    document.querySelector('.progression-builder').scrollIntoView({ behavior: 'smooth' });
};