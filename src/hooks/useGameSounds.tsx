
import { useCallback, useState, useEffect } from 'react';

interface GameSounds {
  playDiamondSound: () => void;
  playExplosionSound: () => void;
  playWinSound: () => void;
  playLossSound: () => void;
  playJackpotSound: () => void;
  playWheelSpinSound: () => void;
  playWheelStopSound: () => void;
  audioEnabled: boolean;
  enableAudio: () => void;
}

export const useGameSounds = (): GameSounds => {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Check if user has interacted with the page (required for audio in most browsers)
  useEffect(() => {
    const handleUserInteraction = () => {
      setUserInteracted(true);
      console.log('User interaction detected - audio can now play');
    };

    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  const enableAudio = useCallback(() => {
    setAudioEnabled(true);
    console.log('Audio manually enabled by user');
  }, []);

  const createSound = useCallback((frequency: number, duration: number, volume: number = 0.3, type: 'sine' | 'square' | 'sawtooth' | 'triangle' = 'sine') => {
    if (!userInteracted) {
      console.warn('Cannot play audio - user has not interacted with page yet');
      return null;
    }

    try {
      // Create audio context and generate tone
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);

      console.log(`Playing ${type} sound at ${frequency}Hz for ${duration}s`);
      return oscillator;
    } catch (error) {
      console.error('Error creating sound:', error);
      return null;
    }
  }, [userInteracted]);

  const playDiamondSound = useCallback(() => {
    if (!audioEnabled && !userInteracted) {
      console.log('Diamond sound requested but audio not ready');
      return;
    }
    
    console.log('Playing diamond sound');
    createSound(800, 0.2, 0.3, 'sine');
    setTimeout(() => createSound(1000, 0.1, 0.2, 'sine'), 100);
  }, [audioEnabled, userInteracted, createSound]);

  const playExplosionSound = useCallback(() => {
    if (!audioEnabled && !userInteracted) {
      console.log('Explosion sound requested but audio not ready');
      return;
    }

    console.log('Playing explosion sound');
    createSound(150, 0.3, 0.5, 'sawtooth');
    setTimeout(() => createSound(100, 0.2, 0.4, 'square'), 50);
    setTimeout(() => createSound(80, 0.3, 0.3, 'sawtooth'), 100);
  }, [audioEnabled, userInteracted, createSound]);

  const playWinSound = useCallback(() => {
    if (!audioEnabled && !userInteracted) {
      console.log('Win sound requested but audio not ready');
      return;
    }

    console.log('Playing win sound');
    createSound(523, 0.2, 0.4, 'sine'); // C5
    setTimeout(() => createSound(659, 0.2, 0.4, 'sine'), 150); // E5
    setTimeout(() => createSound(784, 0.3, 0.4, 'sine'), 300); // G5
  }, [audioEnabled, userInteracted, createSound]);

  const playLossSound = useCallback(() => {
    if (!audioEnabled && !userInteracted) {
      console.log('Loss sound requested but audio not ready');
      return;
    }

    console.log('Playing loss sound');
    createSound(300, 0.3, 0.3, 'triangle');
    setTimeout(() => createSound(250, 0.3, 0.3, 'triangle'), 200);
    setTimeout(() => createSound(200, 0.4, 0.3, 'triangle'), 400);
  }, [audioEnabled, userInteracted, createSound]);

  const playJackpotSound = useCallback(() => {
    if (!audioEnabled && !userInteracted) {
      console.log('Jackpot sound requested but audio not ready');
      return;
    }

    console.log('Playing jackpot sound');
    // Celebratory ascending melody
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((note, index) => {
      setTimeout(() => {
        createSound(note, 0.3, 0.6, 'sine');
        createSound(note * 2, 0.3, 0.3, 'sine'); // Octave harmony
      }, index * 150);
    });
    
    // Extra celebration sounds
    setTimeout(() => {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => createSound(1200 + Math.random() * 400, 0.1, 0.4, 'sine'), i * 100);
      }
    }, 600);
  }, [audioEnabled, userInteracted, createSound]);

  const playWheelSpinSound = useCallback(() => {
    if (!audioEnabled && !userInteracted) {
      console.log('Wheel spin sound requested but audio not ready');
      return;
    }

    console.log('Playing wheel spin sound');
    
    let frequency = 200;
    const interval = setInterval(() => {
      createSound(frequency, 0.1, 0.2, 'square');
      frequency += Math.random() * 50 - 25; // Slight variation
      frequency = Math.max(150, Math.min(300, frequency)); // Keep in range
    }, 100);

    // Stop after 4.5 seconds
    setTimeout(() => {
      clearInterval(interval);
      console.log('Wheel spin sound stopped');
    }, 4500);
  }, [audioEnabled, userInteracted, createSound]);

  const playWheelStopSound = useCallback(() => {
    if (!audioEnabled && !userInteracted) {
      console.log('Wheel stop sound requested but audio not ready');
      return;
    }

    console.log('Playing wheel stop sound');
    createSound(400, 0.2, 0.2, 'triangle');
    setTimeout(() => createSound(300, 0.3, 0.1, 'triangle'), 100);
  }, [audioEnabled, userInteracted, createSound]);

  return {
    playDiamondSound,
    playExplosionSound,
    playWinSound,
    playLossSound,
    playJackpotSound,
    playWheelSpinSound,
    playWheelStopSound,
    audioEnabled: audioEnabled || userInteracted,
    enableAudio
  };
};
