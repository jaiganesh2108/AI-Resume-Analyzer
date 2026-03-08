import { useState, useRef } from "react"
import api from "../api"

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@300;400;500&display=swap');

  .ur-wrap {
    font-family: 'IBM Plex Mono', monospace;
    color: #e2e8f0;
  }

  .ur-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 32px;
    padding-bottom: 16px;
    border-bottom: 1px solid #1a1a1a;
  }

  .ur-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 36px;
    color: #f5f5f5;
    letter-spacing: 2px;
  }

  .ur-counter {
    font-size: 11px;
    color: #333;
    letter-spacing: 0.15em;
  }

  /* DROP ZONE */
  .ur-drop {
    border: 1.5px dashed #2a2a2a;
    padding: 64px 32px;
    text-align: center;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s, background 0.2s;
    background: transparent;
  }

  .ur-drop.drag { border-color: #c8ff00; background: rgba(200,255,0,0.03); }
  .ur-drop:hover { border-color: #444; }

  .ur-drop-corner {
    position: absolute;
    width: 12px; height: 12px;
    border-color: #c8ff00;
    border-style: solid;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .ur-drop:hover .ur-drop-corner,
  .ur-drop.drag .ur-drop-corner { opacity: 1; }
  .ur-drop-corner.tl { top: 8px; left: 8px; border-width: 1.5px 0 0 1.5px; }
  .ur-drop-corner.tr { top: 8px; right: 8px; border-width: 1.5px 1.5px 0 0; }
  .ur-drop-corner.bl { bottom: 8px; left: 8px; border-width: 0 0 1.5px 1.5px; }
  .ur-drop-corner.br { bottom: 8px; right: 8px; border-width: 0 1.5px 1.5px 0; }

  .ur-drop-icon {
    font-size: 40px;
    margin-bottom: 20px;
    display: block;
    filter: grayscale(1) opacity(0.4);
    transition: filter 0.2s;
  }
  .ur-drop:hover .ur-drop-icon,
  .ur-drop.drag .ur-drop-icon { filter: none; }

  .ur-drop-main {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    letter-spacing: 2px;
    color: #f5f5f5;
    margin-bottom: 8px;
  }

  .ur-drop-sub {
    font-size: 11px;
    color: #444;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 24px;
  }

  .ur-browse-btn {
    display: inline-block;
    border: 1px solid #333;
    padding: 8px 20px;
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #666;
    background: transparent;
    cursor: pointer;
    font-family: 'IBM Plex Mono', monospace;
    transition: all 0.2s;
  }
  .ur-browse-btn:hover { border-color: #c8ff00; color: #c8ff00; }

  /* FILE SELECTED */
  .ur-file-row {
    display: flex;
    align-items: center;
    gap: 16px;
    border: 1px solid #1e1e1e;
    border-left: 3px solid #c8ff00;
    padding: 16px 20px;
    margin-top: 16px;
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .ur-file-icon { font-size: 22px; flex-shrink: 0; }
  .ur-file-info { flex: 1; min-width: 0; }
  .ur-file-name { font-size: 13px; color: #f5f5f5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ur-file-size { font-size: 11px; color: #444; margin-top: 2px; }
  .ur-file-rm {
    background: none;
    border: 1px solid #1e1e1e;
    color: #444;
    cursor: pointer;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    padding: 6px 10px;
    letter-spacing: 0.1em;
    transition: all 0.2s;
  }
  .ur-file-rm:hover { border-color: #ff4444; color: #ff4444; }

  /* ANALYZE BTN */
  .ur-analyze {
    width: 100%;
    margin-top: 20px;
    background: #c8ff00;
    border: none;
    padding: 18px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 4px;
    color: #0a0a0a;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: transform 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .ur-analyze:disabled { opacity: 0.3; cursor: not-allowed; transform: none !important; }
  .ur-analyze:not(:disabled):hover { transform: translate(3px, -3px); box-shadow: -5px 5px 0 rgba(200,255,0,0.2); }

  .ur-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(0,0,0,0.2);
    border-top-color: #0a0a0a;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* RESULTS */
  .ur-results {
    margin-top: 32px;
    animation: fadeUp 0.4s ease both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ur-res-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
  }

  .ur-res-label {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    letter-spacing: 2px;
    color: #f5f5f5;
  }

  .ur-res-tag {
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #c8ff00;
    border: 1px solid rgba(200,255,0,0.3);
    padding: 3px 10px;
  }

  .ur-res-body {
    border: 1px solid #1a1a1a;
    border-left: 2px solid #c8ff00;
    padding: 28px;
    font-size: 12px;
    line-height: 1.9;
    color: #888;
    white-space: pre-wrap;
    max-height: 360px;
    overflow-y: auto;
    background: rgba(200,255,0,0.01);
  }

  .ur-res-body::-webkit-scrollbar { width: 3px; }
  .ur-res-body::-webkit-scrollbar-track { background: transparent; }
  .ur-res-body::-webkit-scrollbar-thumb { background: #c8ff00; }
`

function fmt(b) {
  if (b < 1024) return b + " B"
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB"
  return (b / (1024 * 1024)).toFixed(1) + " MB"
}

export default function UploadResume({ onUploadSuccess }) {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const ref = useRef()

  const pick = (f) => {
    if (!f) return
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setFile(null)
      setResult(null)
      setError("Only PDF files are supported")
      return
    }
    setFile(f)
    setResult(null)
    setError("")
  }

  const upload = async () => {
    if (!file) return
    setLoading(true)
    setError("")
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await api.post("/upload-resume", fd)
      setResult(res.data.analysis)
      if (typeof onUploadSuccess === "function") {
        onUploadSuccess(res.data.analysis)
      }
    } catch (err) {
      setResult(null)
      setError(err?.response?.data?.detail || "Upload failed. Please try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="ur-wrap">
        <div className="ur-header">
          <span className="ur-title">UPLOAD RESUME</span>
          <span className="ur-counter">// STEP 02</span>
        </div>

        <div
          className={`ur-drop${dragging ? " drag" : ""}`}
          onClick={() => ref.current.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files[0]) }}
        >
          <span className="ur-drop-corner tl" />
          <span className="ur-drop-corner tr" />
          <span className="ur-drop-corner bl" />
          <span className="ur-drop-corner br" />

          <span className="ur-drop-icon">📄</span>
          <div className="ur-drop-main">DROP FILE HERE</div>
          <div className="ur-drop-sub">PDF ONLY — max 10MB</div>
          <button className="ur-browse-btn" onClick={e => { e.stopPropagation(); ref.current.click() }}>Browse files</button>
          <input ref={ref} type="file" style={{ display: "none" }} accept=".pdf" onChange={e => pick(e.target.files[0])} />
        </div>

        {error && (
          <div style={{ marginTop: 14, color: "#ff6666", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {error}
          </div>
        )}

        {file && (
          <div className="ur-file-row">
            <span className="ur-file-icon">📎</span>
            <div className="ur-file-info">
              <div className="ur-file-name">{file.name}</div>
              <div className="ur-file-size">{fmt(file.size)}</div>
            </div>
            <button className="ur-file-rm" onClick={() => { setFile(null); setResult(null) }}>REMOVE</button>
          </div>
        )}

        <button className="ur-analyze" onClick={upload} disabled={!file || loading}>
          {loading ? <><div className="ur-spinner" /> ANALYZING</> : "ANALYZE →"}
        </button>

        {result && (
          <div className="ur-results">
            <div className="ur-res-header">
              <span className="ur-res-label">ANALYSIS OUTPUT</span>
              <span className="ur-res-tag">Complete</span>
            </div>
            <pre className="ur-res-body">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </>
  )
}