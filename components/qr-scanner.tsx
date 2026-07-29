"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void
  onScanError?: (error: any) => void
}

export function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  
  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    )
    
    scannerRef.current.render(
      (text) => {
        onScanSuccess(text)
        scannerRef.current?.clear()
      },
      (error) => {
        if (onScanError) onScanError(error)
      }
    )

    return () => {
      scannerRef.current?.clear().catch(console.error)
    }
  }, [onScanSuccess, onScanError])

  return (
    <div id="qr-reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-xl border" />
  )
}
