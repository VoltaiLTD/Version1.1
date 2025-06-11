import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Scan } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { generatePaymentQR } from '../../utils/crypto';
import { PaymentRequest } from '../../types';

interface QRPaymentProps {
  onComplete: () => void;
}

const QRPayment: React.FC<QRPaymentProps> = ({ onComplete }) => {
  const { user, currentAccount, makeOfflineTransaction } = useApp();
  const [showScanner, setShowScanner] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  const handleGenerateQR = () => {
    if (!user || !currentAccount) return;
    
    const paymentRequest: PaymentRequest = {
      amount: parseFloat(amount),
      description,
      recipientId: user.id,
      recipientPublicKey: user.publicKey,
      timestamp: Date.now()
    };
    
    return generatePaymentQR(paymentRequest);
  };
  
  const handleScanComplete = async (result: string) => {
    try {
      const paymentRequest = JSON.parse(result);
      if (paymentRequest.type !== 'volt-payment') {
        throw new Error('Invalid QR code');
      }
      
      await makeOfflineTransaction(
        paymentRequest.amount,
        paymentRequest.description,
        'Transfer',
        {
          recipientId: paymentRequest.recipientId,
          recipientPublicKey: paymentRequest.recipientPublicKey,
          paymentMethod: 'qr'
        }
      );
      
      onComplete();
    } catch (error) {
      console.error('Failed to process QR payment:', error);
    }
  };
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">QR Code Payment</h3>
      
      {showScanner ? (
        <div className="space-y-4">
          <div className="aspect-square bg-neutral-100 rounded-lg flex items-center justify-center">
            {/* QR Scanner component would go here */}
            <p className="text-neutral-500">Scanner placeholder</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowScanner(false)}
            className="w-full"
          >
            Cancel Scan
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field"
              placeholder="0.00"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              placeholder="Payment description"
            />
          </div>
          
          {amount && description && (
            <div className="flex justify-center p-4 bg-white rounded-lg border border-neutral-200">
              <QRCodeSVG
                value={handleGenerateQR() || ''}
                size={200}
                level="H"
                includeMargin
              />
            </div>
          )}
          
          <Button
            onClick={() => setShowScanner(true)}
            className="w-full"
          >
            <Scan className="h-5 w-5 mr-2" />
            Scan QR Code
          </Button>
        </div>
      )}
    </Card>
  );
};

export default QRPayment;