
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const usePetSystem = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  // Get user's pets
  const { data: userPets } = useQuery({
    queryKey: ['user-pets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_pets')
        .select(`
          *,
          pet_types (*)
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Get active pet boosts
  const { data: activePetBoosts } = useQuery({
    queryKey: ['active-pet-boosts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .rpc('get_user_pet_boosts', { p_user_id: user.id });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Set up real-time subscription for pets with proper cleanup
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
    const channelName = `pet-system-${user.id}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_pets',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['user-pets', user.id] });
          queryClient.invalidateQueries({ queryKey: ['active-pet-boosts', user.id] });
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

  const placePetInGarden = useMutation({
    mutationFn: async ({ petId, position }: { petId: string; position: number }) => {
      const { data, error } = await supabase
        .rpc('place_pet_in_garden', {
          p_user_id: user?.id,
          p_pet_id: petId,
          p_position: position
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-pets'] });
      queryClient.invalidateQueries({ queryKey: ['active-pet-boosts'] });
    },
  });

  const removePetFromGarden = useMutation({
    mutationFn: async (petId: string) => {
      const { data, error } = await supabase
        .rpc('remove_pet_from_garden', {
          p_user_id: user?.id,
          p_pet_id: petId
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-pets'] });
      queryClient.invalidateQueries({ queryKey: ['active-pet-boosts'] });
    },
  });

  const sellPet = useMutation({
    mutationFn: async (petId: string) => {
      const { data, error } = await supabase
        .rpc('sell_pet', {
          p_user_id: user?.id,
          p_pet_id: petId
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-pets'] });
      queryClient.invalidateQueries({ queryKey: ['active-pet-boosts'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    userPets: userPets || [],
    activePetBoosts: activePetBoosts || [],
    placePetInGarden,
    removePetFromGarden,
    sellPet,
  };
};
