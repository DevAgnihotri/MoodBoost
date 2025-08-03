import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, SkipForward, SkipBack, Music, Upload, Settings, X } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Extend the Window interface to include webkitAudioContext
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

interface AudioTrack {
  id: string;
  name: string;
  url?: string;
  type: 'nature' | 'ambient' | 'music' | 'custom';
  duration?: number;
  generator?: () => AudioBuffer | null;
}

interface AudioControlsProps {
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({ isVisible, onToggleVisibility }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [customTracks, setCustomTracks] = useLocalStorage<AudioTrack[]>('custom-audio-tracks', []);
  const [audioSettings, setAudioSettings] = useLocalStorage('audio-settings', {
    autoPlay: false,
    crossfade: true,
    loopPlaylist: true,
    preferredVolume: 0.7
  });
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Generate simple audio tones using Web Audio API
  const generateWhiteNoise = (audioCtx: AudioContext, duration: number = 10) => {
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.1; // Low volume white noise
    }
    return buffer;
  };

  const generateRainSound = (audioCtx: AudioContext, duration: number = 10) => {
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      // Filtered noise to simulate rain
      const noise = (Math.random() * 2 - 1) * 0.15;
      const filtered = noise * Math.sin(i * 0.001) * 0.7;
      data[i] = filtered;
    }
    return buffer;
  };

  const generateBellTone = (audioCtx: AudioContext, duration: number = 3) => {
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / audioCtx.sampleRate;
      const decay = Math.exp(-t * 2);
      const tone = Math.sin(2 * Math.PI * 440 * t) * decay * 0.3;
      data[i] = tone;
    }
    return buffer;
  };

  const generateOceanWaves = (audioCtx: AudioContext, duration: number = 10) => {
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / audioCtx.sampleRate;
      const wave = Math.sin(2 * Math.PI * 0.1 * t) * 0.5;
      const noise = (Math.random() * 2 - 1) * 0.2;
      data[i] = (wave + noise) * 0.3;
    }
    return buffer;
  };

  const generatePianoChord = (audioCtx: AudioContext, duration: number = 4) => {
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    const frequencies = [261.63, 329.63, 392.00]; // C major chord
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / audioCtx.sampleRate;
      const decay = Math.exp(-t * 1.5);
      let sample = 0;
      
      for (const freq of frequencies) {
        sample += Math.sin(2 * Math.PI * freq * t) * decay;
      }
      
      data[i] = sample * 0.2;
    }
    return buffer;
  };

  // Audio tracks with generators
  const defaultTracks: AudioTrack[] = useMemo(() => [
    {
      id: 'rain',
      name: 'Gentle Rain',
      type: 'nature',
      generator: () => audioContext ? generateRainSound(audioContext, 10) : null
    },
    {
      id: 'ocean',
      name: 'Ocean Waves',
      type: 'nature',
      generator: () => audioContext ? generateOceanWaves(audioContext, 10) : null
    },
    {
      id: 'whitenoise',
      name: 'Forest Sounds',
      type: 'nature',
      generator: () => audioContext ? generateWhiteNoise(audioContext, 10) : null
    },
    {
      id: 'bells',
      name: 'Meditation Bells',
      type: 'ambient',
      generator: () => audioContext ? generateBellTone(audioContext, 6) : null
    },
    {
      id: 'piano',
      name: 'Peaceful Piano',
      type: 'music',
      generator: () => audioContext ? generatePianoChord(audioContext, 5) : null
    }
  ], [audioContext]);

  const allTracks = useMemo(() => [...defaultTracks, ...customTracks], [defaultTracks, customTracks]);

  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContextClass();
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.value = isMuted ? 0 : volume;
        
        setAudioContext(ctx);
        setGainNode(gain);
        setLoadingError(null);
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
        setLoadingError('Audio not supported in this browser. Please upload custom audio files.');
      }
    };

    if (!audioContext) {
      initAudio();
    }

    // Cleanup on unmount
    return () => {
      if (audioSource) {
        audioSource.stop();
        audioSource.disconnect();
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [audioContext, volume, isMuted, audioSource]);

  // Update volume
  useEffect(() => {
    if (gainNode) {
      gainNode.gain.value = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, gainNode]);

  const playGeneratedAudio = (track: AudioTrack) => {
    if (!audioContext || !gainNode || !track.generator) {
      setLoadingError('Unable to generate audio for this track');
      return;
    }

    try {
      // Stop current audio
      if (audioSource) {
        audioSource.stop();
        audioSource.disconnect();
      }

      const buffer = track.generator();
      if (!buffer) {
        setLoadingError('Failed to generate audio buffer');
        return;
      }

      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.loop = audioSettings.loopPlaylist;
      source.connect(gainNode);
      
      source.onended = () => {
        if (!audioSettings.loopPlaylist) {
          setIsPlaying(false);
          setAudioSource(null);
        }
      };

      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      source.start();
      setAudioSource(source);
      setIsPlaying(true);
      setLoadingError(null);
    } catch (error) {
      console.error('Failed to play generated audio:', error);
      setLoadingError('Failed to play audio. Please try a different track.');
      setIsPlaying(false);
    }
  };

  const playCustomAudio = async (track: AudioTrack) => {
    if (!audioContext || !gainNode || !track.url) {
      setLoadingError('Invalid audio track');
      return;
    }

    try {
      const audio = new Audio(track.url);
      audio.volume = isMuted ? 0 : volume;
      audio.loop = audioSettings.loopPlaylist;
      
      audio.onended = () => {
        if (!audioSettings.loopPlaylist) {
          setIsPlaying(false);
        }
      };

      audio.onerror = () => {
        setLoadingError(`Failed to load custom track: ${track.name}`);
        setIsPlaying(false);
      };

      await audio.play();
      setIsPlaying(true);
      setLoadingError(null);
    } catch (error) {
      console.error('Failed to play custom audio:', error);
      setLoadingError('Failed to play custom audio file');
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (!currentTrack) {
      // Start with first track if none selected
      setCurrentTrack(allTracks[0]);
      return;
    }

    if (isPlaying) {
      if (audioSource) {
        audioSource.stop();
        setAudioSource(null);
      }
      setIsPlaying(false);
    } else {
      if (currentTrack.type === 'custom') {
        playCustomAudio(currentTrack);
      } else {
        playGeneratedAudio(currentTrack);
      }
    }
  };

  const skipTrack = (direction: 'next' | 'prev') => {
    if (!currentTrack) return;
    
    const currentIndex = allTracks.findIndex(t => t.id === currentTrack.id);
    let nextIndex;
    
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % allTracks.length;
    } else {
      nextIndex = currentIndex === 0 ? allTracks.length - 1 : currentIndex - 1;
    }
    
    setCurrentTrack(allTracks[nextIndex]);
    setLoadingError(null);
    
    if (audioSource) {
      audioSource.stop();
      setAudioSource(null);
    }
    setIsPlaying(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const newTrack: AudioTrack = {
      id: Date.now().toString(),
      name: file.name.replace(/\.[^/.]+$/, ''),
      url,
      type: 'custom'
    };

    setCustomTracks(prev => [...prev, newTrack]);
    setLoadingError(null);
  };

  const removeCustomTrack = (trackId: string) => {
    setCustomTracks(prev => prev.filter(t => t.id !== trackId));
    if (currentTrack?.id === trackId) {
      setCurrentTrack(null);
      setIsPlaying(false);
      setLoadingError(null);
      if (audioSource) {
        audioSource.stop();
        setAudioSource(null);
      }
    }
  };

  if (!isVisible) {
    return (
      <motion.button
        className="fixed bottom-4 right-4 bg-purple-500 text-white p-3 rounded-full shadow-lg z-40"
        onClick={onToggleVisibility}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Music className="w-6 h-6" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-4 right-4 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-40 w-80"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Music className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-800">Audio Controls</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleVisibility}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {loadingError && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-sm text-yellow-800">{loadingError}</div>
          </div>
        )}

        {/* Current Track */}
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-800 truncate">
            {currentTrack?.name || 'No track selected'}
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {currentTrack?.type || 'Select a track below'}
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          <motion.button
            className="text-gray-600 hover:text-gray-800"
            onClick={() => skipTrack('prev')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <SkipBack className="w-5 h-5" />
          </motion.button>

          <motion.button
            className="bg-purple-500 text-white p-3 rounded-full"
            onClick={togglePlayPause}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </motion.button>

          <motion.button
            className="text-gray-600 hover:text-gray-800"
            onClick={() => skipTrack('next')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <SkipForward className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-gray-600 hover:text-gray-800"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const newVolume = parseFloat(e.target.value);
              setVolume(newVolume);
              if (newVolume > 0) setIsMuted(false);
            }}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-8">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>

        {/* Track Selection */}
        <div className="space-y-2 max-h-40 overflow-y-auto">
          <div className="text-sm font-medium text-gray-700 mb-2">Available Tracks</div>
          
          {/* Info message */}
          {customTracks.length === 0 && (
            <div className="text-xs text-gray-500 mb-2 p-2 bg-blue-50 rounded">
              Built-in tracks use generated audio for instant playback. Upload your own audio files for custom sounds.
            </div>
          )}
          
          {allTracks.map(track => (
            <motion.button
              key={track.id}
              className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                currentTrack?.id === track.id
                  ? 'bg-purple-100 text-purple-800'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => {
                setCurrentTrack(track);
                setLoadingError(null);
                if (audioSource) {
                  audioSource.stop();
                  setAudioSource(null);
                }
                setIsPlaying(false);
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium truncate">{track.name}</div>
                  <div className="text-xs text-gray-500 capitalize">
                    {track.type} {track.type !== 'custom' && '(generated audio)'}
                  </div>
                </div>
                {track.type === 'custom' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCustomTrack(track.id);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Upload Custom Track */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <label className="flex items-center justify-center space-x-2 p-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
            <Upload className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Upload Custom Track</span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              className="mt-4 pt-4 border-t border-gray-200 space-y-3"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="text-sm font-medium text-gray-700">Audio Settings</div>
              
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Auto-play on load</span>
                <input
                  type="checkbox"
                  checked={audioSettings.autoPlay}
                  onChange={(e) => setAudioSettings(prev => ({ ...prev, autoPlay: e.target.checked }))}
                  className="rounded"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Loop playlist</span>
                <input
                  type="checkbox"
                  checked={audioSettings.loopPlaylist}
                  onChange={(e) => setAudioSettings(prev => ({ ...prev, loopPlaylist: e.target.checked }))}
                  className="rounded"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Crossfade tracks</span>
                <input
                  type="checkbox"
                  checked={audioSettings.crossfade}
                  onChange={(e) => setAudioSettings(prev => ({ ...prev, crossfade: e.target.checked }))}
                  className="rounded"
                />
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};