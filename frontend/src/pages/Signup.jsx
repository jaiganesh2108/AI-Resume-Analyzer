import { useState } from "react"
import api from "../api"

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@300;400;500&display=swap');

  .su-root {
    min-height: 100vh;
    background: #0a0a0a;
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-family: 'IBM Plex Mono', monospace;
    overflow: hidden;
  }

  .su-right-deco {
    background: #f5f5f5;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px;
  }

  .su-deco-number {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 280px;
    color: rgba(0,0,0,0.06);
    line-height: 1;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    letter-spacing: -10px;
    pointer-events: none;
  }

  .su-deco-card {
    position: relative;
    z-index: 2;
    border: 1.5px solid #0a0a0a;
    padding: 32px;
    max-width: 300px;
  }

  .su-deco-label {
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #999;
    margin-bottom: 16px;
  }

  .su-deco-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .su-deco-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 12px;
    color: #444;
    line-height: 1.5;
  }

  .su-deco-dot {
    width: 20px;
    height: 20px;
    background: #c8ff00;
    border: 1.5px solid #0a0a0a;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: bold;
    color: #0a0a0a;
  }

  .su-deco-tagline {
    position: absolute;
    bottom: 48px;
    right: 48px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 13px;
    letter-spacing: 4px;
    color: #bbb;
    writing-mode: vertical-rl;
  }

  /* LEFT FORM PANEL */
  .su-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 72px 64px;
    position: relative;
  }

  .su-left::after {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 1px;
    height: 100%;
    background: linear-gradient(to bottom, transparent, #c8ff00 30%, #c8ff00 70%, transparent);
    opacity: 0.3;
  }

  .su-step {
    font-size: 11px;
    color: #c8ff00;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .su-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 64px;
    color: #f5f5f5;
    line-height: 1;
    margin-bottom: 8px;
  }

  .su-desc {
    font-size: 11px;
    color: #444;
    letter-spacing: 0.06em;
    margin-bottom: 44px;
    line-height: 1.8;
  }

  .field-block { margin-bottom: 24px; }

  .field-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 8px;
  }

  .field-lbl { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #666; }
  .field-idx { font-size: 10px; color: #2a2a2a; }

  .su-input {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 1px solid #2a2a2a;
    padding: 12px 0;
    font-size: 15px;
    color: #f5f5f5;
    font-family: 'IBM Plex Mono', monospace;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;
    letter-spacing: 0.05em;
  }

  .su-input::placeholder { color: #2a2a2a; }
  .su-input:focus { border-bottom-color: #c8ff00; }

  .su-btn {
    margin-top: 48px;
    width: 100%;
    background: transparent;
    border: 1.5px solid #c8ff00;
    padding: 18px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 4px;
    color: #c8ff00;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: color 0.25s;
  }

  .su-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: #c8ff00;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .su-btn:hover { color: #0a0a0a; }
  .su-btn:hover::before { transform: scaleX(1); }
  .su-btn span { position: relative; z-index: 1; }

  .su-footer {
    text-align: center;
    margin-top: 20px;
    font-size: 11px;
    color: #444;
    letter-spacing: 0.06em;
  }

  .su-footer a { color: #c8ff00; text-decoration: none; border-bottom: 1px solid rgba(200,255,0,0.3); }
  .su-footer a:hover { border-color: #c8ff00; }

  .toast {
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    background: #c8ff00;
    color: #0a0a0a;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.1em;
    padding: 14px 28px;
    border: none;
    box-shadow: 6px 6px 0 rgba(200,255,0,0.2);
    animation: toastIn 0.3s ease both;
    z-index: 100;
    white-space: nowrap;
  }

  @keyframes toastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(12px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  .anim { animation: riseIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .a1 { animation-delay: 0.05s; }
  .a2 { animation-delay: 0.12s; }
  .a3 { animation-delay: 0.19s; }
  .a4 { animation-delay: 0.26s; }
  .a5 { animation-delay: 0.33s; }
  .a6 { animation-delay: 0.40s; }

  @keyframes riseIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    .su-root { grid-template-columns: 1fr; }
    .su-right-deco { display: none; }
    .su-left { padding: 48px 32px; }
  }
`

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const signup = async () => {
    setLoading(true)
    try {
      const res = await api.post("/signup", { email, password })
      setToast(res.data.message)
      setTimeout(() => setToast(null), 3500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="su-root">

        {/* FORM PANEL */}
        <div className="su-left">
          <div className="su-step anim a1">// 00 — New Account</div>
          <h1 className="su-title anim a2">CREATE<br />ACCOUNT</h1>
          <p className="su-desc anim a3">Join thousands landing interviews faster</p>

          <div className="field-block anim a4">
            <div className="field-top">
              <span className="field-lbl">Email Address</span>
              <span className="field-idx">_01</span>
            </div>
            <input className="su-input" type="email" placeholder="you@domain.com" onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="field-block anim a5">
            <div className="field-top">
              <span className="field-lbl">Password</span>
              <span className="field-idx">_02</span>
            </div>
            <input className="su-input" type="password" placeholder="min. 8 characters" onChange={e => setPassword(e.target.value)} />
          </div>

          <button className="su-btn anim a6" onClick={signup} disabled={loading}>
            <span>{loading ? "CREATING..." : "CREATE ACCOUNT →"}</span>
          </button>

          <p className="su-footer anim a6">Already have an account? <a href="/login">Sign in</a></p>
        </div>

        {/* DECO PANEL */}
        <div className="su-right-deco">
          <div className="su-deco-number">01</div>
          <div className="su-deco-card">
            <p className="su-deco-label">What you get</p>
            <ul className="su-deco-list">
              <li className="su-deco-item"><span className="su-deco-dot">✓</span>Instant AI resume scoring</li>
              <li className="su-deco-item"><span className="su-deco-dot">✓</span>ATS keyword gap analysis</li>
              <li className="su-deco-item"><span className="su-deco-dot">✓</span>Role-specific tailoring tips</li>
              <li className="su-deco-item"><span className="su-deco-dot">✓</span>Unlimited uploads</li>
            </ul>
          </div>
          <div className="su-deco-tagline">Resume AI Studio</div>
        </div>

      </div>

      {toast && <div className="toast">✓ {toast}</div>}
    </>
  )
}