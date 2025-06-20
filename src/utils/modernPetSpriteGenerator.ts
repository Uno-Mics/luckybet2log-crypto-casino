
export interface ModernPetSpriteConfig {
  name: string;
  rarity: string;
  colors: {
    primary: number;
    secondary: number;
    accent: number;
    highlight: number;
    shadow: number;
    eye: number;
    eyeGlow: number;
  };
  features: {
    hasWings?: boolean;
    hasHorns?: boolean;
    hasTail?: boolean;
    hasSpikes?: boolean;
    hasAura?: boolean;
    bodyType: 'quadruped' | 'biped' | 'serpentine' | 'ethereal';
    pattern?: 'gradient' | 'geometric' | 'organic' | 'tech' | 'cosmic';
    glowIntensity: number;
  };
}

export const generateModernPetConfig = (petName: string, rarity: string): ModernPetSpriteConfig => {
  const name = petName.toLowerCase();
  
  // Modern color palettes with gradients and highlights
  const rarityPalettes = {
    common: { 
      primary: 0x4a90a4, secondary: 0x6bb6c7, accent: 0x83d2e8, 
      highlight: 0xa8e6f7, shadow: 0x2c5f6f, eye: 0x1a1a1a, eyeGlow: 0x4a90a4 
    },
    uncommon: { 
      primary: 0x2ecc71, secondary: 0x58d68d, accent: 0x82e5aa, 
      highlight: 0xaef4c7, shadow: 0x1e8449, eye: 0x0f3820, eyeGlow: 0x58d68d 
    },
    rare: { 
      primary: 0x3498db, secondary: 0x5dade2, accent: 0x85c1e9, 
      highlight: 0xaed6f1, shadow: 0x2471a3, eye: 0x1b4f72, eyeGlow: 0x85c1e9 
    },
    legendary: { 
      primary: 0x9b59b6, secondary: 0xbb8fce, accent: 0xd7bde2, 
      highlight: 0xe8daef, shadow: 0x6c3483, eye: 0xffffff, eyeGlow: 0xf8c471 
    },
    mythical: { 
      primary: 0xf39c12, secondary: 0xf7dc6f, accent: 0xfef9e7, 
      highlight: 0xfffef7, shadow: 0xb7950b, eye: 0x1a1a1a, eyeGlow: 0xffd700 
    }
  };

  let config: ModernPetSpriteConfig = {
    name: petName,
    rarity,
    colors: rarityPalettes[rarity as keyof typeof rarityPalettes] || rarityPalettes.common,
    features: {
      bodyType: 'quadruped',
      glowIntensity: 0.3,
      pattern: 'gradient'
    }
  };

  // Customize based on pet characteristics
  if (name.includes('phoenix') || name.includes('fire') || name.includes('flame')) {
    config.colors = { 
      primary: 0xff4757, secondary: 0xff6b7a, accent: 0xff9ff3, 
      highlight: 0xffeaa7, shadow: 0xd63031, eye: 0xff3838, eyeGlow: 0xffd32a 
    };
    config.features = { 
      hasWings: true, hasAura: true, bodyType: 'biped', 
      pattern: 'organic', glowIntensity: 0.8 
    };
  } else if (name.includes('dragon') || name.includes('drake')) {
    config.colors = { 
      primary: 0x2d3436, secondary: 0x636e72, accent: 0xb2bec3, 
      highlight: 0xe17055, shadow: 0x000000, eye: 0xff7675, eyeGlow: 0xff6348 
    };
    config.features = { 
      hasWings: true, hasHorns: true, hasTail: true, hasSpikes: true, 
      bodyType: 'quadruped', pattern: 'geometric', glowIntensity: 0.6 
    };
  } else if (name.includes('angel') || name.includes('celestial') || name.includes('divine')) {
    config.colors = { 
      primary: 0xfdcb6e, secondary: 0xf0f3bd, accent: 0xffeaa7, 
      highlight: 0xfffef7, shadow: 0xe17055, eye: 0x74b9ff, eyeGlow: 0xffd32a 
    };
    config.features = { 
      hasWings: true, hasAura: true, bodyType: 'biped', 
      pattern: 'gradient', glowIntensity: 0.9 
    };
  } else if (name.includes('void') || name.includes('cosmic') || name.includes('star')) {
    config.colors = { 
      primary: 0x2d3436, secondary: 0x6c5ce7, accent: 0xa29bfe, 
      highlight: 0xfd79a8, shadow: 0x000000, eye: 0xffffff, eyeGlow: 0x00cec9 
    };
    config.features = { 
      hasAura: true, bodyType: 'ethereal', 
      pattern: 'cosmic', glowIntensity: 1.0 
    };
  } else if (name.includes('crystal') || name.includes('gem') || name.includes('diamond')) {
    config.colors = { 
      primary: 0x00cec9, secondary: 0x55efc4, accent: 0x81ecec, 
      highlight: 0xffffff, shadow: 0x00b894, eye: 0x74b9ff, eyeGlow: 0x00cec9 
    };
    config.features = { 
      bodyType: 'quadruped', pattern: 'geometric', glowIntensity: 0.7 
    };
  } else if (name.includes('shadow') || name.includes('dark') || name.includes('demon')) {
    config.colors = { 
      primary: 0x2d3436, secondary: 0x636e72, accent: 0xe17055, 
      highlight: 0xff7675, shadow: 0x000000, eye: 0xff3838, eyeGlow: 0x2d3436 
    };
    config.features = { 
      hasHorns: true, hasTail: true, hasSpikes: true, 
      bodyType: 'biped', pattern: 'tech', glowIntensity: 0.4 
    };
  }

  return config;
};

