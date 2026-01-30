import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface InvoiceData {
  id: string;
  type: 'payment' | 'payout' | 'subscription';
  amount: number;
  currency?: string;
  date: string;
  description: string;
  from?: string;
  to?: string;
  status: string;
}

interface InvoiceDownloadProps {
  invoice: InvoiceData;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'icon';
}

export function InvoiceDownload({ invoice, variant = 'outline', size = 'sm' }: InvoiceDownloadProps) {
  const [downloading, setDownloading] = useState(false);

  const generateInvoiceHTML = () => {
    const currencySymbol = invoice.currency === 'USD' ? '$' : invoice.currency === 'INR' ? '₹' : '$';
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${invoice.id.slice(0, 8)}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 40px; background: #f8f9fa; }
    .invoice { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .logo { font-size: 28px; font-weight: bold; color: #7c3aed; }
    .invoice-title { text-align: right; }
    .invoice-title h1 { margin: 0; font-size: 24px; color: #333; }
    .invoice-title p { margin: 5px 0 0; color: #666; }
    .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .details-section h3 { margin: 0 0 10px; font-size: 14px; color: #666; text-transform: uppercase; }
    .details-section p { margin: 5px 0; color: #333; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .table th { background: #f8f9fa; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e9ecef; }
    .table td { padding: 12px; border-bottom: 1px solid #e9ecef; }
    .total-row { font-weight: bold; font-size: 18px; }
    .total-row td { border-top: 2px solid #333; padding-top: 20px; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status-completed { background: #d4edda; color: #155724; }
    .status-pending { background: #fff3cd; color: #856404; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e9ecef; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="logo">Artswarit</div>
      <div class="invoice-title">
        <h1>INVOICE</h1>
        <p>#${invoice.id.slice(0, 8).toUpperCase()}</p>
      </div>
    </div>
    
    <div class="details">
      <div class="details-section">
        <h3>${invoice.type === 'payout' ? 'From' : 'Bill To'}</h3>
        <p><strong>${invoice.type === 'payout' ? invoice.from || 'Client' : invoice.to || 'Customer'}</strong></p>
        <p>Via Artswarit Platform</p>
      </div>
      <div class="details-section">
        <h3>Invoice Details</h3>
        <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><strong>Status:</strong> <span class="status status-${invoice.status}">${invoice.status.toUpperCase()}</span></p>
      </div>
    </div>
    
    <table class="table">
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${invoice.description}</td>
          <td style="text-align: right">${currencySymbol}${invoice.amount.toLocaleString('en-IN')}</td>
        </tr>
        <tr class="total-row">
          <td><strong>Total</strong></td>
          <td style="text-align: right"><strong>${currencySymbol}${invoice.amount.toLocaleString('en-IN')}</strong></td>
        </tr>
      </tbody>
    </table>
    
    <div class="footer">
      <p>Thank you for using Artswarit!</p>
      <p>Platform Name: Artswarit | Legal Name (PAN Holder): Ashwareet Basu</p>
      <p>For queries, contact support@artswarit.com</p>
    </div>
  </div>
</body>
</html>
    `;
  };

  const handleDownload = async () => {
    setDownloading(true);
    
    try {
      const html = generateInvoiceHTML();
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        
        // Wait for content to load then trigger print
        printWindow.onload = () => {
          printWindow.print();
        };
        
        toast.success('Invoice opened for download/print');
      } else {
        // Fallback: download as HTML file
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoice.id.slice(0, 8)}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Invoice downloaded');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={downloading}
    >
      {downloading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : size === 'icon' ? (
        <Download className="h-4 w-4" />
      ) : (
        <>
          <FileText className="h-4 w-4 mr-2" />
          Invoice
        </>
      )}
    </Button>
  );
}
