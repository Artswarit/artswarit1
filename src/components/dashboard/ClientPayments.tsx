
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Download, Eye, DollarSign, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Payment {
  id: string;
  projectTitle: string;
  artistName: string;
  artistAvatar: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "overdue" | "processing";
  dueDate: string;
  paidDate?: string;
  invoiceUrl?: string;
  description: string;
  paymentMethod?: string;
}

const ClientPayments = () => {
  const [payments] = useState<Payment[]>([
    {
      id: "pay_1",
      projectTitle: "Album Cover Design",
      artistName: "Alex Rivera",
      artistAvatar: "https://images.unsplash.com/photo-1549213783-8284d0336c4f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      amount: 15000,
      currency: "₹",
      status: "pending",
      dueDate: "2025-06-01",
      description: "50% upfront payment for album cover design project",
      invoiceUrl: "#"
    },
    {
      id: "pay_2",
      projectTitle: "Logo Design",
      artistName: "Taylor Reed",
      artistAvatar: "https://images.unsplash.com/photo-1573496358961-3c82861ab8f4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80",
      amount: 12000,
      currency: "₹",
      status: "paid",
      dueDate: "2025-05-10",
      paidDate: "2025-05-08",
      description: "Final payment for logo design project",
      paymentMethod: "Credit Card ending in 4242",
      invoiceUrl: "#"
    },
    {
      id: "pay_3",
      projectTitle: "Script Writing",
      artistName: "Maya Johnson",
      artistAvatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      amount: 8500,
      currency: "₹",
      status: "overdue",
      dueDate: "2025-05-20",
      description: "Final payment for script writing project",
      invoiceUrl: "#"
    },
    {
      id: "pay_4",
      projectTitle: "Voice Over Work",
      artistName: "Jordan Smith",
      artistAvatar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      amount: 5000,
      currency: "₹",
      status: "processing",
      dueDate: "2025-05-25",
      description: "Payment for voice over recording services",
      invoiceUrl: "#"
    }
  ]);

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: ""
  });

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "processing":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handlePayment = () => {
    if (!selectedPayment) return;
    console.log("Processing payment for:", selectedPayment.id);
    // Here you would integrate with your payment processor
    setSelectedPayment(null);
    setPaymentForm({ cardNumber: "", expiryDate: "", cvv: "", nameOnCard: "" });
  };

  const pendingPayments = payments.filter(p => p.status === "pending" || p.status === "overdue");
  const completedPayments = payments.filter(p => p.status === "paid" || p.status === "processing");

  const totalPending = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPaid = completedPayments
    .filter(p => p.status === "paid")
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Payments</h2>
        <p className="text-muted-foreground">Manage your project payments and invoices</p>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{totalPending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{pendingPayments.length} pending payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {payments.filter(p => p.status === "overdue").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Pending Payments</h3>
          <div className="space-y-3">
            {pendingPayments.map((payment) => (
              <Card key={payment.id} className={payment.status === "overdue" ? "border-red-200 bg-red-50/30" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={payment.artistAvatar}
                        alt={payment.artistName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{payment.projectTitle}</p>
                        <p className="text-sm text-muted-foreground">to {payment.artistName}</p>
                        <p className="text-xs text-muted-foreground">{payment.description}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{payment.currency}{payment.amount.toLocaleString()}</span>
                        <Badge className={getStatusColor(payment.status)}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1 capitalize">{payment.status}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Due: {new Date(payment.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Invoice
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm"
                          className="bg-gradient-to-r from-artswarit-purple to-blue-500"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Pay Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Complete Payment</DialogTitle>
                          <DialogDescription>
                            Pay {selectedPayment?.currency}{selectedPayment?.amount.toLocaleString()} to {selectedPayment?.artistName}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">Payment Details</span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Project:</span>
                                <span>{selectedPayment?.projectTitle}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Artist:</span>
                                <span>{selectedPayment?.artistName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Amount:</span>
                                <span className="font-medium">{selectedPayment?.currency}{selectedPayment?.amount.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="nameOnCard">Name on Card</Label>
                              <Input
                                id="nameOnCard"
                                value={paymentForm.nameOnCard}
                                onChange={(e) => setPaymentForm({...paymentForm, nameOnCard: e.target.value})}
                                placeholder="John Doe"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="cardNumber">Card Number</Label>
                              <Input
                                id="cardNumber"
                                value={paymentForm.cardNumber}
                                onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                                placeholder="1234 5678 9012 3456"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor="expiryDate">Expiry Date</Label>
                                <Input
                                  id="expiryDate"
                                  value={paymentForm.expiryDate}
                                  onChange={(e) => setPaymentForm({...paymentForm, expiryDate: e.target.value})}
                                  placeholder="MM/YY"
                                />
                              </div>
                              <div>
                                <Label htmlFor="cvv">CVV</Label>
                                <Input
                                  id="cvv"
                                  value={paymentForm.cvv}
                                  onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                                  placeholder="123"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSelectedPayment(null)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handlePayment}
                            className="bg-gradient-to-r from-artswarit-purple to-blue-500"
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Pay {selectedPayment?.currency}{selectedPayment?.amount.toLocaleString()}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Payment History</h3>
        <div className="space-y-3">
          {completedPayments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={payment.artistAvatar}
                      alt={payment.artistName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{payment.projectTitle}</p>
                      <p className="text-sm text-muted-foreground">to {payment.artistName}</p>
                      {payment.paymentMethod && (
                        <p className="text-xs text-muted-foreground">Paid via {payment.paymentMethod}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{payment.currency}{payment.amount.toLocaleString()}</span>
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1 capitalize">{payment.status}</span>
                      </Badge>
                    </div>
                    {payment.paidDate && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CheckCircle className="h-3 w-3" />
                        <span>Paid: {new Date(payment.paidDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Receipt
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {payments.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No payments yet</h3>
          <p className="text-muted-foreground">Your payment history will appear here</p>
        </div>
      )}
    </div>
  );
};

export default ClientPayments;
