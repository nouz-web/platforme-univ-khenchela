"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QrCode, Camera, X, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ScanQRCodePage() {
  const router = useRouter()
  const [scanning, setScanning] = useState(false)
  const [qrCode, setQrCode] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null)
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "prompt">("prompt")
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera")
  const [isLoading, setIsLoading] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const startScanner = async () => {
    setIsLoading(true)
    setMessage(null)

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set a timeout for camera initialization
    timeoutRef.current = setTimeout(() => {
      if (isLoading && !videoStream) {
        setIsLoading(false)
        setMessage({
          type: "warning",
          text: "Camera access timed out. Please check your camera permissions or use manual entry.",
        })
        setCameraPermission("denied")
        setActiveTab("manual")
      }
    }, 10000) // 10 second timeout

    try {
      // Check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser doesn't support camera access. Please use manual entry.")
      }

      // Request camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      // Clear the timeout since we successfully got the stream
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      setVideoStream(stream)
      setCameraPermission("granted")
      setScanning(true)
      setIsLoading(false)

      // Connect the stream to the video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch((err) => {
          console.error("Error playing video:", err)
          setMessage({
            type: "error",
            text: "Could not play video stream. Please try again or use manual entry.",
          })
        })
      }

      // In a real implementation, we would use a QR code scanning library
      // For this example, we'll simulate scanning after a delay
      setTimeout(() => {
        if (scanning) {
          // Simulate a successful scan
          const simulatedCode = "COURSE-123-" + Math.floor(Math.random() * 1000)
          handleQRCodeDetected(simulatedCode)
        }
      }, 3000)
    } catch (error) {
      // Clear the timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      console.error("Error accessing camera:", error)
      setIsLoading(false)

      // Handle specific error types
      if (error instanceof DOMException) {
        if (error.name === "NotAllowedError") {
          setCameraPermission("denied")
          setMessage({
            type: "error",
            text: "Camera access denied. Please check your browser permissions and try again, or use manual entry.",
          })
        } else if (error.name === "NotFoundError") {
          setMessage({
            type: "error",
            text: "No camera found. Please ensure your device has a camera or use manual entry.",
          })
        } else if (error.name === "NotReadableError") {
          setMessage({
            type: "error",
            text: "Camera is in use by another application. Please close other apps using your camera.",
          })
        } else if (error.name === "OverconstrainedError") {
          setMessage({
            type: "error",
            text: "Camera doesn't meet requirements. Please try with a different camera or use manual entry.",
          })
        } else {
          setMessage({
            type: "error",
            text: `Camera error: ${error.message}. Please try manual entry.`,
          })
        }
      } else {
        setMessage({
          type: "error",
          text: `Could not access camera: ${error instanceof Error ? error.message : "Unknown error"}. Please try manual entry.`,
        })
      }

      // Switch to manual entry if camera fails
      setActiveTab("manual")
    }
  }

  const stopScanner = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop())
      setVideoStream(null)
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setScanning(false)
  }

  const handleQRCodeDetected = (code: string) => {
    setQrCode(code)
    stopScanner()
    setMessage({
      type: "success",
      text: `QR code detected: ${code}. Click Submit to register your attendance.`,
    })
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
    setIsLoading(true)

    try {
      // In a real implementation, we would validate the QR code with the server
      // For this example, we'll simulate a successful validation
      setTimeout(() => {
        setIsLoading(false)
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
      setIsLoading(false)
      console.error("Error validating QR code:", error)
      setMessage({
        type: "error",
        text: `Invalid QR code: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
      })
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop())
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [videoStream])

  // Check for camera permissions on component mount
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        // Check if we can query permissions
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: "camera" as PermissionName })
          setCameraPermission(result.state as "granted" | "denied" | "prompt")

          // Listen for permission changes
          result.onchange = () => {
            setCameraPermission(result.state as "granted" | "denied" | "prompt")
          }
        }
      } catch (error) {
        console.error("Error checking camera permission:", error)
      }
    }

    checkCameraPermission()
  }, [])

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
            <Alert
              variant={message.type === "success" ? "default" : message.type === "warning" ? "warning" : "destructive"}
            >
              {message.type === "success" ? (
                <QrCode className="h-4 w-4" />
              ) : message.type === "warning" ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
              <AlertTitle>
                {message.type === "success" ? "Success" : message.type === "warning" ? "Warning" : "Error"}
              </AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "camera" | "manual")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera">Camera</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            </TabsList>

            <TabsContent value="camera" className="space-y-4">
              {scanning ? (
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-dashed border-primary rounded-md"></div>
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-500 dark:text-gray-400">
                    Position the QR code within the frame
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                  <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6">
                    <Camera className="h-12 w-12 text-gray-500 dark:text-gray-400" />
                  </div>
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    {cameraPermission === "denied"
                      ? "Camera access was denied. Please check your browser settings to enable camera access."
                      : "Click the button below to start scanning"}
                  </p>
                  <Button onClick={startScanner} disabled={isLoading || cameraPermission === "denied"} className="mt-2">
                    {isLoading ? "Initializing Camera..." : "Start Camera"}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
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
                  <p className="text-xs text-gray-500">
                    Enter the code displayed by your teacher (e.g., COURSE-123-456)
                  </p>
                </div>
                <Button type="submit" disabled={!qrCode || isLoading} className="w-full">
                  {isLoading ? "Submitting..." : "Submit"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          {scanning ? (
            <Button variant="outline" onClick={stopScanner}>
              Cancel
            </Button>
          ) : activeTab === "camera" ? (
            <div className="w-full flex justify-end">
              <Button variant="outline" onClick={() => setActiveTab("manual")}>
                Use Manual Entry
              </Button>
            </div>
          ) : (
            <div className="w-full flex justify-end">
              {cameraPermission !== "denied" && (
                <Button variant="outline" onClick={() => setActiveTab("camera")}>
                  Use Camera
                </Button>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
