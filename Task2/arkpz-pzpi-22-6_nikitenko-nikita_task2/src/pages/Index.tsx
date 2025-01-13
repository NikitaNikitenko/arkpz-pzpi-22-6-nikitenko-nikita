import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MonitoringDashboard from "@/components/MonitoringDashboard";
import NotificationPreferences from "@/components/NotificationPreferences";
import RegionSelector from "@/components/RegionSelector";
import Auth from "@/components/Auth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Natural Disaster Monitoring
            </h1>
            <p className="text-muted-foreground">
              Real-time monitoring and early warning system for natural disasters
            </p>
          </div>
          {session && (
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          )}
        </div>

        {!session ? (
          <Auth />
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-8">
              <MonitoringDashboard />
            </div>
            <div className="space-y-8">
              <RegionSelector />
              <NotificationPreferences />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;