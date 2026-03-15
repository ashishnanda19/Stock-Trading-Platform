import { useState, useEffect, useCallback } from "react";

// ── Change this if your backend is on a different IP/port ──────────────────
const API_BASE = "/api/v1"; // Proxied via Vite → localhost:3000

// ─── API helpers ────────────────────────────────────────────────────────────
// In-memory token store (fallback for when cookies don't flow through proxy)
let _accessToken = null;
export const setToken = (t) => { _accessToken = t; };
export const clearToken = () => { _accessToken = null; };

const apiFetch = async (path, options = {}) => {
  try {
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    if (_accessToken) headers["Authorization"] = `Bearer ${_accessToken}`;
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: "include",
      headers,
    });
    const text = await res.text();
    try { return JSON.parse(text); }
    catch { return { statusCode: res.status, message: text }; }
  } catch (err) {
    return { statusCode: 0, message: "NETWORK_ERROR" };
  }
};

const api = {
  post:   (path, body)   => apiFetch(path, { method: "POST",  body: JSON.stringify(body) }),
  patch:  (path, body)   => apiFetch(path, { method: "PATCH", body: JSON.stringify(body) }),
  get:    (path)         => apiFetch(path),
  getq:   (path, params) => apiFetch(path + "?" + new URLSearchParams(params).toString()),
};

