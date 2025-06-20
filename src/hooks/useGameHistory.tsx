
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type GameType = 'mines' | 'wheel-of-fortune' | 'fortune-reels' | 'blackjack' | 'dice-roll';
type ResultType = 'win' | 'loss';

export interface GameHistoryEntry {
  id: string;
  user_id: string;
  game_type: GameType;
  bet_amount: number;
  result_type: ResultType;
  win_amount: number;
  loss_amount: number;
  multiplier: number;
  game_details: any;
  created_at: string;
}

interface AddHistoryEntryParams {
  game_type: GameType;
  bet_amount: number;
  result_type: ResultType;
  win_amount: number;
  loss_amount: number;
  multiplier: number;
  game_details?: any;
}

export const useGameHistory = (gameType?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  const { data: gameHistory, isLoading } = useQuery<GameHistoryEntry[]>({
    queryKey: ['game-history', user?.id, gameType],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('game_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (gameType) {
        query = query.eq('game_type', gameType);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as GameHistoryEntry[];
    },
    enabled: !!user,
  });

  // Set up real-time subscription with proper cleanup
  useEffect(() => {
    if (!user?.id) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Create new channel with unique name
    const channelName = `game-history-${user.id}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_history',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['game-history', user.id] });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id, queryClient]);

  const addHistoryEntry = useMutation({
    mutationFn: async (entry: AddHistoryEntryParams) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('game_history')
        .insert({
          user_id: user.id,
          ...entry
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-history', user?.id] });
    },
  });

  const clearHistory = useMutation({
    mutationFn: async (gameType?: string) => {
      if (!user) throw new Error("User not authenticated");

      let query = supabase
        .from('game_history')
        .delete()
        .eq('user_id', user.id);

      if (gameType) {
        query = query.eq('game_type', gameType);
      }

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-history', user?.id] });
    },
  });

  const getGameHistory = (filterGameType?: GameType) => {
    if (!gameHistory) return [];
    
    if (filterGameType) {
      return gameHistory.filter(entry => entry.game_type === filterGameType);
    }
    
    return gameHistory;
  };

  const getStats = () => {
    const history = gameHistory || [];
    const totalGames = history.length;
    const wins = history.filter(entry => entry.result_type === 'win').length;
    const losses = history.filter(entry => entry.result_type === 'loss').length;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
    
    const totalWinnings = history
      .filter(entry => entry.result_type === 'win')
      .reduce((sum, entry) => sum + entry.win_amount, 0);
    
    const totalLosses = history
      .filter(entry => entry.result_type === 'loss')
      .reduce((sum, entry) => sum + entry.loss_amount, 0);
    
    const netProfit = totalWinnings - totalLosses;

    return {
      totalGames,
      wins,
      losses,
      winRate,
      netProfit
    };
  };

  const refreshHistory = () => {
    queryClient.invalidateQueries({ queryKey: ['game-history', user?.id] });
  };

  return {
    gameHistory: gameHistory || [],
    history: gameHistory || [],
    loading: isLoading,
    addHistoryEntry: addHistoryEntry.mutateAsync,
    clearHistory: clearHistory.mutateAsync,
    getGameHistory,
    getStats,
    refreshHistory,
  };
};