export const drawModernPetSprite = (graphics: Phaser.GameObjects.Graphics, config: ModernPetSpriteConfig, size: number = 32): void => {
  graphics.clear();
  
  const { colors, features } = config;
  const scale = size / 32; // Base size is 32x32 for higher resolution
  
  const s = (value: number) => Math.floor(value * scale);
  
  // Draw aura/glow effect first
  if (features.hasAura) {
    const auraSize = s(8);
    for (let i = 0; i < 3; i++) {
      const alpha = (features.glowIntensity * (3 - i)) / 6;
      const radius = auraSize + (i * s(2));
      graphics.fillStyle(colors.accent, alpha);
      graphics.fillCircle(s(16), s(16), radius);
    }
  }

  // Modern body with anti-aliased edges
  drawModernBody(graphics, colors, features, s);
  
  // Enhanced features
  if (features.hasWings) drawModernWings(graphics, colors, s);
  if (features.hasHorns) drawModernHorns(graphics, colors, s);
  if (features.hasTail) drawModernTail(graphics, colors, s);
  if (features.hasSpikes) drawModernSpikes(graphics, colors, s);
  
  // Modern pattern overlay
  if (features.pattern) drawModernPattern(graphics, colors, features.pattern, s);
  
  // Enhanced eyes with glow
  drawModernEyes(graphics, colors, s);
  
  // Highlight effects
  drawHighlights(graphics, colors, s);
};

const drawModernBody = (graphics: Phaser.GameObjects.Graphics, colors: any, features: any, s: Function) => {
  // Shadow layer
  graphics.fillStyle(colors.shadow, 0.3);
  graphics.fillRoundedRect(s(7), s(13), s(18), s(12), s(2));
  
  // Main body with gradient effect
  graphics.fillStyle(colors.primary);
  graphics.fillRoundedRect(s(6), s(12), s(18), s(12), s(2));
  
  // Secondary body layer
  graphics.fillStyle(colors.secondary, 0.8);
  graphics.fillRoundedRect(s(8), s(14), s(14), s(8), s(2));
  
  // Head
  graphics.fillStyle(colors.primary);
  graphics.fillRoundedRect(s(10), s(6), s(12), s(10), s(3));
  
  // Head highlight
  graphics.fillStyle(colors.highlight, 0.6);
  graphics.fillRoundedRect(s(11), s(7), s(10), s(4), s(2));
  
  // Legs with modern styling
  const legPositions = [[8, 22], [12, 23], [18, 23], [22, 22]];
  legPositions.forEach(([x, y]) => {
    // Shadow
    graphics.fillStyle(colors.shadow, 0.4);
    graphics.fillRoundedRect(s(x + 1), s(y + 1), s(3), s(6), s(1));
    // Main leg
    graphics.fillStyle(colors.primary);
    graphics.fillRoundedRect(s(x), s(y), s(3), s(6), s(1));
    // Highlight
    graphics.fillStyle(colors.highlight, 0.5);
    graphics.fillRoundedRect(s(x), s(y), s(1), s(4), s(1));
  });
};

const drawModernWings = (graphics: Phaser.GameObjects.Graphics, colors: any, s: Function) => {
  // Left wing with gradient
  graphics.fillStyle(colors.secondary);
  graphics.fillRoundedRect(s(2), s(10), s(6), s(8), s(2));
  graphics.fillStyle(colors.accent, 0.7);
  graphics.fillRoundedRect(s(3), s(11), s(4), s(6), s(1));
  graphics.fillStyle(colors.highlight, 0.5);
  graphics.fillRoundedRect(s(4), s(12), s(2), s(4), s(1));
  
  // Right wing
  graphics.fillStyle(colors.secondary);
  graphics.fillRoundedRect(s(24), s(10), s(6), s(8), s(2));
  graphics.fillStyle(colors.accent, 0.7);
  graphics.fillRoundedRect(s(25), s(11), s(4), s(6), s(1));
  graphics.fillStyle(colors.highlight, 0.5);
  graphics.fillRoundedRect(s(26), s(12), s(2), s(4), s(1));
};

