import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  QrCode,
  Camera,
  Upload,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Info,
  Copy,
  Check,
} from 'lucide-react';
import jsQR from 'jsqr';
import { useApp } from '../context/AppContext';
import { parseAndValidateUpiQr, generateUpiDeepLink } from '../utils/upi';
import { formatINR } from '../utils/formatters';

export default function ScanAndPayModal({ isOpen, onClose, settlement }) {
  const { handleSettle, addToast } = useApp();

  // Modal steps: 'SCANNER' | 'INVALID' | 'CONFIRM' | 'INITIATED'
  const [step, setStep] = useState('SCANNER');
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedUpi, setScannedUpi] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [processingSettle, setProcessingSettle] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera stream & scan loop
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  }, []);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setStep('SCANNER');
      setCameraError(null);
      setScannedUpi(null);
      setPaymentAmount(settlement ? String(settlement.amount) : '');
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, settlement, stopCamera]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Request camera and start continuous scan
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by your browser. Please upload a QR image.');
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
        animationFrameRef.current = requestAnimationFrame(scanTick);
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in browser settings or upload a QR image.');
      } else {
        setCameraError('Unable to access camera. Please select a QR image file.');
      }
    }
  };

  // Video frame scan tick
  const scanTick = () => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanTick);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && code.data) {
      handleQrDecoded(code.data);
      return; // Stop scan loop
    }

    animationFrameRef.current = requestAnimationFrame(scanTick);
  };

  // Process decoded QR data
  const handleQrDecoded = (rawData) => {
    stopCamera();

    const result = parseAndValidateUpiQr(rawData);

    if (!result.isValid) {
      setStep('INVALID');
      return;
    }

    const upiData = result.data;
    setScannedUpi(upiData);

    // If QR provides amount, use it. Otherwise use settlement amount or empty
    if (upiData.am) {
      setPaymentAmount(String(upiData.am));
    } else if (settlement) {
      setPaymentAmount(String(settlement.amount));
    }

    setStep('CONFIRM');
  };

  // Handle uploaded QR image file
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          handleQrDecoded(code.data);
        } else {
          setStep('INVALID');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Pay Now: open UPI deep link
  const handlePayNow = () => {
    if (!scannedUpi) return;

    const amt = parseFloat(paymentAmount) || settlement?.amount || 0;
    if (amt <= 0) {
      addToast('Please enter a valid payment amount', 'error');
      return;
    }

    const upiUrl = generateUpiDeepLink({
      pa: scannedUpi.pa,
      pn: scannedUpi.pn,
      am: amt,
      cu: scannedUpi.cu || 'INR',
      tn: `ExpenseFlow - ${settlement ? settlement.groupName || 'Settlement' : 'Debt Clearance'}`,
    });

    // Deep link trigger for mobile UPI apps
    window.location.href = upiUrl;

    // Transition to verification screen
    setStep('INITIATED');
  };

  // Mark settlement as paid
  const handleConfirmPaid = async () => {
    if (!settlement) {
      addToast('Payment recorded successfully!', 'success');
      onClose();
      return;
    }

    setProcessingSettle(true);
    try {
      await handleSettle(settlement.id, {
        paymentMethod: 'UPI',
        upiId: scannedUpi?.pa || '',
      });
      addToast(`Settlement marked as Paid via UPI!`, 'success');
      onClose();
    } catch (err) {
      addToast(err.message || 'Failed to update settlement status', 'error');
    } finally {
      setProcessingSettle(false);
    }
  };

  // Keep settlement pending
  const handleKeepPending = () => {
    addToast('Settlement kept pending', 'info');
    onClose();
  };

  // Copy UPI ID helper
  const handleCopyUpi = () => {
    if (!scannedUpi?.pa) return;
    navigator.clipboard.writeText(scannedUpi.pa);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Demo QR injector for testing when camera is unavailable
  const handleLoadDemoQr = (payeeName, payeeUpi, amount) => {
    const demoString = `upi://pay?pa=${payeeUpi}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=Dinner+Split`;
    handleQrDecoded(demoString);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg rounded-3xl border border-slate-700/60 bg-slate-900/95 shadow-glass p-5 sm:p-7 text-white backdrop-blur-2xl my-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white shadow-glow-cyan">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 id="modal-title" className="text-lg font-bold text-white tracking-tight">
                  {step === 'CONFIRM' ? 'Payment Details' : step === 'INITIATED' ? 'Payment Initiated' : 'Scan UPI QR'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {step === 'CONFIRM'
                    ? 'Verify recipient details before transferring funds.'
                    : step === 'INITIATED'
                    ? 'Confirm whether your UPI transaction was completed.'
                    : "Scan the recipient's UPI QR code to continue payment."}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Settlement Context Banner (if tied to settlement) */}
          {settlement && step !== 'INITIATED' && (
            <div className="mt-4 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-indigo-300">Settling:</span>
                <span className="text-slate-200 font-medium">{settlement.fromUser?.name}</span>
                <ArrowRight className="w-3 h-3 text-cyan-400" />
                <span className="text-slate-200 font-medium">{settlement.toUser?.name}</span>
              </div>
              <span className="font-bold text-cyan-400">{formatINR(settlement.amount)}</span>
            </div>
          )}

          {/* ================= STEP 1: SCANNER ================= */}
          {step === 'SCANNER' && (
            <div className="mt-5 space-y-4">
              {/* Camera Preview Container */}
              <div className="relative aspect-[4/3] sm:aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                {cameraError ? (
                  <div className="p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-rose-300 max-w-xs">{cameraError}</p>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        onClick={startCamera}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      muted
                      autoPlay
                      playsInline
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Scan Guides & Laser */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl border-2 border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.35)]">
                        {/* Corner markers */}
                        <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg" />
                        <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg" />
                        <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg" />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-cyan-400 rounded-br-lg" />

                        {/* Animated Laser Beam */}
                        {isScanning && (
                          <motion.div
                            animate={{ y: [0, 190, 0] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                            className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#06b6d4]"
                          />
                        )}
                      </div>
                    </div>

                    <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none">
                      <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[11px] font-medium text-slate-300 border border-slate-700/60">
                        Point your camera at a UPI QR code
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Upload & Demo Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>Upload QR Image</span>
                </button>

                {/* Quick Demo Test Buttons */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                  <span className="text-[11px] text-slate-500 font-medium">Demo:</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleLoadDemoQr(
                        settlement?.toUser?.name || 'Priya',
                        'priya@okaxis',
                        settlement?.amount || 500
                      )
                    }
                    className="px-2.5 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[11px] font-semibold transition-all"
                  >
                    Test Payee QR (₹{settlement?.amount || 500})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: INVALID QR ================= */}
          {step === 'INVALID' && (
            <div className="mt-6 py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center shadow-lg">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Invalid QR Code</h4>
                <p className="text-xs text-rose-300 max-w-sm mx-auto">
                  Please scan a valid UPI payment QR code.
                </p>
                <p className="text-[11px] text-slate-500">
                  Expected standard UPI URL (e.g. upi://pay?pa=recipient@bank...)
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep('SCANNER');
                    startCamera();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-xs font-bold text-white transition-all shadow-glow-cyan"
                >
                  Scan Again
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Upload Another File
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: PAYMENT CONFIRMATION ================= */}
          {step === 'CONFIRM' && scannedUpi && (
            <div className="mt-5 space-y-5">
              {/* Payment Details Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                {/* Payee Info */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Payee:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{scannedUpi.pn}</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>

                {/* UPI ID */}
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <span className="text-xs text-slate-400 font-medium">UPI ID:</span>
                  <div className="flex items-center gap-1.5">
                    <code className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-800/40">
                      {scannedUpi.pa}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <span className="text-xs text-slate-400 font-medium">Amount:</span>
                  {scannedUpi.am ? (
                    <span className="font-extrabold text-lg text-emerald-400">
                      {formatINR(scannedUpi.am)}
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5 w-36">
                      <span className="text-slate-400 font-bold text-sm">₹</span>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  )}
                </div>

                {/* Currency */}
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <span className="text-xs text-slate-400 font-medium">Currency:</span>
                  <span className="text-xs font-bold text-slate-300">{scannedUpi.cu || 'INR'}</span>
                </div>
              </div>

              {/* Settlement amount mismatch note */}
              {settlement &&
                scannedUpi.am &&
                Number(scannedUpi.am) !== Number(settlement.amount) && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3 text-xs text-amber-300">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 shrink-0" />
                      <span>QR amount ({formatINR(scannedUpi.am)}) differs from settlement ({formatINR(settlement.amount)}).</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaymentAmount(String(settlement.amount))}
                      className="underline font-semibold hover:text-white shrink-0"
                    >
                      Use ₹{settlement.amount}
                    </button>
                  </div>
                )}

              {/* Actions: Cancel or Pay Now */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePayNow}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold text-xs shadow-glow-cyan transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                >
                  <span>Pay Now</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 4: INITIATED / RESULT HANDLING ================= */}
          {step === 'INITIATED' && (
            <div className="mt-6 py-4 space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-white">Payment initiated</h4>
                <p className="text-sm font-semibold text-slate-200">
                  Did you complete the payment?
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Please verify whether the UPI transaction was completed in your payment app before updating the status.
                </p>
              </div>

              {/* Summary Card */}
              {scannedUpi && (
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 max-w-sm mx-auto text-xs space-y-1.5 text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recipient:</span>
                    <span className="font-semibold text-slate-200">{scannedUpi.pn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">UPI ID:</span>
                    <span className="font-mono text-cyan-400">{scannedUpi.pa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount:</span>
                    <span className="font-bold text-emerald-400">{formatINR(paymentAmount || settlement?.amount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Method:</span>
                    <span className="font-semibold text-indigo-400">UPI Transfer</span>
                  </div>
                </div>
              )}

              {/* Verification Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleKeepPending}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700/80 text-xs font-semibold text-slate-300 transition-colors"
                >
                  No, Keep Pending
                </button>
                <button
                  type="button"
                  disabled={processingSettle}
                  onClick={handleConfirmPaid}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold text-xs shadow-glow-cyan transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{processingSettle ? 'Updating...' : 'Yes, Mark as Paid'}</span>
                </button>
              </div>

              {/* Re-trigger link */}
              <button
                type="button"
                onClick={handlePayNow}
                className="text-[11px] text-slate-500 hover:text-cyan-400 transition-colors underline"
              >
                App didn't open? Click here to launch UPI app again
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
