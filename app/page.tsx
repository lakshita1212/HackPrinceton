import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tight">SafeTrack</h1>
        <p className="text-xl text-gray-600">
          A caring solution to help you keep track of your loved ones
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mb-12">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-2">Easy Setup</h2>
          <p className="text-gray-600 mb-2">Create an account and set up in minutes</p>
          <p className="text-gray-700">
            Quick and simple registration process for caretakers to set up monitoring for their patients.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-2">Location Tracking</h2>
          <p className="text-gray-600 mb-2">Know where your loved ones are</p>
          <p className="text-gray-700">
            Set a safe radius and receive alerts when your patient wanders outside the designated area.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-2">Patient Support</h2>
          <p className="text-gray-600 mb-2">Help when it's needed most</p>
          <p className="text-gray-700">
            Simple "Who is this?" feature helps patients identify themselves and contact their caretaker.
          </p>
        </div>
      </div>

      {/* Call to Action Buttons */}
      <div className="flex gap-4">
        <Link href="/signup">
          <Button className="bg-black text-white hover:bg-black/90">
            Get Started
          </Button>
        </Link>
        <Link href="/login">
          <Button variant="outline">
            Login
          </Button>
        </Link>
      </div>
    </div>
  )
}

