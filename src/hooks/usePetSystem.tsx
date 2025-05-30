
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { Tables } from "@/integrations/supabase/types";

type EggType = Tables<"egg_types">;
type PetType = Tables<"pet_types">;
type UserEgg = Tables<"user_eggs">;
type UserPet = Tables<"user_pets">;

interface UserEggWithType extends UserEgg {
  egg_type: EggType;
}

interface UserPetWithType extends UserPet {
  pet_type: PetType;
}

interface PetBoost {
  trait_type: string;
  total_boost: number;
}

export const usePetSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [eggTypes, setEggTypes] = useState<EggType[]>([]);
  const [userEggs, setUserEggs] = useState<UserEggWithType[]>([]);
  const [userPets, setUserPets] = useState<UserPetWithType[]>([]);
  const [activePetBoosts, setActivePetBoosts] = useState<PetBoost[]>([]);
  const [loading, setLoading] = useState(true);

  // Load egg types
  const loadEggTypes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("egg_types")
        .select("*")
        .order("price");
      
      if (error) throw error;
      setEggTypes(data || []);
    } catch (error) {
      console.error("Error loading egg types:", error);
    }
  }, []);

  // Load user eggs
  const loadUserEggs = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_eggs")
        .select(`
          *,
          egg_type:egg_types(*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setUserEggs(data || []);
    } catch (error) {
      console.error("Error loading user eggs:", error);
    }
  }, [user]);

  // Load user pets
  const loadUserPets = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_pets")
        .select(`
          *,
          pet_type:pet_types(*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setUserPets(data || []);
    } catch (error) {
      console.error("Error loading user pets:", error);
    }
  }, [user]);

  // Load active pet boosts
  const loadActivePetBoosts = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc("get_user_pet_boosts", {
        p_user_id: user.id
      });
      
      if (error) throw error;
      setActivePetBoosts(data || []);
    } catch (error) {
      console.error("Error loading pet boosts:", error);
    }
  }, [user]);

  // Load all data
  useEffect(() => {
    if (user) {
      Promise.all([
        loadEggTypes(),
        loadUserEggs(),
        loadUserPets(),
        loadActivePetBoosts()
      ]).finally(() => setLoading(false));
    }
  }, [user, loadEggTypes, loadUserEggs, loadUserPets, loadActivePetBoosts]);

  // Purchase egg
  const purchaseEgg = async (eggTypeId: number) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc("purchase_egg", {
        p_user_id: user.id,
        p_egg_type_id: eggTypeId
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Egg purchased!",
          description: `You spent ${data.tokens_spent} $ITLOG tokens.`
        });
        loadUserEggs();
      } else {
        toast({
          title: "Purchase failed",
          description: data.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error purchasing egg:", error);
      toast({
        title: "Error",
        description: "Failed to purchase egg. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Start incubation
  const startIncubation = async (eggId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc("start_incubation", {
        p_user_id: user.id,
        p_egg_id: eggId
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Incubation started!",
          description: "Your egg is now incubating."
        });
        loadUserEggs();
      } else {
        toast({
          title: "Incubation failed",
          description: data.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error starting incubation:", error);
      toast({
        title: "Error",
        description: "Failed to start incubation. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Hatch egg
  const hatchEgg = async (eggId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc("hatch_egg", {
        p_user_id: user.id,
        p_egg_id: eggId
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "🎉 Egg Hatched!",
          description: `You got a ${data.rarity} ${data.pet_name} ${data.pet_emoji}!`
        });
        loadUserEggs();
        loadUserPets();
      } else {
        toast({
          title: "Hatching failed",
          description: data.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error hatching egg:", error);
      toast({
        title: "Error",
        description: "Failed to hatch egg. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Place pet in garden
  const placePetInGarden = async (petId: string, position: number) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc("place_pet_in_garden", {
        p_user_id: user.id,
        p_pet_id: petId,
        p_position: position
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Pet placed in garden!",
          description: "Your pet is now providing its boost."
        });
        loadUserPets();
        loadActivePetBoosts();
      } else {
        toast({
          title: "Placement failed",
          description: data.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error placing pet:", error);
      toast({
        title: "Error",
        description: "Failed to place pet. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Remove pet from garden
  const removePetFromGarden = async (petId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc("remove_pet_from_garden", {
        p_user_id: user.id,
        p_pet_id: petId
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Pet removed from garden",
          description: "Your pet is back in inventory."
        });
        loadUserPets();
        loadActivePetBoosts();
      }
    } catch (error) {
      console.error("Error removing pet:", error);
      toast({
        title: "Error",
        description: "Failed to remove pet. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    eggTypes,
    userEggs,
    userPets,
    activePetBoosts,
    loading,
    purchaseEgg,
    startIncubation,
    hatchEgg,
    placePetInGarden,
    removePetFromGarden,
    loadUserEggs,
    loadUserPets,
    loadActivePetBoosts
  };
};
