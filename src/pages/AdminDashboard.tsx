
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tab, setTab] = useState("overview");

  // Only allow admins
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate("/login");
        return;
      }
      const { data, error } = await supabase
        .from("user_roles")
        .select()
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!data) {
        navigate("/"); // Not admin!
      }
    };
    checkAdmin();
  }, [user, navigate]);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const [userRes, artistRes, artworkRes, projectRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, role, account_status, created_at"),
      supabase.from("profiles").select("id, full_name, email, account_status, created_at, bio").eq("role", "artist"),
      supabase.from("artworks").select("*"),
      supabase.from("projects").select("*"),
    ]);
    setUsers(userRes.data ?? []);
    setArtists(artistRes.data ?? []);
    setArtworks(artworkRes.data ?? []);
    setProjects(projectRes.data ?? []);
    setStats({
      totalUsers: userRes.data?.length ?? 0,
      totalArtists: artistRes.data?.length ?? 0,
      totalArtworks: artworkRes.data?.length ?? 0,
      totalProjects: projectRes.data?.length ?? 0,
      pendingArtists: (artistRes.data ?? []).filter((a: any) => a.account_status === "pending").length,
      pendingArtworks: (artworkRes.data ?? []).filter((a: any) => a.approval_status === "pending").length,
    });
  }

  // Admin actions (approve, reject, promote, ban) would be implemented with matching calls to Supabase as in the other admin file.
  // For brevity, we add dummy methods. For a real app, split each section into its own component for maintainability!

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="artists">Artists</TabsTrigger>
          <TabsTrigger value="artworks">Artworks</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Artists</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalArtists}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Artworks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalArtworks}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Artists</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingArtists}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pending Artworks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingArtworks}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <h2 className="font-semibold text-xl mb-4">All Users</h2>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.full_name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge>{u.role}</Badge>
                    </TableCell>
                    <TableCell>{u.account_status}</TableCell>
                    <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="artists">
          <h2 className="font-semibold text-xl mb-4">Artists</h2>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bio</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {artists.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.full_name}</TableCell>
                    <TableCell>{a.email}</TableCell>
                    <TableCell>
                      <Badge variant={a.account_status === "pending" ? "destructive" : "default"}>
                        {a.account_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {a.bio}
                    </TableCell>
                    <TableCell>{new Date(a.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="artworks">
          <h2 className="font-semibold text-xl mb-4">Artworks</h2>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {artworks.map((aw: any) => (
                  <TableRow key={aw.id}>
                    <TableCell>{aw.title}</TableCell>
                    <TableCell>{aw.artist_id}</TableCell>
                    <TableCell>
                      <Badge variant={aw.approval_status === "pending" ? "destructive" : "default"}>
                        {aw.approval_status}
                      </Badge>
                    </TableCell>
                    <TableCell>{aw.category}</TableCell>
                    <TableCell>{new Date(aw.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="projects">
          <h2 className="font-semibold text-xl mb-4">Projects</h2>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Budget</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.title}</TableCell>
                    <TableCell>{p.status}</TableCell>
                    <TableCell>{p.artist_id}</TableCell>
                    <TableCell>{p.client_id}</TableCell>
                    <TableCell>${p.budget ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
