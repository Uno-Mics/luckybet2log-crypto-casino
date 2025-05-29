import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import { useBannedCheck } from "@/hooks/useBannedCheck";
import BannedOverlay from "@/components/BannedOverlay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { useAuth } from "@/hooks/useAuth";
import { useQuestTracker } from "@/hooks/useQuestTracker";

type CardType = {
  suit: string;
  value: string;
  numValue: number;
};

const Blackjack = () => {
  const [currentBet, setCurrentBet] = useState("10");
  const [gameStarted, setGameStarted] = useState(false);
  const [playerCards, setPlayerCards] = useState<CardType[]>([]);
  const [dealerCards, setDealerCards] = useState<CardType[]>([]);
  const [playerTotal, setPlayerTotal] = useState(0);
  const [dealerTotal, setDealerTotal] = useState(0);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [showDealerCards, setShowDealerCards] = useState(false);
  const { isBanned, reason } = useBannedCheck();
  const { toast } = useToast();
  const { profile, updateBalance } = useProfile();
  const { user } = useAuth();
  const { trackGamePlay: trackActivityGamePlay, trackBet: trackActivityBet, trackGameWin: trackActivityGameWin, trackGameLoss: trackActivityGameLoss, trackGameSession } = useActivityTracker();
  const [sessionId] = useState(`blackjack_session_${Date.now()}`);
  const [sessionStartTime] = useState(Date.now());
  const { trackGameWin, trackGamePlay, trackBet } = useQuestTracker();

  useEffect(() => {
    if (profile) {
      setBalance(profile.coins);
    }
  }, [profile]);

  const betAmounts = ["10", "25", "50", "100", "250", "500"];

  const suits = ["♠", "♥", "♦", "♣"];
  const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

  const createDeck = (): CardType[] => {
    const deck: CardType[] = [];
    suits.forEach(suit => {
      values.forEach(value => {
        let numValue = parseInt(value);
        if (value === "A") numValue = 11;
        else if (["J", "Q", "K"].includes(value)) numValue = 10;

        deck.push({ suit, value, numValue });
      });
    });
    return shuffleDeck(deck);
  };

  const shuffleDeck = (deck: CardType[]): CardType[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const calculateTotal = (cards: CardType[]): number => {
    let total = 0;
    let aces = 0;

    cards.forEach(card => {
      if (card.value === "A") {
        aces++;
        total += 11;
      } else {
        total += card.numValue;
      }
    });

    // Adjust for aces
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }

    return total;
  };

  const dealCard = (deck: CardType[]): [CardType, CardType[]] => {
    const newDeck = [...deck];
    const card = newDeck.pop();
    return [card!, newDeck];
  };

  const startNewGame = async () => {
    const betAmount = parseFloat(currentBet);

    if (betAmount > balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough coins to place this bet.",
        variant: "destructive"
      });
      return;
    }

    // Update balance immediately and in database
    try {
      await updateBalance.mutateAsync({
        coinsChange: -betAmount
      });
      setBalance(prev => prev - betAmount);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again.",
        variant: "destructive"
      });
      return;
    }

    const deck = createDeck();

    // Deal initial cards
    const [playerCard1, deck1] = dealCard(deck);
    const [dealerCard1, deck2] = dealCard(deck1);
    const [playerCard2, deck3] = dealCard(deck2);
    const [dealerCard2, newDeck] = dealCard(deck3);

    const initialPlayerCards = [playerCard1, playerCard2];
    const initialDealerCards = [dealerCard1, dealerCard2];

    setPlayerCards(initialPlayerCards);
    setDealerCards(initialDealerCards);
    setPlayerTotal(calculateTotal(initialPlayerCards));
    setDealerTotal(calculateTotal(initialDealerCards));
    setGameStarted(true);
    setGameResult(null);
    setShowDealerCards(false);

    // Check for natural blackjack
    const playerBJ = calculateTotal(initialPlayerCards) === 21;
    const dealerBJ = calculateTotal(initialDealerCards) === 21;

    if (playerBJ || dealerBJ) {
      setShowDealerCards(true);
      if (playerBJ && dealerBJ) {
        setGameResult("push");
        updateBalance.mutateAsync({
          coinsChange: betAmount
        }).then(() => {
          setBalance(prev => prev + betAmount);
          toast({
            title: "Push!",
            description: "Both have blackjack. Bet returned."
          });
        }).catch(() => {
          toast({
            title: "Error updating balance",
            description: "Please contact support.",
            variant: "destructive"
          });
        });
      } else if (playerBJ) {
        const winnings = betAmount * 2.5; // 3:2 payout
        setGameResult("blackjack");
        updateBalance.mutateAsync({
          coinsChange: winnings
        }).then(() => {
          setBalance(prev => prev + winnings);
          trackGameWin(winnings, 'blackjack');
          trackActivityGameWin('blackjack', winnings, sessionId);
          toast({
            title: "Blackjack!",
            description: `You won ${winnings.toFixed(2)} coins with a natural blackjack!`
          });
        }).catch(() => {
          toast({
            title: "Error updating balance",
            description: "Please contact support.",
            variant: "destructive"
          });
        });
      } else {
        setGameResult("dealer_blackjack");
        trackActivityGameLoss('blackjack', betAmount, sessionId);
        toast({
          title: "Dealer Blackjack",
          description: "Dealer has blackjack. You lose.",
          variant: "destructive"
        });
      }
      setGameStarted(false);
    } else {
      trackBet('blackjack', betAmount);
      trackGamePlay('blackjack');
      trackActivityBet('blackjack', betAmount, sessionId);
      trackActivityGamePlay('blackjack', sessionId);
    }
  };

  const hit = () => {
    if (!gameStarted) return;

    const deck = createDeck();
    const [newCard] = dealCard(deck);
    const newPlayerCards = [...playerCards, newCard];
    const newTotal = calculateTotal(newPlayerCards);

    setPlayerCards(newPlayerCards);
    setPlayerTotal(newTotal);

    if (newTotal > 21) {
      const betAmount = parseFloat(currentBet);
      setGameResult("bust");
      setGameStarted(false);
      setShowDealerCards(true);
      trackActivityGameLoss('blackjack', betAmount, sessionId);
      toast({
        title: "Bust!",
        description: "You went over 21. You lose.",
        variant: "destructive"
      });
    }
  };

  const stand = () => {
    if (!gameStarted) return;

    setShowDealerCards(true);
    let currentDealerCards = [...dealerCards];
    let currentDealerTotal = dealerTotal;

    // Dealer draws until 17 or higher
    while (currentDealerTotal < 17) {
      const deck = createDeck();
      const [newCard] = dealCard(deck);
      currentDealerCards = [...currentDealerCards, newCard];
      currentDealerTotal = calculateTotal(currentDealerCards);
    }

    setDealerCards(currentDealerCards);
    setDealerTotal(currentDealerTotal);

    // Determine winner
    const betAmount = parseFloat(currentBet);
    if (currentDealerTotal > 21) {
      setGameResult("dealer_bust");
      const winnings = betAmount * 2;
      updateBalance.mutateAsync({
        coinsChange: winnings
      }).then(() => {
        setBalance(prev => prev + winnings);
        trackGameWin(winnings, 'blackjack');
        trackActivityGameWin('blackjack', winnings, sessionId);
        toast({
          title: "Dealer Bust!",
          description: `Dealer went over 21. You won ${winnings.toFixed(2)} coins!`
        });
      }).catch(() => {
        toast({
          title: "Error updating balance",
          description: "Please contact support.",
          variant: "destructive"
        });
      });
    } else if (playerTotal > currentDealerTotal) {
      setGameResult("win");
      const winnings = betAmount * 2;
      updateBalance.mutateAsync({
        coinsChange: winnings
      }).then(() => {
        setBalance(prev => prev + winnings);
        trackGameWin(winnings, 'blackjack');
        trackActivityGameWin('blackjack', winnings, sessionId);
        toast({
          title: "You Win!",
          description: `You beat the dealer! Won ${winnings.toFixed(2)} coins!`
        });
      }).catch(() => {
        toast({
          title: "Error updating balance",
          description: "Please contact support.",
          variant: "destructive"
        });
      });
    } else if (playerTotal < currentDealerTotal) {
      setGameResult("lose");
      trackActivityGameLoss('blackjack', betAmount, sessionId);
      toast({
        title: "You Lose",
        description: "Dealer has a higher hand.",
        variant: "destructive"
      });
    } else {
      setGameResult("push");
      updateBalance.mutateAsync({
        coinsChange: betAmount
      }).then(() => {
        setBalance(prev => prev + betAmount);
        trackGameWin(betAmount, 'blackjack'); // Push is a win of the bet amount
        trackActivityGameWin('blackjack', betAmount, sessionId);
        toast({
          title: "Push!",
          description: "Same total. Bet returned."
        });
      }).catch(() => {
        toast({
          title: "Error updating balance",
          description: "Please contact support.",
          variant: "destructive"
        });
      });
    }

    setGameStarted(false);
  };

  const renderCard = (card: CardType, hidden = false) => {
    if (hidden) {
      return (
        <div className="w-16 h-24 bg-blue-600 rounded border-2 border-white flex items-center justify-center">
          <span className="text-white text-2xl">?</span>
        </div>
      );
    }

    const isRed = card.suit === "♥" || card.suit === "♦";
    return (
      <div className="w-16 h-24 bg-white rounded border-2 border-gray-300 flex flex-col items-center justify-center">
        <span className={`text-lg font-bold ${isRed ? "text-red-500" : "text-black"}`}>
          {card.value}
        </span>
        <span className={`text-lg ${isRed ? "text-red-500" : "text-black"}`}>
          {card.suit}
        </span>
      </div>
    );
  };

  useEffect(() => {
    return () => {
      if (user) {
        const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
        trackGameSession('blackjack', sessionDuration, sessionId);
      }
    };
  }, [user, trackGameSession, sessionId, sessionStartTime]);

  return (
    <Layout>
      {isBanned && <BannedOverlay reason={reason} />}
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Blackjack
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Get as close to 21 as possible without going over!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Game Table */}
            <div className="lg:col-span-2">
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="text-center">Blackjack Table</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Dealer's Hand */}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">
                      Dealer's Hand {showDealerCards && `(${dealerTotal})`}
                    </h3>
                    <div className="flex justify-center space-x-2">
                      {dealerCards.map((card, index) => (
                        <div key={index}>
                          {renderCard(card, index === 1 && !showDealerCards)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Player's Hand */}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">
                      Your Hand ({playerTotal})
                    </h3>
                    <div className="flex justify-center space-x-2 mb-6">
                      {playerCards.map((card, index) => (
                        <div key={index}>
                          {renderCard(card)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Game Result */}
                  {gameResult && (
                    <div className="text-center">
                      <Badge 
                        variant="secondary" 
                        className={`text-lg px-6 py-3 ${
                          ["win", "blackjack", "dealer_bust"].includes(gameResult) 
                            ? "glow-green" 
                            : gameResult === "push" 
                            ? "glow-blue" 
                            : "glow-red"
                        }`}
                      >
                        {gameResult === "win" && "You Win!"}
                        {gameResult === "lose" && "You Lose"}
                        {gameResult === "push" && "Push"}
                        {gameResult === "bust" && "Bust!"}
                        {gameResult === "blackjack" && "Blackjack!"}
                        {gameResult === "dealer_bust" && "Dealer Bust!"}
                        {gameResult === "dealer_blackjack" && "Dealer Blackjack"}
                      </Badge>
                    </div>
                  )}

                  {/* Game Controls */}
                  <div className="flex justify-center space-x-4">
                    {!gameStarted ? (
                      <Button 
                        onClick={startNewGame} 
                        className="glow-purple px-8 py-3"
                        size="lg"
                      >
                        Deal Cards ({currentBet} coins)
                      </Button>
                    ) : (
                      <>
                        <Button 
                          onClick={hit} 
                          className="glow-green px-6 py-3"
                          disabled={playerTotal >= 21}
                        >
                          Hit
                        </Button>
                        <Button 
                          onClick={stand} 
                          className="glow-blue px-6 py-3"
                        >
                          Stand
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
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

              {/* Bet Amount */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle>Bet Amount</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              {/* Game Rules */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle>Rules</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>• Get as close to 21 without going over</p>
                  <p>• Face cards (J, Q, K) = 10</p>
                  <p>• Aces = 11 or 1 (auto-adjusted)</p>
                  <p>• Dealer stands on 17</p>
                  <p>• Blackjack pays 3:2</p>
                  <p>• Regular wins pay 2:1</p>
                </CardContent>
              </Card>

              {/* Payouts */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle>Payouts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Blackjack</span>
                    <span className="text-green-400">2.5x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Regular Win</span>
                    <span className="text-green-400">2x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Push</span>
                    <span className="text-blue-400">Bet Returned</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Blackjack;