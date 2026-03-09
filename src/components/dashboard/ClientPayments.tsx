
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Download, Eye, DollarSign, Calendar, CheckCircle, Clock, AlertCircle, Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { BillingAddressForm } from "@/components/billing/BillingAddressForm";
import { InvoiceDownload } from "@/components/billing/InvoiceDownload";

interface Payment {
  id: string;
  project_id: string;
  projectTitle: string;
  artistName: string;
  artistAvatar: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  created_at: string;
  updated_at: string;
}

const ClientPayments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { format } = useCurrencyFormat();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [processing, setProcessing] = useState(false);
  
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: ""
  });

  const fetchPayments = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Fetch transactions where user is buyer
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          *,
          artwork:artwork_id (
            title,
            artist_id
          )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Also fetch project-based payments from sales table
      const { data: sales } = await supabase
        .from('sales')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      // Enrich transactions with artist info
      const enrichedPayments: Payment[] = [];
      
      for (const tx of transactions || []) {
        let artistInfo = { full_name: 'Unknown Artist', avatar_url: null };
        
        if (tx.seller_id) {
          const { data: artist } = await supabase
            .from('public_profiles')
            .select('full_name, avatar_url')
            .eq('id', tx.seller_id)
            .maybeSingle();
          
          if (artist) {
            artistInfo = artist;
          }
        }

        enrichedPayments.push({
          id: tx.id,
          project_id: tx.artwork_id,
          projectTitle: tx.artwork?.title || 'Artwork Purchase',
          artistName: artistInfo.full_name || 'Unknown Artist',
          artistAvatar: artistInfo.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50',
          amount: tx.amount,
          currency: '',
          status: tx.status as "pending" | "completed" | "failed",
          created_at: tx.created_at,
          updated_at: tx.updated_at,
        });
      }

      // Add sales data
      for (const sale of sales || []) {
        let artistInfo = { full_name: 'Unknown Artist', avatar_url: null };
        
        if (sale.artist_id) {
          const { data: artist } = await supabase
            .from('public_profiles')
            .select('full_name, avatar_url')
            .eq('id', sale.artist_id)
            .maybeSingle();
          
          if (artist) {
            artistInfo = artist;
          }
        }

        enrichedPayments.push({
          id: sale.id,
          project_id: sale.artwork_id || '',
          projectTitle: 'Project Payment',
          artistName: artistInfo.full_name || 'Unknown Artist',
          artistAvatar: artistInfo.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50',
          amount: sale.amount,
          currency: '',
          status: sale.status as "pending" | "completed" | "failed",
          created_at: sale.created_at,
          updated_at: sale.updated_at,
        });
      }

      setPayments(enrichedPayments);
    } catch (error: any) {
      toast({
        title: "Error fetching payments",
        description: "Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Real-time subscription for payment updates
  useEffect(() => {
    if (!user?.id) return;

    const transactionsChannel = supabase
      .channel(`client-transactions-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `buyer_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Transaction update:', payload.eventType);
          fetchPayments();
          if (payload.eventType === 'UPDATE') {
            toast({ title: 'Payment status updated!' });
          }
        }
      )
      .subscribe();

    const salesChannel = supabase
      .channel(`client-sales-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales',
          filter: `buyer_id=eq.${user.id}`
        },
        () => {
          fetchPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(salesChannel);
    };
  }, [user?.id, fetchPayments]);

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-600" />;
      case "failed":
        return <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />;
      default:
        return <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const handlePayment = async () => {
    if (!selectedPayment) return;
    
    setProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({ title: "Payment functionality coming soon!" });
    setProcessing(false);
    setSelectedPayment(null);
    setPaymentForm({ cardNumber: "", expiryDate: "", cvv: "", nameOnCard: "" });
  };

  const pendingPayments = payments.filter(p => p.status === "pending");
  const completedPayments = payments.filter(p => p.status === "completed" || p.status === "failed");

  const totalPending = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPaid = completedPayments
    .filter(p => p.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Payments</h2>
        <p className="text-muted-foreground text-sm">Manage your project payments and invoices</p>
      </div>

      {/* Payment Summary - Mobile responsive grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
        <Card className="transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] sm:text-sm font-medium">Pending</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-orange-600">{format(totalPending)}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{pendingPayments.length} pending</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] sm:text-sm font-medium">Paid</CardTitle>
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{format(totalPaid)}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] sm:text-sm font-medium">Failed</CardTitle>
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-red-600">
              {payments.filter(p => p.status === "failed").length}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <div className="space-y-3 sm:space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h3 className="text-base sm:text-lg font-medium">Pending Payments</h3>
          <div className="space-y-2 sm:space-y-3">
            {pendingPayments.map((payment, index) => (
              <Card 
                key={payment.id} 
                className={cn(
                  "border-orange-200 bg-orange-50/30 dark:bg-orange-900/10 transition-all duration-300 hover:shadow-md animate-fade-in",
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <img
                        src={payment.artistAvatar}
                        alt={payment.artistName}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{payment.projectTitle}</p>
                        <p className="text-xs text-muted-foreground">to {payment.artistName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{format(payment.amount)}</span>
                        <Badge className={cn("text-[10px] sm:text-xs", getStatusColor(payment.status))}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1 capitalize">{payment.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-2.5 sm:my-3" />
                  
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Created: {new Date(payment.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-7 sm:h-8 text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm"
                            className="h-7 sm:h-8 text-xs bg-gradient-to-r from-artswarit-purple to-blue-500"
                            onClick={() => setSelectedPayment(payment)}
                          >
                            <CreditCard className="h-3 w-3 mr-1" />
                            Pay
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-sm sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg">Complete Payment</DialogTitle>
                            <DialogDescription className="text-sm">
                              Pay {selectedPayment?.currency}{selectedPayment?.amount.toLocaleString()} to {selectedPayment?.artistName}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="bg-muted p-3 rounded-lg">
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Project:</span>
                                  <span className="font-medium truncate ml-2">{selectedPayment?.projectTitle}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Artist:</span>
                                  <span>{selectedPayment?.artistName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Amount:</span>
                                  <span className="font-semibold">{selectedPayment?.currency}{selectedPayment?.amount.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="nameOnCard" className="text-sm">Name on Card</Label>
                                <Input
                                  id="nameOnCard"
                                  value={paymentForm.nameOnCard}
                                  onChange={(e) => setPaymentForm({...paymentForm, nameOnCard: e.target.value})}
                                  placeholder="John Doe"
                                  className="mt-1"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="cardNumber" className="text-sm">Card Number</Label>
                                <Input
                                  id="cardNumber"
                                  value={paymentForm.cardNumber}
                                  onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                                  placeholder="1234 5678 9012 3456"
                                  className="mt-1"
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor="expiryDate" className="text-sm">Expiry</Label>
                                  <Input
                                    id="expiryDate"
                                    value={paymentForm.expiryDate}
                                    onChange={(e) => setPaymentForm({...paymentForm, expiryDate: e.target.value})}
                                    placeholder="MM/YY"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="cvv" className="text-sm">CVV</Label>
                                  <Input
                                    id="cvv"
                                    value={paymentForm.cvv}
                                    onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                                    placeholder="123"
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setSelectedPayment(null)} className="text-sm">
                              Cancel
                            </Button>
                            <Button 
                              onClick={handlePayment}
                              disabled={processing}
                              className="bg-gradient-to-r from-artswarit-purple to-blue-500 text-sm"
                            >
                              {processing ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <CreditCard className="h-4 w-4 mr-2" />
                              )}
                              Pay {selectedPayment?.currency}{selectedPayment?.amount.toLocaleString()}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="space-y-3 sm:space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <h3 className="text-base sm:text-lg font-medium">Payment History</h3>
        {completedPayments.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {completedPayments.map((payment, index) => (
              <Card 
                key={payment.id}
                className="transition-all duration-300 hover:shadow-md animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <img
                        src={payment.artistAvatar}
                        alt={payment.artistName}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{payment.projectTitle}</p>
                        <p className="text-xs text-muted-foreground">to {payment.artistName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{payment.currency}{payment.amount.toLocaleString()}</span>
                        <Badge className={cn("text-[10px] sm:text-xs", getStatusColor(payment.status))}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1 capitalize">{payment.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-2.5 sm:my-3" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                      <CheckCircle className="h-3 w-3" />
                      <span>Paid: {new Date(payment.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <InvoiceDownload
                        invoice={{
                          id: payment.id,
                          type: 'payment',
                          amount: payment.amount,
                          currency: payment.currency || 'USD',
                          date: payment.updated_at,
                          description: `Payment for ${payment.projectTitle}`,
                          to: payment.artistName,
                          status: payment.status,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
            <CreditCard className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
            <h3 className="text-sm font-medium text-muted-foreground mb-1">No payment history</h3>
            <p className="text-xs text-muted-foreground">Your completed payments will appear here</p>
          </div>
        )}
      </div>

      {/* Billing Address Section */}
      <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
        <BillingAddressForm />
      </div>

      {payments.length === 0 && (
        <div className="text-center py-12 sm:py-16 bg-muted/30 rounded-lg border border-dashed">
          <CreditCard className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mb-3 sm:mb-4" />
          <h3 className="text-sm sm:text-lg font-medium text-muted-foreground mb-1 sm:mb-2">No payments yet</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Your payment history will appear here</p>
        </div>
      )}
    </div>
  );
};

export default ClientPayments;
