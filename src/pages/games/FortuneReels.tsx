
import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import Layout from "@/components/Layout";
import { useBannedCheck } from "@/hooks/useBannedCheck";
import { useQuestTracker } from "@/hooks/useQuestTracker";
import { usePetSystem } from "@/hooks/usePetSystem";
import { useGameHistory } from "@/hooks/useGameHistory";
import GameHistory from "@/components/GameHistory";
import BannedOverlay from "@/components/BannedOverlay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

const FortuneReels = () => {
  const [currentBet, setCurrentBet] = useState("1");
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState(["🍒", "🍒", "🍒"]);
  const [lastWin, setLastWin] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const { profile, updateBalance } = useProfile();
  const [balance, setBalance] = useState(0);
  const { toast } = useToast();
  const { isBanned } = useBannedCheck();
  const { trackGameWin, trackGameLoss, trackGamePlay, trackBet } = useQuestTracker();
  const { activePetBoosts } = usePetSystem();
  const { addHistoryEntry } = useGameHistory();

  useEffect(() => {
    if (profile) {
      setBalance(profile.coins);
    }
  }, [profile]);

  const betAmounts = ["1", "5", "10", "25", "50", "100", "250", "500", "1000", "2500", "5000"];

  const symbols = ["🍒", "🍋", "🍑", "🔔", "💎", "⭐", "7️⃣", "🪙"];
  
  const payTable = {
    "🍒🍒🍒": 5,      // Cherries - 5x
    "🍋🍋🍋": 10,     // Lemons - 10x
    "🍑🍑🍑": 15,     // Peaches - 15x
    "🔔🔔🔔": 25,     // Bells - 25x
    "💎💎💎": 50,     // Diamonds - 50x
    "⭐⭐⭐": 100,     // Stars - 100x
    "7️⃣7️⃣7️⃣": 500,    // Sevens - 500x
    "🪙🪙🪙": 0,      // $ITLOG Jackpot
  };

  const spin = async () => {
    if (parseFloat(currentBet) > balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough coins to place this bet.",
        variant: "destructive"
      });
      return;
    }

    setIsSpinning(true);
    setGameEnded(false);
    setLastWin(0);
    const betAmount = parseFloat(currentBet);

    // Update balance immediately and in database
    try {
      await updateBalance.mutateAsync({
        coinsChange: -betAmount
      });
      setBalance(prev => prev - betAmount);
      
      // Track bet for quest progress
      await trackBet(betAmount, 'fortune-reels');
      
      // Track game play for quest progress
      await trackGamePlay('fortune-reels');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again.",
        variant: "destructive"
      });
      setIsSpinning(false);
      return;
    }

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
        
        // Generate final result with weighted probabilities based on your image
        // Apply luck boost from active pets
        const luckBoost = activePetBoosts.find(boost => boost.trait_type === 'luck_boost');
        const luckMultiplier = luckBoost ? luckBoost.total_boost : 1.0;
        
        const random = Math.random() * 100; // Convert to percentage for easier comparison
        let finalReels: string[];
        
        // Apply luck boost to winning chances (reduce the random threshold for better odds)
        const adjustedRandom = random / luckMultiplier;
        
        if (adjustedRandom < 0.1) { // 0.1% chance for $ITLOG jackpot (improved with luck)
          finalReels = ["🪙", "🪙", "🪙"];
        } else if (adjustedRandom < 1.1) { // 1% chance for sevens (improved with luck)
          finalReels = ["7️⃣", "7️⃣", "7️⃣"];
        } else if (adjustedRandom < 2.6) { // 1.5% chance for stars (improved with luck)
          finalReels = ["⭐", "⭐", "⭐"];
        } else if (adjustedRandom < 4.6) { // 2% chance for diamonds (improved with luck)
          finalReels = ["💎", "💎", "💎"];
        } else if (adjustedRandom < 7.1) { // 2.5% chance for bells (improved with luck)
          finalReels = ["🔔", "🔔", "🔔"];
        } else if (adjustedRandom < 10.1) { // 3% chance for peaches (improved with luck)
          finalReels = ["🍑", "🍑", "🍑"];
        } else if (adjustedRandom < 14.1) { // 4% chance for lemons (improved with luck)
          finalReels = ["🍋", "🍋", "🍋"];
        } else if (adjustedRandom < 20.1) { // 6% chance for cherries (improved with luck)
          finalReels = ["🍒", "🍒", "🍒"];
        } else {
          // 80.9% chance for no match - generate random non-matching combination
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
        setGameEnded(true);
        
        // Check for wins
        const combination = finalReels.join("");
        const key = combination as keyof typeof payTable;
        
        if (key === "🪙🪙🪙") {
          // $ITLOG Jackpot: 10,000 to 1,000,000 tokens based on bet amount
          const baseReward = 10000;
          const maxReward = 1000000;
          const betMultiplier = betAmount * 1000; // Scale with bet amount
          const reward = Math.min(baseReward + betMultiplier, maxReward);
          
          updateBalance.mutateAsync({
            itlogChange: reward
          }).then(async () => {
            // Track the win for quest progress (convert ITLOG to coin equivalent for tracking)
            await trackGameWin(reward * 0.01, 'fortune-reels'); // Assuming 1 ITLOG = 0.01 coins equivalent
            
            // Add to game history for $ITLOG win
            await addHistoryEntry({
              game_type: 'fortune-reels',
              bet_amount: betAmount,
              result_type: 'win',
              win_amount: reward, // Store ITLOG amount in win_amount
              loss_amount: 0,
              multiplier: reward / betAmount, // Calculate effective multiplier
              game_details: { 
                reels: finalReels,
                combination,
                symbols: finalReels,
                isItlogWin: true,
                itlogReward: reward
              }
            });
            
            toast({
              title: "🎉 $ITLOG JACKPOT! 🎉",
              description: `Three $ITLOG symbols! You won ${reward.toLocaleString()} $ITLOG tokens!`,
            });
          }).catch(() => {
            toast({
              title: "Error updating $ITLOG balance",
              description: "Please contact support.",
              variant: "destructive"
            });
          });
        } else if (payTable[key]) {
          const winnings = betAmount * payTable[key];
          setLastWin(winnings);
          
          updateBalance.mutateAsync({
            coinsChange: winnings
          }).then(async () => {
            setBalance(prev => prev + winnings);
            
            // Track the win for quest progress
            await trackGameWin(winnings, 'fortune-reels');
            
            // Add to game history
            await addHistoryEntry({
              game_type: 'fortune-reels',
              bet_amount: betAmount,
              result_type: 'win',
              win_amount: winnings,
              loss_amount: 0,
              multiplier: payTable[key],
              game_details: { 
                reels: finalReels,
                combination,
                symbols: finalReels
              }
            });
            
            toast({
              title: "Winner!",
              description: `You won ${winnings.toFixed(2)} coins with ${payTable[key]}x multiplier!`
            });
          }).catch(() => {
            toast({
              title: "Error updating balance",
              description: "Please contact support.",
              variant: "destructive"
            });
          });
        } else {
          // Track the loss for quest progress
          trackGameLoss('fortune-reels');
          
          // Add to game history
          addHistoryEntry({
            game_type: 'fortune-reels',
            bet_amount: betAmount,
            result_type: 'loss',
            win_amount: 0,
            loss_amount: betAmount,
            multiplier: 0,
            game_details: { 
              reels: finalReels,
              combination,
              symbols: finalReels
            }
          });
          
          toast({
            title: "No match",
            description: "Better luck next time!",
            variant: "destructive"
          });
        }
      }
    }, spinInterval);
  };

  const resetGame = () => {
    setGameEnded(false);
    setLastWin(0);
  };

  return (
    <Layout>
      {isBanned && <BannedOverlay />}
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
            <div className="lg:col-span-2 space-y-6">
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
                        Won: {lastWin.toFixed(2)} coins
                      </Badge>
                    </div>
                  )}

                  {/* Spin Button */}
                  {!gameEnded ? (
                    <Button 
                      onClick={spin} 
                      className="w-full glow-purple text-xl py-6"
                      disabled={isSpinning}
                      size="lg"
                    >
                      {isSpinning ? "Spinning..." : `Spin (${currentBet} coins)`}
                    </Button>
                  ) : (
                    <Button 
                      onClick={resetGame} 
                      className="w-full glow-green text-xl py-6"
                      size="lg"
                    >
                      Start New Game
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Game History */}
              <GameHistory gameType="fortune-reels" maxHeight="300px" />
            </div>

            {/* Controls and Info */}
            <div className="space-y-6">
              {/* Balance */}
              <Card className="bg-card/50 backdrop-blur-sm border-blue-500/30">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">Coins Balance</p>
                  <p className="text-2xl font-bold text-blue-400">{balance.toFixed(2)} coins</p>
                </CardContent>
              </Card>

              {/* Luck Boost Indicator */}
              {activePetBoosts.find(boost => boost.trait_type === 'luck_boost') && (
                <Card className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 border-green-500/30">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-xl">🌟</span>
                    </div>
                    <p className="text-sm font-semibold mb-1 text-green-400">Luck Boost Active!</p>
                    <p className="text-xs text-muted-foreground">
                      +{(((activePetBoosts.find(boost => boost.trait_type === 'luck_boost')?.total_boost || 1) - 1) * 100).toFixed(1)}% Better odds!
                    </p>
                  </CardContent>
                </Card>
              )}

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
                        <SelectItem key={amount} value={amount}>{amount} coins</SelectItem>
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
                      <span className="text-green-400">5x (6%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>🍋🍋🍋</span>
                      <span className="text-green-400">10x (4%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>🍑🍑🍑</span>
                      <span className="text-green-400">15x (3%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>🔔🔔🔔</span>
                      <span className="text-green-400">25x (2.5%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>💎💎💎</span>
                      <span className="text-green-400">50x (2%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>⭐⭐⭐</span>
                      <span className="text-green-400">100x (1.5%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>7️⃣7️⃣7️⃣</span>
                      <span className="text-green-400">500x (1%)</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-2">
                      <span>🪙🪙🪙</span>
                      <span className="text-gold-400 font-bold">JACKPOT! (0.1%)</span>
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
                    Get 3 🪙 symbols for 10,000-1M $ITLOG tokens based on your bet!
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
