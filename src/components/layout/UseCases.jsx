import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from "framer-motion";

import CourseCreatorImg from "../../assets/Course Creator.jpg";
import UniversityImg from "../../assets/University.jpg";
import CorporateTrainingImg from "../../assets/Cooporate training teams.jpg";
import MarketingTeamsImg from "../../assets/Marketing Teams.jpg";
import EdTechPlatformImg from "../../assets/EdTech platform.jpg";
import ContentCreatorImg from "../../assets/Content Creator.jpg";

const CARDS = [
  {
    title: "Course Creators",
    image: CourseCreatorImg,
    x: -620, y: 240, rotate: -12
  },
  {
    title: "Universities & Educational Institutions",
    image: UniversityImg,
    x: -385, y: 140, rotate: -10
  },
  { 
    title: "Corporate Training Teams",
    image: CorporateTrainingImg,
    x: -135, y: 70, rotate: -5
  },
  {
    title: "Marketing Teams",
    image: MarketingTeamsImg,
    x: 135, y: 70, rotate: 5
  },
  {
    title: "EdTech Platforms",
    image: EdTechPlatformImg,
    x: 385, y: 140, rotate: 10
  },
  {
    title: "Content Creator",
    image: ContentCreatorImg,
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

  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [hasLanded, setHasLanded] = useState(new Array(CARDS.length).fill(false));
  const [textHasLanded, setTextHasLanded] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1100);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Shared Animation Values
  const scrollTextY = useTransform(smoothProgress, [0, 0.1, 0.15, 0.35], [50, 0, 0, 380]);
  const scrollTextScale = useTransform(smoothProgress, [0, 0.1, 0.15, 0.35], [0.95, 1, 1, 0.94]);

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    // Lock text
    if (latest >= 0.35 && !textHasLanded) setTextHasLanded(true);

    // Lock cards
    let updated = false;
    const newLanded = [...hasLanded];
    CARDS.forEach((_, i) => {
      const endTrigger = 0.05 + (i * 0.04) + 0.1;
      if (latest >= endTrigger && !newLanded[i]) {
        newLanded[i] = true;
        updated = true;
      }
    });
    if (updated) setHasLanded(newLanded);
  });

  const textY = textHasLanded && !isMobile ? 380 : scrollTextY;
  const textScale = textHasLanded && !isMobile ? 0.94 : scrollTextScale;

  return (
    <div 
      ref={containerRef} 
      style={{ 
        height: isMobile ? "auto" : "450vh", 
        position: "relative", 
        background: "#ffffff", 
        fontFamily: "'Inter', sans-serif",
        paddingBottom: isMobile ? "60px" : "0"
      }}
    >
      {/* Wave Divider */}
      <div style={{
        position: isMobile ? 'relative' : 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 5,
        lineHeight: 0
      }}>
        <svg viewBox="0 0 1200 140" preserveAspectRatio="none" style={{ width: '100%', height: isMobile ? '100px' : '200px', display: 'block' }}>
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e40af" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
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
        position: isMobile ? "relative" : "sticky",
        top: 0,
        height: isMobile ? "auto" : "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: isMobile ? "40px" : "80px",
        overflow: isMobile ? "visible" : "hidden"
      }}>
        
        {/* Glow Effects (Desktop Only) */}
        {!isMobile && (
          <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
            <div style={{
              position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
              width: "100%", height: "100%", maxWidth: "1200px",
              background: "radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%)"
            }} />
          </div>
        )}

        {/* Header Content */}
        <motion.div
          style={{
            zIndex: 100,
            textAlign: "center",
            maxWidth: "900px",
            padding: "0 20px",
            y: isMobile ? 0 : textY,
            scale: isMobile ? 1 : textScale,
          }}>
          <span style={{
            display: "inline-block",
            padding: "8px 20px",
            background: "#f1f5f9",
            borderRadius: "100px",
            fontSize: "11px",
            fontWeight: 700,
            color: "#334155",
            marginBottom: "24px",
            textTransform: "uppercase",
            letterSpacing: "0.1em"
          }}>
            Use Cases
          </span>
          <h2 style={{
            fontFamily: "'Georgia', serif",
            fontSize: isMobile ? "36px" : "55px",
            fontWeight: 400,
            color: "#0F172A",
            lineHeight: 1.2,
            margin: 0
          }}>
            Who use Athena VI
          </h2>
          <p style={{ 
            marginTop: "24px", 
            fontSize: isMobile ? "16px" : "18px", 
            color: "#64748B", 
            lineHeight: 1.7,
            maxWidth: "700px",
            margin: "24px auto 0"
          }}>
            Professionals across education, training, and marketing use Athena VI to create 
            <span style={{ color: "#0F172A", fontWeight: 600 }}> high-quality videos </span> 
            instantly.
          </p>
        </motion.div>

        {/* Cards Container */}
        <div style={{
          position: isMobile ? "relative" : "absolute",
          inset: 0,
          display: isMobile ? "grid" : "block",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          padding: isMobile ? "40px 20px" : "0",
          marginTop: isMobile ? "20px" : "0"
        }}>
          {CARDS.map((card, i) => {
            const startTrigger = 0.05 + (i * 0.04);
            const endTrigger = startTrigger + 0.1;

            const scrollY = useTransform(smoothProgress, [startTrigger, endTrigger], [800, isTablet ? card.y / 1.6 : card.y]);
            const scrollX = useTransform(smoothProgress, [startTrigger, endTrigger], [0, isTablet ? card.x / 1.6 : card.x]);
            const opacity = useTransform(smoothProgress, [startTrigger, startTrigger + 0.05], [0, 1]);
            const scale = useTransform(smoothProgress, [startTrigger, endTrigger], [0.4, 1]);
            const rotate = useTransform(smoothProgress, [startTrigger, endTrigger], [0, card.rotate]);

            const isFixed = hasLanded[i] && !isMobile;

            return (
              <motion.div
                key={i}
                initial={isMobile ? { opacity: 0, y: 30 } : false}
                whileInView={isMobile ? { opacity: 1, y: 0 } : false}
                viewport={{ once: true }}
                style={{
                  position: isMobile ? "relative" : "absolute",
                  width: isMobile ? "100%" : "200px",
                  left: isMobile ? "0" : "calc(50% - 100px)",
                  bottom: isMobile ? "0" : "60%",
                  x: isMobile ? 0 : (isFixed ? (isTablet ? card.x / 1.6 : card.x) : scrollX),
                  y: isMobile ? 0 : (isFixed ? (isTablet ? card.y / 1.6 : card.y) : scrollY),
                  opacity: isMobile ? 1 : (isFixed ? 1 : opacity),
                  scale: isMobile ? 1 : (isFixed ? 1 : scale),
                  rotate: isMobile ? 0 : (isFixed ? card.rotate : rotate),
                  zIndex: 10 + i
                }}
              >
                <div style={{
                  background: "white",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                  cursor: "pointer"
                }}>
                  <div style={{ position: "relative", height: isMobile ? "240px" : "280px" }}>
                    <img src={card.image} alt={card.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }} />
                    <h4 style={{ position: "absolute", bottom: "16px", left: "16px", right: "16px", color: "white", margin: 0, fontSize: "17px", fontWeight: 600 }}>
                      {card.title}
                    </h4>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}