import { useEffect, useState } from 'react'
import { MdChevronRight } from 'react-icons/md'

function findScrollParent(el) {
  for (let node = el?.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node)
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) return node
  }
  return document.scrollingElement || document.documentElement
}

/** Sticky left rail: scroll-spy section nav + quick actions (ebook profile style). */
export default function ProfileSidePanel({ items, actions }) {
  const [active, setActive] = useState(items[0]?.id)

  useEffect(() => {
    const targets = items.map((item) => document.getElementById(item.target)).filter(Boolean)
    if (!targets.length || typeof IntersectionObserver === 'undefined') return undefined

    // The dashboard scrolls an inner container, not the window.
    const scroller = findScrollParent(targets[0])
    const lastId = items[items.length - 1].id
    // A short last section never reaches the spy band, so the bottom of the
    // scroll always selects it.
    const atBottom = () => scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4

    const observer = new IntersectionObserver(
      (entries) => {
        if (atBottom()) {
          setActive(lastId)
          return
        }
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        const match = visible && items.find((item) => item.target === visible.target.id)
        if (match) setActive(match.id)
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0.1, 0.35, 0.6] }
    )
    targets.forEach((el) => observer.observe(el))

    const scrollTarget = scroller === document.scrollingElement ? window : scroller
    const onScroll = () => {
      if (atBottom()) setActive(lastId)
    }
    scrollTarget.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      observer.disconnect()
      scrollTarget.removeEventListener('scroll', onScroll)
    }
  }, [items])

  const go = (item) => {
    setActive(item.id)
    document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <aside className="prf-side" aria-label="Profile">
      <nav className="prf-side-card prf-nav-card" aria-label="Profile sections">
        <p className="prf-side-label">Navigate</p>
        {items.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              type="button"
              className={isActive ? 'is-active' : undefined}
              aria-current={isActive ? 'true' : undefined}
              onClick={() => go(item)}
            >
              <span className="prf-side-ico" aria-hidden>
                <Icon />
              </span>
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="prf-side-card prf-actions-card">
        <p className="prf-side-label">Quick actions</p>
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button key={action.id} type="button" onClick={action.onClick}>
              <span className="prf-side-ico" aria-hidden>
                <Icon />
              </span>
              {action.label}
              <MdChevronRight className="prf-side-chevron" aria-hidden />
            </button>
          )
        })}
      </div>
    </aside>
  )
}
