
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Gamepad2, 
  TrendingUp, 
  Coins, 
  Crown,
  Zap,
  Star,
  Wallet
} from "lucide-react";

const Index = () => {
  const featuredGames = [
    {
      id: "mines",
      name: "Mines",
      description: "Avoid the mines and collect treasures",
      icon: "💣",
      href: "/games/mines",
      gradient: "from-red-500 to-orange-500"
    },
    {
      id: "wheel",
      name: "Wheel of Fortune",
      description: "Spin the wheel for instant wins",
      icon: "🎡",
      href: "/games/wheel",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: "slots",
      name: "Fortune Reels",
      description: "3-reel slot machine with massive payouts",
      icon: "🎰",
      href: "/games/slots",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: "blackjack",
      name: "Blackjack",
      description: "Beat the dealer with 21",
      icon: "🃏",
      href: "/games/blackjack",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      id: "dice",
      name: "Dice Roll",
      description: "Roll the dice and win big",
      icon: "🎲",
      href: "/games/dice",
      gradient: "from-yellow-500 to-amber-500"
    }
  ];

  const stats = [
    { label: "Total Players", value: "12,847", icon: Star },
    { label: "Games Played", value: "2.4M", icon: Gamepad2 },
    { label: "Total Winnings", value: "₱45.2M", icon: Crown },
    { label: "$ITLOG Distributed", value: "8,432", icon: Zap }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-gold-600/20 blur-3xl"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-400 via-gold-400 to-green-400 bg-clip-text text-transparent">
                  LuckyBet2Log
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                The ultimate crypto casino experience with exclusive $ITLOG token rewards.
                Play, earn, and win big in our provably fair games!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/games">
                <Button size="lg" className="glow-purple bg-primary hover:bg-primary/90 text-lg px-8 py-6">
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  Start Playing
                </Button>
              </Link>
              <Link to="/earn">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 neon-border">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Earn $ITLOG
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardContent className="p-6 text-center">
                      <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Games */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Featured Games</h2>
              <p className="text-xl text-muted-foreground">
                Experience the thrill with our collection of provably fair casino games
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredGames.map((game, index) => (
                <Card key={game.id} className="group bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${game.gradient} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {game.icon}
                    </div>
                    <CardTitle className="text-xl">{game.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">{game.description}</p>
                    <Link to={game.href}>
                      <Button className="w-full group-hover:glow-purple transition-all duration-300">
                        Play Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* $ITLOG Token Section */}
        <section className="py-20 bg-gradient-to-r from-gold-600/10 to-amber-600/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 itlog-token rounded-full text-3xl mb-6">
                <Coins className="w-10 h-10 text-black" />
              </div>
              <h2 className="text-4xl font-bold mb-4">Exclusive $ITLOG Token</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Every game offers a chance to win our exclusive $ITLOG token! 
                From 0-10% chance per game, with massive rewards of 10,000 to 1,000,000 tokens based on your bet.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/earn">
                  <Button size="lg" className="glow-gold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-black font-semibold">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Start Farming
                  </Button>
                </Link>
                <Link to="/wallet">
                  <Button variant="outline" size="lg" className="border-gold-500 text-gold-400 hover:bg-gold-500/10">
                    <Wallet className="w-5 h-5 mr-2" />
                    View Wallet
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
