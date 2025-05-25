
import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

const DiceRoll = () => {
  const [currentBet, setCurrentBet] = useState("1.00");
  const [prediction, setPrediction] = useState("over");
  const [targetNumber, setTargetNumber] = useState(50);
  const [isRolling, setIsRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [balance, setBalance] = useState(1000.00);
  const [multiplier, setMultiplier] = useState(1.98);
  const { toast } = useToast();

  const betAmounts = ["0.25", "0.50", "1.00", "1.50", "2.00", "5.00", "10.00", "50.00", "100.00", "500.00", "1000.00"];

  // Calculate multiplier based on win chance
  const calculateMultiplier = (target: number, isOver: boolean) => {
    const winChance = isOver ? (100 - target) / 100 : target / 100;
    return Math.max(1.01, (0.99 / winChance)); // 1% house edge
  };

  const updateMultiplier = (target: number, pred: string) => {
    const mult = calculateMultiplier(target, pred === "over");
    setMultiplier(mult);
  };

  const rollDice = () => {
    if (parseFloat(currentBet) > balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough coins to place this bet.",
        variant: "destructive"
      });
      return;
    }

    setIsRolling(true);
    setBalance(prev => prev - parseFloat(currentBet));

    // Simulate rolling animation
    const rollDuration = 2000;
    const rollInterval = 100;
    let elapsed = 0;

    const animate = setInterval(() => {
      setLastRoll(Math.floor(Math.random() * 100) + 1);
      elapsed += rollInterval;
      
      if (elapsed >= rollDuration) {
        clearInterval(animate);
        
        // Generate final result
        let finalRoll = Math.floor(Math.random() * 100) + 1;
        
        // 2% chance for $ITLOG token (special case)
        const itlogChance = Math.random();
        if (itlogChance < 0.02) {
          // Force a winning roll for $ITLOG
          if (prediction === "over") {
            finalRoll = Math.max(targetNumber + 1, Math.floor(Math.random() * (100 - targetNumber)) + targetNumber + 1);
          } else {
            finalRoll = Math.min(targetNumber - 1, Math.floor(Math.random() * targetNumber) + 1);
          }
          
          const betMultiplier = parseFloat(currentBet) * 10000;
          const reward = Math.min(betMultiplier, 1000000);
          
          setLastRoll(finalRoll);
          setIsRolling(false);
          
          toast({
            title: "🎉 $ITLOG TOKEN WON! 🎉",
            description: `You rolled ${finalRoll} and won ${reward.toLocaleString()} $ITLOG tokens!`,
          });
          return;
        }
        
        setLastRoll(finalRoll);
        setIsRolling(false);
        
        // Check for win
        const isWin = (prediction === "over" && finalRoll > targetNumber) || 
                     (prediction === "under" && finalRoll < targetNumber);
        
        if (isWin) {
          const winnings = parseFloat(currentBet) * multiplier;
          setBalance(prev => prev + winnings);
          toast({
            title: "Winner!",
            description: `You rolled ${finalRoll} and won ₱${winnings.toFixed(2)}!`
          });
        } else {
          toast({
            title: "Better luck next time!",
            description: `You rolled ${finalRoll}. Try again!`,
            variant: "destructive"
          });
        }
      }
    }, rollInterval);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                Dice Roll
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Roll a number from 1-100 and customize your risk!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Dice Display */}
            <div className="lg:col-span-2">
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="text-center">Dice Roll</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  {/* Dice Display */}
                  <div className="mb-8">
                    <div className={`w-32 h-32 mx-auto rounded-lg border-4 border-primary flex items-center justify-center text-6xl font-bold transition-all duration-200 ${
                      isRolling ? "animate-bounce bg-yellow-400/20" : "bg-white"
                    }`}>
                      {lastRoll || "?"}
                    </div>
                  </div>

                  {/* Prediction Display */}
                  <div className="mb-6">
                    <div className="bg-black/20 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Your Prediction</h3>
                      <div className="flex items-center justify-center space-x-4 text-lg">
                        <span className="text-muted-foreground">Roll</span>
                        <Badge variant="secondary" className="px-4 py-2">
                          {prediction.toUpperCase()}
                        </Badge>
                        <span className="text-muted-foreground">than</span>
                        <Badge variant="outline" className="px-4 py-2 text-lg">
                          {targetNumber}
                        </Badge>
                      </div>
                      <div className="mt-4">
                        <Badge variant="secondary" className="text-xl px-6 py-3 glow-green">
                          {multiplier.toFixed(2)}x Multiplier
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Roll Button */}
                  <Button 
                    onClick={rollDice} 
                    className="w-full glow-purple text-xl py-6"
                    disabled={isRolling}
                    size="lg"
                  >
                    {isRolling ? "Rolling..." : `Roll Dice (₱${currentBet})`}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Controls */}
            <div className="space-y-6">
              {/* Balance */}
              <Card className="bg-card/50 backdrop-blur-sm border-green-500/30">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="text-2xl font-bold text-green-400">₱{balance.toFixed(2)}</p>
                </CardContent>
              </Card>

              {/* Game Settings */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle>Game Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Bet Amount */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Bet Amount</Label>
                    <Select value={currentBet} onValueChange={setCurrentBet} disabled={isRolling}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {betAmounts.map(amount => (
                          <SelectItem key={amount} value={amount}>₱{amount}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Prediction Type */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Prediction</Label>
                    <Select 
                      value={prediction} 
                      onValueChange={(value) => {
                        setPrediction(value);
                        updateMultiplier(targetNumber, value);
                      }} 
                      disabled={isRolling}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="over">Roll Over</SelectItem>
                        <SelectItem value="under">Roll Under</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Target Number */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Target Number: {targetNumber}
                    </Label>
                    <Slider
                      value={[targetNumber]}
                      onValueChange={(value) => {
                        setTargetNumber(value[0]);
                        updateMultiplier(value[0], prediction);
                      }}
                      max={99}
                      min={1}
                      step={1}
                      disabled={isRolling}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>1</span>
                      <span>99</span>
                    </div>
                  </div>

                  {/* Win Chance */}
                  <div className="bg-blue-500/10 rounded-lg p-4">
                    <div className="flex justify-between text-sm">
                      <span>Win Chance:</span>
                      <span className="text-blue-400">
                        {prediction === "over" 
                          ? `${100 - targetNumber}%`
                          : `${targetNumber}%`
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Payout on Win:</span>
                      <span className="text-green-400">₱{(parseFloat(currentBet) * multiplier).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* $ITLOG Info */}
              <Card className="bg-gradient-to-r from-gold-600/10 to-amber-600/10 border-gold-500/30">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 itlog-token rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-black font-bold">₿</span>
                  </div>
                  <p className="text-sm font-semibold mb-1">$ITLOG Token</p>
                  <p className="text-xs text-muted-foreground">
                    2% chance to win 10,000-1M tokens on any winning roll!
                  </p>
                </CardContent>
              </Card>

              {/* Recent Rolls */}
              {lastRoll && (
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle>Last Roll</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">{lastRoll}</div>
                      <div className="text-sm text-muted-foreground">
                        {((prediction === "over" && lastRoll > targetNumber) || 
                          (prediction === "under" && lastRoll < targetNumber)) 
                          ? "Winner!" 
                          : "Try again!"
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DiceRoll;
