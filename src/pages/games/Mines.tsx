
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bomb, Gem, DollarSign } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useBannedCheck } from "@/hooks/useBannedCheck";
import { useQuestTracker } from "@/hooks/useQuestTracker";
import { usePetSystem } from "@/hooks/usePetSystem";
import { useGameHistory } from "@/hooks/useGameHistory";
import GameHistory from "@/components/GameHistory";
import BannedOverlay from "@/components/BannedOverlay";

type TileState = "hidden" | "safe" | "mine" | "itlog";

interface GameState {
  board: TileState[];
  minePositions: Set<number>;
  itlogPosition: number;
}

const Mines = () => {
  const [gameBoard, setGameBoard] = useState<TileState[]>(Array(25).fill("hidden"));
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentBet, setCurrentBet] = useState("1.00");
  const [minesCount, setMinesCount] = useState("5");
  const [tilesRevealed, setTilesRevealed] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const { toast } = useToast();
  const { profile, updateBalance } = useProfile();
  const { isBanned } = useBannedCheck();
  const { trackGameWin, trackGameLoss, trackGamePlay, trackBet } = useQuestTracker();
  const { activePetBoosts } = usePetSystem();
  const { addHistoryEntry } = useGameHistory();

  const betAmounts = ["0.25", "0.50", "1.00", "1.50", "2.00", "5.00", "10.00", "50.00", "100.00", "500.00", "1000.00"];
  const minesOptions = ["3", "5", "7", "10"];

  // Get coins balance from profile or default to 0
  const balance = profile?.coins || 0;

  const calculateMultiplier = (revealed: number, mines: number) => {
    const safeTiles = 25 - mines;
    if (revealed === 0) return 1.0;
    return 1 + (revealed / safeTiles) * 2;
  };

  const generateRandomGameState = (mineCount: number): GameState => {
    // Create array of all positions
    const allPositions = Array.from({ length: 25 }, (_, i) => i);
    
    // Shuffle array using Fisher-Yates algorithm for true randomness
    for (let i = allPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allPositions[i], allPositions[j]] = [allPositions[j], allPositions[i]];
    }

    // Apply luck boost by potentially reducing effective mine count or repositioning mines
    let effectiveMineCount = mineCount;
    const luckBoost = activePetBoosts.find(boost => boost.trait_type === 'luck_boost');
    if (luckBoost && luckBoost.total_boost > 1.0) {
      const luckBias = luckBoost.total_boost - 1.0;
      const shouldApplyLuck = Math.random() < luckBias;
      
      if (shouldApplyLuck) {
        // Reduce effective mine count by 1 (but minimum 1 mine)
        effectiveMineCount = Math.max(1, mineCount - 1);
      }
    }

    // Take first effectiveMineCount positions for mines
    const minePositions = new Set(allPositions.slice(0, effectiveMineCount));

    // 5% chance for $ITLOG token
    const hasItlog = Math.random() < 0.05;
    let itlogPosition = -1;
    
    if (hasItlog) {
      // Find a safe position for $ITLOG
      const safePositions = allPositions.slice(mineCount);
      if (safePositions.length > 0) {
        itlogPosition = safePositions[Math.floor(Math.random() * safePositions.length)];
      }
    }

    // Create the actual board state
    const board: TileState[] = Array(25).fill("safe");
    minePositions.forEach(pos => {
      board[pos] = "mine";
    });

    if (hasItlog && itlogPosition !== -1) {
      board[itlogPosition] = "itlog";
    }

    return {
      board,
      minePositions,
      itlogPosition
    };
  };

  const startGame = async () => {
    if (parseFloat(currentBet) > balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough coins to place this bet.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Deduct bet amount from user's coins balance
      await updateBalance.mutateAsync({
        coinsChange: -parseFloat(currentBet)
      });

      // Track bet for quest progress
      await trackBet(parseFloat(currentBet), 'mines');
      
      // Track game play for quest progress
      await trackGamePlay('mines');

      // Generate new random game state
      const newGameState = generateRandomGameState(parseInt(minesCount));
      setGameState(newGameState);

      // Reset game board to all hidden
      setGameBoard(Array(25).fill("hidden"));
      setGameStarted(true);
      setGameOver(false);
      setTilesRevealed(0);
      setCurrentMultiplier(1.0);

      toast({
        title: "Game Started!",
        description: `Bet placed: ${parseFloat(currentBet).toFixed(2)} coins`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start game. Please try again.",
        variant: "destructive"
      });
    }
  };

  const revealTile = (index: number) => {
    if (!gameStarted || gameOver || gameBoard[index] !== "hidden" || !gameState) return;

    const newBoard = [...gameBoard];
    const actualTileState = gameState.board[index];
    newBoard[index] = actualTileState;

    if (actualTileState === "mine") {
      // Track the loss for quest progress
      trackGameLoss('mines');
      
      // Add to game history
      addHistoryEntry({
        game_type: 'mines',
        bet_amount: parseFloat(currentBet),
        result_type: 'loss',
        win_amount: 0,
        loss_amount: parseFloat(currentBet),
        multiplier: currentMultiplier,
        game_details: { 
          tilesRevealed, 
          minesCount: parseInt(minesCount),
          hitMine: true,
          position: index
        }
      });
      
      // Reveal all tiles
      newBoard.forEach((tile, i) => {
        if (tile === "hidden") {
          newBoard[i] = gameState.board[i];
        }
      });
      
      // Reset game state to allow new settings
      setGameOver(false);
      setGameStarted(false);
      setGameState(null);
      setTilesRevealed(0);
      setCurrentMultiplier(1.0);
      
      toast({
        title: "Game Over!",
        description: "You hit a mine! Better luck next time.",
        variant: "destructive"
      });
    } else if (actualTileState === "itlog") {
      const betMultiplier = parseFloat(currentBet) * 5000;
      const reward = Math.min(betMultiplier, 1000000);
      
      // Add ITLOG tokens to user's balance
      updateBalance.mutateAsync({
        itlogChange: reward
      }).then(async () => {
        // Track the win for quest progress (convert ITLOG to coin equivalent for tracking)
        await trackGameWin(reward * 0.01, 'mines'); // Assuming 1 ITLOG = 0.01 coins equivalent
        
        // Add to game history for $ITLOG win
        await addHistoryEntry({
          game_type: 'mines',
          bet_amount: parseFloat(currentBet),
          result_type: 'win',
          win_amount: reward, // Store ITLOG amount in win_amount
          loss_amount: 0,
          multiplier: reward / parseFloat(currentBet), // Calculate effective multiplier
          game_details: { 
            tilesRevealed, 
            minesCount: parseInt(minesCount),
            hitMine: false,
            position: index,
            isItlogWin: true,
            itlogReward: reward
          }
        });
      });

      // Reveal all tiles
      newBoard.forEach((tile, i) => {
        if (tile === "hidden") {
          newBoard[i] = gameState.board[i];
        }
      });
      
      // Reset game state to allow new settings
      setGameOver(false);
      setGameStarted(false);
      setGameState(null);
      setTilesRevealed(0);
      setCurrentMultiplier(1.0);

      toast({
        title: "🎉 $ITLOG TOKEN WON! 🎉",
        description: `You found the exclusive $ITLOG token and won ${reward.toLocaleString()} tokens!`,
      });
    } else {
      const newRevealed = tilesRevealed + 1;
      setTilesRevealed(newRevealed);
      setCurrentMultiplier(calculateMultiplier(newRevealed, parseInt(minesCount)));
    }

    setGameBoard(newBoard);
  };

  const cashOut = async () => {
    if (!gameStarted || gameOver) return;
    
    try {
      const winnings = parseFloat(currentBet) * currentMultiplier;
      
      // Add winnings to user's coins balance
      await updateBalance.mutateAsync({
        coinsChange: winnings
      });

      // Track the win for quest progress
      await trackGameWin(winnings, 'mines');

      // Add to game history
      await addHistoryEntry({
        game_type: 'mines',
        bet_amount: parseFloat(currentBet),
        result_type: 'win',
        win_amount: winnings,
        loss_amount: 0,
        multiplier: currentMultiplier,
        game_details: { 
          tilesRevealed, 
          minesCount: parseInt(minesCount),
          cashedOut: true 
        }
      });

      // Reset game state to allow new settings
      setGameStarted(false);
      setGameOver(false);
      setGameState(null);
      setGameBoard(Array(25).fill("hidden"));
      setTilesRevealed(0);
      setCurrentMultiplier(1.0);
      
      toast({
        title: "Cashed out successfully!",
        description: `You won ${winnings.toFixed(2)} coins with a ${currentMultiplier.toFixed(2)}x multiplier!`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cash out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderTile = (index: number) => {
    const tileState = gameBoard[index];
    let content = "";
    let className = "w-12 h-12 rounded border-2 border-primary/30 flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer ";

    switch (tileState) {
      case "hidden":
        className += "bg-card hover:bg-card/80";
        break;
      case "safe":
        className += "bg-green-500/20 border-green-500";
        content = "💎";
        break;
      case "mine":
        className += "bg-red-500/20 border-red-500";
        content = "💣";
        break;
      case "itlog":
        className += "bg-gold-500/20 border-gold-500 glow-gold";
        content = "🪙";
        break;
    }

    return (
      <div
        key={index}
        className={className}
        onClick={() => revealTile(index)}
      >
        <span className="text-lg">{content}</span>
      </div>
    );
  };

  return (
    <Layout>
      {isBanned && <BannedOverlay />}
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Mines
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Navigate through the minefield and cash out before hitting a mine!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Game Board */}
            <div className="lg:col-span-2 responsive-spacing">
              <Card className="responsive-card border-primary/20">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="mobile-text">Game Board</span>
                    {gameStarted && !gameOver && (
                      <Badge variant="secondary" className="text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2 self-start sm:self-auto">
                        {currentMultiplier.toFixed(2)}x
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-1 sm:gap-2 mb-4 sm:mb-6 max-w-md mx-auto lg:max-w-none">
                    {Array.from({ length: 25 }, (_, i) => renderTile(i))}
                  </div>
                  
                  {gameStarted && !gameOver && (
                    <Button 
                      onClick={cashOut}
                      className="w-full mobile-button glow-green bg-green-600 hover:bg-green-700"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span className="text-sm sm:text-base">
                        Cash Out {(parseFloat(currentBet) * currentMultiplier).toFixed(2)} coins
                      </span>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Game History */}
              <div className="hidden sm:block">
                <GameHistory gameType="mines" maxHeight="300px" />
              </div>
            </div>

            {/* Game Controls */}
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

              {/* Game Settings */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle>Game Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Bet Amount</label>
                    <Select value={currentBet} onValueChange={setCurrentBet} disabled={gameStarted}>
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
                    <label className="text-sm font-medium mb-2 block">Number of Mines</label>
                    <Select value={minesCount} onValueChange={setMinesCount} disabled={gameStarted}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {minesOptions.map(count => (
                          <SelectItem key={count} value={count}>{count} mines</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={startGame} 
                    className="w-full glow-purple"
                    disabled={gameStarted}
                  >
                    {gameStarted ? "Game in Progress" : "Start New Game"}
                  </Button>
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
                    5% chance to find the exclusive $ITLOG token worth 10,000-1M tokens!
                  </p>
                </CardContent>
              </Card>

              

              {/* Game Stats */}
              {gameStarted && (
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle>Game Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Tiles Revealed</span>
                      <span>{tilesRevealed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Multiplier</span>
                      <span className="text-green-400">{currentMultiplier.toFixed(2)}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Potential Win</span>
                      <span className="text-green-400">{(parseFloat(currentBet) * currentMultiplier).toFixed(2)} coins</span>
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

export default Mines;
