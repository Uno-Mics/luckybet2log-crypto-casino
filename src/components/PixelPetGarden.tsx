import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePetSystem } from "@/hooks/usePetSystem";
import { useProfile } from "@/hooks/useProfile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generateModernPetConfig, drawModernPetSprite } from "@/utils/modernPetSpriteGenerator";
import { ModernPetSpriteCanvas } from "@/components/ModernPetSpriteCanvas";

const rarityColors = {
  common: "bg-slate-600",
  uncommon: "bg-emerald-600", 
  rare: "bg-blue-600",
  legendary: "bg-purple-600",
  mythical: "bg-amber-600"
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

class ModernPetGardenScene extends Phaser.Scene {
  private pets: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private gardenSlots: Phaser.GameObjects.Rectangle[] = [];
  private selectedSlot: number | null = null;
  private onSlotClick?: (position: number) => void;
  private onPetClick?: (petId: string) => void;

  constructor() {
    super({ key: 'ModernPetGardenScene' });
  }

  preload() {
    this.createModernGardenTextures();
  }

  createModernGardenTextures() {
    const graphics = this.add.graphics();
    
    // Modern seamless garden background
    const bgGradient = this.add.graphics();
    bgGradient.fillGradientStyle(0x1a4a3a, 0x2d5a4a, 0x1a4a3a, 0x2d5a4a);
    bgGradient.fillRect(0, 0, 80, 80);
    
    // Organic grass texture with modern styling
    bgGradient.fillStyle(0x4a7c59, 0.6);
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 80;
      const y = Math.random() * 80;
      const size = Math.random() * 2 + 1;
      bgGradient.fillCircle(x, y, size);
    }
    
    // Modern flower accents
    bgGradient.fillStyle(0x83d2e8, 0.4);
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * 78 + 1;
      const y = Math.random() * 78 + 1;
      bgGradient.fillCircle(x, y, 1.5);
    }
    
    bgGradient.fillStyle(0xf39c12, 0.3);
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * 78 + 1;
      const y = Math.random() * 78 + 1;
      bgGradient.fillCircle(x, y, 1);
    }
    
    bgGradient.generateTexture('modern_grass', 80, 80);
    bgGradient.destroy();
    
    // Modern slot texture with sleek border
    graphics.clear();
    graphics.fillGradientStyle(0x2c5f6f, 0x4a90a4, 0x2c5f6f, 0x4a90a4);
    graphics.fillRoundedRect(0, 0, 80, 80, 8);
    
    // Inner glow effect
    graphics.fillStyle(0x83d2e8, 0.2);
    graphics.fillRoundedRect(4, 4, 72, 72, 6);
    
    // Modern border with gradient
    graphics.lineStyle(2, 0x83d2e8, 0.8);
    graphics.strokeRoundedRect(2, 2, 76, 76, 8);
    
    graphics.generateTexture('modern_slot', 80, 80);
    
    // Empty slot with modern styling
    graphics.clear();
    graphics.fillStyle(0x1a1a1a, 0.1);
    graphics.fillRoundedRect(0, 0, 80, 80, 8);
    
    // Subtle corner accents
    graphics.fillStyle(0x83d2e8, 0.15);
    graphics.fillRoundedRect(0, 0, 12, 12, 4);
    graphics.fillRoundedRect(68, 0, 12, 12, 4);
    graphics.fillRoundedRect(0, 68, 12, 12, 4);
    graphics.fillRoundedRect(68, 68, 12, 12, 4);
    
    // Modern dashed border
    graphics.lineStyle(1, 0x83d2e8, 0.3);
    graphics.strokeRoundedRect(4, 4, 72, 72, 6);
    
    graphics.generateTexture('modern_empty_slot', 80, 80);
    graphics.destroy();
  }

  createModernPetTexture(petName: string, rarity: string) {
    const config = generateModernPetConfig(petName, rarity);
    const graphics = this.add.graphics();
    
    drawModernPetSprite(graphics, config, 48);
    
    const textureKey = `modern_pet_${petName}_${rarity}`;
    graphics.generateTexture(textureKey, 48, 48);
    graphics.destroy();
    return textureKey;
  }

  create() {
    // Modern seamless background
    const bg = this.add.tileSprite(0, 0, 400, 400, 'modern_grass');
    bg.setOrigin(0, 0);

    // Create modern 3x3 grid with proper spacing
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = 67 + col * 87;
        const y = 67 + row * 87;
        const position = row * 3 + col;

        const slot = this.add.rectangle(x, y, 80, 80, 0x000000, 0);
        const slotBg = this.add.image(x, y, 'modern_empty_slot');
        
        slot.setInteractive();
        slot.on('pointerdown', () => {
          if (this.onSlotClick) {
            this.onSlotClick(position);
          }
        });

        slot.on('pointerover', () => {
          slotBg.setTint(0x83d2e8);
          slotBg.setScale(1.05);
        });
        
        slot.on('pointerout', () => {
          slotBg.clearTint();
          slotBg.setScale(1);
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
    const x = 67 + col * 87;
    const y = 67 + row * 87;

    this.removePet(petId);

    const textureKey = `modern_pet_${petName}_${rarity}`;
    const existingTexture = this.textures.get(textureKey);

    if (!existingTexture) {
      this.createModernPetTexture(petName || 'Unknown Pet', rarity || 'common');
    }

    const pet = this.add.sprite(x, y, textureKey);
    pet.setScale(1.5);
    pet.setInteractive();

    // Modern floating animation
    const floatOffset = Math.random() * 4 + 6;
    const floatSpeed = Math.random() * 1500 + 2500;
    
    this.tweens.add({
      targets: pet,
      y: y - floatOffset,
      duration: floatSpeed,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // Modern breathing scale effect
    this.tweens.add({
      targets: pet,
      scaleY: 1.55,
      duration: 3000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // Enhanced animations for special pets
    if (petName && (petName.includes('phoenix') || petName.includes('angel') || petName.includes('cosmic'))) {
      this.tweens.add({
        targets: pet,
        rotation: 0.15,
        duration: 5000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
    }

    // Modern particle system for legendary+ pets
    if (rarity && ['legendary', 'mythical'].includes(rarity)) {
      this.time.addEvent({
        delay: 1500,
        callback: () => {
          if (pet.active) {
            this.createModernParticles(x, y, rarity);
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
      pet.setTint(0xffffff);
      pet.setScale(1.7);
      
      // Add modern glow effect
      const glow = this.add.graphics();
      glow.fillStyle(0x83d2e8, 0.3);
      glow.fillCircle(x, y, 45);
      
      this.time.delayedCall(200, () => {
        if (glow) glow.destroy();
      });
    });
    
    pet.on('pointerout', () => {
      pet.clearTint();
      pet.setScale(1.5);
    });

    this.pets.set(petId, pet);
  }

  createModernParticles(x: number, y: number, rarity: string) {
    const particleColors = {
      legendary: [0x9b59b6, 0xbb8fce, 0xf8c471],
      mythical: [0xf39c12, 0xffd700, 0xffe135]
    };
    
    const colors = particleColors[rarity as keyof typeof particleColors] || particleColors.legendary;
    
    for (let i = 0; i < 5; i++) {
      const particle = this.add.graphics();
      const color = colors[Math.floor(Math.random() * colors.length)];
      particle.fillStyle(color, 0.8);
      
      const particleX = x + (Math.random() - 0.5) * 60;
      const particleY = y + (Math.random() - 0.5) * 60;
      
      particle.fillCircle(particleX, particleY, Math.random() * 3 + 2);
      
      this.tweens.add({
        targets: particle,
        alpha: 0,
        y: particleY - 30,
        scaleX: 0,
        scaleY: 0,
        duration: 2000,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  removePet(petId: string) {
    const pet = this.pets.get(petId);
    if (pet) {
      pet.destroy();
      this.pets.delete(petId);
      
      const textureKey = `modern_pet_${petId}`;
      if (this.textures.exists(textureKey)) {
        this.textures.remove(textureKey);
      }
    }
  }

  highlightSlot(position: number) {
    this.gardenSlots.forEach((slot, index) => {
      if (index === position) {
        slot.setFillStyle(0x83d2e8, 0.3);
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

export const PixelPetGarden = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ModernPetGardenScene | null>(null);
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
      width: 400,
      height: 400,
      parent: gameRef.current,
      backgroundColor: '#0a0a0a',
      scene: ModernPetGardenScene,
      pixelArt: true,
      antialias: false,
      scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    const game = new Phaser.Game(config);
    gameInstanceRef.current = game;

    game.events.once('ready', () => {
      const scene = game.scene.getScene('ModernPetGardenScene') as ModernPetGardenScene;
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
    <div className="space-y-8 bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl">
      {/* Active Pet Boosts */}
      {activePetBoosts.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-xl border-purple-500/30 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              ✨ Active Pet Boosts ✨
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activePetBoosts.map((boost, index) => (
                <div key={index} className="text-center p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30">
                  <p className="text-sm text-gray-300 capitalize font-medium">
                    {boost.trait_type.replace('_', ' ')}
                  </p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {boost.total_boost.toFixed(2)}x
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modern Pixel Pet Garden */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl border-slate-600/30 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            🌸 Modern Pet Garden 🌸
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div 
              ref={gameRef} 
              className="border-4 border-gradient-to-r from-emerald-500/50 to-blue-500/50 rounded-2xl shadow-2xl bg-gradient-to-br from-slate-900/50 to-slate-800/50"
              style={{ 
                imageRendering: 'pixelated',
                width: '400px',
                height: '400px',
                boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)'
              }}
            />
          </div>
          <p className="text-center text-gray-300 mt-6 text-lg font-medium">
            Click on an empty slot to place a pet, or click on a pet to remove it
          </p>
        </CardContent>
      </Card>

      {/* Modern Pet Inventory */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl border-slate-600/30 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            📦 Pet Inventory 📦
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inventoryPets.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🥚</div>
              <p className="text-xl text-gray-300 font-medium">
                No pets in inventory. Hatch some eggs to get pets!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inventoryPets.map((pet) => (
                <Card key={pet.id} className="bg-gradient-to-br from-slate-700/50 to-slate-600/50 border-2 border-slate-500/50 hover:border-slate-400/70 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-slate-600/30 to-slate-500/30 rounded-2xl border border-slate-400/30">
                      <ModernPetSpriteCanvas 
                        petName={pet.pet_types?.name || 'Unknown Pet'}
                        rarity={pet.pet_types?.rarity || 'common'}
                        size={64}
                        className="drop-shadow-lg"
                      />
                    </div>
                    <h3 className="font-bold mb-3 text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {pet.pet_types?.name || 'Unknown Pet'}
                    </h3>
                    <Badge className={`mb-3 text-white font-bold px-4 py-1 ${rarityColors[pet.pet_types?.rarity as keyof typeof rarityColors] || 'bg-gray-600'} shadow-lg`}>
                      {pet.pet_types?.rarity?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                    <p className="text-sm text-gray-300 mb-4 font-medium">
                      {pet.pet_types?.trait_type}: +{pet.pet_types?.trait_value || 0}
                    </p>
                    <div className="space-y-3">
                      <Button
                        onClick={() => handlePlacePet(pet.id)}
                        disabled={selectedPosition === null}
                        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {selectedPosition !== null ? 'Place in Garden' : 'Select Position First'}
                      </Button>
                      <Button
                        onClick={() => openSellDialog(pet)}
                        variant="outline"
                        className="w-full h-12 border-2 border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-400 font-bold transition-all duration-300"
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

      {/* Modern Sell Confirmation Dialog */}
      <Dialog open={showSellDialog} onOpenChange={setShowSellDialog}>
        <DialogContent className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Confirm Pet Sale
            </DialogTitle>
          </DialogHeader>
          {selectedPetForSale && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-slate-600/30 to-slate-500/30 rounded-3xl border border-slate-400/30">
                  <ModernPetSpriteCanvas 
                    petName={selectedPetForSale.pet_types?.name || 'Unknown Pet'}
                    rarity={selectedPetForSale.pet_types?.rarity || 'common'}
                    size={96}
                    className="drop-shadow-xl"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {selectedPetForSale.pet_types?.name || 'Unknown Pet'}
                </h3>
                <Badge className={`text-white font-bold px-4 py-2 ${rarityColors[selectedPetForSale.pet_types?.rarity as keyof typeof rarityColors] || 'bg-gray-600'} shadow-lg`}>
                  {selectedPetForSale.pet_types?.rarity?.toUpperCase() || 'UNKNOWN'}
                </Badge>
              </div>
              <div className="text-center p-6 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl border border-amber-500/30">
                <p className="text-lg text-gray-300 mb-2">You will receive:</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  {calculateSellPrice(selectedPetForSale)} $ITLOG
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={() => setShowSellDialog(false)}
                  variant="outline"
                  className="flex-1 border-2 border-slate-500/50 text-slate-300 hover:bg-slate-600/20 font-bold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSellPet(selectedPetForSale.id)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold shadow-lg"
                >
                  Sell Pet
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Current Balance */}
      <div className="text-center p-6 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl border border-amber-500/30">
        <p className="text-xl font-bold text-gray-300">
          Your $ITLOG Balance: <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent text-2xl">
            {profile?.itlog_tokens?.toLocaleString() || 0}
          </span>
        </p>
      </div>
    </div>
  );
};

export default PixelPetGarden;
