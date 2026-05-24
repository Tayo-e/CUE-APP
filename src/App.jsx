// ─── INSTALL BEFORE USING ─────────────────────────────────────────────────────
// npm install gsap lenis
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import CueSvg1 from "./CueLogo1.svg";
import CueSvg2 from "./CueLogo2.svg";
import { getFunctions, httpsCallable } from "firebase/functions";
import { ReactComponent as GoogleSvg } from "./icons8-google-50.svg";
import { ReactComponent as AppleSvg } from "./apple-logo-svgrepo-com.svg";
import { setDoc, doc, getDoc } from "firebase/firestore";

import { auth, googleProvider, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

gsap.registerPlugin(ScrollTrigger);

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_MEMORIES = [
  {
    id: 1,
    title: "For Emma on her 18th Birthday",
    recipient: "emma@family.com",
    preview:
      "By the time you read this, you'll have grown into someone extraordinary...",
    deliveryDate: "2031-06-14",
    status: "Scheduled",
    type: "letter",
    createdAt: "2024-01-10",
  },
  {
    id: 2,
    title: "A Letter to Future Me",
    recipient: "self",
    preview: "I wonder what you've achieved. I hope you took the leap...",
    deliveryDate: "2026-12-31",
    status: "Pending",
    type: "video",
    createdAt: "2024-03-22",
  },
  {
    id: 3,
    title: "Our 10-Year Anniversary",
    recipient: "sarah@love.com",
    preview: "Ten years of laughter, of mornings, of everything in between...",
    deliveryDate: "2025-09-03",
    status: "Delivered",
    type: "voice",
    createdAt: "2023-09-03",
  },
  {
    id: 4,
    title: "Grandpa's Stories for the Kids",
    recipient: "family@vault.com",
    preview: "When I was young, the world looked very different...",
    deliveryDate: "2027-07-20",
    status: "Scheduled",
    type: "letter",
    createdAt: "2024-05-01",
  },
];

const USE_CASES = [
  {
    emoji: "🎂",
    title: "Yearly Birthday Messages",
    desc: "Record birthday videos for your child, delivered every year until they're grown.",
  },
  {
    emoji: "💌",
    title: "Anniversary Letters",
    desc: "Write love letters years ahead, arriving on the exact date that matters.",
  },
  {
    emoji: "🔮",
    title: "Letters to Your Future Self",
    desc: "Capture who you are today. Meet yourself again in 5, 10, or 20 years.",
  },
  {
    emoji: "🏛️",
    title: "Family Legacy Vaults",
    desc: "Preserve stories, traditions, and wisdom for generations not yet born.",
  },
  {
    emoji: "🎓",
    title: "Graduation Surprises",
    desc: "Send a message now to someone who hasn't yet achieved their dream.",
  },
  {
    emoji: "🌱",
    title: "Time-Locked Milestones",
    desc: "Seal a memory at this moment. Unlock it when the world has changed.",
  },
];

const FEATURES = [
  {
    color: "#6495ED",
    title: "Future Delivery Engine",
    desc: "Messages arrive at the exact moment you choose — a day, a year, or a decade from now. Precise. Reliable. Timeless.",
    illustration: "clock",
  },
  {
    color: "#A855F7",
    title: "Multi-Format Memories",
    desc: "Text letters, photos, videos, voice recordings. Layer them into a single capsule that carries the full weight of a moment.",
    illustration: "layers",
  },
  {
    color: "#EC4899",
    title: "Vault Architecture",
    desc: "Organize capsules into personal vaults. Family legacy. Love archive. Future self. Each one sealed, sacred, and secure.",
    illustration: "vault",
  },
];

const FeatureIllustration = ({ type }) => {
  if (type === "clock")
    return (
      <svg
        width="100"
        height="100"
        viewBox="0 0 120 120"
        style={{ overflow: "visible" }}
      >
        <style>{`
        .hand-hour{transform-origin:60px 60px;animation:tickHands 12s linear infinite}
        .hand-min{transform-origin:60px 60px;animation:tickHands 1.8s linear infinite}
        .hand-sec{transform-origin:60px 60px;animation:tickHands .3s linear infinite}
        .orbit-dot{transform-origin:60px 60px;animation:tickHands 4s linear infinite}
        @keyframes tickHands{to{transform:rotate(360deg)}}
      `}</style>
        <circle
          cx="60"
          cy="60"
          r="48"
          fill="rgba(100,149,237,0.08)"
          stroke="rgba(100,149,237,0.35)"
          strokeWidth="1.5"
        />
        <circle
          cx="60"
          cy="60"
          r="42"
          fill="none"
          stroke="rgba(100,149,237,0.12)"
          strokeWidth="0.5"
        />
        <g
          stroke="rgba(100,149,237,0.5)"
          strokeWidth="1.2"
          strokeLinecap="round"
        >
          <line x1="60" y1="16" x2="60" y2="22" />
          <line x1="60" y1="98" x2="60" y2="104" />
          <line x1="16" y1="60" x2="22" y2="60" />
          <line x1="98" y1="60" x2="104" y2="60" />
        </g>
        <g
          stroke="rgba(100,149,237,0.2)"
          strokeWidth="0.7"
          strokeLinecap="round"
        >
          <line x1="84" y1="19.5" x2="81.5" y2="23.9" />
          <line x1="100.5" y1="36" x2="96.1" y2="38.5" />
          <line x1="100.5" y1="84" x2="96.1" y2="81.5" />
          <line x1="84" y1="100.5" x2="81.5" y2="96.1" />
          <line x1="36" y1="100.5" x2="38.5" y2="96.1" />
          <line x1="19.5" y1="84" x2="23.9" y2="81.5" />
          <line x1="19.5" y1="36" x2="23.9" y2="38.5" />
          <line x1="36" y1="19.5" x2="38.5" y2="23.9" />
        </g>
        <line
          className="hand-hour"
          x1="60"
          y1="60"
          x2="60"
          y2="38"
          stroke="#6495ED"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          className="hand-min"
          x1="60"
          y1="60"
          x2="60"
          y2="30"
          stroke="#A78BFA"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          className="hand-sec"
          x1="60"
          y1="64"
          x2="60"
          y2="25"
          stroke="#EC4899"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <circle cx="60" cy="60" r="3.5" fill="#6495ED" />
        <circle cx="60" cy="60" r="1.5" fill="white" />
        <g className="orbit-dot">
          <circle
            cx="60"
            cy="20"
            r="3.5"
            fill="rgba(100,149,237,0.9)"
            stroke="#A78BFA"
            strokeWidth="1"
          />
        </g>
      </svg>
    );

  if (type === "layers")
    return (
      <svg width="100" height="100" viewBox="0 0 120 120">
        <style>{`
        .layer1{animation:lp 2.4s ease-in-out infinite}
        .layer2{animation:lp 2.4s ease-in-out .4s infinite}
        .layer3{animation:lp 2.4s ease-in-out .8s infinite}
        .layer4{animation:lp 2.4s ease-in-out 1.2s infinite}
        @keyframes lp{0%,100%{opacity:.85}50%{opacity:1}}
      `}</style>
        <g className="layer1">
          <rect
            x="18"
            y="74"
            width="84"
            height="28"
            rx="6"
            fill="rgba(236,72,153,0.12)"
            stroke="rgba(236,72,153,0.4)"
            strokeWidth="1"
          />
          <text
            x="30"
            y="93"
            fontFamily="system-ui,sans-serif"
            fontSize="11"
            fill="rgba(236,72,153,0.9)"
          >
            ◎ Photo
          </text>
        </g>
        <g className="layer2">
          <rect
            x="14"
            y="56"
            width="84"
            height="24"
            rx="6"
            fill="rgba(34,197,94,0.1)"
            stroke="rgba(34,197,94,0.35)"
            strokeWidth="1"
          />
          <g fill="rgba(34,197,94,0.7)">
            <rect x="28" y="63" width="2" height="10" rx="1" />
            <rect x="33" y="60" width="2" height="16" rx="1" />
            <rect x="38" y="65" width="2" height="6" rx="1" />
            <rect x="43" y="61" width="2" height="14" rx="1" />
            <rect x="48" y="63" width="2" height="10" rx="1" />
            <rect x="53" y="66" width="2" height="4" rx="1" />
            <rect x="58" y="62" width="2" height="12" rx="1" />
            <rect x="63" y="64" width="2" height="8" rx="1" />
          </g>
          <text
            x="72"
            y="73"
            fontFamily="system-ui,sans-serif"
            fontSize="10"
            fill="rgba(34,197,94,0.85)"
          >
            ♪ Voice
          </text>
        </g>
        <g className="layer3">
          <rect
            x="10"
            y="36"
            width="84"
            height="26"
            rx="6"
            fill="rgba(124,58,237,0.12)"
            stroke="rgba(124,58,237,0.4)"
            strokeWidth="1"
          />
          <polygon points="30,43 30,55 42,49" fill="rgba(124,58,237,0.8)" />
          <text
            x="50"
            y="52"
            fontFamily="system-ui,sans-serif"
            fontSize="10"
            fill="rgba(167,139,250,0.9)"
          >
            ▶ Video
          </text>
        </g>
        <g className="layer4">
          <rect
            x="14"
            y="16"
            width="84"
            height="26"
            rx="6"
            fill="rgba(100,149,237,0.14)"
            stroke="rgba(100,149,237,0.5)"
            strokeWidth="1.2"
          />
          <polyline
            points="14,22 56,38 98,22"
            fill="none"
            stroke="rgba(100,149,237,0.6)"
            strokeWidth="1"
          />
          <text
            x="28"
            y="33"
            fontFamily="system-ui,sans-serif"
            fontSize="10"
            fill="rgba(100,149,237,0.95)"
          >
            ✉ Letter
          </text>
        </g>
      </svg>
    );

  if (type === "vault")
    return (
      <svg width="100" height="100" viewBox="0 0 120 120">
        <style>{`
        .dial-ring{transform-origin:60px 60px;animation:dialSpin 6s linear infinite}
        .vault-glow{animation:vaultGlow 2.8s ease-in-out infinite}
        @keyframes dialSpin{to{transform:rotate(360deg)}}
        @keyframes vaultGlow{0%,100%{opacity:.3}50%{opacity:.7}}
      `}</style>
        <circle
          className="vault-glow"
          cx="60"
          cy="60"
          r="50"
          fill="rgba(100,149,237,0.06)"
          stroke="rgba(100,149,237,0.2)"
          strokeWidth="0.5"
        />
        <circle
          cx="60"
          cy="60"
          r="44"
          fill="rgba(15,23,42,0.8)"
          stroke="rgba(100,149,237,0.5)"
          strokeWidth="2"
        />
        <circle
          cx="60"
          cy="20"
          r="4"
          fill="rgba(100,149,237,0.2)"
          stroke="rgba(100,149,237,0.5)"
          strokeWidth="1"
        />
        <circle
          cx="60"
          cy="100"
          r="4"
          fill="rgba(100,149,237,0.2)"
          stroke="rgba(100,149,237,0.5)"
          strokeWidth="1"
        />
        <circle
          cx="20"
          cy="60"
          r="4"
          fill="rgba(100,149,237,0.2)"
          stroke="rgba(100,149,237,0.5)"
          strokeWidth="1"
        />
        <circle
          cx="100"
          cy="60"
          r="4"
          fill="rgba(100,149,237,0.2)"
          stroke="rgba(100,149,237,0.5)"
          strokeWidth="1"
        />
        <circle
          cx="36.6"
          cy="26.6"
          r="3"
          fill="rgba(100,149,237,0.15)"
          stroke="rgba(100,149,237,0.35)"
          strokeWidth="0.8"
        />
        <circle
          cx="83.4"
          cy="26.6"
          r="3"
          fill="rgba(100,149,237,0.15)"
          stroke="rgba(100,149,237,0.35)"
          strokeWidth="0.8"
        />
        <circle
          cx="36.6"
          cy="93.4"
          r="3"
          fill="rgba(100,149,237,0.15)"
          stroke="rgba(100,149,237,0.35)"
          strokeWidth="0.8"
        />
        <circle
          cx="83.4"
          cy="93.4"
          r="3"
          fill="rgba(100,149,237,0.15)"
          stroke="rgba(100,149,237,0.35)"
          strokeWidth="0.8"
        />
        <g className="dial-ring">
          <circle
            cx="60"
            cy="60"
            r="22"
            fill="none"
            stroke="rgba(167,139,250,0.35)"
            strokeWidth="1.5"
            strokeDasharray="3 4"
          />
          <rect
            x="58"
            y="38"
            width="4"
            height="7"
            rx="1"
            fill="rgba(167,139,250,0.7)"
          />
        </g>
        <circle
          cx="60"
          cy="60"
          r="14"
          fill="rgba(100,149,237,0.1)"
          stroke="rgba(100,149,237,0.4)"
          strokeWidth="1"
        />
        <circle
          cx="60"
          cy="57"
          r="5"
          fill="rgba(100,149,237,0.25)"
          stroke="rgba(100,149,237,0.7)"
          strokeWidth="1.2"
        />
        <rect
          x="57.5"
          y="60"
          width="5"
          height="6"
          rx="1"
          fill="rgba(100,149,237,0.4)"
          stroke="rgba(100,149,237,0.5)"
          strokeWidth="0.5"
        />
        <rect
          x="44"
          y="58.5"
          width="10"
          height="3"
          rx="1.5"
          fill="rgba(100,149,237,0.5)"
        />
        <rect
          x="66"
          y="58.5"
          width="10"
          height="3"
          rx="1.5"
          fill="rgba(100,149,237,0.5)"
        />
      </svg>
    );

  return null;
};

// Real faces for social proof
const SOCIAL_PROOF_AVATARS = [
  "https://i.pravatar.cc/40?img=47",
  "https://i.pravatar.cc/40?img=12",
  "https://i.pravatar.cc/40?img=32",
  "https://i.pravatar.cc/40?img=5",
];

// ─── UTILITY ──────────────────────────────────────────────────────────────────
const cx = (...args) => args.filter(Boolean).join(" ");
const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);
const PLAN_LIMITS = {
  free: { label: "Free", maxYears: 10, price: "$0" },
  premium: { label: "Premium", maxYears: 50, price: "$8/mo" },
};

