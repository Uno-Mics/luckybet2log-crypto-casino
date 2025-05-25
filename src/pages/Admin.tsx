import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, CreditCard, TrendingUp } from "lucide-react";

type DepositWithProfile = {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  username: string;
};

const Admin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch pending deposits and join with profiles manually
  const { data: deposits } = useQuery({
    queryKey: ['admin', 'deposits'],
    queryFn: async () => {
      // First get pending deposits
      const { data: depositsData, error: depositsError } = await supabase
        .from('deposits')
        .select('id, user_id, amount, payment_method, status, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (depositsError) throw depositsError;
      if (!depositsData || depositsData.length === 0) return [];

      // Get user IDs from deposits
      const userIds = depositsData.map(deposit => deposit.user_id);

      // Get profiles for those users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', userIds);
      
      if (profilesError) throw profilesError;

      // Create a map of user_id to username for quick lookup
      const profilesMap = (profilesData || []).reduce((acc, profile) => {
        acc[profile.user_id] = profile.username;
        return acc;
      }, {} as Record<string, string>);

      // Join the data manually
      const depositsWithProfiles: DepositWithProfile[] = depositsData.map(deposit => ({
        ...deposit,
        username: profilesMap[deposit.user_id] || 'Unknown User'
      }));

      return depositsWithProfiles;
    },
  });

  // Process deposit mutation
  const processDeposit = useMutation({
    mutationFn: async ({ depositId, approve }: { depositId: string; approve: boolean }) => {
      const { error } = await supabase
        .from('deposits')
        .update({
          status: approve ? 'approved' : 'rejected',
          processed_at: new Date().toISOString(),
        })
        .eq('id', depositId);

      if (error) throw error;

      if (approve) {
        // Get deposit details to add balance
        const { data: deposit } = await supabase
          .from('deposits')
          .select('user_id, amount')
          .eq('id', depositId)
          .single();

        if (deposit) {
          // Update user balance
          await supabase.rpc('update_user_balance', {
            p_user_id: deposit.user_id,
            p_php_change: deposit.amount,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'deposits'] });
      toast({
        title: "Deposit processed",
        description: "The deposit has been processed successfully.",
      });
    },
  });

  // Ban/unban user mutation
  const toggleUserBan = useMutation({
    mutationFn: async ({ userId, banned }: { userId: string; banned: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: banned })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: "User status updated",
        description: "The user's ban status has been updated.",
      });
    },
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-gold-400 bg-clip-text text-transparent">
                Admin Dashboard
              </span>
            </h1>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="deposits">Deposit Requests</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users?.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-semibold">{user.username}</p>
                            <p className="text-sm text-muted-foreground">{user.wallet_id}</p>
                          </div>
                          <div className="flex gap-2">
                            {user.is_admin && <Badge variant="secondary">Admin</Badge>}
                            {user.is_banned && <Badge variant="destructive">Banned</Badge>}
                            {user.is_suspended && <Badge variant="outline">Suspended</Badge>}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">₱{Number(user.php_balance).toFixed(2)}</span>
                          <Button
                            variant={user.is_banned ? "outline" : "destructive"}
                            size="sm"
                            onClick={() => toggleUserBan.mutate({ 
                              userId: user.user_id, 
                              banned: !user.is_banned 
                            })}
                          >
                            {user.is_banned ? 'Unban' : 'Ban'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deposits" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pending Deposits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deposits?.map((deposit) => (
                      <div key={deposit.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold">{deposit.username}</p>
                          <p className="text-sm text-muted-foreground">
                            ₱{Number(deposit.amount).toFixed(2)} via {deposit.payment_method}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(deposit.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-400"
                            onClick={() => processDeposit.mutate({ 
                              depositId: deposit.id, 
                              approve: false 
                            })}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="glow-green"
                            onClick={() => processDeposit.mutate({ 
                              depositId: deposit.id, 
                              approve: true 
                            })}
                          >
                            Approve
                          </Button>
                        </div>
                      </div>
                    ))}
                    {!deposits?.length && (
                      <p className="text-center text-muted-foreground py-8">
                        No pending deposits
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-green-400">{users?.length || 0}</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                  <CardContent className="p-6 text-center">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <p className="text-sm text-muted-foreground mb-1">Pending Deposits</p>
                    <p className="text-3xl font-bold text-blue-400">{deposits?.length || 0}</p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                    <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
                    <p className="text-3xl font-bold text-purple-400">
                      ₱{users?.reduce((sum, user) => sum + Number(user.php_balance), 0).toFixed(2) || '0.00'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
