// Mobile Navigation Toggle
const hamburger = document.querySelector(".hamburger")
const navMenu = document.querySelector(".nav-menu")

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active")
  navMenu.classList.toggle("active")
})

// Close mobile menu when clicking on a link
document.querySelectorAll(".nav-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active")
    navMenu.classList.remove("active")
  })
})

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  })
})

// Header background on scroll
window.addEventListener("scroll", () => {
  const header = document.querySelector(".header")
  if (window.scrollY > 100) {
    header.style.background = "rgba(255, 255, 255, 0.98)"
    header.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)"
  } else {
    header.style.background = "rgba(255, 255, 255, 0.95)"
    header.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
  }
})

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("loaded")
    }
  })
}, observerOptions)

// Observe elements for animation
document.addEventListener("DOMContentLoaded", () => {
  const animatedElements = document.querySelectorAll(".stat-card, .feature-card, .service-card, .vehicle-card")
  animatedElements.forEach((el) => {
    el.classList.add("loading")
    observer.observe(el)
  })
})

// Counter animation for stats
function animateCounter(element, target, duration = 2000) {
  let start = 0
  const increment = target / (duration / 16)

  const timer = setInterval(() => {
    start += increment
    if (start >= target) {
      element.textContent = target + (element.textContent.includes("%") ? "%" : "+")
      clearInterval(timer)
    } else {
      element.textContent = Math.floor(start) + (element.textContent.includes("%") ? "%" : "+")
    }
  }, 16)
}

// Animate counters when they come into view
const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const statNumber = entry.target.querySelector("h3")
        const text = statNumber.textContent
        const number = Number.parseInt(text.replace(/\D/g, ""))

        if (text.includes("%")) {
          statNumber.textContent = "0%"
          animateCounter(statNumber, number)
        } else if (text.includes("+")) {
          statNumber.textContent = "0+"
          animateCounter(statNumber, number)
        } else if (text.includes("h")) {
          statNumber.textContent = "0h"
          animateCounter(statNumber, number)
        }

        statsObserver.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.5 },
)

document.querySelectorAll(".stat-card").forEach((card) => {
  statsObserver.observe(card)
})

// Form handling for service requests
document.querySelectorAll(".btn").forEach((button) => {
  if (button.textContent.includes("Solicitar Orçamento")) {
    button.addEventListener("click", (e) => {
      e.preventDefault()

      // Get service type from the card
      const serviceCard = button.closest(".service-card")
      const serviceTitle = serviceCard.querySelector("h3").textContent

      // WhatsApp message
      const message = `Olá! Gostaria de solicitar um orçamento para: ${serviceTitle}`
      const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`

      window.open(whatsappUrl, "_blank")
    })
  }
})

// Contact buttons
document.querySelectorAll(".btn").forEach((button) => {
  if (button.textContent.includes("Fale Conosco")) {
    button.addEventListener("click", (e) => {
      e.preventDefault()
      const message = "Olá! Gostaria de saber mais sobre os serviços da Ccapi Financiamentos."
      const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, "_blank")
    })
  }
})

// Parallax effect for hero section
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset
  const hero = document.querySelector(".hero")
  if (hero) {
    hero.style.transform = `translateY(${scrolled * 0.5}px)`
  }
})

// Lazy loading for images
if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src || img.src
        img.classList.remove("lazy")
        imageObserver.unobserve(img)
      }
    })
  })

  document.querySelectorAll("img[data-src]").forEach((img) => {
    imageObserver.observe(img)
  })
}

// Service card hover effects
document.querySelectorAll(".service-card").forEach((card) => {
  card.addEventListener("mouseenter", () => {
    card.style.transform = "translateY(-10px) scale(1.02)"
  })

  card.addEventListener("mouseleave", () => {
    if (card.classList.contains("featured")) {
      card.style.transform = "scale(1.05)"
    } else {
      card.style.transform = "translateY(0) scale(1)"
    }
  })
})

// Vehicle card interactions
document.querySelectorAll(".vehicle-card").forEach((card) => {
  card.addEventListener("click", () => {
    const vehicleTitle = card.querySelector("h3").textContent
    const message = `Olá! Tenho interesse no financiamento do veículo: ${vehicleTitle}`
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  })
})

// Add loading states for buttons
document.querySelectorAll(".btn").forEach((button) => {
  button.addEventListener("click", function () {
    if (!this.classList.contains("loading-btn")) {
      this.classList.add("loading-btn")
      const originalText = this.innerHTML
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...'

      setTimeout(() => {
        this.classList.remove("loading-btn")
        this.innerHTML = originalText
      }, 1500)
    }
  })
})

// Add CSS for loading button state
const style = document.createElement("style")
style.textContent = `
    .loading-btn {
        pointer-events: none;
        opacity: 0.7;
    }
    
    .lazy {
        opacity: 0;
        transition: opacity 0.3s;
    }
    
    .lazy.loaded {
        opacity: 1;
    }
`
document.head.appendChild(style)

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Add fade-in animation to main sections
  const sections = document.querySelectorAll("section")
  sections.forEach((section, index) => {
    section.style.opacity = "0"
    section.style.transform = "translateY(30px)"
    section.style.transition = "all 0.6s ease"

    setTimeout(() => {
      section.style.opacity = "1"
      section.style.transform = "translateY(0)"
    }, index * 200)
  })

  console.log("Ccapi Financiamentos - Site carregado com sucesso!")
})

// Error handling for images
document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("error", function () {
    this.src = "/truck-transport-vehicle.png"
  })
})

// Performance optimization - debounce scroll events
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Apply debounce to scroll events
const debouncedScrollHandler = debounce(() => {
  // Scroll handling code here
}, 10)

window.addEventListener("scroll", debouncedScrollHandler)
