"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QrCode, Camera, X, AlertTriangle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import dynamic from "next/dynamic"

// Dynamically import jsQR with no SSR to avoid server-side errors
const jsQR = dynamic(() => import("jsqr"), { ssr: false })

export default function ScanQRCodePage() {
  const router = useRouter()
  const [scanning, setScanning] = useState(false)
  const [qrCode, setQrCode] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera")
  const [isLoading, setIsLoading] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [scanAttempts, setScanAttempts] = useState(0)
  const [jsQRLoaded, setJsQRLoaded] = useState(false)

  // Function to handle QR code detection
  const handleQRCodeDetected = (code: string) => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    setQrCode(code)
    stopScanner()

    toast({
      title: "QR Code Detected",
      description: `Code: ${code}`,
    })

    setMessage({
      type: "success",
      text: `QR code detected: ${code}. Click Submit to register your attendance.`,
    })
  }

  // Function to process a video frame and look for QR codes
  const processVideoFrame = () => {
    if (!videoRef.current || !canvasRef.current || !jsQR) return false

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return false

    // Make sure video dimensions are set
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return false

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data from canvas
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

    // Use jsQR to find QR codes in the image
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    })

    // If a QR code is found, handle it
    if (code) {
      console.log("QR Code detected:", code.data)
      handleQRCodeDetected(code.data)
      return true
    }

    return false
  }

  // Function to start the camera and QR code scanning
  const startScanner = async () => {
    setIsLoading(true)
    setMessage(null)
    setCameraError(null)
    setScanAttempts(0)

    try {
      // Check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser doesn't support camera access")
      }

      // Try to access the camera with different constraints
      let stream: MediaStream | null = null

      // First try with environment camera (back camera on phones)
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        })
      } catch (err) {
        console.log("Couldn't access environment camera, trying default camera")
        // If that fails, try with any camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })
      }

      // Set up the video element
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream

        // Wait for the video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => {
                setScanning(true)
                setIsLoading(false)

                // Start scanning for QR codes
                if (scanIntervalRef.current) {
                  clearInterval(scanIntervalRef.current)
                }

                scanIntervalRef.current = setInterval(() => {
                  const found = processVideoFrame()
                  if (!found) {
                    setScanAttempts((prev) => prev + 1)
                  }
                }, 200) // Scan every 200ms
              })
              .catch((err) => {
                console.error("Error playing video:", err)
                setCameraError("Could not play video stream. Please try again.")
                setIsLoading(false)
              })
          }
        }

        videoRef.current.onerror = () => {
          setCameraError("Error playing video stream")
          setIsLoading(false)
          stopScanner()
        }
      } else {
        throw new Error("Could not initialize video element")
      }
    } catch (error) {
      console.error("Camera error:", error)
      setIsLoading(false)

      let errorMessage = "Could not access camera"

      if (error instanceof DOMException) {
        switch (error.name) {
          case "NotAllowedError":
            errorMessage = "Camera access denied. Please check your browser permissions."
            break
          case "NotFoundError":
            errorMessage = "No camera found on your device."
            break
          case "NotReadableError":
            errorMessage = "Camera is already in use by another application."
            break
          case "OverconstrainedError":
            errorMessage = "Camera doesn't meet the required constraints."
            break
          default:
            errorMessage = `Camera error: ${error.message}`
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      setCameraError(errorMessage)
      setActiveTab("manual")
    }
  }

  // Function to stop the camera
  const stopScanner = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()

      tracks.forEach((track) => {
        track.stop()
      })

      videoRef.current.srcObject = null
    }

    setScanning(false)
    setScanAttempts(0)
  }

  // Function to handle manual QR code submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit()
  }

  // Function to handle QR code submission
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

  // Check if jsQR is loaded
  useEffect(() => {
    const checkJsQR = async () => {
      try {
        await import("jsqr")
        setJsQRLoaded(true)
      } catch (error) {
        console.error("Error loading jsQR:", error)
        setCameraError("Could not load QR code scanning library. Please try manual entry.")
      }
    }

    checkJsQR()
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopScanner()
    }
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
                  {scanAttempts > 20 && (
                    <div className="absolute top-4 left-0 right-0 text-center">
                      <Alert variant="warning" className="inline-block max-w-xs mx-auto">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>No QR code detected</AlertTitle>
                        <AlertDescription>Make sure the QR code is clearly visible and well-lit</AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                  <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6">
                    <Camera className="h-12 w-12 text-gray-500 dark:text-gray-400" />
                  </div>

                  {cameraError ? (
                    <Alert variant="destructive" className="mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Camera Error</AlertTitle>
                      <AlertDescription>{cameraError}</AlertDescription>
                    </Alert>
                  ) : (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                      Click the button below to start scanning
                    </p>
                  )}

                  <Button onClick={startScanner} disabled={isLoading || !jsQRLoaded} className="mt-2">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Initializing Camera...
                      </>
                    ) : !jsQRLoaded ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading Scanner...
                      </>
                    ) : (
                      "Start Camera"
                    )}
                  </Button>
                </div>
              )}

              {/* Hidden canvas for QR code processing */}
              <canvas ref={canvasRef} className="hidden" />
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
                  <p className="text-xs text-gray-500">Enter the code displayed by your teacher (e.g., COURSE-123)</p>
                </div>
                <Button type="submit" disabled={!qrCode || isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          {scanning ? (
            <Button variant="outline" onClick={stopScanner} className="w-full">
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
              <Button variant="outline" onClick={() => setActiveTab("camera")}>
                Use Camera
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
      <Toaster />
    </div>
  )
}
