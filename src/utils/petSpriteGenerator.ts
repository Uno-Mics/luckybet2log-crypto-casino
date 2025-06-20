
export interface PetSpriteConfig {
  name: string;
  rarity: string;
  colors: {
    primary: number;
    secondary: number;
    accent: number;
    eye: number;
  };
  features: {
    hasWings?: boolean;
    hasHorns?: boolean;
    hasTail?: boolean;
    hasSpikes?: boolean;
    glowing?: boolean;
    pattern?: 'stripes' | 'spots' | 'flames' | 'scales' | 'feathers';
  };
}

export const generatePetSpriteConfig = (petName: string, rarity: string): PetSpriteConfig => {
  const name = petName.toLowerCase();
  
  // Base colors by rarity
  const rarityColors = {
    common: { primary: 0x8B4513, secondary: 0xDEB887, accent: 0xF4A460, eye: 0x000000 },
    uncommon: { primary: 0x228B22, secondary: 0x90EE90, accent: 0x32CD32, eye: 0x000000 },
    rare: { primary: 0x4169E1, secondary: 0x87CEEB, accent: 0x00BFFF, eye: 0x000000 },
    legendary: { primary: 0x8A2BE2, secondary: 0xDA70D6, accent: 0xFF69B4, eye: 0xFFFFFF },
    mythical: { primary: 0xFFD700, secondary: 0xFFA500, accent: 0xFF4500, eye: 0x000000 }
  };

  let config: PetSpriteConfig = {
    name: petName,
    rarity,
    colors: rarityColors[rarity as keyof typeof rarityColors] || rarityColors.common,
    features: {}
  };

  // Customize based on pet name
  if (name.includes('phoenix') || name.includes('fire') || name.includes('flame')) {
    config.colors = { primary: 0xFF4500, secondary: 0xFF6347, accent: 0xFFD700, eye: 0xFF0000 };
    config.features = { hasWings: true, glowing: true, pattern: 'flames' };
  } else if (name.includes('dragon') || name.includes('drake')) {
    config.colors = { primary: 0x8B0000, secondary: 0xFF6347, accent: 0xFFD700, eye: 0xFF0000 };
    config.features = { hasWings: true, hasHorns: true, hasTail: true, hasSpikes: true, pattern: 'scales' };
  } else if (name.includes('angel') || name.includes('celestial') || name.includes('divine')) {
    config.colors = { primary: 0xFFFFFF, secondary: 0xF0F8FF, accent: 0xFFD700, eye: 0x87CEEB };
    config.features = { hasWings: true, glowing: true };
  } else if (name.includes('demon') || name.includes('shadow') || name.includes('dark')) {
    config.colors = { primary: 0x2F4F4F, secondary: 0x000000, accent: 0x8B0000, eye: 0xFF0000 };
    config.features = { hasHorns: true, hasTail: true, hasSpikes: true };
  } else if (name.includes('crystal') || name.includes('gem') || name.includes('diamond')) {
    config.colors = { primary: 0x00CED1, secondary: 0xAFEEEE, accent: 0xFFFFFF, eye: 0x00FFFF };
    config.features = { glowing: true, pattern: 'scales' };
  } else if (name.includes('forest') || name.includes('nature') || name.includes('leaf')) {
    config.colors = { primary: 0x228B22, secondary: 0x90EE90, accent: 0x8FBC8F, eye: 0x000000 };
    config.features = { pattern: 'feathers' };
  } else if (name.includes('ocean') || name.includes('water') || name.includes('sea')) {
    config.colors = { primary: 0x0000FF, secondary: 0x87CEEB, accent: 0x00FFFF, eye: 0x000080 };
    config.features = { pattern: 'scales' };
  } else if (name.includes('thunder') || name.includes('lightning') || name.includes('storm')) {
    config.colors = { primary: 0x483D8B, secondary: 0x9370DB, accent: 0xFFFF00, eye: 0xFFFF00 };
    config.features = { glowing: true, hasSpikes: true };
  } else if (name.includes('ice') || name.includes('frost') || name.includes('snow')) {
    config.colors = { primary: 0xB0E0E6, secondary: 0xFFFFFF, accent: 0x87CEEB, eye: 0x4169E1 };
    config.features = { glowing: true };
  } else if (name.includes('void') || name.includes('cosmic') || name.includes('star')) {
    config.colors = { primary: 0x191970, secondary: 0x4B0082, accent: 0xFFD700, eye: 0xFFFFFF };
    config.features = { glowing: true, pattern: 'spots' };
  }

  return config;
};

