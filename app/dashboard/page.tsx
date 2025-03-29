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
import { useRouter } from "next/navigation"
import { supabase } from "../supabaseConfig"
import { toast } from "sonner"

interface User {
  id: string
  email: string
  patient_name: string
  patient_photo_url: string | null
}

interface KnownPerson {
  id: string
  user_id: string
  name: string
  relationship: string
  phone: string
  photo_url: string | null
  supabase_img_url: string | null
}

export default function DashboardPage() {
  const [patientStatus, setPatientStatus] = useState("safe") // safe, warning, alert
  const [showIdentityDialog, setShowIdentityDialog] = useState(false)
  const [showRecognitionDialog, setShowRecognitionDialog] = useState(false)
  const [showAddPersonDialog, setShowAddPersonDialog] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isUsingCamera, setIsUsingCamera] = useState(false)
  const [recognitionResult, setRecognitionResult] = useState<{
    isRecognized: boolean
    person?: KnownPerson
  } | null>(null)
  const [knownPeople, setKnownPeople] = useState<KnownPerson[]>([])
  const [newPerson, setNewPerson] = useState({
    name: "",
    relationship: "",
    details: "",
  })
  const [currentDistance, setCurrentDistance] = useState(320)
  const [userData, setUserData] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Get user data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userError) throw userError

      if (userData) {
        setUserData(userData)
        loadKnownPeople(user.id)
      }
    } catch (error) {
      console.error('Error loading user:', error)
      toast.error('Failed to load user data')
    }
  }

  const loadKnownPeople = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('Known_People')
        .select('*')
        .eq('user_id', userId)
      
      if (error) {
        console.error('Supabase error:', error)
        toast.error(`Failed to load known people: ${error.message}`)
        return
      }
      
      if (data) {
        setKnownPeople(data)
      }
    } catch (error) {
      console.error('Error loading known people:', error)
      toast.error('Failed to load known people')
    } finally {
      setIsLoading(false)
    }
  }

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
        id: Date.now().toString(),
        user_id: userData?.id || "",
        name: newPerson.name,
        relationship: newPerson.relationship,
        phone: "",
        photo_url: capturedImage || null,
        supabase_img_url: capturedImage || null,
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
    const emergencyContacts = knownPeople.filter(person => 
      person.relationship.toLowerCase().includes('emergency') || 
      person.relationship.toLowerCase().includes('doctor')
    )
    
    if (emergencyContacts.length > 0) {
      // In a real app, this would initiate a call
      toast.info(`Calling emergency contact: ${emergencyContacts[0].name}`)
    } else {
      toast.error('No emergency contacts found')
    }
  }

  const handleCallPerson = (person: KnownPerson) => {
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
                  <AvatarImage src={userData?.patient_photo_url || ''} alt="Patient" />
                  <AvatarFallback>{userData?.patient_name?.charAt(0) || 'P'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{userData?.patient_name || 'Loading...'}</p>
                  <p className="text-sm text-muted-foreground">ID: #{userData?.id?.slice(0, 8) || '...'}</p>
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

              <div>
                <p className="text-sm font-medium mb-2">Emergency Contacts:</p>
                <div className="space-y-2">
                  {knownPeople
                    .filter(person => 
                      person.relationship.toLowerCase().includes('emergency') || 
                      person.relationship.toLowerCase().includes('doctor')
                    )
                    .map(contact => (
                      <div key={contact.id} className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{contact.name}: {contact.phone}</p>
                      </div>
                    ))}
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
                <AvatarImage src={userData?.patient_photo_url || ''} alt="Patient" />
                <AvatarFallback>{userData?.patient_name?.charAt(0) || 'P'}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-medium text-lg">{userData?.patient_name}</h3>
                <p className="text-muted-foreground">Patient ID: #{userData?.id?.slice(0, 8)}</p>
              </div>
              {knownPeople.length > 0 && (
                <div className="w-full space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Caretaker:</p>
                    <p className="text-sm">{knownPeople[0].name}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Relationship:</p>
                    <p className="text-sm">{knownPeople[0].relationship}</p>
                  </div>
                </div>
              )}
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
                        ? recognitionResult.person?.supabase_img_url
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

