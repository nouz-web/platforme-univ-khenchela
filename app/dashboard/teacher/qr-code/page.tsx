"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QRCodeSVG } from "qrcode.react"
import { Clock, Download, RefreshCw } from "lucide-react"

export default function GenerateQRCodePage() {
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedType, setSelectedType] = useState("COUR")
  const [qrValue, setQrValue] = useState("")
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const [courses, setCourses] = useState([
    { id: "CS101", name: "Introduction to Computer Science", type: "COUR" },
    { id: "CS102", name: "Programming Fundamentals", type: "TD" },
    { id: "CS103", name: "Data Structures", type: "TP" },
    { id: "MATH201", name: "Linear Algebra", type: "COUR" },
  ])

  // Generate QR code when course or type changes
  useEffect(() => {
    if (selectedCourse) {
      generateQRCode()
    }
  }, [selectedCourse, selectedType])

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && qrValue) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && qrValue) {
      // Regenerate QR code when timer expires
      generateQRCode()
      setTimeLeft(600) // Reset timer
    }
  }, [timeLeft, qrValue])

  const generateQRCode = () => {
    const timestamp = new Date().toISOString()
    const randomId = Math.random().toString(36).substring(2, 10)
    const newQrValue = JSON.stringify({
      courseId: selectedCourse,
      type: selectedType,
      timestamp,
      id: randomId,
    })
    setQrValue(newQrValue)
    setTimeLeft(600) // Reset timer to 10 minutes
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement
    if (canvas) {
      const url = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `qrcode-${selectedCourse}-${new Date().toISOString().slice(0, 10)}.png`
      link.href = url
      link.click()
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Generate QR Code</h1>

      <Card>
        <CardHeader>
          <CardTitle>Session QR Code</CardTitle>
          <CardDescription>Generate a QR code for students to scan and register attendance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger id="course">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Session Type</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COUR">Lecture (COUR)</SelectItem>
                <SelectItem value="TD">Directed Work (TD)</SelectItem>
                <SelectItem value="TP">Practical Work (TP)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {qrValue && (
            <div className="flex flex-col items-center pt-4">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  QR code will refresh in: <span className="font-bold">{formatTime(timeLeft)}</span>
                </span>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG id="qr-code-canvas" value={qrValue} size={200} level="H" includeMargin className="mx-auto" />
              </div>

              <div className="text-center mt-4 text-sm text-muted-foreground">
                <p>Course: {courses.find((c) => c.id === selectedCourse)?.name}</p>
                <p>
                  Type:{" "}
                  {selectedType === "COUR" ? "Lecture" : selectedType === "TD" ? "Directed Work" : "Practical Work"}
                </p>
                <p>Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={generateQRCode}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
          <Button onClick={downloadQRCode} disabled={!qrValue}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
