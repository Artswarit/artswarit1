import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, CreditCard, Clock, AlertTriangle, 
  Lock, CheckCircle, XCircle
} from "lucide-react";

interface ClientTrustSignalsProps {
  signals: {
    paymentVerified: boolean;
    onTimePaymentRate: number;
    disputeCount: number;
    escrowUsed: boolean;
    totalPayments: number;
  };
}

const TrustItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  status: 'good' | 'warning' | 'neutral';
}> = ({ icon, label, value, status }) => {
  const statusColors = {
    good: 'text-green-600 bg-green-500/10',
    warning: 'text-amber-600 bg-amber-500/10',
    neutral: 'text-muted-foreground bg-muted/50',
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusColors[status]}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
      {status === 'good' && <CheckCircle className="w-4 h-4 text-green-500" />}
      {status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
    </div>
  );
};

const ClientTrustSignals: React.FC<ClientTrustSignalsProps> = ({ signals }) => {
  const paymentRateStatus = signals.onTimePaymentRate >= 90 ? 'good' : signals.onTimePaymentRate >= 70 ? 'warning' : 'neutral';
  const disputeStatus = signals.disputeCount === 0 ? 'good' : signals.disputeCount <= 2 ? 'warning' : 'neutral';

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Payment & Trust Signals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TrustItem
            icon={<CreditCard className="w-5 h-5" />}
            label="Payment Method"
            value={signals.paymentVerified ? "Verified" : "Not Verified"}
            status={signals.paymentVerified ? 'good' : 'neutral'}
          />
          
          <TrustItem
            icon={<Clock className="w-5 h-5" />}
            label="On-Time Payment Rate"
            value={signals.totalPayments > 0 ? `${signals.onTimePaymentRate}%` : "No history"}
            status={signals.totalPayments > 0 ? paymentRateStatus : 'neutral'}
          />
          
          <TrustItem
            icon={<AlertTriangle className="w-5 h-5" />}
            label="Dispute History"
            value={signals.disputeCount === 0 ? "No disputes" : `${signals.disputeCount} dispute(s)`}
            status={disputeStatus}
          />
          
          <TrustItem
            icon={<Lock className="w-5 h-5" />}
            label="Escrow Preference"
            value={signals.escrowUsed ? "Uses Escrow" : "Not specified"}
            status={signals.escrowUsed ? 'good' : 'neutral'}
          />
        </div>

        {/* Trust Score Summary */}
        <div className="mt-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Trust Score</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((level) => {
                const score = calculateTrustScore(signals);
                const filled = level <= score;
                return (
                  <div
                    key={level}
                    className={`w-4 h-4 rounded-full ${filled ? 'bg-primary' : 'bg-muted'}`}
                  />
                );
              })}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Based on payment history, verification status, and dispute record
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

function calculateTrustScore(signals: ClientTrustSignalsProps['signals']): number {
  let score = 1; // Base score
  if (signals.paymentVerified) score += 1;
  if (signals.onTimePaymentRate >= 90) score += 1;
  if (signals.disputeCount === 0) score += 1;
  if (signals.escrowUsed) score += 1;
  return Math.min(score, 5);
}

export default ClientTrustSignals;