const drawModernHorns = (graphics: Phaser.GameObjects.Graphics, colors: any, s: Function) => {
  // Left horn with gradient
  graphics.fillStyle(colors.accent);
  graphics.fillRoundedRect(s(11), s(2), s(2), s(6), s(1));
  graphics.fillStyle(colors.highlight, 0.8);
  graphics.fillRoundedRect(s(11), s(2), s(1), s(4), s(1));
  
  // Right horn
  graphics.fillStyle(colors.accent);
  graphics.fillRoundedRect(s(19), s(2), s(2), s(6), s(1));
  graphics.fillStyle(colors.highlight, 0.8);
  graphics.fillRoundedRect(s(19), s(2), s(1), s(4), s(1));
};

const drawModernTail = (graphics: Phaser.GameObjects.Graphics, colors: any, s: Function) => {
  // Tail with curve effect
  graphics.fillStyle(colors.primary);
  graphics.fillRoundedRect(s(24), s(16), s(4), s(2), s(1));
  graphics.fillRoundedRect(s(26), s(18), s(4), s(2), s(1));
  graphics.fillRoundedRect(s(28), s(20), s(3), s(2), s(1));
  
  // Tail highlight
  graphics.fillStyle(colors.highlight, 0.6);
  graphics.fillRoundedRect(s(24), s(16), s(2), s(1), s(1));
  graphics.fillRoundedRect(s(26), s(18), s(2), s(1), s(1));
};

const drawModernSpikes = (graphics: Phaser.GameObjects.Graphics, colors: any, s: Function) => {
  const spikePositions = [[12, 4], [16, 3], [20, 4]];
  spikePositions.forEach(([x, y]) => {
    // Spike shadow
    graphics.fillStyle(colors.shadow, 0.4);
    graphics.fillTriangle(s(x + 1), s(y + 3), s(x + 2), s(y + 1), s(x + 4), s(y + 4));
    // Main spike
    graphics.fillStyle(colors.accent);
    graphics.fillTriangle(s(x), s(y + 2), s(x + 1), s(y), s(x + 3), s(y + 3));
    // Spike highlight
    graphics.fillStyle(colors.highlight, 0.8);
    graphics.fillTriangle(s(x), s(y + 2), s(x + 1), s(y), s(x + 1), s(y + 2));
  });
};

const drawModernPattern = (graphics: Phaser.GameObjects.Graphics, colors: any, pattern: string, s: Function) => {
  graphics.fillStyle(colors.accent, 0.4);
  
  switch (pattern) {
    case 'gradient':
      for (let i = 0; i < 6; i++) {
        const alpha = 0.1 + (i * 0.05);
        graphics.fillStyle(colors.highlight, alpha);
        graphics.fillRoundedRect(s(8 + i), s(14), s(16 - i * 2), s(2), s(1));
      }
      break;
    case 'geometric':
      // Diamond patterns
      const positions = [[10, 14], [14, 16], [18, 14], [22, 16]];
      positions.forEach(([x, y]) => {
        graphics.fillStyle(colors.accent, 0.6);
        graphics.fillTriangle(s(x), s(y), s(x + 2), s(y + 1), s(x), s(y + 2));
        graphics.fillTriangle(s(x), s(y + 2), s(x + 2), s(y + 1), s(x + 2), s(y + 3));
      });
      break;
    case 'cosmic':
      // Star-like dots
      for (let i = 0; i < 8; i++) {
        const x = 8 + Math.random() * 16;
        const y = 12 + Math.random() * 8;
        graphics.fillStyle(colors.eyeGlow, 0.8);
        graphics.fillCircle(s(x), s(y), s(1));
      }
      break;
  }
};

const drawModernEyes = (graphics: Phaser.GameObjects.Graphics, colors: any, s: Function) => {
  // Eye glow
  graphics.fillStyle(colors.eyeGlow, 0.3);
  graphics.fillCircle(s(13), s(10), s(2));
  graphics.fillCircle(s(19), s(10), s(2));
  
  // Main eyes
  graphics.fillStyle(colors.eye);
  graphics.fillCircle(s(13), s(10), s(1.5));
  graphics.fillCircle(s(19), s(10), s(1.5));
  
  // Eye highlights
  graphics.fillStyle(colors.highlight);
  graphics.fillCircle(s(13.5), s(9.5), s(0.5));
  graphics.fillCircle(s(19.5), s(9.5), s(0.5));
};

const drawHighlights = (graphics: Phaser.GameObjects.Graphics, colors: any, s: Function) => {
  // Body highlights
  graphics.fillStyle(colors.highlight, 0.4);
  graphics.fillRoundedRect(s(8), s(12), s(2), s(6), s(1));
  graphics.fillRoundedRect(s(10), s(6), s(2), s(4), s(1));
  
  // Edge lighting
  graphics.lineStyle(s(1), colors.highlight, 0.3);
  graphics.strokeRoundedRect(s(6), s(12), s(18), s(12), s(2));
  graphics.strokeRoundedRect(s(10), s(6), s(12), s(10), s(3));
};
