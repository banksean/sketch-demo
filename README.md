# Hum to MIDI Converter

A web application that captures audio from your microphone, detects the pitch and duration of hummed melodies, and converts them to MIDI format.

## Features

- **Real-time pitch detection** using autocorrelation algorithm
- **Note onset/offset detection** for accurate timing
- **Visual feedback** with pitch visualization and current note display
- **MIDI export** - download your hummed melodies as MIDI files
- **Clean, responsive UI** that works on desktop and mobile

## How It Works

1. **Audio Capture**: Uses Web Audio API to access microphone input
2. **Pitch Detection**: Implements autocorrelation algorithm to detect fundamental frequency
3. **Note Recognition**: Converts frequencies to musical notes (C, D, E, etc.)
4. **Timing Analysis**: Detects when notes start and stop for duration calculation
5. **MIDI Generation**: Converts the detected notes and timing to standard MIDI format

## Usage

1. Open `index.html` in a web browser (requires HTTPS or localhost for microphone access)
2. Click "Start Recording"
3. Allow microphone permission when prompted
4. Hum a melody into your microphone
5. Watch the real-time pitch detection and note visualization
6. Click "Stop Recording" when finished
7. Click "Download MIDI" to save your melody as a MIDI file

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

- `index.html` - Main application HTML
- `styles.css` - Application styling
- `app.js` - Main application logic and UI handling
- `pitch-detector.js` - Autocorrelation-based pitch detection
- `midi-converter.js` - Note processing and timing analysis
- `simple-midi.js` - Lightweight MIDI file generator

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

- Monophonic only (single notes, not chords)
- Works best with clear, sustained humming
- Requires relatively quiet environment
- Timing quantization may not capture very subtle rhythm variations

## Future Enhancements

- Musical notation display using VexFlow or similar
- Tempo detection and adjustment
- Key signature detection
- Audio playback of detected melody
- Export to other formats (MusicXML, ABC notation)
- Polyphonic detection for simple harmonies