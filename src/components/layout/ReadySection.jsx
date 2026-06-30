import { MdArrowOutward } from 'react-icons/md'
import { FiPlay } from 'react-icons/fi'
import AvatarImg from '../../assets/AvtarHero.png'

const css = `
.rs-wrap {
  padding: 48px 40px 64px;
  background: #ffffff;
  font-family: 'Inter', sans-serif;
}

.rs-inner {
  max-width: 1100px;
  margin: 0 auto;
  background: #0f172a;
  border-radius: 24px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  overflow: hidden;
  min-height: 260px;
  position: relative;
}

/* dot-grid texture */
.rs-inner::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px);
  background-size: 26px 26px;
  pointer-events: none;
  z-index: 0;
}

/* blue glow behind text */
.rs-inner::after {
  content: '';
  position: absolute;
  left: -80px;
  top: -80px;
  width: 340px;
  height: 340px;
  background: radial-gradient(circle, rgba(30,64,175,0.35) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

/* ── Left copy ── */
.rs-left {
  padding: 44px 48px;
  position: relative;
  z-index: 1;
}

.rs-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 14px;
  background: rgba(59,130,246,0.12);
  border: 1px solid rgba(59,130,246,0.22);
  border-radius: 999px;
  color: #60a5fa;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 20px;
}
.rs-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #3b82f6;
  animation: rs-blink 2s ease-in-out infinite;
}
@keyframes rs-blink {
  0%,100%{ opacity:1; transform:scale(1); }
  50%    { opacity:.35; transform:scale(.6); }
}

.rs-title {
  font-family: 'Georgia','Times New Roman',serif;
  font-size: clamp(26px, 2.8vw, 38px);
  font-weight: 400;
  color: #f8fafc;
  line-height: 1.22;
  letter-spacing: -1px;
  margin: 0 0 14px;
}
.rs-title span {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.rs-sub {
  font-size: 14px;
  color: rgba(255,255,255,0.5);
  line-height: 1.65;
  margin: 0 0 28px;
  max-width: 420px;
}

.rs-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.rs-btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 26px;
  background: #1e40af;
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background .2s, transform .2s, box-shadow .2s;
  white-space: nowrap;
}
.rs-btn-primary:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(30,64,175,.4);
}

.rs-btn-ghost {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 12px 22px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: rgba(255,255,255,0.75);
  font-size: 14px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background .2s, border-color .2s;
  white-space: nowrap;
}
.rs-btn-ghost:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.2);
}

/* ── Right image ── */
.rs-right {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding-right: 0;
  min-width: 280px;
}

.rs-avatar {
  height: 290px;
  width: auto;
  object-fit: contain;
  object-position: bottom;
  display: block;
  filter: drop-shadow(-8px 0 32px rgba(59,130,246,0.18));
}

/* responsive */
@media (max-width: 780px) {
  .rs-inner { grid-template-columns: 1fr; }
  .rs-right { display: none; }
  .rs-left  { padding: 40px 28px; }
}
@media (max-width: 480px) {
  .rs-wrap { padding: 32px 16px 48px; }
  .rs-actions { flex-direction: column; }
  .rs-btn-primary, .rs-btn-ghost { width: 100%; justify-content: center; }
}
`

function ReadySection() {
  return (
    <>
      <style>{css}</style>
      <div className="rs-wrap">
        <div className="rs-inner">

          {/* Left */}
          <div className="rs-left">
            <div className="rs-badge">
              <span className="rs-dot" />
              Start for free
            </div>

            <h2 className="rs-title">
              Ready to create your<br />
              <span>first AI video?</span>
            </h2>

            <p className="rs-sub">
              Join educators, trainers, and creators already using Athena VI to build
              professional videos — no camera, no crew, no editing skills needed.
            </p>
          </div>

          {/* Right — single clean avatar image */}
          <div className="rs-right">
            <img src={AvatarImg} alt="Athena VI avatar" className="rs-avatar" />
          </div>

        </div>
      </div>
    </>
  )
}

export default ReadySection
