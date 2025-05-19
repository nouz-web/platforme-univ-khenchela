"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Save } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Absence Management Platform - Khenchela University Abbas Laghour",
    contactEmail: "admin@univ-khenchela.dz",
    sessionTimeout: "30",
    maintenanceMode: false,
    allowRegistration: false,
  })

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: "8",
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: false,
    maxLoginAttempts: "5",
    lockoutDuration: "30",
    twoFactorAuth: false,
  })

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    absenceAlerts: true,
    justificationAlerts: true,
    systemAlerts: true,
    emailFooter:
      "This is an automated message from the Absence Management Platform. Please do not reply to this email.",
  })

  // Backup settings
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: "daily",
    backupRetention: "30",
    backupLocation: "/var/backups/absence-platform",
  })

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setGeneralSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleGeneralSwitchChange = (name: string, checked: boolean) => {
    setGeneralSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSecuritySettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSecuritySwitchChange = (name: string, checked: boolean) => {
    setSecuritySettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNotificationSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationSwitchChange = (name: string, checked: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleBackupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBackupSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleBackupSwitchChange = (name: string, checked: boolean) => {
    setBackupSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleBackupSelectChange = (name: string, value: string) => {
    setBackupSettings((prev) => ({ ...prev, [name]: value }))
  }

  const saveSettings = () => {
    setIsSubmitting(true)

    // In a real implementation, this would call an API
    setTimeout(() => {
      setIsSubmitting(false)
      setShowSuccessMessage(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 3000)
    }, 1000)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">System Settings</h1>
        <Button onClick={saveSettings} disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {showSuccessMessage && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Settings have been saved successfully.</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="backup">Backup & Recovery</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input id="siteName" name="siteName" value={generalSettings.siteName} onChange={handleGeneralChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={generalSettings.contactEmail}
                  onChange={handleGeneralChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  name="sessionTimeout"
                  type="number"
                  min="5"
                  max="120"
                  value={generalSettings.sessionTimeout}
                  onChange={handleGeneralChange}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    When enabled, only technical administrators can access the system
                  </p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={generalSettings.maintenanceMode}
                  onCheckedChange={(checked) => handleGeneralSwitchChange("maintenanceMode", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowRegistration">Allow User Registration</Label>
                  <p className="text-sm text-muted-foreground">When enabled, new users can register for an account</p>
                </div>
                <Switch
                  id="allowRegistration"
                  checked={generalSettings.allowRegistration}
                  onCheckedChange={(checked) => handleGeneralSwitchChange("allowRegistration", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                <Input
                  id="passwordMinLength"
                  name="passwordMinLength"
                  type="number"
                  min="6"
                  max="20"
                  value={securitySettings.passwordMinLength}
                  onChange={handleSecurityChange}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="passwordRequireUppercase">Require Uppercase Letters</Label>
                  <p className="text-sm text-muted-foreground">Passwords must contain at least one uppercase letter</p>
                </div>
                <Switch
                  id="passwordRequireUppercase"
                  checked={securitySettings.passwordRequireUppercase}
                  onCheckedChange={(checked) => handleSecuritySwitchChange("passwordRequireUppercase", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="passwordRequireNumbers">Require Numbers</Label>
                  <p className="text-sm text-muted-foreground">Passwords must contain at least one number</p>
                </div>
                <Switch
                  id="passwordRequireNumbers"
                  checked={securitySettings.passwordRequireNumbers}
                  onCheckedChange={(checked) => handleSecuritySwitchChange("passwordRequireNumbers", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="passwordRequireSymbols">Require Special Characters</Label>
                  <p className="text-sm text-muted-foreground">Passwords must contain at least one special character</p>
                </div>
                <Switch
                  id="passwordRequireSymbols"
                  checked={securitySettings.passwordRequireSymbols}
                  onCheckedChange={(checked) => handleSecuritySwitchChange("passwordRequireSymbols", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Maximum Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  name="maxLoginAttempts"
                  type="number"
                  min="3"
                  max="10"
                  value={securitySettings.maxLoginAttempts}
                  onChange={handleSecurityChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lockoutDuration">Account Lockout Duration (minutes)</Label>
                <Input
                  id="lockoutDuration"
                  name="lockoutDuration"
                  type="number"
                  min="5"
                  max="60"
                  value={securitySettings.lockoutDuration}
                  onChange={handleSecurityChange}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Require two-factor authentication for all users</p>
                </div>
                <Switch
                  id="twoFactorAuth"
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) => handleSecuritySwitchChange("twoFactorAuth", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure system notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications to users for important events
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationSwitchChange("emailNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="absenceAlerts">Absence Alerts</Label>
                  <p className="text-sm text-muted-foreground">Send alerts when students exceed absence thresholds</p>
                </div>
                <Switch
                  id="absenceAlerts"
                  checked={notificationSettings.absenceAlerts}
                  onCheckedChange={(checked) => handleNotificationSwitchChange("absenceAlerts", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="justificationAlerts">Justification Alerts</Label>
                  <p className="text-sm text-muted-foreground">Send alerts when new justifications are submitted</p>
                </div>
                <Switch
                  id="justificationAlerts"
                  checked={notificationSettings.justificationAlerts}
                  onCheckedChange={(checked) => handleNotificationSwitchChange("justificationAlerts", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="systemAlerts">System Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Send alerts for system events (maintenance, updates, etc.)
                  </p>
                </div>
                <Switch
                  id="systemAlerts"
                  checked={notificationSettings.systemAlerts}
                  onCheckedChange={(checked) => handleNotificationSwitchChange("systemAlerts", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailFooter">Email Footer Text</Label>
                <Textarea
                  id="emailFooter"
                  name="emailFooter"
                  rows={3}
                  value={notificationSettings.emailFooter}
                  onChange={handleNotificationChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Recovery Settings</CardTitle>
              <CardDescription>Configure database backup and recovery options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoBackup">Automatic Backups</Label>
                  <p className="text-sm text-muted-foreground">Automatically backup the database on a schedule</p>
                </div>
                <Switch
                  id="autoBackup"
                  checked={backupSettings.autoBackup}
                  onCheckedChange={(checked) => handleBackupSwitchChange("autoBackup", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <Select
                  value={backupSettings.backupFrequency}
                  onValueChange={(value) => handleBackupSelectChange("backupFrequency", value)}
                  disabled={!backupSettings.autoBackup}
                >
                  <SelectTrigger id="backupFrequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupRetention">Backup Retention (days)</Label>
                <Input
                  id="backupRetention"
                  name="backupRetention"
                  type="number"
                  min="1"
                  max="365"
                  value={backupSettings.backupRetention}
                  onChange={handleBackupChange}
                  disabled={!backupSettings.autoBackup}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupLocation">Backup Storage Location</Label>
                <Input
                  id="backupLocation"
                  name="backupLocation"
                  value={backupSettings.backupLocation}
                  onChange={handleBackupChange}
                />
              </div>

              <div className="pt-4">
                <Button variant="outline" className="mr-2">
                  Backup Now
                </Button>
                <Button variant="outline">Restore from Backup</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
