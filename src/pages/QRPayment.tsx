import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { QrCode, Smartphone, ScanLine, CheckCircle2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface QRPaymentState {
  orderNumber?: string;
  total?: number;
  currency?: string;
  qrData?: {
    payload?: string;
    image_url?: string;
    qr_image?: string;
    url?: string;
  };
  bankDetails?: {
    account_holder?: string;
    iban?: string;
    bic?: string;
    reference?: string;
  };
}

export default function QRPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = (location.state || {}) as QRPaymentState;
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [qrGenerated, setQrGenerated] = useState(false);

  // Redirect if no state (direct URL access)
  useEffect(() => {
    if (!state.orderNumber && !state.qrData) {
      navigate('/shop', { replace: true });
    }
  }, [state, navigate]);

  // Generate QR code from payload
  useEffect(() => {
    const payload = state.qrData?.payload;
    if (payload && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, payload, {
        width: 280,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
        errorCorrectionLevel: 'M',
      })
        .then(() => setQrGenerated(true))
        .catch((err) => console.error('[QR] Generation failed:', err));
    }
  }, [state.qrData?.payload]);

  const imageUrl = state.qrData?.image_url || state.qrData?.qr_image || state.qrData?.url;
  const hasPayload = !!state.qrData?.payload;
  const formattedTotal = Number(state.total || 0).toFixed(2);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      toast.success('Gekopieerd!');
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const handleDone = () => {
    navigate('/bedankt', {
      state: {
        paymentType: 'qr',
        orderNumber: state.orderNumber,
        total: state.total,
        currency: state.currency,
      },
    });
  };

  if (!state.orderNumber && !state.qrData) return null;

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <QrCode className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Scan & betaal
          </h1>
          <p className="text-muted-foreground mt-2">
            Bestelling #{state.orderNumber}
          </p>
        </div>

        {/* QR Code */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6 mb-6">
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-xl p-4 shadow-inner">
              {hasPayload ? (
                <canvas ref={canvasRef} className={qrGenerated ? '' : 'hidden'} />
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Betaal QR code"
                  className="w-[280px] h-[280px] object-contain"
                />
              ) : (
                <div className="w-[280px] h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                  QR code niet beschikbaar
                </div>
              )}
              {hasPayload && !qrGenerated && (
                <div className="w-[280px] h-[280px] flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground">Te betalen</p>
            <p className="text-3xl font-bold text-foreground">
              €{formattedTotal}
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-3 mb-6">
            <p className="text-sm font-semibold text-foreground mb-2">Zo werkt het:</p>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Open je bankapp</p>
                <p className="text-xs text-muted-foreground">KBC, Belfius, ING, BNP Paribas Fortis, …</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <ScanLine className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Kies "QR code scannen"</p>
                <p className="text-xs text-muted-foreground">Meestal te vinden via het betaalmenu</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Bevestig de betaling</p>
                <p className="text-xs text-muted-foreground">Bedrag en begunstigde worden automatisch ingevuld</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bank details fallback */}
        {state.bankDetails && (
          <div className="bg-muted/50 rounded-xl border border-border p-5 mb-6">
            <p className="text-sm font-semibold text-foreground mb-3">
              Of schrijf handmatig over:
            </p>
            <div className="space-y-2 text-sm">
              {state.bankDetails.account_holder && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Begunstigde</span>
                  <span className="font-medium text-foreground">{state.bankDetails.account_holder}</span>
                </div>
              )}
              {state.bankDetails.iban && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">IBAN</span>
                  <button
                    onClick={() => handleCopy(state.bankDetails!.iban!, 'iban')}
                    className="flex items-center gap-1 font-mono font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {state.bankDetails.iban}
                    {copiedField === 'iban' ? (
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Bedrag</span>
                <span className="font-medium text-foreground">€{formattedTotal}</span>
              </div>
              {(state.orderNumber || state.bankDetails.reference) && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Mededeling</span>
                  <button
                    onClick={() => handleCopy(state.bankDetails?.reference || state.orderNumber || '', 'ref')}
                    className="flex items-center gap-1 font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {state.bankDetails.reference || state.orderNumber}
                    {copiedField === 'ref' ? (
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CTA */}
        <Button
          onClick={handleDone}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Ik heb betaald
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-3">
          Je ontvangt een bevestiging per e-mail zodra de betaling is ontvangen.
        </p>
      </div>
    </main>
  );
}
