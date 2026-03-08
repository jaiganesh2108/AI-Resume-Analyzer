import { useState, useEffect } from "react"
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, CartesianGrid,
} from "recharts"
import UploadResume from "./UploadResume"
import api from "../api"

// ── Data ───────────────────────────────────────────────────────────────────────
const radarData = [
  { axis: "Impact",   score: 78 },
  { axis: "Keywords", score: 62 },
  { axis: "Structure",score: 85 },
  { axis: "Clarity",  score: 71 },
  { axis: "ATS Fit",  score: 90 },
  { axis: "Brevity",  score: 55 },
]

const keywordData = [
  { kw: "React",      match: 95 },
  { kw: "TypeScript", match: 80 },
  { kw: "Node.js",    match: 68 },
  { kw: "SQL",        match: 55 },
  { kw: "Docker",     match: 40 },
  { kw: "AWS",        match: 30 },
  { kw: "CI/CD",      match: 22 },
]

const trendData = [
  { v: "v1", score: 44 },
  { v: "v2", score: 53 },
  { v: "v3", score: 61 },
  { v: "v4", score: 58 },
  { v: "v5", score: 72 },
  { v: "v6", score: 79 },
  { v: "v7", score: 87 },
]

const sectionData = [
  { name: "Summary",    score: 88 },
  { name: "Experience", score: 74 },
  { name: "Skills",     score: 61 },
  { name: "Education",  score: 92 },
  { name: "Projects",   score: 55 },
]

const activityData = [
  { day: "Mon", uploads: 2 },
  { day: "Tue", uploads: 1 },
  { day: "Wed", uploads: 4 },
  { day: "Thu", uploads: 3 },
  { day: "Fri", uploads: 6 },
  { day: "Sat", uploads: 2 },
  { day: "Sun", uploads: 1 },
]

const LIME = "#c8ff00"

// ── Helpers ────────────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1400) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let cur = 0
    const step = target / (duration / 16)
    const id = setInterval(() => {
      cur += step
      if (cur >= target) { setVal(target); clearInterval(id) }
      else setVal(Math.floor(cur))
    }, 16)
    return () => clearInterval(id)
  }, [target])
  return val
}

function ScoreRing({ score, size = 130, stroke = 10 }) {
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const n    = useCountUp(score)
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#141414" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={LIME} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="butt"
          style={{ transition: "stroke-dasharray 1.3s cubic-bezier(.16,1,.3,1)" }} />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:30, color:LIME, lineHeight:1 }}>{n}</span>
        <span style={{ fontSize:9, color:"#333", letterSpacing:"0.15em", marginTop:2 }}>SCORE</span>
      </div>
    </div>
  )
}

const BrutalTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:"#0a0a0a", border:`1px solid ${LIME}`, padding:"10px 14px",
      fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:LIME, letterSpacing:"0.08em" }}>
      <div style={{ color:"#555", marginBottom:4 }}>{label}</div>
      {payload.map((p,i) => <div key={i}>{p.value}{p.value<=100?"%":""}</div>)}
    </div>
  )
}

