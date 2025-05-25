
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Games = () => {
  const games = [
    {
      id: "mines",
      name: "Mines",
      description: "Navigate through a minefield to collect treasures. Cash out before hitting a mine!",
      icon: "💣",
      href: "/games/mines",
      gradient: "from-red-500 to-orange-500",
      difficulty: "Medium",
      maxWin: "x5000"
    },
    {
      id: "wheel",
      name: "Wheel of Fortune",
      description: "Spin the wheel and bet on colors, numbers, or multipliers for instant wins!",
      icon: "🎡",
      href: "/games/wheel",
      gradient: "from-purple-500 to-pink-500",
      difficulty: "Easy",
      maxWin: "x50"
    },
    {
      id: "slots",
      name: "Fortune Reels",
      description: "Classic 3-reel slot machine with crypto symbols, wilds, and bonus rounds!",
      icon: "🎰",
      href: "/games/slots",
      gradient: "from-blue-500 to-cyan-500",
      difficulty: "Easy",
      maxWin: "x10000"
    },
    {
      id: "blackjack",
      name: "Blackjack",
      description: "Beat the dealer by getting as close to 21 as possible without going over!",
      icon: "🃏",
      href: "/games/blackjack",
      gradient: "from-green-500 to-emerald-500",
      difficulty: "Hard",
      maxWin: "x2"
    },
    {
      id: "dice",
      name: "Dice Roll",
      description: "Roll a number from 1-100 with customizable risk ranges and multipliers!",
      icon: "🎲",
      href: "/games/dice",
      gradient: "from-yellow-500 to-amber-500",
      difficulty: "Medium",
      maxWin: "x9900"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-gold-400 bg-clip-text text-transparent">
                Casino Games
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose from our collection of provably fair games. Each game offers a chance to win exclusive $ITLOG tokens!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {games.map((game) => (
              <Card key={game.id} className="group bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${game.gradient} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {game.icon}
                  </div>
                  <CardTitle className="text-2xl">{game.name}</CardTitle>
                  <div className="flex justify-between items-center text-sm">
                    <span className="px-2 py-1 bg-primary/20 rounded-full">{game.difficulty}</span>
                    <span className="text-green-400 font-semibold">Max Win: {game.maxWin}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">{game.description}</p>
                  <Link to={game.href}>
                    <Button className="w-full group-hover:glow-purple transition-all duration-300">
                      Play {game.name}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* $ITLOG Info */}
          <Card className="bg-gradient-to-r from-gold-600/10 to-amber-600/10 border-gold-500/30">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 itlog-token rounded-full text-2xl mb-4">
                🪙
              </div>
              <h3 className="text-2xl font-bold mb-4">$ITLOG Token Rewards</h3>
              <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
                Every game has a 0-10% chance to win exclusive $ITLOG tokens! 
                Rewards range from 10,000 to 1,000,000 tokens based on your bet multiplier.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/earn">
                  <Button size="lg" className="glow-gold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-black font-semibold">
                    Learn More About $ITLOG
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Games;
