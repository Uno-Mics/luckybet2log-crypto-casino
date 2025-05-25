
import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpDown, Wallet as WalletIcon, Coins, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Wallet = () => {
  const [phpBalance, setPhpBalance] = useState(1000.00);
  const [coins, setCoins] = useState(1000.00);
  const [itlogTokens, setItlogTokens] = useState(25.50);
  const [convertAmount, setConvertAmount] = useState("");
  const { toast } = useToast();

  const handleConversion = (from: string, to: string) => {
    const amount = parseFloat(convertAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to convert.",
        variant: "destructive"
      });
      return;
    }

    if (from === "php" && to === "coins") {
      if (amount > phpBalance) {
        toast({
          title: "Insufficient balance",
          description: "You don't have enough PHP balance.",
          variant: "destructive"
        });
        return;
      }
      setPhpBalance(prev => parseFloat((prev - amount).toFixed(2)));
      setCoins(prev => parseFloat((prev + amount).toFixed(2)));
      toast({
        title: "Conversion successful",
        description: `Converted ₱${amount.toFixed(2)} to ${amount.toFixed(2)} coins.`
      });
    } else if (from === "coins" && to === "php") {
      if (amount > coins) {
        toast({
          title: "Insufficient balance",
          description: "You don't have enough coins.",
          variant: "destructive"
        });
        return;
      }
      setCoins(prev => parseFloat((prev - amount).toFixed(2)));
      setPhpBalance(prev => parseFloat((prev + amount).toFixed(2)));
      toast({
        title: "Conversion successful",
        description: `Converted ${amount.toFixed(2)} coins to ₱${amount.toFixed(2)}.`
      });
    } else if (from === "itlog" && to === "coins") {
      if (amount > itlogTokens) {
        toast({
          title: "Insufficient balance",
          description: "You don't have enough $ITLOG tokens.",
          variant: "destructive"
        });
        return;
      }
      const coinsAmount = amount * 5000; // 1 $ITLOG = 5000 coins
      setItlogTokens(prev => parseFloat((prev - amount).toFixed(2)));
      setCoins(prev => parseFloat((prev + coinsAmount).toFixed(2)));
      toast({
        title: "Conversion successful",
        description: `Converted ${amount.toFixed(2)} $ITLOG to ${coinsAmount.toFixed(2)} coins.`
      });
    }

    setConvertAmount("");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-gold-400 bg-clip-text text-transparent">
                Wallet
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage your balances and convert between currencies
            </p>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-card/50 backdrop-blur-sm border-green-500/30 glow-green">
              <CardContent className="p-6 text-center">
                <WalletIcon className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p className="text-sm text-muted-foreground mb-1">PHP Balance</p>
                <p className="text-3xl font-bold text-green-400">₱{phpBalance.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-blue-500/30 glow-blue">
              <CardContent className="p-6 text-center">
                <Coins className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <p className="text-sm text-muted-foreground mb-1">Coins</p>
                <p className="text-3xl font-bold text-blue-400">{coins.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-gold-500/30 glow-gold">
              <CardContent className="p-6 text-center">
                <div className="w-8 h-8 itlog-token rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-black font-bold text-sm">₿</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">$ITLOG Tokens</p>
                <p className="text-3xl font-bold text-gold-400">{itlogTokens.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Section */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowUpDown className="w-5 h-5 mr-2" />
                Currency Conversion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="php-coins" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="php-coins">PHP ↔ Coins</TabsTrigger>
                  <TabsTrigger value="itlog-coins">$ITLOG → Coins</TabsTrigger>
                  <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                </TabsList>

                <TabsContent value="php-coins" className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground">
                      Exchange Rate: 1 PHP = 1 Coin
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="Enter amount"
                        value={convertAmount}
                        onChange={(e) => setConvertAmount(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        onClick={() => handleConversion("php", "coins")}
                        className="glow-green"
                      >
                        PHP → Coins
                      </Button>
                      <Button 
                        onClick={() => handleConversion("coins", "php")}
                        variant="outline"
                        className="border-green-500 text-green-400"
                      >
                        Coins → PHP
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="itlog-coins" className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground">
                      Exchange Rate: 1 $ITLOG = 5,000 Coins
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="itlog-amount">$ITLOG Amount</Label>
                      <Input
                        id="itlog-amount"
                        type="number"
                        step="0.01"
                        placeholder="Enter $ITLOG amount"
                        value={convertAmount}
                        onChange={(e) => setConvertAmount(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={() => handleConversion("itlog", "coins")}
                      className="w-full glow-gold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-black font-semibold"
                    >
                      Convert $ITLOG → Coins
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="withdraw" className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground">
                      Withdraw your PHP balance to your bank account
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="withdraw-amount">Withdraw Amount (PHP)</Label>
                      <Input
                        id="withdraw-amount"
                        type="number"
                        step="0.01"
                        placeholder="Enter withdrawal amount"
                        value={convertAmount}
                        onChange={(e) => setConvertAmount(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={() => {
                        toast({
                          title: "Withdrawal request submitted",
                          description: "Your withdrawal will be processed within 24 hours."
                        });
                        setConvertAmount("");
                      }}
                      className="w-full glow-purple"
                    >
                      Submit Withdrawal Request
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Exchange Rates Info */}
          <Card className="bg-gradient-to-r from-gold-600/10 to-amber-600/10 border-gold-500/30 mt-8">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Exchange Rates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>1 PHP</span>
                  <span className="font-semibold">= 1 Coin</span>
                </div>
                <div className="flex justify-between">
                  <span>1 $ITLOG</span>
                  <span className="font-semibold">= 5,000 Coins</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Wallet;
