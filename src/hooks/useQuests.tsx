import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface QuestDefinition {
  id: number;
  title: string;
  description: string;
  difficulty_tier: 'easy' | 'medium' | 'hard';
  task_type: string;
  target_value: number;
  reward_min: number;
  reward_max: number;
}

export interface DailyQuest {
  id: string;
  quest_definition_id: number;
  progress: number;
  is_completed: boolean;
  quest_definition: QuestDefinition;
}

export const useQuests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
  const [canClaimRewards, setCanClaimRewards] = useState(false);
  const [hasClaimedToday, setHasClaimedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDailyQuests = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // First, ensure user has daily quests assigned
      const { error: assignError } = await supabase.rpc('assign_daily_quests', { 
        p_user_id: user.id 
      });
      if (assignError) console.error('Error assigning daily quests:', assignError);

      // Check balance-based quests to ensure they're up to date
      const { error: balanceError } = await supabase.rpc('check_balance_quests', { 
        p_user_id: user.id 
      });
      if (balanceError) console.error('Error checking balance quests:', balanceError);

      // Fetch today's quests
      const { data: quests, error } = await supabase
        .from('daily_quests')
        .select(`
          id,
          quest_definition_id,
          progress,
          is_completed,
          quest_definition:quest_definitions(*)
        `)
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      setDailyQuests(quests || []);

      // Check if all quests are completed
      const allCompleted = quests?.every(quest => quest.is_completed) || false;
      setCanClaimRewards(allCompleted && quests?.length === 3);

      // Check if rewards already claimed today
      const { data: claimed } = await supabase
        .from('quest_rewards_claimed')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      setHasClaimedToday(!!claimed);
    } catch (error) {
      console.error('Error fetching daily quests:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const claimRewards = useCallback(async () => {
    if (!user || !canClaimRewards || hasClaimedToday) return;

    try {
      const { data, error } = await supabase.rpc('claim_quest_rewards', {
        p_user_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Rewards Claimed!",
        description: `You earned ${data.total_reward} $ITLOG tokens!`,
      });

      setHasClaimedToday(true);
      setCanClaimRewards(false);

      // Refresh quests
      await fetchDailyQuests();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      toast({
        title: "Error",
        description: "Failed to claim rewards. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, canClaimRewards, hasClaimedToday, toast, fetchDailyQuests]);

  useEffect(() => {
    fetchDailyQuests();
  }, [fetchDailyQuests]);

  // Set up real-time subscription for quest progress updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('quest_progress')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'daily_quests',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchDailyQuests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchDailyQuests]);

  return {
    dailyQuests,
    canClaimRewards: canClaimRewards && !hasClaimedToday,
    hasClaimedToday,
    loading,
    claimRewards,
    refetch: fetchDailyQuests
  };
};