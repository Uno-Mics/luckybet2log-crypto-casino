import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, CreditCard, TrendingUp, MessageSquare } from "lucide-react";

type DepositWithProfile = {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  username: string;
};

type Appeal = {
  id: string;
  user_id: string;
  username: string;
  email: string;
  message: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
};

type WithdrawalWithProfile = {
  id: string;
  user_id: string;
  amount: number;
  withdrawal_type: string;
  withdrawal_method: string | null;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  status: string;
  created_at: string;
  admin_response: string | null;
  username: string;
};

type Profile = {
  id: string;
  user_id: string;
  username: string;
  wallet_id: string;
  php_balance: number;
  itlog_tokens: number;
  coins: number;
  is_admin: boolean;
  is_banned: boolean;
  is_suspended: boolean;
  ban_reason: string | null;
  created_at: string;
  updated_at: string;
};

const Admin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users } = useQuery<Profile[]>({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
  });

  // Fetch appeals
  const { data: appeals } = useQuery<Appeal[]>({
    queryKey: ['admin', 'appeals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appeals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Appeal[];
    },
  });

  // Fetch pending withdrawals and join with profiles manually
  const { data: withdrawals } = useQuery<WithdrawalWithProfile[]>({
    queryKey: ['admin', 'withdrawals'],
    queryFn: async () => {
      // First get pending withdrawals
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (withdrawalsError) throw withdrawalsError;
      if (!withdrawalsData || withdrawalsData.length === 0) return [];

      // Get user IDs from withdrawals
      const userIds = withdrawalsData.map(withdrawal => withdrawal.user_id);

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
      const withdrawalsWithProfiles: WithdrawalWithProfile[] = withdrawalsData.map(withdrawal => ({
        ...withdrawal,
        username: profilesMap[withdrawal.user_id] || 'Unknown User'
      }));

      return withdrawalsWithProfiles;
    },
  });

  // Fetch pending deposits and join with profiles manually
  const { data: deposits } = useQuery<DepositWithProfile[]>({
    queryKey: ['admin', 'deposits'],
    queryFn: async () => {
      // First get pending deposits
      const { data: depositsData, error: depositsError } = await supabase
        .from('deposits')
        .select('*')
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
          // Update user's PHP balance
          const { error: balanceError } = await supabase.rpc('update_user_balance', {
            p_user_id: deposit.user_id,
            p_php_change: deposit.amount,
          });

          if (balanceError) throw balanceError;

          // Track quest progress for deposit
          const { error: questError } = await supabase.rpc('update_quest_progress', {
            p_user_id: deposit.user_id,
            p_activity_type: 'deposit',
            p_activity_value: deposit.amount,
            p_game_type: null,
            p_metadata: { status: 'approved' }
          });

          if (questError) {
            console.error('Error tracking deposit quest:', questError);
          }
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

  // Process withdrawal mutation
  const processWithdrawal = useMutation({
    mutationFn: async ({ withdrawalId, approve, response }: { withdrawalId: string; approve: boolean; response?: string }) => {
      const { error } = await supabase
        .from('withdrawals')
        .update({
          status: approve ? 'approved' : 'rejected',
          admin_response: response || null,
          processed_at: new Date().toISOString(),
        })
        .eq('id', withdrawalId);

      if (error) throw error;

      // Get withdrawal details
      const { data: withdrawal } = await supabase
        .from('withdrawals')
        .select('user_id, amount')
        .eq('id', withdrawalId)
        .single();

      if (withdrawal) {
        if (approve) {
          // Deduct balance from user
          await supabase.rpc('update_user_balance', {
            p_user_id: withdrawal.user_id,
            p_php_change: -withdrawal.amount,
          });
        }

        // Create notification
        await supabase
          .from('withdrawal_notifications')
          .insert({
            user_id: withdrawal.user_id,
            withdrawal_id: withdrawalId,
            message: approve 
              ? `Your withdrawal of ₱${withdrawal.amount.toFixed(2)} has been approved and processed.`
              : `Your withdrawal of ₱${withdrawal.amount.toFixed(2)} has been rejected. ${response || 'No reason provided.'}`
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Withdrawal processed",
        description: "The withdrawal has been processed successfully.",
      });
    },
  });

  // Process appeal mutation
  const processAppeal = useMutation({
    mutationFn: async ({ appealId, approve, response }: { appealId: string; approve: boolean; response?: string }) => {
      const { error } = await supabase
        .from('appeals')
        .update({
          status: approve ? 'approved' : 'rejected',
          admin_response: response || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', appealId);

      if (error) throw error;

      if (approve) {
        // Get appeal details to unban user
        const { data: appeal } = await supabase
          .from('appeals')
          .select('user_id')
          .eq('id', appealId)
          .single();

        if (appeal) {
          // Unban the user
          await supabase
            .from('profiles')
            .update({ 
              is_banned: false, 
              ban_reason: null 
            })
            .eq('user_id', appeal.user_id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'appeals'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: "Appeal processed",
        description: "The appeal has been processed successfully.",
      });
    },
  });

  // Ban/unban user mutation
  const toggleUserBan = useMutation({
    mutationFn: async ({ userId, banned }: { userId: string; banned: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_banned: banned,
          ban_reason: banned ? "Banned by admin" : null
        })
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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="deposits">Deposit Requests</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
              <TabsTrigger value="appeals">Appeals</TabsTrigger>
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

            <TabsContent value="withdrawals" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pending Withdrawals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {withdrawals?.map((withdrawal) => (
                      <div key={withdrawal.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{withdrawal.username}</p>
                            <p className="text-sm text-muted-foreground">
                              ₱{Number(withdrawal.amount).toFixed(2)} via {withdrawal.withdrawal_method || 'Bank Transfer'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(withdrawal.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="bg-muted/50 p-3 rounded">
                          <p className="text-sm font-medium mb-1">Bank Details:</p>
                          <p className="text-sm text-muted-foreground">Bank: {withdrawal.bank_name}</p>
                          <p className="text-sm text-muted-foreground">Account Name: {withdrawal.bank_account_name}</p>
                          <p className="text-sm text-muted-foreground">Account Number: {withdrawal.bank_account_number}</p>
                        </div>

                        {withdrawal.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-500 text-red-400"
                              onClick={() => processWithdrawal.mutate({ 
                                withdrawalId: withdrawal.id, 
                                approve: false,
                                response: "Withdrawal request rejected by admin."
                              })}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="glow-green"
                              onClick={() => processWithdrawal.mutate({ 
                                withdrawalId: withdrawal.id, 
                                approve: true,
                                response: "Withdrawal approved and processed."
                              })}
                            >
                              Approve & Process
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                    {!withdrawals?.length && (
                      <p className="text-center text-muted-foreground py-8">
                        No pending withdrawals
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appeals" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Ban Appeals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appeals?.map((appeal) => (
                      <div key={appeal.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{appeal.username}</p>
                            <p className="text-sm text-muted-foreground">{appeal.email}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={
                                appeal.status === 'pending' ? 'default' :
                                appeal.status === 'approved' ? 'default' : 'destructive'
                              }
                              className={
                                appeal.status === 'pending' ? 'bg-yellow-600' :
                                appeal.status === 'approved' ? 'bg-green-600' : ''
                              }
                            >
                              {appeal.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {new Date(appeal.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-1">Appeal Message:</p>
                          <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                            {appeal.message}
                          </p>
                        </div>

                        {appeal.admin_response && (
                          <div>
                            <p className="text-sm font-medium mb-1">Admin Response:</p>
                            <p className="text-sm text-muted-foreground bg-blue-500/10 p-2 rounded">
                              {appeal.admin_response}
                            </p>
                          </div>
                        )}

                        {appeal.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-500 text-red-400"
                              onClick={() => processAppeal.mutate({ 
                                appealId: appeal.id, 
                                approve: false,
                                response: "Appeal rejected by admin."
                              })}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="glow-green"
                              onClick={() => processAppeal.mutate({ 
                                appealId: appeal.id, 
                                approve: true,
                                response: "Appeal approved. Account has been unbanned."
                              })}
                            >
                              Approve & Unban
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                    {!appeals?.length && (
                      <p className="text-center text-muted-foreground py-8">
                        No appeals submitted
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
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                    <p className="text-sm text-muted-foreground mb-1">Pending Appeals</p>
                    <p className="text-3xl font-bold text-orange-400">
                      {appeals?.filter(appeal => appeal.status === 'pending').length || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                  <CardContent className="p-6 text-center">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-red-400" />
                    <p className="text-sm text-muted-foreground mb-1">Pending Withdrawals</p>
                    <p className="text-3xl font-bold text-red-400">{withdrawals?.length || 0}</p>
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