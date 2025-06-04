import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useBannedCheck } from "@/hooks/useBannedCheck";
import BannedOverlay from "@/components/BannedOverlay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Play, Pause, Coins, Clock, Trophy, Gift } from "lucide-react";
import { useFarmingSessions } from "@/hooks/useFarmingSessions";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import QuestSystem from "@/components/QuestSystem";
import EggShop from "@/components/EggShop";
import Incubator from "@/components/Incubator";
import PetGarden from "@/components/PetGarden";
import { usePetSystem } from "@/hooks/usePetSystem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Earn = () => {
  const [stakingAmount, setStakingAmount] = useState("");
  const { isBanned, reason } = useBannedCheck();
  const [error, setError] = useState<string | null>(null);

  // Error boundary effect
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Page error:', event.error);
      setError('An error occurred. Please refresh the page.');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
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

  const { trackFarmingClaim, trackStaking } = useActivityTracker();
  const { activePetBoosts } = usePetSystem();

  const handleStartStaking = () => {
    const amount = parseFloat(stakingAmount);
    if (!amount || amount <= 0) {
      return;
    }
    startStaking(amount);
    trackStaking(amount);
    setStakingAmount("");
  };

  const handleHarvestFarming = async () => {
    await harvestFarming();
    // Track farming claim activity (0.002 base tokens, actual amount may be higher with boosts)
    trackFarmingClaim(0.002);
  };

  const handleClaimStaking = async () => {
    if (stakingSession?.stake_amount) {
      const rewardAmount = stakingSession.stake_amount * 0.0005;
      await claimStaking();
      // Track staking claim activity
      trackFarmingClaim(rewardAmount);
    }
  };

  const canHarvest = farmingSession && farmingProgress >= 100;
  const canClaim = stakingSession && stakingProgress >= 100;

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-white rounded"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        {isBanned && <BannedOverlay reason={reason} />}
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {isBanned && <BannedOverlay reason={reason} />}
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-gold-400 bg-clip-text text-transparent">
                Earn $ITLOG
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground px-4">
              Farm and stake to earn exclusive $ITLOG tokens
            </p>
          </div>

          {/* Quest System */}
          <div className="mb-6 sm:mb-8">
            <QuestSystem />
          </div>

          {/* Pet System */}
          <div className="mb-6 sm:mb-8">
            <Tabs defaultValue="farming" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                <TabsTrigger value="farming" className="text-xs sm:text-sm px-2 py-2 sm:px-3">
                  <span className="hidden sm:inline">Farming & Staking</span>
                  <span className="sm:hidden">Farming</span>
                </TabsTrigger>
                <TabsTrigger value="shop" className="text-xs sm:text-sm px-2 py-2 sm:px-3">Egg Shop</TabsTrigger>
                <TabsTrigger value="incubator" className="text-xs sm:text-sm px-2 py-2 sm:px-3">Incubator</TabsTrigger>
                <TabsTrigger value="garden" className="text-xs sm:text-sm px-2 py-2 sm:px-3">
                  <span className="hidden sm:inline">Pet Garden</span>
                  <span className="sm:hidden">Garden</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="farming" className="space-y-8">

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-8">
            {/* Token Farming */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Token Farming
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 itlog-token rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="text-black font-bold text-lg sm:text-xl">₿</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 px-2">
                    Earn 0.0021 $ITLOG every 5 minutes
                    {activePetBoosts.some(boost => boost.trait_type === 'farming_boost' || boost.trait_type === 'token_multiplier') && (
                      <span className="text-green-400 block sm:inline sm:ml-1">
                        (+ pet boosts!)
                      </span>
                    )}
                  </p>
                  <p className="text-sm sm:text-lg font-semibold">
                    Status: {farmingSession ? 'Active' : 'Inactive'}
                  </p>
                </div>

                {farmingSession && (
                  <div className="space-y-2 px-2 sm:px-0">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>Progress</span>
                      <span>{farmingProgress.toFixed(1)}%</span>
                    </div>
                    <Progress value={farmingProgress} className="h-2 sm:h-2.5" />
                    <p className="text-xs text-muted-foreground text-center leading-tight">
                      {farmingProgress >= 100 ? 'Ready to harvest!' : `Next reward in ${Math.ceil((100 - farmingProgress) * 3)} seconds`}
                    </p>
                  </div>
                )}

                {canHarvest ? (
                  <Button 
                    onClick={handleHarvestFarming}
                    className="w-full h-12 sm:h-auto glow-gold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-black font-semibold text-sm sm:text-base"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Harvest Now
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      onClick={farmingSession ? stopFarming : startFarming}
                      className={`w-full h-12 sm:h-auto text-sm sm:text-base ${farmingSession ? "border-red-500 text-red-400 hover:bg-red-500/10" : "glow-purple"}`}
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
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <Coins className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Token Staking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Coins className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 px-2">
                    Stake PHP to earn $ITLOG tokens (0.0005% of stake)
                  </p>
                  <p className="text-sm sm:text-lg font-semibold break-words">
                    Status: {stakingSession ? `Staking ₱${stakingSession.stake_amount?.toFixed(2)}` : 'Inactive'}
                  </p>
                </div>

                {stakingSession && (
                  <div className="space-y-2 px-2 sm:px-0">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>Progress</span>
                      <span>{stakingProgress.toFixed(1)}%</span>
                    </div>
                    <Progress value={stakingProgress} className="h-2 sm:h-2.5" />
                    <p className="text-xs text-muted-foreground text-center leading-tight">
                      {stakingProgress >= 100 ? 'Ready to claim!' : `Next reward in ${Math.ceil((100 - stakingProgress) * 3)} seconds`}
                    </p>
                  </div>
                )}

                {canClaim ? (
                  <Button 
                    onClick={handleClaimStaking}
                    className="w-full h-12 sm:h-auto glow-gold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-black font-semibold text-sm sm:text-base"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Claim Now
                  </Button>
                ) : !stakingSession ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <Label htmlFor="stake-amount" className="text-sm">Stake Amount (PHP)</Label>
                      <Input
                        id="stake-amount"
                        type="number"
                        step="0.01"
                        placeholder="Enter amount to stake"
                        value={stakingAmount}
                        onChange={(e) => setStakingAmount(e.target.value)}
                        className="h-12 sm:h-auto text-base sm:text-sm"
                      />
                    </div>
                    <Button 
                      onClick={handleStartStaking}
                      className="w-full h-12 sm:h-auto glow-green text-sm sm:text-base"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Staking
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={stopStaking}
                    variant="outline"
                    className="w-full h-12 sm:h-auto border-red-500 text-red-400 hover:bg-red-500/10 text-sm sm:text-base"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Stop Staking
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

                {/* Token Earning History */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 mt-6 sm:mt-8">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Token Earning History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {earningHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-6 sm:py-8 text-sm sm:text-base px-4">
                  No earnings yet. Start farming or staking to begin earning $ITLOG tokens!
                </p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {earningHistory.map((earning) => (
                    <div key={earning.id} className="flex items-center justify-between p-3 sm:p-4 bg-background/50 rounded-lg border">
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          earning.session_type === 'farming' 
                            ? 'bg-purple-500' 
                            : 'bg-green-500'
                        }`}>
                          {earning.session_type === 'farming' ? 
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" /> : 
                            <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          }
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold capitalize text-sm sm:text-base">{earning.session_type}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {new Date(earning.created_at).toLocaleDateString()} {new Date(earning.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                          {earning.stake_amount && (
                            <p className="text-xs text-muted-foreground">
                              Staked: ₱{earning.stake_amount.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-gold-400 text-xs sm:text-sm">
                          +{earning.tokens_earned.toFixed(4)}
                        </p>
                        <p className="text-xs text-gold-400">$ITLOG</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

                {/* Info Section */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 mt-6 sm:mt-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Token Farming</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Activate farming to automatically earn 0.02 $ITLOG tokens every 5 minutes. 
                  No staking required, just activate and let it run. Your progress is saved even if you navigate away.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Token Staking</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Stake your PHP balance to earn $ITLOG tokens. You'll earn 50% of your staked amount as $ITLOG tokens every 5 minutes. 
                  Your staked amount will be returned when you claim your rewards.
                </p>
              </div>
              </CardContent>
            </Card>
              </TabsContent>

              <TabsContent value="shop">
                <EggShop />
              </TabsContent>

              <TabsContent value="incubator">
                <Incubator />
              </TabsContent>

              <TabsContent value="garden">
                <PetGarden />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Earn;