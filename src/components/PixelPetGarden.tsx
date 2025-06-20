
import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePetSystem } from "@/hooks/usePetSystem";
import { useProfile } from "@/hooks/useProfile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generatePetSpriteConfig, drawPetSprite } from "@/utils/petSpriteGenerator";

const rarityColors = {
  common: "bg-gray-500",
  uncommon: "bg-green-500", 
  rare: "bg-blue-500",
  legendary: "bg-purple-500",
  mythical: "bg-gold-500"
};

const basePrices = {
  common: 10,
  uncommon: 50,
  rare: 100,
  legendary: 1000,
  mythical: 10000
};

const rarityMultipliers = {
  common: 5,
  uncommon: 10,
  rare: 25,
  legendary: 50,
  mythical: 100
};

class PetGardenScene extends Phaser.Scene {
  private pets: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private gardenSlots: Phaser.GameObjects.Rectangle[] = [];
  private selectedSlot: number | null = null;
  private onSlotClick?: (position: number) => void;
  private onPetClick?: (petId: string) => void;

  constructor() {
    super({ key: 'PetGardenScene' });
  }

  preload() {
    this.createGardenBackground();
  }

  createPetTexture(petName: string, rarity: string, textureKey: string) {
    const config = generatePetSpriteConfig(petName, rarity);
    const graphics = this.add.graphics();
    
    drawPetSprite(graphics, config, 32);
    
    graphics.generateTexture(textureKey, 32, 32);
    graphics.destroy();
  }

  createGardenBackground() {
    const graphics = this.add.graphics();
    
    // Create seamless grass texture without visible grid
    graphics.fillStyle(0x2d5a27);
    graphics.fillRect(0, 0, 64, 64);
    
    // Add organic grass blades
    graphics.fillStyle(0x4a7c59);
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 64;
      const height = Math.random() * 4 + 2;
      graphics.fillRect(x, y, 1, height);
    }
    
