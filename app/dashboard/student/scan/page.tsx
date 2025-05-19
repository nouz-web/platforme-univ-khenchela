"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QrCode, Camera, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ScanQRCodePage() {
  const router = useRouter()
  const [scanning, setScanning] = useState(false)
  const [qrCode, setQrCode] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      setVideoStream(stream)
      setScanning(true)

      // In a real implementation, we would use a QR code scanning library
      // For this example, we'll simulate scanning after a delay
      setTimeout(() => {
        // Simulate a successful scan
        const simulatedCode = "COURSE-123-" + Math.floor(Math.random() * 1000)
        handleQRCodeDetected(simulatedCode)
      }, 3000)
    } catch (error) {
      console.error("Error accessing camera:", error)
      setMessage({ type: "error", text: "Could not access camera. Please check permissions." })
    }
  }

  const stopScanner = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop())
      setVideoStream(null)
    }
    setScanning(false)
  }

  const handleQRCodeDetected = (code: string) => {
    setQrCode(code)
    stopScanner()
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit()
  }

  const handleSubmit = async () => {
    if (!qrCode) {
      setMessage({ type: "error", text: "Please enter a QR code" })
      return
    }

    setMessage(null)

    try {
      // In a real implementation, we would validate the QR code with the server
      // For this example, we'll simulate a successful validation
      setTimeout(() => {
        setMessage({
          type: "success",
          text: "Attendance recorded successfully! You are marked as present for this session.",
        })

        // Redirect to dashboard after a delay
        setTimeout(() => {
          router.push("/dashboard/student")
        }, 2000)
      }, 1000)
    } catch (error) {
      console.error("Error validating QR code:", error)
      setMessage({ type: "error", text: "Invalid QR code. Please try again." })
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [videoStream])

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Scan QR Code</h1>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Registration</CardTitle>
          <CardDescription>Scan the QR code displayed by your teacher to register your attendance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert variant={message.type === "success" ? "default" : "destructive"}>
              {message.type === "success" ? <QrCode className="h-4 w-4" /> : <X className="h-4 w-4" />}
              <AlertTitle>{message.type === "success" ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {scanning ? (
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-dashed border-primary rounded-md"></div>
              </div>
              <video className="w-full h-full object-cover" autoPlay playsInline muted />
              <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-500 dark:text-gray-400">
                Position the QR code within the frame
              </div>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="qr-code" className="text-sm font-medium">
                  QR Code
                </label>
                <Input
                  id="qr-code"
                  placeholder="Enter QR code manually"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                />
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {scanning ? (
            <Button variant="outline" onClick={stopScanner}>
              Cancel
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={startScanner}>
                <Camera className="mr-2 h-4 w-4" />
                Scan with Camera
              </Button>
              <Button onClick={handleSubmit} disabled={!qrCode}>
                Submit
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
