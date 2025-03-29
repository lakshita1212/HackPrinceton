"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Phone, User, Clock, Camera, Upload, CheckCircle, AlertTriangle, UserPlus } from "lucide-react"
import MapComponent from "./MapComponent"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Mock database of known people
const initialKnownPeople = [
  {
    id: 1,
    name: "Jane Smith",
    relationship: "Daughter",
    details: "Lives nearby and visits on weekends",
    imageUrl: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Robert Johnson",
    relationship: "Son",
    details: "Lives in the city and visits monthly",
    imageUrl: "/placeholder.svg",
  },
  {
    id: 3,
    name: "Dr. Williams",
    relationship: "Doctor",
    details: "Visits every Tuesday for check-ups",
    imageUrl: "/placeholder.svg",
  },
]

export default function DashboardPage() {
  const [patientStatus, setPatientStatus] = useState("safe") // safe, warning, alert
  const [showIdentityDialog, setShowIdentityDialog] = useState(false)
  const [showRecognitionDialog, setShowRecognitionDialog] = useState(false)
  const [showAddPersonDialog, setShowAddPersonDialog] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isUsingCamera, setIsUsingCamera] = useState(false)
  const [recognitionResult, setRecognitionResult] = useState<{
    isRecognized: boolean
    person?: (typeof initialKnownPeople)[0]
  } | null>(null)
  const [knownPeople, setKnownPeople] = useState(initialKnownPeople)
  const [newPerson, setNewPerson] = useState({
    name: "",
    relationship: "",
    details: "",
  })
  const [currentDistance, setCurrentDistance] = useState(320)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Load known people from localStorage on component mount
  useEffect(() => {
    const storedPeople = localStorage.getItem("knownPeople")
    if (storedPeople) {
      try {
        setKnownPeople(JSON.parse(storedPeople))
      } catch (e) {
        console.error("Error parsing stored people:", e)
      }
    }
  }, [])

  // Save known people to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("knownPeople", JSON.stringify(knownPeople))
  }, [knownPeople])

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      streamRef.current = stream
      setIsUsingCamera(true)
    } catch (err) {
      console.error("Error accessing camera:", err)
      alert("Could not access camera. Please check permissions or try uploading a photo instead.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsUsingCamera(false)
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0)
      const image = canvas.toDataURL("image/png")
      setCapturedImage(image)
      stopCamera()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const recognizePerson = () => {
    // In a real app, this would use a face recognition API
    // For this demo, we'll simulate recognition with a random result
    const isRecognized = Math.random() > 0.3 // 70% chance of recognition for demo

    if (isRecognized && knownPeople.length > 0) {
      // Randomly select a known person for demo purposes
      const randomPerson = knownPeople[Math.floor(Math.random() * knownPeople.length)]
      setRecognitionResult({
        isRecognized: true,
        person: randomPerson,
      })
    } else {
      setRecognitionResult({
        isRecognized: false,
      })
    }
  }

  const handleAddPerson = () => {
    if (newPerson.name && newPerson.relationship) {
      const person = {
        id: Date.now(),
        name: newPerson.name,
        relationship: newPerson.relationship,
        details: newPerson.details,
        imageUrl: capturedImage || "/placeholder.svg",
      }

      setKnownPeople([...knownPeople, person])
      setRecognitionResult({
        isRecognized: true,
        person,
      })
      setShowAddPersonDialog(false)
      setNewPerson({ name: "", relationship: "", details: "" })
    }
  }

  const resetRecognition = () => {
    setCapturedImage(null)
    setRecognitionResult(null)
  }

  const handleEmergencyCall = () => {
    alert("Emergency call initiated. Contacting caretaker...")
    // In a real app, this would initiate a call or send an alert
  }

  const handleCallPerson = (person: any) => {
    alert(`Calling ${person?.name}...`)
    // In a real app, this would initiate a call
  }

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
              Who am I?
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowRecognitionDialog(true)
                resetRecognition()
              }}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Who is this?
            </Button>
            <Button variant="outline" size="sm" onClick={handleEmergencyCall}>
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
              <div className="border rounded-lg overflow-hidden h-[400px]">
                <div className="relative w-full h-full">
                  <MapComponent
                    onLocationUpdate={(location) => {
                      // Update patient status based on distance from base
                      const distance = location.distance
                      setCurrentDistance(distance)
                      if (distance > 500) {
                        setPatientStatus("alert")
                      } else if (distance > 400) {
                        setPatientStatus("warning")
                      } else {
                        setPatientStatus("safe")
                      }
                    }}
                    safeRadius={500}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Distance from base: {Math.round(currentDistance)}m</span>
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

      {/* Who am I Dialog */}
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
            <Button
              className="w-full"
              onClick={() => {
                setShowIdentityDialog(false)
                handleEmergencyCall()
              }}
            >
              <Phone className="mr-2 h-4 w-4" />
              Call Caretaker
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Who is this Dialog */}
      <Dialog
        open={showRecognitionDialog}
        onOpenChange={(open) => {
          if (!open) stopCamera()
          setShowRecognitionDialog(open)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Who is this person?</DialogTitle>
            <DialogDescription>Take a photo or upload an image of the person you want to identify</DialogDescription>
          </DialogHeader>

          {!capturedImage && !recognitionResult && (
            <div className="flex flex-col space-y-4">
              {isUsingCamera ? (
                <div className="relative border rounded-lg overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
                    <Button onClick={capturePhoto}>
                      <Camera className="mr-2 h-4 w-4" />
                      Capture
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        stopCamera()
                        setIsUsingCamera(false)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center space-x-4">
                  <Button onClick={startCamera}>
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo
                  </Button>
                  <div className="relative">
                    <Button variant="outline" onClick={() => document.getElementById("upload-photo")?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photo
                    </Button>
                    <input
                      type="file"
                      id="upload-photo"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {capturedImage && !recognitionResult && (
            <div className="flex flex-col space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <img src={capturedImage || "/placeholder.svg"} alt="Preview" className="w-full h-64 object-cover" />
              </div>
              <div className="flex justify-center space-x-2">
                <Button onClick={recognizePerson}>
                  <User className="mr-2 h-4 w-4" />
                  Identify Person
                </Button>
                <Button variant="outline" onClick={resetRecognition}>
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {recognitionResult && (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-center">
                {recognitionResult.isRecognized ? (
                  <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                ) : (
                  <AlertTriangle className="h-12 w-12 text-amber-500 mb-2" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-center">
                {recognitionResult.isRecognized ? "Person Identified!" : "Stranger Alert"}
              </h3>

              <div className="flex items-center space-x-4 border rounded-lg p-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={
                      recognitionResult.isRecognized
                        ? recognitionResult.person?.imageUrl
                        : capturedImage || "/placeholder.svg"
                    }
                    alt="Person"
                  />
                  <AvatarFallback>
                    {recognitionResult.isRecognized ? recognitionResult.person?.name.charAt(0) : "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {recognitionResult.isRecognized ? recognitionResult.person?.name : "Unknown Person"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {recognitionResult.isRecognized ? recognitionResult.person?.relationship : "Not in your database"}
                  </p>
                  {recognitionResult.isRecognized && recognitionResult.person?.details && (
                    <p className="text-sm mt-1">{recognitionResult.person.details}</p>
                  )}
                </div>
              </div>

              {recognitionResult.isRecognized ? (
                <Button onClick={() => recognitionResult?.person && handleCallPerson(recognitionResult.person)}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call This Person
                </Button>
              ) : (
                <>
                  <Alert variant="warning">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>This person is not in your database. They may be a stranger.</AlertDescription>
                  </Alert>
                  <Button variant="outline" onClick={() => setShowAddPersonDialog(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add to Known People
                  </Button>
                </>
              )}

              <Button variant="outline" onClick={resetRecognition}>
                Try Again
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Person Dialog */}
      <Dialog open={showAddPersonDialog} onOpenChange={setShowAddPersonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Person</DialogTitle>
            <DialogDescription>Add this person to your known people database</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col space-y-4 py-4">
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={capturedImage || "/placeholder.svg"} alt="New person" />
                <AvatarFallback>NP</AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <FormLabel>Name</FormLabel>
                <Input
                  placeholder="Enter name"
                  value={newPerson.name}
                  onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <FormLabel>Relationship</FormLabel>
                <Input
                  placeholder="Enter relationship"
                  value={newPerson.relationship}
                  onChange={(e) => setNewPerson({ ...newPerson, relationship: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <FormLabel>Additional Details</FormLabel>
                <Textarea
                  placeholder="Enter additional details"
                  value={newPerson.details}
                  onChange={(e) => setNewPerson({ ...newPerson, details: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPersonDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPerson}>Save Person</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

