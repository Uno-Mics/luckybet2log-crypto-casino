
import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface GameHistoryEntry {
  id: string;
  game_type: string;
  bet_amount: number;
  result_type: 'win' | 'loss' | 'push';
  win_amount: number;
  loss_amount: number;
  multiplier: number;
  game_details: any;
  created_at: string;
}

export const useGameHistory = (gameType?: string) => {
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const gameCounterRef = useRef(0);
  const subscriptionRef = useRef<any>(null);

  const fetchHistory = async (limit = 50) => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('game_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (gameType) {
        query = query.eq('game_type', gameType);
      }

      const { data, error } = await query;

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching game history:', error);
      toast({
        title: "Error",
        description: "Failed to load game history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addHistoryEntry = async (entry: Omit<GameHistoryEntry, 'id' | 'created_at'>) => {
    if (!user) return;

    try {
      console.log('Adding game history entry:', entry);
      
      const { data, error } = await supabase
        .from('game_history')
        .insert({
          user_id: user.id,
          ...entry
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      console.log('Successfully inserted game history:', data);

      // Manually add to state immediately for instant UI update
      if (data && (!gameType || data.game_type === gameType)) {
        console.log('Immediately adding to state:', data);
        setHistory(prevHistory => {
          const exists = prevHistory.some(entry => entry.id === data.id);
          if (!exists) {
            return [data, ...prevHistory];
          }
          return prevHistory;
        });
      }

      // Increment game counter
      gameCounterRef.current += 1;

      // Force a component re-render
      setRefreshTrigger(prev => prev + 1);

      // Refresh history every 5 games for consistency (fallback)
      if (gameCounterRef.current % 5 === 0) {
        console.log('Auto-refreshing game history after 5 games...');
        setTimeout(() => fetchHistory(), 1000);
      }

      return data;
    } catch (error) {
      console.error('Error adding game history entry:', error);
      toast({
        title: "Error",
        description: "Failed to save game result",
        variant: "destructive"
      });
      throw error;
    }
  };

  const clearHistory = async (gameTypeToClean?: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from('game_history')
        .delete()
        .eq('user_id', user.id);

      if (gameTypeToClean) {
        query = query.eq('game_type', gameTypeToClean);
      }

      const { error } = await query;
      if (error) throw error;

      setHistory([]);
      toast({
        title: "Success",
        description: "Game history cleared",
      });
    } catch (error) {
      console.error('Error clearing game history:', error);
      toast({
        title: "Error",
        description: "Failed to clear game history",
        variant: "destructive"
      });
    }
  };

  const getStats = () => {
    const totalGames = history.length;
    const wins = history.filter(h => h.result_type === 'win').length;
    const losses = history.filter(h => h.result_type === 'loss').length;
    const pushes = history.filter(h => h.result_type === 'push').length;
    const totalWinAmount = history.reduce((sum, h) => sum + (h.win_amount || 0), 0);
    const totalLossAmount = history.reduce((sum, h) => sum + (h.loss_amount || 0), 0);
    const netProfit = totalWinAmount - totalLossAmount;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

    return {
      totalGames,
      wins,
      losses,
      pushes,
      totalWinAmount,
      totalLossAmount,
      netProfit,
      winRate
    };
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
      
      // Set up real-time subscription for game history updates
      const setupSubscription = () => {
        // Clean up existing subscription
        if (subscriptionRef.current) {
          supabase.removeChannel(subscriptionRef.current);
          subscriptionRef.current = null;
        }

        // Create a unique channel name to avoid conflicts
        const channelName = `game_history_${user.id}_${gameType || 'all'}_${Date.now()}`;
        
        const channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'game_history',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log('Real-time INSERT:', payload);
              
              const newEntry = payload.new as GameHistoryEntry;
              // Only add if it matches the current game type filter (or no filter)
              if (!gameType || newEntry.game_type === gameType) {
                console.log('Processing real-time entry for UI update:', newEntry);
                setHistory(prevHistory => {
                  // Check if entry already exists to prevent duplicates
                  const exists = prevHistory.some(entry => entry.id === newEntry.id);
                  if (!exists) {
                    console.log('Real-time: Adding new entry to history state:', newEntry);
                    const newHistory = [newEntry, ...prevHistory];
                    console.log('New history length:', newHistory.length);
                    return newHistory;
                  }
                  console.log('Real-time: Entry already exists, skipping:', newEntry.id);
                  return prevHistory;
                });
              } else {
                console.log('Real-time: Entry filtered out due to game type mismatch:', newEntry.game_type, 'vs', gameType);
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'game_history',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log('Real-time DELETE:', payload);
              const deletedId = payload.old.id;
              setHistory(prevHistory => prevHistory.filter(entry => entry.id !== deletedId));
            }
          )
          .subscribe((status, err) => {
            if (err) {
              console.error('Subscription error:', err);
            } else {
              console.log('Game history subscription status:', status);
            }
          });

        subscriptionRef.current = channel;
      };

      // Small delay to ensure user is properly set
      const timer = setTimeout(setupSubscription, 100);
      
      return () => {
        clearTimeout(timer);
      };
    }

    // Cleanup subscription on unmount or user change
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [user, gameType]);

  const refreshHistory = async () => {
    console.log('Manual refresh triggered');
    await fetchHistory();
  };

  return {
    history,
    loading,
    fetchHistory,
    addHistoryEntry,
    clearHistory,
    getStats,
    refreshHistory
  };
};