// ─── Styles ─────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080c10;
    --bg2: #0d1117;
    --bg3: #141c25;
    --border: #1e2d3d;
    --accent: #00e5ff;
    --accent2: #ff4d6d;
    --accent3: #69ff97;
    --text: #e2eaf4;
    --muted: #5a7a99;
    --card: #0d1520;
    --glow: rgba(0, 229, 255, 0.15);
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'IBM Plex Mono', monospace;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .app { min-height: 100vh; }

  /* ── AUTH ── */
  .auth-wrap {
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,229,255,0.07) 0%, transparent 70%);
    position: relative;
    overflow: hidden;
  }
  .auth-wrap::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 40px 40px;
    opacity: 0.4;
  }
  .auth-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-top: 2px solid var(--accent);
    padding: 48px 40px;
    width: 440px;
    position: relative;
    box-shadow: 0 0 60px rgba(0,229,255,0.08), 0 20px 60px rgba(0,0,0,0.6);
    animation: slideUp 0.4s ease;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .auth-logo {
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    font-weight: 800;
    color: var(--accent);
    letter-spacing: -1px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .auth-logo span { color: var(--text); }
  .auth-sub { color: var(--muted); font-size: 12px; margin-bottom: 36px; }
  .auth-tabs { display: flex; gap: 0; margin-bottom: 28px; border-bottom: 1px solid var(--border); }
  .auth-tab {
    padding: 10px 20px;
    background: none;
    border: none;
    color: var(--muted);
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    letter-spacing: 1px;
    transition: all 0.2s;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
  }
  .auth-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
  .field { margin-bottom: 18px; }
  .field label { display: block; font-size: 11px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
  .field input {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--text);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 14px;
    padding: 12px 14px;
    outline: none;
    transition: border-color 0.2s;
  }
  .field input:focus { border-color: var(--accent); }
  .btn-primary {
    width: 100%;
    padding: 14px;
    background: var(--accent);
    color: #000;
    border: none;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 13px;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 8px;
  }
  .btn-primary:hover { background: #33ecff; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(0,229,255,0.3); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .error-msg { color: var(--accent2); font-size: 12px; margin-top: 12px; text-align: center; }
  .success-msg { color: var(--accent3); font-size: 12px; margin-top: 12px; text-align: center; }

  /* ── LAYOUT ── */
  .layout { display: flex; min-height: 100vh; }
  .sidebar {
    width: 220px;
    background: var(--bg2);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 24px 0;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 10;
  }
  .sidebar-logo {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 800;
    color: var(--accent);
    padding: 0 20px 24px;
    border-bottom: 1px solid var(--border);
    letter-spacing: -0.5px;
  }
  .sidebar-logo span { color: var(--text); }
  .nav { flex: 1; padding: 16px 0; }
  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 20px;
    cursor: pointer;
    color: var(--muted);
    font-size: 12px;
    letter-spacing: 0.5px;
    transition: all 0.15s;
    border-left: 2px solid transparent;
  }
  .nav-item:hover { color: var(--text); background: var(--bg3); }
  .nav-item.active { color: var(--accent); border-left-color: var(--accent); background: rgba(0,229,255,0.05); }
  .nav-icon { font-size: 16px; width: 20px; text-align: center; }
  .sidebar-wallet {
    margin: 0 12px 16px;
    padding: 14px;
    background: var(--bg3);
    border: 1px solid var(--border);
  }
  .wallet-label { font-size: 10px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; }
  .wallet-balance { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: var(--accent3); margin-top: 4px; }
  .btn-logout {
    margin: 0 12px;
    padding: 10px;
    background: none;
    border: 1px solid var(--border);
    color: var(--muted);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .btn-logout:hover { border-color: var(--accent2); color: var(--accent2); }
  .main { margin-left: 220px; flex: 1; padding: 32px; }

  /* ── SECTION HEADER ── */
  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: 24px;
    font-weight: 800;
    margin-bottom: 4px;
    letter-spacing: -0.5px;
  }
  .section-sub { color: var(--muted); font-size: 12px; margin-bottom: 28px; }

  /* ── CARDS ── */
  .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
  .stat-card {
    background: var(--card);
    border: 1px solid var(--border);
    padding: 20px;
    position: relative;
    overflow: hidden;
  }
  .stat-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: var(--accent);
  }
  .stat-card.red::after { background: var(--accent2); }
  .stat-card.green::after { background: var(--accent3); }
  .stat-label { font-size: 10px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; }
  .stat-value { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; margin-top: 6px; }
  .stat-sub { font-size: 11px; color: var(--muted); margin-top: 4px; }

  /* ── STOCKS GRID ── */
  .stocks-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
  .stock-card {
    background: var(--card);
    border: 1px solid var(--border);
    padding: 18px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }
  .stock-card:hover { border-color: var(--accent); box-shadow: 0 0 20px var(--glow); transform: translateY(-2px); }
  .stock-name { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; }
  .stock-price { font-size: 20px; color: var(--accent); margin: 8px 0 4px; }
  .stock-id { font-size: 10px; color: var(--muted); }

  /* ── MODAL ── */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.7);
    display: grid; place-items: center;
    z-index: 100;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal {
    background: var(--card);
    border: 1px solid var(--border);
    border-top: 2px solid var(--accent);
    padding: 36px;
    width: 400px;
    animation: slideUp 0.2s ease;
    position: relative;
  }
  .modal-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; margin-bottom: 6px; }
  .modal-sub { color: var(--muted); font-size: 12px; margin-bottom: 24px; }
  .modal-price { font-size: 28px; color: var(--accent3); font-family: 'Syne', sans-serif; font-weight: 800; margin-bottom: 20px; }
  .modal-close {
    position: absolute; top: 16px; right: 16px;
    background: none; border: none; color: var(--muted); cursor: pointer;
    font-size: 20px; line-height: 1;
    transition: color 0.2s;
  }
  .modal-close:hover { color: var(--text); }
  .modal-actions { display: flex; gap: 10px; margin-top: 16px; }
  .btn-buy { flex: 1; padding: 12px; background: var(--accent3); color: #000; border: none; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 12px; letter-spacing: 1px; cursor: pointer; transition: all 0.2s; }
  .btn-buy:hover { filter: brightness(1.1); }
  .btn-sell { flex: 1; padding: 12px; background: none; border: 1px solid var(--accent2); color: var(--accent2); font-family: 'Syne', sans-serif; font-weight: 800; font-size: 12px; letter-spacing: 1px; cursor: pointer; transition: all 0.2s; }
  .btn-sell:hover { background: var(--accent2); color: #000; }

  /* ── TABLE ── */
  .table-wrap { background: var(--card); border: 1px solid var(--border); overflow: hidden; }
  table { width: 100%; border-collapse: collapse; }
  th { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); padding: 14px 16px; text-align: left; border-bottom: 1px solid var(--border); background: var(--bg2); }
  td { padding: 13px 16px; font-size: 12px; border-bottom: 1px solid var(--border); }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,0.02); }
  .badge-buy { background: rgba(105,255,151,0.15); color: var(--accent3); padding: 3px 10px; font-size: 10px; letter-spacing: 1px; }
  .badge-sell { background: rgba(255,77,109,0.15); color: var(--accent2); padding: 3px 10px; font-size: 10px; letter-spacing: 1px; }

  /* ── PORTFOLIO ITEM ── */
  .portfolio-item {
    background: var(--card);
    border: 1px solid var(--border);
    padding: 18px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    transition: border-color 0.2s;
  }
  .portfolio-item:hover { border-color: var(--border); }
  .portfolio-left .pf-name { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; }
  .portfolio-left .pf-qty { font-size: 11px; color: var(--muted); margin-top: 3px; }
  .portfolio-right { text-align: right; }
  .pf-avg { font-size: 11px; color: var(--muted); }
  .pf-current { font-size: 18px; font-family: 'Syne', sans-serif; font-weight: 700; color: var(--accent); }
  .pf-pnl { font-size: 12px; margin-top: 2px; }
  .pnl-pos { color: var(--accent3); }
  .pnl-neg { color: var(--accent2); }

  /* ── LEADERBOARD ── */
  .lb-item {
    display: flex; align-items: center; gap: 16px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
  }
  .lb-item:last-child { border-bottom: none; }
  .lb-rank { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; color: var(--muted); width: 32px; }
  .lb-rank.top { color: var(--accent); }
  .lb-name { flex: 1; font-size: 13px; }
  .lb-score { font-family: 'Syne', sans-serif; font-weight: 700; color: var(--accent3); }

  /* ── GRAPH ── */
  .graph-search { display: flex; gap: 10px; margin-bottom: 20px; }
  .graph-search input {
    flex: 1; background: var(--card); border: 1px solid var(--border);
    color: var(--text); font-family: 'IBM Plex Mono', monospace; font-size: 13px;
    padding: 10px 14px; outline: none;
  }
  .graph-search input:focus { border-color: var(--accent); }
  .btn-search {
    padding: 10px 20px; background: var(--accent); color: #000;
    border: none; font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 11px; letter-spacing: 1px; cursor: pointer;
  }
  .chart-area {
    background: var(--card); border: 1px solid var(--border); padding: 24px;
    position: relative;
  }
  svg.line-chart { display: block; }

  /* ── LOADING ── */
  .spinner {
    width: 20px; height: 20px;
    border: 2px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-wrap { display: flex; align-items: center; justify-content: center; padding: 60px; gap: 12px; color: var(--muted); font-size: 12px; }

  .empty-state { text-align: center; padding: 60px 20px; color: var(--muted); font-size: 13px; }
  .empty-icon { font-size: 40px; margin-bottom: 12px; }

  .toast {
    position: fixed; bottom: 24px; right: 24px;
    background: var(--card); border: 1px solid var(--border);
    border-left: 3px solid var(--accent3);
    padding: 14px 20px; font-size: 13px;
    animation: slideUp 0.3s ease;
    z-index: 200;
    max-width: 320px;
  }
  .toast.error { border-left-color: var(--accent2); }

  .network-banner {
    background: #1a0a00;
    border: 1px solid #ff6b00;
    border-left: 3px solid #ff6b00;
    color: #ff9a4d;
    padding: 14px 20px;
    font-size: 12px;
    margin-bottom: 20px;
    line-height: 1.8;
  }
  .network-banner strong { color: #ffc580; font-family: 'Syne', sans-serif; display: block; margin-bottom: 6px; }
  .network-banner code { background: rgba(255,150,0,0.15); padding: 2px 6px; font-size: 11px; }
`;

// ─── Toast ──────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, []);
  return <div className={`toast ${type}`}>{msg}</div>;
}

// ─── Mini SVG Line Chart ─────────────────────────────────────────────────────
function LineChart({ data, stockName }) {
  const [tooltip, setTooltip] = useState(null);
  if (!data || data.length < 2)
    return <div className="empty-state"><div className="empty-icon">📊</div>Not enough data points</div>;

  const W = 700, H = 260, PL = 60, PR = 20, PT = 20, PB = 40;
  const chartW = W - PL - PR;
  const chartH = H - PT - PB;

  const prices = data.map((d) => Number(d.price));
  const times  = data.map((d) => new Date(d.created_at || d.updated_at || Date.now()));
  const minP = Math.min(...prices), maxP = Math.max(...prices);
  const range = maxP - minP || 1;
  const isUp = prices[prices.length - 1] >= prices[0];
  const color = isUp ? "#69ff97" : "#ff4d6d";

  const sx = (i) => PL + (i / (prices.length - 1)) * chartW;
  const sy = (v) => PT + chartH - ((v - minP) / range) * chartH;

  const linePts = prices.map((v, i) => `${sx(i)},${sy(v)}`).join(" ");
  const areaPath = `M${sx(0)},${PT + chartH} ` +
    prices.map((v, i) => `L${sx(i)},${sy(v)}`).join(" ") +
    ` L${sx(prices.length - 1)},${PT + chartH} Z`;

  // Y axis ticks
  const yTicks = 5;
  const yTickVals = Array.from({ length: yTicks }, (_, i) => minP + (range / (yTicks - 1)) * i);

  // X axis labels — show ~5 evenly spaced
  const xLabelIdxs = [0, Math.floor(prices.length * 0.25), Math.floor(prices.length * 0.5),
                      Math.floor(prices.length * 0.75), prices.length - 1];

  const fmtTime = (d) => {
    if (!(d instanceof Date) || isNaN(d)) return "";
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  const handleMouseMove = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const idx = Math.round(((mx - PL) / chartW) * (prices.length - 1));
    if (idx >= 0 && idx < prices.length) {
      setTooltip({ idx, x: sx(idx), y: sy(prices[idx]), price: prices[idx], time: times[idx] });
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 280 }}
        onMouseMove={handleMouseMove} onMouseLeave={() => setTooltip(null)}>
        <defs>
          <linearGradient id={`grad-${stockName}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTickVals.map((v, i) => (
          <g key={i}>
            <line x1={PL} y1={sy(v)} x2={W - PR} y2={sy(v)}
              stroke="#1e2d3d" strokeWidth="1" strokeDasharray="4,4" />
            <text x={PL - 6} y={sy(v) + 4} textAnchor="end"
              fill="#5a7a99" fontSize="10" fontFamily="IBM Plex Mono">
              {v >= 1000 ? `${(v/1000).toFixed(1)}k` : v.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#grad-${stockName})`} />

        {/* Line */}
        <polyline points={linePts} fill="none" stroke={color}
          strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* X axis labels */}
        {xLabelIdxs.map((idx) => (
          <text key={idx} x={sx(idx)} y={H - 8} textAnchor="middle"
            fill="#5a7a99" fontSize="10" fontFamily="IBM Plex Mono">
            {fmtTime(times[idx])}
          </text>
        ))}

        {/* First & last price dots */}
        <circle cx={sx(0)} cy={sy(prices[0])} r="4" fill={color} />
        <circle cx={sx(prices.length-1)} cy={sy(prices[prices.length-1])} r="5"
          fill={color} stroke="#080c10" strokeWidth="2" />

        {/* Tooltip crosshair */}
        {tooltip && (
          <g>
            <line x1={tooltip.x} y1={PT} x2={tooltip.x} y2={PT + chartH}
              stroke="#ffffff22" strokeWidth="1" strokeDasharray="3,3" />
            <circle cx={tooltip.x} cy={tooltip.y} r="5"
              fill={color} stroke="#080c10" strokeWidth="2" />
            {/* Tooltip box */}
            <rect x={Math.min(tooltip.x + 10, W - 130)} y={tooltip.y - 36}
              width="120" height="44" rx="2"
              fill="#0d1520" stroke="#1e2d3d" strokeWidth="1" />
            <text x={Math.min(tooltip.x + 18, W - 122)} y={tooltip.y - 20}
              fill="#00e5ff" fontSize="12" fontFamily="Syne" fontWeight="700">
              ₹{tooltip.price.toLocaleString()}
            </text>
            <text x={Math.min(tooltip.x + 18, W - 122)} y={tooltip.y - 4}
              fill="#5a7a99" fontSize="10" fontFamily="IBM Plex Mono">
              {fmtTime(tooltip.time)}
            </text>
          </g>
        )}
      </svg>

      {/* Summary bar */}
      <div style={{ display:"flex", gap:24, marginTop:8, fontSize:12, color:"var(--muted)" }}>
        <span>Open <strong style={{color:"var(--text)"}}>₹{prices[0].toLocaleString()}</strong></span>
        <span>Close <strong style={{color:color}}>₹{prices[prices.length-1].toLocaleString()}</strong></span>
        <span>High <strong style={{color:"var(--accent3)"}}>₹{maxP.toLocaleString()}</strong></span>
        <span>Low <strong style={{color:"var(--accent2)"}}>₹{minP.toLocaleString()}</strong></span>
        <span>Change <strong style={{color}}>{isUp ? "+" : ""}{((prices[prices.length-1]-prices[0])/prices[0]*100).toFixed(2)}%</strong></span>
      </div>
    </div>
  );
}

// ─── Auth ───────────────────────────────────────────────────────────────────
function Auth({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handle = async () => {
    setLoading(true);
    setMsg(null);
    const endpoint = tab === "login" ? "/users/login" : "/users/register";
    const body = tab === "login" ? { email: form.email, password: form.password } : form;
    const res = await api.post(endpoint, body);
    setLoading(false);
    if (res.message === "NETWORK_ERROR" || res.statusCode === 0) {
      setMsg({ type: "network", text: null });
      return;
    }
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (tab === "login") {
        onLogin(res.data.user);
      } else {
        setMsg({ type: "success", text: "Registered! Please log in." });
        setTab("login");
      }
    } else {
      setMsg({ type: "error", text: res.message || "Something went wrong" });
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">▲ <span>APEX</span>TRADE</div>
        <div className="auth-sub">Real-time simulated stock trading platform</div>
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>LOGIN</button>
          <button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => setTab("register")}>REGISTER</button>
        </div>
        {tab === "register" && (
          <div className="field">
            <label>Username</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="johndoe" />
          </div>
        )}
        <div className="field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" onKeyDown={(e) => e.key === "Enter" && handle()} />
        </div>
        <button className="btn-primary" onClick={handle} disabled={loading}>
          {loading ? "..." : tab === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
        </button>
        {msg && msg.type === "network" && (
          <div className="network-banner">
            <strong>⚠ Cannot reach the backend server</strong>
            Make sure your backend container is running on port <code>3000</code> and CORS is configured.<br/>
            In your backend <code>index.js</code>, update cors to:<br/>
            <code>app.use(cors({"{ origin: 'http://localhost:5173', credentials: true }"}))</code><br/>
            Then restart the container: <code>docker restart stock-backend</code>
          </div>
        )}
        {msg && msg.type === "error" && <div className="error-msg">{msg.text}</div>}
        {msg && msg.type === "success" && <div className="success-msg">{msg.text}</div>}
      </div>
    </div>
  );
}

// ─── Trade Modal ────────────────────────────────────────────────────────────
function TradeModal({ stock, onClose, onDone, wallet }) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const trade = async (type) => {
    setLoading(true);
    setMsg(null);
    const endpoint = type === "BUY" ? "/users/buy-stock" : "/users/sell-stock";
    const method = type === "BUY" ? "post" : "patch";
    const res = await api[method](endpoint, { name: stock.stock_name, quantity: Number(qty) });
    setLoading(false);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      onDone(type === "BUY" ? "✅ Stock purchased!" : "✅ Stock sold!", "success");
      onClose();
    } else {
      setMsg(res.message || "Trade failed");
    }
  };

  const total = (stock.price * qty).toFixed(2);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-title">{stock.stock_name}</div>
        <div className="modal-sub">Execute a trade order</div>
        <div className="modal-price">₹{stock.price.toLocaleString()}</div>
        <div className="field">
          <label>Quantity</label>
          <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
          Total: <span style={{ color: "var(--accent)", fontWeight: 700 }}>₹{total}</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)" }}>
          Wallet: ₹{wallet?.toLocaleString() ?? "—"}
        </div>
        {msg && <div className="error-msg">{msg}</div>}
        <div className="modal-actions">
          <button className="btn-buy" disabled={loading} onClick={() => trade("BUY")}>BUY</button>
          <button className="btn-sell" disabled={loading} onClick={() => trade("SELL")}>SELL</button>
        </div>
      </div>
    </div>
  );
}

