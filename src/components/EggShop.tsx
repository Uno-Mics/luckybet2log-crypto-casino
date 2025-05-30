
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePetSystem } from "@/hooks/usePetSystem";
import { useProfile } from "@/hooks/useProfile";

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

export const EggShop = () => {
  const { eggTypes, purchaseEgg } = usePetSystem();
  const { profile } = useProfile();

  const handlePurchase = (eggTypeId: number) => {
    purchaseEgg(eggTypeId);
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle className="text-center">🥚 Egg Shop 🥚</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eggTypes.map((eggType) => (
            <Card key={eggType.id} className={`${rarityColors[eggType.rarity as keyof typeof rarityColors]}/10 border-2 border-${eggType.rarity}`}>
              <CardContent className="p-4 text-center">
                <div className="text-4xl mb-2">🥚</div>
                <h3 className="font-bold text-lg mb-2">{eggType.name}</h3>
                <Badge className={`mb-2 ${rarityColors[eggType.rarity as keyof typeof rarityColors]} text-white`}>
                  {eggType.rarity.toUpperCase()}
                </Badge>
                <p className="text-2xl font-bold text-gold-400 mb-3">
                  {eggType.price.toLocaleString()} $ITLOG
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Hatch time: {Math.floor(eggType.hatch_time / 60)} minutes
                </p>
                <Button
                  onClick={() => handlePurchase(eggType.id)}
                  disabled={!profile || profile.itlog_tokens < eggType.price}
                  className={`w-full ${rarityGlow[eggType.rarity as keyof typeof rarityGlow]}`}
                >
                  {profile && profile.itlog_tokens >= eggType.price 
                    ? "Purchase" 
                    : "Insufficient Tokens"
                  }
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-4 text-center">
          <p className="text-lg">
            Your $ITLOG Balance: <span className="text-gold-400 font-bold">
              {profile?.itlog_tokens?.toLocaleString() || 0}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EggShop;
