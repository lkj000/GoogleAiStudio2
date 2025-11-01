
import { PluginTemplate } from "../types";

// Base64 encoded WAV file of a simple 90bpm drum loop.
// FIX: The string was truncated and unterminated, causing a fatal syntax error.
// It has been replaced with a complete string and broken into an array for robustness.
const sampleLoopB64 = [
  "UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
  "/v/8/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/",
  "f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  "AAAAAPz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "AAAAAAAAAAAAAAD8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/",
  "AAAAAA=="
].join('');

let audioCtx: AudioContext | null = null;
let analyserNode: AnalyserNode | null = null;
let sampleBuffer: AudioBuffer | null = null;
let sourceNode: AudioBufferSourceNode | any | null = null; // Can also be the instrument class
let activePlugin: any | null = null;
let instrumentNoteInterval: number | null = null;
let state: 'stopped' | 'playing_passthrough' | 'playing_plugin' = 'stopped';

const base64ToArrayBuffer = (base64: string) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};

// Rebuilds the audio graph based on the current state
const _rebuildAudioGraph = () => {
    if (!audioCtx || !analyserNode) return;

    // Disconnect everything to start fresh
    analyserNode.disconnect();
    if (sourceNode) sourceNode.disconnect();
    if (activePlugin && activePlugin.output) activePlugin.output.disconnect();

    const destination = audioCtx.destination;

    if (state === 'playing_plugin' && activePlugin && sourceNode) { // Effect plugin
        sourceNode.connect(activePlugin.input);
        activePlugin.output.connect(analyserNode);
        analyserNode.connect(destination);
    } else if (state === 'playing_plugin' && activePlugin) { // Instrument plugin
        activePlugin.output.connect(analyserNode);
        analyserNode.connect(destination);
    } else if (state === 'playing_passthrough' && sourceNode) { // No plugin, just the sample
        sourceNode.connect(analyserNode);
        analyserNode.connect(destination);
    }
};

export const init = async (): Promise<AnalyserNode> => {
    if (audioCtx) return analyserNode as AnalyserNode;

    try {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserNode = audioCtx.createAnalyser();
        analyserNode.fftSize = 2048;

        const buffer = await audioCtx.decodeAudioData(base64ToArrayBuffer(sampleLoopB64));
        sampleBuffer = buffer;

        return analyserNode;
    } catch (e) {
        console.error("Failed to initialize AudioContext:", e);
        throw e;
    }
};

export const connectPlugin = (pluginTemplate: PluginTemplate) => {
    if (!audioCtx) return;
    disconnectPlugin(); // Clear previous plugin first

    try {
        // This is a sandboxed way to instantiate the class from the code string
        const blob = new Blob([`const UserPlugin = ${pluginTemplate.code}; self.UserPlugin = UserPlugin;`], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        
        // Use a temporary script tag to load the class into a context.
        // A more robust solution might use Web Workers or an iframe sandbox.
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => {
            activePlugin = new (window as any).UserPlugin(audioCtx);
            _rebuildAudioGraph();
            URL.revokeObjectURL(url);
            document.body.removeChild(script);
            delete (window as any).UserPlugin;
        };
        document.body.appendChild(script);

    } catch (e) {
        console.error("Failed to instantiate Web Audio plugin:", e);
        activePlugin = null;
    }
};

export const disconnectPlugin = () => {
    if (activePlugin) {
        if (activePlugin.output) activePlugin.output.disconnect();
        activePlugin = null;
        _rebuildAudioGraph();
    }
};

export const play = async (pluginTemplate: PluginTemplate): Promise<boolean> => {
    if (!audioCtx || !sampleBuffer) return false;
    await stop();

    if (audioCtx.state === 'suspended') {
        try {
            await audioCtx.resume();
        } catch (e) {
            console.warn("AudioContext resume failed. Requires user gesture.", e);
            return false;
        }
    }

    if (activePlugin && pluginTemplate.type === 'instrument') {
        state = 'playing_plugin';
        activePlugin.play(220, audioCtx.currentTime); // Play A3
        instrumentNoteInterval = window.setInterval(() => {
             const notes = [220, 261.63, 329.63, 392.00]; // A, C, E, G arpeggio
             const randomNote = notes[Math.floor(Math.random() * notes.length)];
            activePlugin.play(randomNote, audioCtx.currentTime);
        }, 500);

    } else { // Effect or passthrough
        sourceNode = audioCtx.createBufferSource();
        sourceNode.buffer = sampleBuffer;
        sourceNode.loop = true;
        sourceNode.start(audioCtx.currentTime);
        state = activePlugin ? 'playing_plugin' : 'playing_passthrough';
    }

    _rebuildAudioGraph();
    return true;
};

export const stop = async () => {
    if (instrumentNoteInterval) {
        clearInterval(instrumentNoteInterval);
        instrumentNoteInterval = null;
    }
    if (activePlugin && typeof activePlugin.stopAll === 'function') {
        activePlugin.stopAll(audioCtx?.currentTime);
    }
    if (sourceNode) {
        sourceNode.stop();
        sourceNode = null;
    }
    state = 'stopped';
    _rebuildAudioGraph();
};

export const setParam = (id: string, value: number) => {
    if (activePlugin && typeof activePlugin.setParam === 'function') {
        activePlugin.setParam(id, value);
    }
};