export const drawPetSprite = (graphics: Phaser.GameObjects.Graphics, config: PetSpriteConfig, size: number = 16): void => {
  graphics.clear();
  
  const { colors, features } = config;
  const scale = size / 16; // Base size is 16x16
  
  // Helper function to scale coordinates
  const s = (value: number) => Math.floor(value * scale);
  
  // Draw body (main shape)
  graphics.fillStyle(colors.primary);
  graphics.fillRect(s(4), s(6), s(8), s(6)); // Main body
  graphics.fillRect(s(6), s(4), s(4), s(2)); // Head
  
  // Draw legs
  graphics.fillRect(s(5), s(12), s(2), s(3)); // Left leg
  graphics.fillRect(s(9), s(12), s(2), s(3)); // Right leg
  
  // Draw pattern if specified
  if (features.pattern) {
    graphics.fillStyle(colors.secondary);
    switch (features.pattern) {
      case 'stripes':
        for (let i = 0; i < 3; i++) {
          graphics.fillRect(s(4), s(7 + i * 2), s(8), s(1));
        }
        break;
      case 'spots':
        graphics.fillRect(s(5), s(7), s(1), s(1));
        graphics.fillRect(s(8), s(9), s(1), s(1));
        graphics.fillRect(s(10), s(7), s(1), s(1));
        break;
      case 'flames':
        // Flame pattern on body
        graphics.fillRect(s(5), s(6), s(1), s(2));
        graphics.fillRect(s(7), s(7), s(1), s(2));
        graphics.fillRect(s(9), s(6), s(1), s(2));
        break;
      case 'scales':
        // Scale pattern
        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < 3; col++) {
            graphics.fillRect(s(5 + col * 2), s(7 + row * 2), s(1), s(1));
          }
        }
        break;
      case 'feathers':
        // Feather-like pattern
        graphics.fillRect(s(6), s(6), s(1), s(3));
        graphics.fillRect(s(8), s(6), s(1), s(3));
        break;
    }
  }
  
  // Draw wings if specified
  if (features.hasWings) {
    graphics.fillStyle(colors.secondary);
    // Left wing
    graphics.fillRect(s(2), s(7), s(2), s(3));
    graphics.fillRect(s(1), s(8), s(1), s(1));
    // Right wing
    graphics.fillRect(s(12), s(7), s(2), s(3));
    graphics.fillRect(s(14), s(8), s(1), s(1));
  }
  
  // Draw horns if specified
  if (features.hasHorns) {
    graphics.fillStyle(colors.accent);
    graphics.fillRect(s(6), s(2), s(1), s(2)); // Left horn
    graphics.fillRect(s(9), s(2), s(1), s(2)); // Right horn
  }
  
  // Draw tail if specified
  if (features.hasTail) {
    graphics.fillStyle(colors.primary);
    graphics.fillRect(s(12), s(9), s(2), s(1));
    graphics.fillRect(s(13), s(10), s(2), s(1));
  }
  
  // Draw spikes if specified
  if (features.hasSpikes) {
    graphics.fillStyle(colors.accent);
    // Back spikes
    graphics.fillRect(s(5), s(5), s(1), s(1));
    graphics.fillRect(s(7), s(4), s(1), s(2));
    graphics.fillRect(s(9), s(5), s(1), s(1));
  }
  
  // Draw eyes
  graphics.fillStyle(colors.eye);
  graphics.fillRect(s(6), s(5), s(1), s(1)); // Left eye
  graphics.fillRect(s(9), s(5), s(1), s(1)); // Right eye
  
  // Add glow effect if specified
  if (features.glowing) {
    graphics.fillStyle(colors.accent, 0.3);
    graphics.fillRect(s(3), s(3), s(10), s(10)); // Glow around pet
  }
  
  // Add accent details
  graphics.fillStyle(colors.accent);
  graphics.fillRect(s(7), s(6), s(2), s(1)); // Chest marking
};
