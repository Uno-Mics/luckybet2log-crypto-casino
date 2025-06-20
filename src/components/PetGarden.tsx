
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePetSystem } from "@/hooks/usePetSystem";
import { useProfile } from "@/hooks/useProfile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const rarityColors = {
  common: "bg-gray-500",
  uncommon: "bg-green-500", 
  rare: "bg-blue-500",
  legendary: "bg-purple-500",
  mythical: "bg-gold-500"
};

const rarityGlow = {
  common: "glow-gray",
  uncommon: "glow-green",
  rare: "glow-blue", 
  legendary: "glow-purple",
  mythical: "glow-gold"
};

// Define rarity for precise pricing
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

export const PetGarden = () => {
  const { userPets, activePetBoosts, placePetInGarden, removePetFromGarden, sellPet } = usePetSystem();
  const { profile } = useProfile();
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [selectedPetForSale, setSelectedPetForSale] = useState<any>(null);

  // Filter pets to get active (in garden) and inactive (inventory) pets
  const activePets = userPets.filter(pet => pet.is_active);
  const inventoryPets = userPets.filter(pet => !pet.is_active);

  // Create a 3x3 grid
  const gardenPositions = Array.from({ length: 9 }, (_, index) => {
    const pet = activePets.find(p => p.garden_position === index);
    return { position: index, pet };
  });

  const handlePlacePet = async (petId: string) => {
    if (selectedPosition !== null) {
      try {
        await placePetInGarden.mutateAsync({ petId, position: selectedPosition });
        setSelectedPosition(null);
      } catch (error) {
        console.error('Failed to place pet:', error);
      }
    }
  };

  const handleRemovePet = async (petId: string) => {
    try {
      await removePetFromGarden.mutateAsync(petId);
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

      {/* Pet Garden Grid */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="text-center">🌸 Pet Garden 🌸</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            {gardenPositions.map(({ position, pet }) => (
              <div
                key={position}
                className={`aspect-square border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:border-primary ${
                  selectedPosition === position ? 'border-primary bg-primary/10' : ''
                } ${pet ? 'border-solid border-green-500 bg-green-500/10' : ''}`}
                onClick={() => {
                  if (pet) {
                    // Remove pet from garden
                    handleRemovePet(pet.id);
                  } else {
                    // Select position for placing pet
                    setSelectedPosition(position);
                  }
                }}
              >
                {pet ? (
                  <div className="text-center">
                    <div className="text-3xl mb-1">{pet.pet_types?.sprite_emoji || '🐾'}</div>
                    <p className="text-xs text-muted-foreground">{pet.pet_types?.name || 'Pet'}</p>
                  </div>
                ) : (
                  <div className="text-4xl text-gray-400">+</div>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Click on an empty slot to place a pet, or click on a pet to remove it
          </p>
        </CardContent>
      </Card>

      {/* Pet Inventory */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="text-center">📦 Pet Inventory 📦</CardTitle>
        </CardHeader>
        <CardContent>
          {inventoryPets.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No pets in inventory. Hatch some eggs to get pets!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventoryPets.map((pet) => (
                <Card key={pet.id} className="border-2 border-gray-500/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">{pet.pet_types?.sprite_emoji || '🐾'}</div>
                    <h3 className="font-bold mb-2">{pet.pet_types?.name || 'Unknown Pet'}</h3>
                    <Badge className={`mb-2 ${rarityColors[pet.pet_types?.rarity as keyof typeof rarityColors] || 'bg-gray-500'} text-white`}>
                      {pet.pet_types?.rarity?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                    <p className="text-sm text-muted-foreground mb-3">
                      {pet.pet_types?.trait_type}: +{pet.pet_types?.trait_value || 0}
                    </p>
                    <div className="space-y-2">
                      <Button
                        onClick={() => handlePlacePet(pet.id)}
                        disabled={selectedPosition === null}
                        className="w-full h-12 modern-button"
                      >
                        {selectedPosition !== null ? 'Place in Garden' : 'Select Position First'}
                      </Button>
                      <Button
                        onClick={() => openSellDialog(pet)}
                        variant="outline"
                        className="w-full h-12 modern-button border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Pet Sale</DialogTitle>
          </DialogHeader>
          {selectedPetForSale && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-6xl mb-2">{selectedPetForSale.pet_types?.sprite_emoji || '🐾'}</div>
                <h3 className="text-xl font-bold">{selectedPetForSale.pet_types?.name || 'Unknown Pet'}</h3>
                <Badge className={`mt-2 ${rarityColors[selectedPetForSale.pet_types?.rarity as keyof typeof rarityColors] || 'bg-gray-500'} text-white`}>
                  {selectedPetForSale.pet_types?.rarity?.toUpperCase() || 'UNKNOWN'}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-lg">You will receive:</p>
                <p className="text-3xl font-bold text-gold-400">
                  {calculateSellPrice(selectedPetForSale)} $ITLOG
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowSellDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSellPet(selectedPetForSale.id)}
                  variant="destructive"
                  className="flex-1"
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
        <p className="text-lg">
          Your $ITLOG Balance: <span className="text-gold-400 font-bold">
            {profile?.itlog_tokens?.toLocaleString() || 0}
          </span>
        </p>
      </div>
    </div>
  );
};

export default PetGarden;
