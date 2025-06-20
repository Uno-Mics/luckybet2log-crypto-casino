
import React, { useEffect, useRef } from 'react';
import { generateModernPetConfig, drawModernPetSprite } from '@/utils/modernPetSpriteGenerator';

interface ModernPetSpriteCanvasProps {
  petName: string;
  rarity: string;
  size?: number;
  className?: string;
}

export const ModernPetSpriteCanvas = ({ 
  petName, 
  rarity, 
  size = 64, 
  className = "" 
}: ModernPetSpriteCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with transparency
    ctx.clearRect(0, 0, size, size);
    
    // Create temporary Phaser-like graphics context
    const modernConfig = generateModernPetConfig(petName, rarity);
    
    // Draw modern sprite using canvas 2D context
    drawModernCanvasSprite(ctx, modernConfig, size);
    
  }, [petName, rarity, size]);

  return (
    <canvas 
      ref={canvasRef} 
      width={size} 
      height={size} 
      className={`modern-pixel-sprite ${className}`}
      style={{ 
        imageRendering: 'pixelated',
        filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.2))'
      }}
    />
  );
};

const drawModernCanvasSprite = (ctx: CanvasRenderingContext2D, config: any, size: number) => {
  const { colors, features } = config;
  const scale = size / 32;
  
  const s = (value: number) => Math.floor(value * scale);
  const toHex = (color: number) => `#${color.toString(16).padStart(6, '0')}`;
  
  // Enable anti-aliasing for smoother edges
  ctx.imageSmoothingEnabled = false;
  
  // Draw aura/glow effect
  if (features.hasAura) {
    const gradient = ctx.createRadialGradient(s(16), s(16), 0, s(16), s(16), s(12));
    gradient.addColorStop(0, `${toHex(colors.accent)}${Math.floor(features.glowIntensity * 255).toString(16)}`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(s(16), s(16), s(12), 0, Math.PI * 2);
    ctx.fill();
  }

  // Modern body with gradients
  drawCanvasBody(ctx, colors, features, s, toHex);
  
  // Enhanced features
  if (features.hasWings) drawCanvasWings(ctx, colors, s, toHex);
  if (features.hasHorns) drawCanvasHorns(ctx, colors, s, toHex);
  if (features.hasTail) drawCanvasTail(ctx, colors, s, toHex);
  if (features.hasSpikes) drawCanvasSpikes(ctx, colors, s, toHex);
  
  // Modern eyes with glow
  drawCanvasEyes(ctx, colors, s, toHex);
  
  // Highlight effects
  drawCanvasHighlights(ctx, colors, s, toHex);
};

const drawCanvasBody = (ctx: CanvasRenderingContext2D, colors: any, features: any, s: Function, toHex: Function) => {
  // Shadow
  ctx.fillStyle = `${toHex(colors.shadow)}4D`;
  ctx.fillRect(s(7), s(13), s(18), s(12));
  
  // Main body with gradient
  const bodyGradient = ctx.createLinearGradient(s(6), s(12), s(24), s(24));
  bodyGradient.addColorStop(0, toHex(colors.primary));
  bodyGradient.addColorStop(1, toHex(colors.secondary));
  ctx.fillStyle = bodyGradient;
  ctx.fillRect(s(6), s(12), s(18), s(12));
  
  // Head
  const headGradient = ctx.createLinearGradient(s(10), s(6), s(22), s(16));
  headGradient.addColorStop(0, toHex(colors.primary));
  headGradient.addColorStop(1, toHex(colors.secondary));
  ctx.fillStyle = headGradient;
  ctx.fillRect(s(10), s(6), s(12), s(10));
  
  // Head highlight
  ctx.fillStyle = `${toHex(colors.highlight)}99`;
  ctx.fillRect(s(11), s(7), s(10), s(4));
  
  // Modern legs
  const legPositions = [[8, 22], [12, 23], [18, 23], [22, 22]];
  legPositions.forEach(([x, y]) => {
    // Leg gradient
    const legGradient = ctx.createLinearGradient(s(x), s(y), s(x + 3), s(y + 6));
    legGradient.addColorStop(0, toHex(colors.primary));
    legGradient.addColorStop(1, toHex(colors.shadow));
    ctx.fillStyle = legGradient;
    ctx.fillRect(s(x), s(y), s(3), s(6));
    
    // Leg highlight
    ctx.fillStyle = `${toHex(colors.highlight)}80`;
    ctx.fillRect(s(x), s(y), s(1), s(4));
  });
};

const drawCanvasWings = (ctx: CanvasRenderingContext2D, colors: any, s: Function, toHex: Function) => {
  // Left wing
  const wingGradient = ctx.createLinearGradient(s(2), s(10), s(8), s(18));
  wingGradient.addColorStop(0, toHex(colors.secondary));
  wingGradient.addColorStop(0.5, toHex(colors.accent));
  wingGradient.addColorStop(1, toHex(colors.highlight));
  ctx.fillStyle = wingGradient;
  ctx.fillRect(s(2), s(10), s(6), s(8));
  
  // Right wing
  ctx.fillRect(s(24), s(10), s(6), s(8));
  
  // Wing details
  ctx.fillStyle = `${toHex(colors.highlight)}CC`;
  ctx.fillRect(s(3), s(11), s(4), s(2));
  ctx.fillRect(s(25), s(11), s(4), s(2));
};

const drawCanvasHorns = (ctx: CanvasRenderingContext2D, colors: any, s: Function, toHex: Function) => {
  const hornGradient = ctx.createLinearGradient(s(11), s(2), s(13), s(8));
  hornGradient.addColorStop(0, toHex(colors.highlight));
  hornGradient.addColorStop(1, toHex(colors.accent));
  ctx.fillStyle = hornGradient;
  
  // Left horn
  ctx.fillRect(s(11), s(2), s(2), s(6));
  // Right horn
  ctx.fillRect(s(19), s(2), s(2), s(6));
};

const drawCanvasTail = (ctx: CanvasRenderingContext2D, colors: any, s: Function, toHex: Function) => {
  const tailGradient = ctx.createLinearGradient(s(24), s(16), s(31), s(22));
  tailGradient.addColorStop(0, toHex(colors.primary));
  tailGradient.addColorStop(1, toHex(colors.secondary));
  ctx.fillStyle = tailGradient;
  
  ctx.fillRect(s(24), s(16), s(4), s(2));
  ctx.fillRect(s(26), s(18), s(4), s(2));
  ctx.fillRect(s(28), s(20), s(3), s(2));
};

const drawCanvasSpikes = (ctx: CanvasRenderingContext2D, colors: any, s: Function, toHex: Function) => {
  const spikePositions = [[12, 4], [16, 3], [20, 4]];
  ctx.fillStyle = toHex(colors.accent);
  
  spikePositions.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(s(x), s(y + 2));
    ctx.lineTo(s(x + 1), s(y));
    ctx.lineTo(s(x + 3), s(y + 3));
    ctx.closePath();
    ctx.fill();
    
    // Spike highlight
    ctx.fillStyle = `${toHex(colors.highlight)}CC`;
    ctx.beginPath();
    ctx.moveTo(s(x), s(y + 2));
    ctx.lineTo(s(x + 1), s(y));
    ctx.lineTo(s(x + 1), s(y + 2));
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = toHex(colors.accent);
  });
};

