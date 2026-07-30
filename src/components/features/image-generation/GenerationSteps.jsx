import { Check, Loader2 } from 'lucide-react'

const STEPS = [
  'Understanding Prompt',
  'Optimizing Prompt',
  'Creating Composition',
  'Rendering Image',
]

/**
 * @param {number} currentStep - 0-indexed step that is currently active
 * @param {boolean} done - all steps complete
 */
function GenerationSteps({ currentStep = 0, done = false }) {
  return (
    <div className="gen-steps" role="status" aria-live="polite" aria-label="Generation progress">
      {STEPS.map((step, i) => {
        const isComplete = done || i < currentStep
        const isActive = !done && i === currentStep
        return (
          <div key={step} className={`gen-step ${isComplete ? 'gen-step--done' : ''} ${isActive ? 'gen-step--active' : ''}`}>
            <div className="gen-step-icon">
              {isComplete ? (
                <Check size={13} strokeWidth={2.5} />
              ) : isActive ? (
                <Loader2 size={13} className="gen-step-spinner" />
              ) : (
                <span className="gen-step-dot" />
              )}
            </div>
            <span className="gen-step-label">{step}</span>
          </div>
        )
      })}
    </div>
  )
}

export default GenerationSteps
