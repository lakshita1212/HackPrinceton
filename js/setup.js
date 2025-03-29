document.addEventListener("DOMContentLoaded", () => {
  const steps = document.querySelectorAll(".setup-step")
  const progressBar = document.getElementById("setup-progress")
  const prevButton = document.getElementById("prev-step")
  const nextButton = document.getElementById("next-step")

  let currentStep = 1
  const totalSteps = steps.length

  // Initialize progress bar
  progressBar.style.width = `${(currentStep / totalSteps) * 100}%`

  // Function to update the current step
  function updateStep(step) {
    // Hide all steps
    steps.forEach((s) => s.classList.remove("active"))

    // Show current step
    document.getElementById(`step-${step}`).classList.add("active")

    // Update progress bar
    progressBar.style.width = `${(step / totalSteps) * 100}%`

    // Update buttons
    prevButton.disabled = step === 1

    if (step === totalSteps) {
      nextButton.textContent = "Complete Setup"
    } else {
      nextButton.textContent = "Continue"
    }

    // Update current step
    currentStep = step
  }

  // Event listeners for navigation buttons
  prevButton.addEventListener("click", () => {
    if (currentStep > 1) {
      updateStep(currentStep - 1)
    }
  })

  nextButton.addEventListener("click", () => {
    if (currentStep < totalSteps) {
      updateStep(currentStep + 1)

      // If moving to the review step, populate review data
      if (currentStep === totalSteps) {
        populateReviewData()
      }
    } else {
      // Complete setup
      window.location.href = "dashboard.html"
    }
  })

  // Radius slider
  const radiusSlider = document.getElementById("radius")
  const radiusValue = document.getElementById("radius-value")

  if (radiusSlider && radiusValue) {
    radiusSlider.addEventListener("input", () => {
      radiusValue.textContent = `${radiusSlider.value}m`
    })
  }

  // Set current location button
  const setLocationButton = document.getElementById("set-current-location")
  if (setLocationButton) {
    setLocationButton.addEventListener("click", () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            console.log(`Location set to: ${latitude}, ${longitude}`)

            // In a real app, you would use these coordinates to display a map
            // and store them for the patient's base location

            // For demo purposes, just show an alert
            alert(`Base location set to current position: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
          },
          (error) => {
            console.error("Error getting location:", error)
            alert("Could not get your current location. Please enter an address manually.")
          },
        )
      } else {
        alert("Geolocation is not supported by your browser. Please enter an address manually.")
      }
    })
  }

  // Function to populate review data
  function populateReviewData() {
    // Get values from previous steps
    const patientName = document.getElementById("patient-name").value || "John Doe"
    const relationship = document.getElementById("relationship").value || "Family Member"
    const address = document.getElementById("address").value || "123 Main St, Anytown"
    const radius = document.getElementById("radius").value || "500"
    const emergencyName = document.getElementById("emergency-name").value || "Jane Doe"
    const emergencyPhone = document.getElementById("emergency-phone").value || "(555) 123-4567"

    // Update review page
    document.getElementById("review-patient-name").textContent = patientName
    document.getElementById("review-relationship").textContent = relationship
    document.getElementById("review-location").textContent = address
    document.getElementById("review-radius").textContent = `${radius} meters`
    document.getElementById("review-emergency-name").textContent = emergencyName
    document.getElementById("review-emergency-phone").textContent = emergencyPhone
  }

  // File upload preview (simplified)
  const frontPhoto = document.getElementById("front-photo")
  const sidePhoto = document.getElementById("side-photo")

  if (frontPhoto) {
    frontPhoto.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        console.log("Front photo uploaded")
      }
    })
  }

  if (sidePhoto) {
    sidePhoto.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        console.log("Side photo uploaded")
      }
    })
  }
})

