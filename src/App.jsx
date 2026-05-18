import { useState, useEffect, useRef } from "react";
import CueSvg1 from './CueLogo1.svg';
import CueSvg2 from'./CueLogo2.svg';
import { ReactComponent as GoogleSvg } from './icons8-google-50.svg';
import { ReactComponent as AppleSvg } from './apple-logo-svgrepo-com.svg';

import { auth, googleProvider } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_MEMORIES = [
  {
    id: 1, title: "For Emma on her 18th Birthday",
    recipient: "emma@family.com", preview: "By the time you read this, you'll have grown into someone extraordinary...",
    deliveryDate: "2031-06-14", status: "Scheduled", type: "letter", createdAt: "2024-01-10",
  },
  {
    id: 2, title: "A Letter to Future Me",
    recipient: "self", preview: "I wonder what you've achieved. I hope you took the leap...",
    deliveryDate: "2026-12-31", status: "Pending", type: "video", createdAt: "2024-03-22",
  },
  {
    id: 3, title: "Our 10-Year Anniversary",
    recipient: "sarah@love.com", preview: "Ten years of laughter, of mornings, of everything in between...",
    deliveryDate: "2025-09-03", status: "Delivered", type: "voice", createdAt: "2023-09-03",
  },
  {
    id: 4, title: "Grandpa's Stories for the Kids",
    recipient: "family@vault.com", preview: "When I was young, the world looked very different...",
    deliveryDate: "2027-07-20", status: "Scheduled", type: "letter", createdAt: "2024-05-01",
  },
];

const USE_CASES = [
  { emoji: "🎂", title: "Yearly Birthday Messages", desc: "Record birthday videos for your child, delivered every year until they're grown." },
  { emoji: "💌", title: "Anniversary Letters", desc: "Write love letters years ahead, arriving on the exact date that matters." },
  { emoji: "🔮", title: "Letters to Your Future Self", desc: "Capture who you are today. Meet yourself again in 5, 10, or 20 years." },
  { emoji: "🏛️", title: "Family Legacy Vaults", desc: "Preserve stories, traditions, and wisdom for generations not yet born." },
  { emoji: "🎓", title: "Graduation Surprises", desc: "Send a message now to someone who hasn't yet achieved their dream." },
  { emoji: "🌱", title: "Time-Locked Milestones", desc: "Seal a memory at this moment. Unlock it when the world has changed." },
];

const FEATURES = [
  {
    svg: CueSvg1,
    title: "Future Delivery Engine",
    desc: "Messages arrive at the exact moment you choose — a day, a year, or a decade from now. Precise. Reliable. Timeless.",
    color: "#6495ED",
  },
  {
    svg: CueSvg2,
    title: "Multi-Format Memories",
    desc: "Text letters, photos, videos, voice recordings. Layer them into a single capsule that carries the full weight of a moment.",
    color: "#A855F7",
  },
  {
    svg: CueSvg1,
    title: "Vault Architecture",
    desc: "Organize capsules into personal vaults. Family legacy. Love archive. Future self. Each one sealed, sacred, and secure.",
    color: "#EC4899",
  },
];

