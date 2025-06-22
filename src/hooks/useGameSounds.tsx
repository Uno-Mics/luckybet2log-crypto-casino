
import { Howl } from 'howler';
import { useCallback } from 'react';

interface GameSounds {
  playDiamondSound: () => void;
  playExplosionSound: () => void;
  playWinSound: () => void;
  playLossSound: () => void;
  playJackpotSound: () => void;
  playWheelSpinSound: () => void;
  playWheelStopSound: () => void;
}

export const useGameSounds = (): GameSounds => {
  const playDiamondSound = useCallback(() => {
    const sound = new Howl({
      src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEe'],
      volume: 0.3,
      preload: false
    });
    sound.play();
  }, []);

  const playExplosionSound = useCallback(() => {
    const sound = new Howl({
      src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEe'],
      volume: 0.5,
      rate: 0.5,
      preload: false
    });
    sound.play();
  }, []);

  const playWinSound = useCallback(() => {
    const sound = new Howl({
      src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEe'],
      volume: 0.4,
      rate: 1.2,
      preload: false
    });
    sound.play();
  }, []);

  const playLossSound = useCallback(() => {
    const sound = new Howl({
      src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEe'],
      volume: 0.3,
      rate: 0.7,
      preload: false
    });
    sound.play();
  }, []);

  const playJackpotSound = useCallback(() => {
    const sound = new Howl({
      src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEe'],
      volume: 0.6,
      rate: 1.5,
      preload: false
    });
    sound.play();
    
    // Play multiple celebratory sounds
    setTimeout(() => sound.play(), 200);
    setTimeout(() => sound.play(), 400);
  }, []);

  const playWheelSpinSound = useCallback(() => {
    const sound = new Howl({
      src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEe'],
      volume: 0.4,
      rate: 2.0,
      loop: true,
      preload: false
    });
    sound.play();
    
    // Stop after 4.5 seconds (wheel spin duration)
    setTimeout(() => {
      sound.stop();
    }, 4500);
  }, []);

  const playWheelStopSound = useCallback(() => {
    const sound = new Howl({
      src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEeEUuk4d3BfC8KKYbS9t2QQAoUXrTp56hVFApGn+DyvmEe'],
      volume: 0.2,
      rate: 0.8,
      preload: false
    });
    sound.play();
  }, []);

  return {
    playDiamondSound,
    playExplosionSound,
    playWinSound,
    playLossSound,
    playJackpotSound,
    playWheelSpinSound,
    playWheelStopSound
  };
};
