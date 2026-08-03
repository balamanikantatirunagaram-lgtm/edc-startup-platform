"use client"

import * as React from "react"
import { useEffect, useRef } from "react"

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void
  onScanError?: (error: any) => void
}

export function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const scannerRef = useRef<any>(null)
  const onScanSuccessRef = useRef(onScanSuccess)
  const onScanErrorRef = useRef(onScanError)

  // Keep refs up to date without triggering re-initialization
  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess
  }, [onScanSuccess])

  useEffect(() => {
    onScanErrorRef.current = onScanError
  }, [onScanError])

  useEffect(() => {
    // Dynamically import to avoid SSR issues
    import("html5-qrcode").then(({ Html5QrcodeScanner }) => {
      if (scannerRef.current) return // already initialized

      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
        false
      )

      scanner.render(
        (text: string) => {
          onScanSuccessRef.current(text)
          scanner.clear().catch(() => {})
        },
        (error: any) => {
          if (onScanErrorRef.current) onScanErrorRef.current(error)
        }
      )

      scannerRef.current = scanner
    })

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
        scannerRef.current = null
      }
    }
  }, []) // Only run ONCE on mount - refs handle callback updates

  return (
    <div id="qr-reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-xl border" />
  )
}
