import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface Service {
  id: string;
  title: string;
  description: string | null;
  starting_price: number | null;
  created_at: string;
}

const ServicesManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { formatPlus, userCurrencySymbol } = useCurrencyFormat();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    starting_price: "",
  });

  const fetchServices = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("artist_services")
      .select("*")
      .eq("artist_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setServices(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`services-realtime:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artist_services',
          filter: `artist_id=eq.${user.id}`
        },
        () => {
          fetchServices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const openCreateDialog = () => {
    setEditingService(null);
    setForm({ title: "", description: "", starting_price: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setForm({
      title: service.title,
      description: service.description || "",
      starting_price: service.starting_price?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user?.id || !form.title.trim()) {
      toast({ variant: "destructive", title: "Title is required" });
      return;
    }
    setSaving(true);

    const payload = {
      artist_id: user.id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      starting_price: form.starting_price ? parseFloat(form.starting_price) : null,
    };

    if (editingService) {
      const { error } = await supabase
        .from("artist_services")
        .update(payload)
        .eq("id", editingService.id);

      if (error) {
        toast({ variant: "destructive", title: "Failed to update service" });
      } else {
        toast({ title: "Service updated" });
        fetchServices();
        setIsDialogOpen(false);
      }
    } else {
      const { error } = await supabase.from("artist_services").insert(payload);

      if (error) {
        toast({ variant: "destructive", title: "Failed to create service" });
      } else {
        toast({ title: "Service created" });
        fetchServices();
        setIsDialogOpen(false);
      }
    }
    setSaving(false);
  };

  const handleDelete = async (serviceId: string) => {
    const confirmed = window.confirm("Delete this service?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("artist_services")
      .delete()
      .eq("id", serviceId);

    if (error) {
      toast({ variant: "destructive", title: "Failed to delete service" });
    } else {
      toast({ title: "Service deleted" });
      fetchServices();
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Your Services</CardTitle>
        <Button onClick={openCreateDialog} size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> Add Service
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : services.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            You haven't added any services yet. Add one to showcase on your public profile.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div
                key={s.id}
                className="border rounded-xl p-4 bg-card flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{s.title}</h3>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(s)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(s.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {s.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {s.description}
                  </p>
                )}
                {s.starting_price !== null && (
                  <p className="text-amber-700 font-semibold flex items-center gap-0.5 mt-auto">
                    {formatPlus(s.starting_price)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Edit Service" : "Add Service"}
              </DialogTitle>
              <DialogDescription>
                Describe a service you offer to clients.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="svc-title">Title *</Label>
                <Input
                  id="svc-title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Custom Portrait"
                />
              </div>
              <div>
                <Label htmlFor="svc-desc">Description</Label>
                <Textarea
                  id="svc-desc"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe what this service includes..."
                />
              </div>
              <div>
                <Label htmlFor="svc-price">Starting Price ({userCurrencySymbol} in USD equivalent)</Label>
                <Input
                  id="svc-price"
                  type="number"
                  min={0}
                  value={form.starting_price}
                  onChange={(e) =>
                    setForm({ ...form, starting_price: e.target.value })
                  }
                  placeholder="e.g., 50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter price in USD - it will display in your local currency
                </p>
              </div>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editingService ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ServicesManagement;
