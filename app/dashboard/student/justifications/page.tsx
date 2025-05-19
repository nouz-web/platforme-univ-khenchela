"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SubmitJustificationPage() {
  const router = useRouter()
  const [absenceDate, setAbsenceDate] = useState("")
  const [absenceType, setAbsenceType] = useState("")
  const [reason, setReason] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!absenceDate || !absenceType || !reason || !file) {
      setMessage({ type: "error", text: "Please fill in all fields and upload a document" })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      // In a real implementation, we would upload the file and submit the justification
      // For this example, we'll simulate a successful submission
      setTimeout(() => {
        setMessage({
          type: "success",
          text: "Justification submitted successfully! Your request will be reviewed by your teacher.",
        })

        // Reset form
        setAbsenceDate("")
        setAbsenceType("")
        setReason("")
        setFile(null)

        // Redirect to dashboard after a delay
        setTimeout(() => {
          router.push("/dashboard/student")
        }, 2000)
      }, 1500)
    } catch (error) {
      console.error("Error submitting justification:", error)
      setMessage({ type: "error", text: "Failed to submit justification. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Submit Absence Justification</h1>

      <Card>
        <CardHeader>
          <CardTitle>Absence Justification</CardTitle>
          <CardDescription>Upload a document to justify your absence</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {message && (
              <Alert variant={message.type === "success" ? "default" : "destructive"}>
                {message.type === "success" ? <Check className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                <AlertTitle>{message.type === "success" ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="absence-date">Absence Date</Label>
              <Input
                id="absence-date"
                type="date"
                value={absenceDate}
                onChange={(e) => setAbsenceDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="absence-type">Session Type</Label>
              <Select value={absenceType} onValueChange={setAbsenceType} required>
                <SelectTrigger id="absence-type">
                  <SelectValue placeholder="Select session type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COUR">Lecture (COUR)</SelectItem>
                  <SelectItem value="TD">Directed Work (TD)</SelectItem>
                  <SelectItem value="TP">Practical Work (TP)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Absence</Label>
              <Textarea
                id="reason"
                placeholder="Explain the reason for your absence"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">Supporting Document</Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="document"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF or image (MAX. 5MB)</p>
                  </div>
                  <Input
                    id="document"
                    type="file"
                    className="hidden"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    required
                  />
                </label>
              </div>
              {file && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Selected file: {file.name}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Justification"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
