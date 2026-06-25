import { useState } from "react";

import CourseCreatorImg from "../../assets/Course Creator.jpg";
import UniversityImg from "../../assets/University.jpg";
import CorporateTrainingImg from "../../assets/Cooporate training teams.jpg";
import MarketingTeamsImg from "../../assets/Marketing Teams.jpg";

const CARDS = [
  {
    title: "Course Creators",
    tag: "Education",
    tagColor: "#1a3a2a",
    img: CourseCreatorImg,
    stat: "10K+",
    statLabel: "Courses created using Athena VI",
    bottomLabel: "Start creating",
  },
  {
    title: "Lifeskills for 2,587 Teams",
    tag: "Health",
    tagColor: "rgba(0,0,0,0.45)",
    img: UniversityImg,
    bottomLabel: "Let them be heard",
  },
  {
    title: "Join 5000+ People Using Athena VI",
    tag: null,
    img: null,
    bottomLabel: "Join community",
    isMid: true,
  },
  {
    title: "Sponsor training for your corporate teams",
    tag: "Education",
    tagColor: "rgba(0,0,0,0.45)",
    img: CorporateTrainingImg,
    bottomLabel: "Explore more",
  },
  {
    title: "Your home for video AI",
    tag: null,
    img: MarketingTeamsImg,
    bottomLabel: "Explore more",
    isGreen: true,
  },
];

const ArrowIcon = ({ color = "#fff" }) => (
  <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
    <path
      d="M5 13L13 5M13 5H7M13 5V11"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// [outer-left, inner-left, center, inner-right, outer-right]
// U-shape: outers are highest (smallest translateY), center is lowest
const HEIGHTS = [420, 460, 500, 460, 420];
const WIDTHS  = [200, 215, 240, 215, 200];
const Y_OFFSETS = [0, 30, 60, 30, 0];   // U-valley: outers up, center down

export default function UseCases() {
  const [hovered, setHovered] = useState(null);

  return (
    <section
      style={{
        padding: "90px 0 100px",
        background: "#f8faf5",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: "60px", padding: "0 24px" }}>
        <h2
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: "clamp(36px, 5vw, 62px)",
            fontWeight: 700,
            color: "#0f172a",
            lineHeight: 1.1,
            margin: "0 0 16px",
            letterSpacing: "-1.5px",
          }}
        >
          Who uses Athena VI
        </h2>

        <p
          style={{
            fontSize: "clamp(15px, 1.4vw, 17px)",
            color: "#64748b",
            lineHeight: 1.7,
            maxWidth: "480px",
            margin: "0 auto",
          }}
        >
          Professionals across education, training, and marketing use Athena VI to create
          high-quality videos — instantly.
        </p>
      </div>

      {/* ── Cards fan ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",   // align from top so U-shape reads naturally
          gap: "12px",
          padding: "0 40px 60px",     // extra bottom so shadow isn't clipped
        }}
      >
        {CARDS.map((card, i) => {
          const w = WIDTHS[i];
          const h = HEIGHTS[i];
          const yOff = Y_OFFSETS[i];
          const isHov = hovered === i;

          return (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: "relative",
                width: `${w}px`,
                height: `${h}px`,
                borderRadius: "28px",
                overflow: "hidden",
                flexShrink: 0,
                cursor: "pointer",
                transform: `translateY(${isHov ? yOff - 14 : yOff}px)`,
                transition: "transform 0.35s cubic-bezier(.16,1,.3,1), box-shadow 0.35s ease",
                boxShadow: isHov
                  ? "0 32px 72px rgba(15,23,42,0.24)"
                  : "0 10px 36px rgba(15,23,42,0.13)",
              }}
            >
              {/* ── Centre mint card (no image) ── */}
              {card.isMid ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "#d1fae5",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "28px 20px",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: 800,
                      color: "#0f172a",
                      lineHeight: 1.2,
                      textAlign: "center",
                      marginBottom: "auto",
                      letterSpacing: "-0.6px",
                    }}
                  >
                    {card.title}
                  </div>
                  <BottomCta label={card.bottomLabel} dark />
                </div>

              ) : card.isGreen ? (
                /* ── Right-outer lime card ── */
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "#b8f750",
                    display: "flex",
                    flexDirection: "column",
                    padding: "14px",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      borderRadius: "18px",
                      overflow: "hidden",
                      marginBottom: "14px",
                    }}
                  >
                    <img
                      src={card.img}
                      alt={card.title}
                      draggable={false}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter: "grayscale(100%)",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#0f172a",
                      lineHeight: 1.25,
                      marginBottom: "10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>🏠</span>
                    {card.title}
                  </div>
                  <BottomCta label={card.bottomLabel} dark />
                </div>

              ) : (
                /* ── Regular photo card ── */
                <>
                  <img
                    src={card.img}
                    alt={card.title}
                    draggable={false}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />

                  {/* Gradient overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)",
                    }}
                  />

                  {/* Tag badge */}
                  {card.tag && (
                    <div
                      style={{
                        position: "absolute",
                        top: "14px",
                        left: "14px",
                        padding: "5px 13px",
                        background: card.tagColor,
                        backdropFilter: "blur(8px)",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#fff",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {card.tag}
                    </div>
                  )}

                  {/* Card 0: big stat */}
                  {i === 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "52px",
                        left: "16px",
                        right: "16px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "48px",
                          fontWeight: 800,
                          color: "#fff",
                          lineHeight: 1,
                          letterSpacing: "-2px",
                        }}
                      >
                        {card.stat}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "rgba(255,255,255,0.75)",
                          marginTop: "8px",
                          lineHeight: 1.45,
                        }}
                      >
                        {card.statLabel}
                      </div>
                    </div>
                  )}

                  {/* Bottom content */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "0 14px 14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#fff",
                        lineHeight: 1.3,
                        marginBottom: "10px",
                        letterSpacing: "-0.3px",
                      }}
                    >
                      {card.title}
                    </div>
                    <BottomCta label={card.bottomLabel} />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function BottomCta({ label, dark = false }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        width: "100%",
      }}
    >
      <span
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: dark ? "#0f172a" : "rgba(255,255,255,0.88)",
        }}
      >
        {label}
      </span>
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: dark ? "#0f172a" : "#4ade80",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <ArrowIcon color={dark ? "#fff" : "#0f172a"} />
      </div>
    </div>
  );
}