// ── CSS ────────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { background:#0a0a0a; color:#e2e8f0; font-family:'IBM Plex Mono',monospace; }

  .db-root { min-height:100vh; background:#0a0a0a; display:grid; grid-template-rows:auto 1fr; }

  /* NAV */
  .db-nav { border-bottom:1px solid #141414; display:flex; align-items:stretch; height:56px;
    position:sticky; top:0; background:#0a0a0a; z-index:50; }
  .db-nav-logo { display:flex; align-items:center; padding:0 28px; border-right:1px solid #141414; gap:10px; }
  .db-nav-logo-mark { width:26px; height:26px; background:#c8ff00; display:flex; align-items:center;
    justify-content:center; font-family:'Bebas Neue',sans-serif; font-size:15px; color:#0a0a0a; }
  .db-nav-logo-text { font-family:'Bebas Neue',sans-serif; font-size:16px; letter-spacing:3px; color:#f5f5f5; }
  .db-nav-links { display:flex; align-items:stretch; flex:1; padding:0 16px; gap:4px; }
  .db-nav-link { display:flex; align-items:center; padding:0 16px; font-size:11px; letter-spacing:0.12em;
    text-transform:uppercase; color:#333; cursor:pointer; border-bottom:2px solid transparent; transition:color .15s,border-color .15s; }
  .db-nav-link.active { color:#c8ff00; border-bottom-color:#c8ff00; }
  .db-nav-link:hover  { color:#888; }
  .db-nav-right { display:flex; align-items:center; padding:0 24px; border-left:1px solid #141414; gap:20px; }
  .db-nav-status { display:flex; align-items:center; gap:7px; font-size:10px; color:#333; letter-spacing:0.1em; }
  .db-status-dot { width:6px; height:6px; background:#c8ff00; border-radius:50%;
    box-shadow:0 0 6px #c8ff00; animation:blink 2s infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
  .db-avatar { width:30px; height:30px; border:1.5px solid #c8ff00; display:flex; align-items:center;
    justify-content:center; font-size:11px; color:#c8ff00; cursor:pointer; }

  /* LAYOUT */
  .db-body { display:grid; grid-template-columns:220px 1fr; }

  /* SIDEBAR */
  .db-sidebar { border-right:1px solid #141414; padding:32px 0; position:sticky; top:56px;
    height:calc(100vh - 56px); overflow-y:auto; }
  .db-sidebar-section { padding:0 24px; margin-bottom:32px; }
  .db-sidebar-label { font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:#2a2a2a; margin-bottom:12px; }
  .db-sidebar-item { display:flex; align-items:center; gap:10px; padding:9px 12px; font-size:12px;
    letter-spacing:0.06em; color:#444; cursor:pointer; border-left:2px solid transparent;
    margin:0 -12px; transition:all .15s; }
  .db-sidebar-item.active { color:#c8ff00; border-left-color:#c8ff00; background:rgba(200,255,0,.04); }
  .db-sidebar-item:hover  { color:#888; }
  .db-sidebar-icon { font-size:14px; width:16px; text-align:center; }
  .db-sidebar-divider { height:1px; background:#141414; margin:0 24px 32px; }

  /* MAIN */
  .db-main { padding:40px 48px; overflow-y:auto; }

  /* HERO */
  .db-hero { margin-bottom:36px; animation:fadeUp .5s ease both; }
  .db-hero-eyebrow { font-size:10px; letter-spacing:0.25em; text-transform:uppercase; color:#c8ff00; margin-bottom:10px; }
  .db-hero-title { font-family:'Bebas Neue',sans-serif; font-size:60px; line-height:.92;
    color:#f5f5f5; letter-spacing:-1px; margin-bottom:12px; }
  .db-hero-desc { font-size:11px; color:#444; line-height:1.9; max-width:460px; letter-spacing:.04em; }

  /* STAT ROW */
  .stat-row { display:grid; grid-template-columns:repeat(4,1fr); gap:1px;
    background:#141414; border:1px solid #141414; margin-bottom:28px; animation:fadeUp .5s .05s ease both; }
  .stat-cell { background:#0a0a0a; padding:20px 24px; transition:background .2s; }
  .stat-cell:hover { background:rgba(200,255,0,.03); }
  .stat-num { font-family:'Bebas Neue',sans-serif; font-size:38px; color:#c8ff00;
    letter-spacing:1px; line-height:1; margin-bottom:4px; }
  .stat-lbl { font-size:9px; color:#333; letter-spacing:.18em; text-transform:uppercase; }

  /* PANELS */
  .panel { background:#0a0a0a; border:1px solid #141414; padding:28px; position:relative; }
  .panel-tag { position:absolute; top:-10px; left:20px; background:#0a0a0a; padding:0 8px;
    font-size:10px; color:#c8ff00; letter-spacing:.15em; }
  .panel-title { font-family:'Bebas Neue',sans-serif; font-size:18px; letter-spacing:2px;
    color:#f5f5f5; margin-bottom:4px; }
  .panel-sub { font-size:10px; color:#333; letter-spacing:.1em; margin-bottom:20px; }

  /* GRIDS */
  .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
  .grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:16px; }
  .grid-1-2 { display:grid; grid-template-columns:1fr 2fr; gap:16px; margin-bottom:16px; }
  .grid-2-1 { display:grid; grid-template-columns:2fr 1fr; gap:16px; margin-bottom:16px; }

  /* SCORE OVERVIEW */
  .score-overview { display:flex; align-items:center; gap:28px; flex-wrap:wrap; }
  .score-big { font-family:'Bebas Neue',sans-serif; font-size:80px; color:#c8ff00;
    line-height:1; letter-spacing:-3px; }
  .score-slash { font-family:'Bebas Neue',sans-serif; font-size:36px; color:#222; }
  .score-grade { font-family:'Bebas Neue',sans-serif; font-size:22px; color:#888; letter-spacing:2px; }
  .score-tags { display:flex; flex-direction:column; gap:8px; flex:1; min-width:200px; }
  .score-tag { display:flex; align-items:flex-start; gap:10px; font-size:11px; color:#555; letter-spacing:.06em; line-height:1.5; }
  .tag-dot { width:6px; height:6px; margin-top:4px; flex-shrink:0; }
  .tag-dot.ok   { background:#c8ff00; }
  .tag-dot.warn { background:#ff6b35; }
  .tag-dot.bad  { background:#ff3366; }

  /* SECTION BARS */
  .sec-bars { display:flex; flex-direction:column; gap:12px; min-width:200px; }
  .sec-row { display:flex; flex-direction:column; gap:5px; }
  .sec-row-top { display:flex; justify-content:space-between; }
  .sec-name  { font-size:10px; color:#888; letter-spacing:.08em; }
  .sec-val   { font-size:10px; color:#c8ff00; }
  .sec-bg    { height:3px; background:#141414; }
  .sec-fill  { height:3px; background:#c8ff00; transition:width 1.3s cubic-bezier(.16,1,.3,1); }
  .sec-fill.warn { background:#ff6b35; }

  /* KEYWORD TABLE */
  .kw-table { width:100%; border-collapse:collapse; }
  .kw-tr { border-bottom:1px solid #0f0f0f; }
  .kw-tr:hover td { background:rgba(200,255,0,.02); }
  .kw-td { padding:10px 0; font-size:11px; vertical-align:middle; }
  .kw-name { color:#666; letter-spacing:.06em; width:90px; white-space:nowrap; }
  .kw-bar-cell { padding:0 14px; }
  .kw-bg { height:3px; background:#141414; }
  .kw-fill { height:3px; background:#c8ff00; transition:width 1.3s cubic-bezier(.16,1,.3,1); }
  .kw-pct { color:#c8ff00; text-align:right; width:40px; font-size:10px; }

  /* ISSUES */
  .issue-list { display:flex; flex-direction:column; gap:8px; }
  .issue-item { display:flex; gap:12px; border-left:2px solid #1a1a1a; padding:10px 14px;
    font-size:11px; color:#444; letter-spacing:.06em; line-height:1.6; transition:border-color .2s,color .2s; }
  .issue-item:hover { border-left-color:#c8ff00; color:#888; }
  .issue-n { font-family:'Bebas Neue',sans-serif; font-size:18px; color:#c8ff00; flex-shrink:0; line-height:1.2; }

  /* UPLOAD */
  .db-upload-card { border:1px solid #141414; padding:40px; position:relative;
    margin-bottom:32px; animation:fadeUp .5s .25s ease both; }
  .db-upload-card::before { content:'// ANALYSIS MODULE'; position:absolute; top:-10px; left:24px;
    background:#0a0a0a; padding:0 8px; font-size:10px; color:#c8ff00; letter-spacing:.15em; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  /* Recharts */
  .recharts-polar-grid-concentric-polygon { stroke:#1a1a1a !important; }
  .recharts-polar-grid-angle line { stroke:#1a1a1a !important; }
  .recharts-polar-angle-axis-tick text { fill:#444 !important; font-size:10px !important; font-family:'IBM Plex Mono',monospace !important; }
  .recharts-cartesian-axis-tick text   { fill:#333 !important; font-size:10px !important; font-family:'IBM Plex Mono',monospace !important; }
  .recharts-cartesian-grid line { stroke:#141414 !important; }
  .recharts-tooltip-cursor { fill:rgba(200,255,0,.03) !important; }

  @media (max-width:1100px) {
    .db-body { grid-template-columns:1fr; }
    .db-sidebar { display:none; }
    .db-main { padding:28px 20px; }
    .stat-row { grid-template-columns:1fr 1fr; }
    .grid-2,.grid-3,.grid-1-2,.grid-2-1 { grid-template-columns:1fr; }
    .db-hero-title { font-size:48px; }
  }
`

// ── Dashboard ──────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loadingDashboard, setLoadingDashboard] = useState(true)
  const [dashboardError, setDashboardError] = useState("")

  const fetchDashboardData = async () => {
    setLoadingDashboard(true)
    setDashboardError("")
    try {
      const res = await api.get("/dashboard-data")
      setDashboardData(res.data)
    } catch (err) {
      setDashboardError(err?.response?.data?.detail || "Failed to load dashboard data")
    } finally {
      setLoadingDashboard(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const overallTarget = dashboardData?.overall_score ?? 79
  const atsPassRate = dashboardData?.ats_pass_rate ?? 98
  const versionsUploaded = dashboardData?.versions_uploaded ?? 7
  const issuesFound = dashboardData?.issues_found ?? 12

  const radarChartData = dashboardData?.radar_data?.length ? dashboardData.radar_data : radarData
  const keywordChartData = dashboardData?.keyword_data?.length ? dashboardData.keyword_data : keywordData
  const trendChartData = dashboardData?.trend_data?.length ? dashboardData.trend_data : trendData
  const sectionChartData = dashboardData?.section_data?.length ? dashboardData.section_data : sectionData
  const activityChartData = dashboardData?.activity_data?.length ? dashboardData.activity_data : activityData

  const actionItems = dashboardData?.action_items?.length
    ? dashboardData.action_items
    : [
        "Add 3 missing keywords: Docker, AWS, CI/CD — critical for ATS passage",
        "Quantify results in Projects section (e.g. 'reduced load time by 40%')",
        "Summary is 4 lines — trim to 2 for better recruiter scannability",
        "Skills section lists 22 items — curate to top 10 most relevant",
        "Missing LinkedIn URL in contact header — include for credibility",
      ]

  const latestSkills = dashboardData?.latest_analysis?.skills || []
  const latestMissing = dashboardData?.latest_analysis?.missing_skills || []

  const scoreTagItems = [
    {
      tone: "ok",
      text: latestSkills.length
        ? `${latestSkills.length} matched skills detected in latest resume`
        : "No matched skills detected yet",
    },
    {
      tone: latestMissing.length > 0 ? "warn" : "ok",
      text: latestMissing.length
        ? `${latestMissing.length} keyword gaps found in latest resume`
        : "No keyword gaps detected",
    },
    {
      tone: atsPassRate >= 70 ? "ok" : "warn",
      text: `ATS pass rate across uploads: ${atsPassRate}%`,
    },
    {
      tone: "ok",
      text: `Uploaded versions tracked: ${versionsUploaded}`,
    },
  ]

  const scoreGrade = overallTarget >= 85
    ? "EXCELLENT"
    : overallTarget >= 70
      ? "GOOD"
      : overallTarget >= 50
        ? "AVERAGE"
        : "IMPROVE"

  const latestVersionLabel = versionsUploaded > 0 ? `v${versionsUploaded}` : "N/A"
  const overall = useCountUp(overallTarget)
  const maxAct = Math.max(...activityChartData.map(d => d.uploads), 0)

  return (
    <>
      <style>{css}</style>
      <div className="db-root">

        {/* NAV */}
        <nav className="db-nav">
          <div className="db-nav-logo">
            <div className="db-nav-logo-mark">RA</div>
            <span className="db-nav-logo-text">RESUME AI</span>
          </div>
          <div className="db-nav-links">
            <div className="db-nav-link active">Dashboard</div>
            <div className="db-nav-link">History</div>
            <div className="db-nav-link">Templates</div>
            <div className="db-nav-link">Settings</div>
          </div>
          <div className="db-nav-right">
            <div className="db-nav-status"><div className="db-status-dot" />SYSTEM ONLINE</div>
            <div className="db-avatar">U</div>
          </div>
        </nav>

        <div className="db-body">

          {/* SIDEBAR */}
          <aside className="db-sidebar">
            <div className="db-sidebar-section">
              <div className="db-sidebar-label">Main</div>
              <div className="db-sidebar-item active"><span className="db-sidebar-icon">▸</span>Analyze Resume</div>
              <div className="db-sidebar-item"><span className="db-sidebar-icon">◈</span>Past Reports</div>
              <div className="db-sidebar-item"><span className="db-sidebar-icon">◉</span>Job Matcher</div>
              <div className="db-sidebar-item"><span className="db-sidebar-icon">◎</span>Score History</div>
            </div>
            <div className="db-sidebar-divider" />
            <div className="db-sidebar-section">
              <div className="db-sidebar-label">Account</div>
              <div className="db-sidebar-item"><span className="db-sidebar-icon">◷</span>Settings</div>
              <div className="db-sidebar-item"><span className="db-sidebar-icon">⊘</span>Sign Out</div>
            </div>
          </aside>

          {/* MAIN */}
          <main className="db-main">

            {/* HERO */}
            <div className="db-hero">
              <div className="db-hero-eyebrow">// RESUME ANALYZER — DASHBOARD</div>
              <h1 className="db-hero-title">MAKE YOUR<br />RESUME WORK</h1>
              <p className="db-hero-desc">Upload your resume and get instant AI analysis. Identify gaps, optimize keywords, beat ATS systems.</p>
              {loadingDashboard && (
                <p className="db-hero-desc" style={{ marginTop: 8 }}>Loading latest analytics...</p>
              )}
              {!loadingDashboard && dashboardError && (
                <p className="db-hero-desc" style={{ marginTop: 8, color: "#ff6b6b" }}>{dashboardError}</p>
              )}
            </div>

            {/* STAT ROW */}
            <div className="stat-row">
              <div className="stat-cell"><div className="stat-num">{overall}</div><div className="stat-lbl">Overall Score</div></div>
              <div className="stat-cell"><div className="stat-num">{atsPassRate}%</div><div className="stat-lbl">ATS Pass Rate</div></div>
              <div className="stat-cell"><div className="stat-num">{versionsUploaded}</div><div className="stat-lbl">Versions Uploaded</div></div>
              <div className="stat-cell"><div className="stat-num">{issuesFound}</div><div className="stat-lbl">Issues Found</div></div>
            </div>

            {/* ROW 1: Score Overview */}
            <div className="panel" style={{ marginBottom:16, animation:"fadeUp .5s .08s ease both" }}>
              <div className="panel-tag">// LATEST ANALYSIS — {latestVersionLabel}</div>
              <div className="score-overview">
                <ScoreRing score={overallTarget} size={130} stroke={10} />
                <div>
                  <div style={{ display:"flex", alignItems:"baseline", gap:12, marginBottom:8 }}>
                    <span className="score-big">{overall}</span>
                    <span className="score-slash">/100</span>
                    <span className="score-grade">{scoreGrade}</span>
                  </div>
                  <div className="score-tags">
                    {scoreTagItems.map((item, idx) => (
                      <div className="score-tag" key={idx}><span className={`tag-dot ${item.tone}`} />{item.text}</div>
                    ))}
                  </div>
                </div>
                <div className="sec-bars">
                  <div style={{ fontSize:9, color:"#2a2a2a", letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:8 }}>Section Scores</div>
                  {sectionChartData.map(s => (
                    <div className="sec-row" key={s.name}>
                      <div className="sec-row-top">
                        <span className="sec-name">{s.name}</span>
                        <span className="sec-val">{s.score}</span>
                      </div>
                      <div className="sec-bg">
                        <div className={`sec-fill${s.score<65?" warn":""}`} style={{ width:`${s.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ROW 2: Radar + Trend */}
            <div className="grid-2" style={{ animation:"fadeUp .5s .12s ease both" }}>

              <div className="panel">
                <div className="panel-title">SKILL RADAR</div>
                <div className="panel-sub">// Multi-dimension score analysis</div>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarChartData} margin={{ top:0,right:20,bottom:0,left:20 }}>
                    <PolarGrid stroke="#1a1a1a" />
                    <PolarAngleAxis dataKey="axis" tick={{ fill:"#444", fontSize:10, fontFamily:"IBM Plex Mono" }} />
                    <Radar dataKey="score" stroke={LIME} fill={LIME} fillOpacity={0.1} strokeWidth={1.5}
                      dot={{ fill:LIME, r:3 }} />
                    <Tooltip content={<BrutalTip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="panel">
                <div className="panel-title">SCORE TREND</div>
                <div className="panel-sub">// Score across uploaded versions</div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={trendChartData} margin={{ top:10,right:10,bottom:0,left:-20 }}>
                    <defs>
                      <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={LIME} stopOpacity={0.18} />
                        <stop offset="95%" stopColor={LIME} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#141414" />
                    <XAxis dataKey="v" tick={{ fill:"#333", fontSize:10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[30,100]} tick={{ fill:"#333", fontSize:10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<BrutalTip />} />
                    <Area dataKey="score" stroke={LIME} strokeWidth={2} fill="url(#lg)"
                      dot={{ fill:LIME, r:3, strokeWidth:0 }} activeDot={{ r:5, fill:LIME }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ROW 3: Keyword Match + Activity bar */}
            <div className="grid-2-1" style={{ animation:"fadeUp .5s .16s ease both" }}>

              <div className="panel">
                <div className="panel-title">KEYWORD MATCH</div>
                <div className="panel-sub">// Job description keyword coverage</div>
                <table className="kw-table">
                  <tbody>
                    {keywordChartData.map(k => (
                      <tr className="kw-tr" key={k.kw}>
                        <td className="kw-td kw-name">{k.kw}</td>
                        <td className="kw-td kw-bar-cell">
                          <div className="kw-bg"><div className="kw-fill" style={{ width:`${k.match}%` }} /></div>
                        </td>
                        <td className="kw-td kw-pct">{k.match}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="panel">
                <div className="panel-title">ACTIVITY</div>
                <div className="panel-sub">// Uploads this week</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={activityChartData} margin={{ top:5,right:5,bottom:0,left:-28 }} barSize={16}>
                    <CartesianGrid stroke="#141414" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill:"#333", fontSize:10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:"#333", fontSize:10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<BrutalTip />} />
                    <Bar dataKey="uploads" radius={0}>
                      {activityChartData.map((e,i) => <Cell key={i} fill={e.uploads===maxAct ? LIME : "#1e1e1e"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ROW 4: Issues */}
            <div className="panel" style={{ marginBottom:16, animation:"fadeUp .5s .2s ease both" }}>
              <div className="panel-tag">// RANKED BY IMPACT</div>
              <div className="panel-title">ACTION ITEMS</div>
              <div className="panel-sub">// Fix these to boost your score</div>
              <div className="issue-list">
                {actionItems.map((t,i) => (
                  <div className="issue-item" key={i}>
                    <span className="issue-n">{String(i+1).padStart(2,"0")}</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* UPLOAD */}
            <div className="db-upload-card">
              <UploadResume onUploadSuccess={fetchDashboardData} />
            </div>

          </main>
        </div>
      </div>
    </>
  )
}