"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, MapPin, Phone, User, Trash2, X, Loader2 } from "lucide-react"
import { supabase } from "../supabaseConfig"
import { v4 } from "uuid"
import { toast } from "sonner"

interface KnownPerson {
  id: number
  name: string
  relationship: string
  details: string | null
  address: string
  photo_url: string
  supabase_img_url: string | null
  phone: number
}

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [progress, setProgress] = useState(20)
  const [knownPeople, setKnownPeople] = useState<KnownPerson[]>([])
  const [showKnownPeopleModal, setShowKnownPeopleModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [personName, setPersonName] = useState("")
  const [personRelationship, setPersonRelationship] = useState("")
  const [personDetails, setPersonDetails] = useState("")
  const [personPhotoURL, setPersonPhotoURL] = useState("")
  const [patientPhotos, setPatientPhotos] = useState<{front?: string, side?: string}>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const frontPhotoRef = useRef<HTMLInputElement>(null)
  const sidePhotoRef = useRef<HTMLInputElement>(null)
  const [personAddress, setPersonAddress] = useState("")
  const [personPhone, setPersonPhone] = useState("")

  // Load known people from Supabase on component mount
  useEffect(() => {
    loadKnownPeople()
  }, [])

  const loadKnownPeople = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('Known_People')
        .select('*')
      
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
      toast.error('Failed to load known people. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = async () => {
    if (step < 5) {
      setStep(step + 1)
      setProgress((step + 1) * 20)
    } else {
      setIsLoading(true)
      try {
        // First, delete all existing records
        const { error: deleteError } = await supabase
          .from('Known_People')
          .delete()
          .neq('id', 0) // This will delete all records

        if (deleteError) {
          console.error('Error deleting existing records:', deleteError)
          throw deleteError
        }

        // Then insert all new records
        const { error: insertError } = await supabase
          .from('Known_People')
          .insert(knownPeople.map(person => ({
            ...person,
            details: person.details || null,
            supabase_img_url: person.supabase_img_url || null
          })))

        if (insertError) {
          console.error('Error inserting new records:', insertError)
          throw insertError
        }
        
        toast.success('Setup completed successfully!')
        router.push("/dashboard")
      } catch (error: any) {
        console.error('Error saving known people:', error.message || error)
        toast.error(`Failed to save data: ${error.message || 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
      setProgress((step - 1) * 20)
    }
  }

  const handleUploadToSupabase = async (file: File): Promise<string> => {
    if (!file) return ""
    
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${v4()}.${fileExt}`
      const filePath = `patient-images/${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('patient-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('patient-images')
        .getPublicUrl(filePath)

      toast.success('Image uploaded successfully')
      return publicUrl
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error('Failed to upload image')
      return ""
    } finally {
      setUploading(false)
    }
  }

  const handleAddPerson = async () => {
    if (!personName || !personRelationship || !personAddress || !personPhone) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    let supabaseImageUrl = ""
    
    try {
      // If there's a photo URL (from file input) and it's a data URL (not already uploaded)
      if (personPhotoURL && personPhotoURL.startsWith("data:")) {
        // Convert data URL to blob
        const response = await fetch(personPhotoURL)
        const blob = await response.blob()
        
        // Convert blob to File
        const file = new File([blob], "photo.jpg", { type: "image/jpeg" })
        
        // Upload to Supabase
        supabaseImageUrl = await handleUploadToSupabase(file)
      }

      const newPerson: KnownPerson = {
        id: Date.now(),
        name: personName,
        relationship: personRelationship,
        details: personDetails || null,
        address: personAddress,
        photo_url: personPhotoURL || `/placeholder.svg?height=150&width=150&text=${personName.charAt(0)}`,
        supabase_img_url: supabaseImageUrl || null,
        phone: parseInt(personPhone) || 0
      }

      // Insert directly into Supabase
      const { error: insertError } = await supabase
        .from('Known_People')
        .insert([newPerson])

      if (insertError) {
        console.error('Error inserting person:', insertError)
        throw insertError
      }

      setKnownPeople([...knownPeople, newPerson])
      toast.success('Person added successfully')

      // Clear form
      setPersonName("")
      setPersonRelationship("")
      setPersonDetails("")
      setPersonPhotoURL("")
      setPersonAddress("")
      setPersonPhone("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error('Error adding person:', error)
      toast.error('Failed to add person')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemovePerson = async (id: number) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('Known_People')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setKnownPeople(knownPeople.filter((person) => person.id !== id))
      toast.success('Person removed successfully')
    } catch (error) {
      console.error('Error removing person:', error)
      toast.error('Failed to remove person')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()

      reader.onload = (event) => {
        if (event.target?.result) {
          setPersonPhotoURL(event.target.result as string)
        }
      }

      reader.readAsDataURL(file)
    }
  }

  const handlePatientPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'side') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const downloadURL = await handleUploadToSupabase(file)
      
      setPatientPhotos(prev => ({
        ...prev,
        [type]: downloadURL
      }))
    }
  }

  const clearPhotoPreview = () => {
    setPersonPhotoURL("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Patient Setup</CardTitle>
          <CardDescription>Complete the following steps to set up monitoring for your patient</CardDescription>
          <Progress value={progress} className="h-2 mt-2" />
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Upload Patient Photos</h3>
              <p className="text-muted-foreground">Upload clear photos of the patient to help with identification</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center h-40 cursor-pointer hover:border-primary">
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Upload front-facing photo</p>
                  <input type="file" className="hidden" accept="image/*" ref={frontPhotoRef} onChange={(e) => handlePatientPhotoChange(e, 'front')} />
                </div>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center h-40 cursor-pointer hover:border-primary">
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Upload side-profile photo</p>
                  <input type="file" className="hidden" accept="image/*" ref={sidePhotoRef} onChange={(e) => handlePatientPhotoChange(e, 'side')} />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="patient-name">Patient Name</Label>
                <Input id="patient-name" placeholder="Enter patient's full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship">Your Relationship to Patient</Label>
                <Select>
                  <SelectTrigger id="relationship">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Family Member</SelectItem>
                    <SelectItem value="professional">Professional Caretaker</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Set Location Parameters</h3>
              <p className="text-muted-foreground">Define the base location and safe radius for the patient</p>
              <div className="border rounded-lg p-4 h-64 bg-muted flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Map will be displayed here</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Set Current Location as Base
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="radius">Safe Radius (meters)</Label>
                  <span className="text-sm text-muted-foreground">500m</span>
                </div>
                <Slider defaultValue={[500]} min={100} max={2000} step={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Base Location Address</Label>
                <Input id="address" placeholder="Enter full address" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Add Known People</h3>
              <p className="text-muted-foreground">Add people the patient knows for the recognition feature</p>

              <div className="border rounded-lg p-4 max-h-[200px] overflow-y-auto">
                {knownPeople.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <User className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No people added yet. Use the form below to add people the patient knows.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {knownPeople.map((person) => (
                      <div key={person.id} className="flex items-center p-2 border rounded-lg">
                        <div className="h-12 w-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                          {person.photo_url.startsWith("data:") ? (
                            <img
                              src={person.photo_url || "/placeholder.svg"}
                              alt={person.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center text-lg font-semibold">
                              {person.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">{person.name}</p>
                          <p className="text-sm text-muted-foreground">{person.relationship}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePerson(person.id)}
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border rounded-lg p-4 mt-4">
                <h4 className="font-medium mb-3">Add Person</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="person-name">Name</Label>
                    <Input
                      id="person-name"
                      placeholder="Enter person's name"
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="person-relationship">Relationship to Patient</Label>
                    <Input
                      id="person-relationship"
                      placeholder="E.g., Daughter, Doctor, Neighbor"
                      value={personRelationship}
                      onChange={(e) => setPersonRelationship(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="person-address">Address</Label>
                    <Input
                      id="person-address"
                      placeholder="Enter person's address"
                      value={personAddress}
                      onChange={(e) => setPersonAddress(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="person-phone">Phone Number</Label>
                    <Input
                      id="person-phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={personPhone}
                      onChange={(e) => setPersonPhone(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="person-details">Additional Details</Label>
                    <Textarea
                      id="person-details"
                      placeholder="E.g., Visits on weekends, Lives nearby, etc."
                      value={personDetails}
                      onChange={(e) => setPersonDetails(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Photo</Label>
                    {personPhotoURL ? (
                      <div className="relative w-24 h-24 mt-2">
                        <img
                          src={personPhotoURL || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-md"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={clearPhotoPreview}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center h-24 cursor-pointer hover:border-primary">
                        <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">Upload photo</p>
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handlePhotoChange}
                        />
                      </div>
                    )}
                  </div>

                  <Button onClick={handleAddPerson} className="w-full">
                    Add Person
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Emergency Contact Information</h3>
              <p className="text-muted-foreground">Provide emergency contact details for alerts</p>
              <div className="space-y-2">
                <Label htmlFor="emergency-name">Emergency Contact Name</Label>
                <Input id="emergency-name" placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency-phone">Emergency Contact Phone</Label>
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <Input id="emergency-phone" type="tel" placeholder="Enter phone number" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency-relationship">Relationship to Patient</Label>
                <Select>
                  <SelectTrigger id="emergency-relationship">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Family Member</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary-phone">Secondary Contact Phone (Optional)</Label>
                <Input id="secondary-phone" type="tel" placeholder="Enter secondary phone number" />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Review and Confirm</h3>
              <p className="text-muted-foreground">Please review the information below before finalizing setup</p>
              <div className="space-y-4 border rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm font-medium">Patient Name:</p>
                    <p className="text-sm text-muted-foreground">John Doe</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Relationship:</p>
                    <p className="text-sm text-muted-foreground">Family Member</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Base Location:</p>
                    <p className="text-sm text-muted-foreground">123 Main St, Anytown</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Safe Radius:</p>
                    <p className="text-sm text-muted-foreground">500 meters</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Emergency Contact:</p>
                    <p className="text-sm text-muted-foreground">Jane Doe</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Emergency Phone:</p>
                    <p className="text-sm text-muted-foreground">(555) 123-4567</p>
                  </div>
                </div>
                <div className="flex justify-center space-x-2">
                  <div className="border rounded-lg w-20 h-20 flex items-center justify-center bg-muted">
                    <p className="text-xs text-muted-foreground">Photo 1</p>
                  </div>
                  <div className="border rounded-lg w-20 h-20 flex items-center justify-center bg-muted">
                    <p className="text-xs text-muted-foreground">Photo 2</p>
                  </div>
                </div>

                <div className="pt-3 border-t mt-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium">Known People</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowKnownPeopleModal(true)}
                      disabled={knownPeople.length === 0}
                    >
                      View List
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{knownPeople.length} people added</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm" className="flex items-center space-x-2 cursor-pointer">
                  <Input id="confirm" type="checkbox" className="w-4 h-4" />
                  <span>I confirm that all information provided is accurate</span>
                </Label>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={prevStep} disabled={step === 1 || isLoading}>
            Back
          </Button>
          <Button onClick={nextStep} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {step < 5 ? "Saving..." : "Completing Setup..."}
              </>
            ) : (
              step < 5 ? "Continue" : "Complete Setup"
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Known People Modal */}
      <Dialog open={showKnownPeopleModal} onOpenChange={setShowKnownPeopleModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Known People List</DialogTitle>
            <DialogDescription>People the patient knows for the recognition feature</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
            {knownPeople.map((person) => (
              <div key={person.id} className="border rounded-lg overflow-hidden">
                <div className="h-32 bg-muted">
                  {person.photo_url.startsWith("data:") ? (
                    <img
                      src={person.photo_url || "/placeholder.svg"}
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-semibold">
                      {person.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-medium">{person.name}</p>
                  <p className="text-sm text-muted-foreground">{person.relationship}</p>
                  {person.details && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{person.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowKnownPeopleModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

