document.addEventListener("DOMContentLoaded", () => {
  const mainView = document.getElementById("main-view")
  const identityView = document.getElementById("identity-view")
  const whoAmIBtn = document.getElementById("who-am-i-btn")
  const backToMainBtn = document.getElementById("back-to-main")

  if (whoAmIBtn && identityView && mainView) {
    whoAmIBtn.addEventListener("click", () => {
      mainView.classList.add("hidden")
      identityView.classList.remove("hidden")
    })
  }

  if (backToMainBtn && mainView && identityView) {
    backToMainBtn.addEventListener("click", () => {
      identityView.classList.add("hidden")
      mainView.classList.remove("hidden")
    })
  }

  // Simulated location updates for patient view
  function updatePatientLocation() {
    // In a real app, this would use the device's geolocation
    // For demo purposes, we'll just update the text

    setInterval(() => {
      const distance = Math.floor(Math.random() * 700) // Random distance 0-700m

      const distanceInfo = document.querySelector(".distance-info")
      if (distanceInfo) {
        distanceInfo.textContent = `You are ${distance} meters from home`
      }
    }, 10000)
  }

  // Start location updates
  updatePatientLocation()
})

