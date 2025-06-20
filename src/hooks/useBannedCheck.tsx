
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useProfile } from "./useProfile";

export const useBannedCheck = () => {
  const { user } = useAuth();
  const { profile } = useProfile();

  const { data: isBanned } = useQuery({
    queryKey: ['banned-status', user?.id],
    queryFn: () => {
      return profile?.is_banned || false;
    },
    enabled: !!user && !!profile,
    refetchInterval: false, // Don't auto-refetch to prevent subscription issues
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    isBanned: isBanned || false,
  };
};
