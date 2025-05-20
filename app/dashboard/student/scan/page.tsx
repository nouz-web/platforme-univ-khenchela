"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QrCode, Camera, X, AlertTriangle, Loader2, FlipHorizontal } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>("")
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment")
  const [brightness, setBrightness] = useState<number>(0)
  const [lastScannedCodes, setLastScannedCodes] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Function to handle QR code detection
  const handleQRCodeDetected = (code: string) => {
    // Prevent duplicate scans
    if (qrCode === code) return

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    // Vibrate if available
    if (navigator.vibrate) {
      navigator.vibrate(200)
    }

    // Play success sound
    const audio = new Audio("/success-sound.mp3")
    audio.play().catch((e) => console.log("Could not play audio", e))

    setQrCode(code)
    stopScanner()

    // Add to scan history
    setLastScannedCodes((prev) => {
      const newHistory = [code, ...prev]
      return newHistory.slice(0, 5) // Keep only last 5 codes
    })

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
    const context = canvas.getContext("2d", { willReadFrequently: true })

    if (!context) return false

    // Make sure video dimensions are set
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return false

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Calculate average brightness
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    let sum = 0
    let pixels = 0

    // Sample pixels (every 10th pixel to save performance)
    for (let i = 0; i < imageData.data.length; i += 40) {
      const r = imageData.data[i]
      const g = imageData.data[i + 1]
      const b = imageData.data[i + 2]
      sum += (r + g + b) / 3
      pixels++
    }

    const avgBrightness = sum / pixels
    setBrightness(avgBrightness)

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

  // Function to get available cameras
  const getAvailableCameras = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        throw new Error("Camera enumeration not supported")
      }

      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((device) => device.kind === "videoinput")
      setCameras(videoDevices)

      if (videoDevices.length > 0 && !selectedCamera) {
        // Try to find a back camera first
        const backCamera = videoDevices.find(
          (device) => device.label.toLowerCase().includes("back") || device.label.toLowerCase().includes("rear"),
        )

        if (backCamera) {
          setSelectedCamera(backCamera.deviceId)
          setFacingMode("environment")
        } else {
          setSelectedCamera(videoDevices[0].deviceId)
        }
      }
    } catch (error) {
      console.error("Error getting cameras:", error)
    }
  }

  // Function to switch camera
  const switchCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"))

    // If we have multiple cameras, try to find one matching the new facing mode
    if (cameras.length > 1) {
      const newFacingMode = facingMode === "environment" ? "user" : "environment"
      const keywordToFind = newFacingMode === "environment" ? ["back", "rear"] : ["front"]

      const matchingCamera = cameras.find((camera) =>
        keywordToFind.some((keyword) => camera.label.toLowerCase().includes(keyword)),
      )

      if (matchingCamera) {
        setSelectedCamera(matchingCamera.deviceId)
      }
    }

    // Restart the scanner with the new camera
    if (scanning) {
      stopScanner()
      setTimeout(() => startScanner(), 300)
    }
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

      // Get available cameras first
      await getAvailableCameras()

      // Try to access the camera with different constraints
      let stream: MediaStream | null = null
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: selectedCamera ? { deviceId: { exact: selectedCamera } } : { facingMode: facingMode },
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (err) {
        console.log("Couldn't access specific camera, trying default camera")
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
                }, 150) // Scan more frequently for better performance
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
    setIsSubmitting(true)

    try {
      // Call the API to validate the QR code and record attendance
      const response = await fetch("/api/attendance/record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrCode }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to record attendance")
      }

      const data = await response.json()

      setIsSubmitting(false)
      setMessage({
        type: "success",
        text: "Attendance recorded successfully! You are marked as present for this session.",
      })

      // Redirect to dashboard after a delay
      setTimeout(() => {
        router.push("/dashboard/student")
      }, 2000)
    } catch (error) {
      setIsSubmitting(false)
      console.error("Error validating QR code:", error)
      setMessage({
        type: "error",
        text: `${error instanceof Error ? error.message : "Invalid QR code. Please try again."}`,
      })
    }
  }

  // Function to use a previously scanned code
  const useScannedCode = (code: string) => {
    setQrCode(code)
    setMessage({
      type: "success",
      text: `Using code: ${code}. Click Submit to register your attendance.`,
    })
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
    getAvailableCameras()

    // Request camera permission early
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "camera" as PermissionName })
        .then((permissionStatus) => {
          if (permissionStatus.state === "granted") {
            // Pre-warm camera access
            navigator.mediaDevices
              .getUserMedia({ video: true })
              .then((stream) => {
                stream.getTracks().forEach((track) => track.stop())
              })
              .catch((err) => console.log("Permission granted but camera access failed:", err))
          }
        })
        .catch((err) => console.log("Permission query failed:", err))
    }
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
                  {brightness < 50 && (
                    <div className="absolute top-4 left-0 right-0 text-center">
                      <Alert variant="warning" className="inline-block max-w-xs mx-auto">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Low Light Detected</AlertTitle>
                        <AlertDescription>
                          The environment is too dark. Please increase lighting for better scanning.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                  {scanAttempts > 20 && brightness >= 50 && (
                    <div className="absolute top-4 left-0 right-0 text-center">
                      <Alert variant="warning" className="inline-block max-w-xs mx-auto">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>No QR code detected</AlertTitle>
                        <AlertDescription>Make sure the QR code is clearly visible and well-lit</AlertDescription>
                      </Alert>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                    onClick={switchCamera}
                  >
                    <FlipHorizontal className="h-4 w-4" />
                  </Button>
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

                  {cameras.length > 1 && (
                    <div className="w-full">
                      <label htmlFor="camera-select" className="text-sm font-medium block mb-1">
                        Select Camera
                      </label>
                      <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                        <SelectTrigger id="camera-select">
                          <SelectValue placeholder="Select a camera" />
                        </SelectTrigger>
                        <SelectContent>
                          {cameras.map((camera) => (
                            <SelectItem key={camera.deviceId} value={camera.deviceId}>
                              {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button onClick={startScanner} disabled={isLoading || !jsQRLoaded} className="mt-2 w-full">
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
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Start Camera
                      </>
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
                <Button type="submit" disabled={!qrCode || isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </form>

              {lastScannedCodes.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Recently Scanned Codes</h3>
                  <div className="space-y-2">
                    {lastScannedCodes.map((code, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <span className="text-sm truncate max-w-[200px]">{code}</span>
                        <Button variant="ghost" size="sm" onClick={() => setQrCode(code)}>
                          Use
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