    graphics.fillStyle(0x6ab04c);
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 64;
      const height = Math.random() * 3 + 1;
      graphics.fillRect(x, y, 1, height);
    }
    
    // Add random flowers scattered naturally
    graphics.fillStyle(0xffff00);
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * 62 + 1;
      const y = Math.random() * 62 + 1;
      graphics.fillRect(x, y, 2, 2);
    }
    
    graphics.fillStyle(0xff69b4);
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * 62 + 1;
      const y = Math.random() * 62 + 1;
      graphics.fillRect(x, y, 2, 2);
    }
    
    graphics.generateTexture('grass', 64, 64);
    
    // Create subtle garden plot texture
    graphics.clear();
    graphics.fillStyle(0x8B4513, 0.8);
    graphics.fillRect(0, 0, 64, 64);
    
    // Add soil texture
    graphics.fillStyle(0x654321);
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 64;
      graphics.fillRect(x, y, 1, 1);
    }
    
    // Very subtle border
    graphics.lineStyle(1, 0x8FBC8F, 0.3);
    graphics.strokeRect(2, 2, 60, 60);
    graphics.generateTexture('garden_slot', 64, 64);

    // Empty slot with minimal visual
    graphics.clear();
    graphics.fillStyle(0x8B4513, 0.1);
    graphics.fillRect(0, 0, 64, 64);
    
    // Subtle corner markers
    graphics.fillStyle(0x666666, 0.2);
    graphics.fillRect(0, 0, 4, 4);
    graphics.fillRect(60, 0, 4, 4);
    graphics.fillRect(0, 60, 4, 4);
    graphics.fillRect(60, 60, 4, 4);
    
    graphics.generateTexture('empty_slot', 64, 64);
  }

  create() {
    // Create seamless background
    const bg = this.add.tileSprite(0, 0, 320, 320, 'grass');
    bg.setOrigin(0, 0);

    // Create 3x3 grid with natural spacing
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = 53 + col * 71;
        const y = 53 + row * 71;
        const position = row * 3 + col;

        const slot = this.add.rectangle(x, y, 64, 64, 0x000000, 0);
        const slotBg = this.add.image(x, y, 'empty_slot');
        
        slot.setInteractive();
        slot.on('pointerdown', () => {
          if (this.onSlotClick) {
            this.onSlotClick(position);
          }
        });

        slot.on('pointerover', () => {
          slotBg.setTint(0xffff88);
        });
        
        slot.on('pointerout', () => {
          slotBg.clearTint();
        });

        this.gardenSlots[position] = slot;
      }
    }
  }

  setSlotClickCallback(callback: (position: number) => void) {
    this.onSlotClick = callback;
  }

  setPetClickCallback(callback: (petId: string) => void) {
    this.onPetClick = callback;
  }

  placePet(petId: string, position: number, petName: string, rarity: string) {
    const row = Math.floor(position / 3);
    const col = position % 3;
    const x = 53 + col * 71;
    const y = 53 + row * 71;

    this.removePet(petId);

    const textureKey = `pet_${petId}`;
    this.createPetTexture(petName || 'Unknown Pet', rarity || 'common', textureKey);

    const pet = this.add.sprite(x, y, textureKey);
    pet.setScale(2);
    pet.setInteractive();

    // Floating animation
    const floatOffset = Math.random() * 2 + 3;
    const floatSpeed = Math.random() * 1000 + 2000;
    
    this.tweens.add({
      targets: pet,
      y: y - floatOffset,
      duration: floatSpeed,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // Special animations for certain pets
    if (petName && (petName.includes('phoenix') || petName.includes('angel') || petName.includes('cosmic'))) {
      this.tweens.add({
        targets: pet,
        rotation: 0.1,
        duration: 4000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
    }

    // Random idle movement
    this.time.addEvent({
      delay: 4000 + Math.random() * 3000,
      callback: () => {
        if (pet.active) {
          const moveDistance = 15;
          const randomX = x + (Math.random() - 0.5) * moveDistance;
          const randomY = y + (Math.random() - 0.5) * moveDistance;
          
          this.tweens.add({
            targets: pet,
            x: randomX,
            y: randomY,
            duration: 1500,
            ease: 'Power2',
            yoyo: true,
            onComplete: () => {
              if (pet.active) {
                pet.setPosition(x, y);
              }
            }
          });
        }
      },
      loop: true
    });

    // Sparkle effect for rare pets
    if (rarity && ['legendary', 'mythical'].includes(rarity)) {
      this.time.addEvent({
        delay: 2000,
        callback: () => {
          if (pet.active) {
            this.createSparkleEffect(x, y);
          }
        },
        loop: true
      });
    }

    pet.on('pointerdown', () => {
      if (this.onPetClick) {
        this.onPetClick(petId);
      }
    });

    pet.on('pointerover', () => {
      pet.setTint(0xdddddd);
      pet.setScale(2.2);
    });
    
    pet.on('pointerout', () => {
      pet.clearTint();
      pet.setScale(2);
    });

    this.pets.set(petId, pet);
  }

  createSparkleEffect(x: number, y: number) {
    const sparkle = this.add.graphics();
    sparkle.fillStyle(0xffd700, 0.8);
    
    const sparkleX = x + (Math.random() - 0.5) * 40;
    const sparkleY = y + (Math.random() - 0.5) * 40;
    
    sparkle.fillRect(sparkleX, sparkleY, 2, 2);
    sparkle.fillRect(sparkleX - 1, sparkleY, 1, 1);
    sparkle.fillRect(sparkleX + 1, sparkleY, 1, 1);
    sparkle.fillRect(sparkleX, sparkleY - 1, 1, 1);
    sparkle.fillRect(sparkleX, sparkleY + 1, 1, 1);
    
    this.tweens.add({
      targets: sparkle,
      alpha: 0,
      y: sparkleY - 20,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        sparkle.destroy();
      }
    });
  }

  removePet(petId: string) {
    const pet = this.pets.get(petId);
    if (pet) {
      pet.destroy();
      this.pets.delete(petId);
      
      const textureKey = `pet_${petId}`;
      if (this.textures.exists(textureKey)) {
        this.textures.remove(textureKey);
      }
    }
  }

  highlightSlot(position: number) {
    this.gardenSlots.forEach((slot, index) => {
      if (index === position) {
        slot.setFillStyle(0x90EE90, 0.4);
      } else {
        slot.setFillStyle(0x000000, 0);
      }
    });
    this.selectedSlot = position;
  }

  clearHighlight() {
    this.gardenSlots.forEach(slot => {
      slot.setFillStyle(0x000000, 0);
    });
    this.selectedSlot = null;
  }
}

// Pet Sprite Component for inventory
const PetSpriteCanvas = ({ petName, rarity, size = 64 }: { petName: string, rarity: string, size?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Create temporary graphics object for drawing
    const config = generatePetSpriteConfig(petName, rarity);
    
    // Simple pixel art drawing on canvas
    const scale = size / 16;
    const s = (value: number) => Math.floor(value * scale);
    
    // Draw body
    ctx.fillStyle = `#${config.colors.primary.toString(16).padStart(6, '0')}`;
    ctx.fillRect(s(4), s(6), s(8), s(6));
    ctx.fillRect(s(6), s(4), s(4), s(2));
    
    // Draw legs
    ctx.fillRect(s(5), s(12), s(2), s(3));
    ctx.fillRect(s(9), s(12), s(2), s(3));
    
    // Draw pattern
    if (config.features.pattern) {
      ctx.fillStyle = `#${config.colors.secondary.toString(16).padStart(6, '0')}`;
      switch (config.features.pattern) {
        case 'stripes':
          for (let i = 0; i < 3; i++) {
            ctx.fillRect(s(4), s(7 + i * 2), s(8), s(1));
          }
          break;
        case 'spots':
          ctx.fillRect(s(5), s(7), s(1), s(1));
          ctx.fillRect(s(8), s(9), s(1), s(1));
          ctx.fillRect(s(10), s(7), s(1), s(1));
          break;
        case 'flames':
          ctx.fillRect(s(5), s(6), s(1), s(2));
          ctx.fillRect(s(7), s(7), s(1), s(2));
          ctx.fillRect(s(9), s(6), s(1), s(2));
          break;
      }
    }
    
    // Draw wings
    if (config.features.hasWings) {
      ctx.fillStyle = `#${config.colors.secondary.toString(16).padStart(6, '0')}`;
      ctx.fillRect(s(2), s(7), s(2), s(3));
      ctx.fillRect(s(1), s(8), s(1), s(1));
      ctx.fillRect(s(12), s(7), s(2), s(3));
      ctx.fillRect(s(14), s(8), s(1), s(1));
    }
    
    // Draw horns
    if (config.features.hasHorns) {
      ctx.fillStyle = `#${config.colors.accent.toString(16).padStart(6, '0')}`;
      ctx.fillRect(s(6), s(2), s(1), s(2));
      ctx.fillRect(s(9), s(2), s(1), s(2));
    }
    
    // Draw tail
    if (config.features.hasTail) {
      ctx.fillStyle = `#${config.colors.primary.toString(16).padStart(6, '0')}`;
      ctx.fillRect(s(12), s(9), s(2), s(1));
      ctx.fillRect(s(13), s(10), s(2), s(1));
    }
    
    // Draw spikes
    if (config.features.hasSpikes) {
      ctx.fillStyle = `#${config.colors.accent.toString(16).padStart(6, '0')}`;
      ctx.fillRect(s(5), s(5), s(1), s(1));
      ctx.fillRect(s(7), s(4), s(1), s(2));
      ctx.fillRect(s(9), s(5), s(1), s(1));
    }
    
    // Draw eyes
    ctx.fillStyle = `#${config.colors.eye.toString(16).padStart(6, '0')}`;
    ctx.fillRect(s(6), s(5), s(1), s(1));
    ctx.fillRect(s(9), s(5), s(1), s(1));
    
    // Draw accent details
    ctx.fillStyle = `#${config.colors.accent.toString(16).padStart(6, '0')}`;
    ctx.fillRect(s(7), s(6), s(2), s(1));
    
  }, [petName, rarity, size]);

  return (
    <canvas 
      ref={canvasRef} 
      width={size} 
      height={size} 
      className="pixel-sprite"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export const PixelPetGarden = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<PetGardenScene | null>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [selectedPetForSale, setSelectedPetForSale] = useState<any>(null);

  const { userPets, activePetBoosts, placePetInGarden, removePetFromGarden, sellPet } = usePetSystem();
  const { profile } = useProfile();

  const activePets = userPets.filter(pet => pet.is_active);
  const inventoryPets = userPets.filter(pet => !pet.is_active);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 320,
      height: 320,
      parent: gameRef.current,
      backgroundColor: '#1a4a1a',
      scene: PetGardenScene,
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    const game = new Phaser.Game(config);
    gameInstanceRef.current = game;

    game.events.once('ready', () => {
      const scene = game.scene.getScene('PetGardenScene') as PetGardenScene;
      sceneRef.current = scene;

      scene.setSlotClickCallback((position: number) => {
        if (activePets.find(p => p.garden_position === position)) {
          const pet = activePets.find(p => p.garden_position === position);
          if (pet) {
            handleRemovePet(pet.id);
          }
        } else {
          setSelectedPosition(position);
          scene.highlightSlot(position);
        }
      });

      scene.setPetClickCallback((petId: string) => {
        const pet = activePets.find(p => p.id === petId);
        if (pet) {
          handleRemovePet(pet.id);
        }
      });

      activePets.forEach(pet => {
        if (pet.garden_position !== null) {
          scene.placePet(
            pet.id, 
            pet.garden_position, 
            pet.pet_types?.name || 'Unknown Pet',
            pet.pet_types?.rarity || 'common'
          );
        }
      });
    });

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (sceneRef.current) {
      activePets.forEach(pet => {
        if (pet.garden_position !== null) {
          sceneRef.current?.placePet(
            pet.id, 
            pet.garden_position, 
            pet.pet_types?.name || 'Unknown Pet',
            pet.pet_types?.rarity || 'common'
          );
        }
      });
    }
  }, [userPets]);

  const handlePlacePet = async (petId: string) => {
    if (selectedPosition !== null && sceneRef.current) {
      try {
        await placePetInGarden.mutateAsync({ petId, position: selectedPosition });
        
        const pet = userPets.find(p => p.id === petId);
        if (pet) {
          sceneRef.current.placePet(
            petId, 
            selectedPosition, 
            pet.pet_types?.name || 'Unknown Pet',
            pet.pet_types?.rarity || 'common'
          );
        }
        
        setSelectedPosition(null);
        sceneRef.current.clearHighlight();
      } catch (error) {
        console.error('Failed to place pet:', error);
      }
    }
  };

  const handleRemovePet = async (petId: string) => {
    try {
      await removePetFromGarden.mutateAsync(petId);
      sceneRef.current?.removePet(petId);
    } catch (error) {
      console.error('Failed to remove pet:', error);
    }
  };

  const handleSellPet = async (petId: string) => {
    try {
      await sellPet.mutateAsync(petId);
      setShowSellDialog(false);
      setSelectedPetForSale(null);
    } catch (error) {
      console.error('Failed to sell pet:', error);
    }
  };

  const calculateSellPrice = (pet: any) => {
    if (!pet.pet_types) return 0;
    
    const basePrice = basePrices[pet.pet_types.rarity as keyof typeof basePrices] || 10;
    const rarityMultiplier = rarityMultipliers[pet.pet_types.rarity as keyof typeof rarityMultipliers] || 5;
    const scarcityMultiplier = Math.max(1, 1 / pet.pet_types.drop_rate);
    
    return Math.floor(basePrice + (rarityMultiplier * scarcityMultiplier));
  };

  const openSellDialog = (pet: any) => {
    setSelectedPetForSale(pet);
    setShowSellDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Active Pet Boosts */}
      {activePetBoosts.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <CardTitle className="text-center">🌟 Active Pet Boosts 🌟</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePetBoosts.map((boost, index) => (
                <div key={index} className="text-center p-3 bg-green-500/10 rounded-lg">
                  <p className="text-sm text-muted-foreground capitalize">
                    {boost.trait_type.replace('_', ' ')}
                  </p>
                  <p className="text-xl font-bold text-green-400">
                    {boost.total_boost.toFixed(2)}x
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pixel Pet Garden */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="text-center pixel-font">🌸 Pixel Pet Garden 🌸</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div 
              ref={gameRef} 
              className="border-4 border-green-500/50 rounded-lg bg-gradient-to-br from-green-900/20 to-green-700/20"
              style={{ 
                imageRendering: 'pixelated',
                width: '320px',
                height: '320px'
              }}
            />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4 pixel-font">
            Click on an empty slot to place a pet, or click on a pet to remove it
          </p>
        </CardContent>
      </Card>

      {/* Pet Inventory */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="text-center pixel-font">📦 Pet Inventory 📦</CardTitle>
        </CardHeader>
        <CardContent>
          {inventoryPets.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 pixel-font">
              No pets in inventory. Hatch some eggs to get pets!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventoryPets.map((pet) => (
                <Card key={pet.id} className="border-2 border-gray-500/50 pixel-card">
                  <CardContent className="p-4 text-center">
                    <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                      <PetSpriteCanvas 
                        petName={pet.pet_types?.name || 'Unknown Pet'}
                        rarity={pet.pet_types?.rarity || 'common'}
                        size={64}
                      />
                    </div>
                    <h3 className="font-bold mb-2 pixel-font">{pet.pet_types?.name || 'Unknown Pet'}</h3>
                    <Badge className={`mb-2 ${rarityColors[pet.pet_types?.rarity as keyof typeof rarityColors] || 'bg-gray-500'} text-white pixel-font`}>
                      {pet.pet_types?.rarity?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                    <p className="text-sm text-muted-foreground mb-3 pixel-font">
                      {pet.pet_types?.trait_type}: +{pet.pet_types?.trait_value || 0}
                    </p>
                    <div className="space-y-2">
                      <Button
                        onClick={() => handlePlacePet(pet.id)}
                        disabled={selectedPosition === null}
                        className="w-full h-12 pixel-button"
                        style={{ fontFamily: 'monospace' }}
                      >
                        {selectedPosition !== null ? 'Place in Garden' : 'Select Position First'}
                      </Button>
                      <Button
                        onClick={() => openSellDialog(pet)}
                        variant="outline"
                        className="w-full h-12 pixel-button border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        style={{ fontFamily: 'monospace' }}
                      >
                        Sell for {calculateSellPrice(pet)} $ITLOG
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sell Confirmation Dialog */}
      <Dialog open={showSellDialog} onOpenChange={setShowSellDialog}>
        <DialogContent className="pixel-dialog">
          <DialogHeader>
            <DialogTitle className="pixel-font">Confirm Pet Sale</DialogTitle>
          </DialogHeader>
          {selectedPetForSale && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-2 flex items-center justify-center">
                  <PetSpriteCanvas 
                    petName={selectedPetForSale.pet_types?.name || 'Unknown Pet'}
                    rarity={selectedPetForSale.pet_types?.rarity || 'common'}
                    size={96}
                  />
                </div>
                <h3 className="text-xl font-bold pixel-font">{selectedPetForSale.pet_types?.name || 'Unknown Pet'}</h3>
                <Badge className={`mt-2 ${rarityColors[selectedPetForSale.pet_types?.rarity as keyof typeof rarityColors] || 'bg-gray-500'} text-white pixel-font`}>
                  {selectedPetForSale.pet_types?.rarity?.toUpperCase() || 'UNKNOWN'}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-lg pixel-font">You will receive:</p>
                <p className="text-3xl font-bold text-gold-400 pixel-font">
                  {calculateSellPrice(selectedPetForSale)} $ITLOG
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowSellDialog(false)}
                  variant="outline"
                  className="flex-1 pixel-button"
                  style={{ fontFamily: 'monospace' }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSellPet(selectedPetForSale.id)}
                  variant="destructive"
                  className="flex-1 pixel-button"
                  style={{ fontFamily: 'monospace' }}
                >
                  Sell Pet
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Current Balance */}
      <div className="text-center">
        <p className="text-lg pixel-font">
          Your $ITLOG Balance: <span className="text-gold-400 font-bold">
            {profile?.itlog_tokens?.toLocaleString() || 0}
          </span>
        </p>
      </div>
    </div>
  );
};

export default PixelPetGarden;
