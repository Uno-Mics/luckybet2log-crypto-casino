
import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const FortuneReels = () => {
  const [currentBet, setCurrentBet] = useState("1.00");
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState(["🍒", "🍒", "🍒"]);
  const [balance, setBalance] = useState(1000.00);
  const [lastWin, setLastWin] = useState(0);
  const { toast } = useToast();

  const betAmounts = ["0.25", "0.50", "1.00", "1.50", "2.00", "5.00", "10.00", "50.00", "100.00", "500.00", "1000.00"];

  const symbols = ["🍒", "🍋", "🍊", "🔔", "💎", "⭐", "7️⃣", "🪙"];
  
  const payTable = {
    "🍒🍒🍒": 5,
    "🍋🍋🍋": 10,
    "🍊🍊🍊": 15,
    "🔔🔔🔔": 25,
    "💎💎💎": 50,
    "⭐⭐⭐": 100,
    "7️⃣7️⃣7️⃣": 500,
    "🪙🪙🪙": 0, // Special $ITLOG case
  };

  const spin = () => {
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
    setLastWin(0);

    // Simulate spinning animation
    const spinDuration = 2000;
    const spinInterval = 100;
    let elapsed = 0;

    const animate = setInterval(() => {
      setReels([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ]);
      
      elapsed += spinInterval;
      
      if (elapsed >= spinDuration) {
        clearInterval(animate);
        
        // Generate final result with weighted probabilities
        const random = Math.random();
        let finalReels: string[];
        
        if (random < 0.01) { // 1% chance for $ITLOG jackpot
          finalReels = ["🪙", "🪙", "🪙"];
        } else if (random < 0.02) { // 1% chance for 7s
          finalReels = ["7️⃣", "7️⃣", "7️⃣"];
        } else if (random < 0.05) { // 3% chance for stars
          finalReels = ["⭐", "⭐", "⭐"];
        } else if (random < 0.1) { // 5% chance for diamonds
          finalReels = ["💎", "💎", "💎"];
        } else if (random < 0.2) { // 10% chance for bells
          finalReels = ["🔔", "🔔", "🔔"];
        } else if (random < 0.35) { // 15% chance for oranges
          finalReels = ["🍊", "🍊", "🍊"];
        } else if (random < 0.5) { // 15% chance for lemons
          finalReels = ["🍋", "🍋", "🍋"];
        } else if (random < 0.7) { // 20% chance for cherries
          finalReels = ["🍒", "🍒", "🍒"];
        } else {
          // Random non-matching combination
          finalReels = [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)]
          ];
          // Ensure they don't match
          while (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
            finalReels[2] = symbols[Math.floor(Math.random() * symbols.length)];
          }
        }
        
        setReels(finalReels);
        setIsSpinning(false);
        
        // Check for wins
        const combination = finalReels.join("");
        const key = combination as keyof typeof payTable;
        
        if (key === "🪙🪙🪙") {
          const betMultiplier = parseFloat(currentBet) * 10000;
          const reward = Math.min(betMultiplier, 1000000);
          toast({
            title: "🎉 $ITLOG JACKPOT! 🎉",
            description: `Three $ITLOG symbols! You won ${reward.toLocaleString()} tokens!`,
          });
        } else if (payTable[key]) {
          const winnings = parseFloat(currentBet) * payTable[key];
          setBalance(prev => prev + winnings);
          setLastWin(winnings);
          toast({
            title: "Winner!",
            description: `You won ₱${winnings.toFixed(2)} with ${payTable[key]}x multiplier!`
          });
        } else {
          toast({
            title: "No match",
            description: "Better luck next time!",
            variant: "destructive"
          });
        }
      }
    }, spinInterval);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Fortune Reels
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Spin the reels and match symbols for big wins!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Slot Machine */}
            <div className="lg:col-span-2">
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="text-center">Slot Machine</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Reels Display */}
                  <div className="bg-black/20 rounded-lg p-8 mb-6">
                    <div className="flex justify-center items-center space-x-4">
                      {reels.map((symbol, index) => (
                        <div
                          key={index}
                          className={`w-24 h-24 bg-white rounded-lg flex items-center justify-center text-5xl border-4 ${
                            isSpinning ? "animate-pulse border-yellow-400" : "border-gray-300"
                          }`}
                        >
                          {symbol}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Win Display */}
                  {lastWin > 0 && (
                    <div className="text-center mb-6">
                      <Badge variant="secondary" className="text-2xl px-6 py-3 glow-green">
                        Won: ₱{lastWin.toFixed(2)}
                      </Badge>
                    </div>
                  )}

                  {/* Spin Button */}
                  <Button 
                    onClick={spin} 
                    className="w-full glow-purple text-xl py-6"
                    disabled={isSpinning}
                    size="lg"
                  >
                    {isSpinning ? "Spinning..." : `Spin (₱${currentBet})`}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Controls and Info */}
            <div className="space-y-6">
              {/* Balance */}
              <Card className="bg-card/50 backdrop-blur-sm border-green-500/30">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="text-2xl font-bold text-green-400">₱{balance.toFixed(2)}</p>
                </CardContent>
              </Card>

              {/* Bet Amount */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle>Bet Amount</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              {/* Pay Table */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle>Pay Table</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span>🍒🍒🍒</span>
                      <span className="text-green-400">5x</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>🍋🍋🍋</span>
                      <span className="text-green-400">10x</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>🍊🍊🍊</span>
                      <span className="text-green-400">15x</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>🔔🔔🔔</span>
                      <span className="text-green-400">25x</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>💎💎💎</span>
                      <span className="text-green-400">50x</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>⭐⭐⭐</span>
                      <span className="text-green-400">100x</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>7️⃣7️⃣7️⃣</span>
                      <span className="text-green-400">500x</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-2">
                      <span>🪙🪙🪙</span>
                      <span className="text-gold-400 font-bold">JACKPOT!</span>
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
                  <p className="text-sm font-semibold mb-1">$ITLOG Jackpot</p>
                  <p className="text-xs text-muted-foreground">
                    Get 3 🪙 symbols for the ultimate jackpot of 10,000-1M tokens!
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

export default FortuneReels;
