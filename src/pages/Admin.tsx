import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, CreditCard, TrendingUp, MessageSquare, Trash2, DollarSign, AlertTriangle, UserX, Zap } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [customPhpAmount, setCustomPhpAmount] = useState("");
  const [customCoinsAmount, setCustomCoinsAmount] = useState("");
  const [customItlogAmount, setCustomItlogAmount] = useState("");

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

      // Get deposit details
      const { data: deposit } = await supabase
        .from('deposits')
        .select('user_id, amount')
        .eq('id', depositId)
        .single();

      if (deposit) {
        if (approve) {
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

        // Create notification
        await supabase
          .from('deposit_notifications')
          .insert({
            user_id: deposit.user_id,
            deposit_id: depositId,
            message: approve 
              ? `Your deposit of ₱${deposit.amount.toFixed(2)} has been approved and added to your account.`
              : `Your deposit of ₱${deposit.amount.toFixed(2)} has been rejected. Please contact support for assistance.`
          });
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

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      try {
        const { data, error } = await supabase.rpc('admin_delete_user', {
          target_user_id: userId
        });

        if (error) {
          console.error('Supabase RPC error:', error);
          throw new Error(`Database error: ${error.message}`);
        }

        console.log('Delete user response:', data);
        return data as { success: boolean; error?: string; error_detail?: string; message?: string; user_id?: string };
      } catch (error) {
        console.error('Delete user error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Delete user success:', data);
      
      if (data?.success) {
        queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'deposits'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawals'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'appeals'] });
        
        toast({
          title: "User deleted successfully",
          description: `User and all associated data have been permanently deleted.`,
        });
      } else {
        console.error('Delete user failed:', data);
        toast({
          title: "Error deleting user",
          description: data?.error || data?.error_detail || "An error occurred while deleting the user.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      console.error('Delete user mutation error:', error);
      toast({
        title: "Error deleting user",
        description: error?.message || "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Give custom amounts mutation
  const giveCustomAmounts = useMutation({
    mutationFn: async ({ 
      userIds, 
      phpAmount, 
      coinsAmount, 
      itlogAmount 
    }: { 
      userIds: string[]; 
      phpAmount: number; 
      coinsAmount: number; 
      itlogAmount: number; 
    }) => {
      const results = [];
      
      for (const userId of userIds) {
        const { error } = await supabase.rpc('update_user_balance', {
          p_user_id: userId,
          p_php_change: phpAmount,
          p_coins_change: coinsAmount,
          p_itlog_change: itlogAmount,
        });

        if (error) {
          results.push({ userId, success: false, error: error.message });
        } else {
          results.push({ userId, success: true });
        }
      }
      
      return results;
    },
    onSuccess: (results) => {
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      // Invalidate all relevant queries to update UI immediately
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      
      // Invalidate profile queries for all affected users to update navbar and other components
      results.forEach(result => {
        if (result.success) {
          queryClient.invalidateQueries({ queryKey: ['profile', result.userId] });
        }
      });
      
      // Also invalidate the general profile query to ensure current user's data is fresh
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      // Invalidate any wallet-related queries
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      
      toast({
        title: "Custom amounts distributed",
        description: `Successfully updated ${successCount} users${failureCount > 0 ? `, ${failureCount} failed` : ''}. Balances have been updated.`,
      });
    },
  });

  // Reset all balances mutation
  const resetAllBalances = useMutation({
    mutationFn: async ({ balanceType }: { balanceType: 'php' | 'coins' | 'itlog' | 'all' }) => {
      console.log('Attempting to reset balances for type:', balanceType);
      
      let result;
      
      try {
        switch (balanceType) {
          case 'php':
            result = await supabase.rpc('reset_all_php_balances');
            break;
          case 'coins':
            result = await supabase.rpc('reset_all_coins');
            break;
          case 'itlog':
            result = await supabase.rpc('reset_all_itlog_tokens');
            break;
          case 'all':
            result = await supabase.rpc('reset_all_balances');
            break;
          default:
            throw new Error('Invalid balance type');
        }
        
        console.log('Reset result details:', {
          data: result.data,
          error: result.error,
          status: result.status,
          statusText: result.statusText
        });
        
        const { data, error } = result;
        
        if (error) {
          console.error('Supabase RPC error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw new Error(`Database error: ${error.message}${error.details ? ` - ${error.details}` : ''}`);
        }
        
        if (data === false) {
          throw new Error('Reset operation failed - the database function returned false. Check server logs for details.');
        }
        
        if (data !== true) {
          console.warn('Unexpected response from reset function:', data);
        }
        
        return { success: true, balanceType, result: data };
      } catch (error) {
        console.error('Reset balances error:', error);
        throw error;
      }
    },
    onSuccess: (result, variables) => {
      console.log('Reset balances success:', result);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      const balanceTypeMap = {
        'php': 'PHP balances',
        'coins': 'Coins',
        'itlog': 'ITLOG tokens',
        'all': 'all balances'
      };
      
      toast({
        title: "Balances reset successfully",
        description: `All user ${balanceTypeMap[variables.balanceType]} have been reset to zero.`,
      });
    },
    onError: (error: Error) => {
      console.error('Reset balances mutation error:', error);
      
      let errorMessage = "Failed to reset balances. Please try again.";
      
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        errorMessage = "Reset function not found. Please ensure database migrations are applied.";
      } else if (error.message.includes('Database error')) {
        errorMessage = "Database error occurred. Please check server logs.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error resetting balances",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Clear user data mutation
  const clearUserData = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      console.log('Clearing user data for:', userId);
      
      try {
        const { data, error } = await supabase.rpc('clear_user_data', { 
          p_user_id: userId 
        });
        
        console.log('Clear user data response:', { data, error });
        
        if (error) {
          console.error('Supabase RPC error:', error);
          throw new Error(`Database error: ${error.message || error.details || 'Unknown database error'}`);
        }
        
        // Check if the operation was successful
        if (data === true) {
          return { success: true, message: 'User data cleared successfully' };
        } else if (data === false) {
          throw new Error('Failed to clear user data - user may not exist or operation failed');
        } else {
          throw new Error('Unexpected response from clear user data operation');
        }
      } catch (error) {
        console.error('Clear user data error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Clear user data success:', data);
      
      // Invalidate all relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'deposits'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'appeals'] });
      
      toast({
        title: "User data cleared successfully",
        description: data?.message || "All user progress and data have been cleared successfully.",
      });
    },
    onError: (error: Error) => {
      console.error('Clear user data mutation error:', error);
      
      // Provide more specific error messages based on the error
      let errorMessage = "Failed to clear user data. Please try again.";
      
      if (error.message.includes('user may not exist')) {
        errorMessage = "User not found or may have already been deleted.";
      } else if (error.message.includes('Database error')) {
        errorMessage = "Database error occurred. Please check server logs.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error clearing user data",
        description: errorMessage,
        variant: "destructive",
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
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="deposits">Deposit Requests</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
              <TabsTrigger value="appeals">Appeals</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="giveaway">Custom Amounts</TabsTrigger>
              <TabsTrigger value="danger">Danger Zone</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      User Management
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedUsers.length} selected
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (selectedUsers.length === users?.length) {
                            // If all users are selected, deselect all
                            setSelectedUsers([]);
                          } else {
                            // Select all users
                            setSelectedUsers(users?.map(user => user.user_id) || []);
                          }
                        }}
                        className="ml-2"
                      >
                        {selectedUsers.length === users?.length ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users?.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.user_id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user.user_id]);
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== user.user_id));
                              }
                            }}
                            className="w-4 h-4"
                          />
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
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-orange-500 text-orange-400"
                              >
                                <UserX className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Clear User Data</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to clear all data and progress for user "{user.username}"? 
                                  This will remove:
                                  <ul className="mt-2 ml-4 list-disc">
                                    <li>All balances (PHP, Coins, ITLOG tokens)</li>
                                    <li>Game history and earnings</li>
                                    <li>Quest progress and rewards</li>
                                    <li>Pet collection and farming sessions</li>
                                    <li>Transaction history</li>
                                  </ul>
                                  <br />
                                  <strong>This action cannot be undone.</strong>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => clearUserData.mutate({ userId: user.user_id })}
                                  className="bg-orange-600 hover:bg-orange-700"
                                >
                                  Clear Data
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="bg-red-600 hover:bg-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to permanently delete user "{user.username}"? 
                                  This action will remove all user data including:
                                  <ul className="mt-2 ml-4 list-disc">
                                    <li>Profile and account information</li>
                                    <li>Wallet balance and transaction history</li>
                                    <li>Deposits and withdrawals</li>
                                    <li>Game activity and earnings</li>
                                    <li>Appeals and notifications</li>
                                    <li>Pet collection and farming sessions</li>
                                  </ul>
                                  <br />
                                  <strong>This action cannot be undone.</strong>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser.mutate({ userId: user.user_id })}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Permanently
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

            <TabsContent value="giveaway" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Give Custom Amounts to Users
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                    <p className="text-sm text-blue-400 font-medium mb-2">Selected Users: {selectedUsers.length}</p>
                    <p className="text-xs text-muted-foreground">
                      Select users from the "User Management" tab to distribute custom amounts.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">PHP Amount</label>
                      <input
                        type="number"
                        value={customPhpAmount}
                        onChange={(e) => setCustomPhpAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full p-2 border rounded-md bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Coins Amount</label>
                      <input
                        type="number"
                        value={customCoinsAmount}
                        onChange={(e) => setCustomCoinsAmount(e.target.value)}
                        placeholder="0"
                        className="w-full p-2 border rounded-md bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">$ITLOG Tokens</label>
                      <input
                        type="number"
                        value={customItlogAmount}
                        onChange={(e) => setCustomItlogAmount(e.target.value)}
                        placeholder="0.00000000"
                        step="0.00000001"
                        className="w-full p-2 border rounded-md bg-background"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      if (selectedUsers.length === 0) {
                        toast({
                          title: "No users selected",
                          description: "Please select at least one user from the User Management tab.",
                          variant: "destructive"
                        });
                        return;
                      }

                      giveCustomAmounts.mutate({
                        userIds: selectedUsers,
                        phpAmount: parseFloat(customPhpAmount) || 0,
                        coinsAmount: parseFloat(customCoinsAmount) || 0,
                        itlogAmount: parseFloat(customItlogAmount) || 0,
                      });
                    }}
                    disabled={selectedUsers.length === 0 || giveCustomAmounts.isPending}
                    className="w-full glow-green"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {giveCustomAmounts.isPending ? 'Distributing...' : `Distribute to ${selectedUsers.length} Users`}
                  </Button>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Positive amounts will be added to user balances</p>
                    <p>• Negative amounts will be deducted from user balances</p>
                    <p>• Leave fields empty or enter 0 to skip that currency</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="danger" className="space-y-6">
              <Card className="bg-red-500/5 backdrop-blur-sm border-red-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-400">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                    <p className="text-red-400 font-medium text-sm">
                      ⚠️ WARNING: These actions are irreversible and will affect ALL users!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Reset All User Balances</h3>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full">
                            Reset All PHP Balances
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reset All PHP Balances</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will set ALL users' PHP balance to ₱0.00. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => resetAllBalances.mutate({ balanceType: 'php' })}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Reset All PHP
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full">
                            Reset All Coins
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reset All Coins</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will set ALL users' coins balance to 0. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => resetAllBalances.mutate({ balanceType: 'coins' })}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Reset All Coins
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full">
                            Reset All $ITLOG Tokens
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reset All $ITLOG Tokens</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will set ALL users' $ITLOG token balance to 0. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => resetAllBalances.mutate({ balanceType: 'itlog' })}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Reset All $ITLOG
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Nuclear Options</h3>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full bg-red-700 hover:bg-red-800">
                            Reset ALL Balances
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reset ALL User Balances</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will set ALL users' PHP, Coins, and $ITLOG balances to 0. 
                              <br /><br />
                              <strong className="text-red-500">This is a nuclear option and cannot be undone!</strong>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => resetAllBalances.mutate({ balanceType: 'all' })}
                              className="bg-red-700 hover:bg-red-800"
                            >
                              RESET EVERYTHING
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <div className="bg-yellow-500/10 p-3 rounded border border-yellow-500/20">
                        <p className="text-yellow-400 text-xs">
                          Individual user data clearing is available in the User Management tab.
                        </p>
                      </div>
                    </div>
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