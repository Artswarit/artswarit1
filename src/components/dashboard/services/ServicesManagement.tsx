import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import { useFeatureGating } from "@/hooks/useFeatureGating";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Loader2, Crown, Lock } from "lucide-react";
import { FeatureLimitBanner } from "@/components/premium/FeatureLimitBanner";

interface Service {
  id: string;
  title: string;
  description: string | null;
  starting_price: number | null;
  created_at: string;
}

const ServicesManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { canAddService, serviceCount, serviceLimit, isProArtist, loading: gatingLoading, refresh: refreshGating } = useFeatureGating(user?.id);
  const { toast } = useToast();
  const { formatPlus, userCurrencySymbol } = useCurrencyFormat();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    starting_price: "",
  });

  const fetchServices = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("artist_services")
        .select("*")
        .eq("artist_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error('[ServicesManagement] Error fetching services:', error);
        throw error;
      }

      if (data) {
        setServices(data);
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error loading services",
        description: err.message
      });
    } finally {
      setLoading(false);
    }
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

  const handleSave = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!user?.id || !form.title.trim()) {
      toast({ variant: "destructive", title: "Title is required" });
      return;
    }

    // Check service limit for new services
    if (!editingService && !canAddService) {
      toast({
        title: "Service limit reached",
        description: `You've reached your limit of ${serviceLimit} services. Upgrade to Pro for unlimited services!`,
        variant: "destructive"
      });
      setIsDialogOpen(false);
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
        console.error("[ServicesManagement] Save error:", error);
        toast({ variant: "destructive", title: "Failed to update service" });
      } else {
        console.log("[ServicesManagement] Service updated successfully");
        toast({ title: "Service updated" });
        setIsDialogOpen(false);
        // Update local state for instant feedback
        fetchServices();
        refreshGating();
      }
    } else {
      const { error } = await supabase.from("artist_services").insert(payload);

      if (error) {
        console.error("[ServicesManagement] Create error:", error);
        toast({ variant: "destructive", title: "Failed to create service" });
      } else {
        console.log("[ServicesManagement] Service created successfully");
        toast({ title: "Service created" });
        setIsDialogOpen(false);
        // Update local state for instant feedback
        fetchServices();
        refreshGating();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!serviceToDelete) return;

    setLoading(true); // Show loading state during deletion
    console.log(`[ServicesManagement] Deleting service ${serviceToDelete}...`);
    
    const { error } = await supabase
      .from("artist_services")
      .delete()
      .eq("id", serviceToDelete);

    if (error) {
      console.error("[ServicesManagement] Delete error:", error);
      toast({ variant: "destructive", title: "Failed to delete service" });
      setLoading(false);
    } else {
      console.log("[ServicesManagement] Service deleted successfully from DB");
      toast({ title: "Service deleted" });
      
      // Update UI immediately by removing from local state
      setServices(prev => prev.filter(s => s.id !== serviceToDelete));
      
      // Call refresh first to update limits immediately
      console.log("[ServicesManagement] Triggering manual gating refresh...");
      await refreshGating();
      
      // Fetch fresh list to be absolutely sure
      await fetchServices();
      
      setIsDeleteAlertOpen(false);
      setServiceToDelete(null);
    }
  };

  const confirmDelete = (serviceId: string) => {
    setServiceToDelete(serviceId);
    setIsDeleteAlertOpen(true);
  };

  const handleUpgrade = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Navigate to premium page using the correct route format
    navigate('/artist-dashboard/premium');
  };

  const handleAddClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!canAddService) {
      toast({
        title: "Service limit reached",
        description: `You've reached your limit of ${serviceLimit} services. Upgrade to Pro for unlimited services!`,
        variant: "destructive"
      });
      return;
    }
    openCreateDialog();
  };

  return (
    <Card className="rounded-[2.5rem] border-border/40 shadow-2xl shadow-black/5 bg-background/50 backdrop-blur-xl overflow-hidden">
      <CardHeader className="flex flex-col gap-6 p-6 sm:p-10 bg-muted/20 border-b border-border/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight text-foreground/90">Your Services</CardTitle>
              {!isProArtist && (
                <Badge variant="outline" className="shrink-0 bg-primary/5 text-primary border-primary/20 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wider">
                  {serviceCount}/{serviceLimit}
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">Showcase your expertise and manage your offerings</p>
          </div>
          <Button 
            onClick={handleAddClick} 
            className="h-14 w-full sm:w-auto gap-3 px-8 font-black text-[10px] uppercase tracking-widest bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-2xl shrink-0"
            disabled={!canAddService}
          >
            {canAddService ? (
              <>
                <Plus className="h-4 w-4" /> 
                Add New Service
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" /> 
                Limit Reached
              </>
            )}
          </Button>
        </div>
        <div className="rounded-[2rem] overflow-hidden border border-border/10 bg-background/40 backdrop-blur-md shadow-inner">
          <FeatureLimitBanner type="service" onUpgrade={handleUpgrade} />
        </div>
      </CardHeader>
      <CardContent className="p-6 sm:p-10">
        {loading || gatingLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
              <div className="absolute inset-0 blur-xl bg-primary/10 rounded-full animate-pulse" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 animate-pulse">Loading Services</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-24 px-6 space-y-6 bg-muted/10 rounded-[2.5rem] border-2 border-dashed border-border/20">
            <div className="mx-auto w-20 h-20 rounded-[2rem] bg-muted/20 flex items-center justify-center rotate-3 transition-transform hover:rotate-0">
              <Plus className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <div className="space-y-3">
              <h4 className="text-lg font-black text-foreground/90">No services yet</h4>
              <p className="text-sm font-medium text-muted-foreground/60 max-w-[320px] mx-auto leading-relaxed">
                Create your first service to showcase your talent and start receiving inquiries.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {services.map((s) => (
              <div
                key={s.id}
                className="group relative border border-border/40 rounded-[2.2rem] p-6 sm:p-8 bg-background/50 backdrop-blur-md hover:border-primary/30 hover:bg-accent/30 transition-all duration-500 flex flex-col gap-6 shadow-xl shadow-black/5 hover:shadow-primary/5 hover:-translate-y-2 overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                
                <div className="flex justify-between items-start gap-4 relative z-10">
                  <h3 className="font-black text-xl text-foreground/90 leading-tight group-hover:text-primary transition-colors truncate">{s.title}</h3>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-2xl hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/10 transition-all duration-300"
                      onClick={() => openEditDialog(s)}
                    >
                      <Pencil className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-2xl hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive/10 transition-all duration-300"
                      onClick={() => confirmDelete(s.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                {s.description && (
                  <p className="text-sm font-medium text-muted-foreground/80 line-clamp-3 leading-relaxed relative z-10">
                    {s.description}
                  </p>
                )}
                {s.starting_price !== null && (
                  <div className="mt-auto pt-6 flex items-center justify-between border-t border-border/10 relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Starting At</span>
                    <p className="text-xl font-black text-primary tracking-tight">
                      {formatPlus(s.starting_price)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md w-[92vw] sm:w-full p-5 sm:p-8 rounded-[2rem] border-none shadow-2xl bg-background/95 backdrop-blur-xl">
            <DialogHeader className="mb-6 space-y-2">
              <DialogTitle className="text-2xl font-black tracking-tight">
                {editingService ? "Edit Service" : "Add New Service"}
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base font-medium text-muted-foreground/80">
                Showcase your expertise and set your terms.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-2">
              <div className="space-y-2">
                <Label htmlFor="svc-title" className="text-sm font-bold ml-1">Service Title *</Label>
                <Input
                  id="svc-title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Custom Digital Illustration"
                  className="h-12 bg-muted/40 border-border/40 focus-visible:ring-primary/20 rounded-2xl font-medium px-4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="svc-desc" className="text-sm font-bold ml-1">Description</Label>
                <Textarea
                  id="svc-desc"
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe your workflow, deliverables, and terms..."
                  className="bg-muted/40 border-border/40 focus-visible:ring-primary/20 rounded-2xl font-medium p-4 resize-none leading-relaxed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="svc-price" className="text-sm font-bold ml-1">Starting Price ({userCurrencySymbol} in USD)</Label>
                <div className="relative">
                  <Input
                    id="svc-price"
                    type="number"
                    min={0}
                    value={form.starting_price}
                    onChange={(e) =>
                      setForm({ ...form, starting_price: e.target.value })
                    }
                    placeholder="e.g., 50"
                    className="h-12 bg-muted/40 border-border/40 focus-visible:ring-primary/20 rounded-2xl font-bold px-4 pl-9"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed italic ml-1 font-medium">
                  Clients will see this converted to their local currency.
                </p>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={saving}
                className="h-14 flex-1 font-black text-[10px] uppercase tracking-widest rounded-2xl border-border/60 hover:bg-muted/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="h-14 flex-1 font-black text-[10px] uppercase tracking-widest rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : editingService ? (
                  <Pencil className="h-4 w-4 mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {editingService ? "Update Service" : "Create Service"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent className="w-[92vw] max-w-md p-6 sm:p-8 rounded-[2rem] border-none shadow-2xl bg-background/95 backdrop-blur-xl">
            <AlertDialogHeader className="mb-6 space-y-2">
              <AlertDialogTitle className="text-2xl font-black tracking-tight">Delete Service?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm sm:text-base font-medium text-muted-foreground/80 leading-relaxed">
                This will permanently remove the service from your profile. Are you sure you want to proceed?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col sm:flex-row gap-3">
              <AlertDialogCancel onClick={() => setServiceToDelete(null)} className="h-12 flex-1 font-bold rounded-2xl border-border/60 hover:bg-muted/50">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="h-12 flex-1 font-black rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20">
                Delete Service
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default ServicesManagement;
