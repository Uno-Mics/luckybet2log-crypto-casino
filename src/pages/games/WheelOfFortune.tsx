
import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const WheelOfFortune = () => {
  const [currentBet, setCurrentBet] = useState("1.00");
  const [selectedBet, setSelectedBet] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [balance, setBalance] = useState(1000.00);
  const [rotation, setRotation] = useState(0);
  const { toast } = useToast();

  const betAmounts = ["0.25", "0.50", "1.00", "1.50", "2.00", "5.00", "10.00", "50.00", "100.00", "500.00", "1000.00"];

  const wheelSections = [
    { label: "Red 2x", value: "red", multiplier: 2, color: "bg-red-500" },
    { label: "Black 2x", value: "black", multiplier: 2, color: "bg-gray-800" },
    { label: "Green 5x", value: "green", multiplier: 5, color: "bg-green-500" },
    { label: "Gold 10x", value: "gold", multiplier: 10, color: "bg-yellow-500" },
    { label: "Purple 25x", value: "purple", multiplier: 25, color: "bg-purple-500" },
    { label: "$ITLOG", value: "itlog", multiplier: 0, color: "bg-gradient-to-r from-yellow-400 to-orange-500" }
  ];

  const betOptions = [
    { label: "Red (2x)", value: "red", multiplier: 2 },
    { label: "Black (2x)", value: "black", multiplier: 2 },
    { label: "Green (5x)", value: "green", multiplier: 5 },
    { label: "Gold (10x)", value: "gold", multiplier: 10 },
    { label: "Purple (25x)", value: "purple", multiplier: 25 },
  ];

  const spinWheel = () => {
    if (!selectedBet) {
      toast({
        title: "Select a bet",
        description: "Please choose what to bet on before spinning.",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(currentBet) > balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough coins to place this bet.",
        variant: "destructive"
      });
      return;
    }

    setIsSpinning(true);
    setBalance(prev => prev - parseFloat(currentBet));

    // Generate random result with weighted probabilities
    const random = Math.random();
    let result: string;
    
    if (random < 0.02) { // 2% chance for $ITLOG
      result = "itlog";
    } else if (random < 0.05) { // 3% chance for purple
      result = "purple";
    } else if (random < 0.15) { // 10% chance for gold
      result = "gold";
    } else if (random < 0.35) { // 20% chance for green
      result = "green";
    } else if (random < 0.675) { // 32.5% chance for red
      result = "red";
    } else { // 32.5% chance for black
      result = "black";
    }

    // Calculate wheel rotation
    const sectionIndex = wheelSections.findIndex(section => section.value === result);
    const sectionAngle = 360 / wheelSections.length;
    const targetAngle = sectionIndex * sectionAngle + (sectionAngle / 2);
    const spins = 5 + Math.random() * 3; // 5-8 full spins
    const finalRotation = rotation + (spins * 360) + targetAngle;

    setRotation(finalRotation);

    // Handle results after animation
    setTimeout(() => {
      setIsSpinning(false);
      setLastResult(result);

      if (result === "itlog") {
        const betMultiplier = parseFloat(currentBet) * 10000;
        const reward = Math.min(betMultiplier, 1000000);
        toast({
          title: "🎉 $ITLOG TOKEN WON! 🎉",
          description: `You hit the exclusive $ITLOG token and won ${reward.toLocaleString()} tokens!`,
        });
      } else if (result === selectedBet) {
        const section = wheelSections.find(s => s.value === result);
        const winnings = parseFloat(currentBet) * (section?.multiplier || 1);
        setBalance(prev => prev + winnings);
        toast({
          title: "Congratulations!",
          description: `You won ₱${winnings.toFixed(2)} with ${section?.multiplier}x multiplier!`
        });
      } else {
        toast({
          title: "Better luck next time!",
          description: `The wheel landed on ${result.toUpperCase()}. Try again!`,
          variant: "destructive"
        });
      }
    }, 3000);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Wheel of Fortune
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Place your bets and spin the wheel for instant wins!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Wheel */}
            <div className="lg:col-span-2">
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="text-center">Wheel of Fortune</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="relative inline-block">
                    {/* Wheel */}
                    <div 
                      className="w-80 h-80 mx-auto rounded-full border-4 border-primary relative overflow-hidden transition-transform duration-3000 ease-out"
                      style={{ transform: `rotate(${rotation}deg)` }}
                    >
                      {wheelSections.map((section, index) => {
                        const sectionAngle = 360 / wheelSections.length;
                        const rotation = index * sectionAngle;
                        return (
                          <div
                            key={section.value}
                            className={`absolute w-full h-full ${section.color} flex items-center justify-center text-white font-bold text-sm`}
                            style={{
                              transform: `rotate(${rotation}deg)`,
                              clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((sectionAngle * Math.PI) / 180)}% ${50 - 50 * Math.sin((sectionAngle * Math.PI) / 180)}%)`
                            }}
                          >
                            <span 
                              className="transform -rotate-45 text-xs"
                              style={{ transform: `rotate(${-rotation + sectionAngle/2}deg)` }}
                            >
                              {section.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Pointer */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-primary"></div>
                    </div>
                  </div>

                  {lastResult && (
                    <div className="mt-6">
                      <Badge variant="secondary" className="text-lg px-4 py-2">
                        Last Result: {lastResult.toUpperCase()}
                      </Badge>
                    </div>
                  )}
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

              {/* Betting */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle>Place Your Bet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Bet Amount</label>
                    <Select value={currentBet} onValueChange={setCurrentBet} disabled={isSpinning}>
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

                  <div>
                    <label className="text-sm font-medium mb-2 block">Bet On</label>
                    <Select value={selectedBet} onValueChange={setSelectedBet} disabled={isSpinning}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bet option" />
                      </SelectTrigger>
                      <SelectContent>
                        {betOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={spinWheel} 
                    className="w-full glow-purple"
                    disabled={isSpinning || !selectedBet}
                  >
                    {isSpinning ? "Spinning..." : "Spin Wheel"}
                  </Button>
                </CardContent>
              </Card>

              {/* Payout Table */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle>Payout Table</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {betOptions.map(option => (
                      <div key={option.value} className="flex justify-between">
                        <span>{option.label}</span>
                        <span className="text-green-400">{option.multiplier}x</span>
                      </div>
                    ))}
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
                    2% chance! Win 10,000-1M tokens even if you bet on something else!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WheelOfFortune;
