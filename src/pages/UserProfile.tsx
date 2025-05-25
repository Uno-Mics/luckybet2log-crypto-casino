
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Wallet, Coins, TrendingUp } from "lucide-react";

const UserProfile = () => {
  // Mock user data
  const userData = {
    username: "CryptoGamer123",
    walletId: "0x1234...5678",
    phpBalance: 1000.00,
    coins: 1000.00,
    itlogTokens: 25.50,
    level: 5,
    totalGamesPlayed: 247,
    totalWinnings: 15420.50,
    joinDate: "2024-01-15"
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-gold-400 bg-clip-text text-transparent">
                User Profile
              </span>
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-1">
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-gold-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{userData.username}</CardTitle>
                  <Badge variant="secondary" className="w-fit mx-auto">
                    Level {userData.level}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Wallet ID</p>
                    <p className="font-mono text-sm break-all">{userData.walletId}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-semibold">{new Date(userData.joinDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Games Played</p>
                    <p className="font-semibold">{userData.totalGamesPlayed.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Balances */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-card/50 backdrop-blur-sm border-green-500/30 glow-green">
                  <CardContent className="p-6 text-center">
                    <Wallet className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <p className="text-sm text-muted-foreground mb-1">PHP Balance</p>
                    <p className="text-2xl font-bold text-green-400">₱{userData.phpBalance.toFixed(2)}</p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-blue-500/30 glow-blue">
                  <CardContent className="p-6 text-center">
                    <Coins className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <p className="text-sm text-muted-foreground mb-1">Coins</p>
                    <p className="text-2xl font-bold text-blue-400">{userData.coins.toFixed(2)}</p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-gold-500/30 glow-gold">
                  <CardContent className="p-6 text-center">
                    <div className="w-8 h-8 itlog-token rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-black font-bold text-sm">₿</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">$ITLOG Tokens</p>
                    <p className="text-2xl font-bold text-gold-400">{userData.itlogTokens.toFixed(2)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Stats */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Winnings</p>
                      <p className="text-2xl font-bold text-green-400">₱{userData.totalWinnings.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Games Played</p>
                      <p className="text-2xl font-bold">{userData.totalGamesPlayed}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Win Rate</p>
                      <p className="text-2xl font-bold text-blue-400">68%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Biggest Win</p>
                      <p className="text-2xl font-bold text-purple-400">₱5,250.00</p>
                    </div>
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

export default UserProfile;
