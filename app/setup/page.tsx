"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Upload, MapPin, Phone } from "lucide-react"

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [progress, setProgress] = useState(25)

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1)
      setProgress((step + 1) * 25)
    } else {
      router.push("/dashboard")
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
      setProgress((step - 1) * 25)
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
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Upload Patient Photos</h3>
              <p className="text-muted-foreground">Upload clear photos of the patient to help with identification</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center h-40 cursor-pointer hover:border-primary">
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Upload front-facing photo</p>
                </div>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center h-40 cursor-pointer hover:border-primary">
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Upload side-profile photo</p>
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

          {step === 4 && (
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
          <Button variant="outline" onClick={prevStep} disabled={step === 1}>
            Back
          </Button>
          <Button onClick={nextStep}>{step < 4 ? "Continue" : "Complete Setup"}</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

