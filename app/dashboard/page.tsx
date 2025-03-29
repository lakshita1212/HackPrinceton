"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Phone, User, Clock, Home } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function DashboardPage() {
  const [patientStatus, setPatientStatus] = useState("safe") // safe, warning, alert
  const [showIdentityDialog, setShowIdentityDialog] = useState(false)

  return (
    <div className="container py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Patient Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage your patient's location</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowIdentityDialog(true)}>
              <User className="mr-2 h-4 w-4" />
              Who is this?
            </Button>
            <Button variant="outline" size="sm">
              <Phone className="mr-2 h-4 w-4" />
              Emergency Call
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Location Tracking</CardTitle>
                <Badge
                  variant={
                    patientStatus === "safe" ? "outline" : patientStatus === "warning" ? "secondary" : "destructive"
                  }
                >
                  {patientStatus === "safe"
                    ? "Within Safe Zone"
                    : patientStatus === "warning"
                      ? "Near Boundary"
                      : "Outside Safe Zone"}
                </Badge>
              </div>
              <CardDescription>Current location and movement history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 h-[400px] bg-muted flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Map showing patient location will be displayed here</p>
                  <div className="mt-2 flex justify-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Home className="mr-2 h-4 w-4" />
                      Show Base Location
                    </Button>
                    <Button variant="outline" size="sm">
                      <MapPin className="mr-2 h-4 w-4" />
                      Center on Patient
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Last updated: 2 minutes ago</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Distance from base: 320m</span>
                  <Badge variant="outline">Safe radius: 500m</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>Details and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder.svg" alt="Patient" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-muted-foreground">ID: #12345</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">Status:</p>
                  <Badge
                    variant={
                      patientStatus === "safe" ? "outline" : patientStatus === "warning" ? "secondary" : "destructive"
                    }
                  >
                    {patientStatus === "safe" ? "Safe" : patientStatus === "warning" ? "Warning" : "Alert"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm font-medium">Base Location:</p>
                  <p className="text-sm text-right">123 Main St</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm font-medium">Safe Radius:</p>
                  <p className="text-sm">500 meters</p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm font-medium mb-2">Emergency Contacts:</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">Jane Doe: (555) 123-4567</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">Dr. Smith: (555) 987-6543</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full space-y-2">
                <Button
                  className="w-full"
                  onClick={() =>
                    setPatientStatus(
                      patientStatus === "safe" ? "warning" : patientStatus === "warning" ? "alert" : "safe",
                    )
                  }
                >
                  Simulate Status Change
                </Button>
                <Button variant="outline" className="w-full">
                  Edit Patient Details
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Activity History</CardTitle>
            <CardDescription>Recent movements and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="today">
              <TabsList className="mb-4">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
                <TabsTrigger value="month">This Month</TabsTrigger>
              </TabsList>
              <TabsContent value="today" className="space-y-4">
                <div className="border-l-2 border-primary pl-4 ml-2 relative">
                  <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>
                  <p className="font-medium">10:30 AM - Current Location</p>
                  <p className="text-sm text-muted-foreground">320 meters from base location</p>
                </div>
                <div className="border-l-2 border-muted pl-4 ml-2 relative">
                  <div className="absolute w-3 h-3 bg-muted rounded-full -left-[7px] top-1"></div>
                  <p className="font-medium">9:45 AM - Park</p>
                  <p className="text-sm text-muted-foreground">450 meters from base location</p>
                </div>
                <div className="border-l-2 border-muted pl-4 ml-2 relative">
                  <div className="absolute w-3 h-3 bg-muted rounded-full -left-[7px] top-1"></div>
                  <p className="font-medium">8:30 AM - Base Location</p>
                  <p className="text-sm text-muted-foreground">Patient at home</p>
                </div>
              </TabsContent>
              <TabsContent value="week">
                <p className="text-muted-foreground">Activity history for this week will be displayed here.</p>
              </TabsContent>
              <TabsContent value="month">
                <p className="text-muted-foreground">Activity history for this month will be displayed here.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showIdentityDialog} onOpenChange={setShowIdentityDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Patient Identification</DialogTitle>
            <DialogDescription>
              This information can help the patient identify themselves and contact their caretaker.
            </DialogDescription>
            <div className="flex flex-col items-center justify-center space-y-4 py-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg" alt="Patient" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-medium text-lg">John Doe</h3>
                <p className="text-muted-foreground">Patient ID: #12345</p>
              </div>
              <div className="w-full space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">Caretaker:</p>
                  <p className="text-sm">Jane Smith</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm font-medium">Relationship:</p>
                  <p className="text-sm">Family Member</p>
                </div>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button className="w-full" onClick={() => setShowIdentityDialog(false)}>
              <Phone className="mr-2 h-4 w-4" />
              Call Caretaker
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