const drawCanvasEyes = (ctx: CanvasRenderingContext2D, colors: any, s: Function, toHex: Function) => {
  // Eye glow
  const eyeGlow = ctx.createRadialGradient(s(13), s(10), 0, s(13), s(10), s(3));
  eyeGlow.addColorStop(0, `${toHex(colors.eyeGlow)}80`);
  eyeGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = eyeGlow;
  ctx.beginPath();
  ctx.arc(s(13), s(10), s(3), 0, Math.PI * 2);
  ctx.fill();
  
  const eyeGlow2 = ctx.createRadialGradient(s(19), s(10), 0, s(19), s(10), s(3));
  eyeGlow2.addColorStop(0, `${toHex(colors.eyeGlow)}80`);
  eyeGlow2.addColorStop(1, 'transparent');
  ctx.fillStyle = eyeGlow2;
  ctx.beginPath();
  ctx.arc(s(19), s(10), s(3), 0, Math.PI * 2);
  ctx.fill();
  
  // Main eyes
  ctx.fillStyle = toHex(colors.eye);
  ctx.beginPath();
  ctx.arc(s(13), s(10), s(1.5), 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(s(19), s(10), s(1.5), 0, Math.PI * 2);
  ctx.fill();
  
  // Eye highlights
  ctx.fillStyle = toHex(colors.highlight);
  ctx.beginPath();
  ctx.arc(s(13.5), s(9.5), s(0.8), 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(s(19.5), s(9.5), s(0.8), 0, Math.PI * 2);
  ctx.fill();
};

const drawCanvasHighlights = (ctx: CanvasRenderingContext2D, colors: any, s: Function, toHex: Function) => {
  ctx.fillStyle = `${toHex(colors.highlight)}66`;
  ctx.fillRect(s(8), s(12), s(2), s(6));
  ctx.fillRect(s(10), s(6), s(2), s(4));
  
  // Edge lighting
  ctx.strokeStyle = `${toHex(colors.highlight)}4D`;
  ctx.lineWidth = s(1);
  ctx.strokeRect(s(6), s(12), s(18), s(12));
  ctx.strokeRect(s(10), s(6), s(12), s(10));
};

export default ModernPetSpriteCanvas;
