import React from "react";

import CourseCreatorImg     from "../../assets/Course Creator.jpg";
import UniversityImg        from "../../assets/University.jpg";
import CorporateTrainingImg from "../../assets/Cooporate training teams.jpg";
import MarketingTeamsImg    from "../../assets/Marketing Teams.jpg";
import EdTechPlatformImg    from "../../assets/EdTech platform.jpg";
import ContentCreatorImg    from "../../assets/Content Creator.jpg";

const ROW1 = [
  { title: "Course Creators",    tag: "Education",  desc: "Build engaging video lessons in minutes.",          img: CourseCreatorImg        },
  { title: "Universities",       tag: "Academia",   desc: "Scale lectures and campus content globally.",       img: UniversityImg           },
  { title: "Corporate Training", tag: "Enterprise", desc: "Onboard teams with professional training videos.",  img: CorporateTrainingImg    },
];

const ROW2 = [
  { title: "Marketing Teams",    tag: "Marketing",  desc: "Launch campaigns with AI-generated video ads.",     img: MarketingTeamsImg       },
  { title: "EdTech Platforms",   tag: "EdTech",     desc: "Power your platform with scalable video content.",  img: EdTechPlatformImg       },
  { title: "Content Creators",   tag: "Creators",   desc: "Go from idea to polished video, instantly.",        img: ContentCreatorImg       },
];

// duplicate for seamless loop
const LOOP1 = [...ROW1, ...ROW1, ...ROW1];
const LOOP2 = [...ROW2, ...ROW2, ...ROW2];

const css = `
  @keyframes uc-left {
    from { transform: translateX(0); }
    to   { transform: translateX(calc(-100% / 3)); }
  }
  @keyframes uc-right {
    from { transform: translateX(calc(-100% / 3)); }
    to   { transform: translateX(0); }
  }
  .uc-row-left {
    display: flex;
    gap: 20px;
    width: max-content;
    animation: uc-left 26s linear infinite;
  }
  .uc-row-right {
    display: flex;
    gap: 20px;
    width: max-content;
    animation: uc-right 26s linear infinite;
  }
  .uc-row-left:hover,
  .uc-row-right:hover {
    animation-play-state: paused;
  }
`;

function Card({ item }) {
  return (
    <div style={{
      flexShrink: 0,
      width: "300px",
      height: "200px",
      borderRadius: "18px",
      overflow: "hidden",
      position: "relative",
      boxShadow: "0 4px 20px rgba(15,23,42,0.08), 0 1px 4px rgba(15,23,42,0.05)",
      cursor: "default",
    }}>
      {/* image */}
      <img
        src={item.img}
        alt={item.title}
        draggable={false}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />

      {/* strong bottom gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
      }} />

      {/* tag top-left */}
      <div style={{
        position: "absolute", top: "14px", left: "14px",
        padding: "4px 10px",
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: "999px",
        fontSize: "10px",
        fontWeight: 700,
        color: "#fff",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}>
        {item.tag}
      </div>

      {/* title + desc bottom */}
      <div style={{
        position: "absolute", bottom: "14px", left: "16px", right: "16px",
      }}>
        <div style={{
          color: "#fff",
          fontSize: "16px",
          fontWeight: 700,
          letterSpacing: "-0.3px",
          lineHeight: 1.25,
          marginBottom: "4px",
        }}>
          {item.title}
        </div>
        <div style={{
          color: "rgba(255,255,255,0.65)",
          fontSize: "12px",
          fontWeight: 400,
          lineHeight: 1.45,
        }}>
          {item.desc}
        </div>
      </div>
    </div>
  );
}

export default function UseCases() {
  return (
    <section style={{
      padding: "88px 0 80px",
      background: "#ffffff",
      fontFamily: "'Inter', sans-serif",
      overflow: "hidden",
    }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "56px", padding: "0 24px" }}>
        <span style={{
          display: "inline-block",
          padding: "6px 18px",
          background: "#f1f5f9",
          borderRadius: "999px",
          fontSize: "11px",
          fontWeight: 700,
          color: "#334155",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: "20px",
        }}>Use Cases</span>

        <h2 style={{
          fontFamily: "'Georgia', serif",
          fontSize: "clamp(34px, 4.5vw, 54px)",
          fontWeight: 400,
          color: "#0f172a",
          lineHeight: 1.15,
          margin: "0 0 16px",
          letterSpacing: "-1.5px",
        }}>Who uses Athena VI</h2>

        <p style={{
          fontSize: "clamp(15px, 1.4vw, 17px)",
          color: "#64748b",
          lineHeight: 1.7,
          maxWidth: "520px",
          margin: "0 auto",
        }}>
          Professionals across education, training, and marketing use Athena VI to create{" "}
          <span style={{ color: "#0f172a", fontWeight: 600 }}>high-quality videos</span> instantly.
        </p>
      </div>

      {/* Row 1 — scrolls left */}
      <div style={{ position: "relative", overflow: "hidden", marginBottom: "20px" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: "120px",
          background: "linear-gradient(to right, #fff, transparent)",
          zIndex: 10, pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: "120px",
          background: "linear-gradient(to left, #fff, transparent)",
          zIndex: 10, pointerEvents: "none",
        }} />
        <div className="uc-row-left" style={{ paddingLeft: "20px" }}>
          {LOOP1.map((item, i) => <Card key={i} item={item} />)}
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: "120px",
          background: "linear-gradient(to right, #fff, transparent)",
          zIndex: 10, pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: "120px",
          background: "linear-gradient(to left, #fff, transparent)",
          zIndex: 10, pointerEvents: "none",
        }} />
        <div className="uc-row-right" style={{ paddingLeft: "20px" }}>
          {LOOP2.map((item, i) => <Card key={i} item={item} />)}
        </div>
      </div>

    </section>
  );
}
