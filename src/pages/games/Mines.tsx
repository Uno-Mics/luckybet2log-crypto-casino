
import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bomb, Gem, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type TileState = "hidden" | "safe" | "mine" | "itlog";

const Mines = () => {
  const [gameBoard, setGameBoard] = useState<TileState[]>(Array(25).fill("hidden"));
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentBet, setCurrentBet] = useState("1.00");
  const [minesCount, setMinesCount] = useState("5");
  const [tilesRevealed, setTilesRevealed] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [balance, setBalance] = useState(1000.00);
  const { toast } = useToast();

  const betAmounts = ["0.25", "0.50", "1.00", "1.50", "2.00", "5.00", "10.00", "50.00", "100.00", "500.00", "1000.00"];
  const minesOptions = ["3", "5", "7", "10"];

  const calculateMultiplier = (revealed: number, mines: number) => {
    const safeTiles = 25 - mines;
    if (revealed === 0) return 1.0;
    return 1 + (revealed / safeTiles) * 2;
  };

  const startGame = () => {
    if (parseFloat(currentBet) > balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough coins to place this bet.",
        variant: "destructive"
      });
      return;
    }

    // Create new game board with mines and itlog
    const newBoard: TileState[] = Array(25).fill("safe");
    const mineCount = parseInt(minesCount);
    
    // Place mines
    const minePositions = new Set<number>();
    while (minePositions.size < mineCount) {
      minePositions.add(Math.floor(Math.random() * 25));
    }

    // 5% chance for $ITLOG token
    const hasItlog = Math.random() < 0.05;
    let itlogPosition = -1;
    
    if (hasItlog) {
      // Place $ITLOG in a safe spot
      do {
        itlogPosition = Math.floor(Math.random() * 25);
      } while (minePositions.has(itlogPosition));
    }

    minePositions.forEach(pos => {
      newBoard[pos] = "mine";
    });

    if (hasItlog) {
      newBoard[itlogPosition] = "itlog";
    }

    setGameBoard(newBoard.map(() => "hidden"));
    setGameStarted(true);
    setGameOver(false);
    setTilesRevealed(0);
    setCurrentMultiplier(1.0);
    setBalance(prev => prev - parseFloat(currentBet));
  };

  const revealTile = (index: number) => {
    if (!gameStarted || gameOver || gameBoard[index] !== "hidden") return;

    const newBoard = [...gameBoard];
    const actualTileState = getActualTileState(index);
    newBoard[index] = actualTileState;

    if (actualTileState === "mine") {
      setGameOver(true);
      newBoard.forEach((tile, i) => {
        if (tile === "hidden") {
          newBoard[i] = getActualTileState(i);
        }
      });
      toast({
        title: "Game Over!",
        description: "You hit a mine! Better luck next time.",
        variant: "destructive"
      });
    } else if (actualTileState === "itlog") {
      const betMultiplier = parseFloat(currentBet) * 10000;
      const reward = Math.min(betMultiplier, 1000000);
      setGameOver(true);
      toast({
        title: "🎉 $ITLOG TOKEN WON! 🎉",
        description: `You found the exclusive $ITLOG token and won ${reward.toLocaleString()} tokens!`,
      });
      newBoard.forEach((tile, i) => {
        if (tile === "hidden") {
          newBoard[i] = getActualTileState(i);
        }
      });
    } else {
      const newRevealed = tilesRevealed + 1;
      setTilesRevealed(newRevealed);
      setCurrentMultiplier(calculateMultiplier(newRevealed, parseInt(minesCount)));
    }

    setGameBoard(newBoard);
  };

  const getActualTileState = (index: number): TileState => {
    // This would normally come from the server/backend
    // For demo, we'll simulate it
    const mineCount = parseInt(minesCount);
    const minePositions = new Set<number>();
    
    // Generate consistent mine positions based on game state
    let seed = 12345; // In real app, this would be from server
    for (let i = 0; i < mineCount; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      minePositions.add(seed % 25);
    }

    // Check for $ITLOG (5% chance)
    const itlogSeed = (seed * 7) % 100;
    if (itlogSeed < 5) {
      let itlogPos = (seed * 13) % 25;
      while (minePositions.has(itlogPos)) {
        itlogPos = (itlogPos + 1) % 25;
      }
      if (index === itlogPos) return "itlog";
    }

    return minePositions.has(index) ? "mine" : "safe";
  };

  const cashOut = () => {
    if (!gameStarted || gameOver) return;
    
    const winnings = parseFloat(currentBet) * currentMultiplier;
    setBalance(prev => prev + winnings);
    setGameStarted(false);
    setGameOver(true);
    
    toast({
      title: "Cashed out successfully!",
      description: `You won ₱${winnings.toFixed(2)} with a ${currentMultiplier.toFixed(2)}x multiplier!`
    });
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Game Board */}
            <div className="lg:col-span-2">
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Game Board</span>
                    {gameStarted && !gameOver && (
                      <Badge variant="secondary" className="text-lg px-4 py-2">
                        {currentMultiplier.toFixed(2)}x
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2 mb-6">
                    {Array.from({ length: 25 }, (_, i) => renderTile(i))}
                  </div>
                  
                  {gameStarted && !gameOver && (
                    <Button 
                      onClick={cashOut}
                      className="w-full glow-green bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Cash Out ₱{(parseFloat(currentBet) * currentMultiplier).toFixed(2)}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Game Controls */}
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
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Bet Amount</label>
                    <Select value={currentBet} onValueChange={setCurrentBet} disabled={gameStarted}>
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
                    disabled={gameStarted && !gameOver}
                  >
                    {gameStarted && !gameOver ? "Game in Progress" : "Start New Game"}
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
                      <span className="text-green-400">₱{(parseFloat(currentBet) * currentMultiplier).toFixed(2)}</span>
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
