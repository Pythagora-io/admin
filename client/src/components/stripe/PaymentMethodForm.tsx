import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';

interface PaymentMethodFormProps {
  onSuccess?: (paymentMethod: any) => void;
  onCancel?: () => void;
  buttonText?: string;
  isProcessing?: boolean;
}

export function PaymentMethodForm({
  onSuccess,
  onCancel,
  buttonText = 'Save Payment Method',
  isProcessing = false
}: PaymentMethodFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setProcessing(false);
      setError('Card element not found');
      return;
    }

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        setError(error.message || 'An error occurred with your payment method');
        toast({
          variant: "destructive",
          title: "Payment Error",
          description: error.message || 'An error occurred with your payment method',
        });
      } else if (paymentMethod) {
        if (onSuccess) {
          onSuccess(paymentMethod);
        }
        toast({
          title: "Success",
          description: "Payment method saved successfully",
        });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || 'An unexpected error occurred',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="border rounded-md p-3 bg-background">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!stripe || processing || isProcessing}
        >
          {processing || isProcessing ? "Processing..." : buttonText}
        </Button>
      </div>
    </form>
  );
}