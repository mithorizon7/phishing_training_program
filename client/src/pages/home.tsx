import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { LandingPage } from "@/components/landing-page";
import { Dashboard } from "@/components/dashboard";
import { Header } from "@/components/header";
import { Skeleton } from "@/components/ui/skeleton";
import { useGuestMode } from "@/hooks/use-guest-mode";
import type { UserProgress } from "@shared/schema";

export default function Home() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { isGuestMode } = useGuestMode();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const isActive = isAuthenticated || isGuestMode;
  const apiPrefix = isGuestMode ? "/api/guest" : "/api";

  const { data: progress, isLoading: progressLoading } = useQuery<UserProgress | null>({
    queryKey: [isGuestMode ? "/api/guest/progress" : "/api/progress"],
    enabled: isActive,
  });

  const startShiftMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `${apiPrefix}/shifts`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`${apiPrefix}/shifts`] });
      navigate(`/training/${data.id}${isGuestMode ? "?guest=true" : ""}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start a new shift. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStartShift = () => {
    startShiftMutation.mutate();
  };

  if (authLoading && !isGuestMode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isActive) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} isGuestMode={isGuestMode} />
      <main>
        <Dashboard 
          progress={progress || null} 
          isLoading={progressLoading}
          onStartShift={handleStartShift}
          isGuestMode={isGuestMode}
        />
      </main>
    </div>
  );
}
