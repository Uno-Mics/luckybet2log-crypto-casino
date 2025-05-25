
import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Upload, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Deposit = () => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const predefinedAmounts = [100, 250, 500, 1000, 2500, 5000];
  
  const paymentMethods = [
    { value: "gcash", label: "GCash" },
    { value: "paymaya", label: "PayMaya" },
    { value: "bpi", label: "BPI Bank" },
    { value: "bdo", label: "BDO Bank" },
    { value: "unionbank", label: "Union Bank" },
    { value: "metrobank", label: "Metrobank" }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }
      setReceipt(file);
      toast({
        title: "Receipt uploaded",
        description: `Uploaded: ${file.name}`
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid deposit amount.",
        variant: "destructive"
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: "Payment method required",
        description: "Please select a payment method.",
        variant: "destructive"
      });
      return;
    }

    if (!receipt) {
      toast({
        title: "Receipt required",
        description: "Please upload your payment receipt.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitted(true);
    toast({
      title: "Deposit request submitted!",
      description: "Your deposit will be processed within 24 hours after verification."
    });
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 flex items-center justify-center">
          <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-green-500/30 glow-green">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Deposit Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Your deposit request of ₱{parseFloat(amount).toFixed(2)} has been submitted successfully. 
                Our admin team will verify your receipt and process the deposit within 24 hours.
              </p>
              <Button 
                onClick={() => {
                  setIsSubmitted(false);
                  setAmount("");
                  setPaymentMethod("");
                  setReceipt(null);
                }}
                className="glow-purple"
              >
                Make Another Deposit
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-gold-400 bg-clip-text text-transparent">
                Top-up / Deposit
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Add funds to your account to start playing
            </p>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Deposit Funds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Amount Selection */}
                <div className="space-y-4">
                  <Label htmlFor="amount">Deposit Amount (PHP)</Label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {predefinedAmounts.map((preset) => (
                      <Button
                        key={preset}
                        type="button"
                        variant={amount === preset.toString() ? "default" : "outline"}
                        onClick={() => setAmount(preset.toString())}
                        className={amount === preset.toString() ? "glow-purple" : ""}
                      >
                        ₱{preset.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="Enter custom amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Instructions */}
                {paymentMethod && (
                  <Card className="bg-blue-500/10 border-blue-500/30">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Payment Instructions</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>1. Send ₱{amount || "XX.XX"} to our {paymentMethods.find(m => m.value === paymentMethod)?.label} account</p>
                        <p>2. Account Details: 09XX-XXX-XXXX (LuckyBet2Log)</p>
                        <p>3. Include your username in the transaction message</p>
                        <p>4. Upload the receipt below</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Receipt Upload */}
                <div className="space-y-2">
                  <Label htmlFor="receipt">Upload Payment Receipt</Label>
                  <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="receipt"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="receipt" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      {receipt ? (
                        <div>
                          <p className="text-green-400 font-semibold">{receipt.name}</p>
                          <p className="text-sm text-muted-foreground">Click to change file</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-muted-foreground">Click to upload receipt</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Supports: JPG, PNG, PDF (Max 5MB)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full glow-purple"
                  disabled={!amount || !paymentMethod || !receipt}
                >
                  Submit Deposit Request
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 mt-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Important Notes</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Minimum deposit: ₱100</li>
                <li>• Deposits are usually processed within 24 hours</li>
                <li>• Make sure to upload a clear receipt for faster processing</li>
                <li>• Include your username in the payment reference</li>
                <li>• Contact support if your deposit is not processed within 24 hours</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Deposit;
