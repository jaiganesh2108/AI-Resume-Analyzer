import { useState } from "react"
import api from "../api"

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@300;400;500&display=swap');

  .login-root {
    min-height: 100vh;
    background: #0a0a0a;
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-family: 'IBM Plex Mono', monospace;
    overflow: hidden;
  }

  .login-left {
    position: relative;
    background: #c8ff00;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px;
    overflow: hidden;
  }

  .login-left::after {
    content: 'RESUME\\AANALYZER';
    white-space: pre;
    position: absolute;
    bottom: -40px;
    left: -10px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 120px;
    line-height: 0.85;
    color: rgba(0,0,0,0.08);
    pointer-events: none;
    letter-spacing: -2px;
  }

  .login-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 4px;
    color: #0a0a0a;
    border: 2px solid #0a0a0a;
    display: inline-block;
    padding: 6px 14px;
    position: relative;
    z-index: 2;
  }

  .login-tagline {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 88px;
    line-height: 0.9;
    color: #0a0a0a;
    letter-spacing: -2px;
    position: relative;
    z-index: 2;
    margin: 48px 0 16px;
  }

  .login-sub {
    position: relative;
    z-index: 2;
    font-size: 11px;
    color: rgba(0,0,0,0.55);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    line-height: 1.8;
    max-width: 260px;
  }

  .login-right {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 72px 64px;
    position: relative;
  }

  .login-right::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 1px;
    height: 100%;
    background: linear-gradient(to bottom, transparent, #c8ff00 30%, #c8ff00 70%, transparent);
    opacity: 0.4;
  }

  .login-step {
    font-size: 11px;
    color: #c8ff00;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .login-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 64px;
    color: #f5f5f5;
    letter-spacing: 1px;
    line-height: 1;
    margin-bottom: 48px;
  }

  .field-block { margin-bottom: 24px; }

  .field-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 8px;
  }

  .field-lbl {
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #666;
  }

  .field-idx { font-size: 10px; color: #333; }

  .login-input {
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

  .login-input::placeholder { color: #2a2a2a; }
  .login-input:focus { border-bottom-color: #c8ff00; }
  .login-input:focus::placeholder { color: #444; }

  .login-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 48px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .login-btn {
    background: #c8ff00;
    border: none;
    padding: 16px 40px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 3px;
    color: #0a0a0a;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: transform 0.15s;
  }

  .login-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: #fff;
    transform: translateX(-101%);
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .login-btn:hover { transform: translate(2px, -2px); box-shadow: -4px 4px 0 rgba(200,255,0,0.3); }
  .login-btn:hover::before { transform: translateX(0); }
  .login-btn span { position: relative; z-index: 1; }

  .login-footer-link { font-size: 11px; color: #444; letter-spacing: 0.08em; }
  .login-footer-link a { color: #c8ff00; text-decoration: none; border-bottom: 1px solid rgba(200,255,0,0.3); padding-bottom: 1px; transition: border-color 0.2s; }
  .login-footer-link a:hover { border-color: #c8ff00; }

  .login-corner {
    position: absolute;
    bottom: 48px;
    right: 64px;
    font-size: 10px;
    color: #222;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    writing-mode: vertical-rl;
  }

  .anim { animation: riseIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .anim-1 { animation-delay: 0.05s; }
  .anim-2 { animation-delay: 0.1s; }
  .anim-3 { animation-delay: 0.17s; }
  .anim-4 { animation-delay: 0.24s; }
  .anim-5 { animation-delay: 0.31s; }

  @keyframes riseIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    .login-root { grid-template-columns: 1fr; }
    .login-left { display: none; }
    .login-right { padding: 48px 32px; }
  }
`

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const login = async () => {
    setLoading(true)
    try {
      const res = await api.post("/login", { email, password })
      localStorage.setItem("token", res.data.token)
      window.location = "/dashboard"
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="login-root">
        <div className="login-left">
          <div className="login-logo">RA — Studio</div>
          <div className="login-tagline">GET<br />HIRED<br />FASTER</div>
          <p className="login-sub">
            AI-powered resume analysis.<br />
            Know exactly what to fix<br />before you apply.
          </p>
        </div>

        <div className="login-right">
          <div className="login-step anim anim-1">// 01 — Authentication</div>
          <h1 className="login-title anim anim-2">SIGN IN</h1>

          <div className="field-block anim anim-3">
            <div className="field-top">
              <span className="field-lbl">Email Address</span>
              <span className="field-idx">_01</span>
            </div>
            <input className="login-input" type="email" placeholder="you@domain.com" onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="field-block anim anim-4">
            <div className="field-top">
              <span className="field-lbl">Password</span>
              <span className="field-idx">_02</span>
            </div>
            <input className="login-input" type="password" placeholder="••••••••••••" onChange={e => setPassword(e.target.value)} />
          </div>

          <div className="login-actions anim anim-5">
            <button className="login-btn" onClick={login} disabled={loading}>
              <span>{loading ? "LOADING..." : "ENTER →"}</span>
            </button>
            <p className="login-footer-link">New here? <a href="/signup">Create account</a></p>
          </div>

          <div className="login-corner">© 2025 Resume AI</div>
        </div>
      </div>
    </>
  )
}