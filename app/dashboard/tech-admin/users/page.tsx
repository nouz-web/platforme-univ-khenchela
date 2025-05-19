"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Edit, Trash, UserPlus, CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "student",
    department: "",
    program: "",
    year: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Mock data for users
  const [users, setUsers] = useState([
    {
      id: "S12345",
      name: "Ahmed Benali",
      email: "ahmed.benali@example.com",
      role: "student",
      department: "Computer Science",
      program: "Computer Science",
      year: "2",
      createdAt: "2023-01-15",
      lastLogin: "2023-05-18",
      status: "active",
    },
    {
      id: "S12346",
      name: "Fatima Zahra",
      email: "fatima.zahra@example.com",
      role: "student",
      department: "Mathematics",
      program: "Mathematics",
      year: "3",
      createdAt: "2023-01-20",
      lastLogin: "2023-05-17",
      status: "active",
    },
    {
      id: "T12345",
      name: "Dr. Mohammed Alaoui",
      email: "mohammed.alaoui@example.com",
      role: "teacher",
      department: "Computer Science",
      program: "",
      year: "",
      createdAt: "2022-09-01",
      lastLogin: "2023-05-18",
      status: "active",
    },
    {
      id: "A12345",
      name: "Amina Tazi",
      email: "amina.tazi@example.com",
      role: "admin",
      department: "Administration",
      program: "",
      year: "",
      createdAt: "2022-08-15",
      lastLogin: "2023-05-18",
      status: "active",
    },
    {
      id: "2020234049140",
      name: "Technical Administrator",
      email: "tech.admin@example.com",
      role: "tech-admin",
      department: "IT",
      program: "",
      year: "",
      createdAt: "2022-01-01",
      lastLogin: "2023-05-19",
      status: "active",
    },
  ])

  const filteredUsers = users.filter((user) => {
    return (
      (selectedRole === "all" || user.role === selectedRole) &&
      (!searchQuery ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddUser = () => {
    setFormData({
      id: "",
      name: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "student",
      department: "",
      program: "",
      year: "",
    })
    setIsAddDialogOpen(true)
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setFormData({
      id: user.id,
      name: user.name,
      firstName: "",
      lastName: "",
      email: user.email,
      password: "",
      role: user.role,
      department: user.department || "",
      program: user.program || "",
      year: user.year || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const handleToggleUserStatus = (user: any) => {
    if (user.id === "2020234049140") {
      setErrorMessage("Cannot change status of Technical Administrator account")
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
      return
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u)),
    )

    setSuccessMessage(`User ${user.name} status updated successfully`)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const submitAddUser = async () => {
    if (!formData.id || !formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setErrorMessage("Please fill in all required fields")
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
      return
    }

    // Check if ID already exists
    if (users.some((user) => user.id === formData.id)) {
      setErrorMessage("User ID already exists")
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
      return
    }

    setIsSubmitting(true)

    try {
      // In a real implementation, this would call an API
      setTimeout(() => {
        const newUser = {
          id: formData.id,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          role: formData.role,
          department: formData.department,
          program: formData.role === "student" ? formData.program : "",
          year: formData.role === "student" ? formData.year : "",
          createdAt: new Date().toISOString().split("T")[0],
          lastLogin: "-",
          status: "active",
        }

        setUsers((prev) => [...prev, newUser])
        setIsAddDialogOpen(false)
        setIsSubmitting(false)

        setSuccessMessage("User created successfully")
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }, 1000)
    } catch (error) {
      console.error("Error adding user:", error)
      setIsSubmitting(false)
    }
  }

  const submitEditUser = async () => {
    if (!selectedUser) return

    if (!formData.id || !formData.name || !formData.email) {
      setErrorMessage("Please fill in all required fields")
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
      return
    }

    // Check if ID already exists and is not the current user
    if (formData.id !== selectedUser.id && users.some((user) => user.id === formData.id)) {
      setErrorMessage("User ID already exists")
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
      return
    }

    setIsSubmitting(true)

    try {
      // In a real implementation, this would call an API
      setTimeout(() => {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === selectedUser.id
              ? {
                  ...user,
                  id: formData.id,
                  name: formData.name,
                  email: formData.email,
                  role: formData.role,
                  department: formData.department,
                  program: formData.role === "student" ? formData.program : user.program,
                  year: formData.role === "student" ? formData.year : user.year,
                }
              : user,
          ),
        )
        setIsEditDialogOpen(false)
        setSelectedUser(null)
        setIsSubmitting(false)

        setSuccessMessage("User updated successfully")
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }, 1000)
    } catch (error) {
      console.error("Error editing user:", error)
      setIsSubmitting(false)
    }
  }

  const submitDeleteUser = async () => {
    if (!selectedUser) return

    if (selectedUser.id === "2020234049140") {
      setErrorMessage("Cannot delete Technical Administrator account")
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
      setIsDeleteDialogOpen(false)
      return
    }

    setIsSubmitting(true)

    try {
      // In a real implementation, this would call an API
      setTimeout(() => {
        setUsers((prev) => prev.filter((user) => user.id !== selectedUser.id))
        setIsDeleteDialogOpen(false)
        setSelectedUser(null)
        setIsSubmitting(false)

        setSuccessMessage("User deleted successfully")
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }, 1000)
    } catch (error) {
      console.error("Error deleting user:", error)
      setIsSubmitting(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "student":
        return <Badge className="bg-blue-100 text-blue-800">Student</Badge>
      case "teacher":
        return <Badge className="bg-green-100 text-green-800">Teacher</Badge>
      case "admin":
        return <Badge className="bg-amber-100 text-amber-800">Admin</Badge>
      case "tech-admin":
        return <Badge className="bg-red-100 text-red-800">Tech Admin</Badge>
      default:
        return <Badge>{role}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={handleAddUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {showSuccess && (
        <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {showError && (
        <Alert className="mb-4 bg-red-50 text-red-800 border-red-200" variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Users</CardTitle>
          <CardDescription>Search and filter user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">User Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="tech-admin">Tech Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, ID, or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Program</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{getRoleBadge(user.role)}</TableCell>
              <TableCell>{user.department}</TableCell>
              <TableCell>{user.program}</TableCell>
              <TableCell>{user.year}</TableCell>
              <TableCell>{getStatusBadge(user.status)}</TableCell>
              <TableCell>
                <Button onClick={() => handleEditUser(user)} className="mr-2">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button onClick={() => handleDeleteUser(user)} className="mr-2">
                  <Trash className="h-4 w-4" />
                </Button>
                <Button onClick={() => handleToggleUserStatus(user)}>
                  {user.status === "active" ? "Deactivate" : "Activate"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription>Enter user details below</DialogDescription>
          </DialogHeader>
          {/* Form fields for adding user */}
          <form onSubmit={submitAddUser}>
            {/* Input fields for user details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id">ID</Label>
                <Input id="id" name="id" value={formData.id} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" value={formData.email} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="tech-admin">Tech Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" value={formData.department} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Input id="program" name="program" value={formData.program} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input id="year" name="year" value={formData.year} onChange={handleInputChange} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Add User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Modify user details below</DialogDescription>
          </DialogHeader>
          {/* Form fields for editing user */}
          <form onSubmit={submitEditUser}>
            {/* Input fields for user details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id">ID</Label>
                <Input id="id" name="id" value={formData.id} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" value={formData.email} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="tech-admin">Tech Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" value={formData.department} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Input id="program" name="program" value={formData.program} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input id="year" name="year" value={formData.year} onChange={handleInputChange} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Update User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>Are you sure you want to delete this user?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={submitDeleteUser} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
            <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
