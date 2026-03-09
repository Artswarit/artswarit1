import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExclusiveMember {
  id: string;
  client_id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const ExclusiveMembers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<ExclusiveMember[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);

    supabase
      .from("exclusive_memberships")
      .select("id, client_id, status, created_at, profiles:client_id (id, full_name, avatar_url)")
      .eq("artist_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error loading exclusive members", error);
          toast({
            title: "Error",
            description: "Could not load exclusive members.",
            variant: "destructive"
          });
        } else if (data) {
          setMembers(data as ExclusiveMember[]);
        }
        setLoading(false);
      });
  }, [user?.id, toast]);

  const updateStatus = (id: string, status: "approved" | "rejected") => {
    if (!user?.id) return;

    setUpdatingId(id);

    supabase
      .from("exclusive_memberships")
      .update({
        status,
        updated_at: new Date().toISOString(),
        approved_at: status === "approved" ? new Date().toISOString() : null,
        rejected_at: status === "rejected" ? new Date().toISOString() : null
      })
      .eq("id", id)
      .eq("artist_id", user.id)
      .then(async ({ error }) => {
        setUpdatingId(null);
        if (error) {
          console.error("Error updating membership status", error);
          toast({
            title: "Update Failed",
            description: "Could not update member status.",
            variant: "destructive"
          });
          return;
        }

        setMembers((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status } : m))
        );

        const member = members.find((m) => m.id === id);
        if (status === "approved" && member) {
          const clientId = member.client_id;
          const clientName = member?.profiles?.full_name || "Client";
          const artistName = user?.user_metadata?.full_name || user?.email || "Artist";
          try {
            await supabase.from("notifications").insert({
              user_id: clientId,
              title: "Exclusive Access Approved",
              message: `${artistName} approved your request for exclusive content. You can now view their exclusive artworks.`,
              type: "success",
            });
          } catch (notifyError) {
            console.error("Failed to send exclusive approval notification", notifyError);
          }
        }

        toast({
          title: status === "approved" ? "Access Granted" : "Request Rejected",
          description:
            status === "approved"
              ? "This client can now see your exclusive content."
              : "This request has been rejected."
        });
      });
  };

  const pending = members.filter((m) => m.status === "pending");
  const approved = members.filter((m) => m.status === "approved");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6" />
            Exclusive Circle
          </h2>
          <p className="text-sm text-muted-foreground">
            Review requests and manage who can see your exclusive content.
          </p>
        </div>
      </div>

      <Card className="border-primary/10 shadow-lg">
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>
            Clients who requested access to your exclusive content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You have no pending exclusive access requests.
            </p>
          ) : (
            <div className="space-y-4">
              {pending.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-4 rounded-xl border bg-card p-3 sm:p-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.profiles?.avatar_url || undefined} />
                      <AvatarFallback>
                        {member.profiles?.full_name
                          ? member.profiles.full_name[0]?.toUpperCase()
                          : "C"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">
                        {member.profiles?.full_name || "Client"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Requested on {new Date(member.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(member.id, "rejected")}
                      disabled={updatingId === member.id}
                    >
                      {updatingId === member.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : null}
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => updateStatus(member.id, "approved")}
                      disabled={updatingId === member.id}
                    >
                      {updatingId === member.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : null}
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-muted/50">
        <CardHeader>
          <CardTitle>Approved Members</CardTitle>
          <CardDescription>
            Clients who currently have access to your exclusive content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : approved.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You have no approved exclusive members yet.
            </p>
          ) : (
            <div className="space-y-3">
              {approved.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-4 rounded-xl border bg-card p-3 sm:p-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.profiles?.avatar_url || undefined} />
                      <AvatarFallback>
                        {member.profiles?.full_name
                          ? member.profiles.full_name[0]?.toUpperCase()
                          : "C"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">
                        {member.profiles?.full_name || "Client"}
                      </div>
                      <Badge variant="outline" className="mt-1 text-xs">
                        Exclusive Member
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(member.id, "rejected")}
                    disabled={updatingId === member.id}
                  >
                    {updatingId === member.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : null}
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExclusiveMembers;
