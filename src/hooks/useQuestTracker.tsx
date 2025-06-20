
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useQuestTracker = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const trackBet = useMutation({
    mutationFn: async (amount: number, gameType: string) => {
      if (!user) return;
      
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: 'place_bet',
          activity_value: amount,
          game_type: gameType,
          metadata: { timestamp: new Date().toISOString() }
        });
      
      if (error) throw error;
      
      // Update quest progress
      await supabase.rpc('update_quest_progress', {
        p_user_id: user.id,
        p_activity_type: 'total_bets',
        p_activity_value: amount,
        p_game_type: gameType,
        p_metadata: { timestamp: new Date().toISOString() }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-quests'] });
    },
  });

  const trackGamePlay = useMutation({
    mutationFn: async (gameType: string) => {
      if (!user) return;
      
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: 'play_game',
          activity_value: 1,
          game_type: gameType,
          metadata: { timestamp: new Date().toISOString() }
        });
      
      if (error) throw error;
      
      // Update quest progress
      await supabase.rpc('update_quest_progress', {
        p_user_id: user.id,
        p_activity_type: 'play_game',
        p_activity_value: 1,
        p_game_type: gameType,
        p_metadata: { timestamp: new Date().toISOString() }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-quests'] });
    },
  });

  const trackGameWin = useMutation({
    mutationFn: async (amount: number, gameType: string) => {
      if (!user) return;
      
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: 'win_game',
          activity_value: amount,
          game_type: gameType,
          metadata: { timestamp: new Date().toISOString() }
        });
      
      if (error) throw error;
      
      // Update quest progress
      await supabase.rpc('update_quest_progress', {
        p_user_id: user.id,
        p_activity_type: 'win_games',
        p_activity_value: 1,
        p_game_type: gameType,
        p_metadata: { timestamp: new Date().toISOString() }
      });
      
      // Also track daily winnings
      await supabase.rpc('update_quest_progress', {
        p_user_id: user.id,
        p_activity_type: 'daily_winnings',
        p_activity_value: amount,
        p_game_type: gameType,
        p_metadata: { timestamp: new Date().toISOString() }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-quests'] });
    },
  });

  const trackGameLoss = useMutation({
    mutationFn: async (gameType: string) => {
      if (!user) return;
      
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: 'lose_game',
          activity_value: 1,
          game_type: gameType,
          metadata: { timestamp: new Date().toISOString() }
        });
      
      if (error) throw error;
      
      // Update quest progress for lose streak quests
      await supabase.rpc('update_quest_progress', {
        p_user_id: user.id,
        p_activity_type: 'lose_streak_continue',
        p_activity_value: 1,
        p_game_type: gameType,
        p_metadata: { timestamp: new Date().toISOString() }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-quests'] });
    },
  });

  return {
    trackBet: trackBet.mutateAsync,
    trackGamePlay: trackGamePlay.mutateAsync,
    trackGameWin: trackGameWin.mutateAsync,
    trackGameLoss: trackGameLoss.mutateAsync,
  };
};
