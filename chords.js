// Guitar chord database with fingering patterns and theory info
const CHORD_DATABASE = {
    // Major Chords
    'C': {
        name: 'C Major',
        fingering: [null, 1, 0, 2, 3, 0], // E A D G B E strings (6th to 1st)
        notes: ['C', 'E', 'G'],
        theory: 'Major triad built on C. Formula: 1-3-5 (C-E-G). Happy, stable sound.'
    },
    'D': {
        name: 'D Major',
        fingering: [null, null, 0, 2, 3, 2],
        notes: ['D', 'F#', 'A'],
        theory: 'Major triad built on D. Formula: 1-3-5 (D-F#-A). Bright, uplifting sound.'
    },
    'E': {
        name: 'E Major',
        fingering: [0, 2, 2, 1, 0, 0],
        notes: ['E', 'G#', 'B'],
        theory: 'Major triad built on E. Formula: 1-3-5 (E-G#-B). Open, ringing sound.'
    },
    'F': {
        name: 'F Major',
        fingering: [1, 3, 3, 2, 1, 1],
        notes: ['F', 'A', 'C'],
        theory: 'Major triad built on F. Formula: 1-3-5 (F-A-C). Warm, full barre chord.'
    },
    'G': {
        name: 'G Major',
        fingering: [3, 2, 0, 0, 3, 3],
        notes: ['G', 'B', 'D'],
        theory: 'Major triad built on G. Formula: 1-3-5 (G-B-D). Rich, full sound.'
    },
    'A': {
        name: 'A Major',
        fingering: [null, 0, 2, 2, 2, 0],
        notes: ['A', 'C#', 'E'],
        theory: 'Major triad built on A. Formula: 1-3-5 (A-C#-E). Bright, cheerful sound.'
    },
    'B': {
        name: 'B Major',
        fingering: [null, 2, 4, 4, 4, 2],
        notes: ['B', 'D#', 'F#'],
        theory: 'Major triad built on B. Formula: 1-3-5 (B-D#-F#). Sharp, energetic sound.'
    },

    // Minor Chords
    'Am': {
        name: 'A Minor',
        fingering: [null, 0, 2, 2, 1, 0],
        notes: ['A', 'C', 'E'],
        theory: 'Minor triad built on A. Formula: 1-♭3-5 (A-C-E). Sad, contemplative sound.'
    },
    'Dm': {
        name: 'D Minor',
        fingering: [null, null, 0, 2, 3, 1],
        notes: ['D', 'F', 'A'],
        theory: 'Minor triad built on D. Formula: 1-♭3-5 (D-F-A). Melancholy, introspective.'
    },
    'Em': {
        name: 'E Minor',
        fingering: [0, 2, 2, 0, 0, 0],
        notes: ['E', 'G', 'B'],
        theory: 'Minor triad built on E. Formula: 1-♭3-5 (E-G-B). Dark, moody sound.'
    },
    'Fm': {
        name: 'F Minor',
        fingering: [1, 3, 3, 1, 1, 1],
        notes: ['F', 'Ab', 'C'],
        theory: 'Minor triad built on F. Formula: 1-♭3-5 (F-Ab-C). Deep, somber barre chord.'
    },
    'Gm': {
        name: 'G Minor',
        fingering: [3, 5, 5, 3, 3, 3],
        notes: ['G', 'Bb', 'D'],
        theory: 'Minor triad built on G. Formula: 1-♭3-5 (G-Bb-D). Rich, dark sound.'
    },
    'Bm': {
        name: 'B Minor',
        fingering: [null, 2, 4, 4, 3, 2],
        notes: ['B', 'D', 'F#'],
        theory: 'Minor triad built on B. Formula: 1-♭3-5 (B-D-F#). Tense, dramatic sound.'
    },
    'Cm': {
        name: 'C Minor',
        fingering: [null, 3, 5, 5, 4, 3],
        notes: ['C', 'Eb', 'G'],
        theory: 'Minor triad built on C. Formula: 1-♭3-5 (C-Eb-G). Deep, mysterious sound.'
    },

    // Seventh Chords
    'C7': {
        name: 'C Dominant 7th',
        fingering: [null, 3, 2, 3, 1, 0],
        notes: ['C', 'E', 'G', 'Bb'],
        theory: 'Dominant 7th chord. Formula: 1-3-5-♭7. Creates tension, wants to resolve.'
    },
    'D7': {
        name: 'D Dominant 7th',
        fingering: [null, null, 0, 2, 1, 2],
        notes: ['D', 'F#', 'A', 'C'],
        theory: 'Dominant 7th chord. Formula: 1-3-5-♭7. Bluesy, driving sound.'
    },
    'E7': {
        name: 'E Dominant 7th',
        fingering: [0, 2, 2, 1, 3, 0],
        notes: ['E', 'G#', 'B', 'D'],
        theory: 'Dominant 7th chord. Formula: 1-3-5-♭7. Strong resolution to A.'
    },
    'G7': {
        name: 'G Dominant 7th',
        fingering: [3, 2, 0, 0, 0, 1],
        notes: ['G', 'B', 'D', 'F'],
        theory: 'Dominant 7th chord. Formula: 1-3-5-♭7. Wants to resolve to C.'
    },
    'A7': {
        name: 'A Dominant 7th',
        fingering: [null, 0, 2, 0, 2, 0],
        notes: ['A', 'C#', 'E', 'G'],
        theory: 'Dominant 7th chord. Formula: 1-3-5-♭7. Common in blues and folk.'
    },
    'B7': {
        name: 'B Dominant 7th',
        fingering: [null, 2, 1, 2, 0, 2],
        notes: ['B', 'D#', 'F#', 'A'],
        theory: 'Dominant 7th chord. Formula: 1-3-5-♭7. Strong pull to E major.'
    },

    // Major 7th Chords
    'Cmaj7': {
        name: 'C Major 7th',
        fingering: [null, 3, 2, 0, 0, 0],
        notes: ['C', 'E', 'G', 'B'],
        theory: 'Major 7th chord. Formula: 1-3-5-7. Dreamy, jazz-influenced sound.'
    },
    'Dmaj7': {
        name: 'D Major 7th',
        fingering: [null, null, 0, 2, 2, 2],
        notes: ['D', 'F#', 'A', 'C#'],
        theory: 'Major 7th chord. Formula: 1-3-5-7. Bright, sophisticated sound.'
    },
    'Emaj7': {
        name: 'E Major 7th',
        fingering: [0, 2, 1, 1, 0, 0],
        notes: ['E', 'G#', 'B', 'D#'],
        theory: 'Major 7th chord. Formula: 1-3-5-7. Lush, colorful harmony.'
    },
    'Fmaj7': {
        name: 'F Major 7th',
        fingering: [1, 3, 2, 2, 1, 0],
        notes: ['F', 'A', 'C', 'E'],
        theory: 'Major 7th chord. Formula: 1-3-5-7. Warm, sophisticated barre chord.'
    },
    'Gmaj7': {
        name: 'G Major 7th',
        fingering: [3, 2, 0, 0, 0, 2],
        notes: ['G', 'B', 'D', 'F#'],
        theory: 'Major 7th chord. Formula: 1-3-5-7. Open, ringing jazz sound.'
    },
    'Amaj7': {
        name: 'A Major 7th',
        fingering: [null, 0, 2, 1, 2, 0],
        notes: ['A', 'C#', 'E', 'G#'],
        theory: 'Major 7th chord. Formula: 1-3-5-7. Bright, uplifting harmony.'
    }
};

// Common chord progressions for reference
const COMMON_PROGRESSIONS = {
    'I-V-vi-IV (C major)': ['C', 'G', 'Am', 'F'],
    'vi-IV-I-V (Am relative)': ['Am', 'F', 'C', 'G'],
    'ii-V-I (Jazz)': ['Dm', 'G7', 'Cmaj7'],
    'I-vi-ii-V (50s Progression)': ['C', 'Am', 'Dm', 'G7'],
    'I-♭VII-♭VI-♭VII (Rock)': ['C', 'Bb', 'F', 'Bb'],
    'vi-♭VII-I (Minor to Major)': ['Am', 'Bb', 'C'],
    'I-IV-V (Blues)': ['C', 'F', 'G'],
    'i-♭VII-♭VI-♭VII (Minor Rock)': ['Am', 'G', 'F', 'G']
};

// Helper function to get chord data
function getChord(chordName) {
    return CHORD_DATABASE[chordName] || null;
}

// Helper function to get all available chords
function getAllChords() {
    return Object.keys(CHORD_DATABASE);
}

// Helper function to get common progressions
function getCommonProgressions() {
    return COMMON_PROGRESSIONS;
}