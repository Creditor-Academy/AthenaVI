import { useEffect, useState } from 'react'
import { Sparkles, Image as ImageIcon, Check, ArrowRight, LayoutTemplate, Palette, FileText, ImagePlus, Wand2 } from 'lucide-react'

const MOCK_SLIDES = [
  { title: "The Spark of Innovation", desc: "Understanding the foundational shifts in modern AI architectures and their impact.", img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop" },
  { title: "Market Growth & Trends", desc: "A detailed analysis of exponential market adoption curves globally.", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop" },
  { title: "Strategic Implementation", desc: "Actionable steps to deploy AI agents seamlessly across enterprise workflows.", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop" },
  { title: "Financial Projections", desc: "Forecasting revenue streams and cost optimization using advanced predictive models.", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop" },
  { title: "Future Horizons", desc: "Exploring the next frontier of artificial general intelligence and ethical boundaries.", img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop" }
]

function RealtimeSlideCard({ slide, status }) {
  const [typedTitle, setTypedTitle] = useState('')
  const [typedDesc, setTypedDesc] = useState('')
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    if (status === 'prev') {
      setTypedTitle(slide.title)
      setTypedDesc(slide.desc)
      setImageLoaded(true)
    } else if (status === 'next' || status === 'hidden') {
      setTypedTitle('')
      setTypedDesc('')
      setImageLoaded(false)
    } else if (status === 'active') {
      // Run typing animation - SLOWED DOWN
      setTypedTitle('')
      setTypedDesc('')
      setImageLoaded(false)
      
      let i = 0, j = 0
      let titleTimer, descTimer, imgTimer
      
      const typeTitle = () => {
        titleTimer = setInterval(() => {
          setTypedTitle(slide.title.substring(0, i + 1))
          i++
          if (i >= slide.title.length) clearInterval(titleTimer)
        }, 50) // Slowed down title typing
      }

      const typeDesc = () => {
        descTimer = setInterval(() => {
          setTypedDesc(slide.desc.substring(0, j + 1))
          j++
          if (j >= slide.desc.length) clearInterval(descTimer)
        }, 30) // Slowed down desc typing
      }

      // Start title immediately
      typeTitle()
      // Start desc after 1.5s
      setTimeout(typeDesc, 1500)
      // Show image after 4s (gives time to read)
      imgTimer = setTimeout(() => setImageLoaded(true), 4000)

      return () => {
        clearInterval(titleTimer)
        clearInterval(descTimer)
        clearTimeout(imgTimer)
      }
    }
  }, [status, slide])

  return (
    <div className={`aig-realtime-slide-card pos-${status}`}>
      <div className="aig-realtime-content">
        <h1 className="aig-realtime-title">
          {typedTitle}
          {status === 'active' && <span className="aig-type-cursor"></span>}
        </h1>
        <p className="aig-realtime-desc">
          {typedDesc}
        </p>
      </div>
      
      <div className="aig-realtime-media">
        {!imageLoaded && (
          <div className="aig-skeleton-loader">
            <ImageIcon size={32} color="#94a3b8" className="aig-pulse-icon" />
            <span>{status === 'next' ? 'Waiting...' : 'Generating visual...'}</span>
          </div>
        )}
        {imageLoaded && (
          <img src={slide.img} alt="Generated" className="aig-realtime-img fade-in" />
        )}
      </div>
    </div>
  )
}

export default function AIPptGenerating({ onComplete }) {
  const [phase, setPhase] = useState('setup')
  const [setupProgress, setSetupProgress] = useState(0)
  const [setupStepIndex, setSetupStepIndex] = useState(0)
  
  const [slideIndex, setSlideIndex] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  const SETUP_STEPS = [
    { text: 'Drafting presentation layout...', icon: LayoutTemplate },
    { text: 'Applying base theme and colors...', icon: Palette },
    { text: 'Generating slide intelligence...', icon: FileText },
    { text: 'Sourcing perfect visual media...', icon: ImagePlus },
    { text: 'Polishing final presentation...', icon: Wand2 }
  ]

  // 1. Setup Phase Logic
  useEffect(() => {
    if (phase !== 'setup') return
    
    let currentStep = 0;
    const interval = setInterval(() => {
      setSetupProgress(p => {
        const next = p + 4 // slower progress to show off the list
        if (next >= 100) {
          clearInterval(interval)
          setTimeout(() => setPhase('slides'), 600)
          return 100
        }
        
        // Every 20%, move to next step
        if (next % 20 === 0 && currentStep < SETUP_STEPS.length - 1) {
          currentStep++
          setSetupStepIndex(currentStep)
        }
        
        return next
      })
    }, 60)

    return () => clearInterval(interval)
  }, [phase])

  // 2. Slide Generation Phase Logic
  useEffect(() => {
    if (phase !== 'slides') return

    // Stop at the last slide and wait for it to finish animating
    if (slideIndex >= MOCK_SLIDES.length - 1) {
      const timer = setTimeout(() => {
        setIsFinished(true)
      }, 7500)
      return () => clearTimeout(timer)
    }

    // SLOWED DOWN: 7.5 seconds per slide to give user time to read and see images
    const timer = setTimeout(() => {
      setSlideIndex(prev => prev + 1)
    }, 7500)

    return () => clearTimeout(timer)
  }, [phase, slideIndex])

  return (
    <main className="aig-main-fullscreen aig-main-center">
      
      {phase === 'setup' && (
        <div className="aig-generating-screen fade-in">
          <div className="aig-liquid-loader-wrapper">
            <div className="aig-liquid-loader">
              <div className="aig-liquid-fill" style={{ top: `${100 - setupProgress}%` }}></div>
              <div className="aig-liquid-percent">{setupProgress}%</div>
            </div>
          </div>
          <h2 className="aig-generating-title" style={{ marginTop: '32px' }}>Building your presentation</h2>
          <p className="aig-generating-text fade-in" key={setupStepIndex} style={{ marginTop: '12px' }}>
            {SETUP_STEPS[setupStepIndex].text}
          </p>
        </div>
      )}

      {phase === 'slides' && (
        <div className="aig-realtime-gen-container fade-in">
          <div className="aig-realtime-header fade-in">
            <Sparkles size={24} className="aig-pulse-icon" color="#3b82f6" />
            <h3>{isFinished ? 'Presentation Complete!' : `AI is writing Slide ${Math.min(slideIndex + 1, MOCK_SLIDES.length)}...`}</h3>
          </div>

          <div className="aig-realtime-carousel-wrapper">
            {MOCK_SLIDES.map((slide, i) => {
              let status = 'hidden'
              if (i === slideIndex) status = 'active'
              else if (i === slideIndex - 1) status = 'prev'
              else if (i === slideIndex + 1) status = 'next'

              return <RealtimeSlideCard key={i} slide={slide} status={status} />
            })}
          </div>

          <div className="aig-mini-slides-tray fade-in">
            {MOCK_SLIDES.map((slide, i) => (
              <div 
                key={i} 
                className={`aig-mini-slide ${i === slideIndex ? 'active' : i < slideIndex || isFinished ? 'completed' : 'pending'}`}
              >
                <span className="aig-mini-slide-num">{i + 1}</span>
                {(i < slideIndex || isFinished) && <Check size={12} className="aig-mini-check"/>}
              </div>
            ))}
          </div>
          
          {isFinished && (
            <div className="aig-redirect-action fade-in">
              <button className="aig-btn-magic" onClick={onComplete}>
                Go to Editor <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}

    </main>
  )
}
