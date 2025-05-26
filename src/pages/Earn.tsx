import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Play, Pause, Coins, Clock, Trophy, Gift } from "lucide-react";
import { useFarmingSessions } from "@/hooks/useFarmingSessions";

const Earn = () => {
  const [stakingAmount, setStakingAmount] = useState("");
  const {
    farmingSession,
    stakingSession,
    farmingProgress,
    stakingProgress,
    earningHistory,
    loading,
    startFarming,
    stopFarming,
    harvestFarming,
    startStaking,
    stopStaking,
    claimStaking
  } = useFarmingSessions();

  const handleStartStaking = () => {
    const amount = parseFloat(stakingAmount);
    if (!amount || amount <= 0) {
      return;
    }
    startStaking(amount);
    setStakingAmount("");
  };

  const canHarvest = farmingSession && farmingProgress >= 100;
  const canClaim = stakingSession && stakingProgress >= 100;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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
                Earn $ITLOG
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Farm and stake to earn exclusive $ITLOG tokens
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Token Farming */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Token Farming
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 itlog-token rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-black font-bold text-xl">₿</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Earn 0.02 $ITLOG every 5 minutes
                  </p>
                  <p className="text-lg font-semibold">
                    Status: {farmingSession ? 'Active' : 'Inactive'}
                  </p>
                </div>

                {farmingSession && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{farmingProgress.toFixed(1)}%</span>
                    </div>
                    <Progress value={farmingProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      {farmingProgress >= 100 ? 'Ready to harvest!' : `Next reward in ${Math.ceil((100 - farmingProgress) * 3)} seconds`}
                    </p>
                  </div>
                )}

                {canHarvest ? (
                  <Button 
                    onClick={harvestFarming}
                    className="w-full glow-gold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-black font-semibold"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Harvest Now
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      onClick={farmingSession ? stopFarming : startFarming}
                      className={`w-full ${farmingSession ? "border-red-500 text-red-400 hover:bg-red-500/10" : "glow-purple"}`}
                      variant={farmingSession ? "outline" : "default"}
                    >
                      {farmingSession ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Stop Farming
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Farming
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Token Staking */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Coins className="w-5 h-5 mr-2" />
                  Token Staking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Coins className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Stake PHP to earn $ITLOG tokens (50% of stake)
                  </p>
                  <p className="text-lg font-semibold">
                    Status: {stakingSession ? `Staking ₱${stakingSession.stake_amount?.toFixed(2)}` : 'Inactive'}
                  </p>
                </div>

                {stakingSession && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{stakingProgress.toFixed(1)}%</span>
                    </div>
                    <Progress value={stakingProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      {stakingProgress >= 100 ? 'Ready to claim!' : `Next reward in ${Math.ceil((100 - stakingProgress) * 3)} seconds`}
                    </p>
                  </div>
                )}

                {canClaim ? (
                  <Button 
                    onClick={claimStaking}
                    className="w-full glow-gold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-black font-semibold"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Claim Now
                  </Button>
                ) : !stakingSession ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="stake-amount">Stake Amount (PHP)</Label>
                      <Input
                        id="stake-amount"
                        type="number"
                        step="0.01"
                        placeholder="Enter amount to stake"
                        value={stakingAmount}
                        onChange={(e) => setStakingAmount(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleStartStaking}
                      className="w-full glow-green"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Staking
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={stopStaking}
                    variant="outline"
                    className="w-full border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Stop Staking
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Token Earning History */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Token Earning History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {earningHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No earnings yet. Start farming or staking to begin earning $ITLOG tokens!
                </p>
              ) : (
                <div className="space-y-3">
                  {earningHistory.map((earning) => (
                    <div key={earning.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          earning.session_type === 'farming' 
                            ? 'bg-purple-500' 
                            : 'bg-green-500'
                        }`}>
                          {earning.session_type === 'farming' ? 
                            <TrendingUp className="w-4 h-4 text-white" /> : 
                            <Coins className="w-4 h-4 text-white" />
                          }
                        </div>
                        <div>
                          <p className="font-semibold capitalize">{earning.session_type}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(earning.created_at).toLocaleString()}
                          </p>
                          {earning.stake_amount && (
                            <p className="text-xs text-muted-foreground">
                              Staked: ₱{earning.stake_amount.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gold-400">
                          +{earning.tokens_earned.toFixed(4)} $ITLOG
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Section */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 mt-8">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Token Farming</h4>
                <p className="text-sm text-muted-foreground">
                  Activate farming to automatically earn 0.02 $ITLOG tokens every 5 minutes. 
                  No staking required, just activate and let it run. Your progress is saved even if you navigate away.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Token Staking</h4>
                <p className="text-sm text-muted-foreground">
                  Stake your PHP balance to earn $ITLOG tokens. You'll earn 50% of your staked amount as $ITLOG tokens every 5 minutes. 
                  Your staked amount will be returned when you claim your rewards.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Earn;