import React, { useState, useEffect } from 'react';
import { Smartphone, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';

interface NFCPaymentProps {
  amount?: number;
  description?: string;
  onComplete: () => void;
}

const NFCPayment: React.FC<NFCPaymentProps> = ({ amount, description, onComplete }) => {
  const { user, makeOfflineTransaction } = useApp();
  const [isReading, setIsReading] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasNFCSupport = 'NDEFReader' in window;

  const handleStartNFCRead = async () => {
    if (!hasNFCSupport) {
      setError('NFC is not supported on this device');
      return;
    }

    setIsReading(true);
    setError(null);

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();

      ndef.addEventListener("reading", ({ message }: any) => {
        try {
          const decoder = new TextDecoder();
          const paymentData = JSON.parse(decoder.decode(message.records[0].data));
          
          if (paymentData.type !== 'volt-payment') {
            throw new Error('Invalid payment data');
          }

          handlePaymentReceived(paymentData);
        } catch (err) {
          setError('Invalid payment data received');
          setIsReading(false);
        }
      });
    } catch (err) {
      setError('Failed to start NFC reader');
      setIsReading(false);
    }
  };

  const handleStartNFCWrite = async () => {
    if (!hasNFCSupport || !amount || !description) {
      setError('NFC is not supported or payment details missing');
      return;
    }

    setIsWriting(true);
    setError(null);

    try {
      const paymentData = {
        type: 'volt-payment',
        amount,
        description,
        recipientId: user?.id,
        recipientPublicKey: user?.publicKey,
        timestamp: Date.now()
      };

      const ndef = new (window as any).NDEFReader();
      await ndef.write({
        records: [{
          recordType: "text",
          data: JSON.stringify(paymentData)
        }]
      });

      setSuccess(true);
      setTimeout(onComplete, 2000);
    } catch (err) {
      setError('Failed to write payment data');
      setIsWriting(false);
    }
  };

  const handlePaymentReceived = async (paymentData: any) => {
    try {
      await makeOfflineTransaction(
        paymentData.amount,
        paymentData.description,
        'Transfer',
        {
          recipientId: paymentData.recipientId,
          recipientPublicKey: paymentData.recipientPublicKey,
          paymentMethod: 'nfc'
        }
      );
      
      setSuccess(true);
      setTimeout(onComplete, 2000);
    } catch (err) {
      setError('Failed to process payment');
    }
  };

  return (
    <Card className="p-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className={`p-4 rounded-full ${
            success ? 'bg-success-100 text-success-500' :
            error ? 'bg-error-100 text-error-500' :
            'bg-primary-100 text-primary-500'
          }`}>
            <Smartphone className="h-8 w-8" />
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2">
          {amount ? 'Send via NFC' : 'Receive via NFC'}
        </h3>

        {amount && (
          <p className="text-2xl font-bold text-neutral-800 mb-4">
            {formatCurrency(amount)}
          </p>
        )}

        {error && (
          <div className="mb-4 p-3 bg-error-50 text-error-500 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-success-500 font-medium">
            Payment {amount ? 'sent' : 'received'} successfully!
          </div>
        ) : (
          <div className="space-y-4">
            {!hasNFCSupport ? (
              <p className="text-neutral-600">
                NFC is not supported on this device. Please try QR code payment instead.
              </p>
            ) : (
              <>
                <p className="text-neutral-600">
                  {isReading || isWriting ? (
                    'Hold your device near the other NFC device'
                  ) : (
                    amount ? 
                    'Tap to send payment via NFC' :
                    'Tap to start scanning for NFC payments'
                  )}
                </p>

                <Button
                  onClick={amount ? handleStartNFCWrite : handleStartNFCRead}
                  disabled={isReading || isWriting}
                  className="w-full"
                >
                  {amount ? 'Send Payment' : 'Scan for Payment'}
                </Button>
              </>
            )}

            <Button
              variant="outline"
              onClick={onComplete}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default NFCPayment;