const addYears = (date, years) => {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
};

const toDateInputValue = (date) => date.toISOString().split("T")[0];

const MAX_ATTACHMENT_BYTES = 500 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "video/mp4",
  "video/quicktime",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
]);
const ALLOWED_ATTACHMENT_EXT = /\.(jpe?g|png|mp4|mov|mp3|m4a|wav)$/i;

function isAllowedAttachment(file) {
  return (
    ALLOWED_ATTACHMENT_TYPES.has(file.type) ||
    ALLOWED_ATTACHMENT_EXT.test(file.name)
  );
}

// ─── TOAST SYSTEM (replaces alert/confirm) ────────────────────────────────────
const ToastContext = React.createContext(null);

// We'll implement a lightweight toast without React.createContext to keep it self-contained
let _toastFn = null;
export const toast = (msg, type = "info") => _toastFn?.(msg, type);

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    _toastFn = (msg, type) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, msg, type }]);
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        3500,
      );
    };
    return () => {
      _toastFn = null;
    };
  }, []);

  const colors = {
    info: {
      bg: "rgba(100,149,237,0.15)",
      border: "rgba(100,149,237,0.4)",
      icon: "◎",
    },
    success: {
      bg: "rgba(34,197,94,0.15)",
      border: "rgba(34,197,94,0.4)",
      icon: "✓",
    },
    error: {
      bg: "rgba(248,113,113,0.15)",
      border: "rgba(248,113,113,0.4)",
      icon: "✕",
    },
    warn: {
      bg: "rgba(251,191,36,0.15)",
      border: "rgba(251,191,36,0.4)",
      icon: "⚠",
    },
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => {
        const c = colors[t.type] || colors.info;
        return (
          <div
            key={t.id}
            style={{
              background: c.bg,
              border: `1px solid ${c.border}`,
              backdropFilter: "blur(20px)",
              padding: "14px 20px",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 14,
              color: "var(--text)",
              animation: "fadeUp 0.3s ease forwards",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              minWidth: 240,
              maxWidth: 340,
            }}
          >
            <span style={{ fontSize: 16 }}>{c.icon}</span>
            <span>{t.msg}</span>
          </div>
        );
      })}
    </div>
  );
};

