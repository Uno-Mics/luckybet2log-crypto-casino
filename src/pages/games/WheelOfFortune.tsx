import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import Layout from "@/components/Layout";
import { useBannedCheck } from "@/hooks/useBannedCheck";
import { usePetSystem } from "@/hooks/usePetSystem";
import BannedOverlay from "@/components/BannedOverlay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useQuestTracker } from "@/hooks/useQuestTracker";
import { useGameHistory } from "@/hooks/useGameHistory";
import GameHistory from "@/components/GameHistory";

const WheelOfFortune = () => {
  const [currentBet, setCurrentBet] = useState("1");
  const [selectedBet, setSelectedBet] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const { profile, updateBalance } = useProfile();
  const [balance, setBalance] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const { toast } = useToast();
  const { trackGameWin, trackGamePlay, trackBet, trackGameLoss } = useQuestTracker();
  const { activePetBoosts } = usePetSystem();
  const { addHistoryEntry } = useGameHistory();

  useEffect(() => {
    if (profile) {
      setBalance(profile.coins);
    }
  }, [profile]);

  const betAmounts = ["1", "5", "10", "25", "50", "100", "250", "500", "1000", "2500", "5000"];

  const wheelSections = [
    { label: "Red", value: "red", multiplier: 2, color: "bg-red-500", angle: 0 },
    { label: "Black", value: "black", multiplier: 2, color: "bg-gray-800", angle: 45 },
    { label: "Green", value: "green", multiplier: 5, color: "bg-green-500", angle: 90 },
    { label: "Gold", value: "gold", multiplier: 10, color: "bg-yellow-500", angle: 135 },
    { label: "Purple", value: "purple", multiplier: 25, color: "bg-purple-500", angle: 180 },
    { label: "Red", value: "red", multiplier: 2, color: "bg-red-500", angle: 225 },
    { label: "Black", value: "black", multiplier: 2, color: "bg-gray-800", angle: 270 },
    { label: "$ITLOG", value: "itlog", multiplier: 500, color: "bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500", angle: 315 }
  ];

  const betOptions = [
    { label: "Red (2x)", value: "red", multiplier: 2, color: "bg-red-500" },
    { label: "Black (2x)", value: "black", multiplier: 2, color: "bg-gray-800" },
    { label: "Green (5x)", value: "green", multiplier: 5, color: "bg-green-500" },
    { label: "Gold (10x)", value: "gold", multiplier: 10, color: "bg-yellow-500" },
    { label: "Purple (25x)", value: "purple", multiplier: 25, color: "bg-purple-500" },
  ];

  const spinWheel = async () => {
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
    setGameEnded(false);
    const betAmount = parseFloat(currentBet);

    // Update balance immediately and in database
    try {
      await updateBalance.mutateAsync({
        coinsChange: -betAmount
      });
      setBalance(prev => prev - betAmount);

      // Track bet and game play for quest progress
      await trackBet(betAmount, 'wheel-of-fortune');
      await trackGamePlay('wheel-of-fortune');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again.",
        variant: "destructive"
      });
      setIsSpinning(false);
      return;
    }

    // Generate random result with weighted probabilities
    // Apply luck boost from active pets
    const luckBoost = activePetBoosts.find(boost => boost.trait_type === 'luck_boost');
    const luckMultiplier = luckBoost ? luckBoost.total_boost : 1.0;
    
    const random = Math.random();
    let targetSectionIndex: number;

    // If user has selected bet, improve their odds for that color
    if (selectedBet !== "itlog" && luckMultiplier > 1.0) {
      const baseOdds = random;
      const improvedOdds = baseOdds / luckMultiplier;
      
      // Calculate if the improved odds should win the selected bet
      let shouldWinSelectedBet = false;
      if (selectedBet === "red" && improvedOdds >= 0.4125 && improvedOdds < 0.825) {
        shouldWinSelectedBet = true;
      } else if (selectedBet === "black" && (improvedOdds < 0.4125 || improvedOdds >= 0.825)) {
        shouldWinSelectedBet = true;
      } else if (selectedBet === "green" && improvedOdds >= 0.075 && improvedOdds < 0.175) {
        shouldWinSelectedBet = true;
      } else if (selectedBet === "gold" && improvedOdds >= 0.025 && improvedOdds < 0.075) {
        shouldWinSelectedBet = true;
      } else if (selectedBet === "purple" && improvedOdds < 0.025) {
        shouldWinSelectedBet = true;
      }
      
      if (shouldWinSelectedBet) {
        // Force a win on the selected bet
        if (selectedBet === "red") {
          targetSectionIndex = Math.random() < 0.5 ? 0 : 5;
        } else if (selectedBet === "black") {
          targetSectionIndex = Math.random() < 0.5 ? 1 : 6;
        } else if (selectedBet === "green") {
          targetSectionIndex = 2;
        } else if (selectedBet === "gold") {
          targetSectionIndex = 3;
        } else if (selectedBet === "purple") {
          targetSectionIndex = 4;
        } else {
          // Fallback to normal probability
          if (random < 0.000005) { // 0.0005% chance for $ITLOG (very low)
      targetSectionIndex = 7; // $ITLOG section
          } else if (random < 0.025) { // 2% chance for purple
            targetSectionIndex = 4; // Purple section
          } else if (random < 0.075) { // 5% chance for gold
            targetSectionIndex = 3; // Gold section
          } else if (random < 0.175) { // 10% chance for green
            targetSectionIndex = 2; // Green section
          } else if (random < 0.5875) { // 41.25% chance for red
            targetSectionIndex = Math.random() < 0.5 ? 0 : 5; // Red sections (0 or 5)
          } else { // 41.25% chance for black
            targetSectionIndex = Math.random() < 0.5 ? 1 : 6; // Black sections (1 or 6)
          }
        }
        return;
      }
    }

    // Normal probability without luck boost forcing a win
    if (random < 0.000005) { // 0.0005% chance for $ITLOG (very low)
      targetSectionIndex = 7; // $ITLOG section
    } else if (random < 0.025) { // 2% chance for purple
      targetSectionIndex = 4; // Purple section
    } else if (random < 0.075) { // 5% chance for gold
      targetSectionIndex = 3; // Gold section
    } else if (random < 0.175) { // 10% chance for green
      targetSectionIndex = 2; // Green section
    } else if (random < 0.5875) { // 41.25% chance for red
      targetSectionIndex = Math.random() < 0.5 ? 0 : 5; // Red sections (0 or 5)
    } else { // 41.25% chance for black
      targetSectionIndex = Math.random() < 0.5 ? 1 : 6; // Black sections (1 or 6)
    }

    const resultSection = wheelSections[targetSectionIndex];

    // Calculate wheel rotation to land on the result section
    // The pointer points down at 0 degrees (top), so we need to adjust
    const targetAngle = resultSection.angle;
    const spins = 5 + Math.random() * 3; // 5-8 full spins
    // Since the pointer is at the top (0 degrees) and points down, 
    // we need the target section to be at the top when the wheel stops
    const finalRotation = rotation + (spins * 360) + (360 - targetAngle);

    setRotation(finalRotation);

    // Handle results after 5 seconds of spinning
    setTimeout(async () => {
      setIsSpinning(false);
      setGameEnded(true);

      // Calculate the actual result based on final wheel position
      const normalizedRotation = finalRotation % 360;
      const sectionSize = 360 / wheelSections.length; // 45 degrees per section

      // The pointer is at the top (0 degrees), so we need to find which section is at the top
      // We need to account for the wheel's rotation and find which section aligns with 0 degrees
      const pointerAngle = (360 - normalizedRotation) % 360;

      // Find which section the pointer is pointing to
      const actualSectionIndex = Math.floor(pointerAngle / sectionSize) % wheelSections.length;
      const actualResult = wheelSections[actualSectionIndex];
      const result = actualResult.value;

      setLastResult(result);

      if (result === "itlog") {
        const itlogReward = betAmount * 50; // 500x $ITLOG tokens
        try {
          await updateBalance.mutateAsync({
            itlogChange: itlogReward
          }).then(async () => {
            // Track the win for quest progress (convert ITLOG to coin equivalent for tracking)
            await trackGameWin(itlogReward * 0.01, 'wheel-of-fortune'); // Assuming 1 ITLOG = 0.01 coins equivalent

            // Add to game history for $ITLOG win
            await addHistoryEntry({
              game_type: 'wheel-of-fortune',
              bet_amount: betAmount,
              result_type: 'win',
              win_amount: itlogReward, // Store ITLOG amount in win_amount
              loss_amount: 0,
              multiplier: 500, // 500x for $ITLOG
              game_details: { 
                selectedBet,
                wheelResult: result,
                sectionIndex: actualSectionIndex,
                isItlogWin: true,
                itlogReward: itlogReward
              }
            });

            toast({
              title: "🎉 $ITLOG TOKEN WON! 🎉",
              description: `You hit the exclusive $ITLOG token and won ${itlogReward.toLocaleString()} $ITLOG tokens!`,
            });
          }).catch(() => {
            toast({
              title: "Error updating $ITLOG balance",
              description: "Please contact support.",
              variant: "destructive"
            });
          });
        } catch (error) {
          toast({
            title: "Error updating $ITLOG balance",
            description: "Please contact support.",
            variant: "destructive"
          });
        }
      } else if (result === selectedBet) {
        const winnings = betAmount * actualResult.multiplier;
        try {
          await updateBalance.mutateAsync({
            coinsChange: winnings
          });
          setBalance(prev => prev + winnings);

          // Track the win for quest progress
          await trackGameWin(winnings, 'wheel-of-fortune');

          // Add to game history
          await addHistoryEntry({
            game_type: 'wheel-of-fortune',
            bet_amount: betAmount,
            result_type: 'win',
            win_amount: winnings,
            loss_amount: 0,
            multiplier: actualResult.multiplier,
            game_details: { 
              selectedBet,
              wheelResult: result,
              sectionIndex: actualSectionIndex
            }
          });

          toast({
            title: "Congratulations!",
            description: `You won ${winnings.toFixed(2)} coins with ${actualResult.multiplier}x multiplier!`
          });
        } catch (error) {
          toast({
            title: "Error updating balance",
            description: "Please contact support.",
            variant: "destructive"
          });
        }
      } else {
        // Track the loss for quest progress
        trackGameLoss('wheel-of-fortune');

        // Add to game history
        addHistoryEntry({
          game_type: 'wheel-of-fortune',
          bet_amount: betAmount,
          result_type: 'loss',
          win_amount: 0,
          loss_amount: betAmount,
          multiplier: 0,
          game_details: { 
            selectedBet,
            wheelResult: result,
            sectionIndex: actualSectionIndex
          }
        });

        toast({
          title: "Better luck next time!",
          description: `The wheel landed on ${result.toUpperCase()}. Try again!`,
          variant: "destructive"
        });
      }
    }, 5000);
  };

  const resetGame = () => {
    setGameEnded(false);
    setLastResult(null);
    setSelectedBet("");
  };
    const { isBanned, reason } = useBannedCheck();

  return (
    <Layout>
      {isBanned && <BannedOverlay reason={reason} />}
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
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="text-center">Wheel of Fortune</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="relative inline-block">
                    {/* Pointer (Arrow pointing down at the top) */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-white drop-shadow-lg"></div>
                    </div>

                    {/* Wheel */}
                    <div 
                      className="w-96 h-96 mx-auto rounded-full border-8 border-white shadow-2xl relative overflow-hidden transition-transform ease-out"
                      style={{ 
                        transform: `rotate(${rotation}deg)`,
                        transitionDuration: isSpinning ? "5000ms" : "0ms"
                      }}
                    >
                      {wheelSections.map((section, index) => {
                        const sectionAngle = 360 / wheelSections.length;
                        const sectionRotation = index * sectionAngle;
                        const isItlogSection = section.value === "itlog";

                        return (
                          <div
                            key={`${section.value}-${index}`}
                            className={`absolute w-full h-full ${isItlogSection ? '' : section.color} border-r border-white/30`}
                            style={{
                              transform: `rotate(${sectionRotation}deg)`,
                              clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((sectionAngle * Math.PI) / 180)}% ${50 - 50 * Math.sin((sectionAngle * Math.PI) / 180)}%)`,
                              background: isItlogSection ? 'linear-gradient(135deg, #fbbf24 0%, #fb923c 50%, #ec4899 100%)' : undefined
                            }}
                          >
                            <div 
                              className="absolute flex items-center justify-center w-full h-full"
                              style={{ 
                                transform: `rotate(${sectionAngle/2}deg)`,
                              }}
                            >
                              <span 
                                className="text-sm font-bold text-white drop-shadow-lg absolute"
                                style={{ 
                                  top: "25%",
                                  left: "50%",
                                  transform: `translate(-50%, -50%) rotate(${-sectionRotation - sectionAngle/2}deg)`,
                                  textShadow: "2px 2px 4px rgba(0,0,0,0.8)"
                                }}
                              >
                                {section.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Center circle */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-gray-300 z-10 shadow-lg"></div>
                    </div>
                  </div>

                  {lastResult && (
                    <div className="mt-6">
                      <Badge variant="secondary" className="text-lg px-6 py-3">
                        Last Result: {lastResult.toUpperCase()}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Game History */}
              <GameHistory gameType="wheel-of-fortune" maxHeight="300px" />
            </div>

            {/* Controls */}
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
                          <SelectItem key={amount} value={amount}>{amount} coins</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Bet On Color</label>
                    <Select value={selectedBet} onValueChange={setSelectedBet} disabled={isSpinning}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bet option" />
                      </SelectTrigger>
                      <SelectContent>
                        {betOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded ${option.color}`}></div>
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {!gameEnded ? (
                    <Button 
                      onClick={spinWheel} 
                      className="w-full glow-purple"
                      disabled={isSpinning || !selectedBet}
                    >
                      {isSpinning ? "Spinning..." : "Spin Wheel"}
                    </Button>
                  ) : (
                    <Button 
                      onClick={resetGame} 
                      className="w-full glow-green"
                    >
                      Start New Game
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Payout Table */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle>Payout Table</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    {betOptions.map(option => (
                      <div key={option.value} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded ${option.color}`}></div>
                          <span>{option.label.split(' ')[0]}</span>
                        </div>
                        <span className="text-green-400 font-bold">{option.multiplier}x</span>
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
                    0.5% chance! Win 500x your bet in $ITLOG tokens regardless of your bet choice!
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