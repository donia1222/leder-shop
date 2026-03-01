"use client"

import { useEffect, useState } from "react"

export function SplashScreen() {
  const [visible, setVisible] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const shown = sessionStorage.getItem("leder-splash")
    if (shown) return
    sessionStorage.setItem("leder-splash", "1")
    setVisible(true)
    const t1 = setTimeout(() => setFadeOut(true), 2000)
    const t2 = setTimeout(() => setVisible(false), 2600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (!visible) return null

  return (
    <>
      <style>{`
        @keyframes splashFadeIn {
          from { opacity: 0 }
          to   { opacity: 1 }
        }
        @keyframes splashFadeOut {
          from { opacity: 1 }
          to   { opacity: 0 }
        }
        @keyframes splashBox {
          0%   { opacity: 0; transform: scale(0.72) translateY(24px); }
          65%  { opacity: 1; transform: scale(1.04) translateY(-3px); }
          100% { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes splashText {
          0%   { opacity: 0; transform: translateY(14px); }
          100% { opacity: 1; transform: translateY(0);    }
        }
        @keyframes shimmer {
          0%   { background-position: -300% center; }
          100% { background-position:  300% center; }
        }
        @keyframes borderPulse {
          0%,100% { box-shadow: inset 0 0 0 4px rgba(139,94,60,0.12), 0 0 24px rgba(196,154,108,0.10), 0 12px 48px rgba(0,0,0,0.5); }
          50%     { box-shadow: inset 0 0 0 4px rgba(139,94,60,0.20), 0 0 48px rgba(196,154,108,0.30), 0 12px 48px rgba(0,0,0,0.5); }
        }
        @keyframes dot {
          0%,100% { opacity: 0.25; transform: scale(0.7); }
          50%     { opacity: 1;    transform: scale(1.3); }
        }
        @keyframes lineDraw {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 0.6; }
        }
        @keyframes cornerIn {
          from { opacity: 0; transform: scale(0); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0d0602 0%, #2D1206 40%, #1a0b04 70%, #0d0602 100%)",
          animation: fadeOut
            ? "splashFadeOut 0.55s cubic-bezier(0.4,0,1,1) forwards"
            : "splashFadeIn 0.35s ease forwards",
        }}
      >
        {/* Ambient glow circles */}
        <div style={{ position:"absolute", top:"12%", left:"8%",  width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle, rgba(139,94,60,0.18) 0%, transparent 68%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"10%", right:"8%", width:380, height:380, borderRadius:"50%", background:"radial-gradient(circle, rgba(196,154,108,0.12) 0%, transparent 68%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"40%", right:"15%", width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle, rgba(139,94,60,0.10) 0%, transparent 68%)", pointerEvents:"none" }} />

        {/* Main animated container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            animation: "splashBox 0.75s cubic-bezier(0.34,1.56,0.64,1) 0.1s both",
          }}
        >
          {/* Dashed border card */}
          <div
            style={{
              position: "relative",
              padding: "36px 56px",
              borderRadius: 24,
              border: "2px dashed #8B5E3C",
              textAlign: "center",
              animation: "borderPulse 2.2s ease infinite",
            }}
          >
            {/* Corner ornaments */}
            {[
              { top: 10, left: 10 },
              { top: 10, right: 10, flipX: true },
              { bottom: 10, left: 10, flipY: true },
              { bottom: 10, right: 10, flipX: true, flipY: true },
            ].map((pos, i) => {
              const { flipX, flipY, ...style } = pos as any
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: 14,
                    height: 14,
                    ...style,
                    animation: `cornerIn 0.4s ease ${0.5 + i * 0.08}s both`,
                    transform: `scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
                  }}
                >
                  <div style={{ width: "100%", height: 2, background: "#C49A6C", borderRadius: 2 }} />
                  <div style={{ width: 2, height: "100%", background: "#C49A6C", borderRadius: 2, marginTop: -2 }} />
                </div>
              )
            })}

            {/* Logo */}
            <div style={{ animation: "splashText 0.5s ease 0.4s both" }}>
              <img
                src="/logo.png"
                alt="Leder-Shop"
                style={{ height: 72, width: "auto", objectFit: "contain", marginBottom: 20, filter: "drop-shadow(0 4px 16px rgba(196,154,108,0.4))" }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
              />
            </div>

            {/* Shop name with shimmer */}
            <div
              style={{
                fontSize: 36,
                fontWeight: 900,
                letterSpacing: "-0.02em",
                lineHeight: 1,
                background: "linear-gradient(90deg, #8B5E3C 0%, #C49A6C 30%, #F0D090 50%, #C49A6C 70%, #8B5E3C 100%)",
                backgroundSize: "300% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "splashText 0.5s ease 0.55s both, shimmer 2.5s linear 0.55s infinite",
              }}
            >
              Leder-Shop
            </div>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                margin: "14px auto",
                animation: "splashText 0.5s ease 0.75s both",
              }}
            >
              <div style={{ height: 1, width: 40, background: "linear-gradient(to right, transparent, #C49A6C)", transformOrigin: "right", animation: "lineDraw 0.5s ease 0.85s both" }} />
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#C49A6C", boxShadow: "0 0 8px rgba(196,154,108,0.8)" }} />
              <div style={{ height: 1, width: 40, background: "linear-gradient(to left, transparent, #C49A6C)", transformOrigin: "left", animation: "lineDraw 0.5s ease 0.85s both" }} />
            </div>

            {/* Tagline */}
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#A07848",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                animation: "splashText 0.5s ease 0.9s both",
              }}
            >
              LEDER · HANDWERK · QUALITÄT
            </div>
          </div>

          {/* Location line */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              animation: "splashText 0.5s ease 1.05s both",
            }}
          >
            <div style={{ height: 1, width: 36, background: "#C49A6C", opacity: 0.5 }} />
            <span style={{ color: "#8B5E3C", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Seit 2018 · Sax, Schweiz
            </span>
            <div style={{ height: 1, width: 36, background: "#C49A6C", opacity: 0.5 }} />
          </div>

          {/* Animated dots */}
          <div style={{ display: "flex", gap: 8, animation: "splashText 0.5s ease 1.2s both" }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#C49A6C",
                  animation: `dot 0.9s ease ${0.4 + i * 0.18}s infinite`,
                  boxShadow: "0 0 6px rgba(196,154,108,0.6)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
