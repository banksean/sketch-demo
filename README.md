# Hum to MIDI Converter with Real-time Harmony

A web application that captures audio from your microphone, detects the pitch and duration of hummed melodies, converts them to MIDI format, and generates real-time harmonic accompaniment.

## Features

### Core Features
- **Real-time pitch detection** using autocorrelation algorithm
- **Note onset/offset detection** for accurate timing
- **Visual feedback** with current note display and detected notes list
- **MIDI export** - download your hummed melodies as MIDI files
- **Clean, responsive UI** that works on desktop and mobile

### 🎵 NEW: Real-time Harmony Generation
- **Automatic key detection** using Krumhansl-Schmuckler algorithm
- **Live chord generation** that follows your melody in real-time
- **Multiple musical styles**: Pop, Jazz, Classical, Folk
- **Adjustable harmony speed**: Slow, Medium, Fast chord changes
- **Complexity control**: Simple triads or rich extended chords
- **Volume control** for harmony vs. melody balance
- **Visual feedback** showing current chord and detected key

## How It Works

1. **Audio Capture**: Uses Web Audio API to access microphone input
2. **Pitch Detection**: Implements autocorrelation algorithm to detect fundamental frequency
3. **Note Recognition**: Converts frequencies to musical notes (C, D, E, etc.)
4. **Timing Analysis**: Detects when notes start and stop for duration calculation
5. **MIDI Generation**: Converts the detected notes and timing to standard MIDI format

## Usage

**Option 1 - Self-contained version with harmony (recommended):**
1. Open `hum-to-midi.html` in a web browser (requires HTTPS or localhost for microphone access)
2. **Optional**: Enable "Real-time Harmony" and adjust style/speed/complexity
3. Click "Start Recording"
4. Allow microphone permission when prompted
5. Hum a melody into your microphone
6. Watch real-time pitch detection, key detection, and harmony generation
7. Click "Stop Recording" when finished
8. Click "Download MIDI" to save your melody as a MIDI file

**Option 2 - Multi-file version (basic):**
1. Open `index.html` in a web browser
2. Follow steps 3-8 above (no harmony features)

## Technical Details

### Pitch Detection Algorithm
- Uses autocorrelation to find the fundamental frequency
- Applies Hamming window to reduce spectral artifacts
- Filters frequencies to human humming range (80-1000 Hz)
- Confidence-based detection to ignore noise

### Note Processing
- Pitch stability analysis to avoid false triggering
- Minimum note duration filtering
- Velocity mapping based on detection confidence
- Quantization to standard musical timing

### MIDI Generation
- Custom lightweight MIDI file generator
- Standard MIDI format compatibility
- 120 BPM default tempo
- Single channel monophonic output

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

**Note**: Microphone access requires HTTPS or localhost due to browser security policies.

## Files

**Self-contained version (recommended):**
- `hum-to-midi.html` - Complete app with harmony engine embedded

**Multi-file version:**
- `index.html` - Main application HTML
- `styles.css` - Application styling
- `app.js` - Main application logic and UI handling
- `pitch-detector.js` - Autocorrelation-based pitch detection
- `midi-converter.js` - Note processing and timing analysis
- `simple-midi.js` - Lightweight MIDI file generator
- `harmony-engine.js` - Real-time harmony generation engine (standalone)

## Development

To run locally:

```bash
# Serve the files using any HTTP server
python3 -m http.server 8000
# or
npx serve .
# or
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Limitations

### Melody Detection
- Monophonic only (single notes, not chords)
- Works best with clear, sustained humming
- Requires relatively quiet environment
- Timing quantization may not capture very subtle rhythm variations

### Harmony Generation
- Requires stable melody input for accurate key detection
- Chord changes may lag behind rapid modulations
- Limited to diatonic harmony (no chromatic alterations yet)
- Harmony generation works best with melodies longer than 5-6 notes

## Harmony Engine Technical Details

### Key Detection
- **Krumhansl-Schmuckler algorithm** for robust key identification
- Analyzes note distribution over sliding 4-second window
- Supports both major and minor keys
- Confidence-based key changes to avoid false detection

### Chord Generation
- **Style-aware progressions**: Different approaches for Pop, Jazz, Classical, Folk
- **Scale degree analysis**: Maps melody notes to harmonic functions
- **Voice leading optimization**: Smooth chord transitions
- **Harmonic rhythm control**: Adjustable timing for chord changes

### Audio Synthesis
- **Web Audio API** synthesis with triangle wave oscillators
- **Low-pass filtering** for warm, piano-like chord tones
- **Dynamic envelope shaping** with attack/decay/sustain
- **Polyphonic chord playback** with proper voice balancing

## Future Enhancements

- **Countermelody generation**: AI-powered melodic accompaniment
- **Rhythm section**: Automatic drum and bass pattern generation
- **Musical notation display** using VexFlow or similar
- **Advanced chord progressions**: Secondary dominants, modal interchange
- **Tempo detection and sync**: Beat-aligned harmony changes
- **Export harmony tracks**: Separate MIDI channels for melody + chords
- **Machine learning enhancement**: Personalized harmony preferences