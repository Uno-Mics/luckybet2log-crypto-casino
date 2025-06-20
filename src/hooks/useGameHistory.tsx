
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type GameType = 'mines' | 'wheel-of-fortune' | 'fortune-reels' | 'blackjack' | 'dice-roll';
type ResultType = 'win' | 'loss';

interface GameHistoryEntry {
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

export const useGameHistory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  const { data: gameHistory } = useQuery<GameHistoryEntry[]>({
    queryKey: ['game-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('game_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
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

  const getGameHistory = (gameType?: GameType) => {
    if (!gameHistory) return [];
    
    if (gameType) {
      return gameHistory.filter(entry => entry.game_type === gameType);
    }
    
    return gameHistory;
  };

  return {
    gameHistory: gameHistory || [],
    addHistoryEntry: addHistoryEntry.mutateAsync,
    getGameHistory,
  };
};
