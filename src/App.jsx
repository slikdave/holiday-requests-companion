import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════════════════
const MEM = {};
const load = async (k, shared = true) => {
  try { if (window.storage) { const r = await window.storage.get(k, shared); return r ? JSON.parse(r.value) : null; } }
  catch {}
  return MEM[k] ? JSON.parse(MEM[k]) : null;
};
const save = async (k, v, shared = true) => {
  MEM[k] = JSON.stringify(v);
  try { if (window.storage) await window.storage.set(k, JSON.stringify(v), shared); } catch {}
};
const loadP = (k) => load(k, false);
const saveP = (k, v) => save(k, v, false);

const KEY_EMP    = "nfh3_employees";
const KEY_REQS   = "nfh3_requests";
const KEY_MINBOX = "nfh3_master_inbox";
const KEY_CNOTIF = "nfh3_comp_notifs";
const KEY_DUSER  = "nfh3_device_user";

const uid  = () => Math.random().toString(36).slice(2, 10);
const fmtD = (d) => !d ? "—" : new Date(d + "T12:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const MONTHS_LONG  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS_SHORT   = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const YEARS = Array.from({ length: 12 }, (_, i) => new Date().getFullYear() - 2 + i);

const GM_BG  = "#f97316";
const GM_FG  = "#000000";
const GEO_BG = "#111111";
const GEO_FG = "#ffffff";

const empStyle = (emp) =>
  !emp ? { bg: "#16a34a", fg: "#fff" }
  : emp.group === "gm" ? { bg: GM_BG, fg: GM_FG }
  : { bg: GEO_BG, fg: GEO_FG };

const sortedDates = (set) => [...set].sort();

function MonthNav({ cal, setCal }) {
  const [open, setOpen] = useState(false);
  const tc = "#14532d", bc = "#dcfce7", pop = "#fff", bord = "#86efac";
  const btn = { background: bc, color: tc, border: "none", borderRadius: 5, padding: "5px 10px", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono',monospace" };
  return (
    <div style={{ position: "relative", marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button style={btn} onClick={() => setCal(c => c.m === 0 ? { y: c.y-1, m: 11 } : { ...c, m: c.m-1 })}>◀</button>
        <button onClick={() => setOpen(o => !o)} style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: "'Playfair Display',serif", color: tc, fontSize: 14, fontWeight: 700, padding: "4px 8px", borderRadius: 5 }}>
          {MONTHS_LONG[cal.m]} {cal.y} ▾
        </button>
        <button style={btn} onClick={() => setCal(c => c.m === 11 ? { y: c.y+1, m: 0 } : { ...c, m: c.m+1 })}>▶</button>
      </div>
      {open && (
        <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", background: pop, border: `1px solid ${bord}`, borderRadius: 10, padding: 10, zIndex: 300, boxShadow: "0 8px 30px rgba(0,0,0,.2)", width: 224 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <select value={cal.y} onChange={e => setCal(c => ({ ...c, y: +e.target.value }))}
              style={{ background: bc, border: `1px solid ${bord}`, borderRadius: 5, padding: "4px 7px", color: tc, fontFamily: "'DM Mono',monospace", fontSize: 12, cursor: "pointer" }}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={() => setOpen(false)} style={{ ...btn, padding: "4px 8px" }}>✕</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4 }}>
            {MONTHS_SHORT.map((mn, mi) => (
              <button key={mi} onClick={() => { setCal(c => ({ ...c, m: mi })); setOpen(false); }}
                style={{ padding: "5px 2px", borderRadius: 5, border: `1px solid ${cal.m === mi ? tc : bord}`, background: cal.m === mi ? tc : bc, color: cal.m === mi ? "#fff" : tc, cursor: "pointer", fontSize: 10, fontWeight: 700, fontFamily: "'DM Mono',monospace" }}>
                {mn}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PickerCal({ year, month, allRequests, employees, selectedDays, onToggleDay, dragStart, dragEnd, isDragging, onDragStart, onDragMove, onDragEnd, myEmpId }) {
  const first = new Date(year, month, 1).getDay();
  const last  = new Date(year, month + 1, 0).getDate();
  const cells = Array(first).fill(null).concat(Array.from({ length: last }, (_, i) => i + 1));
  const today = new Date();
  const approved = allRequests.filter(r => r.status === "approved");
  const pending  = allRequests.filter(r => r.status === "pending" && r.employeeId === myEmpId);
  const dragPreview = new Set();
  if (isDragging && dragStart && dragEnd) {
    const lo = dragStart <= dragEnd ? dragStart : dragEnd;
    const hi = dragStart <= dragEnd ? dragEnd   : dragStart;
    for (let d = 1; d <= last; d++) {
      const ds = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      if (ds >= lo && ds <= hi) dragPreview.add(ds);
    }
  }
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, marginBottom: 3 }}>
        {DAYS_SHORT.map(d => <div key={d} style={{ textAlign: "center", fontSize: 9, opacity: 0.55, fontFamily: "'DM Mono',monospace", color: "#166534" }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={`x${i}`} style={{ minHeight: 52 }} />;
          const ds = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
          const isSel   = selectedDays?.has(ds);
          const inDrag  = dragPreview.has(ds);
          const dayApp  = approved.filter(r => r.selectedDays ? r.selectedDays.includes(ds) : ds >= r.startDate && ds <= r.endDate);
          const dayPend = pending.filter(r => r.selectedDays ? r.selectedDays.includes(ds) : ds >= r.startDate && ds <= r.endDate);
          const isToday = today.getFullYear()===year && today.getMonth()===month && today.getDate()===d;
          let bg = "#f0fdf4";
          if (isSel)  bg = "#bbf7d0";
          if (inDrag) bg = "#dcfce788";
          if (dayApp.some(r => r.employeeId === myEmpId) && !isSel) bg = "#d1fae5";
          let border = "1px solid #d1fae5";
          if (isToday) border = "2px solid #16a34a";
          if (isSel)   border = "1px solid #16a34a";
          if (inDrag && !isSel) border = "1px dashed #16a34a";
          return (
            <div key={d}
              onClick={() => onToggleDay && onToggleDay(ds)}
              onMouseDown={() => onDragStart && onDragStart(ds)}
              onMouseEnter={() => isDragging && onDragMove && onDragMove(ds)}
              onMouseUp={() => onDragEnd && onDragEnd(ds)}
              style={{ minHeight: 52, borderRadius: 5, padding: "2px 3px", background: bg, border, cursor: onToggleDay ? "pointer" : "default", transition: "background .08s", overflow: "hidden", userSelect: "none" }}>
              <div style={{ fontSize: 10, fontWeight: isToday ? 900 : 600, color: isToday ? "#16a34a" : isSel ? "#14532d" : "#374151", fontFamily: "'DM Mono',monospace", lineHeight: 1.3 }}>
                {d}{isSel ? " ✓" : ""}
              </div>
              {dayApp.map((r, ri) => {
                const emp = employees.find(e => e.id === r.employeeId);
                const { bg: eb, fg: ef } = empStyle(emp);
                return <div key={ri} style={{ fontSize: 8, borderRadius: 3, padding: "1px 3px", marginTop: 1, background: eb, color: ef, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "'DM Mono',monospace", fontWeight: 700, lineHeight: 1.4 }}>{(emp?.name||"?").split(" ")[0]}</div>;
              })}
              {dayPend.length > 0 && dayApp.length === 0 && (
                <div style={{ fontSize: 7, borderRadius: 3, padding: "1px 3px", marginTop: 1, background: "#f5c842", color: "#000", fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>pending</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CompanionApp() {
  const [employees,  setEmployees]  = useState([]);
  const [requests,   setRequests]   = useState([]);
  const [deviceUser, setDeviceUser] = useState(null);
  const [compNotifs, setCompNotifs] = useState([]);
  const [tab,        setTab]        = useState("home");
  const [teamCal,    setTeamCal]    = useState({ y: new Date().getFullYear(), m: new Date().getMonth() });
  const [reqCal,     setReqCal]     = useState({ y: new Date().getFullYear(), m: new Date().getMonth() });
  const [pickedDays, setPickedDays] = useState(new Set());
  const [drag,       setDrag]       = useState({ start: null, end: null, active: false });
  const [note,       setNote]       = useState("");
  const [viewId,     setViewId]     = useState(null);
  const [toast,      setToast]      = useState(null);

  const toast$ = (msg, t = "ok") => { setToast({ msg, t }); setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
    (async () => {
      const du = await loadP(KEY_DUSER);
      if (du) { setDeviceUser(du); setViewId(du.id); }
      const e = await load(KEY_EMP);  if (e) setEmployees(e);
      const r = await load(KEY_REQS); if (r) setRequests(r);
      const cn = await loadP(KEY_CNOTIF); if (cn) setCompNotifs(cn);
    })();
    const iv = setInterval(async () => {
      const e  = await load(KEY_EMP);     if (e)  setEmployees(e);
      const r  = await load(KEY_REQS);    if (r)  setRequests(r);
      const cn = await loadP(KEY_CNOTIF); if (cn) setCompNotifs(cn);
    }, 1500);
    return () => clearInterval(iv);
  }, []);

  const lockDevice = async (empId) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;
    setDeviceUser(emp); setViewId(emp.id);
    await saveP(KEY_DUSER, emp);
    setTab("teamcal"); toast$(`Welcome ${emp.name}! This device is now yours.`);
  };

  const submitRequest = async () => {
    if (!deviceUser || pickedDays.size === 0) return;
    const days = sortedDates(pickedDays);
    const req = { id: uid(), employeeId: deviceUser.id, selectedDays: days, startDate: days[0], endDate: days[days.length-1], note: note.trim(), status: "pending", createdAt: Date.now() };
    const u = [...requests, req];
    setRequests(u); await save(KEY_REQS, u);
    const mi = (await loadP(KEY_MINBOX)) || [];
    await saveP(KEY_MINBOX, [...mi, { id: uid(), requestId: req.id, createdAt: Date.now() }]);
    setPickedDays(new Set()); setNote("");
    toast$("Request submitted! Awaiting approval ✉️"); setTab("feed");
  };

  const cancelReq = async (reqId) => {
    const upd = requests.map(r => r.id === reqId ? { ...r, status: "cancelled", cancelledAt: Date.now() } : r);
    setRequests(upd); await save(KEY_REQS, upd);
    const mi = (await loadP(KEY_MINBOX)) || [];
    await saveP(KEY_MINBOX, mi.filter(n => n.requestId !== reqId));
    toast$("Request cancelled");
  };

  const dismissNotif = async (id) => {
    const u = compNotifs.filter(n => n.id !== id);
    setCompNotifs(u); await saveP(KEY_CNOTIF, u);
  };

  const dragStart = (ds) => setDrag({ start: ds, end: ds, active: true });
  const dragMove  = (ds) => setDrag(d => ({ ...d, end: ds }));
  const dragEnd   = (ds) => {
    if (!drag.start) return;
    const lo = drag.start <= ds ? drag.start : ds;
    const hi = drag.start <= ds ? ds : drag.start;
    const added = new Set(pickedDays);
    const cur = new Date(lo + "T12:00:00"), end = new Date(hi + "T12:00:00");
    while (cur <= end) { added.add(cur.toISOString().slice(0,10)); cur.setDate(cur.getDate()+1); }
    setPickedDays(added);
    setDrag({ start: null, end: null, active: false });
  };
  const toggleDay = (ds) => {
    if (drag.active) return;
    const next = new Set(pickedDays);
    next.has(ds) ? next.delete(ds) : next.add(ds);
    setPickedDays(next);
  };

  const myReqs  = requests.filter(r => deviceUser && r.employeeId === deviceUser.id);
  const newNots = compNotifs.length;
  const gmEmps  = employees.filter(e => e.group === "gm");
  const geoEmps = employees.filter(e => e.group === "geo");
  const visReqs = requests.filter(r => r.status !== "deleted");

  const S = {
    wrap: { minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f0fdf4", color: "#14532d", fontFamily: "'Playfair Display',serif" },
    hdr:  { background: "linear-gradient(160deg,#dcfce7,#bbf7d0)", borderBottom: "2px solid #86efac", padding: "14px 16px" },
    nav:  { display: "flex", background: "#dcfce7", borderBottom: "1px solid #86efac", overflowX: "auto" },
    nb:   (a) => ({ flexShrink: 0, padding: "10px 14px", border: "none", cursor: "pointer", fontFamily: "'DM Mono',monospace", fontSize: 11, fontWeight: 700, background: "transparent", color: a ? "#14532d" : "#6b7280", borderBottom: a ? "2px solid #16a34a" : "2px solid transparent", whiteSpace: "nowrap" }),
    body: { flex: 1, padding: 16, maxWidth: 680, margin: "0 auto", width: "100%" },
    card: (bd = "#86efac", bg = "#fff") => ({ background: bg, border: `1px solid ${bd}`, borderRadius: 10, padding: 14, marginBottom: 10, boxShadow: "0 1px 4px #86efac33" }),
    btn:  (bg, fg = "#fff") => ({ background: bg, color: fg, border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono',monospace", whiteSpace: "nowrap" }),
    inp:  { background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, padding: "8px 10px", color: "#14532d", fontFamily: "'DM Mono',monospace", fontSize: 12, outline: "none", width: "100%" },
    sel:  { background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, padding: "8px 10px", color: "#14532d", fontFamily: "'DM Mono',monospace", fontSize: 12, outline: "none", width: "100%" },
    bdg:  (bg, fg = "#fff") => ({ background: bg, color: fg, borderRadius: 99, padding: "2px 8px", fontSize: 10, fontWeight: 700, fontFamily: "'DM Mono',monospace", display: "inline-block" }),
  };

  if (!deviceUser) {
    return (
      <div style={S.wrap}>
        <div style={S.hdr}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#14532d" }}>🌱 Holiday Requests</div>
            <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "'DM Mono',monospace", marginTop: 2 }}>Staff App</div>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 420, width: "100%" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>🌿</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#14532d", marginBottom: 6 }}>Welcome!</div>
              <div style={{ fontSize: 13, color: "#6b7280", fontFamily: "'DM Mono',monospace", lineHeight: 1.6 }}>
                Select your name to set up this device.<br />
                <strong>This cannot be changed later</strong> — choose carefully.
              </div>
            </div>
            {employees.length === 0 ? (
              <div style={{ ...S.card(), textAlign: "center", color: "#9ca3af", fontFamily: "'DM Mono',monospace", padding: 24 }}>
                ⏳ Waiting for your manager to add staff in the Master App…
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {gmEmps.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: "#f97316", marginBottom: 6, letterSpacing: "0.1em" }}>── GM ──</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {gmEmps.map(e => (
                        <button key={e.id} onClick={() => lockDevice(e.id)}
                          style={{ background: GM_BG, color: GM_FG, border: "none", borderRadius: 10, padding: "12px 16px", cursor: "pointer", fontFamily: "'DM Mono',monospace", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#00000022", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16 }}>{e.name[0]}</div>
                          {e.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {geoEmps.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: "#4b5563", marginBottom: 6, letterSpacing: "0.1em" }}>── George ──</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {geoEmps.map(e => (
                        <button key={e.id} onClick={() => lockDevice(e.id)}
                          style={{ background: GEO_BG, color: GEO_FG, border: "1px solid #333", borderRadius: 10, padding: "12px 16px", cursor: "pointer", fontFamily: "'DM Mono',monospace", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#ffffff22", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16 }}>{e.name[0]}</div>
                          {e.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { bg: userBg, fg: userFg } = empStyle(deviceUser);

  return (
    <div style={S.wrap}>
      <div style={S.hdr}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#14532d" }}>🌱 Holiday Requests</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
              <div style={{ padding: "2px 8px", borderRadius: 5, background: userBg, color: userFg, fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono',monospace" }}>{deviceUser.name}</div>
              <span style={{ fontSize: 9, color: "#9ca3af", fontFamily: "'DM Mono',monospace" }}>· {deviceUser.group === "gm" ? "GM" : "George"} · device locked</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {newNots > 0 && <span style={{ ...S.bdg("#f5c842","#1a1a00"), cursor: "pointer", fontSize: 12 }} onClick={() => setTab("home")}>🔔 {newNots}</span>}
            <span style={S.bdg("#bbf7d0","#14532d")}>{myReqs.filter(r=>r.status==="approved").length} approved</span>
          </div>
        </div>
      </div>
      <div style={S.nav}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", width: "100%" }}>
          {[["home","🏠 Home"],["teamcal","📅 Team Calendar"],["request","✏️ Request"],["feed","📋 My Requests"]].map(([k,l]) => (
            <button key={k} style={S.nb(tab===k)} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
      </div>
      <div style={S.body}>
        {tab === "home" && (
          <div>
            {compNotifs.map(n => (
              <div key={n.id} style={{ ...S.card(n.type==="approved"?"#4ade80":n.type==="deleted"?"#9ca3af":"#f87171", n.type==="approved"?"#f0fdf4":n.type==="deleted"?"#f9fafb":"#fff1f2"), borderLeft: `4px solid ${n.type==="approved"?"#16a34a":n.type==="deleted"?"#9ca3af":"#dc2626"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, color: n.type==="approved"?"#14532d":n.type==="deleted"?"#6b7280":"#991b1b", fontFamily: "'DM Mono',monospace", fontSize: 13 }}>
                    {n.type==="approved" ? "✅ Request Approved!" : n.type==="deleted" ? "🗑 Entry Removed by Manager" : "❌ Request Denied"}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "'DM Mono',monospace", marginTop: 2 }}>
                    {n.selectedDays?.length > 0 ? `${n.selectedDays.length} day${n.selectedDays.length>1?"s":""}: ${fmtD(n.selectedDays[0])}${n.selectedDays.length>1?` → ${fmtD(n.selectedDays[n.selectedDays.length-1])}`:""}` : `${fmtD(n.startDate)}${n.startDate!==n.endDate?` → ${fmtD(n.endDate)}`:""}`}
                  </div>
                </div>
                <button style={S.btn("#e5e7eb","#374151")} onClick={() => dismissNotif(n.id)}>✕</button>
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[{l:"Pending",n:myReqs.filter(r=>r.status==="pending").length,bg:"#fef3c7",c:"#92400e",i:"⏳"},{l:"Approved",n:myReqs.filter(r=>r.status==="approved").length,bg:"#dcfce7",c:"#14532d",i:"✅"},{l:"Denied",n:myReqs.filter(r=>["denied","deleted","cancelled"].includes(r.status)).length,bg:"#fee2e2",c:"#991b1b",i:"❌"}].map(x => (
                <div key={x.l} style={{ background: x.bg, borderRadius: 10, padding: "12px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 24 }}>{x.i}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: x.c, fontFamily: "'DM Mono',monospace" }}>{x.n}</div>
                  <div style={{ fontSize: 11, color: x.c, fontFamily: "'DM Mono',monospace" }}>{x.l}</div>
                </div>
              ))}
            </div>
            <div style={S.card()}>
              <div style={{ fontSize: 12, color: "#166534", fontFamily: "'DM Mono',monospace", fontWeight: 700, marginBottom: 8 }}>View a Colleague's Holidays</div>
              <select style={S.sel} value={viewId||deviceUser.id} onChange={e => setViewId(e.target.value)}>
                <optgroup label="GM">{gmEmps.map(e => <option key={e.id} value={e.id}>{e.name}{e.id===deviceUser.id?" (you)":""}</option>)}</optgroup>
                <optgroup label="George">{geoEmps.map(e => <option key={e.id} value={e.id}>{e.name}{e.id===deviceUser.id?" (you)":""}</option>)}</optgroup>
              </select>
              {viewId !== deviceUser.id && <div style={{ marginTop: 8, padding: "6px 10px", background: "#fef9c3", borderRadius: 6, fontSize: 11, color: "#92400e", fontFamily: "'DM Mono',monospace" }}>👁 Read-only</div>}
              <div style={{ marginTop: 10 }}>
                {visReqs.filter(r => r.employeeId===viewId && r.status==="approved").sort((a,b) => a.startDate.localeCompare(b.startDate)).slice(0,6).map(r => {
                  const days = r.selectedDays || [];
                  return <div key={r.id} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid #dcfce7", fontSize:11, fontFamily:"'DM Mono',monospace", color:"#14532d" }}><span>{days.length>0?`${fmtD(days[0])}${days.length>1?` + ${days.length-1} more`:""}`: `${fmtD(r.startDate)}${r.startDate!==r.endDate?` → ${fmtD(r.endDate)}`:""}`}</span><span style={S.bdg("#bbf7d0","#14532d")}>✓</span></div>;
                })}
                {visReqs.filter(r=>r.employeeId===viewId&&r.status==="approved").length===0 && <div style={{ fontSize:11, color:"#9ca3af", fontFamily:"'DM Mono',monospace" }}>No approved holidays yet</div>}
              </div>
            </div>
          </div>
        )}
        {tab === "teamcal" && (
          <div>
            <MonthNav cal={teamCal} setCal={setTeamCal} />
            <div style={S.card()}>
              <PickerCal year={teamCal.y} month={teamCal.m} allRequests={visReqs.filter(r=>r.status==="approved")} employees={employees} selectedDays={new Set()} isDragging={false} myEmpId={deviceUser.id} />
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:4 }}>
              {[{l:"GM",bg:GM_BG,fg:GM_FG},{l:"George",bg:GEO_BG,fg:GEO_FG}].map(x => (
                <div key={x.l} style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, fontFamily:"'DM Mono',monospace" }}>
                  <div style={{ width:20, height:12, borderRadius:3, background:x.bg, border:"1px solid #ccc" }} />
                  <span style={{ color:"#374151" }}>{x.l}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "request" && (
          <div>
            <div style={{ ...S.card("#86efac","#f0fdf4"), marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: "#166534", fontFamily: "'DM Mono',monospace", fontWeight: 700, marginBottom: 4 }}>How to select your days</div>
              <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "'DM Mono',monospace", lineHeight: 1.7 }}>• <strong>Click</strong> any day to toggle it on / off<br />• <strong>Drag</strong> across days to select a range<br />• Click a day with ✓ to deselect it</div>
            </div>
            <MonthNav cal={reqCal} setCal={setReqCal} />
            <div style={S.card()}>
              <PickerCal year={reqCal.y} month={reqCal.m} allRequests={visReqs} employees={employees} selectedDays={pickedDays} onToggleDay={toggleDay} dragStart={drag.start} dragEnd={drag.end} isDragging={drag.active} onDragStart={dragStart} onDragMove={dragMove} onDragEnd={dragEnd} myEmpId={deviceUser.id} />
            </div>
            {pickedDays.size > 0 && (
              <>
                <div style={{ padding: "8px 12px", background: "#dcfce7", borderRadius: 8, fontSize: 11, color: "#14532d", fontFamily: "'DM Mono',monospace", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span><strong>{pickedDays.size}</strong> day{pickedDays.size!==1?"s":""} selected</span>
                  <button style={S.btn("#e5e7eb","#374151")} onClick={() => setPickedDays(new Set())}>Clear all</button>
                </div>
                <div style={S.card()}>
                  <div style={{ fontSize: 11, color: "#166534", fontFamily: "'DM Mono',monospace", fontWeight: 700, marginBottom: 8 }}>Selected days — click ✕ to remove:</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                    {sortedDates(pickedDays).map(ds => (
                      <div key={ds} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 5, background: userBg, color: userFg, fontSize: 11, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>
                        {fmtD(ds)}<span onClick={() => toggleDay(ds)} style={{ cursor: "pointer", opacity: 0.6, marginLeft: 2, fontSize: 12 }}>✕</span>
                      </div>
                    ))}
                  </div>
                  <input style={S.inp} placeholder="Add a note (optional)…" value={note} onChange={e => setNote(e.target.value)} />
                  <button style={{ ...S.btn("#16a34a"), width: "100%", padding: "12px", marginTop: 10, fontSize: 13 }} onClick={submitRequest}>Submit {pickedDays.size} Day{pickedDays.size!==1?"s":""} Request →</button>
                </div>
              </>
            )}
          </div>
        )}
        {tab === "feed" && (
          <div>
            <div style={{ fontSize: 13, color: "#166534", fontFamily: "'DM Mono',monospace", fontWeight: 700, marginBottom: 12 }}>{deviceUser.name}'s Holiday Requests</div>
            {myReqs.length === 0 && <div style={{ ...S.card(), textAlign: "center", color: "#9ca3af", fontFamily: "'DM Mono',monospace", padding: 24 }}>No requests yet.<br /><button style={{ ...S.btn("#16a34a"), marginTop: 10 }} onClick={() => setTab("request")}>Make a Request →</button></div>}
            {[...myReqs].sort((a,b) => b.createdAt - a.createdAt).map(r => {
              const sc={pending:"#f5c842",approved:userBg,denied:"#f87171",deleted:"#9ca3af",cancelled:"#d1d5db"};
              const bg2={pending:"#fffbeb",approved:`${userBg}18`,denied:"#fff1f2",deleted:"#f9fafb",cancelled:"#f9fafb"};
              const fgc={pending:"#000",approved:userFg,denied:"#fff",deleted:"#fff",cancelled:"#374151"};
              const days=r.selectedDays||[];
              const isRemoved=["denied","deleted","cancelled"].includes(r.status);
              return (
                <div key={r.id} style={{ ...S.card(sc[r.status]||"#d1d5db",bg2[r.status]||"#f9fafb"), borderLeft:`4px solid ${sc[r.status]||"#d1d5db"}`, opacity:isRemoved?0.75:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", gap:5, alignItems:"center", marginBottom:5, flexWrap:"wrap" }}>
                        <span style={S.bdg(sc[r.status]||"#d1d5db",fgc[r.status]||"#374151")}>{r.status}</span>
                        {r.manualApproval && <span style={S.bdg("#7e22ce","#e9d5ff")}>manager</span>}
                      </div>
                      <div style={{ fontSize:11, fontFamily:"'DM Mono',monospace", color:"#14532d", marginBottom:4 }}>
                        {days.length>0?<div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>{sortedDates(new Set(days)).map(ds=>(<span key={ds} style={{ display:"inline-block", padding:"2px 6px", borderRadius:4, background:isRemoved?"#e5e7eb":`${userBg}33`, color:isRemoved?"#9ca3af":"#14532d", fontWeight:700, textDecoration:isRemoved?"line-through":"none", fontSize:10 }}>{fmtD(ds)}</span>))}</div>:<span style={{ textDecoration:isRemoved?"line-through":"none" }}>{fmtD(r.startDate)}{r.startDate!==r.endDate?` → ${fmtD(r.endDate)}`:""}</span>}
                      </div>
                      {r.note && <div style={{ fontSize:11, color:"#6b7280", fontFamily:"'DM Mono',monospace" }}>{r.note}</div>}
                      {isRemoved && <div style={{ fontSize:10, color:"#9ca3af", fontFamily:"'DM Mono',monospace", marginTop:4, fontStyle:"italic" }}>{r.status==="cancelled"?"You cancelled this":r.status==="deleted"?"Removed by manager":"Not approved"}</div>}
                    </div>
                    {r.status==="pending" && <button style={S.btn("#fecaca","#991b1b")} onClick={() => cancelReq(r.id)}>Cancel</button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {toast && <div style={{ position:"fixed", bottom:20, left:"50%", transform:"translateX(-50%)", background:toast.t==="err"?"#fee2e2":"#dcfce7", border:`1px solid ${toast.t==="err"?"#dc2626":"#16a34a"}`, color:toast.t==="err"?"#991b1b":"#14532d", padding:"10px 20px", borderRadius:8, fontSize:12, fontFamily:"'DM Mono',monospace", boxShadow:"0 4px 20px rgba(0,0,0,.15)", zIndex:999 }}>{toast.msg}</div>}
    </div>
  );
}
