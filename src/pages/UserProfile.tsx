
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Wallet, Coins, TrendingUp } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";

const UserProfile = () => {
  const { user } = useAuth();
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
            <p className="text-muted-foreground">Unable to load your profile data.</p>
          </div>
        </div>
      </Layout>
    );
  }

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
                  <CardTitle className="text-2xl">{profile.username}</CardTitle>
                  {profile.is_admin && (
                    <Badge variant="secondary" className="w-fit mx-auto bg-gold-500 text-black">
                      Admin
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Wallet ID</p>
                    <p className="font-mono text-sm break-all">{profile.wallet_id}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-semibold">{new Date(profile.created_at).toLocaleDateString()}</p>
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
                    <p className="text-2xl font-bold text-green-400">₱{Number(profile.php_balance).toFixed(2)}</p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-blue-500/30 glow-blue">
                  <CardContent className="p-6 text-center">
                    <Coins className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <p className="text-sm text-muted-foreground mb-1">Coins</p>
                    <p className="text-2xl font-bold text-blue-400">{Number(profile.coins).toFixed(2)}</p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-gold-500/30 glow-gold">
                  <CardContent className="p-6 text-center">
                    <div className="w-8 h-8 itlog-token rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-black font-bold text-sm">₿</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">$ITLOG Tokens</p>
                    <p className="text-2xl font-bold text-gold-400">{Number(profile.itlog_tokens).toFixed(2)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Stats */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Account Status</p>
                      <p className={`text-2xl font-bold ${profile.is_banned ? 'text-red-400' : profile.is_suspended ? 'text-yellow-400' : 'text-green-400'}`}>
                        {profile.is_banned ? 'Banned' : profile.is_suspended ? 'Suspended' : 'Active'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Account Type</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {profile.is_admin ? 'Admin' : 'Player'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Value</p>
                      <p className="text-2xl font-bold text-blue-400">
                        ₱{(Number(profile.php_balance) + Number(profile.coins) + (Number(profile.itlog_tokens) * 5000)).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="text-lg font-bold">
                        {new Date(profile.updated_at).toLocaleDateString()}
                      </p>
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