// ─── Pages ───────────────────────────────────────────────────────────────────
function MarketPage({ onTrade, wallet }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get("/stocks/get-all").then((r) => {
      setStocks(r.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /><span>Loading market data...</span></div>;

  return (
    <>
      <div className="section-title">Live Market</div>
      <div className="section-sub">Click any stock to trade</div>
      {stocks.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🏪</div>No stocks available</div>
      ) : (
        <>
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">Total Stocks</div>
              <div className="stat-value">{stocks.length}</div>
            </div>
            <div className="stat-card green">
              <div className="stat-label">Highest Price</div>
              <div className="stat-value" style={{ color: "var(--accent3)" }}>
                ₹{Math.max(...stocks.map((s) => s.price)).toLocaleString()}
              </div>
            </div>
            <div className="stat-card red">
              <div className="stat-label">Lowest Price</div>
              <div className="stat-value" style={{ color: "var(--accent2)" }}>
                ₹{Math.min(...stocks.map((s) => s.price)).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="stocks-grid">
            {stocks.map((s) => (
              <div className="stock-card" key={s.stock_id} onClick={() => setSelected(s)}>
                <div className="stock-name">{s.stock_name}</div>
                <div className="stock-price">₹{s.price?.toLocaleString()}</div>
                <div className="stock-id">ID #{s.stock_id}</div>
              </div>
            ))}
          </div>
        </>
      )}
      {selected && (
        <TradeModal
          stock={selected}
          onClose={() => setSelected(null)}
          onDone={onTrade}
          wallet={wallet}
        />
      )}
    </>
  );
}

function PortfolioPage({ onSell }) {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState({});
  const [sellTarget, setSellTarget] = useState(null);
  const [sellQty, setSellQty] = useState(1);
  const [sellLoading, setSellLoading] = useState(false);
  const [sellMsg, setSellMsg] = useState(null);

  useEffect(() => {
    api.get("/users/get-all-stocks").then((r) => {
      if (r.statusCode >= 200 && r.statusCode < 300) setPortfolio(r.data || []);
      setLoading(false);
    });
    api.get("/stocks/get-all").then((r) => {
      const map = {};
      (r.data || []).forEach((s) => (map[s.stock_name] = s.price));
      setPrices(map);
    });
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /><span>Loading portfolio...</span></div>;

  const totalValue = portfolio.reduce((acc, p) => acc + (prices[p.stock_name] || 0) * p.quantity, 0);
  const totalCost = portfolio.reduce((acc, p) => acc + p.avg_buy_price * p.quantity, 0);
  const pnl = totalValue - totalCost;

  return (
    <>
      <div className="section-title">My Portfolio</div>
      <div className="section-sub">Your current holdings</div>
      {portfolio.length > 0 && (
        <div className="stats-row" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-label">Holdings</div>
            <div className="stat-value">{portfolio.length}</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Market Value</div>
            <div className="stat-value" style={{ color: "var(--accent3)", fontSize: 20 }}>₹{totalValue.toFixed(0)}</div>
          </div>
          <div className={`stat-card ${pnl >= 0 ? "green" : "red"}`}>
            <div className="stat-label">Total P&L</div>
            <div className="stat-value" style={{ color: pnl >= 0 ? "var(--accent3)" : "var(--accent2)", fontSize: 20 }}>
              {pnl >= 0 ? "+" : ""}₹{pnl.toFixed(2)}
            </div>
          </div>
        </div>
      )}
      {portfolio.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">💼</div>No stocks in portfolio yet</div>
      ) : (
        portfolio.map((p) => {
          const cur = prices[p.stock_name] || p.avg_buy_price;
          const gain = (cur - p.avg_buy_price) * p.quantity;
          const isExpanded = sellTarget === p.stock_name;
          return (
            <div className="portfolio-item" key={p.portfolio_id}
              style={{ flexDirection:"column", alignItems:"stretch", gap:0 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div className="portfolio-left">
                  <div className="pf-name">{p.stock_name}</div>
                  <div className="pf-qty">{p.quantity} shares · Avg ₹{Number(p.avg_buy_price).toFixed(2)}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                  <div className="portfolio-right" style={{ textAlign:"right" }}>
                    <div className="pf-current">₹{cur.toLocaleString()}</div>
                    <div className={`pf-pnl ${gain >= 0 ? "pnl-pos" : "pnl-neg"}`}>
                      {gain >= 0 ? "+" : ""}₹{gain.toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={() => { setSellTarget(isExpanded ? null : p.stock_name); setSellQty(1); setSellMsg(null); }}
                    style={{
                      padding:"8px 16px", background: isExpanded ? "var(--accent2)" : "none",
                      border:"1px solid var(--accent2)", color: isExpanded ? "#000" : "var(--accent2)",
                      fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:11,
                      letterSpacing:1, cursor:"pointer", transition:"all 0.2s", whiteSpace:"nowrap"
                    }}>
                    {isExpanded ? "CANCEL" : "SELL"}
                  </button>
                </div>
              </div>

              {/* Inline sell panel */}
              {isExpanded && (
                <div style={{
                  marginTop:14, paddingTop:14, borderTop:"1px solid var(--border)",
                  display:"flex", alignItems:"center", gap:12, flexWrap:"wrap"
                }}>
                  <div style={{ fontSize:11, color:"var(--muted)" }}>Qty to sell:</div>
                  <input
                    type="number" min="1" max={p.quantity} value={sellQty}
                    onChange={(e) => setSellQty(Number(e.target.value))}
                    style={{
                      width:80, background:"var(--bg)", border:"1px solid var(--border)",
                      color:"var(--text)", fontFamily:"'IBM Plex Mono',monospace",
                      fontSize:13, padding:"6px 10px", outline:"none"
                    }}
                  />
                  <div style={{ fontSize:11, color:"var(--muted)" }}>
                    = <span style={{ color:"var(--accent3)", fontWeight:700 }}>
                        ₹{(cur * Math.min(sellQty, p.quantity)).toLocaleString()}
                      </span>
                  </div>
                  <button
                    disabled={sellLoading}
                    onClick={async () => {
                      if (sellQty < 1 || sellQty > p.quantity) {
                        setSellMsg("Invalid quantity");
                        return;
                      }
                      setSellLoading(true);
                      const res = await api.patch("/users/sell-stock", { name: p.stock_name, quantity: sellQty });
                      setSellLoading(false);
                      if (res.statusCode >= 200 && res.statusCode < 300) {
                        setSellTarget(null);
                        onSell("✅ Sold " + sellQty + " shares of " + p.stock_name);
                        // refresh portfolio
                        const r = await api.get("/users/get-all-stocks");
                        if (r.statusCode >= 200) setPortfolio(r.data || []);
                      } else {
                        setSellMsg(res.message || "Sell failed");
                      }
                    }}
                    style={{
                      padding:"8px 20px", background:"var(--accent2)", color:"#000",
                      border:"none", fontFamily:"'Syne',sans-serif", fontWeight:800,
                      fontSize:11, letterSpacing:1, cursor:"pointer"
                    }}>
                    {sellLoading ? "..." : "CONFIRM SELL"}
                  </button>
                  {sellMsg && <span style={{ color:"var(--accent2)", fontSize:11 }}>{sellMsg}</span>}
                </div>
              )}
            </div>
          );
        })
      )}
    </>
  );
}

function HistoryPage() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/users/get-all-trans").then((r) => {
      if (r.statusCode >= 200 && r.statusCode < 300) setTrades(r.data?.rows || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /><span>Loading history...</span></div>;

  return (
    <>
      <div className="section-title">Trade History</div>
      <div className="section-sub">All your executed orders</div>
      {trades.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📋</div>No trades yet</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Stock</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.trade_id}>
                  <td style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>{t.stock_name}</td>
                  <td><span className={t.trade_type === "BUY" ? "badge-buy" : "badge-sell"}>{t.trade_type}</span></td>
                  <td>{t.quantity}</td>
                  <td>₹{Number(t.price).toLocaleString()}</td>
                  <td style={{ color: t.trade_type === "BUY" ? "var(--accent2)" : "var(--accent3)" }}>
                    {t.trade_type === "SELL" ? "+" : "-"}₹{Number(t.total_amount).toLocaleString()}
                  </td>
                  <td style={{ color: "var(--muted)" }}>{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function LeaderboardPage() {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.patch("/users/leaderboard", {}).then((r) => {
      if (r.statusCode >= 200 && r.statusCode < 300) setBoard(r.data?.leaderboard || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /><span>Loading leaderboard...</span></div>;

  return (
    <>
      <div className="section-title">Leaderboard</div>
      <div className="section-sub">Top traders by portfolio value</div>
      {board.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🏆</div>No data available</div>
      ) : (
        <div className="table-wrap">
          {board.map((entry, i) => (
            <div className="lb-item" key={i}>
              <div className={`lb-rank ${i < 3 ? "top" : ""}`}>{i + 1}</div>
              <div className="lb-name">{entry.username || entry.user || `Trader #${i + 1}`}</div>
              <div className="lb-score">₹{Number(entry.balance || entry.total_value || 0).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function ChartPage() {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("30");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const fetch = async () => {
    if (!name) return;
    setLoading(true);
    setErr(null);
    const res = await api.getq("/stocks/get-graph", { name, duration: Number(duration) });
    setLoading(false);
    if (res.statusCode >= 200 && res.statusCode < 300) setData(res.data);
    else setErr(res.message);
  };

  return (
    <>
      <div className="section-title">Price Charts</div>
      <div className="section-sub">Historical price data for any stock</div>
      <div className="graph-search">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Stock name (e.g. AAPL)"
          onKeyDown={(e) => e.key === "Enter" && fetch()}
        />
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Points"
          style={{ width: 90, background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", fontFamily: "'IBM Plex Mono',monospace", padding: "10px 14px", fontSize: 13, outline: "none" }}
        />
        <button className="btn-search" onClick={fetch}>LOAD</button>
      </div>
      {loading && <div className="loading-wrap"><div className="spinner" /></div>}
      {err && <div className="empty-state" style={{ color: "var(--accent2)" }}>{err}</div>}
      {data && (
        <div className="chart-area">
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, marginBottom: 16 }}>{name} — Last {data.length} points</div>
          <LineChart data={data} stockName={name} />
        </div>
      )}
      {!data && !loading && !err && (
        <div className="empty-state"><div className="empty-icon">📈</div>Enter a stock name to view its chart</div>
      )}
    </>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("market");
  const [wallet, setWallet] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const fetchWallet = useCallback(() => {
    api.get("/users/get-wallet").then((r) => {
      if (r.statusCode >= 200 && r.statusCode < 300) {
        const bal = r.data?.balance ?? r.data?.[0]?.balance ?? null;
        setWallet(Number(bal));
      } else {
        setWallet(0);
      }
    });
  }, []);

  useEffect(() => {
    if (user) fetchWallet();
  }, [user, fetchWallet]);

  const logout = async () => {
    await api.post("/users/logout", {});
    clearToken();
    setUser(null);
    setPage("market");
    setWallet(null);
  };

  const navItems = [
    { id: "market", icon: "◈", label: "Market" },
    { id: "portfolio", icon: "◉", label: "Portfolio" },
    { id: "history", icon: "◎", label: "History" },
    { id: "chart", icon: "◇", label: "Charts" },
    { id: "leaderboard", icon: "◆", label: "Leaderboard" },
  ];

  if (!user) return (
    <>
      <style>{css}</style>
      <Auth onLogin={(u) => setUser(u)} />
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="layout">
        <div className="sidebar">
          <div className="sidebar-logo">▲ <span>APEX</span>TRADE</div>
          <nav className="nav">
            {navItems.map((n) => (
              <div key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
                <span className="nav-icon">{n.icon}</span>
                {n.label}
              </div>
            ))}
          </nav>
          <div className="sidebar-wallet">
            <div className="wallet-label">Wallet Balance</div>
            <div className="wallet-balance">
              {wallet !== null ? `₹${Number(wallet).toLocaleString()}` : <div className="spinner" />}
            </div>
          </div>
          <div style={{ padding: "0 12px 8px", fontSize: 11, color: "var(--muted)" }}>
            {user.username || user.email}
          </div>
          <button className="btn-logout" onClick={logout}>Sign Out</button>
        </div>
        <main className="main">
          {page === "market" && <MarketPage onTrade={(msg, type) => { showToast(msg, type); fetchWallet(); }} wallet={wallet} />}
          {page === "portfolio" && <PortfolioPage onSell={(msg) => { showToast(msg, "success"); fetchWallet(); }} />}
          {page === "history" && <HistoryPage />}
          {page === "chart" && <ChartPage />}
          {page === "leaderboard" && <LeaderboardPage />}
        </main>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}