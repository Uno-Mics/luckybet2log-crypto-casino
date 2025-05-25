
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Play, Pause, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Earn = () => {
  const [farmingActive, setFarmingActive] = useState(false);
  const [stakingActive, setStakingActive] = useState(false);
  const [farmingProgress, setFarmingProgress] = useState(0);
  const [stakingProgress, setStakingProgress] = useState(0);
  const [stakingAmount, setStakingAmount] = useState("");
  const [farmingTokens, setFarmingTokens] = useState(0);
  const [stakingTokens, setStakingTokens] = useState(0);
  const { toast } = useToast();

  // Farming timer (5 minutes = 300 seconds)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (farmingActive) {
      interval = setInterval(() => {
        setFarmingProgress(prev => {
          if (prev >= 100) {
            setFarmingTokens(prevTokens => prevTokens + 0.002);
            toast({
              title: "Farming reward earned!",
              description: "You earned 0.002 $ITLOG tokens!"
            });
            return 0;
          }
          return prev + (100 / 300); // 300 seconds = 5 minutes
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [farmingActive, toast]);

  // Staking timer (5 minutes = 300 seconds)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (stakingActive && stakingAmount) {
      const stakingValue = parseFloat(stakingAmount);
      const tokensPerCycle = (stakingValue / 1000) * 0.01; // Example calculation
      
      interval = setInterval(() => {
        setStakingProgress(prev => {
          if (prev >= 100) {
            setStakingTokens(prevTokens => prevTokens + tokensPerCycle);
            toast({
              title: "Staking reward earned!",
              description: `You earned ${tokensPerCycle.toFixed(4)} $ITLOG tokens!`
            });
            return 0;
          }
          return prev + (100 / 300); // 300 seconds = 5 minutes
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [stakingActive, stakingAmount, toast]);

  const toggleFarming = () => {
    setFarmingActive(!farmingActive);
    if (!farmingActive) {
      setFarmingProgress(0);
      toast({
        title: "Token farming activated!",
        description: "You will earn 0.002 $ITLOG every 5 minutes."
      });
    } else {
      toast({
        title: "Token farming stopped",
        description: "Farming has been deactivated."
      });
    }
  };

  const startStaking = () => {
    const amount = parseFloat(stakingAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid staking amount.",
        variant: "destructive"
      });
      return;
    }

    setStakingActive(true);
    setStakingProgress(0);
    toast({
      title: "Staking activated!",
      description: `Staking ₱${amount.toFixed(2)} - earning rewards every 5 minutes.`
    });
  };

  const stopStaking = () => {
    setStakingActive(false);
    setStakingProgress(0);
    toast({
      title: "Staking stopped",
      description: "Staking has been deactivated."
    });
  };

  const cashoutEarnings = () => {
    const totalEarnings = farmingTokens + stakingTokens;
    if (totalEarnings <= 0) {
      toast({
        title: "No earnings to cash out",
        description: "You don't have any earned tokens to cash out.",
        variant: "destructive"
      });
      return;
    }

    // Reset earnings
    setFarmingTokens(0);
    setStakingTokens(0);
    
    toast({
      title: "Earnings cashed out!",
      description: `${totalEarnings.toFixed(4)} $ITLOG tokens have been added to your wallet.`
    });
  };

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

          {/* Earnings Summary */}
          <Card className="bg-gradient-to-r from-gold-600/10 to-amber-600/10 border-gold-500/30 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Total Earned</h3>
                  <p className="text-3xl font-bold text-gold-400">
                    {(farmingTokens + stakingTokens).toFixed(4)} $ITLOG
                  </p>
                </div>
                <Button 
                  onClick={cashoutEarnings}
                  className="glow-gold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-black font-semibold"
                  disabled={farmingTokens + stakingTokens <= 0}
                >
                  <Coins className="w-4 h-4 mr-2" />
                  Cash Out
                </Button>
              </div>
            </CardContent>
          </Card>

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
                    Earn 0.002 $ITLOG every 5 minutes
                  </p>
                  <p className="text-lg font-semibold">
                    Farmed: {farmingTokens.toFixed(4)} $ITLOG
                  </p>
                </div>

                {farmingActive && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{farmingProgress.toFixed(1)}%</span>
                    </div>
                    <Progress value={farmingProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      Next reward in {Math.ceil((100 - farmingProgress) * 3)} seconds
                    </p>
                  </div>
                )}

                <Button 
                  onClick={toggleFarming}
                  className={`w-full ${farmingActive ? "glow-green" : "glow-purple"}`}
                  variant={farmingActive ? "default" : "outline"}
                >
                  {farmingActive ? (
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
                    Stake PHP to earn $ITLOG tokens
                  </p>
                  <p className="text-lg font-semibold">
                    Staked: {stakingTokens.toFixed(4)} $ITLOG
                  </p>
                </div>

                {!stakingActive ? (
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
                      onClick={startStaking}
                      className="w-full glow-green"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Staking
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Currently staking: ₱{stakingAmount}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{stakingProgress.toFixed(1)}%</span>
                      </div>
                      <Progress value={stakingProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground text-center">
                        Next reward in {Math.ceil((100 - stakingProgress) * 3)} seconds
                      </p>
                    </div>
                    <Button 
                      onClick={stopStaking}
                      variant="outline"
                      className="w-full border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Stop Staking
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 mt-8">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Token Farming</h4>
                <p className="text-sm text-muted-foreground">
                  Activate farming to automatically earn 0.002 $ITLOG tokens every 5 minutes. 
                  No staking required, just activate and let it run in the background.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Token Staking</h4>
                <p className="text-sm text-muted-foreground">
                  Stake your PHP balance to earn $ITLOG tokens. The more you stake, the more you earn. 
                  Rewards are calculated based on your staked amount and distributed every 5 minutes.
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
