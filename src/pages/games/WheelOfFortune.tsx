
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
import { Sparkles, TrendingUp, Target, DollarSign } from "lucide-react";

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
      <div className="casino-game-container py-8">
        <div className="responsive-container">
          <div className="casino-game-header">
            <h1 className="casino-game-title">
              Wheel of Fortune
            </h1>
            <p className="casino-game-subtitle">
              Place your bets and spin the wheel for instant wins!
            </p>
          </div>

          <div className="responsive-grid">
            <div className="responsive-game-grid">
              <div className="casino-game-area">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h2 className="casino-game-area-title">Game Wheel</h2>
                  {selectedBet && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 text-lg font-bold rounded-full shadow-lg">
                      <Target className="w-5 h-5 mr-2" />
                      Betting on {selectedBet.toUpperCase()}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col items-center space-y-8">
                  {/* Wheel Container */}
                  <div className="relative">
                    {/* Pointer (Arrow pointing down at the top) */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[30px] border-l-transparent border-r-transparent border-t-white drop-shadow-2xl"></div>
                    </div>

                    {/* Wheel */}
                    <div 
                      className="w-80 h-80 sm:w-96 sm:h-96 mx-auto rounded-full border-8 border-white shadow-2xl relative overflow-hidden transition-transform ease-out bg-gradient-to-br from-gray-800 to-gray-900"
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
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-gray-200 to-white rounded-full border-4 border-gray-300 z-10 shadow-lg flex items-center justify-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Last Result Display */}
                  {lastResult && (
                    <div className="text-center">
                      <Badge 
                        variant="secondary" 
                        className={`text-xl px-8 py-4 rounded-full font-bold shadow-lg ${
                          lastResult === selectedBet 
                            ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-500/50" 
                            : lastResult === "itlog"
                            ? "bg-gradient-to-r from-gold-500 to-amber-600 text-white shadow-gold-500/50"
                            : "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-red-500/50"
                        }`}
                      >
                        Last Result: {lastResult.toUpperCase()}
                      </Badge>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="w-full max-w-md">
                    {!gameEnded ? (
                      <Button 
                        onClick={spinWheel} 
                        className="casino-primary-button w-full"
                        disabled={isSpinning || !selectedBet}
                      >
                        {isSpinning ? (
                          <>
                            <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                            Spinning...
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-5 h-5 mr-2" />
                            Spin Wheel ({currentBet} coins)
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        onClick={resetGame} 
                        className="casino-secondary-button w-full"
                      >
                        Start New Game
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="block sm:hidden">
                <GameHistory gameType="wheel-of-fortune" maxHeight="300px" />
              </div>

              <div className="hidden sm:block">
                <GameHistory gameType="wheel-of-fortune" maxHeight="400px" />
              </div>
            </div>

            <div className="responsive-control-panel">
              <div className="casino-balance-card">
                <p className="casino-balance-label">Coins Balance</p>
                <p className="casino-balance-amount">{balance.toFixed(2)}</p>
              </div>

              {activePetBoosts.find(boost => boost.trait_type === 'luck_boost') && (
                <div className="casino-luck-boost-card">
                  <div className="casino-luck-icon">
                    <Sparkles className="text-white font-bold text-xl" />
                  </div>
                  <p className="text-lg font-bold mb-2 text-emerald-400">Luck Boost Active!</p>
                  <p className="text-sm text-gray-300">
                    +{(((activePetBoosts.find(boost => boost.trait_type === 'luck_boost')?.total_boost || 1) - 1) * 100).toFixed(1)}% Better odds!
                  </p>
                </div>
              )}

              <div className="casino-settings-card">
                <h3 className="casino-settings-title">
                  <Target className="w-6 h-6 inline mr-2" />
                  Game Settings
                </h3>
                <div className="casino-control-panel">
                  <div className="casino-input-group">
                    <label className="casino-input-label">Bet Amount</label>
                    <Select value={currentBet} onValueChange={setCurrentBet} disabled={isSpinning}>
                      <SelectTrigger className="casino-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {betAmounts.map(amount => (
                          <SelectItem key={amount} value={amount}>{amount} coins</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="casino-input-group">
                    <label className="casino-input-label">Bet On Color</label>
                    <Select value={selectedBet} onValueChange={setSelectedBet} disabled={isSpinning}>
                      <SelectTrigger className="casino-select">
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
                </div>
              </div>

              <div className="casino-payout-card">
                <h3 className="casino-payout-title">Payout Table</h3>
                <div className="space-y-3">
                  {betOptions.map(option => (
                    <div key={option.value} className="casino-payout-row">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${option.color}`}></div>
                        <span>{option.label.split(' ')[0]}</span>
                      </div>
                      <span className="casino-payout-multiplier">{option.multiplier}x</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="casino-info-card">
                <div className="casino-info-icon">
                  <span className="text-black font-bold text-2xl">₿</span>
                </div>
                <p className="text-lg font-bold mb-2 text-amber-400">$ITLOG Token</p>
                <p className="text-sm text-gray-300">
                  0.5% chance! Win 500x your bet in $ITLOG tokens regardless of your bet choice!
                </p>
              </div>

              {selectedBet && (
                <div className="casino-stats-card">
                  <h3 className="casino-stats-title">
                    <TrendingUp className="w-5 h-5 inline mr-2" />
                    Current Bet
                  </h3>
                  <div className="space-y-3">
                    <div className="casino-stat-row">
                      <span className="casino-stat-label">Betting On</span>
                      <span className="casino-stat-value">{selectedBet.toUpperCase()}</span>
                    </div>
                    <div className="casino-stat-row">
                      <span className="casino-stat-label">Bet Amount</span>
                      <span className="casino-stat-value">{currentBet} coins</span>
                    </div>
                    <div className="casino-stat-row">
                      <span className="casino-stat-label">Potential Win</span>
                      <span className="casino-stat-value">
                        {(parseFloat(currentBet) * (betOptions.find(opt => opt.value === selectedBet)?.multiplier || 1)).toFixed(2)} coins
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WheelOfFortune;
