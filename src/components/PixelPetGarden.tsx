import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePetSystem } from "@/hooks/usePetSystem";
import { useProfile } from "@/hooks/useProfile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
    // Create pixel art textures programmatically
    this.createPixelTextures();
    
    // Load garden background
    this.createGardenBackground();
  }

  createPixelTextures() {
    const graphics = this.add.graphics();
    
    // Create different colored pixel pet sprites
    const petColors = [
      0xff6b6b, // Red
      0x4ecdc4, // Teal
      0x45b7d1, // Blue
      0x96ceb4, // Green
      0xfeca57, // Yellow
      0xff9ff3, // Pink
      0xf368e0, // Purple
      0xff7675, // Light Red
      0x00b894, // Dark Green
      0x6c5ce7, // Violet
    ];

    petColors.forEach((color, index) => {
      graphics.clear();
      graphics.fillStyle(color);
      
      // Create a simple pixel pet sprite (8x8)
      graphics.fillRect(2, 1, 4, 2); // Head
      graphics.fillRect(1, 3, 6, 3); // Body
      graphics.fillRect(0, 6, 2, 2); // Left leg
      graphics.fillRect(6, 6, 2, 2); // Right leg
      graphics.fillRect(1, 0, 2, 1); // Left ear
      graphics.fillRect(5, 0, 2, 1); // Right ear
      
      // Add eyes
      graphics.fillStyle(0x000000);
      graphics.fillRect(2, 2, 1, 1); // Left eye
      graphics.fillRect(5, 2, 1, 1); // Right eye

      graphics.generateTexture(`pet_${index}`, 8, 8);
    });

    // Create slot texture
    graphics.clear();
    graphics.lineStyle(2, 0x00ff00, 0.8);
    graphics.strokeRect(0, 0, 64, 64);
    graphics.generateTexture('garden_slot', 64, 64);

    // Create empty slot texture - simplified approach without dashed lines
    graphics.clear();
    graphics.lineStyle(2, 0x666666, 0.5);
    graphics.strokeRect(0, 0, 64, 64);
    // Add corner markers to indicate empty slot
    graphics.fillStyle(0x666666, 0.3);
    graphics.fillRect(0, 0, 8, 8);
    graphics.fillRect(56, 0, 8, 8);
    graphics.fillRect(0, 56, 8, 8);
    graphics.fillRect(56, 56, 8, 8);
    graphics.generateTexture('empty_slot', 64, 64);
  }

  createGardenBackground() {
    const graphics = this.add.graphics();
    
    // Create grass texture
    graphics.fillStyle(0x4a7c59);
    graphics.fillRect(0, 0, 32, 32);
    
    // Add some grass details
    graphics.fillStyle(0x6ab04c);
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 32;
      const y = Math.random() * 32;
      graphics.fillRect(x, y, 1, 2);
    }
    
    graphics.generateTexture('grass', 32, 32);
  }

  create() {
    // Set up garden background
    const bg = this.add.tileSprite(0, 0, 320, 320, 'grass');
    bg.setOrigin(0, 0);

    // Create 3x3 grid of garden slots
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = 40 + col * 80;
        const y = 40 + row * 80;
        const position = row * 3 + col;

        const slot = this.add.rectangle(x, y, 64, 64, 0x000000, 0);
        const slotBg = this.add.image(x, y, 'empty_slot');
        
        slot.setInteractive();
        slot.on('pointerdown', () => {
          if (this.onSlotClick) {
            this.onSlotClick(position);
          }
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

  placePet(petId: string, position: number, petTypeId: number) {
    const row = Math.floor(position / 3);
    const col = position % 3;
    const x = 40 + col * 80;
    const y = 40 + row * 80;

    // Remove existing pet if any
    this.removePet(petId);

    // Create pet sprite
    const textureKey = `pet_${petTypeId % 10}`;
    const pet = this.add.sprite(x, y, textureKey);
    pet.setScale(4); // Scale up the 8x8 sprite
    pet.setInteractive();

    // Add floating animation
    this.tweens.add({
      targets: pet,
      y: y - 5,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // Add random movement
    this.time.addEvent({
      delay: 3000 + Math.random() * 2000,
      callback: () => {
        if (pet.active) {
          const randomX = x + (Math.random() - 0.5) * 20;
          const randomY = y + (Math.random() - 0.5) * 20;
          
          this.tweens.add({
            targets: pet,
            x: randomX,
            y: randomY,
            duration: 1000,
            ease: 'Power2',
            yoyo: true,
            onComplete: () => {
              pet.setPosition(x, y);
            }
          });
        }
      },
      loop: true
    });

    pet.on('pointerdown', () => {
      if (this.onPetClick) {
        this.onPetClick(petId);
      }
    });

    this.pets.set(petId, pet);
  }

  removePet(petId: string) {
    const pet = this.pets.get(petId);
    if (pet) {
      pet.destroy();
      this.pets.delete(petId);
    }
  }

  highlightSlot(position: number) {
    this.gardenSlots.forEach((slot, index) => {
      if (index === position) {
        slot.setFillStyle(0xffff00, 0.3);
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
      backgroundColor: '#2d5a27',
      scene: PetGardenScene,
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
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
          // Remove pet from this position
          const pet = activePets.find(p => p.garden_position === position);
          if (pet) {
            handleRemovePet(pet.id);
          }
        } else {
          // Select position for placing pet
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

      // Place existing pets
      activePets.forEach(pet => {
        if (pet.garden_position !== null) {
          scene.placePet(pet.id, pet.garden_position, pet.pet_type_id || 0);
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
      // Update pets in the scene when userPets changes
      activePets.forEach(pet => {
        if (pet.garden_position !== null) {
          sceneRef.current?.placePet(pet.id, pet.garden_position, pet.pet_type_id || 0);
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
          sceneRef.current.placePet(petId, selectedPosition, pet.pet_type_id || 0);
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
              style={{ imageRendering: 'pixelated' }}
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
                    <div 
                      className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-green-400 to-blue-500 rounded pixel-sprite"
                      style={{ 
                        imageRendering: 'pixelated',
                        background: `linear-gradient(45deg, ${pet.pet_types?.rarity === 'common' ? '#666' : 
                          pet.pet_types?.rarity === 'uncommon' ? '#22c55e' :
                          pet.pet_types?.rarity === 'rare' ? '#3b82f6' :
                          pet.pet_types?.rarity === 'legendary' ? '#a855f7' : '#ffd700'}, 
                          ${pet.pet_types?.rarity === 'common' ? '#999' : 
                          pet.pet_types?.rarity === 'uncommon' ? '#4ade80' :
                          pet.pet_types?.rarity === 'rare' ? '#60a5fa' :
                          pet.pet_types?.rarity === 'legendary' ? '#c084fc' : '#ffed4e'})`
                      }}
                    />
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
                <div 
                  className="w-24 h-24 mx-auto mb-2 rounded pixel-sprite"
                  style={{ 
                    imageRendering: 'pixelated',
                    background: `linear-gradient(45deg, ${selectedPetForSale.pet_types?.rarity === 'common' ? '#666' : 
                      selectedPetForSale.pet_types?.rarity === 'uncommon' ? '#22c55e' :
                      selectedPetForSale.pet_types?.rarity === 'rare' ? '#3b82f6' :
                      selectedPetForSale.pet_types?.rarity === 'legendary' ? '#a855f7' : '#ffd700'}, 
                      ${selectedPetForSale.pet_types?.rarity === 'common' ? '#999' : 
                      selectedPetForSale.pet_types?.rarity === 'uncommon' ? '#4ade80' :
                      selectedPetForSale.pet_types?.rarity === 'rare' ? '#60a5fa' :
                      selectedPetForSale.pet_types?.rarity === 'legendary' ? '#c084fc' : '#ffed4e'})`
                  }}
                />
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
