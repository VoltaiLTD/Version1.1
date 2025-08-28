import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Upload, Edit3, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ocrService, CardOCRResult, OCRProgress, validateCardNumber, formatCardNumber, maskCardNumber, parseExpiry } from '../../lib/ocr';
import { CardData } from '../../lib/payments/provider';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardScanned: (cardData: CardData) => void;
  title?: string;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onCardScanned,
  title = "Scan Card"
}) => {
  const [step, setStep] = useState<'camera' | 'upload' | 'manual' | 'review'>('camera');
  const [isScanning, setIsScanning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<OCRProgress | null>(null);
  const [scannedResult, setScannedResult] = useState<CardOCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Form state for manual entry and editing
  const [formData, setFormData] = useState({
    number: '',
    name: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  // Initialize camera when modal opens
  useEffect(() => {
    if (isOpen && step === 'camera') {
      initializeCamera();
    }
    
    return () => {
      cleanup();
    };
  }, [isOpen, step]);

  const initializeCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera initialization failed:', err);
      setError('Camera access denied. Please use manual entry or upload an image.');
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsScanning(true);
    setError(null);
    setOcrProgress(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) throw new Error('Canvas context not available');

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob for OCR
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
      });

      // Process with OCR
      const result = await ocrService.extractCardInfo(blob, setOcrProgress);
      
      setScannedResult(result);
      populateFormFromOCR(result);
      setStep('review');
    } catch (err) {
      console.error('Card scanning failed:', err);
      setError('Failed to scan card. Please try again or use manual entry.');
    } finally {
      setIsScanning(false);
      setOcrProgress(null);
    }
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError(null);
    setOcrProgress(null);

    try {
      const result = await ocrService.extractCardInfo(file, setOcrProgress);
      
      setScannedResult(result);
      populateFormFromOCR(result);
      setStep('review');
    } catch (err) {
      console.error('Image processing failed:', err);
      setError('Failed to process image. Please try again or use manual entry.');
    } finally {
      setIsScanning(false);
      setOcrProgress(null);
    }
  };

  const populateFormFromOCR = (result: CardOCRResult) => {
    const expiry = result.expiry ? parseExpiry(result.expiry) : null;
    
    setFormData({
      number: result.number || '',
      name: result.name || '',
      expiryMonth: expiry?.month || '',
      expiryYear: expiry?.year || '',
      cvv: ''
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.number) return 'Card number is required';
    if (!validateCardNumber(formData.number)) return 'Invalid card number';
    if (!formData.name.trim()) return 'Cardholder name is required';
    if (!formData.expiryMonth || !formData.expiryYear) return 'Expiry date is required';
    if (!formData.cvv || formData.cvv.length < 3) return 'CVV is required';

    // Check expiry date
    const currentDate = new Date();
    const expiryDate = new Date(parseInt(formData.expiryYear), parseInt(formData.expiryMonth) - 1);
    if (expiryDate < currentDate) return 'Card has expired';

    return null;
  };

  const handleSubmit = () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const cardData: CardData = {
      number: formData.number.replace(/\s/g, ''),
      expiryMonth: formData.expiryMonth.padStart(2, '0'),
      expiryYear: formData.expiryYear,
      cvv: formData.cvv,
      name: formData.name.trim().toUpperCase()
    };

    onCardScanned(cardData);
    handleClose();
  };

  const handleClose = () => {
    cleanup();
    setStep('camera');
    setIsScanning(false);
    setOcrProgress(null);
    setScannedResult(null);
    setError(null);
    setFormData({
      number: '',
      name: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: ''
    });
    onClose();
  };

  const renderCameraStep = () => (
    <div className="space-y-6">
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Overlay guide */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="border-2 border-white border-dashed rounded-lg w-80 h-48 flex items-center justify-center">
            <span className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
              Position card here
            </span>
          </div>
        </div>

        {/* Scanning overlay */}
        {isScanning && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">
                {ocrProgress ? `${ocrProgress.status}... ${Math.round(ocrProgress.progress)}%` : 'Scanning...'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={captureImage}
          disabled={isScanning}
          className="flex-1"
        >
          <Camera className="h-4 w-4 mr-2" />
          Capture Card
        </Button>
        <Button
          variant="outline"
          onClick={() => setStep('upload')}
          disabled={isScanning}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
        <Button
          variant="outline"
          onClick={() => setStep('manual')}
          disabled={isScanning}
        >
          <Edit3 className="h-4 w-4 mr-2" />
          Manual
        </Button>
      </div>
    </div>
  );

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8">
          <Upload className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600 mb-4">Upload a clear image of your card</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
          >
            Choose Image
          </Button>
        </div>
      </div>

      {isScanning && (
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-neutral-600">
            {ocrProgress ? `${ocrProgress.status}... ${Math.round(ocrProgress.progress)}%` : 'Processing...'}
          </p>
        </div>
      )}

      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={() => setStep('camera')}
          disabled={isScanning}
          className="flex-1"
        >
          Back to Camera
        </Button>
        <Button
          variant="outline"
          onClick={() => setStep('manual')}
          disabled={isScanning}
          className="flex-1"
        >
          Manual Entry
        </Button>
      </div>
    </div>
  );

  const renderManualStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Card Number
        </label>
        <input
          type="text"
          value={formatCardNumber(formData.number)}
          onChange={(e) => handleInputChange('number', e.target.value.replace(/\s/g, ''))}
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          className="input-field font-mono"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Cardholder Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="JOHN DOE"
          className="input-field uppercase"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Month
          </label>
          <select
            value={formData.expiryMonth}
            onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
            className="input-field"
          >
            <option value="">MM</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                {String(i + 1).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Year
          </label>
          <select
            value={formData.expiryYear}
            onChange={(e) => handleInputChange('expiryYear', e.target.value)}
            className="input-field"
          >
            <option value="">YYYY</option>
            {Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() + i;
              return (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            CVV
          </label>
          <input
            type="text"
            value={formData.cvv}
            onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
            placeholder="123"
            maxLength={4}
            className="input-field font-mono"
          />
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={() => setStep('camera')}
          className="flex-1"
        >
          Back to Camera
        </Button>
        <Button
          onClick={() => setStep('review')}
          className="flex-1"
        >
          Review
        </Button>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      {scannedResult && (
        <div className="bg-neutral-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Check className="h-4 w-4 text-success-500" />
            <span className="text-sm font-medium">Scanned with {scannedResult.confidence}% confidence</span>
          </div>
          <p className="text-xs text-neutral-600">
            Please review and edit the information below if needed.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Card Number
          </label>
          <input
            type="text"
            value={formatCardNumber(formData.number)}
            onChange={(e) => handleInputChange('number', e.target.value.replace(/\s/g, ''))}
            className="input-field font-mono"
          />
          <p className="text-xs text-neutral-500 mt-1">
            Preview: {formData.number ? maskCardNumber(formData.number) : 'Enter card number'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Cardholder Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="input-field uppercase"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Month
            </label>
            <select
              value={formData.expiryMonth}
              onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
              className="input-field"
            >
              <option value="">MM</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                  {String(i + 1).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Year
            </label>
            <select
              value={formData.expiryYear}
              onChange={(e) => handleInputChange('expiryYear', e.target.value)}
              className="input-field"
            >
              <option value="">YYYY</option>
              {Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() + i;
                return (
                  <option key={year} value={String(year)}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              CVV
            </label>
            <input
              type="text"
              value={formData.cvv}
              onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
              maxLength={4}
              className="input-field font-mono"
            />
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={() => setStep('manual')}
          className="flex-1"
        >
          Edit
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1"
        >
          <Check className="h-4 w-4 mr-2" />
          Use This Card
        </Button>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">{title}</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="mb-4">
                <div className="bg-neutral-100 p-3 rounded-lg text-sm text-neutral-600">
                  <p className="font-medium mb-1">Privacy Notice:</p>
                  <p>Card information is processed locally and securely. We never store your full card number.</p>
                </div>
              </div>

              {step === 'camera' && renderCameraStep()}
              {step === 'upload' && renderUploadStep()}
              {step === 'manual' && renderManualStep()}
              {step === 'review' && renderReviewStep()}
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};