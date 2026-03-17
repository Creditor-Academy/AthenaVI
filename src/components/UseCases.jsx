import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const CARDS = [
  {
    title: "Course Creators",
    image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=600&auto=format&fit=crop",
    x: -620, y: 240, rotate: -12
  },
  {
    title: "Universities & Educational Institutions",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dee402?q=80&w=600&auto=format&fit=crop",
    x: -385, y: 140, rotate: -10
  },
  { 
    title: "Corporate Training Teams",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop",
    x: -135, y: 70, rotate: -5
  },
  {
    title: "Marketing Teams",
    image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?q=80&w=600&auto=format&fit=crop",
    x: 135, y: 70, rotate: 5
  },
  {
    title: "EdTech Platforms",
    image: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=600&auto=format&fit=crop",
    x: 385, y: 140, rotate: 10
  },
  {
    title: "Content Creators",
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=600&auto=format&fit=crop",
    x: 620, y: 240, rotate: 12
  }
];

export default function UseCases() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Heading Animation: Entry (0-0.1) and Glide Down (0.15-0.35) to a fixed "stop" point
  const textY = useTransform(smoothProgress, [0, 0.1, 0.15, 0.35], [50, 0, 0, 380]);
  const textScale = useTransform(smoothProgress, [0, 0.1, 0.15, 0.35], [0.95, 1, 1, 0.94]);
  const textOpacity = 1;

  return (
    <div ref={containerRef} style={{ height: "450vh", position: "relative", background: "#ffffffff", fontFamily: "'Inter', sans-serif" }}>
      {/* Decorative Wave Divider at Top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 5,
        lineHeight: 0,
        pointerEvents: 'none'
      }}>
        <svg viewBox="0 0 1200 140" preserveAspectRatio="none" style={{ width: '100%', height: '200px', display: 'block' }}>
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e40af" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>

          {/* Base Blue Section (Matches PlatformFeatures) */}
          <path d="M0 0 H1200 V100 C1050 100 900 20 600 20 C300 20 150 100 0 100 Z" fill="url(#waveGradient)" />
          
          {/* Gold Decorative Line 1 */}
          <path d="M0 105 C150 105 300 25 600 25 C900 25 1050 105 1200 105" fill="none" stroke="#fbbf24" strokeWidth="3" opacity="0.6" />
          
          {/* Gold Decorative Line 2 (Offset for depth) */}
          <path d="M0 112 C150 112 300 32 600 32 C900 32 1050 112 1200 112" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.4" />
          
          {/* Subtle Light Blue Accent Line */}
          <path d="M0 100 C150 100 300 20 600 20 C900 20 1050 100 1200 100" fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.3" />
        </svg>
      </div>

      <div style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: "80px",
        overflow: "hidden"
      }}>
        {/* Visual Enhancement: Radial Background Glows */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none"
        }}>
          <div style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "1200px",
            height: "1200px",
            background: "radial-gradient(circle, rgba(37, 99, 235, 0.06) 0%, rgba(255, 255, 255, 0) 70%)",
            borderRadius: "50%"
          }} />
        </div>
        {/* Visual Enhancement: Radial Background Glows */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none"
        }}>
          <div style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "1200px",
            height: "1200px",
            background: "radial-gradient(circle, rgba(37, 99, 235, 0.06) 0%, rgba(255, 255, 255, 0) 70%)",
            borderRadius: "50%"
          }} />
        </div>

        {/* Bottom Center Content - Visible from start, gliding down */}
        <motion.div
          style={{
            zIndex: 100,
            textAlign: "center",
            maxWidth: "900px",
            padding: "0 20px",
            y: textY,
            scale: textScale,
            opacity: textOpacity
          }}>
          <motion.span
            style={{
              display: "inline-block",
              padding: "8px 20px",
              background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
              borderRadius: "100px",
              fontSize: "11px",
              fontWeight: 700,
              color: "#334155",
              marginBottom: "36px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
              border: "1px solid rgba(226,232,240,0.8)",
              textTransform: "uppercase",
              letterSpacing: "0.08em"
            }}>
            Use Cases
          </motion.span>
          <h2 style={{
            fontSize: "50px",
            fontWeight: 900,
            color: "#0F172A",
            lineHeight: 0.95,
            letterSpacing: "-0.05em",
            margin: 0,
            background: "linear-gradient(to bottom, #0F172A 0%, #334155 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Who use Athena VI
          </h2>
          <p style={{ marginTop: "36px", fontSize: "20px", color: "#64748B", lineHeight: 1.5, fontWeight: 450, maxWidth: "750px", margin: "36px auto 0" }}>
            Professionals across education, corporate training, marketing, and digital platforms use Athena VI to create
            <span style={{ color: "#0F172A", fontWeight: 600 }}> high-quality videos </span>
            quickly with AI-powered instructors.
          </p>
        </motion.div>

        {/* Animated Cards - Perfectly equal 230px spacing */}
        {CARDS.map((card, i) => {
          // Stagger triggers starting after heading settles
          // Cards appear much earlier (start at 8% vs 30%)
          const startTrigger = 0.05 + (i * 0.04);
          const endTrigger = startTrigger + 0.1;

          const y = useTransform(smoothProgress, [startTrigger, endTrigger], [800, card.y]);
          const x = useTransform(smoothProgress, [startTrigger, endTrigger], [0, card.x]);
          const opacity = useTransform(smoothProgress, [startTrigger, startTrigger + 0.05], [0, 1]);
          const scale = useTransform(smoothProgress, [startTrigger, endTrigger], [0.35, 1]);
          const rotate = useTransform(smoothProgress, [startTrigger, endTrigger], [0, card.rotate]);

          return (
            <motion.div
              key={i}
              style={{
                position: "absolute",
                width: "200px",
                left: "calc(50% - 100px)",
                bottom: "60%",
                x,
                y,
                opacity,
                scale,
                rotate,
                zIndex: 10 + i,
                pointerEvents: "auto"
              }}
            >
              <motion.div
                whileHover={{
                  scale: 1.05,
                  y: -12,
                  zIndex: 200,
                  boxShadow: "0 40px 80px -20px rgba(0,0,0,0.18)",
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                style={{
                  background: "transparent",
                  backdropFilter: "blur(16px)",
                  borderRadius: "10px",
                  padding: "0px",
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  overflow: "hidden",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <div style={{
                  position: "relative",
                  width: "100%",
                  height: "280px",
                  borderRadius: "12px",
                  overflow: "hidden"
                }}>

                  <img
                    src={card.image}
                    alt={card.title}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                  <img
                    src={card.image}
                    alt={card.title}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />

                  {/* overlay gradient for readability */}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.15))"
                  }} />
                  {/* overlay gradient for readability */}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.15))"
                  }} />

                  {/* text above image */}
                  <div style={{
                    position: "absolute",
                    bottom: "16px",
                    left: "16px",
                    right: "16px",
                    color: "white"
                  }}>
                    <h4 style={{
                      fontSize: "17px",
                      fontWeight: 800,
                      margin: 0,
                      lineHeight: 1.25
                    }}>
                      {card.title}
                    </h4>
                  </div>
                  {/* text above image */}
                  <div style={{
                    position: "absolute",
                    bottom: "16px",
                    left: "16px",
                    right: "16px",
                    color: "white"
                  }}>
                    <h4 style={{
                      fontSize: "17px",
                      fontWeight: 800,
                      margin: 0,
                      lineHeight: 1.25
                    }}>
                      {card.title}
                    </h4>
                  </div>

                </div>
              </motion.div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}