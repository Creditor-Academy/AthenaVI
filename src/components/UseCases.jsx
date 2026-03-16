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

  // Heading Animation: Start visible (opacity 1), glide from top (-200) to position
  const textY = useTransform(smoothProgress, [0, 0.3], [-200, 10]);
  const textOpacity = useTransform(smoothProgress, [0, 0.03], [1, 1]);

  return (
    <div ref={containerRef} style={{ height: "450vh", position: "relative", background: "#ffffffff", fontFamily: "'Inter', sans-serif" }}>
      <div style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: "14vh",
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

        {/* Bottom Center Content - Visible from start, gliding down */}
        <motion.div
          style={{
            zIndex: 100,
            textAlign: "center",
            maxWidth: "900px",
            padding: "0 20px",
            y: textY,
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
          const startTrigger = 0.3 + (i * 0.06);
          const endTrigger = startTrigger + 0.12;

          const y = useTransform(smoothProgress, [startTrigger, endTrigger], [1200, card.y]);
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

                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}