// Seal confetti burst
const SealConfetti = ({ active }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 80 }, () => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.9) * 12,
      r: Math.random() * 6 + 3,
      color: ["#6495ED", "#7C3AED", "#EC4899", "#22C55E", "#F59E0B"][
        Math.floor(Math.random() * 5)
      ],
      alpha: 1,
      gravity: 0.3,
    }));

    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= 0.018;
        if (p.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      if (particles.some((p) => p.alpha > 0))
        frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9998,
      }}
    />
  );
};

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Open+Sans:wght@300;400;500;600&display=swap');
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
      --serif: 'Inter', system-ui, sans-serif;
      --sans: 'Open Sans', system-ui, sans-serif;
    }

    html { scroll-behavior: auto; } /* Lenis handles this */

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
    @keyframes ticker {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }

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
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
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
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
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
    .schedule-input {
      color-scheme: dark;
      color: var(--text) !important;
      background-color: rgba(10,15,30,0.72) !important;
    }
    .schedule-input::-webkit-calendar-picker-indicator {
      filter: invert(1) opacity(0.82);
    }
    .schedule-input::-webkit-date-and-time-value,
    .schedule-input::-webkit-datetime-edit,
    .schedule-input::-webkit-datetime-edit-fields-wrapper,
    .schedule-input::-webkit-datetime-edit-text,
    .schedule-input::-webkit-datetime-edit-month-field,
    .schedule-input::-webkit-datetime-edit-day-field,
    .schedule-input::-webkit-datetime-edit-year-field,
    .schedule-input::-webkit-datetime-edit-hour-field,
    .schedule-input::-webkit-datetime-edit-minute-field,
    .schedule-input::-webkit-datetime-edit-ampm-field {
      color: var(--text);
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
      white-space: nowrap;
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

    /* ── MEMORY ROW MOBILE FIX ── */
    .memory-row-card {
      overflow: hidden;
      width: 100%;
      max-width: 100%;
    }
    .memory-row-inner {
      display: flex;
      align-items: center;
      gap: 12px;
      overflow: hidden;
      width: 100%;
      min-width: 0;
    }
    .memory-row-text {
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }
    .memory-row-title {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 3px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .memory-row-sub {
      font-size: 12px;
      color: var(--muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .memory-row-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    /* Fix glass cards appearing white on mobile */
.glass {
  background: rgba(255,255,255,0.04) !important;
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
}
.recent-grid {
 grid-template-columns: 1fr 1fr; 
}
    textarea { resize: none; }
    select option { background: var(--navy-2); }

    /* ── MOBILE TOPBAR ── */
    .mobile-topbar { display: none; }

    @media (max-width: 768px) {

  /* ───────────────── MOBILE TOPBAR ───────────────── */
  .mobile-topbar {
    display: flex !important;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 200;
    padding: 12px 16px;
    background: rgba(10,15,30,0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    align-items: center;
    justify-content: space-between;
  }

  .dashboard-sidebar {
    display: none !important;
  }

  .dashboard-content {
    padding: 84px 16px 24px !important;
  }

  /* ───────────────── NAV ───────────────── */
  nav {
    padding: 12px 16px !important;
  }

  /* REMOVE THIS COMPLETELY */
  /* nav div { gap: 6px !important; } */

  nav .btn-ghost,
  nav .btn-primary {
    padding: 10px 16px !important;
    font-size: 13px !important;
    white-space: nowrap;
  }

  /* ───────────────── HERO ───────────────── */
  .hero-content {
    padding: 80px 20px 40px !important;
  }

  .hero-badge {
    margin-bottom: 24px !important;
  }

  /* ───────────────── GRID FIXES ───────────────── */
  .stats-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 12px !important;
  }

  .recent-grid {
    grid-template-columns: 1fr !important;
    gap: 16px !important;
  }

  /* ───────────────── CARD FIXES ───────────────── */
  .card,
  .glass,
  .glass-bright {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .card {
    padding: 20px !important;
  }

  /* ───────────────── MEMORY ROW BUTTONS ───────────────── */
  .memory-row-actions {
    display: flex;
    width: 100%;
    gap: 8px;
  }

  .memory-row-actions button {
    flex: 1;
    padding: 10px 12px !important;
    font-size: 12px !important;
  }

  /* ───────────────── BUTTON SYSTEM ───────────────── */
  .btn-primary,
  .btn-ghost {
    width: auto;
    min-height: 44px;
    border-radius: 14px;
    transition: all 0.3s ease;
  }

  .btn-primary:hover,
  .btn-ghost:hover {
    transform: translateY(-2px);
  }

  /* ───────────────── FLOATING CARDS ───────────────── */
  .floating-memory-card {
    display: none !important;
  }
}
  `}</style>
);

// ─── MESH BACKGROUND ─────────────────────────────────────────────────────────
const MeshBg = ({ variant = "hero" }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      pointerEvents: "none",
    }}
  >
    {variant === "hero" && (
      <>
        <div
          className="mesh-bg"
          style={{
            width: 600,
            height: 600,
            background:
              "radial-gradient(circle, rgba(100,149,237,0.15) 0%, transparent 70%)",
            top: -100,
            left: "30%",
            animation: "floatSlow 10s ease-in-out infinite",
          }}
        />
        <div
          className="mesh-bg"
          style={{
            width: 400,
            height: 400,
            background:
              "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)",
            bottom: -100,
            right: "10%",
            animation: "floatSlow 12s ease-in-out infinite reverse",
          }}
        />
        <div
          className="mesh-bg"
          style={{
            width: 300,
            height: 300,
            background:
              "radial-gradient(circle, rgba(100,149,237,0.08) 0%, transparent 70%)",
            top: "40%",
            left: "5%",
            animation: "floatSlow 9s ease-in-out infinite",
          }}
        />
      </>
    )}
    {variant === "section" && (
      <>
        <div
          className="mesh-bg"
          style={{
            width: 500,
            height: 500,
            background:
              "radial-gradient(circle, rgba(100,149,237,0.08) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
          }}
        />
      </>
    )}
  </div>
);

// ─── FLOATING CARDS ───────────────────────────────────────────────────────────
const FloatingCard = ({ style, delay = 0, children }) => (
  <div className="floating-memory-card"
    style={{
      ...style,
      position: "absolute",
      animation: `float 6s ease-in-out ${delay}s infinite`,
      zIndex: 1,
    }}
  >
    {children}
  </div>
);

const MemoryCard = ({ title, date, type, style, delay }) => {
  const icons = { letter: "✉", video: "▶", voice: "♪", photo: "◎" };
  return (
    <FloatingCard style={style} delay={delay}>
      <div
        className="glass"
        style={{
          padding: "16px 20px",
          borderRadius: 16,
          minWidth: 220,
          backdropFilter: "blur(24px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #6495ED, #7C3AED)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}
          >
            {icons[type] || "◎"}
          </div>
          <div>
            <div
              style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}
            >
              {title}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              Delivers {date}
            </div>
          </div>
        </div>
        <div
          style={{
            height: 4,
            background: "var(--border)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: "60%",
              background:
                "linear-gradient(90deg, var(--cue), var(--cue-violet))",
              borderRadius: 4,
            }}
          />
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
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "16px 40px",
        transition: "all 0.4s ease",
        background: scrolled ? "rgba(10,15,30,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "none",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={() => setPage("landing")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <img
            src={CueSvg1}
            alt="Cue"
            style={{ width: 40, height: 40, objectFit: "contain" }}
          />
          <span
            style={{
              fontFamily: "var(--serif)",
              fontSize: 22,
              color: "var(--text)",
              letterSpacing: "-0.01em",
            }}
          >
            Cue
          </span>
        </button>
        {page === "landing" && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
             <button
      onClick={() => setPage("login")}
      style={{
        position: "relative",
        background: "transparent",
        border: "none",
        color: "var(--text)",
        fontSize: "clamp(12px, 2vw, 14px)",
        fontFamily: "var(--sans)",
        fontWeight: 500,
        padding: "10px 22px",
        cursor: "pointer",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        overflow: "hidden",
      }}
      onMouseEnter={e => {
        const rect = e.currentTarget.querySelector("rect");
        if (rect) {
          rect.style.strokeDasharray = "15, 310";
          rect.style.strokeDashoffset = "48";
          rect.style.strokeWidth = "3";
          rect.style.transition = "all 1.2s cubic-bezier(0.19, 1, 0.22, 1)";
        }
        e.currentTarget.style.letterSpacing = "0.08em";
      }}
      onMouseLeave={e => {
        const rect = e.currentTarget.querySelector("rect");
        if (rect) {
          rect.style.strokeDasharray = "422, 0";
          rect.style.strokeDashoffset = "0";
          rect.style.strokeWidth = "1.5";
          rect.style.transition = "all 0.35s linear";
        }
        e.currentTarget.style.letterSpacing = "0.04em";
      }}
    >
      <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <rect
          x="1" y="1"
          width="calc(100% - 2px)" height="calc(100% - 2px)"
          fill="none"
          stroke="rgba(100,149,237,0.6)"
          strokeWidth="1.5"
          strokeDasharray="422, 0"
          rx="6"
          style={{ transition: "all 0.35s linear" }}
        />
      </svg>
      Sign Up
    </button>

    {/* GET STARTED — solid gradient, glowing */}
    <button
      onClick={() => setPage("signup")}
      style={{
        background: "linear-gradient(135deg, #6495ED 0%, #7C3AED 100%)",
        border: "none",
        color: "white",
        fontSize: "clamp(12px, 2vw, 14px)",
        fontFamily: "var(--sans)",
        fontWeight: 600,
        padding: "10px 22px",
        borderRadius: 8,
        cursor: "pointer",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 20px rgba(100,149,237,0.25)",
        position: "relative",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(100,149,237,0.45)";
        e.currentTarget.style.letterSpacing = "0.07em";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(100,149,237,0.25)";
        e.currentTarget.style.letterSpacing = "0.04em";
      }}
    >
      Get Started
    </button>
  </div>
)}
        {isLoggedIn && page !== "landing" && (
          <button
            className="btn-ghost"
            style={{ padding: "10px 24px", fontSize: 14 }}
            onClick={() => {
              setIsLoggedIn(false);
              setPage("landing");
            }}
          >
            Sign Out
          </button>
        )}
      </div>
    </nav>
  );
};

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
const LandingPage = ({ setPage }) => {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  // ── GSAP SCROLL ANIMATIONS ──
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-badge",
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.2 },
      );
      gsap.fromTo(
        ".hero-h1",
        { autoAlpha: 0, y: 50 },
        { autoAlpha: 1, y: 0, duration: 1, ease: "power4.out", delay: 0.35 },
      );
      gsap.fromTo(
        ".hero-sub",
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.55 },
      );
      gsap.fromTo(
        ".hero-cta",
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.7 },
      );
      gsap.fromTo(
        ".hero-proof",
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.9 },
      );

      gsap.fromTo(
        "[data-gsap='step']",
        { autoAlpha: 0, y: 70 },
        {
          scrollTrigger: {
            trigger: "[data-gsap='how-section']",
            start: "top 100%",
            toggleActions: "play none none none",
          },
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.18,
          ease: "power3.out",
        },
      );

      gsap.fromTo(
        "[data-gsap='feature-card']",
        { autoAlpha: 0, y: 60 },
        {
          scrollTrigger: {
            trigger: "[data-gsap='features-section']",
            start: "top 90%",
            toggleActions: "play none none none",
          },
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.14,
          ease: "power3.out",
        },
      );

      gsap.fromTo(
        "[data-gsap='use-case']",
        { autoAlpha: 0, y: 50, x: -20 },
        {
          scrollTrigger: {
            trigger: "[data-gsap='use-cases-section']",
            start: "top 90%",
            toggleActions: "play none none none",
          },
          autoAlpha: 1,
          y: 0,
          x: 0,
          duration: 0.7,
          stagger: 0.09,
          ease: "power3.out",
        },
      );

      gsap.fromTo(
        "[data-gsap='dashboard-left']",
        { autoAlpha: 0, x: -60 },
        {
          scrollTrigger: {
            trigger: "[data-gsap='dashboard-section']",
            start: "top 90%",
            toggleActions: "play none none none",
          },
          autoAlpha: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
        },
      );

      gsap.fromTo(
        "[data-gsap='dashboard-right']",
        { autoAlpha: 0, x: 60 },
        {
          scrollTrigger: {
            trigger: "[data-gsap='dashboard-section']",
            start: "top 90%",
            toggleActions: "play none none none",
          },
          autoAlpha: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
        },
      );

      gsap.fromTo(
        "[data-gsap='waitlist']",
        { autoAlpha: 0, y: 50 },
        {
          scrollTrigger: {
            trigger: "[data-gsap='waitlist']",
            start: "top 95%",
            toggleActions: "play none none none",
          },
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
        },
      );
    });

    const t = setTimeout(() => ScrollTrigger.refresh(), 400);

    return () => {
      clearTimeout(t);
      ctx.revert();
    };
  }, []);

  const handleWaitlist = () => {
    if (email.includes("@")) {
      setJoined(true);
    }
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* HERO */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <MeshBg variant="hero" />

        <MemoryCard
          title="Emma's 18th Birthday"
          date="Jun 2031"
          type="video"
          style={{ top: "20%", right: "5%", opacity: 0.9 }}
          delay={0}
        />
        <MemoryCard
          title="Letter to Future Me"
          date="Dec 2026"
          type="letter"
          style={{ top: "55%", right: "12%", opacity: 0.7 }}
          delay={1.5}
        />
        <MemoryCard
          title="Our Anniversary"
          date="Sep 2025"
          type="voice"
          style={{ top: "35%", left: "2%", opacity: 0.6 }}
          delay={3}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(100,149,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(100,149,237,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }}
        />

        <div
          className="hero-content"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 40px",
            paddingTop: 3,
            paddingBottom: 80,
            position: "relative",
            zIndex: 2,
          }}
        >
          <div style={{ maxWidth: 760 }}>
            <div
              className="hero-badge glass"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 100,
                marginBottom: 40,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#22C55E",
                  display: "block",
                  boxShadow: "0 0 6px #22C55E",
                }}
              />
              <span style={{ fontSize: 13, color: "var(--soft)" }}>
                Now in Early Access
              </span>
            </div>

            <h1
              className="hero-h1"
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(52px, 8vw, 96px)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                marginBottom: 32,
              }}
            >
              <span className="text-gradient">Messages that</span>
              <br />
              <em style={{ fontStyle: "italic" }}>outlive</em>
              <span style={{ color: "var(--text)" }}> the present.</span>
            </h1>

            <p
              className="hero-sub"
              style={{
                fontSize: "clamp(17px, 2vw, 21px)",
                color: "var(--soft)",
                lineHeight: 1.7,
                maxWidth: 560,
                marginBottom: 48,
              }}
            >
              Send memories, videos, letters, and moments into the future —
              delivered exactly when they matter most.
            </p>

            <div
              className="hero-cta"
              style={{ display: "flex", gap: 16, flexWrap: "wrap" }}
            >
              <button
                className="btn-primary"
                style={{ fontSize: 16, padding: "16px 40px" }}
                onClick={() => setPage("signup")}
              >
                Begin Your Story
              </button>
              <button
                className="btn-ghost"
                style={{
                  fontSize: 16,
                  padding: "16px 40px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
                onClick={() => setPage("login")}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    border: "1px solid var(--cue)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                  }}
                >
                  ▶
                </span>
                Watch Demo
              </button>
            </div>

            {/* ── SOCIAL PROOF with real face avatars ── */}
            <div
              className="hero-proof"
              style={{
                marginTop: 60,
                display: "flex",
                alignItems: "center",
                gap: 20,
              }}
            >
              <div style={{ display: "flex" }}>
                {SOCIAL_PROOF_AVATARS.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Cue user"
                    width={36}
                    height={36}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      border: "2px solid var(--navy)",
                      marginLeft: i > 0 ? -10 : 0,
                      objectFit: "cover",
                      display: "block",
                    }}
                    onError={(e) => {
                      // fallback to colored circle if pravatar fails
                      e.target.style.display = "none";
                    }}
                  />
                ))}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>
                  2,400+ memories sealed
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>
                  Join people writing to the future
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            animation: "float 2s ease-in-out infinite",
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "var(--muted)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Scroll
          </span>
          <div
            style={{
              width: 1,
              height: 40,
              background:
                "linear-gradient(to bottom, var(--muted), transparent)",
            }}
          />
        </div>
      </section>

      {/* TICKER */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          overflow: "hidden",
          padding: "14px 0",
          background: "rgba(100,149,237,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            animation: "ticker 20s linear infinite",
            width: "max-content",
          }}
        >
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 60,
                paddingRight: 60,
                whiteSpace: "nowrap",
              }}
            >
              {[
                "Future Delivery",
                "Voice Notes",
                "Video Memories",
                "Photo Capsules",
                "Legacy Vaults",
                "Anniversary Letters",
                "Birthday Messages",
                "Encrypted & Secure",
              ].map((t, j) => (
                <span
                  key={j}
                  style={{
                    fontSize: 13,
                    color: "var(--muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span style={{ color: "var(--cue)", fontSize: 10 }}>◆</span>{" "}
                  {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section
        data-gsap="how-section"
        style={{
          padding: "140px 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <MeshBg variant="section" />
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <div
              style={{
                display: "inline-block",
                padding: "6px 16px",
                background: "rgba(100,149,237,0.1)",
                border: "1px solid rgba(100,149,237,0.2)",
                borderRadius: 100,
                fontSize: 12,
                color: "var(--cue)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 20,
              }}
            >
              How It Works
            </div>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(36px, 5vw, 56px)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              Three steps.
              <br />
              <em>Infinite time.</em>
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {[
              {
                n: "01",
                title: "Create",
                icon: "✦",
                desc: "Write a letter. Record your voice. Upload a photo or video. Capture the moment exactly as it feels.",
                preview: "Draft in progress...",
                accent: "#6495ED",
                accentSoft: "rgba(100,149,237,0.08)",
                accentBorder: "rgba(100,149,237,0.25)",
                tags: ["✉ Letter", "▶ Video", "♪ Voice"],
              },
              {
                n: "02",
                title: "Schedule",
                icon: "◷",
                desc: "Choose who receives it and when — a birthday, an anniversary, or a milestone years away.",
                preview: "Delivery: Dec 2029",
                accent: "#A855F7",
                accentSoft: "rgba(168,85,247,0.08)",
                accentBorder: "rgba(168,85,247,0.25)",
                tags: ["📅 Birthday", "💍 Anniversary", "🎓 Graduation"],
              },
              {
                n: "03",
                title: "Deliver",
                icon: "◎",
                desc: "Cue holds your memory safely until the exact moment arrives. Then delivers it with an experience they'll never forget.",
                preview: "✓ Memory delivered",
                accent: "#22C55E",
                accentSoft: "rgba(34,197,94,0.08)",
                accentBorder: "rgba(34,197,94,0.25)",
                tags: ["🔒 Encrypted", "⚡ On-time", "💌 Delivered"],
              },
            ].map((step, i) => (
              <div
                key={i}
                data-gsap="step"
                style={{
                  position: "relative",
                  padding: "40px 36px 36px",
                  borderRadius: 24,
                  background: step.accentSoft,
                  border: `1px solid ${step.accentBorder}`,
                  backdropFilter: "blur(20px)",
                  transition: "all 0.4s ease",
                  cursor: "default",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = `0 24px 60px ${step.accent}22`;
                  e.currentTarget.style.borderColor = step.accent + "66";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = step.accentBorder;
                }}
              >
                {/* background number watermark */}
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    right: 20,
                    fontFamily: "var(--serif)",
                    fontSize: 120,
                    fontWeight: 700,
                    color: step.accent,
                    opacity: 0.04,
                    lineHeight: 1,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  {step.n}
                </div>

                {/* step number pill */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "5px 14px",
                    borderRadius: 100,
                    background: `${step.accent}18`,
                    border: `1px solid ${step.accent}44`,
                    marginBottom: 24,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: step.accent,
                      letterSpacing: "0.1em",
                      fontWeight: 600,
                    }}
                  >
                    {step.n}
                  </span>
                  <span
                    style={{
                      width: 1,
                      height: 10,
                      background: `${step.accent}44`,
                    }}
                  />
                  <span style={{ fontSize: 13, color: step.accent }}>
                    {step.icon}
                  </span>
                </div>

                {/* title */}
                <h3
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 36,
                    letterSpacing: "-0.02em",
                    marginBottom: 14,
                    color: "var(--text)",
                  }}
                >
                  {step.title}
                </h3>

                {/* desc */}
                <p
                  style={{
                    fontSize: 15,
                    color: "var(--soft)",
                    lineHeight: 1.75,
                    marginBottom: 28,
                  }}
                >
                  {step.desc}
                </p>

                {/* tags row */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 24,
                  }}
                >
                  {step.tags.map((tag, j) => (
                    <span
                      key={j}
                      style={{
                        fontSize: 12,
                        padding: "5px 12px",
                        borderRadius: 100,
                        background: `${step.accent}12`,
                        border: `1px solid ${step.accent}30`,
                        color: step.accent,
                        fontWeight: 500,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* preview bar */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        height: 4,
                        background: "rgba(255,255,255,0.08)",
                        borderRadius: 4,
                        overflow: "hidden",
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${[40, 70, 100][i]}%`,
                          background: `linear-gradient(90deg, ${step.accent}, ${step.accent}88)`,
                          borderRadius: 4,
                          transition: "width 1s ease",
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      {step.preview}
                    </div>
                  </div>
                  {i === 2 && (
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "rgba(34,197,94,0.2)",
                        border: "1px solid rgba(34,197,94,0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        color: "#22C55E",
                        marginLeft: 12,
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        data-gsap="features-section"
        style={{ padding: "100px 40px", background: "rgba(100,149,237,0.02)" }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 20,
            }}
          >
            {FEATURES.map((f, i) => (
              <div
                key={i}
                data-gsap="feature-card"
                className="card"
                style={{
                  padding: "44px 40px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 24,
                    background: `${f.color}18`,
                    border: `1px solid ${f.color}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 28,
                    overflow: "hidden",
                  }}
                >
                  <FeatureIllustration type={f.illustration} />
                </div>
                <h3
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 24,
                    marginBottom: 14,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: 15,
                    color: "var(--soft)",
                    lineHeight: 1.7,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section
        data-gsap="use-cases-section"
        style={{
          padding: "140px 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <MeshBg variant="section" />
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <div
              style={{
                display: "inline-block",
                padding: "6px 16px",
                background: "rgba(100,149,237,0.1)",
                border: "1px solid rgba(100,149,237,0.2)",
                borderRadius: 100,
                fontSize: 12,
                color: "var(--cue)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 20,
              }}
            >
              Real Stories
            </div>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(36px, 5vw, 56px)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              Every memory deserves
              <br />
              <em>its perfect moment.</em>
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {USE_CASES.map((uc, i) => (
              <div
                key={i}
                data-gsap="use-case"
                className="card"
                style={{ padding: "32px 28px" }}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>{uc.emoji}</div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    marginBottom: 10,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {uc.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--soft)",
                    lineHeight: 1.7,
                  }}
                >
                  {uc.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section
        data-gsap="dashboard-section"
        style={{
          padding: "100px 40px",
          background: "rgba(100,149,237,0.02)",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 80,
              alignItems: "center",
            }}
          >
            <div data-gsap="dashboard-left">
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 16px",
                  background: "rgba(100,149,237,0.1)",
                  border: "1px solid rgba(100,149,237,0.2)",
                  borderRadius: 100,
                  fontSize: 12,
                  color: "var(--cue)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 20,
                }}
              >
                The Platform
              </div>
              <h2
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "clamp(32px, 4vw, 48px)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  marginBottom: 24,
                }}
              >
                Your memories,
                <br />
                <em>beautifully organized.</em>
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: "var(--soft)",
                  lineHeight: 1.7,
                  marginBottom: 36,
                }}
              >
                The Cue dashboard gives you a clear view of every capsule —
                scheduled, pending, and delivered. Create new memories in
                seconds. Organize them into vaults by person, occasion, or era.
              </p>
              <button className="btn-primary" onClick={() => setPage("signup")}>
                Explore the Dashboard
              </button>
            </div>
            <div data-gsap="dashboard-right" style={{ position: "relative" }}>
              <div
                className="glass animate-pulse-glow"
                style={{ borderRadius: 24, overflow: "hidden", padding: 20 }}
              >
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {["#FF5F57", "#FEBC2E", "#28C840"].map((c, i) => (
                    <div
                      key={i}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: c,
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 1fr",
                    gap: 12,
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {["◎ Home", "✉ Messages", "🔒 Vault", "◷ Upcoming"].map(
                      (item, i) => (
                        <div
                          key={i}
                          className={i === 0 ? "glass-bright" : ""}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 8,
                            fontSize: 11,
                            color: i === 0 ? "var(--cue)" : "var(--muted)",
                          }}
                        >
                          {item}
                        </div>
                      ),
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}
                    >
                      Upcoming Deliveries
                    </div>
                    {MOCK_MEMORIES.slice(0, 3).map((m, i) => (
                      <div
                        key={i}
                        className="glass"
                        style={{
                          padding: "10px 12px",
                          borderRadius: 10,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{ minWidth: 0, flex: 1, overflow: "hidden" }}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {m.title.slice(0, 22)}...
                          </div>
                          <div style={{ fontSize: 10, color: "var(--muted)" }}>
                            {m.deliveryDate}
                          </div>
                        </div>
                        <span
                          className={`status-badge status-${m.status.toLowerCase()}`}
                          style={{
                            fontSize: 9,
                            padding: "3px 8px",
                            flexShrink: 0,
                          }}
                        >
                          {m.status}
                        </span>
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
      <section
        style={{
          padding: "140px 40px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <MeshBg variant="hero" />
        <div
          data-gsap="waitlist"
          style={{
            maxWidth: 640,
            margin: "0 auto",
            position: "relative",
            zIndex: 2,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(40px, 6vw, 72px)",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              marginBottom: 24,
            }}
          >
            The future
            <br />
            is waiting <em>for you.</em>
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "var(--soft)",
              lineHeight: 1.7,
              marginBottom: 48,
            }}
          >
            Join thousands already writing to the future. Get early access to
            Cue and seal your first memory today.
          </p>
          {!joined ? (
            <div
              style={{
                display: "flex",
                gap: 12,
                maxWidth: 480,
                margin: "0 auto",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <input
                className="input-field"
                style={{ flex: 1, minWidth: 220 }}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="btn-primary" onClick={handleWaitlist}>
                Join Early Access
              </button>
            </div>
          ) : (
            <div
              className="glass-bright"
              style={{
                padding: "24px 40px",
                borderRadius: 16,
                display: "inline-flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <span style={{ fontSize: 24 }}>◎</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  You're on the list.
                </div>
                <div style={{ fontSize: 14, color: "var(--soft)" }}>
                  We'll reach out with your early access shortly.
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{ borderTop: "1px solid var(--border)", padding: "48px 40px" }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 24,
              marginBottom: 40,
              paddingBottom: 40,
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src={CueSvg1}
                alt="Cue"
                style={{ width: 32, height: 32, objectFit: "contain" }}
              />
              <span
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 18,
                  color: "var(--text)",
                }}
              >
                Cue
              </span>
              <span
                style={{ fontSize: 13, color: "var(--muted)", marginLeft: 8 }}
              >
                — Memories that outlive the present.
              </span>
            </div>
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              {["About", "Privacy", "Terms", "Contact"].map((l) => (
                <span
                  key={l}
                  style={{
                    fontSize: 14,
                    color: "var(--muted)",
                    cursor: "pointer",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.color = "var(--text)")}
                  onMouseLeave={(e) => (e.target.style.color = "var(--muted)")}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <a
              href="https://tayo-e.github.io/Eyitayo-portfolio/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "var(--cue)",
                textDecoration: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: "8px 16px",
                borderRadius: 8,
              }}
              onMouseEnter={(e) => {
                e.target.style.color = "var(--text)";
                e.target.style.background = "rgba(221, 221, 243, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "var(--cue)";
                e.target.style.background = "transparent";
              }}
            >
              Made by Tayo_e
            </a>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              © 2025 Cue. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ─── AUTH PAGES ───────────────────────────────────────────────────────────────
const AuthPage = ({ type, setPage, setIsLoggedIn, setUserName }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    plan: "free",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

 const handleSubmit = async () => {
  setError("");
  if (!form.email || !form.password) { setError("Please fill all fields."); return; }
  if (type === "signup" && !form.name) { setError("Please enter your name."); return; }

  setLoading(true);
  try {
    if (type === "signup") {
      const result = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(result.user, { displayName: form.name });
      await sendEmailVerification(result.user);

await setDoc(doc(db, "users", result.user.uid), {
  name: form.name,
  email: form.email,
  plan: form.plan,
  billingStatus: form.plan === "premium" ? "stripe_pending" : "free",
  maxScheduleYears: PLAN_LIMITS[form.plan].maxYears,
  welcomeEmailSent: false,
  createdAt: serverTimestamp(),
});

      try {
        const fns = getFunctions();
        const sendWelcome = httpsCallable(fns, "sendWelcomeEmail");
        await sendWelcome({ email: form.email, name: form.name });
      } catch (err) {
        console.log("Welcome email failed silently:", err);
      }

      setIsLoggedIn(true);
      setUserName(form.name);
      setPage("dashboard");

    } else {
      const result = await signInWithEmailAndPassword(auth, form.email, form.password);
      setIsLoggedIn(true);
      setUserName(result.user.displayName || result.user.email.split("@")[0]);
      setPage("dashboard");
    }
  } catch (err) {
    setError(err.message.replace("Firebase: ", ""));
  }
  setLoading(false);
};

  const handleGoogle = async () => {
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const isNewUser = result._tokenResponse?.isNewUser;
  if (isNewUser) {
    await setDoc(doc(db, "users", result.user.uid), {
      name: result.user.displayName || "Friend",
      email: result.user.email,
      plan: "free",
      billingStatus: "free",
      maxScheduleYears: PLAN_LIMITS.free.maxYears,
      welcomeEmailSent: false,
      createdAt: serverTimestamp(),
    });

    try {
      const functions = getFunctions();
      const sendWelcome = httpsCallable(functions, "sendWelcomeEmail");
      await sendWelcome({ 
        email: result.user.email, 
        name: result.user.displayName || "Friend" 
      });
    } catch (err) {
      console.log("Welcome email failed silently:", err);
    }
  }

      setIsLoggedIn(true);
      setUserName(result.user.displayName || result.user.email.split("@")[0]);
      setPage("dashboard");
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
  };

  const handleForgotPassword = async () => {
    if (!form.email) {
      setError("Enter your email above first.");
      return;
    }
    await sendPasswordResetEmail(auth, form.email);
    setResetSent(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <MeshBg variant="hero" />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(100,149,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(100,149,237,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          padding: "0 24px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          className="glass auth-card"
          style={{ borderRadius: 28, padding: "52px 48px" }}
        >
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <img
              src={CueSvg1}
              alt="Cue"
              style={{
                width: 64,
                height: 64,
                objectFit: "contain",
                margin: "0 auto 16px",
              }}
            />
            <h1
              style={{
                fontFamily: "var(--serif)",
                fontSize: 28,
                letterSpacing: "-0.01em",
                marginBottom: 8,
              }}
            >
              {type === "login" ? "Welcome back." : "Begin your story."}
            </h1>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>
              {type === "login"
                ? "Your memories are waiting."
                : "Create your first time capsule today."}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 28,
            }}
          >
            {[
              { Icon: GoogleSvg, label: "Google" },
              { Icon: AppleSvg, label: "Apple" },
            ].map((s) => {
              const Icon = s.Icon;
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={s.label === "Google" ? handleGoogle : undefined}
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
                  {Icon && (
                    <Icon
                      style={{ width: 20, height: 20, flexShrink: 0 }}
                      aria-hidden
                    />
                  )}
                  {s.label}
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 28,
            }}
          >
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 12, color: "var(--muted)" }}>
              or continue with email
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {type === "signup" && (
              <input
                className="input-field"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            )}
            <input
              className="input-field"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="input-field"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />

            {type === "signup" && (
              <div style={{ display: "grid", gap: 10 }}>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Choose your plan
                </div>
                {[
                  {
                    id: "free",
                    title: "Free",
                    price: "$0",
                    detail: "Schedule Cues up to 10 years ahead.",
                  },
                  {
                    id: "premium",
                    title: "Premium",
                    price: "$8/mo",
                    detail: "Unlock 50-year delivery and future Stripe billing.",
                  },
                ].map((plan) => {
                  const selected = form.plan === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setForm({ ...form, plan: plan.id })}
                      className="plan-option"
                      style={{
                        border: `1px solid ${selected ? "var(--cue)" : "var(--border)"}`,
                        background: selected
                          ? "rgba(100,149,237,0.12)"
                          : "rgba(255,255,255,0.03)",
                        color: "var(--text)",
                        borderRadius: 14,
                        padding: "14px 16px",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "grid",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          fontWeight: 700,
                        }}
                      >
                        <span>{plan.title}</span>
                        <span style={{ color: selected ? "var(--cue)" : "var(--soft)" }}>
                          {plan.price}
                        </span>
                      </span>
                      <span style={{ color: "var(--muted)", fontSize: 12 }}>
                        {plan.detail}
                      </span>
                    </button>
                  );
                })}
                {form.plan === "premium" && (
                  <div style={{ fontSize: 12, color: "var(--soft)", lineHeight: 1.5 }}>
                    Stripe checkout can be connected to this plan with a
                    customer session and webhook before launch.
                  </div>
                )}
              </div>
            )}

            {error && (
              <div
                style={{ fontSize: 13, color: "#F87171", textAlign: "center" }}
              >
                {error}
              </div>
            )}

            {type === "login" && (
              <div style={{ textAlign: "right" }}>
                {resetSent ? (
                  <span style={{ fontSize: 13, color: "#22C55E" }}>
                    Reset email sent ✓
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--cue)",
                      cursor: "pointer",
                    }}
                    onClick={handleForgotPassword}
                  >
                    Forgot password?
                  </span>
                )}
              </div>
            )}

            <button
              className="btn-primary"
              style={{
                width: "100%",
                marginTop: 8,
                padding: "15px",
                borderRadius: 12,
                fontSize: 16,
              }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  {type === "login" ? "Signing in..." : "Creating account..."}
                </span>
              ) : type === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: 28,
              fontSize: 14,
              color: "var(--muted)",
            }}
          >
            {type === "login" ? (
              <>
                Don't have an account?{" "}
                <span
                  style={{ color: "var(--cue)", cursor: "pointer" }}
                  onClick={() => setPage("signup")}
                >
                  Sign up
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span
                  style={{ color: "var(--cue)", cursor: "pointer" }}
                  onClick={() => setPage("login")}
                >
                  Sign in
                </span>
              </>
            )}
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <span
            style={{ fontSize: 13, color: "var(--muted)", cursor: "pointer" }}
            onClick={() => setPage("landing")}
          >
            ← Back to home
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── DASHBOARD SIDEBAR ────────────────────────────────────────────────────────
const Sidebar = ({ active, setActive, userName }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { id: "overview", icon: "◎", label: "Overview" },
    { id: "memories", icon: "✉", label: "Memories" },
    { id: "vault", icon: "◈", label: "Vault" },
    { id: "create", icon: "+", label: "New Cue", isPrimary: true },
  ];

  const NavButton = ({ l }) => (
    <button
      onClick={() => {
        setActive(l.id);
        setMobileOpen(false);
      }}
      className={l.isPrimary ? "btn-primary" : ""}
      style={
        l.isPrimary
          ? {
              borderRadius: 12,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 14,
              marginTop: 8,
              width: "100%",
            }
          : {
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontFamily: "var(--sans)",
              fontWeight: 500,
              width: "100%",
              background:
                active === l.id ? "rgba(100,149,237,0.1)" : "transparent",
              color: active === l.id ? "var(--cue)" : "var(--soft)",
              borderLeft:
                active === l.id
                  ? "2px solid var(--cue)"
                  : "2px solid transparent",
              transition: "all 0.2s ease",
              WebkitTapHighlightColor: "transparent",
            }
      }
    >
      <span style={{ fontSize: 16 }}>{l.icon}</span>
      <span>{l.label}</span>
    </button>
  );

  return (
    <>
      {/* ── MOBILE TOP BAR ── */}
      <div
        className="mobile-topbar"
        style={{
          padding: "0 20px",
          height: 60,
          background: "rgba(10,15,30,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={CueSvg1}
            alt="Cue"
            style={{ width: 30, height: 30, objectFit: "contain" }}
          />
          <span
            style={{
              fontFamily: "var(--serif)",
              fontSize: 18,
              color: "var(--text)",
            }}
          >
            Cue
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Clean avatar circle */}
          <div
            style={{
              width: 34,
              height: 34,
              background: "linear-gradient(135deg, #6495ED, #7C3AED)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 14,
              color: "white",
              flexShrink: 0,
              lineHeight: 1,
            }}
          >
            {(userName || "U").charAt(0).toUpperCase()}
          </div>
          {/* Hamburger/X toggle */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              cursor: "pointer",
              color: "var(--text)",
              fontSize: 18,
              padding: "6px 10px",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 199, display: "flex" }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
            }}
          />
          {/* Drawer panel */}
          <div
            className="glass"
            style={{
              position: "relative",
              width: 260,
              height: "100%",
              padding: "20px 16px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              zIndex: 1,
              animation: "fadeIn 0.2s ease",
            }}
          >
            {/* ── Drawer header with explicit X button ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
                paddingBottom: 16,
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img
                  src={CueSvg1}
                  alt="Cue"
                  style={{ width: 28, height: 28, objectFit: "contain" }}
                />
                <span
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 17,
                    color: "var(--text)",
                  }}
                >
                  Cue
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--soft)",
                  fontSize: 16,
                  cursor: "pointer",
                  padding: "6px 10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                ✕
              </button>
            </div>

            {links.map((l) => (
              <NavButton key={l.id} l={l} />
            ))}

            <div style={{ flex: 1 }} />

            {/* User block inside drawer */}
            <div
              style={{
                padding: "14px 16px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    background: "linear-gradient(135deg, #6495ED, #7C3AED)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "white",
                    flexShrink: 0,
                  }}
                >
                  {(userName || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--text)",
                    }}
                  >
                    {userName}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    Early Access
                  </div>
                </div>
              </div>
              <button
                onClick={async () => {
                  await signOut(auth);
                  window.location.href = "/";
                }}
                style={{
                  width: "100%",
                  padding: "9px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--muted)",
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "var(--sans)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = "#F87171";
                  e.target.style.color = "#F87171";
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.color = "var(--muted)";
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP SIDEBAR ── */}
      <div
        className="glass dashboard-sidebar"
        style={{
          width: 220,
          minHeight: "100vh",
          padding: "32px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          borderRight: "1px solid var(--border)",
          borderRadius: 0,
          borderLeft: "none",
          borderTop: "none",
          borderBottom: "none",
          flexShrink: 0,
        }}
      >
        <div
          className="sidebar-logo"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <img
            src={CueSvg1}
            alt="Cue"
            style={{ width: 36, height: 36, objectFit: "contain" }}
          />
          <span
            style={{
              fontFamily: "var(--serif)",
              fontSize: 20,
              color: "var(--text)",
            }}
          >
            Cue
          </span>
        </div>

        {links.map((l) => (
          <NavButton key={l.id} l={l} />
        ))}

        <div style={{ flex: 1 }} />

        <div
          className="sidebar-user"
          style={{
            padding: "14px 16px",
            borderRadius: 14,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                background: "linear-gradient(135deg, #6495ED, #7C3AED)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
                color: "white",
                flexShrink: 0,
              }}
            >
              {(userName || "U").charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--text)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userName}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                Early Access
              </div>
            </div>
          </div>
          <button
            onClick={async () => {
              await signOut(auth);
              window.location.href = "/";
            }}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--muted)",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "var(--sans)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = "#F87171";
              e.target.style.color = "#F87171";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "var(--border)";
              e.target.style.color = "var(--muted)";
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
const OverviewTab = ({ setActive, memories, userName }) => {
  const stats = [
    { label: "Total Memories", value: memories.length, icon: "◎" },
    {
      label: "Scheduled",
      value: memories.filter((m) => m.status === "Scheduled").length,
      icon: "◷",
    },
    {
      label: "Delivered",
      value: memories.filter((m) => m.status === "Delivered").length,
      icon: "✓",
    },
    {
      label: "Pending",
      value: memories.filter((m) => m.status === "Pending").length,
      icon: "⋯",
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
          Good morning,
        </div>
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: 42,
            letterSpacing: "-0.02em",
            marginBottom: 8,
          }}
        >
          {userName}.
        </h1>
        <p style={{ fontSize: 15, color: "var(--soft)" }}>
          You have {memories.filter((m) => m.status !== "Delivered").length}{" "}
          memories sealed and waiting.
        </p>
      </div>

      <div
        className="stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 16,
          marginBottom: 40,
        }}
      >
        {stats.map((s, i) => (
          <div key={i} className="card" style={{ padding: "28px 24px" }}>
            <div
              style={{ fontSize: 24, color: "var(--cue)", marginBottom: 12 }}
            >
              {s.icon}
            </div>
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: 36,
                marginBottom: 4,
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>


        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <h2 style={{ fontFamily: "var(--serif)", fontSize: 22 }}>
              Recent Memories
            </h2>
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--cue)",
                fontSize: 13,
              }}
              onClick={() => setActive("memories")}
            >
              View all →
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {memories.slice(0, 3).map((m) => (
              <MemoryRow key={m.id} memory={m} compact />
            ))}
          </div>
        </div>

        <div
          className="card glass-bright"
          style={{
            padding: "36px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 16,
            cursor: "pointer",
          }}
          onClick={() => setActive("create")}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, rgba(100,149,237,0.2), rgba(124,58,237,0.2))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              color: "var(--cue)",
            }}
          >
            +
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: 22,
                marginBottom: 8,
              }}
            >
              Seal a New Memory
            </div>
            <div style={{ fontSize: 14, color: "var(--soft)" }}>
              Capture a moment and send it forward in time.
            </div>
          </div>
          <button className="btn-primary" style={{ padding: "12px 28px" }}>
            Create Cue
          </button>
        </div>
      
    </div>
  );
};

// ─── MEMORY ROW (mobile-fixed) ────────────────────────────────────────────────
const MemoryRow = ({ memory: m, compact }) => {
  const typeIcons = { letter: "✉", video: "▶", voice: "♪", photo: "◎" };
  const days = daysUntil(m.deliveryDate);

  const handleDelete = async () => {
    // Use toast instead of window.confirm
    toast("Hold to confirm — tap Delete again to remove.", "warn");
    // Simple double-confirm pattern: store pending id, or just delete directly.
    // For simplicity keeping a brief confirm:
    const ok = window.confirm("Delete this memory?");
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "memories", m.id));
      toast("Memory deleted.", "success");
    } catch (err) {
      console.error(err);
      toast("Failed to delete. Try again.", "error");
    }
  };

  const handleEdit = async () => {
    const newTitle = prompt("Edit memory title", m.title);
    if (!newTitle || newTitle === m.title) return;
    try {
      await updateDoc(doc(db, "memories", m.id), { title: newTitle });
      toast("Memory updated.", "success");
    } catch (err) {
      console.error(err);
      toast("Failed to update. Try again.", "error");
    }
  };

  return (
    <div
      className="card memory-row-card"
      style={{ padding: compact ? "14px 16px" : "20px 20px" }}
    >
      {/* Top row: icon + text + status */}
      <div className="memory-row-inner">
        <div
          style={{
            width: 38,
            height: 38,
            flexShrink: 0,
            borderRadius: 10,
            background:
              "linear-gradient(135deg, rgba(100,149,237,0.2), rgba(124,58,237,0.2))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            color: "var(--cue)",
          }}
        >
          {typeIcons[m.type] || "◎"}
        </div>

        <div className="memory-row-text">
          <div className="memory-row-title">{m.title}</div>
          <div className="memory-row-sub">
            {m.recipient === "self" ? "To: Yourself" : `To: ${m.recipient}`}
            {" · "}
            {formatDate(m.deliveryDate)}
            {m.fileName && ` · 📎 ${m.fileName}`}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 4,
            flexShrink: 0,
          }}
        >
          <span className={`status-badge status-${m.status.toLowerCase()}`}>
            {m.status}
          </span>
          {m.status !== "Delivered" && (
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              {days > 0 ? `${days}d away` : "Today"}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons — separate row, full-width on mobile, only in non-compact mode */}
      {!compact && (
        <div className="memory-row-actions">
          <button
            onClick={handleEdit}
            style={{
              background: "transparent",
              border: "1px solid var(--cue)",
              color: "var(--cue)",
              padding: "7px 14px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "var(--sans)",
              transition: "all 0.2s",
            }}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            style={{
              background: "transparent",
              border: "1px solid #F87171",
              color: "#F87171",
              padding: "7px 14px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "var(--sans)",
              transition: "all 0.2s",
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

// ─── MEMORIES TAB ─────────────────────────────────────────────────────────────
const MemoriesTab = ({ memories }) => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const filters = ["All", "Scheduled", "Pending", "Delivered"];

  const filtered = memories
    .filter((m) => filter === "All" || m.status === filter)
    .filter(
      (m) =>
        !search ||
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.recipient.toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: 36,
            letterSpacing: "-0.02em",
          }}
        >
          My Memories
        </h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 18px",
                borderRadius: 100,
                border: "1px solid",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "var(--sans)",
                fontWeight: 500,
                background: filter === f ? "var(--cue)" : "transparent",
                borderColor: filter === f ? "var(--cue)" : "var(--border)",
                color: filter === f ? "white" : "var(--soft)",
                transition: "all 0.2s",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <span
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--muted)",
            fontSize: 15,
            pointerEvents: "none",
          }}
        >
          🔍
        </span>
        <input
          className="input-field"
          placeholder="Search memories by title or recipient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 44 }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((m) => (
          <MemoryRow key={m.id} memory={m} />
        ))}
        {filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              color: "var(--muted)",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 16 }}>◎</div>
            <div style={{ fontSize: 16 }}>
              No {filter.toLowerCase()} memories
              {search ? ` matching "${search}"` : ""} yet.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── CREATE MEMORY ────────────────────────────────────────────────────────────
const CreateMemory = ({ setActive, addMemory, accountPlan = "free" }) => {
  const [form, setForm] = useState({
    title: "",
    message: "",
    recipient: "",
    deliveryDate: "",
    deliveryTime: "09:00",
    type: "letter",
  });
  const [step, setStep] = useState(1);
  const [sealed, setSealed] = useState(false);
  const [sealing, setSealing] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const fileInputRef = useRef(null);
  const planLimit = PLAN_LIMITS[accountPlan] || PLAN_LIMITS.free;
  const todayInput = toDateInputValue(new Date());
  const maxDeliveryDate = toDateInputValue(addYears(new Date(), planLimit.maxYears));
  const selectedDateTooFar =
    form.deliveryDate && form.deliveryDate > maxDeliveryDate;

  const update = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setUploadError("File must be under 500MB.");
      return;
    }
    if (!isAllowedAttachment(file)) {
      setUploadError("Unsupported file type. Use JPG, PNG, MP4, MOV, or MP3.");
      return;
    }
    setUploadError("");
    setAttachment(file);
  };

  const clearAttachment = () => {
    setAttachment(null);
    setUploadError("");
  };

  const handleSeal = async () => {
    if (!auth.currentUser) {
      setUploadError("You must be logged in.");
      return;
    }
    if (!form.title || !form.message || !form.deliveryDate || !form.recipient)
      return;
    if (selectedDateTooFar) {
      setUploadError(
        `${planLimit.label} accounts can schedule up to ${planLimit.maxYears} years ahead.`,
      );
      return;
    }
    setUploadError("");
    setSealing(true);

    try {
      let fileUrl = null,
        fileName = null,
        fileMimeType = null;

      if (attachment) {
        const { ref, uploadBytes, getDownloadURL } =
          await import("firebase/storage");
        const { storage } = await import("./firebase");
        const storageRef = ref(
          storage,
          `memories/${auth.currentUser.uid}/${Date.now()}-${attachment.name}`,
        );
        const snapshot = await uploadBytes(storageRef, attachment);
        fileUrl = await getDownloadURL(snapshot.ref);
        fileName = attachment.name;
        fileMimeType = attachment.type;
      }

      const deliveryDateTime = new Date(
        `${form.deliveryDate}T${form.deliveryTime || "09:00"}`,
      );
      const memoryData = {
        title: form.title,
        message: form.message,
        recipient: form.recipient,
        type: form.type,
        status: "Scheduled",
        scheduledAt: Timestamp.fromDate(deliveryDateTime),
        createdAt: serverTimestamp(),
        preview: form.message.slice(0, 80),
        userId: auth.currentUser.uid,
        accountPlan,
        ...(fileUrl && { fileUrl, fileName, fileMimeType }),
      };

      await addDoc(collection(db, "memories"), memoryData);
      setShowConfetti(true);
      setSealed(true);
      toast("Memory sealed! ✓", "success");
      setTimeout(() => setActive("memories"), 2200);
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadError(err.message || "Upload failed. Please try again.");
      setSealing(false);
    }
  };

  if (sealed)
    return (
      <>
        <SealConfetti active={showConfetti} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            textAlign: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              background: "linear-gradient(135deg, #6495ED, #7C3AED)",
              clipPath:
                "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
              animation: "float 3s ease-in-out infinite",
              filter: "drop-shadow(0 0 20px rgba(100,149,237,0.5))",
            }}
          />
          <div>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: 40,
                marginBottom: 12,
              }}
            >
              Memory Sealed.
            </h2>
            <p style={{ fontSize: 16, color: "var(--soft)" }}>
              Your Cue is traveling to {formatDate(form.deliveryDate)}.
            </p>
          </div>
          <div
            className="glass-bright"
            style={{
              padding: "16px 32px",
              borderRadius: 100,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#22C55E",
                boxShadow: "0 0 8px #22C55E",
                display: "block",
              }}
            />
            <span style={{ fontSize: 14 }}>Scheduled for delivery</span>
          </div>
        </div>
      </>
    );

  return (
    <div style={{ maxWidth: "90vw", margin: "0 auto", width: "100%" }}>
      <h1
        style={{
          fontFamily: "var(--serif)",
          fontSize: 38,
          letterSpacing: "-0.02em",
          marginBottom: 8,
        }}
      >
        New Memory
      </h1>
      <p style={{ fontSize: 15, color: "var(--muted)", marginBottom: 40 }}>
        Seal a moment in time. Deliver it when it matters most.
      </p>

      <div
        style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 40 }}
      >
        {["Compose", "Schedule", "Seal"].map((s, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
            }}
            onClick={() => setStep(i + 1)}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background:
                  step > i
                    ? "linear-gradient(135deg, #6495ED, #7C3AED)"
                    : step === i + 1
                      ? "rgba(100,149,237,0.2)"
                      : "var(--surface)",
                border: `1px solid ${step >= i + 1 ? "var(--cue)" : "var(--border)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                color: step >= i + 1 ? "white" : "var(--muted)",
                transition: "all 0.3s",
              }}
            >
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span
              style={{
                fontSize: 12,
                color: step === i + 1 ? "var(--cue)" : "var(--muted)",
                fontWeight: step === i + 1 ? 500 : 400,
              }}
            >
              {s}
            </span>
          </div>
        ))}
      </div>

      <div className="glass" style={{ borderRadius: 24, padding: "40px" }}>
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label
                style={{
                  fontSize: 13,
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                MEMORY TYPE
              </label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  { v: "letter", label: "✉ Letter" },
                  { v: "video", label: "▶ Video" },
                  { v: "voice", label: "♪ Voice" },
                  { v: "photo", label: "◎ Photo" },
                ].map((t) => (
                  <button
                    key={t.v}
                    onClick={() => update("type", t.v)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: 10,
                      border: "1px solid",
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "var(--sans)",
                      background:
                        form.type === t.v
                          ? "rgba(100,149,237,0.15)"
                          : "transparent",
                      borderColor:
                        form.type === t.v ? "var(--cue)" : "var(--border)",
                      color: form.type === t.v ? "var(--cue)" : "var(--soft)",
                      transition: "all 0.2s",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label
                style={{
                  fontSize: 13,
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                TITLE
              </label>
              <input
                className="input-field"
                placeholder="Give your memory a name..."
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 13,
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                MESSAGE
              </label>
              <textarea
                className="input-field"
                placeholder="Write your message to the future..."
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                rows={7}
                style={{ fontFamily: "var(--sans)", lineHeight: 1.7 }}
              />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.mp4,.mov,.mp3,.m4a,.wav,image/jpeg,image/png,video/mp4,video/quicktime,audio/mpeg,audio/mp3,audio/wav"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) =>
                e.key === "Enter" && fileInputRef.current?.click()
              }
              style={{
                border: `2px dashed ${attachment ? "var(--cue)" : "var(--border)"}`,
                borderRadius: 14,
                padding: attachment ? "20px 24px" : "32px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                background: attachment
                  ? "rgba(100,149,237,0.06)"
                  : "transparent",
              }}
            >
              {attachment ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    textAlign: "left",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        color: "var(--text)",
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {attachment.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        marginTop: 4,
                      }}
                    >
                      {(attachment.size / (1024 * 1024)).toFixed(1)} MB · Ready
                      to upload on seal
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ padding: "8px 14px", fontSize: 12, flexShrink: 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAttachment();
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      fontSize: 28,
                      color: "var(--muted)",
                      marginBottom: 10,
                    }}
                  >
                    ↑
                  </div>
                  <div style={{ fontSize: 14, color: "var(--soft)" }}>
                    Attach photos or videos
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      marginTop: 4,
                    }}
                  >
                    Up to 500MB · JPG, PNG, MP4, MOV, MP3
                  </div>
                </>
              )}
            </div>
            {uploadError && step === 1 && (
              <div style={{ fontSize: 13, color: "#F87171" }}>
                {uploadError}
              </div>
            )}
            <button
              className="btn-primary"
              style={{ alignSelf: "flex-end", padding: "13px 36px" }}
              onClick={() => setStep(2)}
              disabled={!form.title || !form.message}
            >
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label
                style={{
                  fontSize: 13,
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                RECIPIENT
              </label>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 12,
                  flexWrap: "wrap",
                }}
              >
                {["self", "someone"].map((r) => (
                  <button
                    key={r}
                    onClick={() =>
                      update("recipient", r === "self" ? "self" : "")
                    }
                    style={{
                      padding: "10px 20px",
                      borderRadius: 10,
                      border: "1px solid",
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "var(--sans)",
                      background: (
                        r === "self"
                          ? form.recipient === "self"
                          : form.recipient !== "self" && form.recipient
                      )
                        ? "rgba(100,149,237,0.15)"
                        : "transparent",
                      borderColor: (
                        r === "self"
                          ? form.recipient === "self"
                          : form.recipient !== "self" && form.recipient
                      )
                        ? "var(--cue)"
                        : "var(--border)",
                      color: "var(--soft)",
                      transition: "all 0.2s",
                    }}
                  >
                    {r === "self" ? "To Yourself" : "To Someone Else"}
                  </button>
                ))}
              </div>
              {form.recipient !== "self" && (
                <input
                  className="input-field"
                  type="email"
                  placeholder="recipient@email.com"
                  value={form.recipient}
                  onChange={(e) => update("recipient", e.target.value)}
                />
              )}
            <div>
              <label
                style={{
                  fontSize: 13,
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                DELIVERY DATE
              </label>
              <input
                className="input-field schedule-input"
                type="date"
                value={form.deliveryDate}
                min={todayInput}
                max={maxDeliveryDate}
                onChange={(e) => update("deliveryDate", e.target.value)}
              />
              <div
                style={{
                  fontSize: 12,
                  color: selectedDateTooFar ? "#F87171" : "var(--muted)",
                  marginTop: 6,
                }}
              >
                {planLimit.label} accounts can schedule through{" "}
                {formatDate(maxDeliveryDate)}.
              </div>

               <div style={{ marginTop: 16 }}>
                    <label
                      style={{
                        fontSize: 13,
                        color: "var(--muted)",
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      DELIVERY TIME
                    </label>
                    <input
                      className="input-field schedule-input"
                      type="time"
                      value={form.deliveryTime}
                      onChange={(e) => update("deliveryTime", e.target.value)}
                    />
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        marginTop: 6,
                      }}
                    >
                      The memory will be delivered at this exact time on the
                      chosen date.
                    </div>
                  </div>
              {form.deliveryDate && (
                <>
                  <div
                    style={{ marginTop: 10, fontSize: 13, color: "var(--cue)" }}
                  >
                    ◎ Delivering in {daysUntil(form.deliveryDate)} days ·{" "}
                    {formatDate(form.deliveryDate)}
                  </div>
                 
                </>
              )}
            </div>
            </div>
            {form.deliveryDate && (
              <div
                className="glass-bright"
                style={{ padding: "20px", borderRadius: 14 }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Preview
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                  {form.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--soft)",
                    marginBottom: 10,
                  }}
                >
                  {form.message.slice(0, 100)}...
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    fontSize: 12,
                    color: "var(--muted)",
                    flexWrap: "wrap",
                  }}
                >
                  <span>
                    To:{" "}
                    {form.recipient === "self"
                      ? "Yourself"
                      : form.recipient || "—"}
                  </span>
                  <span>Delivers: {formatDate(form.deliveryDate)}</span>
                </div>
              </div>
            )}
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <button
                className="btn-ghost"
                style={{ padding: "13px 28px" }}
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
              <button
                className="btn-primary"
                style={{ padding: "13px 36px" }}
                onClick={() => setStep(3)}
                disabled={!form.deliveryDate || !form.recipient || selectedDateTooFar}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 28,
            }}
          >
            <img
              src={CueSvg1}
              alt="Cue"
              style={{
                width: 100,
                height: 100,
                objectFit: "contain",
                animation: "float 4s ease-in-out infinite",
                filter: "drop-shadow(0 0 20px rgba(100,149,237,0.5))",
              }}
            />
            <div>
              <h2
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 32,
                  letterSpacing: "-0.01em",
                  marginBottom: 12,
                }}
              >
                Ready to seal.
              </h2>
              <p
                style={{
                  fontSize: 15,
                  color: "var(--soft)",
                  lineHeight: 1.7,
                  maxWidth: 420,
                }}
              >
                Your memory{" "}
                <strong style={{ color: "var(--text)" }}>{form.title}</strong>{" "}
                will be delivered to{" "}
                {form.recipient === "self" ? "you" : form.recipient} on{" "}
                <strong style={{ color: "var(--cue)" }}>
                  {formatDate(form.deliveryDate)}
                </strong>
                .
              </p>
            </div>
            <div
              style={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
              }}
            >
              {[
                ["Type", form.type],
                [
                  "Recipient",
                  form.recipient === "self"
                    ? "Yourself"
                    : form.recipient?.split("@")[0] || "—",
                ],
                ["Days Away", `${daysUntil(form.deliveryDate)}d`],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="glass"
                  style={{ padding: "16px", borderRadius: 12 }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                      marginBottom: 4,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {k}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <button
                className="btn-ghost"
                style={{ padding: "14px 32px" }}
                onClick={() => setStep(2)}
                disabled={sealing}
              >
                ← Revise
              </button>
              <button
                className="btn-primary"
                style={{
                  padding: "14px 48px",
                  fontSize: 16,
                  letterSpacing: "0.02em",
                }}
                onClick={handleSeal}
                disabled={sealing}
              >
                {sealing
                  ? attachment
                    ? "Uploading & sealing…"
                    : "Sealing…"
                  : "Seal Cue ◎"}
              </button>
            </div>
            {uploadError && step === 3 && (
              <div style={{ fontSize: 13, color: "#F87171" }}>
                {uploadError}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── VAULT TAB ────────────────────────────────────────────────────────────────
const VaultTab = ({ memories }) => (
  <div>
    <h1
      style={{
        fontFamily: "var(--serif)",
        fontSize: 36,
        letterSpacing: "-0.02em",
        marginBottom: 8,
      }}
    >
      Memory Vault
    </h1>
    <p style={{ fontSize: 15, color: "var(--muted)", marginBottom: 40 }}>
      Your sealed memories, organized and preserved.
    </p>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 20,
      }}
    >
      {[
        {
          label: "Personal",
          icon: "◎",
          memories: memories.filter((m) => m.recipient === "self"),
          color: "#6495ED",
        },
        {
          label: "Family",
          icon: "🏛",
          memories: memories.filter((m) => m.recipient?.includes("family")),
          color: "#7C3AED",
        },
        {
          label: "Love",
          icon: "♡",
          memories: memories.filter(
            (m) =>
              m.recipient?.includes("love") || m.recipient?.includes("sarah"),
          ),
          color: "#EC4899",
        },
      ].map((v, i) => (
        <div key={i} className="card" style={{ padding: "32px 28px" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: `${v.color}22`,
              border: `1px solid ${v.color}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              marginBottom: 20,
            }}
          >
            {v.icon}
          </div>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: 22,
              marginBottom: 6,
            }}
          >
            {v.label}
          </div>
          <div
            style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20 }}
          >
            {v.memories.length}{" "}
            {v.memories.length === 1 ? "memory" : "memories"}
          </div>
          <div
            style={{
              height: 4,
              background: "var(--border)",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: `linear-gradient(90deg, ${v.color}, ${v.color}88)`,
                width: `${Math.min(v.memories.length * 25, 100)}%`,
                borderRadius: 4,
              }}
            />
          </div>
        </div>
      ))}
      <div
        className="card"
        style={{
          padding: "32px 28px",
          border: "2px dashed var(--border)",
          background: "transparent",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--cue)")}
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = "var(--border)")
        }
      >
        <div style={{ fontSize: 32, color: "var(--muted)" }}>+</div>
        <div style={{ fontSize: 14, color: "var(--muted)" }}>New Vault</div>
      </div>
    </div>
  </div>
);

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const Dashboard = ({ userName, memories, addMemory, accountPlan }) => {
  const [active, setActive] = useState("overview");
  return (
    <div
      className="dashboard-layout"
      style={{ display: "flex", minHeight: "100vh" }}
    >
      <Sidebar active={active} setActive={setActive} userName={userName} />
      <div
        className="dashboard-content"
        style={{ flex: 1, padding: "48px 52px", overflowY: "auto" }}
      >
        {active === "overview" && (
          <OverviewTab
            setActive={setActive}
            memories={memories}
            userName={userName}
          />
        )}
        {active === "memories" && <MemoriesTab memories={memories} />}
        {active === "vault" && <VaultTab memories={memories} />}
        {active === "create" && (
          <CreateMemory
            setActive={setActive}
            addMemory={addMemory}
            accountPlan={accountPlan}
          />
        )}
      </div>
    </div>
  );
};

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing");
  const [userName, setUserName] = useState("Friend");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [memories, setMemories] = useState([]);
  const [accountPlan, setAccountPlan] = useState("free");

  // ── LENIS SMOOTH SCROLL ──
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Double rAF + timeout guarantees DOM is painted AND Lenis is synced
    // before ScrollTrigger measures element positions
    let timer;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        timer = setTimeout(() => {
          ScrollTrigger.refresh();
        }, 200);
      });
    });

    return () => {
      clearTimeout(timer);
      lenis.destroy();
    };
  }, []);

  const CursorHalo = () => {
    const haloRef = useRef(null);

    useEffect(() => {
      const halo = haloRef.current;
      if (!halo) return;

      let mouseX = 0,
        mouseY = 0;
      let haloX = 0,
        haloY = 0;
      let raf;

      const onMove = (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      };

      const animate = () => {
        // Smooth lerp follow
        haloX += (mouseX - haloX) * 0.12;
        haloY += (mouseY - haloY) * 0.12;
        halo.style.transform = `translate(${haloX - 200}px, ${haloY - 200}px)`;
        raf = requestAnimationFrame(animate);
      };

      window.addEventListener("mousemove", onMove);
      raf = requestAnimationFrame(animate);

      return () => {
        window.removeEventListener("mousemove", onMove);
        cancelAnimationFrame(raf);
      };
    }, []);

    return (
      <div
        ref={haloRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 400,
          height: 400,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9997,
          background:
            "radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.025) 35%, transparent 70%)",
          willChange: "transform",
        }}
      />
    );
  };

  // ── FIREBASE AUTH ──
  useEffect(() => {
    import("firebase/auth").then(({ getRedirectResult }) => {
      getRedirectResult(auth)
        .then((result) => {
          if (result?.user) {
            setIsLoggedIn(true);
            setUserName(
              result.user.displayName || result.user.email.split("@")[0],
            );
            setPage("dashboard");
          }
        })
        .catch(() => {});
    });

    let unsubscribeFirestore = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }

      if (currentUser) {
        setIsLoggedIn(true);
        setUserName(currentUser.displayName || currentUser.email.split("@")[0]);
        try {
          const userSnap = await getDoc(doc(db, "users", currentUser.uid));
          setAccountPlan(userSnap.data()?.plan || "free");
        } catch (err) {
          console.log("Could not load user plan:", err);
          setAccountPlan("free");
        }

        const q = query(
          collection(db, "memories"),
          where("userId", "==", currentUser.uid),
        );

        unsubscribeFirestore = onSnapshot(q, (snapshot) => {
          const realMemories = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            deliveryDate:
              d.data().scheduledAt?.toDate?.()?.toISOString().split("T")[0] ||
              d.data().deliveryDate ||
              "",
          }));
          setMemories(realMemories);
        });

        setPage((p) =>
          p === "landing" || p === "login" || p === "signup" ? "dashboard" : p,
        );
      } else {
        setIsLoggedIn(false);
        setMemories([]);
        setAccountPlan("free");
        setPage("landing");
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  const addMemory = (m) => setMemories((prev) => [m, ...prev]);

  const handleLogout = async () => {
    await signOut(auth);
    setIsLoggedIn(false);
    setPage("landing");
  };

  return (
    <>
      <GlobalStyles />
      <div className="noise-overlay" />
      <CursorHalo />
      <ToastContainer />

      {page !== "dashboard" && (
        <Nav
          page={page}
          setPage={setPage}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={handleLogout}
        />
      )}

      {page === "landing" && <LandingPage setPage={setPage} />}
      {page === "login" && (
        <AuthPage
          type="login"
          setPage={setPage}
          setIsLoggedIn={setIsLoggedIn}
          setUserName={setUserName}
        />
      )}
      {page === "signup" && (
        <AuthPage
          type="signup"
          setPage={setPage}
          setIsLoggedIn={setIsLoggedIn}
          setUserName={setUserName}
        />
      )}
      {page === "dashboard" && (
        <Dashboard
          userName={userName}
          memories={memories}
          addMemory={addMemory}
          accountPlan={accountPlan}
        />
      )}
    </>
  );
}