// ─── UTILITY ──────────────────────────────────────────────────────────────────
const cx = (...args) => args.filter(Boolean).join(" ");
const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --cue: #6495ED;
      --cue-deep: #4a7dd4;
      --cue-violet: #7C3AED;
      --navy: #0A0F1E;
      --navy-2: #0F172A;
      --navy-3: #1a2540;
      --surface: rgba(255,255,255,0.04);
      --surface-hover: rgba(255,255,255,0.07);
      --border: rgba(255,255,255,0.08);
      --border-bright: rgba(100,149,237,0.3);
      --text: #F0F4FF;
      --muted: #6B7FA3;
      --soft: #94A3B8;
      --serif: 'DM Serif Display', Georgia, serif;
      --sans: 'DM Sans', system-ui, sans-serif;
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: var(--sans);
      background: var(--navy);
      color: var(--text);
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--navy); }
    ::-webkit-scrollbar-thumb { background: var(--navy-3); border-radius: 4px; }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-12px) rotate(0.5deg); }
      66% { transform: translateY(-6px) rotate(-0.5deg); }
    }
    @keyframes floatSlow {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(100,149,237,0.2); }
      50% { box-shadow: 0 0 40px rgba(100,149,237,0.4), 0 0 80px rgba(124,58,237,0.2); }
    }
    @keyframes orbit {
      from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
      to { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
    }
    @keyframes scanline {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }
    @keyframes ticker {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-float-slow { animation: floatSlow 8s ease-in-out infinite; }
    .animate-fade-up { animation: fadeUp 0.7s ease forwards; }
    .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }

    .glass {
      background: var(--surface);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--border);
    }
    .glass-bright {
      background: rgba(100,149,237,0.06);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-bright);
    }

    .text-gradient {
      background: linear-gradient(135deg, #F0F4FF 0%, #6495ED 50%, #A78BFA 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .text-cue { color: var(--cue); }

    .btn-primary {
      background: linear-gradient(135deg, var(--cue) 0%, var(--cue-violet) 100%);
      color: white;
      border: none;
      padding: 14px 32px;
      border-radius: 100px;
      font-family: var(--sans);
      font-weight: 500;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .btn-primary::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 100%);
      opacity: 0;
      transition: opacity 0.3s;
    }
    .btn-primary:hover::before { opacity: 1; }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 12px 40px rgba(100,149,237,0.35); }
    .btn-primary:active { transform: translateY(0); }

    .btn-ghost {
      background: transparent;
      color: var(--soft);
      border: 1px solid var(--border);
      padding: 14px 32px;
      border-radius: 100px;
      font-family: var(--sans);
      font-weight: 500;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .btn-ghost:hover {
      border-color: var(--cue);
      color: var(--cue);
      background: rgba(100,149,237,0.08);
    }

    .input-field {
      width: 100%;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px 18px;
      color: var(--text);
      font-family: var(--sans);
      font-size: 15px;
      outline: none;
      transition: all 0.3s ease;
    }
    .input-field::placeholder { color: var(--muted); }
    .input-field:focus {
      border-color: var(--cue);
      background: rgba(100,149,237,0.06);
      box-shadow: 0 0 0 3px rgba(100,149,237,0.12);
    }

    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      transition: all 0.3s ease;
    }
    .card:hover {
      border-color: rgba(100,149,237,0.2);
      background: var(--surface-hover);
      transform: translateY(-2px);
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.02em;
    }
    .status-pending { background: rgba(251,191,36,0.12); color: #FBBf24; border: 1px solid rgba(251,191,36,0.2); }
    .status-scheduled { background: rgba(100,149,237,0.12); color: var(--cue); border: 1px solid rgba(100,149,237,0.2); }
    .status-delivered { background: rgba(34,197,94,0.12); color: #22C55E; border: 1px solid rgba(34,197,94,0.2); }

    .noise-overlay {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
      opacity: 0.4;
    }

    .mesh-bg {
      position: absolute;
      pointer-events: none;
      border-radius: 50%;
      filter: blur(80px);
    }

    textarea { resize: none; }

    select option { background: var(--navy-2); }
  `}</style>
);

// ─── MESH BACKGROUND ─────────────────────────────────────────────────────────
const MeshBg = ({ variant = "hero" }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
    {variant === "hero" && <>
      <div className="mesh-bg" style={{ width: 600, height: 600, background: "radial-gradient(circle, rgba(100,149,237,0.15) 0%, transparent 70%)", top: -100, left: "30%", animation: "floatSlow 10s ease-in-out infinite" }} />
      <div className="mesh-bg" style={{ width: 400, height: 400, background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)", bottom: -100, right: "10%", animation: "floatSlow 12s ease-in-out infinite reverse" }} />
      <div className="mesh-bg" style={{ width: 300, height: 300, background: "radial-gradient(circle, rgba(100,149,237,0.08) 0%, transparent 70%)", top: "40%", left: "5%", animation: "floatSlow 9s ease-in-out infinite" }} />
    </>}
    {variant === "section" && <>
      <div className="mesh-bg" style={{ width: 500, height: 500, background: "radial-gradient(circle, rgba(100,149,237,0.08) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
    </>}
  </div>
);

// ─── FLOATING CARDS ───────────────────────────────────────────────────────────
const FloatingCard = ({ style, delay = 0, children }) => (
  <div style={{
    ...style,
    position: "absolute",
    animation: `float 6s ease-in-out ${delay}s infinite`,
    zIndex: 1,
  }}>
    {children}
  </div>
);

const MemoryCard = ({ title, date, type, style, delay }) => {
  const icons = { letter: "✉", video: "▶", voice: "♪", photo: "◎" };
  return (
    <FloatingCard style={style} delay={delay}>
      <div className="glass" style={{ padding: "16px 20px", borderRadius: 16, minWidth: 220, backdropFilter: "blur(24px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6495ED, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
            {icons[type] || "◎"}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{title}</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Delivers {date}</div>
          </div>
        </div>
        <div style={{ height: 4, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: "60%", background: "linear-gradient(90deg, var(--cue), var(--cue-violet))", borderRadius: 4 }} />
        </div>
      </div>
    </FloatingCard>
  );
};

// ─── NAV ──────────────────────────────────────────────────────────────────────
const Nav = ({ page, setPage, isLoggedIn, setIsLoggedIn }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "16px 40px",
      transition: "all 0.4s ease",
      background: scrolled ? "rgba(10,15,30,0.85)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid var(--border)" : "none",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <button onClick={() => setPage("landing")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
  <img src={CueSvg1} alt="Cue" style={{ width: 40, height: 40, objectFit: "contain" }} />
  <span style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--text)", letterSpacing: "-0.01em" }}>Cue</span>
</button>

        {page === "landing" && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="btn-ghost" style={{ padding: "10px 24px", fontSize: 14 }} onClick={() => setPage("login")}>Sign In</button>
            <button className="btn-primary" style={{ padding: "10px 24px", fontSize: 14 }} onClick={() => setPage("signup")}>Get Started</button>
          </div>
        )}

        {isLoggedIn && page !== "landing" && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="btn-ghost" style={{ padding: "10px 24px", fontSize: 14 }} onClick={() => { setIsLoggedIn(false); setPage("landing"); }}>Sign Out</button>
          </div>
        )}
      </div>
    </nav>
  );
};

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
const LandingPage = ({ setPage }) => {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const handleWaitlist = () => {
    if (email.includes("@")) { setJoined(true); }
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* HERO */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <MeshBg variant="hero" />

        {/* Floating memory cards */}
        <MemoryCard title="Emma's 18th Birthday" date="Jun 2031" type="video" style={{ top: "20%", right: "5%", opacity: 0.9 }} delay={0} />
        <MemoryCard title="Letter to Future Me" date="Dec 2026" type="letter" style={{ top: "55%", right: "12%", opacity: 0.7 }} delay={1.5} />
        <MemoryCard title="Our Anniversary" date="Sep 2025" type="voice" style={{ top: "35%", left: "2%", opacity: 0.6 }} delay={3} />

        {/* Grid lines */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(100,149,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(100,149,237,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", paddingTop: 120, position: "relative", zIndex: 2 }}>
          <div style={{ maxWidth: 760 }}>
            {/* Pill badge */}
            <div className="glass" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 100, marginBottom: 40, animation: "fadeUp 0.5s ease forwards" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", display: "block", boxShadow: "0 0 6px #22C55E" }} />
              <span style={{ fontSize: 13, color: "var(--soft)" }}>Now in Early Access</span>
            </div>

            <h1 style={{
              fontFamily: "var(--serif)", fontSize: "clamp(52px, 8vw, 96px)", lineHeight: 1.05,
              letterSpacing: "-0.02em", marginBottom: 32,
              animation: "fadeUp 0.6s 0.1s ease forwards", opacity: 0,
            }}>
              <span className="text-gradient">Messages that</span>
              <br />
              <em style={{ fontStyle: "italic" }}>outlive</em>
              <span style={{ color: "var(--text)" }}> the present.</span>
            </h1>

            <p style={{
              fontSize: "clamp(17px, 2vw, 21px)", color: "var(--soft)", lineHeight: 1.7,
              maxWidth: 560, marginBottom: 48,
              animation: "fadeUp 0.6s 0.2s ease forwards", opacity: 0,
            }}>
              Send memories, videos, letters, and moments into the future — delivered exactly when they matter most.
            </p>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", animation: "fadeUp 0.6s 0.3s ease forwards", opacity: 0 }}>
              <button className="btn-primary" style={{ fontSize: 16, padding: "16px 40px" }} onClick={() => setPage("signup")}>
                Begin Your Story
              </button>
              <button className="btn-ghost" style={{ fontSize: 16, padding: "16px 40px", display: "flex", alignItems: "center", gap: 10 }} onClick={() => setPage("login")}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid var(--cue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>▶</span>
                Watch Demo
              </button>
            </div>

            {/* Social proof */}
            <div style={{ marginTop: 60, display: "flex", alignItems: "center", gap: 20, animation: "fadeUp 0.6s 0.4s ease forwards", opacity: 0 }}>
              <div style={{ display: "flex" }}>
                {["#6495ED", "#7C3AED", "#EC4899", "#F59E0B"].map((c, i) => (
                  <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${c}, ${c}aa)`, border: "2px solid var(--navy)", marginLeft: i > 0 ? -8 : 0 }} />
                ))}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>2,400+ memories sealed</div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>Join people writing to the future</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, animation: "float 2s ease-in-out infinite" }}>
          <span style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Scroll</span>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, var(--muted), transparent)" }} />
        </div>
      </section>

      {/* TICKER */}
      <div style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", overflow: "hidden", padding: "14px 0", background: "rgba(100,149,237,0.04)" }}>
        <div style={{ display: "flex", animation: "ticker 20s linear infinite", width: "max-content" }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 60, paddingRight: 60, whiteSpace: "nowrap" }}>
              {["Future Delivery", "Voice Notes", "Video Memories", "Photo Capsules", "Legacy Vaults", "Anniversary Letters", "Birthday Messages", "Encrypted & Secure"].map((t, j) => (
                <span key={j} style={{ fontSize: 13, color: "var(--muted)", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ color: "var(--cue)", fontSize: 10 }}>◆</span> {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section style={{ padding: "140px 40px", position: "relative", overflow: "hidden" }}>
        <MeshBg variant="section" />
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <div style={{ display: "inline-block", padding: "6px 16px", background: "rgba(100,149,237,0.1)", border: "1px solid rgba(100,149,237,0.2)", borderRadius: 100, fontSize: 12, color: "var(--cue)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>How It Works</div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(36px, 5vw, 56px)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              Three steps.<br /><em>Infinite time.</em>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 2 }}>
            {[
              { n: "01", title: "Create", desc: "Write a letter. Record your voice. Upload a photo or video. Capture the moment exactly as it feels.", icon: "✦" },
              { n: "02", title: "Schedule", desc: "Choose who receives it and when — a birthday, an anniversary, or a milestone years away.", icon: "◷" },
              { n: "03", title: "Deliver", desc: "Cue holds your memory safely until the exact moment arrives. Then delivers it with an experience they'll never forget.", icon: "◎" },
            ].map((step, i) => (
              <div key={i} style={{ position: "relative", padding: "48px 40px" }}>
                {i < 2 && <div style={{ position: "absolute", top: "50%", right: -1, width: 40, height: 1, background: "linear-gradient(to right, var(--border), transparent)", display: "none" }} />}
                <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>{step.n}</div>
                <div style={{ fontSize: 40, marginBottom: 20, color: "var(--cue)" }}>{step.icon}</div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: 32, marginBottom: 16, letterSpacing: "-0.01em" }}>{step.title}</h3>
                <p style={{ fontSize: 16, color: "var(--soft)", lineHeight: 1.7 }}>{step.desc}</p>
                <div className="glass-bright" style={{ marginTop: 32, padding: "20px", borderRadius: 14 }}>
                  <div style={{ height: 6, background: "var(--border)", borderRadius: 4, marginBottom: 10, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${[40, 70, 100][i]}%`, background: "linear-gradient(90deg, var(--cue), var(--cue-violet))", borderRadius: 4, transition: "width 1s ease" }} />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{["Draft in progress...", "Delivery: Dec 2029", "✓ Memory delivered"][i]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "100px 40px", background: "rgba(100,149,237,0.02)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
          {FEATURES.map((f, i) => (
  <div key={i} className="card" style={{ padding: "44px 40px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
    <div style={{
      width: 120, height: 120, borderRadius: 24,
      background: `${f.color}18`,
      border: `1px solid ${f.color}44`,
      display: "flex", alignItems: "center", justifyContent: "center",
      marginBottom: 28, overflow: "hidden",
    }}>
      <img src={f.svg} alt={f.title} style={{ width: 80, height: 80, objectFit: "contain",
        filter: i === 0
          ? "invert(1)"
          : i === 1
          ? "invert(0.6) sepia(1) saturate(3) hue-rotate(240deg)"
          : "invert(0.5) sepia(1) saturate(5) hue-rotate(290deg)"
      }} />
    </div>
    <h3 style={{ fontFamily: "var(--serif)", fontSize: 24, marginBottom: 14, letterSpacing: "-0.01em" }}>{f.title}</h3>
    <p style={{ fontSize: 15, color: "var(--soft)", lineHeight: 1.7 }}>{f.desc}</p>
  </div>
))}
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section style={{ padding: "140px 40px", position: "relative", overflow: "hidden" }}>
        <MeshBg variant="section" />
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <div style={{ display: "inline-block", padding: "6px 16px", background: "rgba(100,149,237,0.1)", border: "1px solid rgba(100,149,237,0.2)", borderRadius: 100, fontSize: 12, color: "var(--cue)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>Real Stories</div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(36px, 5vw, 56px)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              Every memory deserves<br /><em>its perfect moment.</em>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {USE_CASES.map((uc, i) => (
              <div key={i} className="card" style={{ padding: "32px 28px" }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{uc.emoji}</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 10, letterSpacing: "-0.01em" }}>{uc.title}</h3>
                <p style={{ fontSize: 14, color: "var(--soft)", lineHeight: 1.7 }}>{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section style={{ padding: "100px 40px", background: "rgba(100,149,237,0.02)", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            <div>
              <div style={{ display: "inline-block", padding: "6px 16px", background: "rgba(100,149,237,0.1)", border: "1px solid rgba(100,149,237,0.2)", borderRadius: 100, fontSize: 12, color: "var(--cue)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>The Platform</div>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(32px, 4vw, 48px)", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 24 }}>
                Your memories,<br /><em>beautifully organized.</em>
              </h2>
              <p style={{ fontSize: 16, color: "var(--soft)", lineHeight: 1.7, marginBottom: 36 }}>
                The Cue dashboard gives you a clear view of every capsule — scheduled, pending, and delivered. Create new memories in seconds. Organize them into vaults by person, occasion, or era.
              </p>
              <button className="btn-primary" onClick={() => setPage("signup")}>Explore the Dashboard</button>
            </div>
            {/* Mock Dashboard Preview */}
            <div style={{ position: "relative" }}>
              <div className="glass animate-pulse-glow" style={{ borderRadius: 24, overflow: "hidden", padding: 20 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {["#FF5F57", "#FEBC2E", "#28C840"].map((c, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 12 }}>
                  {/* Sidebar */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {["◎ Home", "✉ Messages", "🔒 Vault", "◷ Upcoming"].map((item, i) => (
                      <div key={i} className={i === 0 ? "glass-bright" : ""} style={{ padding: "8px 10px", borderRadius: 8, fontSize: 11, color: i === 0 ? "var(--cue)" : "var(--muted)" }}>{item}</div>
                    ))}
                  </div>
                  {/* Content */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Upcoming Deliveries</div>
                    {MOCK_MEMORIES.slice(0, 3).map((m, i) => (
                      <div key={i} className="glass" style={{ padding: "10px 12px", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 500 }}>{m.title.slice(0, 22)}...</div>
                          <div style={{ fontSize: 10, color: "var(--muted)" }}>{m.deliveryDate}</div>
                        </div>
                        <span className={`status-badge status-${m.status.toLowerCase()}`} style={{ fontSize: 9, padding: "3px 8px" }}>{m.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WAITLIST */}
      <section style={{ padding: "140px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <MeshBg variant="hero" />
        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 1.08, letterSpacing: "-0.02em", marginBottom: 24 }}>
            The future<br />is waiting <em>for you.</em>
          </h2>
          <p style={{ fontSize: 17, color: "var(--soft)", lineHeight: 1.7, marginBottom: 48 }}>
            Join thousands already writing to the future. Get early access to Cue and seal your first memory today.
          </p>
          {!joined ? (
            <div style={{ display: "flex", gap: 12, maxWidth: 480, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
              <input className="input-field" style={{ flex: 1, minWidth: 220 }} type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              <button className="btn-primary" onClick={handleWaitlist}>Join Early Access</button>
            </div>
          ) : (
            <div className="glass-bright" style={{ padding: "24px 40px", borderRadius: 16, display: "inline-flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 24 }}>◎</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>You're on the list.</div>
                <div style={{ fontSize: 14, color: "var(--soft)" }}>We'll reach out with your early access shortly.</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "48px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={CueSvg1} alt="Cue" style={{ width: 32, height: 32, objectFit: "contain" }} />
            <span style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--text)" }}>Cue</span>
            <span style={{ fontSize: 13, color: "var(--muted)", marginLeft: 8 }}>— Memories that outlive the present.</span>
          </div>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {["About", "Privacy", "Terms", "Contact"].map(l => (
              <span key={l} style={{ fontSize: 14, color: "var(--muted)", cursor: "pointer", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "var(--text)"}
                onMouseLeave={e => e.target.style.color = "var(--muted)"}>{l}</span>
            ))}
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>© 2025 Cue. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

// ─── AUTH PAGES ───────────────────────────────────────────────────────────────
const AuthPage = ({ type, setPage, setIsLoggedIn }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setError("");
    if (!form.email || !form.password) { setError("Please fill all fields."); return; }
    if (type === "signup" && !form.name) { setError("Please enter your name."); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setIsLoggedIn(true); setPage("dashboard"); }, 1400);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <MeshBg variant="hero" />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(100,149,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(100,149,237,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div style={{ width: "100%", maxWidth: 460, padding: "0 24px", position: "relative", zIndex: 2 }}>
        <div className="glass" style={{ borderRadius: 28, padding: "52px 48px" }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
          <img src={CueSvg1} alt="Cue" style={{ width: 64, height: 64, objectFit: "contain", margin: "0 auto 16px" }} />
            <h1 style={{ fontFamily: "var(--serif)", fontSize: 28, letterSpacing: "-0.01em", marginBottom: 8 }}>
              {type === "login" ? "Welcome back." : "Begin your story."}
            </h1>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>
              {type === "login" ? "Your memories are waiting." : "Create your first time capsule today."}
            </p>
          </div>

          {/* Social Login */}
                   {/* Social Login — ReactComponent SVGs must render as <Icon />, not {Icon} */}
                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
            {[
              { Icon: GoogleSvg, label: "Google" },
              { Icon: AppleSvg, label: "Apple" },
            ].map((s) => {
              const Icon = s.Icon;
              return (
                <button
                  key={s.label}
                  type="button"
                  className="btn-ghost"
                  style={{
                    padding: "12px",
                    fontSize: 14,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {Icon ? (
                    <Icon style={{ width: 20, height: 20, flexShrink: 0 }} aria-hidden />
                  ) : (
                    <span style={{ fontWeight: 700, width: 20, textAlign: "center" }}>{s.textIcon}</span>
                  )}
                  {s.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 12, color: "var(--muted)" }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {type === "signup" && (
              <input className="input-field" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            )}
            <input className="input-field" type="email" placeholder="Email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input className="input-field" type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} />

            {error && <div style={{ fontSize: 13, color: "#F87171", textAlign: "center" }}>{error}</div>}

            <button className="btn-primary" style={{ width: "100%", marginTop: 8, padding: "15px", borderRadius: 12, fontSize: 16 }} onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <span style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                  {type === "login" ? "Signing in..." : "Creating account..."}
                </span>
              ) : (type === "login" ? "Sign In" : "Create Account")}
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: 28, fontSize: 14, color: "var(--muted)" }}>
            {type === "login" ? (
              <>Don't have an account? <span style={{ color: "var(--cue)", cursor: "pointer" }} onClick={() => setPage("signup")}>Sign up</span></>
            ) : (
              <>Already have an account? <span style={{ color: "var(--cue)", cursor: "pointer" }} onClick={() => setPage("login")}>Sign in</span></>
            )}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <span style={{ fontSize: 13, color: "var(--muted)", cursor: "pointer" }} onClick={() => setPage("landing")}>← Back to home</span>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─── DASHBOARD SIDEBAR ────────────────────────────────────────────────────────
const Sidebar = ({ active, setActive, setPage }) => {
  const links = [
    { id: "overview", icon: "◎", label: "Overview" },
    { id: "memories", icon: "✉", label: "My Memories" },
    { id: "vault", icon: "◈", label: "Vault" },
    { id: "create", icon: "+", label: "New Cue", isPrimary: true },
  ];

  return (
    <div className="glass" style={{ width: 220, minHeight: "100vh", padding: "32px 20px", display: "flex", flexDirection: "column", gap: 8, borderRight: "1px solid var(--border)", borderRadius: 0, borderLeft: "none", borderTop: "none", borderBottom: "none", flexShrink: 0 }}>
      {/* Logo */}
      <img src={CueSvg1} alt="Cue" style={{ width: 36, height: 36, objectFit: "contain" }} />
<span style={{ fontFamily: "var(--serif)", fontSize: 20 }}>Cue</span>

      {links.map(l => (
        <button key={l.id} onClick={() => l.id === "create" ? setActive("create") : setActive(l.id)}
          className={l.isPrimary ? "btn-primary" : ""}
          style={l.isPrimary ? { borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, fontSize: 14, marginTop: 8 } : {
            display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: "none",
            cursor: "pointer", fontSize: 14, fontFamily: "var(--sans)", fontWeight: 500,
            background: active === l.id ? "rgba(100,149,237,0.1)" : "transparent",
            color: active === l.id ? "var(--cue)" : "var(--soft)",
            borderLeft: active === l.id ? "2px solid var(--cue)" : "2px solid transparent",
            transition: "all 0.2s ease",
          }}>
          <span style={{ fontSize: 16 }}>{l.icon}</span>
          {l.label}
        </button>
      ))}

      <div style={{ flex: 1 }} />

      {/* User */}
      <div className="glass" style={{ padding: "14px 16px", borderRadius: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #6495ED, #7C3AED)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 14 }}>J</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Jordan</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Early Access</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
const OverviewTab = ({ setActive, memories }) => {
  const stats = [
    { label: "Total Memories", value: memories.length, icon: "◎" },
    { label: "Scheduled", value: memories.filter(m => m.status === "Scheduled").length, icon: "◷" },
    { label: "Delivered", value: memories.filter(m => m.status === "Delivered").length, icon: "✓" },
    { label: "Pending", value: memories.filter(m => m.status === "Pending").length, icon: "⋯" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>Good morning,</div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 42, letterSpacing: "-0.02em", marginBottom: 8 }}>Jordan.</h1>
        <p style={{ fontSize: 15, color: "var(--soft)" }}>You have {memories.filter(m => m.status !== "Delivered").length} memories sealed and waiting.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
        {stats.map((s, i) => (
          <div key={i} className="card" style={{ padding: "28px 24px" }}>
            <div style={{ fontSize: 24, color: "var(--cue)", marginBottom: 12 }}>{s.icon}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 36, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent memories */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: 22 }}>Recent Memories</h2>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--cue)", fontSize: 13 }} onClick={() => setActive("memories")}>View all →</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {memories.slice(0, 3).map(m => (
              <MemoryRow key={m.id} memory={m} compact />
            ))}
          </div>
        </div>

        {/* Quick create */}
        <div className="card glass-bright" style={{ padding: "36px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 16, cursor: "pointer" }} onClick={() => setActive("create")}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, rgba(100,149,237,0.2), rgba(124,58,237,0.2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "var(--cue)" }}>+</div>
          <div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 22, marginBottom: 8 }}>Seal a New Memory</div>
            <div style={{ fontSize: 14, color: "var(--soft)" }}>Capture a moment and send it forward in time.</div>
          </div>
          <button className="btn-primary" style={{ padding: "12px 28px" }}>Create Cue</button>
        </div>
      </div>
    </div>
  );
};

// ─── MEMORY ROW ───────────────────────────────────────────────────────────────
const MemoryRow = ({ memory: m, compact }) => {
  const typeIcons = { letter: "✉", video: "▶", voice: "♪", photo: "◎" };
  const days = daysUntil(m.deliveryDate);
  return (
    <div className="card" style={{ padding: compact ? "16px 20px" : "24px 28px", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 10, background: "linear-gradient(135deg, rgba(100,149,237,0.2), rgba(124,58,237,0.2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "var(--cue)" }}>
        {typeIcons[m.type] || "◎"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.title}</div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>{m.recipient === "self" ? "To: Yourself" : `To: ${m.recipient}`} · {formatDate(m.deliveryDate)}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
        <span className={`status-badge status-${m.status.toLowerCase()}`}>{m.status}</span>
        {m.status !== "Delivered" && <span style={{ fontSize: 11, color: "var(--muted)" }}>{days > 0 ? `${days}d away` : "Today"}</span>}
      </div>
    </div>
  );
};

// ─── MEMORIES TAB ─────────────────────────────────────────────────────────────
const MemoriesTab = ({ memories }) => {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Scheduled", "Pending", "Delivered"];
  const filtered = filter === "All" ? memories : memories.filter(m => m.status === filter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36 }}>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 36, letterSpacing: "-0.02em" }}>My Memories</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "8px 18px", borderRadius: 100, border: "1px solid", fontSize: 13, cursor: "pointer", fontFamily: "var(--sans)", fontWeight: 500,
              background: filter === f ? "var(--cue)" : "transparent",
              borderColor: filter === f ? "var(--cue)" : "var(--border)",
              color: filter === f ? "white" : "var(--soft)",
              transition: "all 0.2s",
            }}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(m => <MemoryRow key={m.id} memory={m} />)}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>◎</div>
            <div style={{ fontSize: 16 }}>No {filter.toLowerCase()} memories yet.</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── CREATE MEMORY ────────────────────────────────────────────────────────────
const CreateMemory = ({ setActive, addMemory }) => {
  const [form, setForm] = useState({ title: "", message: "", recipient: "", deliveryDate: "", type: "letter" });
  const [step, setStep] = useState(1);
  const [sealed, setSealed] = useState(false);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSeal = () => {
    if (!form.title || !form.message || !form.deliveryDate) return;
    setSealed(true);
    setTimeout(() => {
      addMemory({ ...form, id: Date.now(), status: "Scheduled", createdAt: new Date().toISOString().split("T")[0], preview: form.message.slice(0, 80) });
      setTimeout(() => { setActive("memories"); }, 2000);
    }, 1500);
  };

  if (sealed) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center", gap: 24 }}>
      <div style={{ fontSize: 72, animation: "float 3s ease-in-out infinite" }}>◎</div>
      <div>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 40, marginBottom: 12 }}>Memory Sealed.</h2>
        <p style={{ fontSize: 16, color: "var(--soft)" }}>Your Cue is traveling to {formatDate(form.deliveryDate)}.</p>
      </div>
      <div className="glass-bright" style={{ padding: "16px 32px", borderRadius: 100, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 8px #22C55E", display: "block" }} />
        <span style={{ fontSize: 14 }}>Scheduled for delivery</span>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "var(--serif)", fontSize: 38, letterSpacing: "-0.02em", marginBottom: 8 }}>New Memory</h1>
      <p style={{ fontSize: 15, color: "var(--muted)", marginBottom: 40 }}>Seal a moment in time. Deliver it when it matters most.</p>

      {/* Steps */}
      <div style={{ display: "flex", gap: 0, marginBottom: 40 }}>
        {["Compose", "Schedule", "Seal"].map((s, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setStep(i + 1)}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: step > i ? "linear-gradient(135deg, #6495ED, #7C3AED)" : step === i + 1 ? "rgba(100,149,237,0.2)" : "var(--surface)", border: `1px solid ${step >= i + 1 ? "var(--cue)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: step >= i + 1 ? "white" : "var(--muted)", transition: "all 0.3s", position: "relative", zIndex: 1 }}>
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 12, color: step === i + 1 ? "var(--cue)" : "var(--muted)", fontWeight: step === i + 1 ? 500 : 400 }}>{s}</span>
            {i < 2 && <div style={{ position: "absolute", top: 18, left: `${33 + i * 33}%`, width: "33%", height: 1, background: step > i + 1 ? "var(--cue)" : "var(--border)", zIndex: 0, transition: "background 0.3s" }} />}
          </div>
        ))}
      </div>

      <div className="glass" style={{ borderRadius: 24, padding: "40px" }}>
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ fontSize: 13, color: "var(--muted)", display: "block", marginBottom: 8 }}>MEMORY TYPE</label>
              <div style={{ display: "flex", gap: 10 }}>
                {[{ v: "letter", label: "✉ Letter" }, { v: "video", label: "▶ Video" }, { v: "voice", label: "♪ Voice" }, { v: "photo", label: "◎ Photo" }].map(t => (
                  <button key={t.v} onClick={() => update("type", t.v)} style={{
                    padding: "10px 18px", borderRadius: 10, border: "1px solid", fontSize: 13, cursor: "pointer", fontFamily: "var(--sans)",
                    background: form.type === t.v ? "rgba(100,149,237,0.15)" : "transparent",
                    borderColor: form.type === t.v ? "var(--cue)" : "var(--border)",
                    color: form.type === t.v ? "var(--cue)" : "var(--soft)",
                    transition: "all 0.2s",
                  }}>{t.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: "var(--muted)", display: "block", marginBottom: 8 }}>TITLE</label>
              <input className="input-field" placeholder="Give your memory a name..." value={form.title} onChange={e => update("title", e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: "var(--muted)", display: "block", marginBottom: 8 }}>MESSAGE</label>
              <textarea className="input-field" placeholder="Write your message to the future..." value={form.message} onChange={e => update("message", e.target.value)} rows={7} style={{ fontFamily: "var(--sans)", lineHeight: 1.7 }} />
            </div>
            {/* File upload placeholder */}
            <div style={{ border: "2px dashed var(--border)", borderRadius: 14, padding: "32px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--cue)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
              <div style={{ fontSize: 28, color: "var(--muted)", marginBottom: 10 }}>↑</div>
              <div style={{ fontSize: 14, color: "var(--soft)" }}>Attach photos or videos</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Up to 500MB · JPG, PNG, MP4, MOV, MP3</div>
            </div>
            <button className="btn-primary" style={{ alignSelf: "flex-end", padding: "13px 36px" }} onClick={() => setStep(2)} disabled={!form.title || !form.message}>Continue →</button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ fontSize: 13, color: "var(--muted)", display: "block", marginBottom: 8 }}>RECIPIENT</label>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                {["self", "someone"].map(r => (
                  <button key={r} onClick={() => update("recipient", r === "self" ? "self" : "")} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid", fontSize: 13, cursor: "pointer", fontFamily: "var(--sans)", background: (r === "self" ? form.recipient === "self" : form.recipient !== "self" && form.recipient) ? "rgba(100,149,237,0.15)" : "transparent", borderColor: (r === "self" ? form.recipient === "self" : form.recipient !== "self" && form.recipient) ? "var(--cue)" : "var(--border)", color: "var(--soft)", transition: "all 0.2s" }}>
                    {r === "self" ? "To Yourself" : "To Someone Else"}
                  </button>
                ))}
              </div>
              {form.recipient !== "self" && (
                <input className="input-field" type="email" placeholder="recipient@email.com" value={form.recipient} onChange={e => update("recipient", e.target.value)} />
              )}
            </div>
            <div>
              <label style={{ fontSize: 13, color: "var(--muted)", display: "block", marginBottom: 8 }}>DELIVERY DATE</label>
              <input className="input-field" type="date" value={form.deliveryDate} min={new Date().toISOString().split("T")[0]} onChange={e => update("deliveryDate", e.target.value)} />
              {form.deliveryDate && (
                <div style={{ marginTop: 10, fontSize: 13, color: "var(--cue)" }}>
                  ◎ Delivering in {daysUntil(form.deliveryDate)} days · {formatDate(form.deliveryDate)}
                </div>
              )}
            </div>
            {/* Preview */}
            {form.deliveryDate && (
              <div className="glass-bright" style={{ padding: "20px", borderRadius: 14 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Preview</div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{form.title}</div>
                <div style={{ fontSize: 13, color: "var(--soft)", marginBottom: 10 }}>{form.message.slice(0, 100)}...</div>
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--muted)" }}>
                  <span>To: {form.recipient === "self" ? "Yourself" : form.recipient || "—"}</span>
                  <span>Delivers: {formatDate(form.deliveryDate)}</span>
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button className="btn-ghost" style={{ padding: "13px 28px" }} onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary" style={{ padding: "13px 36px" }} onClick={() => setStep(3)} disabled={!form.deliveryDate || !form.recipient}>Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 28 }}>
            <div style={{ width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg, rgba(100,149,237,0.2), rgba(124,58,237,0.2))", border: "1px solid var(--border-bright)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, animation: "float 4s ease-in-out infinite" }}>◎</div>
            <div>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: 32, letterSpacing: "-0.01em", marginBottom: 12 }}>Ready to seal.</h2>
              <p style={{ fontSize: 15, color: "var(--soft)", lineHeight: 1.7, maxWidth: 420 }}>
                Your memory <strong style={{ color: "var(--text)" }}>{form.title}</strong> will be delivered to {form.recipient === "self" ? "you" : form.recipient} on <strong style={{ color: "var(--cue)" }}>{formatDate(form.deliveryDate)}</strong>.
              </p>
            </div>
            <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[["Type", form.type], ["Recipient", form.recipient === "self" ? "Yourself" : form.recipient?.split("@")[0] || "—"], ["Days Away", `${daysUntil(form.deliveryDate)}d`]].map(([k, v]) => (
                <div key={k} className="glass" style={{ padding: "16px", borderRadius: 12 }}>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{k}</div>
                  <div style={{ fontSize: 15, fontWeight: 500, textTransform: "capitalize" }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn-ghost" style={{ padding: "14px 32px" }} onClick={() => setStep(2)}>← Revise</button>
              <button className="btn-primary" style={{ padding: "14px 48px", fontSize: 16, letterSpacing: "0.02em" }} onClick={handleSeal}>Seal Cue ◎</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── VAULT TAB ────────────────────────────────────────────────────────────────
const VaultTab = ({ memories }) => (
  <div>
    <h1 style={{ fontFamily: "var(--serif)", fontSize: 36, letterSpacing: "-0.02em", marginBottom: 8 }}>Memory Vault</h1>
    <p style={{ fontSize: 15, color: "var(--muted)", marginBottom: 40 }}>Your sealed memories, organized and preserved.</p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
      {[
        { label: "Personal", icon: "◎", memories: memories.filter(m => m.recipient === "self"), color: "#6495ED" },
        { label: "Family", icon: "🏛", memories: memories.filter(m => m.recipient?.includes("family")), color: "#7C3AED" },
        { label: "Love", icon: "♡", memories: memories.filter(m => m.recipient?.includes("love") || m.recipient?.includes("sarah")), color: "#EC4899" },
      ].map((v, i) => (
        <div key={i} className="card" style={{ padding: "32px 28px" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: `${v.color}22`, border: `1px solid ${v.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 20 }}>{v.icon}</div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 22, marginBottom: 6 }}>{v.label}</div>
          <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20 }}>{v.memories.length} {v.memories.length === 1 ? "memory" : "memories"}</div>
          <div style={{ height: 4, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", background: `linear-gradient(90deg, ${v.color}, ${v.color}88)`, width: `${Math.min(v.memories.length * 25, 100)}%`, borderRadius: 4 }} />
          </div>
        </div>
      ))}
      <div className="card" style={{ padding: "32px 28px", border: "2px dashed var(--border)", background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer" }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--cue)"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
        <div style={{ fontSize: 32, color: "var(--muted)" }}>+</div>
        <div style={{ fontSize: 14, color: "var(--muted)" }}>New Vault</div>
      </div>
    </div>
  </div>
);

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [active, setActive] = useState("overview");
  const [memories, setMemories] = useState(MOCK_MEMORIES);
  const addMemory = (m) => setMemories(prev => [m, ...prev]);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active={active} setActive={setActive} />
      <div style={{ flex: 1, padding: "48px 52px", overflowY: "auto", maxWidth: "100%" }}>
        {active === "overview" && <OverviewTab setActive={setActive} memories={memories} />}
        {active === "memories" && <MemoriesTab memories={memories} />}
        {active === "vault" && <VaultTab memories={memories} />}
        {active === "create" && <CreateMemory setActive={setActive} addMemory={addMemory} />}
      </div>
    </div>
  );
};

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  return (
    <>
      <GlobalStyles />
      <div className="noise-overlay" />
      {page !== "dashboard" && <Nav page={page} setPage={setPage} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
      {page === "landing" && <LandingPage setPage={setPage} />}
      {page === "login" && <AuthPage type="login" setPage={setPage} setIsLoggedIn={setIsLoggedIn} />}
      {page === "signup" && <AuthPage type="signup" setPage={setPage} setIsLoggedIn={setIsLoggedIn} />}
      {page === "dashboard" && <Dashboard />}
    </>
  );
}
