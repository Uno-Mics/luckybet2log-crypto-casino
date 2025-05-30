
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { usePetSystem } from "@/hooks/usePetSystem";

const rarityColors = {
  common: "bg-gray-500",
  uncommon: "bg-green-500", 
  rare: "bg-blue-500",
  legendary: "bg-purple-500",
  mythical: "bg-gold-500"
};

export const Incubator = () => {
  const { userEggs, startIncubation, hatchEgg, skipEggHatching } = usePetSystem();
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update time every second for progress tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const calculateProgress = (incubationStart: string, hatchTime: string) => {
    const start = new Date(incubationStart).getTime();
    const end = new Date(hatchTime).getTime();
    const now = currentTime;
    
    if (now >= end) return 100;
    if (now <= start) return 0;
    
    return ((now - start) / (end - start)) * 100;
  };

  const getTimeRemaining = (hatchTime: string) => {
    const remaining = new Date(hatchTime).getTime() - currentTime;
    if (remaining <= 0) return "Ready to hatch!";
    
    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    return `${minutes}m ${seconds}s remaining`;
  };

  const inventoryEggs = userEggs.filter(egg => egg.status === 'inventory');
  const incubatingEggs = userEggs.filter(egg => egg.status === 'incubating');

  return (
    <div className="space-y-6">
      {/* Incubating Eggs */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="text-center">🐣 Incubator 🐣</CardTitle>
        </CardHeader>
        <CardContent>
          {incubatingEggs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No eggs currently incubating. Place an egg from your inventory!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incubatingEggs.map((egg) => {
                const progress = egg.incubation_start && egg.hatch_time 
                  ? calculateProgress(egg.incubation_start, egg.hatch_time)
                  : 0;
                const isReady = progress >= 100;
                
                return (
                  <Card key={egg.id} className="border-2 border-orange-500/50">
                    <CardContent className="p-4 text-center">
                      <div className="text-4xl mb-2">🥚</div>
                      <h3 className="font-bold mb-2">{egg.egg_type.name}</h3>
                      <Badge className={`mb-3 ${rarityColors[egg.egg_type.rarity as keyof typeof rarityColors]} text-white`}>
                        {egg.egg_type.rarity.toUpperCase()}
                      </Badge>
                      
                      <div className="space-y-2 mb-4">
                        <Progress value={progress} className="h-3" />
                        <p className="text-sm">
                          {egg.hatch_time ? getTimeRemaining(egg.hatch_time) : "Calculating..."}
                        </p>
                      </div>
                      
                      {isReady ? (
                        <Button
                          onClick={() => hatchEgg(egg.id)}
                          className="w-full glow-gold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-black font-semibold"
                        >
                          Hatch Now! 🐣
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <Button disabled className="w-full">
                            Incubating...
                          </Button>
                          <Button
                            onClick={() => skipEggHatching(egg.id)}
                            variant="outline"
                            className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-colors"
                          >
                            ⏰ Skip for 50 $ITLOG
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventory Eggs */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="text-center">📦 Egg Inventory 📦</CardTitle>
        </CardHeader>
        <CardContent>
          {inventoryEggs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No eggs in inventory. Visit the shop to buy some eggs!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {inventoryEggs.map((egg) => (
                <Card key={egg.id} className="border-2 border-gray-500/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">🥚</div>
                    <h3 className="font-bold mb-2">{egg.egg_type.name}</h3>
                    <Badge className={`mb-3 ${rarityColors[egg.egg_type.rarity as keyof typeof rarityColors]} text-white`}>
                      {egg.egg_type.rarity.toUpperCase()}
                    </Badge>
                    <Button
                      onClick={() => startIncubation(egg.id)}
                      className="w-full glow-orange"
                    >
                      Start Incubation
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Incubator;
