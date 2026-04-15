"use client";

import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
  fps?: number;
  qrbox?: number;
}

export default function QRScanner({ 
  onScanSuccess, 
  onScanError, 
  fps = 10, 
  qrbox = 250 
}: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize the scanner
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps, qrbox, rememberLastUsedCamera: true },
      /* verbose= */ false
    );

    const lastScanTime = { current: 0 };

    scannerRef.current.render(
      (decodedText) => {
        const now = Date.now();
        if (now - lastScanTime.current < 3000) return; // 3s debounce per item
        
        lastScanTime.current = now;
        onScanSuccess(decodedText);
      },
      (errorMessage) => {
        if (onScanError) onScanError(errorMessage);
      }
    );

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    };
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-lg border border-border/10 bg-surface-lowest">
      <div id="qr-reader" className="w-full" />
      <style jsx global>{`
        #qr-reader {
          border: none !important;
        }
        #qr-reader__scan_region {
           background: #121212 !important;
        }
        #qr-reader__dashboard_section_csr button {
          background-color: rgb(16, 185, 129) !important;
          color: white !important;
          padding: 8px 16px !important;
          border-radius: 4px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          font-size: 10px !important;
          letter-spacing: 0.1em !important;
          border: none !important;
          margin: 10px 0 !important;
        }
        #qr-reader img {
           display: none !important;
        }
      `}</style>
    </div>
  );
}
