import { useState, useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { MdTrendingDown, MdBarChart, MdLanguage, MdPeople, MdChevronLeft, MdChevronRight } from 'react-icons/md'

const styles = `
.impact-section {
  padding: 40px 40px;
  background: #ffffff;
  color: #0f172a;
  position: relative;
  overflow: hidden;
}

.impact-header {
  text-align: center;
  margin-bottom: 10px;
  position: relative;
  z-index: 10;
}

.impact-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 56px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 0 10px 0;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.impact-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  line-height: 1.7;
  margin: 0;
  color: #475569;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 400;
}

.card-number {
  font-size: 20px;
  color: #1585edff;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  margin-bottom: 16px;
}

.impact-card-title {
  font-family: 'Inter', sans-serif;
  font-size: 48px;
  font-weight: 900;
  margin: 0 0 16px 0;
  color: #0f172a;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: -2px;
}

.impact-card-description {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.7;
  color: #475569;
  font-weight: 400;
  margin-bottom: 24px;
}

.impact-card-standard {
  background: #ffffff;
  border-radius: 4px;
  padding: 40px 32px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  position: relative;
  width: 550px;
  height: 340px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.impact-card-standard:hover {
  transform: translateY(-6px);
  border-color: rgba(0, 0, 0, 0.15);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* Hide desktop logic on small screens */
@media (max-width: 1024px) {
  .desktop-impact-only { display: none !important; }
  .mobile-impact-only { display: block !important; }
}

@media (min-width: 1025px) {
  .desktop-impact-only { display: block; }
  .mobile-impact-only { display: none; }
}

/* Mobile specific styling */
.mobile-impact-section {
  padding: 80px 24px;
  background: #ffffff;
}

.mobile-impact-cards-wrapper {
  position: relative;
  overflow: hidden;
}

.mobile-impact-cards-slider {
  display: flex;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.mobile-impact-card-slide {
  min-width: 100%;
  flex-shrink: 0;
  padding: 0 12px;
  box-sizing: border-box;
}

.slider-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
}

.slider-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.05);
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  font-size: 28px;
  transition: all 0.2s;
}

.slider-button:hover {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.1);
}

.slider-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.slider-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  cursor: pointer;
  border: none;
  padding: 0;
  transition: all 0.2s;
}

.slider-dot.active {
  background: #a3e635;
  width: 32px;
  border-radius: 6px;
}
`

function ImpactSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Calculate a scale factor for smaller desktop screens (e.g., 1024px to 1700px)
  // Cluster width is 1650px (3 * 550px)
  const baseClusterWidth = 1750
  const scale = windowWidth < baseClusterWidth && windowWidth > 1024
    ? windowWidth / baseClusterWidth
    : 1

  const cards = [
    {
      number: '01',
      title: 'Cost-effective',
      description: 'Conventional video creation featuring live presenters often comes with high costs and lengthy timelines. Athena VI provides a groundbreaking artificial intelligence video platform that combines budget-friendly pricing with productivity.'
    },
    {
      number: '02',
      title: 'Global Audience',
      description: 'With over 120 languages available and a premium range of virtual presenters, your content can resonate with a global audience, ensuring no one is left behind.'
    },
    {
      number: '03',
      title: 'Retention',
      description: "Audiences engage much more effectively with video materials compared to written text. Through Athena VI, you're crafting memorable moments that resonate."
    }
  ]

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % cards.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + cards.length) % cards.length)
  const goToSlide = (index) => setCurrentSlide(index)

  const containerRef = useRef(null)

  // 200vh height to give enough space for scroll animation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  })

  // Smooth scroll translation
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 20,
    restDelta: 0.001
  })

  const baseEntranceY = 300; // controls how much cards come from bottom

  // Horizontal positions (440px step = 550px - 20% overlap, centered relative to -275)
  const finalX0 = -825; const finalX1 = -275; const finalX2 = 275;

  // Vertical stagger (75% step = 285px distance for 25% overlap)
  const overlap = 200;

  const shiftY1 = -260;
  const shiftY0 = shiftY1 - overlap; // ensures fixed overlap
  const shiftY2 = shiftY1 + overlap;

  // Shared animation progress for the entire cluster
  const clusterOpacity = useTransform(smoothProgress, [0, 0.15], [0, 1])

  // Card 0: Moves from 0 up to shiftY0
  const x0Desktop = useTransform(smoothProgress, [0, 1], [finalX0, finalX0])
  const y0Desktop = useTransform(
  smoothProgress,
  [0, 0.15, 0.3, 1.0],
  [baseEntranceY, 0, 0, shiftY0]
)

  // Card 1: Moves from 0 up to shiftY1
  const x1Desktop = useTransform(smoothProgress, [0, 1], [finalX1, finalX1])
  const y1Desktop = useTransform(
  smoothProgress,
  [0, 0.15, 0.3, 1.0],
  [baseEntranceY, 0, 0, shiftY1]
)


  // Card 2: Stays at 0
  const x2Desktop = useTransform(smoothProgress, [0, 1], [finalX2, finalX2])
  const y2Desktop = useTransform(
  smoothProgress,
  [0, 0.15, 0.5, 1.0],
  [baseEntranceY, 0, 0, shiftY2]
)

  // Header transform: Starts moving up as the cards begin their staggered rise
  const headerY = useTransform(smoothProgress, [0.3, 0.8], [0, -150])

  // Wrapper vertical shift starts as the internal move finishes to scroll the whole group away
 const wrapperY = useTransform(smoothProgress, [0.8, 1.0], [0, -500])

  return (
    <>
      <style>{styles}</style>

      {/* Primary Animated Desktop Scroll Section */}
      <div className="desktop-impact-only" style={{ background: "#ffffff", paddingBottom: "20px" }}>

        <section ref={containerRef} style={{ height: "110vh", position: "relative" }}>

          <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", paddingTop: "8vh" }}>

            <motion.div style={{ y: wrapperY, scale: scale, width: "100%", maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 10 }}>

              <motion.div className="impact-header" style={{ y: headerY, padding: "0 40px" }}>
                <h2 className="impact-title">High impact content that converts</h2>
                <p className="impact-subtitle">
                  Did you know that video content can increase purchase intent by a staggering 82%? And that 73% of consumers are more likely to purchase after watching a product video. Ready to elevate your marketing game with AI video presenters?
                </p>
              </motion.div>

              {/* Increased height to accommodate the 800px vertical span + card height */}
              <div style={{ position: "relative", width: "100%", height: "600px", marginTop: "200px" }}>
                {cards.map((card, index) => {
                  let x, y, opacity;
                  if (index === 0) { x = x0Desktop; y = y0Desktop; opacity = clusterOpacity; }
                  if (index === 1) { x = x1Desktop; y = y1Desktop; opacity = clusterOpacity; }
                  if (index === 2) { x = x2Desktop; y = y2Desktop; opacity = clusterOpacity; }

                  return (
                    <motion.div
                      key={index}
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: 0,
                        width: "550px",
                        x,
                        y,
                        opacity,
                        zIndex: 10 - index
                      }}
                    >
                      <div className="impact-card-standard">
                        <div className="card-number">{card.number}</div>
                        <h3 className="impact-card-title">{card.title}</h3>
                        <p className="impact-card-description">{card.description}</p>


                      </div>
                    </motion.div>
                  )
                })}
              </div>

            </motion.div>
          </div>

        </section>
      </div>

      {/* Fallback Slider Mobile Section (<1024px Screen Rules Active) */}
      <div className="mobile-impact-only">
        <section className="mobile-impact-section">

          <div className="impact-header" style={{ padding: "0 24px", marginBottom: "60px" }}>
            <h2 className="impact-title" style={{ fontSize: "38px" }}>High impact content that converts</h2>
            <p className="impact-subtitle" style={{ fontSize: "18px" }}>
              Did you know that video content can increase purchase intent by a staggering 82%? And that 73% of consumers are more likely to purchase after watching a product video.
            </p>
          </div>

          <div className="mobile-impact-cards-wrapper">
            <div
              className="mobile-impact-cards-slider"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {cards.map((card, index) => (
                <div key={index} className="mobile-impact-card-slide">
                  <div className="impact-card-standard" style={{ margin: "0 12px", height: "auto", minHeight: "360px" }}>

                    <div className="card-number">{card.number}</div>
                    <h3 className="impact-card-title" style={{ fontSize: "28px" }}>{card.title}</h3>
                    <p className="impact-card-description">{card.description}</p>


                  </div>
                </div>
              ))}
            </div>

            <div className="slider-controls">
              <button className="slider-button" onClick={prevSlide}><MdChevronLeft /></button>
              <div className="slider-dots">
                {cards.map((_, index) => (
                  <button key={index} className={`slider-dot ${index === currentSlide ? 'active' : ''}`} onClick={() => goToSlide(index)} />
                ))}
              </div>
              <button className="slider-button" onClick={nextSlide}><MdChevronRight /></button>
            </div>
          </div>

        </section>
      </div>
    </>
  )
}

export default ImpactSection
