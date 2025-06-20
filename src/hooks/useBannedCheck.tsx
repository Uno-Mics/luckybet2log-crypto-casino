
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useProfile } from "./useProfile";

export const useBannedCheck = () => {
  const { user } = useAuth();
  const { profile } = useProfile();

  const { data: bannedData } = useQuery({
    queryKey: ['banned-status', user?.id],
    queryFn: () => {
      return {
        isBanned: profile?.is_banned || false,
        reason: profile?.ban_reason || null
      };
    },
    enabled: !!user && !!profile,
    refetchInterval: false, // Don't auto-refetch to prevent subscription issues
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    isBanned: bannedData?.isBanned || false,
    reason: bannedData?.reason || null,
  };
};
