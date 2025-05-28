
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ActivityData {
  activityType: string;
  activityValue?: number;
  gameType?: string;
  metadata?: Record<string, any>;
  sessionId?: string;
}

export const useActivityTracker = () => {
  const { user } = useAuth();

  const trackActivity = useCallback(async (data: ActivityData) => {
    if (!user) return;

    try {
      await supabase.from('user_activities').insert({
        user_id: user.id,
        activity_type: data.activityType,
        activity_value: data.activityValue || 1,
        game_type: data.gameType,
        metadata: data.metadata || {},
        session_id: data.sessionId || `session_${Date.now()}`
      });

      // Trigger quest progress update
      await updateQuestProgress(data);
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }, [user]);

  const updateQuestProgress = useCallback(async (data: ActivityData) => {
    if (!user) return;

    try {
      // Call the quest progress update function
      await supabase.rpc('update_quest_progress', {
        p_user_id: user.id,
        p_activity_type: data.activityType,
        p_activity_value: data.activityValue || 1,
        p_game_type: data.gameType,
        p_metadata: data.metadata || {}
      });
    } catch (error) {
      console.error('Error updating quest progress:', error);
    }
  }, [user]);

  // Specific tracking functions for different activities
  const trackGamePlay = useCallback((gameType: string, sessionId: string) => {
    trackActivity({
      activityType: 'play_game',
      gameType,
      sessionId,
      metadata: { timestamp: new Date().toISOString() }
    });
  }, [trackActivity]);

  const trackGameWin = useCallback((gameType: string, winAmount: number, sessionId: string) => {
    trackActivity({
      activityType: 'win_game',
      activityValue: winAmount,
      gameType,
      sessionId,
      metadata: { winAmount, timestamp: new Date().toISOString() }
    });
  }, [trackActivity]);

  const trackGameLoss = useCallback((gameType: string, lossAmount: number, sessionId: string) => {
    trackActivity({
      activityType: 'lose_game',
      activityValue: lossAmount,
      gameType,
      sessionId,
      metadata: { lossAmount, timestamp: new Date().toISOString() }
    });
  }, [trackActivity]);

  const trackBet = useCallback((betAmount: number, gameType: string, sessionId: string) => {
    trackActivity({
      activityType: 'place_bet',
      activityValue: betAmount,
      gameType,
      sessionId,
      metadata: { betAmount, timestamp: new Date().toISOString() }
    });
  }, [trackActivity]);

  const trackDeposit = useCallback((amount: number, status: string) => {
    trackActivity({
      activityType: 'deposit',
      activityValue: amount,
      metadata: { amount, status, timestamp: new Date().toISOString() }
    });
  }, [trackActivity]);

  const trackWithdrawal = useCallback((amount: number, status: string) => {
    trackActivity({
      activityType: 'withdraw',
      activityValue: amount,
      metadata: { amount, status, timestamp: new Date().toISOString() }
    });
  }, [trackActivity]);

  const trackFarmingClaim = useCallback((amount: number) => {
    trackActivity({
      activityType: 'claim_farming',
      activityValue: amount,
      metadata: { amount, timestamp: new Date().toISOString() }
    });
  }, [trackActivity]);

  const trackStaking = useCallback((amount: number) => {
    trackActivity({
      activityType: 'stake_php',
      activityValue: amount,
      metadata: { amount, timestamp: new Date().toISOString() }
    });
  }, [trackActivity]);

  const trackCurrencyConversion = useCallback((amount: number, fromCurrency: string, toCurrency: string) => {
    trackActivity({
      activityType: 'convert_currency',
      activityValue: amount,
      metadata: { amount, fromCurrency, toCurrency, timestamp: new Date().toISOString() }
    });
  }, [trackActivity]);

  const trackItlogExchange = useCallback((amount: number) => {
    trackActivity({
      activityType: 'exchange_itlog',
      activityValue: amount,
      metadata: { amount, timestamp: new Date().toISOString() }
    });
  }, [trackActivity]);

  const trackGameSession = useCallback((gameType: string, duration: number, sessionId: string) => {
    trackActivity({
      activityType: 'game_session',
      activityValue: duration,
      gameType,
      sessionId,
      metadata: { duration, timestamp: new Date().toISOString() }
    });
  }, [trackActivity]);

  const checkBalanceQuests = useCallback(async () => {
    if (!user) return;

    try {
      // Call the function to check balance-based quests
      const { error } = await supabase.rpc('check_balance_quests', {
        p_user_id: user.id
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error checking balance quests:', error);
    }
  }, [user]);

  return {
    trackActivity,
    trackGamePlay,
    trackGameWin,
    trackGameLoss,
    trackBet,
    trackDeposit,
    trackWithdrawal,
    trackFarmingClaim,
    trackStaking,
    trackCurrencyConversion,
    trackItlogExchange,
    trackGameSession,
    checkBalanceQuests
  };
};
