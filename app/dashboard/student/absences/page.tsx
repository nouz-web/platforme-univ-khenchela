"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function StudentAbsencesPage() {
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [exportFormat, setExportFormat] = useState("pdf")
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  // Mock data for absences
  const absences = [
    {
      id: 1,
      date: "2023-09-15",
      courseName: "Introduction to Computer Science",
      courseType: "COUR",
      semester: 1,
      status: "absent",
      justificationStatus: "pending",
    },
    {
      id: 2,
      date: "2023-09-22",
      courseName: "Programming Fundamentals",
      courseType: "TD",
      semester: 1,
      status: "absent",
      justificationStatus: "approved",
    },
    {
      id: 3,
      date: "2023-10-05",
      courseName: "Data Structures",
      courseType: "TP",
      semester: 1,
      status: "absent",
      justificationStatus: null,
    },
    {
      id: 4,
      date: "2023-10-12",
      courseName: "Introduction to Computer Science",
      courseType: "COUR",
      semester: 1,
      status: "absent",
      justificationStatus: "rejected",
    },
    {
      id: 5,
      date: "2023-11-03",
      courseName: "Linear Algebra",
      courseType: "COUR",
      semester: 2,
      status: "absent",
      justificationStatus: null,
    },
  ]

  const filteredAbsences = absences.filter((absence) => {
    return (
      (selectedSemester === "all" || absence.semester.toString() === selectedSemester) &&
      (selectedType === "all" || absence.courseType === selectedType) &&
      (!startDate || new Date(absence.date) >= new Date(startDate)) &&
      (!endDate || new Date(absence.date) <= new Date(endDate))
    )
  })

  const getStatusBadge = (absence: any) => {
    if (absence.justificationStatus === "approved") {
      return <Badge className="bg-green-100 text-green-800">Justified</Badge>
    } else if (absence.justificationStatus === "pending") {
      return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>
    } else if (absence.justificationStatus === "rejected") {
      return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
    } else {
      return <Badge className="bg-amber-100 text-amber-800">Not Justified</Badge>
    }
  }

  const exportAbsences = () => {
    // In a real implementation, this would generate a file in the selected format
    setTimeout(() => {
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    }, 1000)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Absences</h1>
        <Button onClick={() => setShowExportOptions(!showExportOptions)}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {showExportOptions && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
            <CardDescription>Select format and options for your export</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="format">Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger id="format">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    <SelectItem value="csv">CSV File</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="include-details">Include Details</Label>
                <Select defaultValue="summary">
                  <SelectTrigger id="include-details">
                    <SelectValue placeholder="Select detail level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary Only</SelectItem>
                    <SelectItem value="detailed">Detailed Report</SelectItem>
                    <SelectItem value="full">Full Report with Justifications</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={exportAbsences} className="w-full">
                  Generate {exportFormat.toUpperCase()}
                </Button>
              </div>
            </div>

            {exportSuccess && (
              <Alert className="mt-4 bg-green-50 text-green-800 border-green-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Your {exportFormat.toUpperCase()} has been generated successfully. Check your downloads folder.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Absences</CardTitle>
          <CardDescription>Select criteria to filter your absence records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger id="semester">
                  <SelectValue placeholder="All semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All semesters</SelectItem>
                  <SelectItem value="1">Semester 1</SelectItem>
                  <SelectItem value="2">Semester 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Session Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="COUR">Lecture (COUR)</SelectItem>
                  <SelectItem value="TD">Directed Work (TD)</SelectItem>
                  <SelectItem value="TP">Practical Work (TP)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Absence Records</CardTitle>
          <CardDescription>
            Showing {filteredAbsences.length} of {absences.length} absences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAbsences.length > 0 ? (
                filteredAbsences.map((absence) => (
                  <TableRow key={absence.id}>
                    <TableCell>{new Date(absence.date).toLocaleDateString()}</TableCell>
                    <TableCell>{absence.courseName}</TableCell>
                    <TableCell>
                      {absence.courseType === "COUR"
                        ? "Lecture"
                        : absence.courseType === "TD"
                          ? "Directed Work"
                          : "Practical Work"}
                    </TableCell>
                    <TableCell>{getStatusBadge(absence)}</TableCell>
                    <TableCell>
                      {!absence.justificationStatus && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/dashboard/student/justifications?absenceId=${absence.id}`}>Submit Justification</a>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No absences found matching your criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
