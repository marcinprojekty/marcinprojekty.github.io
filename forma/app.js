(() => {
  "use strict";
  const KEY = "forma.v1";
  const NATIVE = window.formaNative || null;
  let firstRun = false, loadedFresh = false;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const pad2 = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const today = () => iso(/* @__PURE__ */ new Date());
  const parse = (s) => {
    const [y, m, d] = s.slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const addDays = (s, n) => {
    const d = parse(s);
    d.setDate(d.getDate() + n);
    return iso(d);
  };
  const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
  const nf = (d) => new Intl.NumberFormat("pl-PL", { minimumFractionDigits: d, maximumFractionDigits: d });
  const f0 = nf(0), f1 = nf(1), f2 = nf(2);
  const MINUS = "−";
  const signed = (v, f = f1) => (v > 0 ? "+" : v < 0 ? MINUS : "") + f.format(Math.abs(v));
  const MG = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];
  const MS = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];
  const WD = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"];
  const dShort = (s) => {
    const d = parse(s);
    return `${d.getDate()} ${MS[d.getMonth()]}`;
  };
  const dLong = (s, year = true) => {
    const d = parse(s);
    return `${d.getDate()} ${MG[d.getMonth()]}${year ? " " + d.getFullYear() : ""}`;
  };
  const dRel = (s) => {
    const n = diffDays(s, today());
    return n < 0 ? dShort(s) : n === 0 ? "dziś" : n === 1 ? "wczoraj" : n < 7 ? `${n} dni temu` : dShort(s);
  };
  const plural = (n, one, few, many) => {
    const a = Math.abs(n) % 100, b = a % 10;
    return n === 1 ? one : b >= 2 && b <= 4 && !(a >= 12 && a <= 14) ? few : many;
  };
  const days = (n) => `${f0.format(n)} ${plural(n, "dzień", "dni", "dni")}`;
  const uid = () => Math.random().toString(36).slice(2, 10);
  const safeUrl = (u) => typeof u === "string" && /^https?:\/\//i.test(u.trim());
  const motionMq = matchMedia("(prefers-reduced-motion: reduce)");
  const isReduced = () => motionMq.matches;
  const ICON = {
    body: '<circle cx="12" cy="4.5" r="2"/><path d="M7 8.5h10M12 8.5v6M12 14.5l-3 6.5M12 14.5l3 6.5M7 8.5l-1.5 5M17 8.5l1.5 5"/>',
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
    energy: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    pill: '<rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-45 12 12)"/><path d="m8.5 8.5 7 7"/>',
    drop: '<path d="M12 3s6.5 7 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 10 12 3 12 3z"/>',
    flask: '<path d="M9 3h6M10 3v6l-5.5 9.5A1.6 1.6 0 0 0 5.9 21h12.2a1.6 1.6 0 0 0 1.4-2.5L14 9V3"/><path d="M7.5 15h9"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    trend: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    bars: '<path d="M5 20V10M12 20V4M19 20v-7"/>',
    tick: '<path d="m5 12.5 4.5 4.5L19 7.5" stroke-width="3"/>',
    back: '<path d="M15 18l-6-6 6-6"/>',
    cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6"/>'
  };
  const ic = (name, cls = "ic") => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`;
  function freshState() {
    const t = today();
    return {
      version: 1,
      profile: { iso: false, skin: true, name: "", height: 180, birth: "1995-01-01", sex: "m", activity: 1.5, goal: "redukcja", ratePct: -0.5, startKcal: 2400, protein: 160, lead: 4, goalDate: "", upLo: 6, upHi: 10, legLo: 8, legHi: 15, benchLo: 80, benchHi: 90, method: "upper-lower", methodStart: "", benchGoal: 0, nextGoal: "", nextRate: 0.1, isoStart: "", isoMg: 0, isoSwitch: "", isoMg2: 0, isoEnd: "", isoKg: 0 },
      theme: "noc",
      days: {},
      sessions: {},
      lastImport: null,
      supps: SEED_SUPPS.map(([name, brand, pack, unit, dose, perWeek, iso2, note]) => ({ id: uid(), name, brand, pack, unit, dose, perWeek, iso: iso2, note, stock: 0, stockDate: null, active: true, url: "" })),
      skin: { routine: { am: SEED_ROUTINE.am.map((n) => ({ id: uid(), n })), pm: SEED_ROUTINE.pm.map((n) => ({ id: uid(), n })) }, products: [], checks: {} },
      labs: SEED_LABS.map(([date, name, value, unit, lo, hi, note]) => ({ id: uid(), date, name, value, unit, lo, hi, note: note || "" })),
      checkins: {},
      created: t
    };
  }
  function normalize(s) {
    const f = freshState();
    const obj = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : null;
    const arr = (v) => Array.isArray(v) ? v : null;
    const num = (v) => {
      if (v === null || v === "" || v === void 0) return void 0;
      const n = Number(v);
      return Number.isFinite(n) ? n : void 0;
    };
    const str = (v) => v == null ? "" : String(v);
    const day = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
    const id = (v) => str(v).replace(/[^\w-]/g, "") || uid();
    const own = (o) => Object.entries(o || {}).filter(([k]) => k !== "__proto__" && k !== "constructor" && k !== "prototype");
    s = obj(s) || {};
    const out = { ...f, version: 1, created: day(s.created) || f.created };
    const P = obj(s.profile) || {};
    for (const k of Object.keys(f.profile)) if (k in P) out.profile[k] = typeof f.profile[k] === "number" ? num(P[k]) ?? f.profile[k] : typeof f.profile[k] === "boolean" ? P[k] === true || P[k] === "true" : str(P[k]);
    if (!["redukcja", "rekompozycja", "masa"].includes(out.profile.goal)) out.profile.goal = f.profile.goal;
    if (!day(out.profile.birth)) out.profile.birth = f.profile.birth;
    if (!day(out.profile.goalDate)) out.profile.goalDate = f.profile.goalDate;
    if (!["", "redukcja", "rekompozycja", "masa"].includes(out.profile.nextGoal)) out.profile.nextGoal = "";
    for (const k of ["isoStart", "isoSwitch", "isoEnd"]) if (!day(out.profile[k])) out.profile[k] = "";
    out.theme = ["noc", "grafit", "bursztyn", "jasny"].includes(s.theme) ? s.theme : "noc";
    out.days = {};
    for (const [d, e] of own(obj(s.days))) {
      if (!day(d) || !obj(e)) continue;
      const o = {};
      for (const k of ["w", "kcal", "p", "f", "c", "steps"]) {
        const n = num(e[k]);
        if (n != null && n >= 0) o[k] = n;
      }
      if (e.note) o.note = str(e.note);
      out.days[d] = o;
    }
    if (obj(s.sessions)) {
      out.sessions = {};
      for (const [k, x] of own(s.sessions)) {
        if (!obj(x) || !arr(x.sets) || !day(str(x.date).slice(0, 10))) continue;
        const sid = str(k).replace(/[^\w :.-]/g, "");
        out.sessions[sid] = { id: sid, date: str(x.date).slice(0, 10), time: str(x.time), title: str(x.title), dur: str(x.dur), sets: x.sets.filter(obj).map((t) => ({ e: str(t.e), w: num(t.w) ?? 0, r: Math.max(0, Math.round(num(t.r) ?? 0)), t: ["NORMAL_SET", "DROP_SET", "LEFT_SET", "RIGHT_SET"].includes(t.t) ? t.t : "NORMAL_SET" })) };
      }
    }
    const li = obj(s.lastImport);
    out.lastImport = li ? { at: typeof li.at === "string" && !isNaN(Date.parse(li.at)) ? li.at : (/* @__PURE__ */ new Date()).toISOString(), source: str(li.source), added: num(li.added) ?? 0, updated: num(li.updated) ?? 0, same: num(li.same) ?? 0, total: num(li.total) ?? 0 } : null;
    if (arr(s.supps)) out.supps = s.supps.filter(obj).map((x) => ({ id: id(x.id), name: str(x.name), brand: str(x.brand), pack: num(x.pack) ?? 0, unit: str(x.unit), dose: num(x.dose) ?? 0, perWeek: Math.min(7, Math.max(1, Math.round(num(x.perWeek) ?? 7))), iso: x.iso === "uwaga" ? "uwaga" : "ok", note: str(x.note), stock: num(x.stock) ?? 0, stockDate: day(x.stockDate), per: num(x.per) > 0 ? num(x.per) : null, active: x.active !== false, url: safeUrl(x.url) ? str(x.url).trim() : "" }));
    const sk = obj(s.skin);
    if (sk) {
      const R = obj(sk.routine) || {};
      for (const part of ["am", "pm"]) if (arr(R[part])) out.skin.routine[part] = R[part].filter(obj).map((x) => ({ id: id(x.id), n: str(x.n), every: Math.min(30, Math.max(1, Math.round(num(x.every) ?? 1))) }));
      if (arr(sk.products)) out.skin.products = sk.products.filter(obj).map((p) => ({ id: id(p.id), name: str(p.name), step: str(p.step), opened: day(p.opened) || today(), est: Math.max(1, num(p.est) ?? 60), spare: Math.max(0, Math.round(num(p.spare) ?? 0)), history: (arr(p.history) || []).map(num).filter((n) => n != null && n > 0), buy: p.buy === true }));
      out.skin.checks = {};
      for (const [d, c] of own(obj(sk.checks))) {
        if (!day(d) || !obj(c)) continue;
        out.skin.checks[d] = {};
        for (const part of ["am", "pm"]) {
          const m = obj(c[part]);
          if (m) out.skin.checks[d][part] = Object.fromEntries(own(m).filter(([, v]) => v === true).map(([k]) => [id(k), true]));
        }
      }
    }
    if (arr(s.labs)) out.labs = s.labs.filter(obj).map((l) => ({ id: id(l.id), date: day(l.date) || today(), name: str(l.name), value: num(l.value) ?? 0, unit: str(l.unit), lo: num(l.lo) ?? null, hi: num(l.hi) ?? null, note: str(l.note) }));
    out.checkins = {};
    for (const [w, c] of own(obj(s.checkins))) {
      if (!day(w) || !obj(c)) continue;
      const o = { date: day(c.date) || w, hard: str(c.hard), good: str(c.good) };
      for (const [k] of CK_FIELDS) {
        const n = num(c[k]);
        if (n != null) o[k] = Math.min(5, Math.max(1, Math.round(n)));
      }
      out.checkins[w] = o;
    }
    out.cartOff = Object.fromEntries(own(obj(s.cartOff)).map(([k, v]) => [str(k), v === true]));
    const ost = ["ordered", "paid", "shipped", "ready", "delivered", "cancelled"];
    out.orders = (arr(s.orders) || []).filter(obj).slice(-200).map((o) => ({ key: id(o.key), shop: str(o.shop), no: o.no ? str(o.no) : null, date: day(o.date) || today(), status: ost.includes(o.status) ? o.status : "ordered", items: (arr(o.items) || []).filter(obj).slice(0, 40).map((x) => ({ item: str(x.item), name: str(x.name), qty: Math.min(20, Math.max(1, Math.round(num(x.qty) ?? 1))) })), tracking: o.tracking ? str(o.tracking) : null, courier: o.courier ? str(o.courier) : null, updated: typeof o.updated === "string" ? o.updated.slice(0, 30) : null, stocked: o.stocked === true }));
    out.mailSeen = (arr(s.mailSeen) || []).filter((x) => typeof x === "string").slice(-3e3).map((x) => x.slice(0, 300));
    out.mailInit = s.mailInit === true;
    out.rm = Object.fromEntries(own(obj(s.rm)).filter(([k, v]) => ["bench", "squat", "dead", "ohp"].includes(k) && num(v) > 0).map(([k, v]) => [k, num(v)]));
    out._ts = Object.fromEntries(own(obj(s._ts)).filter(([, v]) => typeof v === "number" && Number.isFinite(v)).slice(0, 2e4).map(([k, v]) => [String(k).slice(0, 300), v]));
    if (obj(s.cartMine)) out.cartMine = Object.fromEntries(own(s.cartMine).filter(([, v]) => arr(v)).slice(0, 200).map(([k, v]) => [str(k), [str(v[0]), str(v[1]), safeUrl(v[2]) ? str(v[2]) : null, num(v[3]) ?? null, str(v[4]), str(v[5])]]));
    if (arr(s.cartSame)) out.cartSame = s.cartSame.filter((x) => typeof x === "string").slice(0, 200);
    out.cartIn = Object.fromEntries(own(obj(s.cartIn)).filter(([, v]) => day(v)).map(([k, v]) => [str(k), day(v)]));
    out.cartPick = Object.fromEntries(own(obj(s.cartPick)).filter(([, v]) => v === "mine" || v === "alt").map(([k, v]) => [str(k), v]));
    out.cartSkip = Object.fromEntries(own(obj(s.cartSkip)).filter(([, v]) => v === true).map(([k]) => [str(k), true]));
    return out;
  }
  function load() {
    let raw = null;
    try {
      raw = NATIVE ? NATIVE.load() : localStorage.getItem(KEY);
      if (raw) return normalize(JSON.parse(raw));
      if (NATIVE && raw == null) firstRun = true;
    } catch (e) {
      console.warn(e);
      try {
        if (raw) localStorage.setItem(KEY + ".broken", raw);
      } catch {
      }
      setTimeout(() => toast("Zapisane dane były uszkodzone. Kopia leży w pamięci jako forma.v1.broken, wczytaj ostatnią kopię JSON w Ustawieniach."), 500);
    }
    const s = freshState();
    loadedFresh = true;
    return s;
  }
  let S;
  let version = 0;
  function persist() {
    if (DEMO) return true;
    try {
      const txt = JSON.stringify(S);
      if (NATIVE) NATIVE.save(txt);
      else localStorage.setItem(KEY, txt);
      return true;
    } catch (e) {
      toast("Nie udało się zapisać. Zrób kopię w Ustawieniach.");
      return false;
    }
  }
  function save(msg) {
    version++;
    stamp();
    if (!persist()) return;
    syncSoon();
    if (msg) toast(msg);
  }
  function parseCSV(text) {
    const rows = [];
    let row = [], f = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"') {
          if (text[i + 1] === '"') {
            f += '"';
            i++;
          } else q = false;
        } else f += c;
      } else if (c === '"') q = true;
      else if (c === ",") {
        row.push(f);
        f = "";
      } else if (c === "\n") {
        row.push(f);
        rows.push(row);
        row = [];
        f = "";
      } else if (c !== "\r") f += c;
    }
    if (f !== "" || row.length) {
      row.push(f);
      rows.push(row);
    }
    return rows.filter((r) => r.length > 1 || r[0]);
  }
  const clean = (s) => String(s || "").replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/\\(\d{3})/g, (_, o) => String.fromCharCode(parseInt(o, 8))).replace(/(\d)�/g, "$1°").replace(/�/g, "ł").replace(/\s+/g, " ").trim();
  function importCsv(state, text, source) {
    const rows = parseCSV(text.replace(/^﻿/, ""));
    if (!rows.length) throw new Error("Plik jest pusty.");
    const head = rows[0].map((h) => h.trim().toLowerCase());
    const col = (n) => head.indexOf(n);
    const iDate = col("date"), iEx = col("exercise");
    if (iDate < 0 || iEx < 0) throw new Error("To nie wygląda na eksport CSV z aplikacji treningowej (brak kolumn Date i Exercise).");
    const iTitle = col("title"), iDur = col("duration"), iW = col("weight"), iR = col("reps"), iT = col("set type");
    const map = /* @__PURE__ */ new Map();
    for (const r of rows.slice(1)) {
      const date = (r[iDate] || "").trim();
      if (!/^\d{4}-\d{2}-\d{2}/.test(date)) continue;
      let s = map.get(date);
      if (!s) {
        s = { id: date, date: date.slice(0, 10), time: date.slice(11, 16), title: clean(r[iTitle]), dur: (r[iDur] || "").trim(), sets: [] };
        map.set(date, s);
      }
      const reps = parseInt(r[iR], 10);
      s.sets.push({ e: clean(r[iEx]), w: parseFloat(r[iW]) || 0, r: Number.isFinite(reps) ? reps : 0, t: (r[iT] || "NORMAL_SET").trim() });
    }
    const newestFile = [...map.keys()].sort().pop() || "", newestHave = Object.keys(state.sessions).sort().pop() || "";
    const older = !!newestHave && newestFile < newestHave;
    let added = 0, updated = 0, same = 0, kept = 0;
    for (const [id, s] of map) {
      const old = state.sessions[id];
      if (!old) {
        state.sessions[id] = s;
        added++;
      } else if (JSON.stringify(old) === JSON.stringify(s)) same++;
      else if (older) kept++;
      else {
        state.sessions[id] = s;
        updated++;
      }
    }
    if (added || updated || !older) state.lastImport = { at: (/* @__PURE__ */ new Date()).toISOString(), source, added, updated, same, total: map.size, newest: newestFile.slice(0, 10) };
    return { added, updated, same, kept, older, newest: newestFile.slice(0, 10), total: map.size };
  }
  const groupOf = (() => {
    const m = /* @__PURE__ */ new Map();
    for (const [g, list] of Object.entries(window.MUSCLE || {})) for (const e of list) m.set(e.toLowerCase(), g);
    return (e) => m.get(e.toLowerCase()) || "Inne";
  })();
  const e1rm = (w, r) => w > 0 && r >= 1 ? r === 1 ? w : w * (1 + Math.min(r, 10) / 30) : 0;
  const sessionsSorted = () => Object.values(S.sessions).sort((a, b) => a.id < b.id ? 1 : -1);
  const durMin = (d) => {
    const [h, m] = String(d || "0:0").split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const durText = (d) => {
    const m = durMin(d);
    return m >= 60 ? `${Math.floor(m / 60)} h ${pad2(m % 60)} min` : `${m} min`;
  };
  function sessionLabel(s) {
    const c = {};
    let n = 0;
    for (const st of s.sets) {
      if (st.t === "DROP_SET") continue;
      const g = groupOf(st.e);
      if (g === "Brzuch" || g === "Przedramiona" || g === "Inne") continue;
      c[g] = (c[g] || 0) + 1;
      n++;
    }
    const top = Object.entries(c).sort((a, b) => b[1] - a[1]).filter(([, v]) => v / n >= 0.18).slice(0, 3).map(([g]) => g);
    return top.length ? top.map((g, i) => i ? g.toLowerCase() : g).join(" + ") : s.title || "Trening";
  }
  let exCache = { v: -1 };
  function exercises() {
    if (exCache.v === version) return exCache.data;
    const m = /* @__PURE__ */ new Map();
    for (const s of Object.values(S.sessions)) {
      for (const st of s.sets) {
        let x = m.get(st.e);
        if (!x) {
          x = { name: st.e, group: groupOf(st.e), sets: [], per: /* @__PURE__ */ new Map() };
          m.set(st.e, x);
        }
        x.sets.push({ ...st, date: s.date, sid: s.id });
        let p = x.per.get(s.id);
        if (!p) {
          p = { sid: s.id, date: s.date, sets: [], e1: 0, maxR: 0 };
          x.per.set(s.id, p);
        }
        p.sets.push(st);
        if (st.t !== "DROP_SET") {
          p.e1 = Math.max(p.e1, e1rm(st.w, st.r));
          p.maxR = Math.max(p.maxR, st.r);
        }
      }
    }
    const t = today();
    for (const x of m.values()) {
      x.history = [...x.per.values()].sort((a, b) => a.sid < b.sid ? -1 : 1);
      x.bw = x.sets.every((s) => !s.w);
      const metric = (p) => x.bw ? p.maxR : p.e1;
      let best = null;
      for (const p of x.history) if (!best || metric(p) > metric(best)) best = p;
      x.best = best;
      x.bestVal = best ? metric(best) : 0;
      const top = (p) => p.sets.filter((s) => s.t !== "DROP_SET").reduce((a, s) => !a || (x.bw ? s.r > a.r : e1rm(s.w, s.r) > e1rm(a.w, a.r)) ? s : a, null);
      x.last = x.history.at(-1);
      x.lastTop = x.last ? top(x.last) : null;
      x.bestTop = best ? top(best) : null;
      const recent = x.history.filter((p) => diffDays(p.date, t) <= 30);
      x.recentVal = recent.length ? Math.max(...recent.map(metric)) : null;
      x.ratio = x.recentVal != null && x.bestVal ? x.recentVal / x.bestVal : null;
      x.count = x.history.length;
      x.heaviest = x.sets.reduce((a, s) => s.t !== "DROP_SET" && s.w > (a?.w ?? -1) ? s : a, null);
      x.repPR = [];
      for (let r = 1; r <= 12; r++) {
        let b = null;
        for (const s of x.sets) if (s.t !== "DROP_SET" && s.r >= r && s.w > 0 && (!b || s.w > b.w)) b = s;
        x.repPR.push(b ? { r, w: b.w, reps: b.r, date: b.date } : { r, w: null });
      }
    }
    exCache = { v: version, data: m };
    return m;
  }
  function weeklyGroupSets(endDate = today(), span = 7) {
    const start = addDays(endDate, -(span - 1));
    const c = {};
    for (const s of Object.values(S.sessions)) {
      if (s.date < start || s.date > endDate) continue;
      for (const st of s.sets) {
        if (st.t === "DROP_SET") continue;
        const g = groupOf(st.e);
        c[g] = (c[g] || 0) + 1;
      }
    }
    return c;
  }
  const ALPHA = 0.1;
  function weightTrend() {
    const ds = Object.keys(S.days).filter((d) => S.days[d].w).sort();
    const out = [];
    let tr = null;
    let prev = null;
    for (const d of ds) {
      const w = S.days[d].w;
      const a = prev ? 1 - Math.pow(1 - ALPHA, Math.max(1, diffDays(prev, d))) : 1;
      tr = tr == null ? w : tr + a * (w - tr);
      out.push({ date: d, w, tr });
      prev = d;
    }
    return out;
  }
  const trendAt = (series, date) => {
    let v = null;
    for (const p of series) {
      if (p.date > date) break;
      v = p.tr;
    }
    return v;
  };
  function age() {
    const b = parse(S.profile.birth), n = /* @__PURE__ */ new Date();
    let a = n.getFullYear() - b.getFullYear();
    if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--;
    return a;
  }
  function energy() {
    const P = S.profile, t = today(), series = weightTrend();
    const bw = series.length ? series.at(-1).tr : 71;
    const bmr = 10 * bw + 6.25 * P.height - 5 * age() + (P.sex === "m" ? 5 : -161);
    const formula = Math.round(bmr * P.activity / 10) * 10;
    const win = 28, start = addDays(t, -(win - 1));
    const kd = Object.keys(S.days).filter((d) => d >= start && d <= t && S.days[d].kcal).sort();
    const inWin = series.filter((p) => p.date >= start);
    let tdee = null, method = "wzór", avgK = null, change = null, span = 0;
    if (kd.length) avgK = kd.reduce((a, d) => a + S.days[d].kcal, 0) / kd.length;
    let conf = null;
    if (kd.length >= 14 && inWin.length >= 7) {
      span = diffDays(inWin[0].date, inWin.at(-1).date);
      if (span >= 14) {
        const xs = inWin.map((p) => diffDays(inWin[0].date, p.date)), ys = inWin.map((p) => p.w);
        const mx = xs.reduce((a, b) => a + b, 0) / xs.length, my = ys.reduce((a, b) => a + b, 0) / ys.length;
        const slope = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / (xs.reduce((a, x) => a + (x - mx) ** 2, 0) || 1);
        change = slope * span;
        tdee = Math.round((avgK - slope * 7700) / 10) * 10;
        method = "dane";
        conf = span >= 21 && kd.length >= 21 ? "wysoka" : "niska";
      }
    }
    let rate = null;
    if (series.length >= 2) {
      const a = series.find((p) => p.date >= addDays(t, -14)), b = series.at(-1);
      if (a) {
        const sp = diffDays(a.date, b.date);
        if (sp >= 5) rate = (b.tr - trendAt(series, a.date)) / sp * 7;
      }
    }
    const value = tdee ?? formula;
    const rateKg = P.ratePct / 100 * bw;
    const target = Math.round((value + rateKg * 7700 / 7) / 10) * 10;
    const proteinTarget = P.protein;
    return { value, method, conf, formula, avgK, change, span, kcalDays: kd.length, win, rate, bw, target, rateKg, proteinTarget, series };
  }
  const daily = (x) => x.dose * x.perWeek / 7;
  function suppState(x) {
    if (!x.active) return { k: "off", left: 0, daysLeft: null };
    if (!x.stockDate) return { k: "none", left: 0, daysLeft: 0 };
    const left = Math.max(0, x.stock - daily(x) * Math.max(0, diffDays(x.stockDate, today())));
    const dl = daily(x) > 0 ? Math.floor(left / daily(x)) : Infinity;
    const k = left <= 0 ? "out" : dl <= S.profile.lead + 3 ? "soon" : "ok";
    return { k, left, daysLeft: dl, end: Number.isFinite(dl) ? addDays(today(), dl) : null };
  }
  function prodState(p) {
    const used = diffDays(p.opened, today());
    const est = p.history?.length ? Math.round(p.history.reduce((a, b) => a + b, 0) / p.history.length) : p.est;
    const spare = p.spare || 0, dl = Math.max(0, est - used) + spare * est;
    return { used, est, spare, daysLeft: dl, end: addDays(today(), dl), k: dl <= 7 ? "soon" : "ok", learned: !!p.history?.length };
  }
  function runningOut() {
    const out = [];
    for (const x of S.supps) {
      const st = suppState(x);
      if (st.k === "soon" || st.k === "out") out.push({ name: x.name, daysLeft: st.daysLeft, k: st.k, kind: "supp", id: x.id });
      else if (st.k === "ok" && st.daysLeft <= 30) out.push({ name: x.name, daysLeft: st.daysLeft, k: "ok", kind: "supp", id: x.id });
    }
    for (const p of S.skin.products) {
      if (p.buy) continue;
      const st = prodState(p);
      if (st.daysLeft <= 30) out.push({ name: p.name, daysLeft: st.daysLeft, k: st.daysLeft <= 7 ? "soon" : "ok", kind: "skin", id: p.id, approx: !st.learned });
    }
    return out.sort((a, b) => a.daysLeft - b.daysLeft);
  }
  function stepDue(part, x, date = today()) {
    for (let i = 1; i < (x.every || 1); i++) if (S.skin.checks[addDays(date, -i)]?.[part]?.[x.id]) return false;
    return true;
  }
  const dueSteps = (part, date = today()) => S.skin.routine[part].filter((x) => stepDue(part, x, date));
  function routineFull(d, part) {
    const r = dueSteps(part, d);
    const c = S.skin.checks[d]?.[part] || {};
    return r.length > 0 && r.every((x) => c[x.id]);
  }
  function isoState() {
    return null;
  }
  function benchForecast(b) {
    const goal = S.profile.benchGoal;
    if (!b || !(goal > 0)) return null;
    const cur = b.recentVal ?? b.bestVal;
    if (cur >= goal) return { goal, left: 0 };
    const t = today(), h = b.history.filter((p) => p.e1 && p.date >= addDays(t, -90));
    let date = null;
    if (h.length >= 4) {
      const xs = h.map((p) => diffDays(t, p.date)), ys = h.map((p) => p.e1);
      const mx = xs.reduce((a, c) => a + c, 0) / xs.length, my = ys.reduce((a, c) => a + c, 0) / ys.length;
      const slope = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / (xs.reduce((a, x) => a + (x - mx) ** 2, 0) || 1);
      const now = my - slope * mx;
      if (slope > 0.01) date = addDays(t, Math.ceil((goal - now) / slope));
    }
    return { goal, left: goal - cur, date };
  }
  function phaseCheck() {
    const P = S.profile;
    if (DEMO || !P.nextGoal || today() < P.goalDate) return;
    P.goal = P.nextGoal;
    P.ratePct = P.nextRate;
    P.nextGoal = "";
    P.goalDate = addDays(P.goalDate, 182);
    save(`Nowa faza: ${P.goal}, tempo ${signed(P.ratePct, f2)}% masy na tydzień`);
  }
  const main = $("#main");
  let firstPaint = true;
  function toast(msg, ms = 2800) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove("show"), ms);
  }
  const NAV = [
    ["pulpit", "Pulpit", "home"],
    ["wrzuc", "Wrzuć", "upload"],
    ["treningi", "Treningi", "dumbbell"],
    ["cialo", "Mięśnie", "body"],
    ["dieta", "Dieta i TDEE", "energy"],
    ["suplementy", "Suplementy", "pill"],
    ["koszyk", "Koszyk", "cart"],
    ["pielegnacja", "Pielęgnacja", "drop"],
    ["badania", "Badania", "flask"],
    ["checkin", "Check-in", "check"],
    ["raport", "Raport dla AI", "doc"]
  ];
  function renderNav(route2) {
    const soon = S.supps.filter((x) => ["soon", "out"].includes(suppState(x).k)).length;
    $("#nav").innerHTML = NAV.filter(([id]) => (id !== "pielegnacja" || S.profile.skin !== false) && !(DEMO && id === "raport")).map(([id, label, icon]) => `<a href="#/${id}" data-route="${id}"${route2 === id || ["cwiczenie", "trening", "metody"].includes(route2) && id === "treningi" ? ' aria-current="page"' : ""}>${ic(icon, "")}${label}${id === "suplementy" && soon ? `<span class="badge num" aria-label="${soon} do zamówienia">${soon}</span>` : ""}</a>`).join("");
    $$(".sidebar .foot a").forEach((a) => a.toggleAttribute("aria-current", route2 === "ustawienia"));
    if (route2 === "ustawienia") $(".sidebar .foot a").setAttribute("aria-current", "page");
  }
  function renderTop() {
    if (DEMO) $("#fresh").innerHTML = '<span class="demo-pill">Przykład</span> zmyślone dane, nic się nie zapisuje';
    const ss = sessionsSorted();
    const last = ss[0];
    const d = S.days[today()];
    if (!DEMO) $("#fresh").innerHTML = last ? `CSV: <b>${f0.format(ss.length)} ${plural(ss.length, "trening", "treningi", "treningów")}</b>, ostatni ${dRel(last.date)}${d ? " · dzisiejszy wpis zapisany" : " · <b>brak dzisiejszego wpisu</b>"}` : "Brak treningów: wrzuć eksport CSV z aplikacji treningowej";
    const T = [["noc", "Noc", "#638eff", "#0c0d0f"], ["grafit", "Grafit", "#c3c3c6", "#131314"], ["bursztyn", "Bursztyn", "#c7a36e", "#121110"], ["jasny", "Jasny", "#3e5a7c", "#f4f4f2"]];
    $("#themes").innerHTML = T.map(([id, n, a, g]) => `<button type="button" data-theme="${id}" aria-label="Motyw: ${n}" title="${n}" aria-pressed="${S.theme === id}" style="background:${a};border-color:${g === "#f4f4f2" ? "#c9c9c5" : "var(--control)"}"></button>`).join("");
  }
  function applyTheme() {
    document.documentElement.dataset.theme = S.theme;
    document.documentElement.classList.toggle("native", !!NATIVE);
    NATIVE?.theme(S.theme === "jasny");
  }
  const pending = [];
  function chart(fn) {
    pending.push(fn);
  }
  function animateLines(el) {
    if (isReduced() || !animateNext) return;
    const apply = () => {
      $$("svg path", el).forEach((p) => {
        const st = p.getAttribute("stroke");
        if (!st || st === "none" || p.getAttribute("stroke-dasharray") || p.getAttribute("fill") !== "none") return;
        const len = Math.ceil(p.getTotalLength());
        p.style.setProperty("--len", len);
        p.classList.add("ln");
      });
      el.classList.add("draw");
    };
    (document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(apply));
  }
  function animateRing(el) {
    const arc = $$("svg circle", el)[1];
    if (!arc) return;
    arc.classList.add("ring-arc");
    if (isReduced() || !animateNext) return;
    const target = arc.getAttribute("stroke-dasharray");
    const c = target.split(" ")[1];
    arc.setAttribute("stroke-dasharray", `0 ${c}`);
    requestAnimationFrame(() => requestAnimationFrame(() => arc.setAttribute("stroke-dasharray", target)));
  }
  function countUp() {
    if (isReduced() || !animateNext) return;
    $$("[data-count]", main).forEach((el) => {
      const to = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0, f = nf(dec);
      const t0 = performance.now(), dur = 800, from = to * 0.9;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = f.format(from + (to - from) * e);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      setTimeout(() => {
        el.textContent = f.format(to);
      }, dur + 150);
    });
  }
  let animateNext = true;
  function route() {
    const h = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
    const [r, ...rest] = h.split("/");
    return { r: r || "pulpit", arg: rest.join("/") };
  }
  function render(opts = {}) {
    phaseCheck();
    let { r, arg } = route();
    if (r === "demo") {
      if (!DEMO) {
        demoOn();
        return;
      }
      r = "pulpit";
      history.replaceState(null, "", "#/pulpit");
    }
    if (DEMO && r === "raport") {
      r = "pulpit";
      history.replaceState(null, "", "#/pulpit");
    }
    if (!DEMO && !S.profile.name && r !== "start" && r !== "ustawienia") {
      r = "start";
      history.replaceState(null, "", "#/start");
    }
    if (r === "start" && (S.profile.name || DEMO)) {
      r = "pulpit";
      history.replaceState(null, "", "#/pulpit");
    }
    document.body.classList.toggle("onboarding", r === "start");
    document.body.classList.toggle("demo", DEMO);
    animateNext = opts.animate !== false;
    renderNav(r);
    renderTop();
    const view = VIEWS[r] || VIEWS.pulpit;
    pending.length = 0;
    main.classList.toggle("fit", r === "pulpit" || !VIEWS[r]);
    try {
      main.innerHTML = (DEMO ? '<div class="demo-bar"><span class="demo-pill">Przykład</span><span class="grow">To zmyślone dane, nic się nie zapisuje.</span></div>' : "") + view(arg);
    } catch (e) {
      console.error(e);
      pending.length = 0;
      main.innerHTML = `<div class="title-row"><div><h1>Coś poszło nie tak</h1><div class="sub">Ten widok się nie wyświetlił (${esc(e.message)}). Inne zakładki powinny działać. Jeśli to się powtarza, w Ustawieniach pobierz kopię i wczytaj ją ponownie.</div></div><div class="actions"><a class="btn" href="#/ustawienia">Ustawienia</a></div></div>`;
    }
    $$(".grid", main).forEach((g) => [...g.children].forEach((c, i) => c.style.setProperty("--i", i)));
    if (animateNext) {
      main.classList.remove("view");
      void main.offsetWidth;
      main.classList.add("view");
    } else main.classList.remove("view");
    for (const fn of pending) {
      try {
        fn();
      } catch (e) {
        console.error(e);
      }
    }
    if (animateNext) countUp();
    if (animateNext) animateTitle();
    fillNative();
    fillMail();
    fillSync();
    if (opts.scroll !== false) window.scrollTo({ top: 0 });
    $("#sidebar").classList.remove("open");
    $("#menuBtn").setAttribute("aria-expanded", "false");
    firstPaint = false;
  }
  const rerender = () => render({ animate: false, scroll: false });
  const VIEWS = {};
  function greeting() {
    const h = (/* @__PURE__ */ new Date()).getHours();
    return h < 5 ? "Dobranoc" : h < 18 ? "Dzień dobry" : "Dobry wieczór";
  }
  function weekdayLong(s) {
    const d = parse(s);
    return `${WD[d.getDay()]}, ${d.getDate()} ${MG[d.getMonth()]}`;
  }
  VIEWS.pulpit = () => {
    const E = energy(), t = today(), ss = sessionsSorted(), last = ss[0], P = S.profile;
    const series = E.series, latest = series.at(-1);
    const ro = runningOut();
    const weeksLeft = Math.max(0, Math.ceil(diffDays(t, P.goalDate) / 7));
    let finding;
    if (!series.length) finding = "Zacznij od <b>wpisu dnia</b>: waga rano, kalorie i białko. Po 2 tygodniach policzę twoje prawdziwe spalanie.";
    else if (E.rate != null) finding = `Waga <b>${signed(E.rate, f2)} kg/tydz.</b>, cel ${signed(E.rateKg, f2)} kg/tydz.${P.goal === "masa" && E.rate > Math.max(0.15, E.rateKg * 2) ? " Przybierasz za szybko: zejdź o ok. 150 kcal." : ""}${ro.length && ro[0].k !== "ok" ? ` ${esc(ro[0].name)} ${ro[0].k === "out" ? "się skończył(a)" : "kończy się za " + days(ro[0].daysLeft)}.` : ""}`;
    else finding = `Masz <b>${series.length} ${plural(series.length, "pomiar", "pomiary", "pomiarów")}</b> wagi. Tempo policzę po 5 dniach pomiarów.`;
    const wCard = `<section class="card c5" data-go="#/dieta">
    <div class="card-head">${ic("trend")}<h2>Waga</h2>${E.rate != null ? `<div class="right"><span class="pill num">${signed(E.rate, f2)} kg / tydz.</span></div>` : ""}</div>
    ${latest ? `<div class="row"><div class="lead num"><span data-count="${latest.tr.toFixed(1)}" data-dec="1">${f1.format(latest.tr)}</span><span class="unit">kg</span></div><div class="faint">trend · ostatni pomiar ${f1.format(latest.w)} kg ${dRel(latest.date)}</div></div>
      <div class="chart fill" id="chWeight" style="margin-top:8px"></div>` : `<div class="lead num faint">–</div><div class="empty" style="margin-top:16px">Brak pomiarów. Zważ się rano po toalecie, przed jedzeniem, i dodaj <button class="link" data-act="log">wpis dnia</button>.</div>`}
    <div class="foot faint" style="font-size:13px">Cel: ${P.goal} do ${dLong(P.goalDate)} · ${weeksLeft} ${plural(weeksLeft, "tydzień", "tygodnie", "tygodni")}${P.nextGoal ? ` · potem ${P.nextGoal} ${signed(P.nextRate, f2)}%/tydz.` : ""}</div>
  </section>`;
    if (latest) chart(() => {
      const start = addDays(t, -29), labels = [], raw = [], tr = [];
      for (let i = 0; i < 30; i++) {
        const d = addDays(start, i);
        labels.push(dShort(d));
        const p = series.find((x) => x.date === d);
        raw.push(p ? p.w : null);
        tr.push(p ? p.tr : null);
      }
      const el = $("#chWeight");
      if (!raw.some((v) => v != null)) {
        el.innerHTML = '<div class="empty">Brak pomiarów w ostatnich 30 dniach.</div>';
        return;
      }
      Charts.line(el, { labels, series: [{ name: "Trend", values: fillGaps(tr) }, { name: "Pomiar", values: raw, colour: getVar("--chart-muted") }], format: (v) => f1.format(v) + " kg", tickFormat: (v) => f1.format(v), height: Math.max(80, el.clientHeight || 132), ...yRange(raw.concat(tr)) });
      el.querySelector(".chart-legend")?.remove();
      animateLines(el);
    });
    const dToday = S.days[t] || {};
    const ringV = dToday.kcal ? Math.min(1, dToday.kcal / E.target) : 0;
    const pr = dToday.p || 0;
    const eCard = `<section class="card c4" data-go="#/dieta">
    <div class="card-head">${ic("energy")}<h2>Energia</h2><div class="right">${E.method === "dane" ? `z ${E.kcalDays} dni${E.conf === "niska" ? " · niska pewność" : ""}` : "szacunek ze wzoru"}</div></div>
    <div class="kpi num">Spalanie ≈ <span data-count="${E.value}">${f0.format(E.value)}</span><span class="unit">kcal</span></div>
    <div class="split" style="margin-top:16px;align-items:center">
      <div><div class="chart" id="chRing" style="display:flex;justify-content:center"></div></div>
      <div class="stack">
        <span class="label">Cel na dziś</span><span class="num" style="font-size:16px">${f0.format(E.target)} kcal</span>
        <span class="label" style="margin-top:8px">Białko</span><span class="num" style="font-size:16px">${f0.format(pr)} <span class="faint">/ ${f0.format(E.proteinTarget)} g</span></span>
        <span style="height:4px;background:var(--chart-track);border-radius:9px;overflow:hidden;margin-top:4px"><span class="bar-fill" data-w="${Math.min(100, pr / E.proteinTarget * 100)}" style="display:block;height:100%;width:0;background:var(--accent);border-radius:9px"></span></span>
      </div>
    </div>
    ${E.method !== "dane" ? `<div class="foot faint" style="font-size:12px">Po 2 tygodniach wpisów spalanie policzę z twojej wagi i kalorii.</div>` : ""}
  </section>`;
    chart(() => {
      const el = $("#chRing");
      Charts.ring(el, { value: ringV, label: dToday.kcal ? f0.format(dToday.kcal) : "0", sub: `z ${f0.format(E.target)} kcal`, size: 112, stroke: 5 });
      animateRing(el);
    });
    let tCard;
    if (last) {
      const tops = topSets(last, 3);
      tCard = `<section class="card c3" data-go="#/trening/${encodeURIComponent(last.id)}">
      <div class="card-head">${ic("dumbbell")}<h2>Ostatni trening</h2><div class="right">${dRel(last.date)}</div></div>
      <a href="#/trening/${encodeURIComponent(last.id)}" style="font-size:16px;font-weight:500;text-decoration:none;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${esc(sessionLabel(last))}">${esc(cap(WD[parse(last.date).getDay()]))} · ${esc(sessionLabel(last))}</a>
      <div class="faint" style="margin-top:4px;display:flex;gap:6px;align-items:center">${ic("clock")} ${durText(last.dur)} · ${countSets(last)} serii</div>
      <ol class="list" style="margin-top:12px">${tops.map((s) => `<li><span class="grow"><a class="link" style="font-size:14px;color:var(--text)" href="#/cwiczenie/${encodeURIComponent(s.e)}">${esc(s.e)}</a></span><span class="num muted">${fmtSet(s)}</span></li>`).join("")}</ol>
      <div class="foot"><a class="link" href="#/trening/${encodeURIComponent(last.id)}" style="color:var(--text);white-space:nowrap">Podsumowanie i co dołożyć →</a><a class="link" href="#/treningi" style="margin-left:auto">Wszystkie</a></div>
    </section>`;
    } else tCard = `<section class="card c3"><div class="card-head">${ic("dumbbell")}<h2>Ostatni trening</h2></div><div class="empty">Brak treningów. Wrzuć eksport CSV z aplikacji treningowej obok.</div></section>`;
    const li = S.lastImport;
    const iCard = `<section class="card c4">
    <div class="card-head">${ic("upload")}<h2>Import treningów (CSV)</h2>${li ? `<div class="right">${dRel(iso(new Date(li.at)))}</div>` : ""}</div>
    <div class="drop" data-act="csv" tabindex="0" role="button" aria-label="Wybierz plik CSV z treningami">${ic("upload", "")}<span>Upuść plik CSV z treningami albo kliknij</span><small>Nowe treningi dopiszę, zmienione nadpiszę, nic się nie zdubluje.</small></div>
    ${li ? `<div class="faint" style="font-size:12px;margin-top:10px">Ostatnio: ${li.added} nowych, ${li.updated} zmienionych, ${li.same} bez zmian.</div>` : ""}
  </section>`;
    const stocked = S.supps.filter((x) => x.active && x.stockDate).length;
    const toBuy = S.supps.filter((x) => x.active && !x.stockDate).length;
    const near = ro.slice(0, 3);
    const rCard = `<section class="card c4" data-go="#/suplementy">
    <div class="card-head">${ic("clock")}<h2>Kończy się wkrótce</h2><div class="right">30 dni</div></div>
    ${ro.length ? runoutStrip(ro) : ""}
    ${near.length ? `<ul class="list">${near.map((x) => `<li><span class="grow">${esc(x.name)}</span><span class="num ${x.k === "out" ? "neg" : x.k === "soon" ? "warn" : "muted"}">${x.k === "out" ? "skończone" : (x.approx ? "~" : "") + days(x.daysLeft)}</span></li>`).join("")}</ul>` : `<div class="empty">${stocked ? "Nic się nie kończy w ciągu 30 dni." : `Żaden suplement nie jest w zapasie. ${toBuy} na liście do kupienia: kliknij „Kupiłem” przy tych, które zamówisz.`}</div>`}
    <div class="foot"><a class="link" href="#/suplementy">Suplementy →</a><a class="link" href="#/pielegnacja">Kosmetyki →</a></div>
  </section>`;
    const ex = exercises();
    const bench = ex.get("Bench Press") || [...ex.values()].sort((a, b) => b.count - a.count)[0];
    let sCard = `<section class="card c4"><div class="card-head">${ic("bars")}<h2>Siła</h2></div><div class="empty">Brak treningów.</div></section>`;
    if (bench) {
      const cur = bench.recentVal, best = bench.bestVal, fc = bench.name === "Bench Press" ? benchForecast(bench) : null;
      sCard = `<section class="card c4" data-go="#/cwiczenie/${encodeURIComponent(bench.name)}">
      <div class="card-head">${ic("bars")}<h2>Siła</h2><div class="right"><a class="link" href="#/cwiczenie/${encodeURIComponent(bench.name)}">${esc(bench.name)}</a></div></div>
      <div class="row"><div class="kpi num">${cur != null ? `<span data-count="${cur.toFixed(1)}" data-dec="1">${f1.format(cur)}</span>` : "–"}<span class="unit">kg</span></div><div class="faint">szac. 1RM, 30 dni · rekord ${f1.format(best)} kg</div></div>
      ${fc ? `<div class="faint" style="font-size:12px">cel ${f0.format(fc.goal)} kg: ${fc.left <= 0 ? "osiągnięty" : `brakuje ${f1.format(fc.left)} kg · ${fc.date ? `w tym tempie ok. ${dLong(fc.date)}` : "teraz bez wzrostu, terminu nie policzę"}`}</div>` : ""}
      <div class="chart fill" id="chBench" style="margin-top:8px"></div>
    </section>`;
      chart(() => {
        const from = addDays(today(), -182);
        const h = bench.history.filter((p) => p.date >= from && p.e1);
        const vals = h.map((p) => +p.e1.toFixed(1));
        const el = $("#chBench");
        if (!h.length) {
          el.innerHTML = '<div class="empty">Brak w ostatnich 6 miesiącach.</div>';
          return;
        }
        Charts.line(el, { labels: h.map((p) => dShort(p.date)), series: [{ name: "Szac. 1RM", values: vals }], format: (v) => f1.format(v) + " kg", tickFormat: (v) => f0.format(v), height: Math.max(70, el.clientHeight || 118), ...yRange(vals, 10) });
        animateLines(el);
      });
    }
    const part = (/* @__PURE__ */ new Date()).getHours() >= 15 ? "pm" : "am";
    const kCard = `<section class="card c4" data-go="#/pielegnacja">
    <div class="card-head">${ic("drop")}<h2>Pielęgnacja</h2><div class="right">${routineProgress("am")} rano · ${routineProgress("pm")} wieczór</div></div>
    <div style="font-weight:500;margin-bottom:4px">${part === "pm" ? "Wieczorna rutyna" : "Poranna rutyna"}</div>
    ${checklist(part, t, 3)}
    <div class="foot"><a class="link" href="#/pielegnacja">Rutyna i kosmetyki →</a></div>
  </section>`;
    const wk = weeklyGroupSets();
    const groups = ["Klatka", "Plecy", "Barki", "Biceps", "Triceps", "Nogi"];
    const maxG = Math.max(10, ...groups.map((g) => wk[g] || 0));
    const n7 = Object.values(S.sessions).filter((s) => diffDays(s.date, t) < 7 && s.date <= t).length;
    const wCard2 = `<section class="card c5" data-go="#/cialo">
    <div class="card-head">${ic("dumbbell")}<h2>Ten tydzień</h2><div class="right">serie robocze, 7 dni · ${n7} ${plural(n7, "trening", "treningi", "treningów")}</div></div>
    <ul class="list week-list">${groups.map((g) => {
      const v = wk[g] || 0;
      return `<li style="align-items:center;border-top:1px solid var(--rule)"><span style="width:76px;flex:none;white-space:nowrap" class="${v ? "" : "faint"}" title="${!v && lastGroupDate(g) ? "ostatnio " + dShort(lastGroupDate(g)) : ""}">${g}</span><span style="flex:1;height:4px;background:var(--chart-track);border-radius:9px;overflow:hidden"><span class="bar-fill" data-w="${v / maxG * 100}" style="display:block;height:100%;width:0;background:${g === "Nogi" && !v ? "var(--negative)" : "var(--accent)"};border-radius:9px"></span></span><span class="num ${v ? "" : "faint"}" style="min-width:28px;text-align:right;white-space:nowrap">${v || (lastGroupDate(g) ? `0 · ostatnio ${dShort(lastGroupDate(g))}` : "0")}</span></li>`;
    }).join("")}</ul>
  </section>`;
    const ck = lastCheckin();
    const cCard = `<section class="card c3" data-go="#/checkin">
    <div class="card-head">${ic("check")}<h2>Check-in tygodnia</h2></div>
    ${ck ? `<div class="stack" style="gap:6px">${CK_FIELDS.slice(0, 3).map(([k, l]) => `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px"><span class="muted">${l}</span>${dotsHtml(ck[k])}</div>`).join("")}</div><div class="faint" style="font-size:12px;margin-top:6px">z ${dShort(ck.date)}</div>` : `<div class="empty">Pierwszy check-in w niedzielę: sen, energia, stres, głód i to, co było trudne.</div>`}
    <div class="foot" style="flex-wrap:wrap"><a class="link" href="#/checkin">${isCheckinDue() ? "Zrób check-in →" : "Check-in →"}</a>${DEMO ? "" : '<a class="btn small primary" href="#/raport" style="margin-left:auto">Raport dla AI</a>'}</div>
  </section>`;
    chart(() => {
      const fill = () => $$(".bar-fill", main).forEach((b) => {
        b.style.transform = `scaleX(${b.dataset.w / 100})`;
      });
      if (!animateNext || isReduced()) fill();
      else {
        requestAnimationFrame(() => requestAnimationFrame(fill));
        setTimeout(fill, 300);
      }
    });
    return `<div class="title-row"><div><h1>${greeting()}, ${esc(P.name)}</h1><div class="sub">${cap(weekdayLong(t))} · <span class="finding">${finding}</span></div></div></div>
    <div class="grid stretch dash">${wCard}${eCard}${tCard}${iCard}${rCard}${sCard}${kCard}${wCard2}${cCard}</div>`;
  };
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const getVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function yRange(vals, step = 1) {
    const v = vals.filter((x) => x != null);
    if (!v.length) return {};
    const lo = Math.min(...v), hi = Math.max(...v);
    return { min: Math.floor((lo - step * 0.6) / step) * step, max: Math.ceil((hi + step * 0.4) / step) * step };
  }
  function fillGaps(a) {
    const out = [...a];
    let last = null;
    for (let i = 0; i < out.length; i++) {
      if (out[i] != null) last = out[i];
      else if (last != null && out.slice(i).some((v) => v != null)) out[i] = last;
    }
    return out;
  }
  const fmtSet = (s) => s.w ? `${f1.format(s.w).replace(",0", "")} kg × ${s.r}` : `${s.r} powt.`;
  const countSets = (s) => s.sets.filter((x) => x.t !== "DROP_SET").length;
  function topSets(s, n) {
    const best = /* @__PURE__ */ new Map();
    for (const st of s.sets) {
      if (st.t === "DROP_SET") continue;
      const v = e1rm(st.w, st.r);
      const b = best.get(st.e);
      if (!b || v > e1rm(b.w, b.r)) best.set(st.e, st);
    }
    return [...best.values()].filter((x) => x.w > 0).sort((a, b) => e1rm(b.w, b.r) - e1rm(a.w, a.r)).slice(0, n);
  }
  function monthsBack(n) {
    const d = /* @__PURE__ */ new Date();
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
      const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
      out.push(`${m.getFullYear()}-${pad2(m.getMonth() + 1)}`);
    }
    return out;
  }
  function lastGroupDate(g) {
    const s = sessionsSorted().find((x) => x.sets.some((st) => groupOf(st.e) === g));
    return s ? s.date : null;
  }
  function runoutStrip(items) {
    const marks = items.filter((x) => x.daysLeft <= 30);
    const ticks = [0, 7, 14, 21, 28];
    return `<div class="runout" aria-hidden="true"><div class="axis">
    ${ticks.map((d) => `<span class="tick" style="left:${d / 30 * 100}%">${d === 0 ? "dziś" : dShort(addDays(today(), d))}</span>`).join("")}
    <span class="today" style="left:0"></span>
    ${marks.map((x) => `<span class="mark ${x.k === "out" ? "out" : x.k === "soon" ? "warn" : ""}" style="left:${Math.min(30, x.daysLeft) / 30 * 100}%" title="${esc(x.name)}: ${x.k === "out" ? "skończone" : days(x.daysLeft)}"></span>`).join("")}
  </div></div>`;
  }
  function routineProgress(part) {
    const r = dueSteps(part);
    const c = S.skin.checks[today()]?.[part] || {};
    return `${r.filter((x) => c[x.id]).length}/${r.length}`;
  }
  function checklist(part, date, limit = Infinity) {
    const all = dueSteps(part, date), skip = S.skin.routine[part].filter((x) => !all.includes(x));
    const c = S.skin.checks[date]?.[part] || {};
    if (!S.skin.routine[part].length) return `<div class="empty">Brak kroków. Dodaj je w zakładce Pielęgnacja.</div>`;
    const r = all.slice(0, limit), more = all.length - r.length;
    return `<div>${r.map((x) => `<label class="check"><input type="checkbox" data-check="${part}:${x.id}:${date}" ${c[x.id] ? "checked" : ""}><span class="box">${ic("tick", "")}</span><span>${esc(x.n)}</span></label>`).join("")}${more > 0 ? `<div class="faint" style="font-size:12px;padding-top:2px">+${more} ${plural(more, "krok", "kroki", "kroków")} w zakładce Pielęgnacja</div>` : ""}${limit === Infinity && skip.length ? `<div class="faint" style="font-size:12px;padding-top:2px">Dziś bez: ${skip.map((x) => `${esc(x.n)} (co ${x.every} dni)`).join(", ")}</div>` : ""}</div>`;
  }
  const CK_FIELDS = [["sleep", "Sen"], ["energy", "Energia"], ["stress", "Stres"], ["hunger", "Głód"], ["diet", "Trzymanie diety"], ["recovery", "Regeneracja"]];
  function dotsHtml(v) {
    return `<span class="dots" aria-label="${v ?? "–"} z 5">${[1, 2, 3, 4, 5].map((i) => `<i class="${v >= i ? "on" : ""}"></i>`).join("")}</span>`;
  }
  function weekKey(s = today()) {
    const d = parse(s);
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    return iso(d);
  }
  function lastCheckin() {
    const k = Object.keys(S.checkins).sort().at(-1);
    return k ? S.checkins[k] : null;
  }
  function isCheckinDue() {
    const wk = weekKey();
    return !S.checkins[wk] && (/* @__PURE__ */ new Date()).getDay() === 0;
  }
  let exFilter = "";
  VIEWS.treningi = () => {
    const ss = sessionsSorted();
    const ex = [...exercises().values()];
    if (!ss.length) return `<div class="title-row"><div><h1>Treningi</h1><div class="sub">Brak danych. Wrzuć eksport CSV z aplikacji treningowej.</div></div></div><div class="grid"><section class="card c6">${dropZone()}</section></div>`;
    const first = ss.at(-1).date, t = today();
    const n28 = ss.filter((s) => diffDays(s.date, t) < 28).length, prev28 = ss.filter((s) => {
      const d = diffDays(s.date, t);
      return d >= 28 && d < 56;
    }).length;
    ex.sort((a, b) => a.last.sid < b.last.sid ? 1 : -1);
    const rows = ex.filter((x) => !exFilter || x.name.toLowerCase().includes(exFilter.toLowerCase()) || x.group.toLowerCase().includes(exFilter.toLowerCase()));
    const table = `<table class="rows ex"><thead><tr><th>Ćwiczenie</th><th class="num hide-phone">Ostatnio</th><th class="num">Ostatnia najlepsza seria</th><th class="num">Rekord ${"(szac. 1RM)"}</th><th class="num hide-phone">30 dni vs rekord</th></tr></thead>
    <tbody>${rows.map((x) => `<tr class="click" data-href="#/cwiczenie/${encodeURIComponent(x.name)}" tabindex="0"><td><span>${esc(x.name)}</span><span class="sub">${x.group} · ${x.count} ${plural(x.count, "trening", "treningi", "treningów")}</span></td>
      <td class="num muted hide-phone">${dRel(x.last.date)}</td>
      <td class="num" data-l="Ostatnio">${x.lastTop ? fmtSet(x.lastTop) : "–"}</td>
      <td class="num" data-l="Rekord (1RM)">${x.bw ? `${x.bestVal} powt.` : `${f1.format(x.bestVal)} kg`}<span class="sub">${x.best ? dShort(x.best.date) : ""}</span></td>
      <td class="num hide-phone ${x.ratio == null ? "faint" : x.ratio >= 0.999 ? "acc" : x.ratio < 0.9 ? "warn" : "muted"}">${x.ratio == null ? "–" : x.ratio >= 0.999 ? "rekord" : `${f0.format(x.ratio * 100)}%`}</td></tr>`).join("") || `<tr><td colspan="5" class="faint">Nic nie pasuje do „${esc(exFilter)}”.</td></tr>`}</tbody></table>`;
    chart(() => {
      const months = monthsBack(10);
      const vals = months.map((m) => ss.filter((s) => s.date.slice(0, 7) === m).length);
      Charts.bars($("#chMonths"), { labels: months.map((m) => MS[+m.slice(5) - 1]), values: vals, highlight: vals.length - 1, height: 150 });
    });
    const wk = weeklyGroupSets();
    const groups = ["Klatka", "Plecy", "Barki", "Biceps", "Triceps", "Nogi", "Brzuch"];
    return `<div class="title-row"><div><h1>Treningi</h1><div class="sub">${f0.format(ss.length)} ${plural(ss.length, "trening", "treningi", "treningów")} od ${dLong(first)} · ostatnie 28 dni: ${n28} (poprzednie 28: ${prev28})</div></div>
      <div class="actions"><button class="btn" data-act="csv">${ic("upload", "")}Importuj CSV</button></div></div>
    <div class="grid">
      ${(() => {
      const M = methodOf();
      return `<section class="card c12 method-now"><div class="card-head"><h2>Metoda</h2><div class="right">${esc(M.level)} · ${esc(M.days)}</div></div><div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><div class="grow" style="min-width:220px"><div class="m-name" style="margin:0">${esc(M.name)} <span class="faint" style="font-size:13px;font-family:var(--font)">${esc(M.by)}</span></div><div class="faint" style="font-size:13px;margin-top:4px">${esc(M.rule)}</div></div><a class="btn" href="#/metody">Zmień metodę</a></div></section>`;
    })()}
      <section class="card c8"><div class="card-head"><h2>Ćwiczenia</h2><div class="right"><input class="search" type="text" id="exSearch" placeholder="Szukaj ćwiczenia lub partii" value="${esc(exFilter)}" aria-label="Szukaj ćwiczenia"></div></div>${table}</section>
      <div class="c4" style="display:flex;flex-direction:column;gap:var(--gap)">
        <section class="card"><div class="card-head"><h2>Powrót do rekordów</h2><div class="right">najlepiej z 30 dni / rekord</div></div>
          <ul class="list">${goals().map((g) => `<li style="align-items:center"><a class="link grow" style="color:var(--text);font-size:14px" href="#/cwiczenie/${encodeURIComponent(g.x.name)}">${esc(g.x.name)}</a><span class="goalbar" style="max-width:90px"><span style="width:${Math.min(100, g.ratio * 100)}%"></span></span><span class="num ${g.ratio >= 0.999 ? "acc" : "muted"}" style="width:92px;text-align:right">${g.ratio >= 0.999 ? "rekord" : g.cur ? `−${f1.format(g.gap)} kg` : "brak w 30 dni"}</span></li>`).join("")}</ul>
          <div class="faint" style="font-size:12px;margin-top:8px">Szacowany 1RM; cel to rekord z kwietnia–czerwca.</div></section>
        <section class="card"><div class="card-head"><h2>Treningi w miesiącu</h2></div><div class="chart" id="chMonths"></div></section>
        <section class="card"><div class="card-head"><h2>Serie na partię</h2><div class="right">ostatnie 7 dni</div></div>
          <ul class="list">${groups.map((g) => `<li><span class="grow ${wk[g] ? "" : "faint"}">${g}</span><span class="num ${wk[g] ? "" : "faint"}">${wk[g] || 0}</span></li>`).join("")}</ul></section>
        <section class="card"><div class="card-head"><h2>Ostatnie treningi</h2></div>
          <ul class="list">${ss.slice(0, 10).map((s) => `<li><span class="grow"><a class="link" style="color:var(--text);font-size:14px" href="#/trening/${encodeURIComponent(s.id)}">${esc(sessionLabel(s))}</a><span class="faint" style="display:block;font-size:12px">${cap(WD[parse(s.date).getDay()])}, ${dShort(s.date)} · ${durText(s.dur)}</span></span><span class="num muted">${countSets(s)} serii</span></li>`).join("")}</ul></section>
      </div>
    </div>`;
  };
  function dropZone() {
    return `<div class="drop" data-act="csv" tabindex="0" role="button">${ic("upload", "")}<span>Upuść plik CSV z treningami albo kliknij</span><small>Nowe treningi dopiszę, zmienione nadpiszę.</small></div>`;
  }
  const kg = (w) => `${f1.format(w).replace(",0", "")} kg`;
  const roundStep = (v, st = 2.5) => Math.round(v / st) * st;
  function repRange(e) {
    const g = groupOf(e), P = S.profile;
    return g === "Nogi" ? [P.legLo, P.legHi] : g === "Brzuch" || g === "Przedramiona" ? [8, 15] : [P.upLo, P.upHi];
  }
  function goals() {
    return [...exercises().values()].filter((x) => !x.bw && x.count >= 8).sort((a, b) => b.count - a.count).slice(0, 8).map((x) => ({ x, cur: x.recentVal, ratio: x.recentVal ? x.recentVal / x.bestVal : 0, gap: x.recentVal ? x.bestVal - x.recentVal : x.bestVal }));
  }
  function topOf(p, bw, filter = () => true) {
    return p.sets.filter((s) => s.t !== "DROP_SET" && filter(s)).reduce((a, s) => !a || (bw ? s.r > a.r : e1rm(s.w, s.r) > e1rm(a.w, a.r)) ? s : a, null);
  }
  function analyzeSession(s) {
    const ex = exercises(), rows = [];
    for (const name of [...new Set(s.sets.map((x) => x.e))]) {
      const x = ex.get(name);
      if (!x) continue;
      const i = x.history.findIndex((p) => p.sid === s.id);
      if (i < 0) continue;
      const cur = x.history[i], prev = x.history[i - 1] || null, prev2 = x.history[i - 2] || null;
      const strengthWork = methodOf().id === "mentzer" && name === "Bench Press" && cur.sets.some((t) => t.t !== "DROP_SET" && t.r <= 3 && t.w > 0);
      const repFilter = strengthWork ? (t) => t.r >= 4 : () => true;
      const top = topOf(cur, x.bw, repFilter) || topOf(cur, x.bw);
      const ptop = prev ? topOf(prev, x.bw, repFilter) || topOf(prev, x.bw) : null;
      const val = (t) => t ? x.bw ? t.r : e1rm(t.w, t.r) : 0;
      let status = "new", delta = null;
      if (top && ptop) {
        delta = (val(top) - val(ptop)) / (val(ptop) || 1);
        status = delta >= 0.01 ? "up" : delta <= -0.02 ? "down" : "same";
      }
      const prevDown = prev && prev2 && (() => {
        const a = topOf(prev, x.bw, repFilter), b = topOf(prev2, x.bw, repFilter);
        return a && b && val(a) < val(b) * 0.98;
      })();
      const [lo, hi] = repRange(name);
      let advice = "", kind = "hold";
      if (!top) advice = "–";
      else if (x.bw) {
        if (top.r >= 15) {
          advice = "Ponad 15 powtórzeń: dodaj obciążenie.";
          kind = "add";
        } else advice = status === "down" ? `Słabiej: celuj w ${ptop.r} powt.` : `Celuj w ${top.r + 1} powt.`;
      } else if (!prev) advice = `Pierwszy raz w danych. Baza: ${fmtSet(top)}.`;
      else if (top.r >= hi) {
        const next = Math.max(top.w + 2.5, roundStep(top.w * 1.05));
        advice = `Dołóż: ${kg(next)}. Masz ${top.r} powt., góra zakresu to ${hi}.`;
        kind = "add";
      } else if (status === "down" && prevDown) {
        advice = "Drugi spadek z rzędu: dodaj dzień odpoczynku przed tą partią, ciężaru nie zmniejszaj.";
        kind = "rest";
      } else if (status === "down") advice = `Słabiej niż ${dShort(prev.date)}: zostań przy ${kg(top.w)} i celuj w ${ptop.w === top.w ? ptop.r : top.r + 1} powt.`;
      else if (top.r < lo) advice = `Poniżej ${lo} powt.: zostań przy ${kg(top.w)} i dobijaj powtórzenia.`;
      else advice = `Zostań przy ${kg(top.w)}, celuj w ${top.r + 1} powt. Przy ${hi} dołóż.`;
      let strength = null;
      if (strengthWork) {
        const ws = cur.sets.filter((t) => t.t !== "DROP_SET" && t.r <= 3 && t.w > 0);
        const w = Math.max(...ws.map((t) => t.w)), atW = ws.filter((t) => t.w === w), pr = x.bestVal;
        const pct = w / pr, lowW = roundStep(S.profile.benchLo / 100 * pr), highW = roundStep(S.profile.benchHi / 100 * pr);
        const doubles = atW.filter((t) => t.r >= 2).length;
        let next;
        if (pct < S.profile.benchLo / 100) next = `Dokładaj po 2,5 kg na trening, aż dojdziesz do ${kg(lowW)}–${kg(highW)}.`;
        else if (pct <= S.profile.benchHi / 100) next = doubles >= 5 ? `Pełne 5×2 zrobione: następnym razem ${kg(Math.min(highW, w + 2.5))}.` : `Zostań przy ${kg(w)} i zrób pełne 5×2 (dziś ${doubles} ${plural(doubles, "dwójka", "dwójki", "dwójek")}).`;
        else next = `To ponad ${S.profile.benchHi}% rekordu: nie dokładaj, trzymaj ${kg(highW)}.`;
        strength = { w, n: ws.length, sets: ws.map((t) => `${kg(t.w)}×${t.r}`).join(" · "), pct, lowW, highW, pr, next };
        if (top && top.r <= 3) {
          advice = `Siła 5×2: ${next}`;
          kind = "hold";
        }
      }
      const M = methodOf();
      if (M.id !== "mentzer" && !strength) {
        const ma = methodAdvice(M, name, x, cur, prev, prev2, top);
        if (ma) {
          advice = ma.text;
          kind = ma.kind;
        }
      }
      rows.push({ name, x, cur, prev, top, ptop, status, delta, advice, kind, strength, ratioPR: top && !x.bw && x.bestVal ? val(top) / x.bestVal : null });
    }
    return rows;
  }
  const VERD = { up: "lepiej", down: "gorzej", same: "bez zmian", new: "nowe" };
  const methodOf = () => (window.METHODS || []).find((m) => m.id === S.profile.method) || (window.METHODS || []).find((m) => m.id === "mentzer");
  const LIFTS = { bench: ["Wyciskanie na ławce", /^(barbell )?bench press$/i], squat: ["Przysiad", /(^|\s)squat/i], dead: ["Martwy ciąg", /deadlift/i], ohp: ["Wyciskanie nad głowę", /overhead press|military press|shoulder press/i] };
  function liftOf(name) {
    if (/romanian|stiff|rdl|sumo|dumbbell|sled|lever|smith|machine|cable|hack|kettlebell/i.test(name)) return null;
    for (const [k, [, re]] of Object.entries(LIFTS)) if (re.test(name)) return k;
    return null;
  }
  function liftMax(k) {
    if (S.rm?.[k] > 0) return { v: S.rm[k], from: "wpisany" };
    const since = addDays(today(), -90);
    let best = null, any = null;
    for (const x of exercises().values()) {
      if (x.bw || liftOf(x.name) !== k) continue;
      for (const h of x.history) {
        if (!any || h.e1 > any.v) any = { v: h.e1, from: x.name };
        if (h.date >= since && (!best || h.e1 > best.v)) best = { v: h.e1, from: x.name };
      }
    }
    return best || any;
  }
  const isLower = (name) => groupOf(name) === "Nogi" || /deadlift|squat/i.test(name);
  const pctSets = (list, base) => list.map(([p, r]) => `${kg(roundStep(base * p))}×${r}`).join(", ");
  const W531 = [[[0.65, "5"], [0.75, "5"], [0.85, "5+"]], [[0.7, "3"], [0.8, "3"], [0.9, "3+"]], [[0.75, "5"], [0.85, "3"], [0.95, "1+"]], [[0.4, "5"], [0.5, "5"], [0.6, "5"]]];
  const NSUNS = { bench: [[0.65, 8], [0.75, 6], [0.85, 4], [0.85, 4], [0.85, 4], [0.8, 5], [0.75, 6], [0.7, 7], [0.65, "8+"]], other: [[0.75, 5], [0.85, 3], [0.95, "1+"], [0.9, 3], [0.85, 3], [0.8, 3], [0.75, 5], [0.7, 5], [0.65, "5+"]] };
  const methodWeek = () => Math.max(0, Math.floor(diffDays(S.profile.methodStart || today(), today()) / 7));
  function methodAdvice(m, name, x, cur, prev, prev2, top) {
    const p = m.prog, lift = liftOf(name), low = isLower(name);
    const work = cur.sets.filter((t) => t.t !== "DROP_SET" && t.w > 0);
    const topW = work.length ? Math.max(...work.map((t) => t.w)) : 0, atTop = work.filter((t) => t.w === topW);
    const fails = (h) => {
      if (!h) return false;
      const ws = h.sets.filter((t) => t.t !== "DROP_SET" && t.w > 0);
      const w = Math.max(0, ...ws.map((t) => t.w));
      return ws.filter((t) => t.w === w && t.r >= (p.reps || 5)).length < (p.sets || 3);
    };
    const inc = p.inc ? low ? p.inc.lower : p.inc.upper : 2.5;
    if (x.bw || !top) return null;
    if (p.type === "linear" || p.type === "double" && p.main && lift) {
      const L = p.type === "linear" ? p : { ...p.main, inc: p.main.inc };
      const sets = lift === "dead" && L.deadSets ? L.deadSets : L.sets, step = lift === "dead" && L.deadInc ? L.deadInc : low ? L.inc.lower : L.inc.upper;
      const done = atTop.filter((t) => t.r >= L.reps).length >= sets;
      if (done) return { kind: "add", text: `${m.name}: pełne ${sets}×${L.reps} przy ${kg(topW)}. ${L.weekly ? "Za tydzień" : "Następnym razem"} ${kg(topW + step)}.` };
      if (fails(prev) && fails(prev2)) return { kind: "rest", text: `${m.name}: trzecia porażka z rzędu. Zejdź do ${kg(roundStep(topW * 0.9))} i buduj od nowa.` };
      return { kind: "hold", text: `${m.name}: zostań przy ${kg(topW)} i zrób pełne ${sets}×${L.reps} (dziś ${atTop.filter((t) => t.r >= L.reps).length}).` };
    }
    if (p.type === "tier") {
      if (lift) {
        const reps2 = Math.max(...atTop.map((t) => t.r)), stage = reps2 <= 1 ? "10×1" : reps2 <= 2 ? "6×2" : "5×3+";
        const need = stage === "10×1" ? 10 : stage === "6×2" ? 6 : 5, ok = atTop.length >= need;
        if (ok) return { kind: "add", text: `GZCLP T1 (${stage}): zaliczone. Następnym razem ${kg(topW + inc)} w tym samym schemacie.` };
        return { kind: "hold", text: stage === "5×3+" ? `GZCLP T1: nie wyszło 5×3. Zostań przy ${kg(topW)} i przejdź na 6×2.` : stage === "6×2" ? `GZCLP T1: nie wyszło 6×2. Przejdź na 10×1 przy ${kg(topW)}.` : `GZCLP T1: koniec etapów. Zrób test 5 powt. i zacznij 5×3 od 85% tego ciężaru.` };
      }
      const reps = Math.min(...atTop.map((t) => t.r)), last = atTop.at(-1)?.r || 0;
      if (atTop.length >= 3 && last >= 25) return { kind: "add", text: `GZCLP T3: ${last} powt. w ostatniej serii. Dołóż.` };
      if (reps >= 10 && atTop.length >= 3) return { kind: "add", text: `GZCLP T2: pełne 3×10. Następnym razem ${kg(topW + inc)}.` };
      return { kind: "hold", text: `GZCLP T2: ${reps < 6 ? "nie wyszło 3×6, zejdź o 15% i wróć do 3×10" : `zostań przy ${kg(topW)}, kolejny etap ${reps >= 8 ? "3×8" : "3×6"}`}.` };
    }
    if (p.type === "p531" || p.type === "nsuns" || p.type === "texas" || p.type === "percent" || p.type === "conjugate") {
      if (!lift) {
        const r = Math.min(...atTop.map((t) => t.r));
        return r >= 12 ? { kind: "add", text: `Akcesoria: ${r} powt., dołóż.` } : { kind: "hold", text: `Akcesoria: zostań przy ${kg(topW)}, celuj w 12 powt.` };
      }
      const mx = liftMax(lift);
      if (!mx) return null;
      const tm = mx.v * 0.9;
      if (p.type === "p531") {
        const wk = methodWeek() % 4;
        return { kind: "hold", text: `5/3/1, tydzień ${wk + 1} (ciężar treningowy ${kg(roundStep(tm))}): ${pctSets(W531[wk], tm)}.${wk === 3 ? " Tydzień lżejszy." : " Ostatnia seria na maksa."}` };
      }
      if (p.type === "nsuns") {
        const amrap = Math.max(...atTop.map((t) => t.r));
        const add = amrap <= 1 ? 0 : amrap <= 3 ? 2.5 : amrap <= 5 ? low ? 5 : 2.5 : 5;
        return { kind: add ? "add" : "hold", text: `nSuns T1 (ciężar treningowy ${kg(roundStep(tm))}): ${pctSets(lift === "bench" ? NSUNS.bench : NSUNS.other, tm)}. Po serii na maksa: ${add ? `+${kg(add)}` : "bez zmian"}.` };
      }
      if (p.type === "texas") {
        const five = mx.v / (1 + 5 / 30);
        return { kind: "hold", text: `Texas: poniedziałek 5×5 przy ${kg(roundStep(five * 0.9))}, środa 2×5 przy ${kg(roundStep(five * 0.72))}, piątek 1×5 przy ${kg(roundStep(five + inc))}.` };
      }
      if (p.type === "percent") return { kind: "hold", text: `Sheiko: ${p.zones.map((z) => `${Math.round(z * 100)}% = ${kg(roundStep(mx.v * z))}`).join(", ")} (rekord ${kg(roundStep(mx.v))}).` };
      if (p.type === "conjugate") {
        const me = Math.max(...atTop.map((t) => t.r)) <= 3;
        return me ? { kind: "hold", text: `Westside, dzień max: dziś ${fmtSet(top)}. Zmień wariant za 1–3 tygodnie.` } : { kind: "hold", text: `Westside, dzień szybkości: ${lift === "bench" ? "9×3" : "10–12×2"} przy ${kg(roundStep(mx.v * 0.5))}–${kg(roundStep(mx.v * 0.6))}, jak najszybciej.` };
      }
    }
    if (p.type === "double" && !p.profile) {
      const power = p.power && Math.max(...atTop.map((t) => t.r)) <= p.power.hi;
      const lo = power ? p.power.lo : p.legs && groupOf(name) === "Nogi" ? p.legs.lo : p.lo, hi = power ? p.power.hi : p.legs && groupOf(name) === "Nogi" ? p.legs.hi : p.hi;
      const minR = Math.min(...atTop.map((t) => t.r));
      if (minR >= hi) return { kind: "add", text: `${m.name}: ${hi} powt. we wszystkich seriach. Dołóż: ${kg(Math.max(topW + 2.5, roundStep(topW * 1.05)))} i zacznij od ${lo}.` };
      return { kind: "hold", text: `${m.name}: zostań przy ${kg(topW)}, celuj w ${Math.min(hi, minR + 1)} powt. (zakres ${lo}–${hi}).` };
    }
    return null;
  }
  VIEWS.metody = () => {
    const cur = methodOf(), lv = ["początkujący", "średni", "zaawansowany"];
    const card = (m) => `<section class="card c4 method${m.id === cur.id ? " on" : ""}">
    <div class="card-head"><h2>${esc(m.style)}</h2><div class="right">${esc(m.level)} · ${esc(m.days)}</div></div>
    <div class="m-name">${esc(m.name)}</div><div class="faint" style="font-size:12px;margin-top:-6px">${esc(m.by)}</div>
    <p class="m-sum">${esc(m.sum)}</p>
    <details class="m-more"><summary class="link">Plan i zasady</summary>
      ${m.plan.map(([d, ex]) => `<div class="m-day"><b>${esc(d)}</b><ul>${ex.map((e) => `<li>${esc(e)}</li>`).join("")}</ul></div>`).join("")}
      <div class="m-rule"><b>Kiedy dokładać:</b> ${esc(m.rule)}</div><div class="faint" style="font-size:12px">${esc(m.who)}</div>
      <div class="faint" style="font-size:11px;margin-top:6px">Źródła: ${m.src.map((s) => safeUrl(s) ? `<a class="link" href="${esc(s)}" target="_blank" rel="noopener">${esc(s.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""))}</a>` : esc(s)).join(" · ")}</div>
    </details>
    <div class="foot">${m.id === cur.id ? '<span class="pill">wybrana</span>' : `<button class="btn small primary" data-method="${m.id}">Wybierz</button>`}</div></section>`;
    const maxes = Object.entries(LIFTS).map(([k, [label]]) => {
      const mx = liftMax(k);
      return `<label class="field">${label} (1RM, kg)<input type="number" step="2.5" data-rm="${k}" value="${S.rm?.[k] || ""}" placeholder="${mx ? f1.format(mx.v) + " z danych" : "brak danych"}"></label>`;
    }).join("");
    return `<div class="title-row"><div><a class="link" href="#/treningi">← Treningi</a><h1 style="margin-top:10px">Metody treningowe</h1><div class="sub">Wybierz plan, a podsumowania treningów i podpowiedzi „kiedy dołożyć” będą liczone według jego zasad. Teraz: <b style="color:var(--text);font-weight:500">${esc(cur.name)}</b>${S.profile.methodStart ? ` od ${dLong(S.profile.methodStart, false)}` : ""}.</div></div></div>
    <div class="grid">
      ${lv.map((l) => `<div class="c12 m-group">${l === "początkujący" ? "Dla początkujących" : l === "średni" ? "Średniozaawansowane" : "Zaawansowane"}</div>${window.METHODS.filter((m) => m.level === l).map(card).join("")}`).join("")}
      <section class="card c12"><div class="card-head"><h2>Rekordy do planów procentowych</h2><div class="right">puste = liczę z treningów</div></div>
        <div class="form-grid" style="grid-template-columns:repeat(4,minmax(0,1fr))">${maxes}</div>
        <div class="faint" style="font-size:12px;margin-top:10px">5/3/1, nSuns, Texas, Sheiko i Westside liczą ciężary z rekordu (szacowany 1RM z ostatnich 90 dni). Jeśli znasz prawdziwy rekord, wpisz go tutaj.</div></section>
    </div>`;
  };
  const BODY_FRONT = {
    kaptury: ["M92 55 Q83 61 71 65 Q81 68 91 66 Z"],
    barki_b: ["M67 65 Q56 68 53 81 Q52 93 56 101 Q58 88 62 78 Q63 70 67 65 Z"],
    barki_p: ["M71 66 Q62 69 60 80 Q61 91 66 98 Q70 85 81 72 Q77 67 71 66 Z"],
    klatka: ["M84 69 Q94 67 99 69 L99 82 Q88 82 76 86 Q76 77 84 69 Z", "M76 87 Q88 83 99 83 L99 106 Q90 112 80 108 Q72 102 70 96 Q72 90 76 87 Z"],
    skosne: ["M78 112 Q84 116 87 120 L87 186 Q80 178 77 162 Q74 136 78 112 Z", "M71 108 L78 111 L73 116 Z", "M70 117 L78 120 L72 125 Z", "M70 126 L78 129 L73 134 Z"],
    brzuch: ["M89 110 L99 110 L99 123 L89 123 Q88 116 89 110 Z", "M89 125 L99 125 L99 139 L89 139 Z", "M89 141 L99 141 L99 155 L89 156 Z", "M89 158 L99 158 L99 197 Q93 193 89 183 Z"],
    biceps: ["M58 101 Q51 113 51 129 Q53 141 58 146 Q63 133 65 119 Q64 107 61 99 Z", "M52 127 Q49 137 52 146 L55 147 Q51 137 52 127 Z"],
    przedramiona: ["M51 149 Q46 163 45 181 Q46 192 49 198 Q55 180 58 164 Q60 153 57 148 Z", "M58 147 Q62 156 61 169 Q58 183 53 196 L51 198 Q56 178 58 161 Z"],
    czworoglowe: ["M77 203 Q70 226 70 254 Q71 281 79 301 L83 301 Q80 279 80 250 Q79 226 80 205 Z", "M81 204 Q88 210 93 222 Q95 252 91 283 Q88 295 85 300 Q82 278 82 250 Q81 226 81 204 Z", "M91 270 Q98 281 97 297 Q93 307 86 305 Q90 291 91 270 Z"],
    przywodziciele: ["M94 213 Q99 214 99 222 L99 262 Q96 270 93 276 Q96 248 94 213 Z"],
    lydki: ["M78 326 Q73 346 75 371 Q78 389 83 397 Q86 376 86 352 Q85 336 82 326 Z", "M88 330 Q94 346 92 371 Q90 387 86 395 Q88 370 88 350 Z"]
  };
  const BODY_BACK = {
    kaptury: ["M99 47 Q92 53 72 63 Q84 69 99 71 Z", "M99 72 Q87 72 81 78 Q90 96 99 124 Z"],
    barki_b: ["M66 65 Q55 69 52 83 Q51 93 55 100 Q56 88 60 78 Z"],
    barki_t: ["M70 65 Q59 69 55 83 Q56 95 60 99 Q66 86 78 73 Z", "M80 80 Q72 86 70 98 Q78 102 88 98 Q86 88 80 80 Z"],
    triceps: ["M58 100 Q51 112 51 128 Q53 140 58 146 Q63 132 65 118 Q63 106 60 99 Z", "M52 112 Q49 124 51 136 L54 137 Q51 125 53 113 Z"],
    przedramiona: ["M51 149 Q46 163 45 181 Q46 192 49 198 Q55 180 58 164 Q60 153 57 148 Z", "M58 147 Q62 156 61 169 Q58 183 53 196 L51 198 Q56 178 58 161 Z"],
    najszersze: ["M70 100 Q70 122 76 142 Q84 160 95 170 L98 150 Q94 126 88 101 Q80 104 70 100 Z"],
    prostowniki: ["M93 150 Q96 134 98 126 L99 126 L99 196 Q94 194 91 184 Q91 166 93 150 Z"],
    posladki: ["M78 186 Q86 184 94 190 Q86 198 78 200 Z", "M78 199 Q90 201 99 205 L99 240 Q88 246 80 240 Q72 226 78 199 Z"],
    dwuglowe: ["M76 246 Q72 270 74 292 Q78 304 84 306 Q84 282 84 256 Q82 248 76 246 Z", "M86 248 Q96 250 97 258 Q98 282 92 304 L86 306 Q88 280 86 248 Z"],
    lydki: ["M76 318 Q70 334 72 354 Q76 366 82 368 Q84 348 84 330 Q82 320 76 318 Z", "M86 318 Q96 326 95 348 Q92 364 86 370 Q87 346 86 318 Z", "M79 369 Q81 389 84 399 L90 399 Q92 384 91 369 Z"]
  };
  const BODY_SIL = "M100 44 L92 46 Q85 59 70 63 Q56 66 52 81 Q49 96 50 112 Q49 130 47 150 Q43 172 43 196 Q42 213 44 224 L52 224 Q54 206 58 184 Q63 160 66 139 L70 141 Q72 170 76 188 Q70 214 69 246 Q69 282 77 306 L78 318 Q70 340 72 362 Q76 384 80 400 Q78 420 80 434 L96 434 Q98 418 94 400 Q94 380 95 360 Q97 336 92 318 Q98 290 99 262 L100 262 Z";
  const BODY_HEAD = "M100 12 Q114 12 114 30 Q114 47 100 47 Q86 47 86 30 Q86 12 100 12 Z";
  const BODY_LINES = {
    front: "M94 47 L91 60 M84 72 Q90 76 98 76 M78 92 Q88 90 98 92 M64 74 Q63 84 64 94 M57 115 Q56 128 57 138 M74 230 Q75 260 80 290 M88 222 Q90 250 88 278 M80 340 Q81 360 81 380",
    back: "M99 48 L99 200 M80 84 Q88 92 92 104 M76 120 Q84 140 94 156 M55 118 Q56 128 56 138 M83 210 Q90 222 99 224 M80 260 Q81 280 80 296 M80 330 Q81 345 81 360 M90 330 Q90 345 89 360"
  };
  function bodySvg(side, fill, sel, label) {
    const parts = side === "front" ? BODY_FRONT : BODY_BACK, mirror = "translate(200,0) scale(-1,1)";
    const shapes = (m2) => Object.entries(parts).map(([m, ds]) => {
      const t = esc((window.MUSCLES || {})[m] || m);
      return `<g data-mus="${m}" class="mus${sel === m ? " sel" : ""}" style="fill:${fill(m)}" tabindex="${m2 ? -1 : 0}" role="button" aria-label="${t}"><title>${t}</title>${ds.map((d) => `<path d="${d}"/>`).join("")}</g>`;
    }).join("");
    const fit = "translate(100,46) scale(1.25,0.85) translate(-100,-46)";
    return `<figure class="body"><svg viewBox="22 2 156 380" aria-label="${label}">
    <ellipse class="body-sil" cx="100" cy="25" rx="15.5" ry="20"/>
    <g transform="${fit}"><path class="body-sil" d="${BODY_SIL}"/><path class="body-sil" d="${BODY_SIL}" transform="${mirror}"/>
    <g>${shapes(false)}</g><g transform="${mirror}">${shapes(true)}</g>
    <g class="body-lines"><path d="${BODY_LINES[side]}"/><path d="${BODY_LINES[side]}" transform="${mirror}"/></g></g>
  </svg><figcaption>${label}</figcaption></figure>`;
  }
  function patchRow(tr, marker) {
    const { r, arg } = route(), tpl = document.createElement("template");
    if (!tr || !VIEWS[r]) {
      rerender();
      return;
    }
    tpl.innerHTML = VIEWS[r](arg);
    pending.length = 0;
    const nu = tpl.content.querySelector(marker)?.closest("tr");
    if (!nu) {
      rerender();
      return;
    }
    tr.innerHTML = nu.innerHTML;
    const sub = $(".title-row .sub", main), nsub = tpl.content.querySelector(".title-row .sub");
    if (sub && nsub) sub.innerHTML = nsub.innerHTML;
    renderNav(r);
  }
  function patchBody() {
    if (route().r !== "cialo" || !$(".bodies")) {
      render({ animate: false, scroll: false });
      return;
    }
    const tpl = document.createElement("template");
    tpl.innerHTML = VIEWS.cialo();
    const nu = (sel) => tpl.content.querySelector(sel), cur = (sel) => $(sel, main);
    for (const sel of [".title-row .sub", ".body-side"]) {
      const a = cur(sel), b = nu(sel);
      if (a && b) a.innerHTML = b.innerHTML;
    }
    const lg = cur(".legend"), nlg = nu(".legend");
    if (lg && nlg) lg.innerHTML = nlg.innerHTML;
    else if (lg) lg.hidden = true;
    else if (nlg) cur(".body-card").appendChild(nlg);
    if (lg && nlg) lg.hidden = false;
    $$(".seg [data-bodymode]", main).forEach((b) => b.setAttribute("aria-pressed", b.dataset.bodymode === bodyMode));
    const fresh = [...tpl.content.querySelectorAll("g[data-mus]")];
    $$("g[data-mus]", main).forEach((g, i) => {
      const f = fresh[i];
      if (!f) return;
      g.setAttribute("style", f.getAttribute("style"));
      g.classList.toggle("sel", f.classList.contains("sel"));
    });
  }
  const GROUP_MUS = { Klatka: "klatka", Plecy: "najszersze", Barki: "barki_b", Biceps: "biceps", Triceps: "triceps", Nogi: "czworoglowe", Brzuch: "brzuch", Przedramiona: "przedramiona" };
  function libOf(name) {
    const n = String(name).toLowerCase();
    return (window.EX_LIB || []).find((e) => n === e[0].toLowerCase()) || (window.EX_LIB || []).find((e) => n.startsWith(e[0].toLowerCase())) || null;
  }
  function musclesOf(name) {
    const e = libOf(name);
    if (e) return { m: e[2], s: e[3] };
    const g = GROUP_MUS[groupOf(name)];
    return { m: g ? [g] : [], s: [] };
  }
  const isHIT = () => ["mentzer", "yates"].includes(methodOf().id);
  function weekLoad() {
    const from = addDays(today(), -6), load2 = {}, last = {}, list = {};
    for (const s of Object.values(S.sessions)) {
      if (s.date < from) continue;
      for (const t of s.sets) {
        if (t.t === "WARMUP_SET" || t.t === "WARM_UP") continue;
        const { m, s: sec } = musclesOf(t.e), v = t.t === "DROP_SET" ? 0.5 : 1;
        for (const x of m) {
          load2[x] = (load2[x] || 0) + v;
          if (!last[x] || s.id > last[x]) last[x] = s.id;
        }
        for (const x of sec) load2[x] = (load2[x] || 0) + v * 0.5;
        for (const x of [...m, ...sec]) {
          const key = `${s.id}|${t.e}`;
          list[x] = list[x] || /* @__PURE__ */ new Map();
          const it = list[x].get(key) || { s, e: t.e, sets: [], main: m.includes(x) };
          it.sets.push(t);
          list[x].set(key, it);
        }
      }
    }
    return { load: load2, last, list };
  }
  function loadLevel(v) {
    const [a, b, c] = isHIT() ? [2, 6, 9] : [5, 14, 20];
    return !v ? "none" : v <= a ? "low" : v <= b ? "good" : v <= c ? "high" : "max";
  }
  const LOAD_C = { none: "var(--mus-none)", low: "var(--mus-low)", good: "var(--accent)", high: "var(--mus-high)", max: "var(--mus-max)" };
  const LOAD_T = { none: "nietrenowane", low: "mało", good: "dobra dawka", high: "dużo", max: "bardzo dużo" };
  let bodyMode = "tydzien", bodySel = null;
  VIEWS.cialo = () => {
    const W = weekLoad(), now = Date.now();
    const hoursSince = (sid) => (now - new Date(sid.replace(" ", "T")).getTime()) / 36e5;
    const fill = bodyMode === "tydzien" ? (m) => LOAD_C[loadLevel(W.load[m] || 0)] : (m) => bodySel === m ? "var(--mus-sel)" : "var(--mus-atlas)";
    const name = (m) => (window.MUSCLES || {})[m] || m;
    let side = "";
    if (bodyMode === "tydzien") {
      if (!bodySel) {
        const top = Object.entries(W.load).sort((a, b) => b[1] - a[1]);
        side = `<div class="card-head"><h2>Ten tydzień</h2><div class="right">ostatnie 7 dni</div></div>
        <div class="faint" style="font-size:13px;margin-bottom:12px">Stuknij mięsień, żeby zobaczyć ćwiczenia i serie. Liczę serie robocze: główny mięsień cała seria, pomocniczy pół.</div>
        ${top.length ? `<ul class="list">${top.slice(0, 9).map(([m, v]) => `<li style="align-items:center;cursor:pointer" data-mus="${m}"><span class="dot" style="background:${LOAD_C[loadLevel(v)]}"></span><span class="grow">${esc(name(m))}</span><span class="num muted">${fmtNum(v)} ${plural(Math.round(v), "seria", "serie", "serii")}</span></li>`).join("")}</ul>` : '<div class="empty">W tym tygodniu nie ma jeszcze treningów.</div>'}`;
      } else {
        const v = W.load[bodySel] || 0, lvl = loadLevel(v), items = [...W.list[bodySel]?.values() || []].sort((a, b) => b.s.id.localeCompare(a.s.id));
        const h = W.last[bodySel] ? hoursSince(W.last[bodySel]) : null;
        const rest = h != null && h < 48 ? `<div class="warn" style="font-size:13px;margin-top:8px">Ostatnio ${h < 24 ? "mniej niż dobę" : "niecałe 2 dni"} temu: daj tej partii jeszcze ${Math.max(1, Math.round(48 - h))} h, zanim znów potrenujesz ją ciężko.</div>` : "";
        side = `<div class="card-head"><h2>${esc(name(bodySel))}</h2><div class="right"><button class="link" data-mus="">← wszystkie</button></div></div>
        <div style="display:flex;align-items:baseline;gap:10px"><span class="kpi num">${fmtNum(v)}</span><span class="muted">${plural(Math.round(v), "seria", "serie", "serii")} w 7 dni · <span style="color:${LOAD_C[lvl]}">${LOAD_T[lvl]}</span></span></div>
        <div class="faint" style="font-size:12px;margin-top:4px">${isHIT() ? "Przy treningu do upadku (HIT) wystarcza kilka serii na partię w tygodniu." : "Dla masy zwykle 10–20 serii na partię w tygodniu (Schoenfeld 2017, metaanaliza)."}</div>${rest}
        ${items.length ? `<ul class="list" style="margin-top:12px">${items.map((it) => `<li><span class="grow"><a class="link" style="color:var(--text);font-size:14px" href="#/cwiczenie/${encodeURIComponent(it.e)}">${esc(libOf(it.e)?.[1] || it.e)}</a><span class="sub">${esc(it.e)} · ${dRel(it.s.date)}${it.main ? "" : " · pomocniczo"}</span></span><span class="num muted" style="text-align:right">${it.sets.length} ${plural(it.sets.length, "seria", "serie", "serii")}<span class="sub">${it.sets.slice(0, 4).map((t) => t.w ? `${f1.format(t.w).replace(",0", "")}×${t.r}` : `${t.r}`).join(" · ")}</span></span></li>`).join("")}</ul>` : '<div class="empty" style="margin-top:12px">W tym tygodniu bez ćwiczeń na tę partię. Zajrzyj do atlasu po pomysły.</div>'}
        <div class="foot"><button class="btn small" data-bodymode="atlas">Ćwiczenia na tę partię →</button></div>`;
      }
    } else {
      if (!bodySel) side = `<div class="card-head"><h2>Atlas ćwiczeń</h2><div class="right">${(window.EX_LIB || []).length} ćwiczeń</div></div><div class="faint" style="font-size:13px">Stuknij mięsień na modelu, a pokażę ćwiczenia na niego: nazwy jak w aplikacji treningowej i krótko, jak je robić.</div>
      <div class="chips">${Object.entries(window.MUSCLES || {}).map(([m, l]) => `<button class="chip" data-mus="${m}">${esc(l)}</button>`).join("")}</div>`;
      else {
        const ex = exercises();
        const lib = (window.EX_LIB || []).filter((e) => e[2].includes(bodySel) || e[3].includes(bodySel)).sort((a, b) => b[2].includes(bodySel) - a[2].includes(bodySel));
        side = `<div class="card-head"><h2>${esc(name(bodySel))}</h2><div class="right"><button class="link" data-mus="">← wszystkie</button></div></div>
        <ul class="list atlas">${lib.map((e) => {
          const mine = [...ex.values()].find((x) => libOf(x.name) === e);
          const [u, r, w] = e[4].split(" | ");
          return `<li><details><summary><span class="grow"><b>${esc(e[1])}</b><span class="sub">${esc(e[0])}${e[2].includes(bodySel) ? "" : " · pomocniczo"}</span></span>${mine ? `<span class="pill">robisz · ${dRel(mine.last.date)}</span>` : ""}</summary>
            <div class="how"><p><b>Ustawienie:</b> ${esc(u)}</p><p><b>Ruch:</b> ${esc(r)}</p><p><b>Uważaj:</b> ${esc(w)}</p>
            <p class="faint">Pracują też: ${esc([...e[2], ...e[3]].filter((x) => x !== bodySel).map(name).join(", ") || "głównie ta partia")}</p>${mine ? `<a class="link" href="#/cwiczenie/${encodeURIComponent(mine.name)}">Twoja historia →</a>` : ""}</div></details></li>`;
        }).join("")}</ul>`;
      }
    }
    const legend = bodyMode === "tydzien" ? `<div class="legend">${["none", "low", "good", "high", "max"].map((k) => `<span><i style="background:${LOAD_C[k]}"></i>${LOAD_T[k]}</span>`).join("")}</div>` : "";
    return `<div class="title-row"><div><h1>Mięśnie</h1><div class="sub">${bodyMode === "tydzien" ? "Które partie trenowałeś w ostatnich 7 dniach i jak mocno. Kolory to obciążenie z liczby serii, nie pomiar zmęczenia." : "Ćwiczenia na każdą partię z krótkim opisem techniki."}</div></div>
      <div class="actions"><div class="seg" role="group" aria-label="Widok">${[["tydzien", "Ten tydzień"], ["atlas", "Atlas ćwiczeń"]].map(([k, l]) => `<button type="button" data-bodymode="${k}" aria-pressed="${bodyMode === k}">${l}</button>`).join("")}</div></div></div>
    <div class="grid"><section class="card c7 body-card"><div class="bodies">${bodySvg("front", fill, bodySel, "Przód")}${bodySvg("back", fill, bodySel, "Tył")}</div>${legend}</section>
      <section class="card c5 body-side">${side}</section></div>`;
  };
  VIEWS.trening = (id) => {
    const s = Object.hasOwn(S.sessions, id) ? S.sessions[id] : null;
    if (!s) return `<div class="title-row"><div><a class="link" href="#/treningi">← Treningi</a><h1 style="margin-top:10px">Nie znaleziono treningu</h1></div></div>`;
    const rows = analyzeSession(s), ss = sessionsSorted(), k = ss.findIndex((x) => x.id === id);
    const newer = ss[k - 1], older = ss[k + 1];
    const c = { up: 0, down: 0, same: 0 };
    rows.forEach((r) => {
      if (c[r.status] != null) c[r.status]++;
    });
    const adds = rows.filter((r) => r.kind === "add").map((r) => r.name), rests = rows.filter((r) => r.kind === "rest").map((r) => r.name);
    const bench = rows.find((r) => r.strength);
    const summary = [`Lepiej w ${c.up}, gorzej w ${c.down}, bez zmian w ${c.same}.`, adds.length ? `Następnym razem dołóż w: ${adds.join(", ")}.` : "Nigdzie nie ma jeszcze góry zakresu, dobijaj powtórzenia.", rests.length ? `Więcej odpoczynku przed: ${rests.join(", ")}.` : ""].filter(Boolean).join(" ");
    return `<div class="title-row"><div><a class="link" href="#/treningi">← Treningi</a><h1 style="margin-top:10px">${cap(weekdayLong(s.date))} · ${esc(sessionLabel(s))}</h1><div class="sub">${durText(s.dur)} · ${countSets(s)} serii roboczych · <span class="finding">${esc(summary)}</span></div></div>
      <div class="actions">${older ? `<a class="btn small" href="#/trening/${encodeURIComponent(older.id)}">← Wcześniejszy</a>` : ""}${newer ? `<a class="btn small" href="#/trening/${encodeURIComponent(newer.id)}">Późniejszy →</a>` : ""}</div></div>
    <div class="grid">
      <section class="card c8"><div class="card-head"><h2>Ćwiczenia względem poprzedniego razu</h2></div>
        <table class="rows"><thead><tr><th>Ćwiczenie</th><th class="num">Dziś</th><th class="num hide-phone">Poprzednio</th><th>Zmiana</th><th>Następnym razem</th></tr></thead><tbody>
        ${rows.map((r) => `<tr><td><a class="link" style="color:var(--text);font-size:14px" href="#/cwiczenie/${encodeURIComponent(r.name)}">${esc(r.name)}</a><span class="sub">${r.cur.sets.map((t) => (t.w ? `${f1.format(t.w).replace(",0", "")}×${t.r}` : `${t.r}`) + (t.t === "DROP_SET" ? " drop" : "")).join(" · ")}</span></td>
          <td class="num">${r.top ? fmtSet(r.top) : "–"}${r.ratioPR != null ? `<span class="sub">${f0.format(r.ratioPR * 100)}% rekordu</span>` : ""}</td>
          <td class="num muted hide-phone">${r.ptop ? fmtSet(r.ptop) : "–"}<span class="sub">${r.prev ? dShort(r.prev.date) : ""}</span></td>
          <td><span class="verdict ${r.status}">${VERD[r.status]}</span>${r.delta != null ? `<span class="sub">${signed(r.delta * 100, f0)}%</span>` : ""}</td>
          <td class="second"><span class="advice ${r.kind === "add" ? "add" : ""}">${esc(r.advice)}</span></td></tr>`).join("")}
        </tbody></table></section>
      <div class="c4" style="display:flex;flex-direction:column;gap:var(--gap)">
        ${bench ? `<section class="card"><div class="card-head"><h2>Ławka: siła 5×2</h2><div class="right">rekord ${f1.format(bench.strength.pr)} kg (szac.)</div></div>
          <div class="kpi num">${f0.format(bench.strength.pct * 100)}<span class="unit">% rekordu przy ${kg(bench.strength.w)}</span></div>
          <div class="faint" style="font-size:13px;margin-top:6px">${esc(bench.strength.sets)}</div>
          <div style="margin-top:12px" class="row"><span class="goalbar"><span style="width:${Math.min(100, bench.strength.pct * 100)}%"></span></span><span class="faint" style="font-size:12px">cel ${S.profile.benchLo}–${S.profile.benchHi}%: ${kg(bench.strength.lowW)}–${kg(bench.strength.highW)}</span></div>
          <div class="advice" style="margin-top:12px">${esc(bench.strength.next)}</div></section>` : ""}
        <section class="card"><div class="card-head"><h2>Jak to liczę</h2></div><div class="note-box">
          <b>Interpretacja Heavy Duty Mentzera:</b> 1–2 serie do upadku. Gdy dobijesz górę zakresu powtórzeń, następnym razem dokładasz ciężar; liczę +5%, źródła podają 5–10%. Jeśli wynik spada albo stoi, Mentzer zalecał więcej dni odpoczynku i rzadsze treningi, a nie mniejszy ciężar.<br><br>
          <b>Ławka 5×2:</b> 85–90% szacowanego maksimum to według tabel NSCA dwójki z zapasem 2–4 powtórzeń (RPE 6–8). Jeśli ostatnia dwójka była na granicy, nie dokładaj.<br><br>
          <b>Twoje zakresy:</b> góra ciała ${S.profile.upLo}–${S.profile.upHi} powt., nogi ${S.profile.legLo}–${S.profile.legHi}, brzuch i przedramiona 8–15. Zmienisz je w Ustawieniach.<br><br>
          <b>Porównanie:</b> najlepsza seria robocza (bez dropsetów) według szacowanego 1RM. Lepiej to co najmniej +1%, gorzej to −2% lub mniej.</div></section>
      </div>
    </div>`;
  };
  function bodyNow() {
    const sr = weightTrend();
    return sr.length ? { w: sr.at(-1).tr, est: false } : { w: 71, est: true };
  }
  function bwAt(date) {
    const sr = weightTrend();
    return sr.length && date >= sr[0].date ? trendAt(sr, date) : null;
  }
  const xbw = (v) => `${f2.format(v)}<span class="unit">× masy</span>`;
  function bodyCard(x) {
    if (x.bw || !x.bestVal) return "";
    const now = bodyNow(), wNow = now.w;
    let bestRel = null;
    for (const h of x.history) {
      const b = bwAt(h.date);
      if (b && h.e1) {
        const r = h.e1 / b;
        if (!bestRel || r > bestRel.r) bestRel = { r, date: h.date, e1: h.e1, b };
      }
    }
    const prBw = x.best ? bwAt(x.best.date) : null;
    const items = [
      ["Rekord teraz", xbw(x.bestVal / wNow), `${f1.format(x.bestVal)} kg szac. 1RM ÷ ${f1.format(wNow)} kg${now.est ? " (waga orientacyjna)" : ""}`],
      ["Najcięższa seria", x.heaviest?.w ? xbw(x.heaviest.w / wNow) : "–", x.heaviest?.w ? `${f1.format(x.heaviest.w)} kg × ${x.heaviest.r} przy obecnej wadze` : ""],
      ["Ostatnie 30 dni", x.recentVal != null ? xbw(x.recentVal / wNow) : "–", x.recentVal != null ? `najlepiej ${f1.format(x.recentVal)} kg szac. 1RM` : "brak treningu w 30 dni"],
      ["Najwięcej przy zmierzonej wadze", bestRel ? xbw(bestRel.r) : "–", bestRel ? `${dLong(bestRel.date)}: ${f1.format(bestRel.e1)} kg przy ${f1.format(bestRel.b)} kg${x.best && !prBw ? `. Rekord z ${dShort(x.best.date)} był przed pierwszym ważeniem w aplikacji.` : ""}` : "liczy się od dnia, w którym zaczniesz wpisywać wagę"]
    ];
    const back = x.recentVal != null && x.recentVal < x.bestVal ? `Do rekordu brakuje ${f1.format(x.bestVal - x.recentVal)} kg, czyli ${f2.format((x.bestVal - x.recentVal) / wNow)} × twojej obecnej wagi.` : x.recentVal != null ? "Jesteś na poziomie rekordu." : "";
    return `<section class="card c12"><div class="card-head"><h2>Względem wagi ciała</h2><div class="right">waga teraz: ${f1.format(wNow)} kg${now.est ? " · dodaj wagę we wpisie dnia" : " · trend z ważenia"}</div></div>
    <div class="kpis" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0">${items.map(([l, v, sub], i) => `<div style="${i ? "border-left:1px solid var(--rule);padding-left:20px;" : ""}padding-right:16px"><div class="label">${l}</div><div class="kpi num" style="margin-top:6px">${v}</div><div class="faint" style="font-size:12px;margin-top:4px">${sub}</div></div>`).join("")}</div>
    ${back ? `<div class="faint" style="font-size:12px;margin-top:14px">${back} Ta sama siła przy niższej wadze to wyższy stosunek.</div>` : ""}</section>`;
  }
  VIEWS.cwiczenie = (name) => {
    const x = exercises().get(name);
    if (!x) return `<div class="title-row"><div><a class="link" href="#/treningi">← Treningi</a><h1 style="margin-top:10px">Nie znaleziono ćwiczenia</h1></div></div>`;
    const unit = x.bw ? "powt." : "kg", fv = (v) => x.bw ? f0.format(v) : f1.format(v);
    chart(() => {
      const el = $("#chEx");
      const h = x.history;
      Charts.line(el, { labels: h.map((p) => dShort(p.date)), series: [{ name: x.bw ? "Najwięcej powtórzeń" : "Szac. 1RM", values: h.map((p) => +(x.bw ? p.maxR : p.e1).toFixed(1)) }], format: (v) => fv(v) + " " + unit, tickFormat: (v) => f0.format(v), height: 330, ...yRange(h.map((p) => x.bw ? p.maxR : p.e1), x.bw ? 2 : 10), reference: { value: +x.bestVal.toFixed(1), label: "Rekord" } });
      animateLines(el);
    });
    const hist = [...x.history].reverse();
    return `<div class="title-row"><div><a class="link" href="#/treningi">← Treningi</a><h1 style="margin-top:10px">${esc(x.name)}</h1><div class="sub">${x.group} · ${x.count} ${plural(x.count, "trening", "treningi", "treningów")} od ${dLong(x.history[0].date)}</div></div></div>
    <div class="grid">
      <section class="card c12"><div class="kpis" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0">
        ${[
      [x.bw ? "Rekord powtórzeń" : "Rekord, szac. 1RM", `${fv(x.bestVal)}<span class="unit">${unit}</span>`, x.best ? `${dLong(x.best.date)} · ${x.bestTop ? fmtSet(x.bestTop) : ""}` : ""],
      ["Najcięższa seria", x.heaviest && x.heaviest.w ? `${f1.format(x.heaviest.w)}<span class="unit">kg × ${x.heaviest.r}</span>` : "–", x.heaviest && x.heaviest.w ? dLong(x.heaviest.date) : ""],
      ["Ostatnio", x.lastTop ? fmtSet(x.lastTop) : "–", dLong(x.last.date)],
      ["30 dni względem rekordu", x.ratio == null ? "–" : `${f0.format(x.ratio * 100)}<span class="unit">%</span>`, x.recentVal != null ? `najlepiej ${fv(x.recentVal)} ${unit}` : "brak treningu w 30 dni"]
    ].map(([l, v, s], i) => `<div style="${i ? "border-left:1px solid var(--rule);padding-left:20px;" : ""}padding-right:16px"><div class="label">${l}</div><div class="kpi num" style="margin-top:6px">${v}</div><div class="faint" style="font-size:12px;margin-top:4px">${s}</div></div>`).join("")}
      </div></section>
      ${bodyCard(x)}
      <section class="card c8"><div class="card-head"><h2>${x.bw ? "Najwięcej powtórzeń na trening" : "Szacowany 1RM na trening"}</h2><div class="right">${x.bw ? "" : "wzór Epleya, serie do 10 powt."}</div></div><div class="chart" id="chEx"></div></section>
      <section class="card c4"><div class="card-head"><h2>Rekordy powtórzeń</h2><div class="right">najcięższy ciężar</div></div>
        ${x.bw ? `<div class="empty">Ćwiczenie z masą ciała: liczę rekord powtórzeń.</div>` : `<table class="compact"><thead><tr><th>Powtórzenia</th><th class="num">Ciężar</th><th class="num">Kiedy</th></tr></thead><tbody>
        ${x.repPR.filter((p) => p.w != null).map((p) => `<tr><td class="num" style="text-align:left">${p.r}+</td><td class="num">${f1.format(p.w)} kg <span class="faint">× ${p.reps}</span></td><td class="num muted">${dShort(p.date)}</td></tr>`).join("")}</tbody></table>`}</section>
      <section class="card c12"><div class="card-head"><h2>Historia serii</h2><div class="right">${hist.length} ${plural(hist.length, "trening", "treningi", "treningów")}</div></div>
        <table class="rows"><thead><tr><th>Dzień</th><th>Serie</th><th class="num">${x.bw ? "Max powt." : "Szac. 1RM"}</th>${x.bw ? "" : '<th class="num hide-phone">× masy</th>'}</tr></thead><tbody>
        ${hist.map((p) => `<tr><td style="white-space:nowrap">${dLong(p.date)}</td><td class="second muted">${p.sets.map((s) => (s.w ? `${f1.format(s.w).replace(",0", "")}×${s.r}` : `${s.r}`) + (s.t === "DROP_SET" ? " (drop)" : s.t === "LEFT_SET" ? " (L)" : s.t === "RIGHT_SET" ? " (P)" : "")).join(" · ")}</td><td class="num">${x.bw ? p.maxR : f1.format(p.e1)}${p === x.best ? ' <span class="pill">rekord</span>' : ""}</td>${x.bw ? "" : (() => {
      const b = bwAt(p.date);
      return `<td class="num muted hide-phone" title="${b ? `waga tego dnia: ${f1.format(b)} kg` : "brak ważenia z tego dnia, liczę względem obecnej wagi"}">${b ? "" : "~"}${f2.format(p.e1 / (b || bodyNow().w))}×</td>`;
    })()}</tr>`).join("")}
        </tbody></table></section>
    </div>`;
  };
  const W_RANGES = [[7, "Tydzień"], [30, "30 dni"], [90, "90 dni"], [182, "6 mies."], [365, "Rok"], [0, "Wszystko"]];
  let wRange = (() => {
    try {
      const v = localStorage.getItem("forma.wRange");
      return v === null ? 90 : +v;
    } catch {
      return 90;
    }
  })();
  VIEWS.dieta = () => {
    const E = energy(), P = S.profile, t = today();
    const entries = Object.keys(S.days).sort().reverse().slice(0, 45);
    chart(() => {
      const el = $("#chW90");
      if (!el) return;
      const n = wRange || Math.max(7, diffDays(E.series[0].date, t) + 1), byDay = new Map(E.series.map((p) => [p.date, p]));
      const start = addDays(t, -(n - 1)), labels = [], raw = [], tr = [];
      for (let i = 0; i < n; i++) {
        const d = addDays(start, i);
        labels.push(dShort(d));
        const p = byDay.get(d);
        raw.push(p ? p.w : null);
        tr.push(p ? p.tr : null);
      }
      if (!raw.some((v) => v != null)) {
        el.innerHTML = '<div class="empty">Brak pomiarów w tym okresie. Wybierz dłuższy zakres.</div>';
        return;
      }
      Charts.line(el, { labels, series: [{ name: "Trend", values: fillGaps(tr) }, { name: "Pomiar", values: raw, colour: getVar("--chart-muted") }], format: (v) => f1.format(v) + " kg", tickFormat: (v) => f1.format(v), height: 240, ...yRange(raw.concat(tr)) });
      const lg = el.querySelector(".chart-legend");
      if (lg) $("#lgW90").appendChild(lg);
      animateLines(el);
    });
    const trendRow = (d) => E.series.find((p) => p.date === d);
    return `<div class="title-row"><div><h1>Dieta i TDEE</h1><div class="sub">${E.method === "dane" ? `Spalanie policzone z ${E.kcalDays} dni kalorii i zmiany wagi o ${signed(E.change, f2)} kg w ${E.span} dni (regresja liniowa z pomiarów).${E.conf === "niska" ? " Niska pewność: pełna dokładność po ~28 dniach (Hall i Chow 2011), pierwsze 2–4 tygodnie po zmianie kalorii zawyża woda." : ""}` : `Na razie szacunek ze wzoru Mifflina. Spalanie z twoich danych policzę po 14 dniach z kaloriami i ważeniem, a dokładne po ~28 dniach (Hall i Chow 2011).`}</div></div>
      <div class="actions"><button class="btn primary" data-act="log">Wpis dnia</button></div></div>
    <div class="grid">
      <section class="card c8"><div class="card-head"><h2>Waga</h2><div class="right" id="lgW90"></div></div>
        ${E.series.length ? `<div class="seg" role="group" aria-label="Zakres wykresu" style="max-width:100%;overflow-x:auto;margin-bottom:12px;align-self:flex-start">${W_RANGES.map(([v, l]) => `<button type="button" data-wr="${v}" aria-pressed="${wRange === v}">${l}</button>`).join("")}</div><div class="chart" id="chW90"></div>` : `<div class="empty">Brak pomiarów. Codzienne ważenie rano da najdokładniejszy trend.</div>`}</section>
      <section class="card c4"><div class="card-head"><h2>Spalanie i cel</h2><div class="right">${E.method === "dane" ? "z twoich danych" : "ze wzoru"}</div></div>
        <div class="kpi num">${f0.format(E.value)}<span class="unit">kcal / dzień</span></div>
        <ul class="list" style="margin-top:12px">
          <li><span class="grow muted">Średnio zjadasz (28 dni)</span><span class="num">${E.avgK ? f0.format(E.avgK) + " kcal" : "–"}</span></li>
          <li><span class="grow muted">Tempo wagi (14 dni)</span><span class="num">${E.rate != null ? signed(E.rate, f2) + " kg/tydz." : "–"}</span></li>
          <li><span class="grow muted">Cel tempa</span><span class="num">${signed(E.rateKg, f2)} kg/tydz.</span></li>
          <li><span class="grow muted">Ze wzoru (Mifflin × ${String(P.activity).replace(".", ",")})</span><span class="num">${f0.format(E.formula)} kcal</span></li>
        </ul>
        <div style="margin-top:16px;padding:14px 16px;background:var(--raised);border-radius:12px"><div class="label">Propozycja na ten tydzień</div><div class="kpi num" style="margin-top:4px">${f0.format(E.target)}<span class="unit">kcal · ${f0.format(P.protein)} g białka</span></div></div>
        <div class="form-grid" style="margin-top:16px">
          <label class="field">Cel<select data-prof="goal"><option value="redukcja"${P.goal === "redukcja" ? " selected" : ""}>Redukcja</option><option value="rekompozycja"${P.goal === "rekompozycja" ? " selected" : ""}>Rekompozycja</option><option value="masa"${P.goal === "masa" ? " selected" : ""}>Masa</option></select></label>
          <label class="field">Tempo (% masy / tydz.)<input type="number" step="0.05" data-prof="ratePct" value="${P.ratePct}"></label>
        </div>
      </section>
      <section class="card c12"><div class="card-head"><h2>Dziennik</h2><div class="right">kliknij wiersz, żeby poprawić</div></div>
        ${entries.length ? `<table class="rows"><thead><tr><th>Dzień</th><th class="num">Waga</th><th class="num hide-phone">Trend</th><th class="num">Kalorie</th><th class="num">Białko</th><th class="num hide-phone">Kroki</th><th class="hide-phone">Notatka</th></tr></thead><tbody>
          ${entries.map((d) => {
      const e = S.days[d], tp = trendRow(d);
      return `<tr class="click" data-log="${d}" tabindex="0"><td>${dLong(d, false)}</td><td class="num">${e.w ? f1.format(e.w) : '<span class="faint">–</span>'}</td><td class="num muted hide-phone">${tp ? f1.format(tp.tr) : "–"}</td><td class="num">${e.kcal ? f0.format(e.kcal) : '<span class="faint">–</span>'}</td><td class="num">${e.p ? f0.format(e.p) + " g" : '<span class="faint">–</span>'}</td><td class="num muted hide-phone">${e.steps ? f0.format(e.steps) : "–"}</td><td class="muted hide-phone" style="max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(e.note || "")}</td></tr>`;
    }).join("")}
        </tbody></table>` : `<div class="empty">Pusto. Pierwszy wpis: przycisk „Wpis dnia” u góry.</div>`}</section>
    </div>`;
  };
  let suppFilter = "all";
  VIEWS.suplementy = () => {
    const list = S.supps.map((x) => ({ x, st: suppState(x) }));
    const nStock = list.filter((o) => ["ok", "soon"].includes(o.st.k)).length, nNone = list.filter((o) => ["none", "out"].includes(o.st.k)).length, nSoon = list.filter((o) => o.st.k === "soon").length;
    const shown = list.filter(({ st }) => suppFilter === "all" || (suppFilter === "stock" ? ["ok", "soon"].includes(st.k) : suppFilter === "buy" ? ["none", "out", "soon"].includes(st.k) : true)).sort((a, b) => {
      const o = { soon: 0, out: 1, ok: 2, none: 3, off: 4 };
      return o[a.st.k] - o[b.st.k] || (a.st.daysLeft ?? 0) - (b.st.daysLeft ?? 0);
    });
    const ordBy = /* @__PURE__ */ new Map();
    for (const r of cartRows()) if (r.order && r.supps) for (const x of r.supps) ordBy.set(x.id, r.order);
    const status = ({ k, daysLeft, end, left }, x) => ordBy.has(x.id) && k !== "ok" ? `<span class="acc">${OLABEL[ordBy.get(x.id).status]}</span><span class="sub">${esc(ordBy.get(x.id).shop)}</span>` : k === "none" ? '<span class="faint">do kupienia</span>' : k === "out" ? '<span class="neg">skończone</span>' : k === "off" ? '<span class="faint">wstrzymany</span>' : `<span class="${k === "soon" ? "warn" : ""}">${days(daysLeft)}</span><span class="sub">${end ? dShort(end) : ""}</span>`;
    return `<div class="title-row"><div><h1>Suplementy</h1><div class="sub">${nStock} w zapasie · ${nNone} do kupienia${nSoon ? ` · <span class="warn">${nSoon} do zamówienia (zostało ≤ ${S.profile.lead + 3} dni)</span>` : ""}</div></div>
      <div class="actions"><div class="seg" role="group" aria-label="Filtr">${[["all", "Wszystkie"], ["stock", "W zapasie"], ["buy", "Do kupienia"]].map(([k, l]) => `<button type="button" data-sf="${k}" aria-pressed="${suppFilter === k}">${l}</button>`).join("")}</div><button class="btn" data-act="addSupp">Dodaj</button></div></div>
    <div class="grid"><section class="card c12">
      <table class="rows"><thead><tr><th>Suplement</th><th class="num">Ile biorę</th><th class="hide-phone">Zalecane</th><th class="num">Zapas</th><th class="num">Wystarczy na</th><th class="num"></th></tr></thead><tbody>
      ${shown.map(({ x, st }) => `<tr><td><button class="link" style="color:var(--text);font-size:14px;text-align:left" data-edit-supp="${x.id}">${esc(x.name)}</button><span class="sub">${esc(x.brand)}</span></td>
        ${(() => {
      const di = doseInfo(x);
      return `<td class="num"><div class="dose"><button type="button" class="step" data-dstep="${x.id}:-1" aria-label="Mniej: ${esc(x.name)}">−</button><b>${fmtNum(x.dose)} ${esc(x.unit)}</b><button type="button" class="step" data-dstep="${x.id}:1" aria-label="Więcej: ${esc(x.name)}">+</button></div><span class="sub">${di?.amt != null ? `= ${fmtNum(di.amt)} ${esc(di.r.u)} · ` : ""}${x.perWeek === 7 ? "codziennie" : `${x.perWeek} dni w tyg.`}</span></td>
        <td class="hide-phone">${di ? `${esc(recTxt(di.r))}${di.v !== "none" ? ` <span class="${DOSE_V[di.v][1]}" style="font-size:12px">· ${DOSE_V[di.v][0]}</span>` : di.amt == null && di.r.lo != null ? ' <span class="faint" style="font-size:12px">· wpisz skład z etykiety</span>' : ""}<span class="sub">${esc(di.r.when)}</span>` : '<span class="faint">porcja z etykiety</span>'}</td>`;
    })()}
        <td class="num">${st.k === "none" ? '<span class="faint">0</span>' : `${fmtNum(st.left)} ${esc(x.unit)}`}<span class="sub">opak. ${fmtNum(x.pack)} ${esc(x.unit)}</span></td>
        <td class="num">${status(st, x)}</td>
        <td class="num"><button class="btn small" data-buy="${x.id}">Kupiłem</button></td></tr>`).join("")}
      </tbody></table>
      <div class="faint" style="font-size:12px;margin-top:14px">Plus i minus zmieniają, ile bierzesz w dzień brania; zapas przelicza się od razu. Zalecane dawki są z badań (co najmniej 2 źródła), liczone w substancji czynnej. Kliknij nazwę, żeby wpisać skład z etykiety, zobaczyć źródła albo zmienić opakowanie. Decyzja, co i ile brać, jest twoja.</div>
    </section></div>`;
  };
  const fmtNum = (v) => (Number.isInteger(v) ? f0 : f1).format(Math.round(v * 10) / 10);
  function recOf(x) {
    const R = window.SUPP_REC || {};
    const n = String(x.name || "").toLowerCase();
    const k = Object.keys(R).find((k2) => n.startsWith(k2.toLowerCase()));
    return k ? R[k] : null;
  }
  function doseInfo(x) {
    const r = recOf(x);
    if (!r) return null;
    const per = x.per ?? r.per ?? null, amt = per != null ? x.dose * per : null;
    const v = amt == null || r.lo == null ? "none" : amt < r.lo * 0.95 ? "low" : amt > r.hi * 1.05 ? "high" : "ok";
    return { r, per, amt, v };
  }
  const recTxt = (r) => r.lo == null ? r.short : r.lo === r.hi ? `${fmtNum(r.lo)} ${r.u}` : `${fmtNum(r.lo)}–${fmtNum(r.hi)} ${r.u}`;
  const DOSE_V = { ok: ["w zaleceniu", "acc"], low: ["mniej niż w badaniach", "faint"], high: ["więcej niż zalecane", "warn"] };
  const doseStep = (x) => x.unit === "g" && x.dose >= 20 ? 5 : !Number.isInteger(x.dose) ? 0.5 : 1;
  const zl = (v) => `${f2.format(v)} zł`;
  const needDays = () => Math.max(14, (S.profile.lead || 0) + 3);
  const lower = (t) => String(t || "").toLowerCase();
  let cartOpen = {};
  function cartRows() {
    S.cartOff = S.cartOff || {};
    S.cartSkip = S.cartSkip || {};
    S.cartPick = S.cartPick || {};
    const nd = needDays();
    return (window.CART || []).map(([item, product, shop, url, price, pack, dose, daysN, monthly, why]) => {
      const r = { item, product, shop, url, price, pack, dose, daysN, monthly, why };
      const mine = (S.cartMine || {})[item];
      r.same = (S.cartSame || []).includes(item);
      if (mine) {
        const pick = S.cartPick[item] || (mine[3] == null ? "alt" : "mine");
        const m = { product: mine[0], shop: mine[1], url: mine[2], price: mine[3], pack: mine[4], why: mine[5] }, a = { product, shop, url, price, pack, why };
        Object.assign(r, pick === "alt" ? a : m);
        r.pick = pick;
        r.other = pick === "alt" ? m : a;
      }
      const sk = (window.CART_SKIN || {})[item];
      if (sk) {
        r.kind = "skin";
        r.prods = S.skin.products.filter((p) => {
          const t = lower(p.name + " " + p.step);
          return sk.kw.some((k) => t.includes(k));
        });
        r.tracked = r.prods.length > 0;
        r.skip = !!S.cartSkip?.[item];
        r.left = r.tracked ? Math.max(...r.prods.map((p) => prodState(p).daysLeft)) : 0;
      } else {
        r.kind = "supp";
        const keys = ((window.CART_LINK || {})[item] || [item]).map(lower);
        r.supps = S.supps.filter((x) => keys.some((k) => lower(x.name).startsWith(k)));
        const act = r.supps.filter((x) => x.active);
        r.gone = !r.supps.length;
        r.skip = !act.length;
        r.tracked = act.some((x) => x.stockDate);
        r.left = act.length ? Math.min(...act.map((x) => {
          const st = suppState(x);
          return st.k === "ok" || st.k === "soon" ? st.daysLeft : 0;
        })) : 0;
      }
      r.order = r.skip ? null : orderFor(item);
      S.cartIn = S.cartIn || {};
      if (S.cartIn[item] && (r.order || diffDays(S.cartIn[item], today()) > 14)) delete S.cartIn[item];
      r.inCart = S.cartIn[item] || null;
      r.status = r.skip ? "skip" : r.order ? "ordered" : r.left > nd ? "stock" : "need";
      r.on = r.status === "need" && price != null && (item in S.cartOff ? !S.cartOff[item] : !(window.CART_DEFAULT_OFF || []).includes(item));
      return r;
    });
  }
  const cartLeft = (r) => !r.tracked ? r.kind === "skin" ? "nie ma w Pielęgnacji" : "brak zapasu" : !Number.isFinite(r.left) ? "zapas" : r.left <= 0 ? "koniec zapasu" : `${days(r.left)}<span class="sub">do ${dShort(addDays(today(), r.left))}</span>`;
  VIEWS.koszyk = () => {
    S.cartOff = S.cartOff || {};
    S.cartSkip = S.cartSkip || {};
    const rows = cartRows(), need = rows.filter((r) => r.status === "need"), stock = rows.filter((r) => r.status === "stock"), skip = rows.filter((r) => r.status === "skip");
    const sum = (arr) => arr.filter((x) => x.on).reduce((a, x) => a + (x.price || 0), 0);
    const total = sum(need), cnt = need.filter((x) => x.on).length, shops = [...new Set(need.map((x) => x.shop))];
    const act = (r, extra = "") => `<div class="cart-act">${r.status === "need" && safeUrl(r.url) ? `<a class="btn small${r.inCart ? "" : " primary"}" href="${esc(r.url)}" target="_blank" rel="noopener" data-cin="${esc(r.item)}">${r.inCart ? "Otwórz" : "Kup →"}</a>` : ""}<button class="btn small" data-cbuy="${esc(r.item)}">Kupiłem</button>${extra}</div>`;
    const skipBtn = (r) => `<button class="link faint" data-cskip="${esc(r.item)}" title="Schowaj na stałe">nie biorę</button>`;
    const tag = (r) => r.pick ? `<span class="pill ${r.pick === "mine" ? "" : "warn"}" style="margin-left:8px">${r.pick === "mine" ? "twój produkt" : "zamiennik"}</span>` : r.same ? '<span class="pill" style="margin-left:8px">twój produkt</span>' : "";
    const swap = (r) => r.pick ? `<button class="link" style="font-size:12px;margin-top:4px;display:block;text-align:left" data-cpick="${esc(r.item)}">${r.pick === "mine" ? "zamiennik" : "wróć do twojego"}: ${esc(r.other.product)}${r.other.price != null ? ` · ${zl(r.other.price)}` : " · niedostępny"}</button>` : "";
    const name = (r) => `${esc(r.item)}${tag(r)}${r.inCart ? `<span class="pill acc" style="margin-left:8px">w koszyku sklepu · ${dShort(r.inCart)} <button class="link" data-cout="${esc(r.item)}" title="Zdejmij znacznik" aria-label="Zdejmij znacznik">×</button></span>` : ""}<span class="sub">${esc(r.product)}${r.why ? " · " + esc(r.why) : ""}</span>${swap(r)}`;
    const fold = (key, title, right, body) => `<details class="card c12 fold" data-fold="${key}"${cartOpen[key] ? " open" : ""}><summary class="card-head"><h2>${title}</h2><div class="right">${right}</div></summary>${body}</details>`;
    return `<div class="title-row"><div><h1>Koszyk</h1><div class="sub">${need.length ? `Do kupienia teraz: <b style="color:var(--text);font-weight:500">${cnt} ${plural(cnt, "rzecz", "rzeczy", "rzeczy")} za ${zl(total)}</b>.` : "Na najbliższe tygodnie masz wszystko."} Pokazuję to, czego nie masz albo co skończy się w ciągu ${days(needDays())}. Ceny przykładowe.</div></div></div>
    <div class="grid">${ordersCard()}${need.length ? shops.map((sh) => {
      const list = need.filter((x) => x.shop === sh), info = (window.CART_SHOPS || {})[sh], st = sum(list), free = (window.CART_FREE || {})[sh];
      const gap = free && st > 0 && st < free ? `<span style="color:var(--warning)">do darmowej dostawy brakuje ${zl(free - st)}</span> · ` : "";
      return `<section class="card c12"><div class="card-head"><h2>${esc(sh)}</h2><div class="right">${gap}${list.some((x) => x.price != null) ? `<b class="num" style="color:var(--text);font-weight:500">${zl(st)}</b>` : "brak w sprzedaży"}${info ? ` <a class="link" href="${esc(info.url)}" target="_blank" rel="noopener">sklep →</a>` : ""}${(() => {
        const n = list.filter((x) => x.on && safeUrl(x.url) && !x.inCart).length;
        return n ? ` <button class="btn small primary" data-copen="${esc(sh)}">Otwórz wszystkie (${n})</button>` : "";
      })()}</div></div>
        ${info ? `<div class="faint" style="font-size:12px;margin:-4px 0 8px">${esc(info.ship)}</div>` : ""}
        <table class="rows"><thead><tr><th style="width:28px"></th><th>Pozycja</th><th class="hide-phone">Dawka</th><th class="num">Zapas</th><th class="num">Cena</th><th class="num"></th></tr></thead><tbody>
        ${list.map((x) => `<tr${x.on ? "" : ' style="opacity:.5"'}><td>${x.price != null ? `<label class="check" style="padding:0"><input type="checkbox" data-cart="${esc(x.item)}" ${x.on ? "checked" : ""} aria-label="W koszyku: ${esc(x.item)}"><span class="box">${ic("tick", "")}</span></label>` : ""}</td>
          <td>${name(x)}</td>
          <td class="muted hide-phone">${x.kind === "supp" && x.supps?.[0] ? `biorę ${fmtNum(x.supps[0].dose)} ${esc(x.supps[0].unit)}` : esc(x.dose)}<span class="sub">${esc(x.pack)}</span></td>
          <td class="num ${x.tracked && x.left > 0 ? "warn" : "muted"}">${cartLeft(x)}</td>
          <td class="num">${x.price != null ? zl(x.price) : "–"}</td>
          <td class="num">${act(x, skipBtn(x))}</td></tr>`).join("")}
        </tbody></table></section>`;
    }).join("") : `<section class="card c12"><div class="empty">Nic nie trzeba teraz kupować. Gdy coś zacznie się kończyć, samo pojawi się tutaj.</div></section>`}
    ${stock.length ? fold("stock", "Masz zapas", `${stock.length} ${plural(stock.length, "pozycja", "pozycje", "pozycji")}`, `<table class="rows"><thead><tr><th>Pozycja</th><th class="hide-phone">Sklep</th><th class="num">Starczy na</th><th class="num"></th></tr></thead><tbody>
        ${stock.map((x) => `<tr><td>${esc(x.item)}${tag(x)}<span class="sub">${esc(x.product)}</span></td><td class="muted hide-phone">${esc(x.shop)}</td><td class="num">${cartLeft(x)}</td><td class="num">${act(x, skipBtn(x))}</td></tr>`).join("")}
        </tbody></table>`) : ""}
    ${skip.length ? fold("skip", "Nie biorę", `${skip.length} ${plural(skip.length, "pozycja", "pozycje", "pozycji")}`, `<table class="rows"><tbody>
        ${skip.map((x) => `<tr><td>${esc(x.item)}<span class="sub">${esc(x.product)}</span></td><td class="muted">${x.gone ? "usunięty z Suplementów; dodaj go tam, jeśli wrócisz" : x.kind === "supp" ? "wyłączony w Suplementach" : "schowany"}</td><td class="num">${x.gone ? "" : `<button class="btn small" data-cunskip="${esc(x.item)}">Przywróć</button>`}</td></tr>`).join("")}
        </tbody></table>`) : ""}
    </div>`;
  };
  function mergeInto(cur, inc) {
    const byId = (a, b, k = "id") => {
      const have = new Set(a.map((x) => x[k]));
      return [...a, ...b.filter((x) => !have.has(x[k]))];
    };
    const n = { added: 0 };
    for (const [id, x] of Object.entries(inc.sessions || {})) if (!cur.sessions[id]) {
      cur.sessions[id] = x;
      n.added++;
    }
    for (const [d, e] of Object.entries(inc.days || {})) {
      if (!cur.days[d]) n.added++;
      cur.days[d] = { ...e, ...cur.days[d] || {} };
    }
    for (const [w, c] of Object.entries(inc.checkins || {})) if (!cur.checkins[w]) {
      cur.checkins[w] = c;
      n.added++;
    }
    for (const [d, c] of Object.entries(inc.skin?.checks || {})) cur.skin.checks[d] = { ...c || {}, ...cur.skin.checks[d] || {} };
    cur.supps = byId(cur.supps, inc.supps || []);
    cur.labs = byId(cur.labs, inc.labs || []);
    cur.skin.products = byId(cur.skin.products, inc.skin?.products || []);
    cur.orders = byId(cur.orders || [], inc.orders || [], "key");
    cur.mailSeen = [.../* @__PURE__ */ new Set([...cur.mailSeen || [], ...inc.mailSeen || []])].slice(-3e3);
    return n;
  }
  function packOf(s) {
    const t = String(s || ""), m = t.match(/(\d+)\s*[×x]\s*(\d+(?:[.,]\d+)?)/);
    if (m) return [+m[1], parseFloat(m[2].replace(",", "."))];
    const n = t.match(/\d+(?:[.,]\d+)?/);
    return [1, n ? parseFloat(n[0].replace(",", ".")) : null];
  }
  function skipCart(item, on) {
    const r = cartRows().find((x) => x.item === item);
    if (!r) return;
    if (r.kind === "supp") {
      r.supps.forEach((x) => {
        x.active = !on;
      });
    } else if (on) S.cartSkip[item] = true;
    else delete S.cartSkip[item];
    save(on ? r.kind === "supp" ? `${item}: schowane i wyłączone w Suplementach` : `${item}: schowane` : `${item}: przywrócone`);
    rerender();
  }
  function buyCart(item) {
    const r = cartRows().find((x) => x.item === item);
    if (!r) return;
    const [n, pack] = packOf(r.pack);
    if (r.kind === "skin") {
      const sk = window.CART_SKIN[item], fresh = { name: r.product, step: sk.step, est: sk.est };
      if (!r.prods.length) {
        editProd(null, fresh);
        return;
      }
      const p = r.prods[0];
      editDialog(`Kupiłem: ${r.item}`, [
        { name: "mode", label: "Co to jest", type: "select", value: "spare", full: true, options: [["spare", `Zapas do: ${p.name}`], ["new", `Nowy kosmetyk: ${r.product}`]] },
        { name: "n", label: "Ile opakowań", type: "number", step: "1", value: 1 }
      ], (v) => {
        if (v.mode === "new") {
          editProd(null, fresh);
          return;
        }
        p.spare = (p.spare || 0) + Math.max(1, Math.round(v.n || 1));
        save(`${p.name}: ${days(prodState(p).daysLeft)} zapasu`);
        rerender();
      }, '<p class="faint" style="font-size:13px;margin:10px 0 0">Zapasowe opakowanie liczę po tym, jak klikniesz „Skończył się” przy obecnym.</p>');
      return;
    }
    if (r.gone) return;
    const list = r.supps.some((x) => x.active) ? r.supps.filter((x) => x.active) : r.supps, x0 = list[0];
    editDialog(`Kupiłem: ${r.product}`, [
      { name: "n", label: "Ile opakowań", type: "number", step: "1", value: n },
      { name: "pack", label: `W opakowaniu (${x0.unit})`, type: "number", step: "any", value: pack ?? x0.pack },
      { name: "date", label: "Od kiedy liczyć", type: "date", value: today(), full: true }
    ], (v) => {
      const c = Math.max(1, Math.round(v.n || 1)), pk = v.pack > 0 ? v.pack : x0.pack;
      for (const x of list) {
        const st = suppState(x);
        const left = st.k === "ok" || st.k === "soon" ? st.left : 0;
        Object.assign(x, { pack: pk, stock: left + c * pk, stockDate: v.date || today(), active: true, url: x.url || (safeUrl(r.url) ? r.url : "") });
      }
      const d = Math.min(...list.map((x) => daily(x) > 0 ? Math.floor(x.stock / daily(x)) : Infinity));
      save(Number.isFinite(d) ? `${r.item}: ${days(d)} zapasu` : "Zapisano");
      rerender();
    }, list.length > 1 ? `<p class="faint" style="font-size:13px;margin:10px 0 0">Dopiszę to do: ${list.map((x) => esc(x.name)).join(" i ")}.</p>` : "");
  }
  document.addEventListener("toggle", (ev) => {
    const k = ev.target?.dataset?.fold;
    if (k) cartOpen[k] = ev.target.open;
  }, true);
  let inbox = [];
  let ocrWorker = null;
  const PL_MON = { sty: 0, lut: 1, mar: 2, kwi: 3, maj: 4, cze: 5, lip: 6, sie: 7, wrz: 8, paz: 9, "paź": 9, lis: 10, gru: 11 };
  function loadScript(src) {
    return new Promise((ok, no) => {
      if ([...document.scripts].some((s2) => s2.src.endsWith(src))) return ok();
      const s = document.createElement("script");
      s.src = src;
      s.onload = ok;
      s.onerror = () => no(new Error("Nie udało się wczytać " + src));
      document.head.appendChild(s);
    });
  }
  async function ocr(file) {
    if (!ocrWorker) {
      await loadScript("vendor/tesseract/tesseract.min.js");
      const u = (p) => new URL(p, location.href).href;
      ocrWorker = await window.Tesseract.createWorker(["pol", "eng"], 1, { workerPath: u("vendor/tesseract/worker.min.js"), corePath: u("vendor/tesseract/core/"), langPath: u("vendor/tesseract/lang"), gzip: true, workerBlobURL: false });
    }
    const { data } = await ocrWorker.recognize(file, {}, { text: true, blocks: true });
    const words = data.words?.length ? data.words : (data.blocks || []).flatMap((b) => (b.paragraphs || []).flatMap((p) => (p.lines || []).flatMap((l) => l.words || [])));
    return { text: data.text || "", words };
  }
  async function makroDay(file, words, fileDate) {
    let bmp;
    try {
      bmp = await createImageBitmap(file);
    } catch {
      return null;
    }
    const W = bmp.width, H = bmp.height, y0 = Math.round(H * 0.09), y1 = Math.round(H * 0.17), cw = W / 7;
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = y1 - y0;
    const g = cv.getContext("2d", { willReadFrequently: true });
    g.drawImage(bmp, 0, y0, W, y1 - y0, 0, 0, W, y1 - y0);
    const px = g.getImageData(0, 0, W, y1 - y0).data, dark = new Array(7).fill(0);
    for (let y = 0; y < y1 - y0; y += 2) for (let x = 0; x < W; x += 2) {
      const i = (y * W + x) * 4;
      if (px[i] + px[i + 1] + px[i + 2] < 110) dark[Math.min(6, Math.floor(x / cw))]++;
    }
    const sel = dark.indexOf(Math.max(...dark)), area = cw / 2 * ((y1 - y0) / 2);
    if (dark[sel] < area * 0.12) return null;
    const nums = (words || []).filter((w) => /^\d{1,2}$/.test(w.text) && w.bbox && w.bbox.y0 >= y0 - H * 0.01 && w.bbox.y1 <= y1 + H * 0.02).map((w) => ({ col: Math.min(6, Math.floor((w.bbox.x0 + w.bbox.x1) / 2 / cw)), d: +w.text })).filter((n) => n.d >= 1 && n.d <= 31);
    if (!nums.length) return null;
    const wd = (s) => (parse(s).getDay() + 6) % 7, votes = /* @__PURE__ */ new Map();
    for (const n of nums) {
      for (let k = 0; k < 400; k++) {
        const c = addDays(fileDate, -k);
        if (parse(c).getDate() === n.d && wd(c) === n.col) {
          const mon2 = addDays(c, -n.col);
          votes.set(mon2, (votes.get(mon2) || 0) + 1);
          break;
        }
      }
    }
    if (!votes.size) return null;
    const mon = [...votes.entries()].sort((a, b) => b[1] - a[1])[0][0];
    return addDays(mon, sel);
  }
  function dateFromText(t, fileDate) {
    const n = normTxt(t), base = fileDate || today();
    if (/\bdzis|\bdzisiaj/.test(n)) return { date: base, how: "dzisiaj (data zrzutu)" };
    if (/\bwczoraj/.test(n)) return { date: addDays(base, -1), how: "wczoraj (data zrzutu − 1)" };
    let m;
    const mk = (d, mo, y) => {
      let yy = y ? y < 100 ? 2e3 + y : y : +base.slice(0, 4);
      let s = `${yy}-${pad2(mo + 1)}-${pad2(d)}`;
      if (!y && s > addDays(base, 1)) s = `${yy - 1}-${pad2(mo + 1)}-${pad2(d)}`;
      return s;
    };
    m = n.match(/\b(\d{1,2})\s+(sty|lut|mar|kwi|maj|cze|lip|sie|wrz|paz|lis|gru)[a-z]*\b/);
    if (m) return { date: mk(+m[1], PL_MON[m[2]]), how: "z napisu na zrzucie" };
    m = n.match(/\b(\d{1,2})[./](\d{1,2})[./](\d{4})\b/);
    if (m && +m[2] >= 1 && +m[2] <= 12) return { date: mk(+m[1], +m[2] - 1, +m[3]), how: "z napisu na zrzucie" };
    return { date: base, how: "data pliku (sprawdź)" };
  }
  function parseMakro(text, fileDate) {
    const t = String(text).replace(/\r/g, ""), n = normTxt(t);
    if (!/kcal/.test(n) || !/(bia|wegl|tl|tluszcz)/.test(n)) return null;
    const num = (s) => s == null ? null : parseFloat(String(s).replace(/\s/g, "").replace(",", "."));
    const near = (label) => {
      const re = new RegExp(label + "[^\\d\\n]{0,24}(\\d{1,3}(?:[.,]\\d)?)\\s*(?:/\\s*\\d{1,3}\\s*)?g", "i");
      const m = n.match(re) || n.match(new RegExp("(\\d{1,3}(?:[.,]\\d)?)\\s*(?:/\\s*\\d{1,3}\\s*)?g[^\\n]{0,8}\\n?[^\\d\\n]{0,10}" + label, "i"));
      return m ? num(m[1]) : null;
    };
    const N = "(\\d{1,3}(?:[.,]\\d)?)";
    const bar = n.match(new RegExp("kcal\\s+(\\d[\\d ]{1,4}?)\\s+b\\S*\\s+" + N + "\\s+t\\S*\\s+" + N + "\\s+w\\S*\\s+" + N + "(?![\\d,.])"));
    const one = (re) => {
      const m = n.match(re);
      return m ? num(m[1]) : null;
    };
    const fit = bar ? { kcal: num(bar[1]), p: num(bar[2]), f: num(bar[3]), c: num(bar[4]) } : { kcal: one(/\bkcal\s+(\d{3,5})(?![\d,.])/), p: one(/\bbia\S*\s+(\d{1,3}(?:[.,]\d)?)(?![\d])/), f: one(/\bt[l1ih]\.?\s+(\d{1,3}(?:[.,]\d)?)(?![\d])/), c: one(/\bw[e3]gl\S*\s+(\d{1,3}(?:[.,]\d)?)(?![\d])/) };
    if (fit.kcal != null && fit.kcal <= 9e3 && (fit.p != null || fit.f != null || fit.c != null)) return { ...fit, ...dateFromText(t, fileDate), makro: true };
    let kcal = null;
    const k1 = n.match(/(\d[\d\s]{2,5})\s*\/\s*\d[\d\s]{2,5}\s*kcal/) || n.match(/(?:zjedzon|spozyt|kalori)[^\d\n]{0,20}(\d[\d\s]{2,5})\s*kcal/) || n.match(/(\d[\d\s]{2,5})\s*kcal/);
    if (k1) kcal = num(k1[1]);
    const r = { kcal, p: near("bialk[a-z]*"), f: near("tluszcz[a-z]*"), c: near("weglowodan[a-z]*") };
    if (r.kcal != null && (r.kcal < 200 || r.kcal > 8e3)) r.kcal = null;
    for (const k of ["p", "f", "c"]) if (r[k] != null && r[k] > 600) r[k] = null;
    if (r.kcal == null && r.p == null) return null;
    return { ...r, ...dateFromText(t, fileDate) };
  }
  const fileDay = (f) => f.lastModified ? iso(new Date(f.lastModified)) : today();
  async function processFiles(files) {
    const list = [...files];
    if (!list.length) return;
    if (route().r !== "wrzuc") location.hash = "#/wrzuc";
    for (const f of list) {
      const it = { id: uid(), name: f.name || "plik", kind: "busy", msg: "czytam…" };
      inbox.unshift(it);
      rerenderInbox();
      try {
        if (/\.csv$/i.test(f.name) || f.type === "text/csv") {
          const txt = await readFile(f);
          if (!/^﻿?Title,Date,Duration,Exercise/.test(txt)) {
            Object.assign(it, { kind: "unknown", msg: "CSV, ale nie z treningami" });
            continue;
          }
          const r = importCsv(S, txt, f.name);
          save();
          Object.assign(it, { kind: "done", type: "Treningi", msg: r.older ? `starszy plik (ostatni trening ${dShort(r.newest)}): dopisano ${r.added}, niczego nie nadpisano` : `${r.added} nowych, ${r.updated} zmienionych, ${r.same} bez zmian` });
        } else if (/\.json$/i.test(f.name) || f.type === "application/json") {
          const s = JSON.parse(await readFile(f));
          if (!s || !s.version || !s.profile) {
            Object.assign(it, { kind: "unknown", msg: "JSON, ale nie kopia Formy" });
            continue;
          }
          Object.assign(it, { kind: "json", type: "Kopia Formy", msg: `${Object.keys(s.sessions || {}).length} treningów, ${Object.keys(s.days || {}).length} wpisów dnia`, data: s });
        } else Object.assign(it, { kind: "unknown", msg: /^image\//.test(f.type) ? "zrzutów ekranu w demo nie odczytuję" : "nie wiem, co to za plik" });
      } catch (e) {
        console.warn(e);
        Object.assign(it, { kind: "unknown", msg: e.message || "błąd odczytu" });
      } finally {
        rerenderInbox();
      }
    }
  }
  function rerenderInbox() {
    if (route().r === "wrzuc") render({ animate: false, scroll: false });
  }
  function saveMakro(it) {
    const d = it.data;
    if (!d.date) return;
    const e = { ...S.days[d.date] || {} };
    for (const k of ["kcal", "p", "f", "c"]) if (d[k] != null) e[k] = d[k];
    S.days[d.date] = e;
    it.kind = "done";
    it.msg = `zapisano w dniu ${dLong(d.date, false)}`;
  }
  VIEWS.wrzuc = () => {
    const fit = inbox.filter((x) => x.kind === "makro");
    const row = (x) => {
      if (x.kind === "makro") {
        const d = x.data, inp = (k, l, step = "1") => `<label class="field">${l}<input type="number" step="${step}" data-inb="${x.id}:${k}" value="${d[k] ?? ""}"></label>`;
        const had = S.days[d.date] && (S.days[d.date].kcal || S.days[d.date].p) ? `<div class="warn" style="font-size:12px">W tym dniu są już dane: ${S.days[d.date].kcal ?? "–"} kcal, ${S.days[d.date].p ?? "–"} g białka. Zapis je zastąpi.</div>` : "";
        return `<li class="inb"><div class="inb-head"><span class="pill">Makro</span><span class="grow muted">${esc(x.name)}</span><button class="link faint" data-inbdrop="${x.id}">pomiń</button></div>
        <div class="form-grid" style="grid-template-columns:repeat(5,minmax(0,1fr))"><label class="field">Dzień<input type="date" data-inb="${x.id}:date" value="${d.date}"></label>${inp("kcal", "Kalorie")}${inp("p", "Białko (g)", "any")}${inp("f", "Tłuszcz (g)", "any")}${inp("c", "Węglowodany (g)", "any")}</div>
        <div class="faint" style="font-size:12px">Data: ${esc(x.msg)}. Sprawdź liczby, zanim zapiszesz.</div>${had}</li>`;
      }
      if (x.kind === "json") return `<li class="inb"><div class="inb-head"><span class="pill">Kopia</span><span class="grow">${esc(x.name)}<span class="sub">${esc(x.msg)}</span></span><button class="btn small" data-inbjson="${x.id}:merge">Scal z obecnymi</button><button class="btn small danger" data-inbjson="${x.id}:replace">Zastąp</button></div></li>`;
      return `<li class="inb"><div class="inb-head"><span class="pill ${x.kind === "unknown" ? "warn" : ""}">${x.kind === "busy" ? "…" : x.kind === "unknown" ? "?" : esc(x.type || "OK")}</span><span class="grow">${esc(x.name)}<span class="sub">${esc(x.msg)}</span></span>${x.kind !== "busy" ? `<button class="link faint" data-inbdrop="${x.id}">usuń z listy</button>` : ""}</div></li>`;
    };
    return `<div class="title-row"><div><h1>Wrzuć</h1><div class="sub">Wrzuć tu pliki naraz: eksport treningów (CSV z aplikacji treningowej) albo kopię danych (JSON). Rozpoznam, co to jest, i poukładam.</div></div>
    ${fit.length ? `<div class="actions"><button class="btn primary" data-act="inbSaveAll">Zapisz ${fit.length} ${plural(fit.length, "dzień", "dni", "dni")} z Makro</button></div>` : ""}</div>
    <div class="grid"><section class="card c12">
      <div class="drop big" data-act="inbox" tabindex="0" role="button" aria-label="Wybierz pliki">${ic("upload", "")}<span>Upuść pliki albo kliknij, żeby wybrać</span><small>CSV z treningami, kopia JSON z Formy</small></div>
      ${inbox.length ? `<ul class="list inb-list">${inbox.map(row).join("")}</ul>` : ""}
    </section></div>`;
  };
  let ob = { step: 0, v: { name: "", sex: "m", birth: "", height: "", w: "", goal: "redukcja", goalDate: "", activity: 1.55, kit: "basic", skin: true, iso: false, method: "upper-lower" } };
  const OB_ACT = [[1.4, "Siedzący", "praca przy biurku, mało ruchu"], [1.55, "Lekko aktywny", "2–4 treningi w tygodniu"], [1.7, "Aktywny", "treningi i dużo chodzenia"], [1.9, "Bardzo aktywny", "praca fizyczna albo sport codziennie"]];
  const OB_GOAL = [["redukcja", "Redukcja", "chudnę ok. 0,5% masy na tydzień", -0.5], ["rekompozycja", "Rekompozycja", "lekki deficyt, mięśnie w górę", -0.25], ["masa", "Masa", "powolny przyrost ok. 0,25% na tydzień", 0.25]];
  const OB_KIT = [["Kreatyna (monohydrat)", "kreatyna", 1e3, "g", 5, 7], ["Omega-3", "omega-3", 120, "kaps.", 2, 7], ["Witamina D3", "D3 2000 IU", 120, "kaps.", 1, 7], ["Magnez", "magnez 100 mg", 120, "kaps.", 2, 7], ["Białko WPC 80", "odżywka białkowa", 900, "g", 30, 7]];
  function obEstimate(v) {
    const w = parseFloat(v.w), h = parseFloat(v.height), b = v.birth;
    if (!(w > 30 && h > 120 && /^\d{4}-\d{2}-\d{2}$/.test(b))) return null;
    const a = Math.floor(diffDays(b, today()) / 365.25), bmr = 10 * w + 6.25 * h - 5 * a + (v.sex === "k" ? -161 : 5);
    const tdee = Math.round(bmr * v.activity / 10) * 10, rate = OB_GOAL.find((g) => g[0] === v.goal)[3];
    const kcal = Math.round((tdee + rate / 100 * w * 7700 / 7) / 10) * 10, protein = Math.round(w * 2 / 5) * 5;
    return { tdee, kcal, protein, age: a };
  }
  VIEWS.start = () => {
    const v = ob.v, e = obEstimate(v), st = ob.step;
    const dots = [0, 1, 2].map((i) => `<span class="ob-dot${i === st ? " on" : i < st ? " done" : ""}"></span>`).join("");
    const radio = (name, list, cur) => `<div class="ob-choices">${list.map(([val, l, d]) => `<button type="button" class="ob-choice${String(cur) === String(val) ? " on" : ""}" data-ob="${name}:${val}"><b>${l}</b><span>${d}</span></button>`).join("")}</div>`;
    const steps = [
      `<h2 class="ob-h">Kilka słów o tobie</h2><p class="ob-p">Z tego policzę spalanie, białko i tempo. Wszystko zostaje na twoim urządzeniu.</p>
     <div class="form-grid"><label class="field full">Imię<input type="text" data-obv="name" value="${esc(v.name)}" placeholder="np. Kuba" autocomplete="given-name"></label>
     <label class="field">Płeć<select data-obv="sex"><option value="m"${v.sex === "m" ? " selected" : ""}>mężczyzna</option><option value="k"${v.sex === "k" ? " selected" : ""}>kobieta</option></select></label>
     <label class="field">Data urodzenia<input type="date" data-obv="birth" value="${esc(v.birth)}"></label>
     <label class="field">Wzrost (cm)<input type="number" inputmode="numeric" data-obv="height" value="${esc(v.height)}" placeholder="180"></label>
     <label class="field">Waga dziś (kg)<input type="number" inputmode="decimal" step="0.1" data-obv="w" value="${esc(v.w)}" placeholder="80"></label></div>`,
      `<h2 class="ob-h">Twój cel</h2><p class="ob-p">Po dwóch tygodniach wpisów aplikacja zamieni szacunek na twoje prawdziwe spalanie z wagi i kalorii.</p>
     ${radio("goal", OB_GOAL, v.goal)}
     <div class="label" style="margin:18px 0 8px">Aktywność</div>${radio("activity", OB_ACT, v.activity)}
     <div class="form-grid" style="margin-top:16px"><label class="field">Termin celu (opcjonalnie)<input type="date" data-obv="goalDate" value="${esc(v.goalDate)}"></label></div>
     ${e ? `<div class="ob-est"><div><span class="label">Spalanie</span><b class="num">${f0.format(e.tdee)}</b><small>kcal / dzień</small></div><div><span class="label">Jedz</span><b class="num">${f0.format(e.kcal)}</b><small>kcal / dzień</small></div><div><span class="label">Białko</span><b class="num">${e.protein}</b><small>g / dzień</small></div></div>` : '<div class="faint" style="margin-top:14px;font-size:13px">Uzupełnij wagę, wzrost i datę urodzenia, a pokażę wyliczenia.</div>'}`,
      `<h2 class="ob-h">Co jeszcze śledzić</h2><p class="ob-p">Wszystko można zmienić później w Ustawieniach.</p>
     <div class="label" style="margin-bottom:8px">Metoda treningowa</div>${radio("method", [["stronglifts", "StrongLifts 5×5", "początkujący, siła"], ["upper-lower", "Góra / dół", "masa i siła, 4× w tyg."], ["ppl", "Push / Pull / Legs", "masa, 3–6× w tyg."], ["531", "5/3/1", "siła na lata"], ["mentzer", "Heavy Duty", "jedna seria do upadku"]], v.method)}<div class="faint" style="font-size:12px;margin:6px 0 0">Więcej metod (14) wybierzesz później w Treningach.</div>
     <div class="label" style="margin:18px 0 8px">Suplementy na start</div>${radio("kit", [["basic", "Podstawowy zestaw", "kreatyna, omega-3, D3, magnez, białko"], ["empty", "Pusta lista", "dodam swoje sam"]], v.kit)}
     <div class="label" style="margin:18px 0 8px">Pielęgnacja</div>${radio("skin", [["true", "Tak", "rutyna rano i wieczorem, zapas kosmetyków"], ["false", "Nie", "bez zakładki pielęgnacji"]], v.skin)}`
    ];
    return `<div class="ob"><div class="ob-card card">
      <div class="ob-top"><div class="brand" style="padding:0">${'<svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true"><path d="M3 17h6l3-7 5 13 3-6h9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'} Forma</div><div class="ob-dots">${dots}</div></div>
      ${st === 0 ? '<h1 class="ob-title">Twoja forma w jednym miejscu</h1><p class="ob-lead">Treningi z pliku CSV, kalorie, waga, suplementy i badania. Aplikacja liczy prawdziwe spalanie, pilnuje zapasów i podpowiada, kiedy dołożyć ciężar.</p>' : ""}
      <form id="obForm" autocomplete="off">${steps[st]}</form>
      <div class="ob-actions">${st ? '<button class="btn" type="button" data-act="obBack">Wstecz</button>' : '<button class="btn" type="button" data-act="demoOn">Zobacz przykład</button>'}<div class="spacer"></div><button class="btn primary" type="button" data-act="obNext">${st === 2 ? "Zaczynamy" : "Dalej"}</button></div>
      ${st === 0 ? '<div class="ob-foot"><a class="link" href="#/ustawienia">Mam już dane na innym urządzeniu (kod synchronizacji)</a></div>' : ""}
    </div></div>`;
  };
  function obNext() {
    const v = ob.v;
    if (ob.step === 0) {
      if (!v.name.trim()) {
        toast("Wpisz imię.");
        return;
      }
      if (!(parseFloat(v.height) > 120 && parseFloat(v.height) < 230)) {
        toast("Wpisz wzrost w centymetrach.");
        return;
      }
      if (!(parseFloat(v.w) > 30 && parseFloat(v.w) < 300)) {
        toast("Wpisz wagę w kilogramach.");
        return;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v.birth) || diffDays(v.birth, today()) < 13 * 365) {
        toast("Wpisz datę urodzenia.");
        return;
      }
    }
    if (ob.step < 2) {
      ob.step++;
      render();
      return;
    }
    const e = obEstimate(v), g = OB_GOAL.find((x) => x[0] === v.goal);
    Object.assign(S.profile, { name: v.name.trim(), sex: v.sex, birth: v.birth, height: parseFloat(v.height), activity: +v.activity, goal: v.goal, ratePct: g[3], startKcal: e?.kcal || S.profile.startKcal, protein: e?.protein || S.profile.protein, iso: v.iso === true || v.iso === "true", skin: v.skin === true || v.skin === "true", method: v.method || "upper-lower", methodStart: today() });
    if (v.goalDate) S.profile.goalDate = v.goalDate;
    S.days[today()] = { ...S.days[today()] || {}, w: parseFloat(v.w) };
    if (v.kit === "basic" && !S.supps.length) S.supps = OB_KIT.map(([name, brand, pack, unit, dose, perWeek]) => ({ id: uid(), name, brand, pack, unit, dose, perWeek, iso: "ok", note: "", stock: 0, stockDate: null, active: true, url: "", per: null }));
    save(`Witaj, ${S.profile.name}!`);
    location.hash = "#/pulpit";
    render();
  }
  const DEMO_KEY = "forma.demo";
  let DEMO = true;
  function demoState() {
    const s = freshState();
    let seed = 7;
    const rnd = () => {
      seed = seed * 16807 % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const t = today(), start = addDays(t, -69);
    Object.assign(s.profile, { name: "Kuba", sex: "m", birth: "1998-04-12", height: 182, activity: 1.55, goal: "redukcja", ratePct: -0.5, startKcal: 2400, protein: 170, iso: false, skin: true, goalDate: addDays(t, 60), method: "upper-lower", methodStart: start, benchGoal: 110, nextGoal: "masa", nextRate: 0.1 });
    s.supps = [];
    s.labs = [];
    s.checkins = {};
    s.sessions = {};
    s.days = {};
    for (let i = 0; i <= 69; i++) {
      const d = addDays(start, i), w = 86 - i * 0.05 + (rnd() - 0.5) * 0.9;
      const e = {};
      if (rnd() > 0.12) e.w = Math.round(w * 10) / 10;
      if (rnd() > 0.1) {
        e.kcal = Math.round((2350 + (rnd() - 0.5) * 400) / 10) * 10;
        e.p = Math.round(160 + (rnd() - 0.5) * 40);
        e.f = Math.round(70 + (rnd() - 0.5) * 20);
        e.c = Math.round(250 + (rnd() - 0.5) * 60);
      }
      if (Object.keys(e).length) s.days[d] = e;
    }
    const plan = {
      A: [["Bench Press", 80, 6], ["Bent Over Row", 70, 8], ["Dumbbell Seated Shoulder Press", 26, 8], ["Pull-up", 0, 8], ["Triceps Pushdown", 30, 10], ["Hammer Curl", 16, 10]],
      B: [["Sled Hack Squat", 120, 8], ["Romanian Deadlift", 100, 8], ["Lever Seated Leg Press", 180, 12], ["Lever Lying Leg Curl", 45, 12], ["Lever Seated Calf Press", 90, 15], ["Hanging Leg Raise", 0, 12]]
    };
    let n = 0;
    for (let i = 0; i <= 69; i++) {
      const d = addDays(start, i), wd = parse(d).getDay();
      if (![1, 3, 5].includes(wd)) continue;
      const key = n % 2 ? "B" : "A", prog = 1 + Math.floor(n / 6) * 0.025;
      n++;
      const sets = [];
      for (const [e, w0, r0] of plan[key]) for (let k = 0; k < 3; k++) sets.push({ e, w: w0 ? Math.round(w0 * prog / 2.5) * 2.5 : 0, r: Math.max(3, r0 - k + Math.round((rnd() - 0.5) * 2)), t: "NORMAL_SET" });
      const id = `${d} 17:${pad2(10 + n % 40)}:00`;
      s.sessions[id] = { id, date: d, time: id.slice(11, 16), title: key === "A" ? "Góra" : "Dół", dur: `01:${pad2(5 + Math.floor(rnd() * 40))}:00`, sets };
    }
    s.lastImport = { at: (/* @__PURE__ */ new Date()).toISOString(), source: "przykład", added: n, updated: 0, same: 0, total: n };
    const sup = (name, brand, pack, unit, dose, perWeek, daysAgo, packs = 1) => ({ id: uid(), name, brand, pack, unit, dose, perWeek, iso: "ok", note: "", stock: pack * packs, stockDate: addDays(t, -daysAgo), active: true, url: "", per: null });
    s.supps = [sup("Kreatyna (monohydrat)", "Monohydrat 500 g", 500, "g", 5, 7, 40), sup("Omega-3", "Omega 3 Forte", 120, "kaps.", 2, 7, 52), sup("Witamina D3", "D3 2000 IU", 90, "kaps.", 1, 7, 85), sup("Magnez", "Magnesium+", 160, "kaps.", 2, 7, 20), sup("Białko WPC 80", "WPC 80", 900, "g", 30, 7, 24), sup("Kofeina 200 mg", "Kofeina", 100, "kaps.", 1, 3, 10)];
    s.labs = [[-60, "Witamina D 25(OH)", 28, "ng/ml", 30, 100], [-60, "Ferrytyna", 85, "ng/ml", 30, 400], [-60, "TSH", 1.9, "mIU/l", 0.27, 4.2], [-60, "Testosteron", 6.1, "ng/ml", 2.5, 8.4], [-60, "ALT", 31, "U/l", null, 50]].map(([d, name, value, unit, lo, hi]) => ({ id: uid(), date: addDays(t, d), name, value, unit, lo, hi, note: "" }));
    const mon = (k) => {
      const d = addDays(t, -k * 7);
      return addDays(d, -((parse(d).getDay() + 6) % 7));
    };
    for (let k = 1; k <= 4; k++) s.checkins[mon(k)] = { date: mon(k), sleep: 4, energy: 3 + k % 2, stress: 2, hunger: 3, diet: 4, recovery: 4, hard: k === 2 ? "Mało snu w środku tygodnia" : "", good: "Wszystkie treningi zrobione" };
    s.skin.products = [{ id: uid(), name: "Krem nawilżający", step: "Nawilżanie", opened: addDays(t, -38), est: 60, spare: 0, history: [52] }, { id: uid(), name: "Filtr SPF 50", step: "Filtr", opened: addDays(t, -44), est: 50, spare: 0, history: [] }];
    s.orders = [{ key: uid(), shop: "Sklep z suplementami", no: "17000000001", date: addDays(t, -2), status: "shipped", items: [{ item: "Omega-3", name: "Omega 3 Forte", qty: 1 }, { item: "Kreatyna", name: "100% Monohydrat Kreatyny", qty: 1 }], tracking: null, courier: "Kurier", updated: (/* @__PURE__ */ new Date()).toISOString(), stocked: false }];
    s.cartMine = {};
    s.cartSame = [];
    s.mailInit = true;
    s.theme = S?.theme || "noc";
    return s;
  }
  function demoOn() {
    try {
      sessionStorage.setItem(DEMO_KEY, "1");
    } catch {
    }
    DEMO = true;
    S = demoState();
    version++;
    lastRec = null;
    applyTheme();
    location.hash = "#/pulpit";
    render();
  }
  function demoOff() {
    toast("To wersja demonstracyjna: dane są zmyślone, a zmiany znikają po odświeżeniu strony.");
  }
  VIEWS.pielegnacja = () => {
    const t = today();
    const hist = [];
    for (let i = 13; i >= 0; i--) hist.push(addDays(t, -i));
    const done = routineFull;
    const card = (part, title) => `<section class="card c4"><div class="card-head"><h2>${title}</h2><div class="right">${routineProgress(part)}</div></div>${checklist(part, t)}
    <div class="foot"><input type="text" placeholder="Nowy krok, np. serum" data-newstep="${part}" aria-label="Nowy krok ${title}" style="flex:1"><select data-newevery="${part}" aria-label="Jak często"><option value="1">codziennie</option><option value="2">co 2 dni</option><option value="3">co 3 dni</option><option value="7">raz w tygodniu</option></select><button class="btn small" data-addstep="${part}">Dodaj</button></div>
    <div class="faint" style="font-size:12px;margin-top:8px">${S.skin.routine[part].map((x) => `<button class="link" style="font-size:12px" data-delstep="${part}:${x.id}" title="Usuń krok">${esc(x.n)}${x.every > 1 ? ` (co ${x.every} dni)` : ""} ×</button>`).join(" · ")}</div></section>`;
    const prods = S.skin.products.filter((p) => !p.buy).map((p) => ({ p, st: prodState(p) })).sort((a, b) => a.st.daysLeft - b.st.daysLeft);
    const toBuy = S.skin.products.filter((p) => p.buy);
    const P = S.profile, iso2 = isoState(energy().bw);
    const isoCard = "";
    return `<div class="title-row"><div><h1>Pielęgnacja</h1><div class="sub">Codzienna rutyna: odhaczaj kroki, a aplikacja policzy, kiedy kończą się kosmetyki.</div></div>
      <div class="actions"><button class="btn" data-act="addBuy">Do kupienia</button><button class="btn" data-act="addProd">Dodaj kosmetyk</button></div></div>
    <div class="grid">
      ${isoCard}
      ${card("am", "Rano")}${card("pm", "Wieczór")}
      ${toBuy.length ? `<section class="card c12"><div class="card-head"><h2>Do kupienia</h2><div class="right">po zakupie kliknij „Kupiłem”, a zacznę liczyć zużycie od dziś</div></div>
        <table class="rows"><tbody>${toBuy.map((p) => `<tr><td><button class="link" style="color:var(--text);font-size:14px;text-align:left" data-edit-prod="${p.id}">${esc(p.name)}</button><span class="sub">${esc(p.step || "")}</span></td><td class="num"><button class="btn small" data-bought="${p.id}">Kupiłem</button></td></tr>`).join("")}</tbody></table></section>` : ""}
      <section class="card c4"><div class="card-head"><h2>Ostatnie 14 dni</h2><div class="right">pełna rutyna</div></div>
        <table><thead><tr><th></th>${hist.map((d) => `<th class="num" style="padding:0 0 8px;text-align:center">${parse(d).getDate()}</th>`).join("")}</tr></thead><tbody>
        ${[["am", "Rano"], ["pm", "Wieczór"]].map(([k, l]) => `<tr><td class="muted" style="border:0;padding:6px 8px 6px 0">${l}</td>${hist.map((d) => `<td style="border:0;padding:6px 0;text-align:center"><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${done(d, k) ? "var(--accent)" : "var(--chart-track)"}"></span></td>`).join("")}</tr>`).join("")}
        </tbody></table>
        <div class="faint" style="font-size:12px;margin-top:10px">Rano: ${hist.filter((d) => done(d, "am")).length}/14 · wieczór: ${hist.filter((d) => done(d, "pm")).length}/14</div></section>
      <section class="card c12"><div class="card-head"><h2>Kosmetyki</h2><div class="right">czas działania uczy się z każdego opakowania</div></div>
        ${prods.length ? `<table class="rows"><thead><tr><th>Kosmetyk</th><th class="num hide-phone">Otwarty</th><th class="num">Wystarcza na</th><th class="num">Skończy się</th><th class="num"></th></tr></thead><tbody>
        ${prods.map(({ p, st }) => `<tr><td><button class="link" style="color:var(--text);font-size:14px;text-align:left" data-edit-prod="${p.id}">${esc(p.name)}</button><span class="sub">${esc(p.step || "")}</span></td><td class="num muted hide-phone">${dShort(p.opened)}</td><td class="num">${st.learned ? "" : "~"}${days(st.est)}<span class="sub">${st.learned ? `średnio z ${p.history.length} ${plural(p.history.length, "opakowania", "opakowań", "opakowań")}` : "na oko"}</span></td><td class="num ${st.k === "soon" ? "warn" : ""}">${st.daysLeft ? days(st.daysLeft) : "lada dzień"}<span class="sub">${dShort(st.end)}${st.spare ? ` · ${st.spare} w zapasie` : ""}</span></td><td class="num"><button class="btn small" data-finish="${p.id}">Skończył się</button></td></tr>`).join("")}
        </tbody></table>` : `<div class="empty">Dodaj kosmetyki, których używasz: wpisz, na ile mniej więcej wystarczają. Gdy oznaczysz „Skończył się”, zapamiętam, ile naprawdę wystarczył, i przy następnym opakowaniu użyję tego czasu.</div>`}</section>
      ${(window.SEED_SKIN_ORDERS || []).length ? `<section class="card c12"><div class="card-head"><h2>Z twoich zamówień</h2><div class="right">ocena</div></div>
        <table class="rows"><thead><tr><th>Kosmetyk</th><th>Ocena</th><th>Dlaczego</th><th class="num"></th></tr></thead><tbody>
        ${(window.SEED_SKIN_ORDERS || []).map(([name, src, v, note, est, step], i) => {
      const has = S.skin.products.some((p) => p.name === name);
      return `<tr><td>${esc(name)}<span class="sub">${esc(src)}</span></td>
          <td><span class="pill ${v === "stop" ? "neg" : v === "zamien" ? "warn" : ""}">${v === "ok" ? "pasuje" : v === "stop" ? "na razie odstaw" : "lepiej wymienić"}</span></td>
          <td class="second muted" style="max-width:640px">${esc(note)}</td>
          <td class="num">${v === "ok" ? has ? '<span class="faint">na liście</span>' : `<button class="btn small" data-addorder="${i}">Dodaj</button>` : ""}</td></tr>`;
    }).join("")}
        </tbody></table></section>` : ""}
    </div>`;
  };
  VIEWS.badania = () => {
    const dates = [...new Set(S.labs.map((l) => l.date))].sort().reverse();
    const names = [];
    for (const l of [...S.labs].sort((a, b) => a.date < b.date ? -1 : 1)) if (!names.includes(l.name)) names.push(l.name);
    const get = (n, d) => S.labs.find((l) => l.name === n && l.date === d);
    const out = (l) => l && l.value != null && (l.lo != null && l.value < l.lo || l.hi != null && l.value > l.hi);
    const range = (l) => l.lo != null && l.hi != null ? `${fmtLab(l.lo)}–${fmtLab(l.hi)}` : l.hi != null ? `< ${fmtLab(l.hi)}` : l.lo != null ? `> ${fmtLab(l.lo)}` : "–";
    const flagged = names.filter((n) => {
      const l = get(n, dates.find((d) => get(n, d)));
      return out(l);
    });
    return `<div class="title-row"><div><h1>Badania</h1><div class="sub">${dates.length} ${plural(dates.length, "pobranie", "pobrania", "pobrań")}: ${dates.map((d) => dLong(d)).join(", ")}${flagged.length ? ` · ostatnio poza normą: ${flagged.map(esc).join(", ")}` : ""}</div></div>
      <div class="actions"><button class="btn" data-act="addLab">Dodaj wynik</button></div></div>
    <div class="grid"><section class="card c12">
      <table class="rows labs" style="--n:${Math.max(1, dates.length)}"><thead><tr><th>Badanie</th><th class="num hide-phone">Norma</th>${dates.map((d) => `<th class="num">${dShort(d)} ${parse(d).getFullYear()}</th>`).join("")}</tr></thead><tbody>
      ${names.map((n) => {
      const any = S.labs.find((l) => l.name === n);
      return `<tr><td>${esc(n)}<span class="sub">${esc(any.unit)}${S.labs.filter((l) => l.name === n && l.note).map((l) => " · " + esc(l.note)).join("")}</span></td><td class="num muted hide-phone">${range(any)}</td>
        ${dates.map((d) => {
        const l = get(n, d);
        return `<td data-d="${dShort(d)} ${String(parse(d).getFullYear()).slice(2)}" class="num ${l ? out(l) ? "neg" : "" : "faint"}">${l ? `<button class="link" style="color:inherit;font-size:14px" data-edit-lab="${l.id}">${fmtLab(l.value)}</button>${out(l) ? `<span class="sub">${l.hi != null && l.value > l.hi ? "ponad normę" : "poniżej normy"}</span>` : ""}` : "–"}</td>`;
      }).join("")}</tr>`;
    }).join("")}
      </tbody></table>
    </section></div>`;
  };
  const fmtLab = (v) => {
    const s = String(v);
    const d = s.includes(".") ? Math.min(2, s.split(".")[1].length) : 0;
    return nf(d).format(v);
  };
  VIEWS.checkin = () => {
    const wk = weekKey();
    const cur = S.checkins[wk] || {};
    const hist = Object.keys(S.checkins).sort().reverse().slice(0, 10);
    return `<div class="title-row"><div><h1>Check-in tygodnia</h1><div class="sub">Tydzień od ${dLong(wk, false)} do ${dLong(addDays(wk, 6))}. Raz w tygodniu, najlepiej w niedzielę wieczorem.</div></div></div>
    <div class="grid">
      <section class="card c7"><form id="ckForm" class="stack" style="gap:18px">
        ${CK_FIELDS.map(([k, l]) => `<div class="ck-row"><span>${l}<span class="faint" style="font-size:12px;display:block">${CK_HINT[k]}</span></span><div class="scale" role="group" aria-label="${l}">${[1, 2, 3, 4, 5].map((i) => `<button type="button" data-ck="${k}:${i}" aria-pressed="${cur[k] === i}" aria-label="${l} ${i}">${i}</button>`).join("")}</div></div>`).join("")}
        <label class="field">Co było trudne?<textarea name="hard" placeholder="np. wieczorne podjadanie, mało snu, brak czasu na trening">${esc(cur.hard || "")}</textarea></label>
        <label class="field">Co poszło dobrze?<textarea name="good">${esc(cur.good || "")}</textarea></label>
        <div><button class="btn primary" type="submit">Zapisz check-in</button></div>
      </form></section>
      <section class="card c5"><div class="card-head"><h2>Poprzednie</h2></div>
        ${hist.length ? `<ul class="list">${hist.map((k) => {
      const c = S.checkins[k];
      return `<li style="flex-direction:column;align-items:stretch;gap:8px"><span class="muted">${dLong(k, false)} – ${dLong(addDays(k, 6), false)}</span><span class="ck-hist">${CK_FIELDS.map(([f, l]) => `<span class="faint">${l}</span>${dotsHtml(c[f])}`).join("")}</span>${c.hard ? `<span class="faint" style="font-size:13px">${esc(c.hard)}</span>` : ""}</li>`;
    }).join("")}</ul>` : `<div class="empty">Brak check-inów. Pierwszy zapiszesz w formularzu obok.</div>`}</section>
    </div>`;
  };
  const CK_HINT = { sleep: "1 źle, 5 świetnie", energy: "1 brak sił, 5 pełno energii", stress: "1 spokój, 5 bardzo duży", hunger: "1 w ogóle, 5 ciągle głodny", diet: "1 wcale, 5 w punkt", recovery: "1 obolały, 5 świeży" };
  let repDays = 28;
  VIEWS.raport = () => `<div class="title-row"><div><h1>Raport dla AI</h1><div class="sub">Skopiuj i wklej do rozmowy z Claude albo ChatGPT, albo pobierz jako plik .md. Bez zdjęć, same liczby.</div></div>
    <div class="actions"><div class="seg" role="group" aria-label="Okres">${[14, 28, 56].map((d) => `<button type="button" data-rd="${d}" aria-pressed="${repDays === d}">${d} dni</button>`).join("")}</div><button class="btn" data-act="dlReport">Pobierz .md</button><button class="btn primary" data-act="copyReport">Kopiuj</button></div></div>
  <div class="grid"><section class="card c12"><pre class="report" id="reportText">${esc(buildReport(repDays))}</pre></section></div>`;
  function buildReport(n) {
    const t = today(), P = S.profile, E = energy(), start = addDays(t, -(n - 1)), L = [];
    L.push(`# Forma: raport z ${dLong(t)} (ostatnie ${n} dni)`, "");
    L.push("## Profil i cel", `- ${age()} lat, ${P.height} cm, ${P.sex === "k" ? "kobieta" : "mężczyzna"}. Cel: ${P.goal}, tempo ${signed(P.ratePct, f2)}% masy/tydz., termin ${dLong(P.goalDate)}.`, "");
    const ser = E.series.filter((p) => p.date >= start);
    const kd = Object.keys(S.days).filter((d) => d >= start && d <= t).sort();
    const withK = kd.filter((d) => S.days[d].kcal), withP = kd.filter((d) => S.days[d].p);
    L.push("## Waga i energia");
    if (ser.length) L.push(`- Trend wagi: ${f1.format(ser.at(-1).tr)} kg (zmiana ${signed(ser.at(-1).tr - ser[0].tr, f2)} kg od ${dShort(ser[0].date)}; ${ser.length} pomiarów).`);
    else L.push("- Brak pomiarów wagi w tym okresie.");
    if (E.rate != null) L.push(`- Tempo z 14 dni: ${signed(E.rate, f2)} kg/tydz. (cel ${signed(E.rateKg, f2)} kg/tydz.).`);
    L.push(`- Kalorie: ${withK.length ? `średnio ${f0.format(withK.reduce((a, d) => a + S.days[d].kcal, 0) / withK.length)} kcal` : "brak wpisów"} (${withK.length}/${n} dni z wpisem). Białko: ${withP.length ? `średnio ${f0.format(withP.reduce((a, d) => a + S.days[d].p, 0) / withP.length)} g` : "brak wpisów"}.`);
    L.push(`- Spalanie (TDEE): ${f0.format(E.value)} kcal (${E.method === "dane" ? `z danych, ${E.kcalDays} dni` : "szacunek ze wzoru"}${E.conf === "niska" ? ", niska pewność: mniej niż 3 tygodnie danych" : ""}). Propozycja: ${f0.format(E.target)} kcal, ${P.protein} g białka.`, "");
    const ss = sessionsSorted().filter((s) => s.date >= start);
    const prevN = sessionsSorted().filter((s) => s.date < start && s.date >= addDays(start, -n)).length;
    L.push("## Trening", `- Treningi: ${ss.length} w ${n} dni (poprzednie ${n} dni: ${prevN}).`);
    const wk = weeklyGroupSets();
    L.push(`- Serie robocze w ostatnich 7 dniach: ${["Klatka", "Plecy", "Barki", "Biceps", "Triceps", "Nogi", "Brzuch"].map((g) => `${g} ${wk[g] || 0}`).join(", ")}.`);
    const ex = [...exercises().values()].filter((x) => !x.bw && x.count >= 5).sort((a, b) => b.count - a.count).slice(0, 10);
    L.push("- Główne ćwiczenia (szac. 1RM teraz, 30 dni / rekord):");
    for (const x of ex) L.push(`  - ${x.name}: ${x.recentVal != null ? f1.format(x.recentVal) + " kg" : "brak w 30 dni"} / ${f1.format(x.bestVal)} kg (${dShort(x.best.date)}), ostatnio ${x.lastTop ? fmtSet(x.lastTop) : "–"} ${dShort(x.last.date)}`);
    if (ss.length) {
      L.push("- Treningi w okresie:");
      for (const s of ss.slice(0, 20)) L.push(`  - ${dShort(s.date)} ${sessionLabel(s)}, ${durText(s.dur)}: ${topSets(s, 3).map((x) => `${x.e} ${fmtSet(x)}`).join("; ")}`);
    }
    L.push("");
    const sup = S.supps.map((x) => ({ x, st: suppState(x) }));
    L.push("## Suplementy");
    const inS = sup.filter((o) => ["ok", "soon"].includes(o.st.k));
    const buy = sup.filter((o) => ["none", "out"].includes(o.st.k));
    L.push(`- W zapasie: ${inS.length ? inS.map((o) => `${o.x.name} (${fmtNum(o.x.dose)} ${o.x.unit}, ${o.x.perWeek} dni/tydz.; ${days(o.st.daysLeft)})`).join(", ") : "nic"}.`);
    L.push(`- Do kupienia: ${buy.length ? buy.map((o) => o.x.name).join(", ") : "nic"}.`, "");
    const hist = [];
    for (let i = Math.min(n, 14) - 1; i >= 0; i--) hist.push(addDays(t, -i));
    const full = routineFull;
    L.push("## Pielęgnacja", `- Pełna rutyna w ostatnich ${hist.length} dniach: rano ${hist.filter((d) => full(d, "am")).length}, wieczór ${hist.filter((d) => full(d, "pm")).length}.`);
    const inUse = S.skin.products.filter((p) => !p.buy);
    if (inUse.length) L.push(`- Kosmetyki: ${inUse.map((p) => `${p.name} (${days(prodState(p).daysLeft)} do końca)`).join(", ")}.`);
    L.push("");
    const ld = [...new Set(S.labs.map((l) => l.date))].sort().at(-1);
    if (ld) {
      const outL = S.labs.filter((l) => l.date === ld && (l.lo != null && l.value < l.lo || l.hi != null && l.value > l.hi));
      L.push(`## Badania (ostatnie: ${dLong(ld)})`, `- Poza normą: ${outL.length ? outL.map((l) => `${l.name} ${fmtLab(l.value)} ${l.unit}`).join(", ") : "nic"}.`, "");
    }
    const cks = Object.keys(S.checkins).sort().filter((k) => k >= weekKey(start));
    L.push("## Check-in");
    if (cks.length) for (const k of cks) {
      const c = S.checkins[k];
      L.push(`- Tydzień od ${dShort(k)}: ${CK_FIELDS.map(([f, l]) => `${l.toLowerCase()} ${c[f] ?? "–"}/5`).join(", ")}.${c.hard ? ` Trudne: ${c.hard}` : ""}${c.good ? ` Dobrze: ${c.good}` : ""}`);
    }
    else L.push("- Brak check-inów w tym okresie.");
    const notes = kd.filter((d) => S.days[d].note).slice(-10);
    if (notes.length) {
      L.push("", "## Notatki z dziennika");
      for (const d of notes) L.push(`- ${dShort(d)}: ${S.days[d].note}`);
    }
    L.push("", "Na podstawie tego raportu: oceń postępy, dostosuj kalorie i plan, i zapytaj mnie, co było trudne.");
    return L.join("\n");
  }
  VIEWS.ustawienia = () => {
    const P = S.profile;
    const f = (k, l, type = "number", extra = "") => `<label class="field">${l}<input type="${type}" data-prof="${k}" value="${esc(P[k])}" ${extra}></label>`;
    return `<div class="title-row"><div><h1>Ustawienia</h1><div class="sub">${NATIVE ? "Dane zapisują się w pliku na komputerze, a kopia z każdego dnia osobno (ostatnie 30 dni)." : "Wersja demonstracyjna: zmyślone dane, zmiany znikają po odświeżeniu strony."}</div></div></div>
    <div class="grid">
      <section class="card c6"><div class="card-head"><h2>Profil i cel</h2><div class="right">zapisuje się samo</div></div>
        <div class="form-grid">${f("name", "Imię", "text")}${f("height", "Wzrost (cm)")}${f("birth", "Data urodzenia", "date")}${f("activity", "Współczynnik aktywności", "number", 'step="0.05"')}
        ${f("protein", "Białko (g / dzień)")}${f("ratePct", "Tempo (% masy / tydz.)", "number", 'step="0.05"')}${f("goalDate", "Termin celu", "date")}${f("lead", "Dostawa suplementów (dni)")}
        ${f("upLo", "Góra ciała: powt. od")}${f("upHi", "Góra ciała: powt. do")}${f("legLo", "Nogi: powt. od")}${f("legHi", "Nogi: powt. do")}${f("benchLo", "Ławka 5×2: % rekordu od")}${f("benchHi", "Ławka 5×2: % rekordu do")}${f("benchGoal", "Ławka: cel szac. 1RM (kg, 0 = bez)")}
        <label class="field">Po terminie celu przejdź na<select data-prof="nextGoal">${[["", "nic, zostaw jak jest"], ["masa", "masa"], ["rekompozycja", "rekompozycja"], ["redukcja", "redukcja"]].map(([v, l]) => `<option value="${v}"${P.nextGoal === v ? " selected" : ""}>${l}</option>`).join("")}</select></label>${f("nextRate", "Tempo następnej fazy (% masy / tydz.)", "number", 'step="0.05"')}</div>
        <div class="faint" style="font-size:12px;margin-top:12px">Tempo: redukcja −0,5%/tydz. (Helms 2014 zaleca 0,5–1%, wolniej lepiej chroni mięśnie, Garthe 2011), masa +0,25%/tydz., czyli ok. 0,75 kg/mies. (Iraki 2019: 0,25–0,5%). Rekompozycja −0,25% to reguła praktyczna, bez badań. Współczynnik aktywności 1,6 (FAO/WHO: siedzący tryb 1,55 + trening) używam tylko, dopóki nie ma 2 tygodni danych.</div></section>
      
      <section class="card c6"><div class="card-head"><h2>Dane</h2></div>
        <ul class="list">
          <li style="align-items:center"><span class="grow">Kopia wszystkiego do pliku JSON<span class="faint" style="display:block;font-size:12px">Zapisz ją na dysku.</span></span><button class="btn small" data-act="export">Pobierz kopię</button></li>
          <li style="align-items:center"><span class="grow">Wczytaj kopię z pliku JSON<span class="faint" style="display:block;font-size:12px">Zastąpi obecne dane.</span></span><button class="btn small" data-act="importJson">Wczytaj</button></li>
          <li style="align-items:center"><span class="grow">Import treningów z pliku CSV (eksport z aplikacji treningowej)<span class="faint" style="display:block;font-size:12px">${S.lastImport ? `Ostatnio ${dLong(iso(new Date(S.lastImport.at)))}: ${S.lastImport.added} nowych, ${S.lastImport.updated} zmienionych.` : "Jeszcze nie importowano."}</span></span><button class="btn small" data-act="csv">Importuj</button></li>
          <li style="align-items:center"><span class="grow neg">Wyczyść wszystko<span class="faint" style="display:block;font-size:12px">Usuwa wpisy, treningi i ustawienia z tej przeglądarki. Najpierw pobierz kopię.</span></span><button class="btn small danger" data-act="reset">Wyczyść</button></li>
        </ul></section>
      ${NATIVE ? `<section class="card c12"><div class="card-head"><h2>Program</h2><div class="right" id="nativeVer"></div></div>
        <ul class="list">
          <li style="align-items:center"><span class="grow">Uruchamiaj razem z Windows<span class="faint" style="display:block;font-size:12px">Startuje w tle przy zegarze, żeby przypomnienia działały od rana.</span></span><label class="check" style="padding:0"><input type="checkbox" id="autostart" aria-label="Uruchamiaj razem z Windows"><span class="box">${ic("tick", "")}</span></label></li>
          <li style="align-items:center"><span class="grow">Treningi z pliku CSV same z Pobranych<span class="faint" style="display:block;font-size:12px">Wyeksportuj CSV w aplikacji treningowej i zapisz w Pobranych: program dopisze nowe treningi sam, nawet gdy jest w tle.</span></span><span class="pill">włączone</span></li>
          <li style="align-items:center"><span class="grow">Przypomnienia<span class="faint" style="display:block;font-size:12px">Gdy suplement albo kosmetyk się kończy i gdy po 20:00 nie ma wpisu dnia. Każde najwyżej raz dziennie.</span></span><span class="pill">włączone</span></li>
          <li style="align-items:center"><span class="grow">Folder z danymi<span class="faint" style="display:block;font-size:12px" id="nativeDir"></span></span><button class="btn small" data-act="openFolder">Otwórz</button></li>
        </ul></section>${mailCard()}` : ""}
    </div>`;
  };
  function fillNative() {
    if (!NATIVE || !$("#autostart")) return;
    NATIVE.info().then((i) => {
      const a = $("#autostart");
      if (!a) return;
      a.checked = !!i.autostart;
      $("#nativeDir").textContent = i.dataDir;
      $("#nativeVer").textContent = `wersja ${i.version}`;
    }).catch(() => {
    });
  }
  function openLog(date = today()) {
    const d = $("#logDialog"), f = $("#logForm"), e = S.days[date] || {};
    f.date.value = date;
    f.w.value = e.w ?? "";
    f.kcal.value = e.kcal ?? "";
    f.p.value = e.p ?? "";
    f.fat.value = e.f ?? "";
    f.carb.value = e.c ?? "";
    f.steps.value = e.steps ?? "";
    f.note.value = e.note ?? "";
    d.showModal();
    setTimeout(() => (e.w ? f.kcal : f.w).focus(), 30);
  }
  $("#logForm").date.addEventListener("change", (ev) => {
    const e = S.days[ev.target.value] || {};
    const f = $("#logForm");
    f.w.value = e.w ?? "";
    f.kcal.value = e.kcal ?? "";
    f.p.value = e.p ?? "";
    f.fat.value = e.f ?? "";
    f.carb.value = e.c ?? "";
    f.steps.value = e.steps ?? "";
    f.note.value = e.note ?? "";
  });
  $("#logForm").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const d = $("#logDialog");
    const val = ev.submitter?.value || "save";
    d.close(val);
    if (val !== "save") return;
    const f = $("#logForm");
    const num = (v) => v === "" ? void 0 : parseFloat(String(v).replace(",", "."));
    const e = { w: num(f.w.value), kcal: num(f.kcal.value), p: num(f.p.value), f: num(f.fat.value), c: num(f.carb.value), steps: num(f.steps.value), note: f.note.value.trim() || void 0 };
    Object.keys(e).forEach((k) => e[k] === void 0 && delete e[k]);
    if (Object.keys(e).length) S.days[f.date.value] = e;
    else delete S.days[f.date.value];
    save(`Zapisano wpis z ${dLong(f.date.value, false)}`);
    rerender();
  });
  function editDialog(title, fields, onSave, extraHtml = "", onDelete) {
    const d = $("#editDialog"), f = $("#editForm");
    f.innerHTML = `<h2>${esc(title)}</h2><div class="form-grid">${fields.map((x) => x.type === "select" ? `<label class="field ${x.full ? "full" : ""}">${esc(x.label)}<select name="${x.name}">${x.options.map(([v, l]) => `<option value="${esc(v)}"${String(x.value) === String(v) ? " selected" : ""}>${esc(l)}</option>`).join("")}</select></label>` : x.type === "textarea" ? `<label class="field full">${esc(x.label)}<textarea name="${x.name}">${esc(x.value ?? "")}</textarea></label>` : `<label class="field ${x.full ? "full" : ""}">${esc(x.label)}<input name="${x.name}" type="${x.type || "text"}" ${x.step ? `step="${x.step}"` : ""} value="${esc(x.value ?? "")}" ${x.required ? "required" : ""}></label>`).join("")}</div>${extraHtml}
    <div class="dialog-actions">${onDelete ? '<button class="btn danger" type="button" data-del style="margin-right:auto">Usuń</button>' : ""}<button class="btn" type="button" data-close>Anuluj</button><button class="btn primary" value="save">Zapisz</button></div>`;
    const del = f.querySelector("[data-del]");
    if (del) del.onclick = () => {
      d.close();
      if (confirm("Na pewno usunąć?")) onDelete();
    };
    f.onsubmit = (ev) => {
      ev.preventDefault();
      const val = ev.submitter?.value || "save";
      d.close(val);
      if (val === "delete" && onDelete) {
        if (confirm("Na pewno usunąć?")) {
          onDelete();
        }
        return;
      }
      if (val !== "save") return;
      const v = {};
      for (const x of fields) {
        const el = f.elements[x.name];
        v[x.name] = x.type === "number" ? el.value === "" ? null : parseFloat(el.value.replace(",", ".")) : el.value.trim();
      }
      onSave(v);
    };
    d.returnValue = "";
    d.showModal();
  }
  function editSupp(x) {
    const isNew = !x;
    x = x || { id: uid(), name: "", brand: "", pack: 60, unit: "kaps.", dose: 1, perWeek: 7, iso: "ok", note: "", stock: 0, stockDate: null, active: true, url: "" };
    editDialog(isNew ? "Nowy suplement" : x.name, [
      { name: "name", label: "Nazwa", value: x.name, full: true, required: true },
      { name: "brand", label: "Producent / sklep", value: x.brand },
      { name: "url", label: "Link do zamówienia", value: x.url, type: "url" },
      { name: "pack", label: "Opakowanie", type: "number", step: "any", value: x.pack },
      { name: "unit", label: "Jednostka", value: x.unit },
      { name: "dose", label: `Ile biorę w dzień brania (${x.unit || "szt."})`, type: "number", step: "any", value: x.dose },
      { name: "perWeek", label: "Dni w tygodniu", type: "number", step: "1", value: x.perWeek },
      ...recOf(x) && recOf(x).lo != null && !(recOf(x).per === 1 && x.unit === recOf(x).u) ? [{ name: "per", label: `${recOf(x).u} ${recOf(x).what} w 1 ${x.unit || "szt."} (z etykiety)`, type: "number", step: "any", value: x.per ?? recOf(x).per ?? "", full: true }] : [],
      { name: "active", label: "Stan", type: "select", value: x.active ? "1" : "0", options: [["1", "Biorę"], ["0", "Wstrzymany"]] },
      { name: "note", label: "Notatka (badania, interakcje)", type: "textarea", value: x.note }
    ], (v) => {
      Object.assign(x, v, { active: v.active === "1", perWeek: Math.min(7, Math.max(1, v.perWeek || 7)), pack: v.pack > 0 ? v.pack : x.pack || 1, dose: v.dose > 0 ? v.dose : x.dose || 1, per: v.per > 0 ? v.per : null, url: safeUrl(v.url) ? v.url.trim() : "" });
      if (v.url && !safeUrl(v.url)) toast("Link musi zaczynać się od https://, nie zapisałem go.");
      if (isNew) S.supps.push(x);
      save("Zapisano");
      rerender();
    }, doseHtml(x) + (safeUrl(x.url) ? `<a class="link" href="${esc(x.url)}" target="_blank" rel="noopener">Otwórz sklep →</a>` : ""), isNew ? null : () => {
      S.supps = S.supps.filter((s) => s !== x);
      save("Usunięto");
      rerender();
    });
  }
  function doseHtml(x) {
    const r = recOf(x);
    if (!r) return "";
    return `<div class="rec-box"><div><b>Zalecane:</b> ${esc(recTxt(r))}${r.lo != null ? ` ${esc(r.what)} dziennie` : ""} · ${esc(r.when)}</div><div class="muted">${esc(r.note)}</div>
    <div class="faint">Źródła: ${r.src.filter(safeUrl).map((u, i) => `<a class="link" href="${esc(u)}" target="_blank" rel="noopener">${i + 1}</a>`).join(" · ")}</div></div>`;
  }
  function buySupp(x) {
    const st = suppState(x);
    editDialog(`Kupiłem: ${x.name}`, [
      { name: "n", label: "Ile opakowań", type: "number", step: "1", value: 1 },
      { name: "pack", label: `Opakowanie (${x.unit})`, type: "number", step: "any", value: x.pack },
      { name: "date", label: "Od kiedy biorę", type: "date", value: today(), full: true }
    ], (v) => {
      const left = ["ok", "soon"].includes(st.k) ? st.left : 0;
      x.pack = v.pack || x.pack;
      x.stock = left + (v.n || 1) * x.pack;
      x.stockDate = v.date || today();
      x.active = true;
      save(`${x.name}: ${days(Math.floor(x.stock / daily(x)))} zapasu`);
      rerender();
    });
  }
  function editProd(p, preset) {
    const isNew = !p;
    p = p || { id: uid(), name: "", step: "", opened: today(), est: 60, history: [], ...preset || {} };
    editDialog(
      isNew ? p.buy ? "Do kupienia" : "Nowy kosmetyk" : p.name,
      [
        { name: "name", label: "Nazwa", value: p.name, full: true, required: true },
        { name: "step", label: "Do czego", value: p.step },
        { name: "opened", label: "Otwarty", type: "date", value: p.opened },
        { name: "est", label: "Wystarcza na około (dni)", type: "number", step: "1", value: p.est }
      ],
      (v) => {
        Object.assign(p, v, { est: v.est || 60, opened: v.opened || today() });
        if (isNew) S.skin.products.push(p);
        save("Zapisano");
        rerender();
      },
      "",
      isNew ? null : () => {
        S.skin.products = S.skin.products.filter((x) => x !== p);
        save("Usunięto");
        rerender();
      }
    );
  }
  function editIso() {
  }
  function finishProd(p) {
    const used = Math.max(1, diffDays(p.opened, today()));
    if (used < 7) {
      if (!confirm(`${p.name} jest na liście dopiero ${days(used)}, więc nie zapamiętam tego czasu. Liczyć nowe opakowanie od dziś?`)) return;
      p.opened = today();
      if (p.spare > 0) p.spare--;
      save("Nowe opakowanie od dziś");
      rerender();
      return;
    }
    if (!confirm(`${p.name} wystarczył na ${days(used)}. Zapamiętać i liczyć nowe opakowanie od dziś?`)) return;
    p.history = [...p.history || [], used];
    p.opened = today();
    if (p.spare > 0) p.spare--;
    save(`Zapamiętano: ${days(used)}`);
    rerender();
  }
  function editLab(l) {
    const isNew = !l;
    l = l || { id: uid(), date: today(), name: "", value: null, unit: "", lo: null, hi: null, note: "" };
    const names = [...new Set(S.labs.map((x) => x.name))];
    editDialog(isNew ? "Nowy wynik" : `${l.name}, ${dLong(l.date)}`, [
      { name: "date", label: "Data pobrania", type: "date", value: l.date },
      { name: "name", label: "Badanie", value: l.name, required: true },
      { name: "value", label: "Wynik", type: "number", step: "any", value: l.value },
      { name: "unit", label: "Jednostka", value: l.unit },
      { name: "lo", label: "Norma od", type: "number", step: "any", value: l.lo },
      { name: "hi", label: "Norma do", type: "number", step: "any", value: l.hi },
      { name: "note", label: "Notatka", type: "textarea", value: l.note }
    ], (v) => {
      if (isNew && v.name && !v.unit) {
        const prev = S.labs.find((x) => x.name === v.name);
        if (prev) {
          v.unit = prev.unit;
          if (v.lo == null) v.lo = prev.lo;
          if (v.hi == null) v.hi = prev.hi;
        }
      }
      Object.assign(l, v);
      if (isNew) S.labs.push(l);
      save("Zapisano wynik");
      rerender();
    }, isNew ? `<div class="faint" style="font-size:12px">Znane badania: ${esc(names.join(", "))}. Przy znanej nazwie jednostkę i normę uzupełnię sam.</div>` : "", isNew ? null : () => {
      S.labs = S.labs.filter((x) => x !== l);
      save("Usunięto");
      rerender();
    });
  }
  function readFile(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsText(file, "utf-8");
    });
  }
  async function handleCsv(file) {
    try {
      const txt = await readFile(file);
      const r = importCsv(S, txt, file.name);
      save();
      render({ animate: false, scroll: false });
      toast(r.older ? `Ten plik jest starszy niż twoje dane (ostatni trening w nim: ${dShort(r.newest)}). Dopisałem tylko brakujące: ${r.added}, niczego nie nadpisałem.` : `CSV: ${r.added} nowych, ${r.updated} zmienionych, ${r.same} bez zmian`, r.older ? 7e3 : 2800);
    } catch (e) {
      toast(e.message || "Nie udało się wczytać pliku.");
    }
  }
  function download(name, text, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2e3);
  }
  document.addEventListener("click", (ev) => {
    const go = ev.target.closest("[data-go]");
    if (go && !ev.target.closest("a,button,input,label,select,textarea,[data-act],[data-check]")) {
      location.hash = go.dataset.go;
      return;
    }
    const t = ev.target.closest("[data-act],[data-theme],[data-buy],[data-edit-supp],[data-edit-prod],[data-finish],[data-bought],[data-wr],[data-edit-lab],[data-sf],[data-rd],[data-ck],[data-addstep],[data-delstep],[data-addorder],[data-cbuy],[data-cskip],[data-cunskip],[data-dstep],[data-cpick],[data-ostock],[data-odone],[data-inbdrop],[data-inbjson],[data-ob],[data-method],[data-cin],[data-cout],[data-copen],[data-mus],[data-bodymode],tr[data-href],tr[data-log]");
    if (!t) return;
    if (t.matches("#themes [data-theme]")) {
      S.theme = t.dataset.theme;
      save();
      const go2 = () => {
        applyTheme();
        renderTop();
        rerender();
      };
      if (document.startViewTransition && !isReduced() && !document.hidden && !themeVT) {
        themeVT = document.startViewTransition(go2);
        const end = () => {
          themeVT = null;
        };
        for (const p of [themeVT.ready, themeVT.finished, themeVT.updateCallbackDone]) p?.catch(() => {
        });
        themeVT.finished?.then(end, end);
        setTimeout(() => {
          end();
          if (document.documentElement.dataset.theme !== S.theme) go2();
        }, 600);
      } else go2();
      return;
    }
    if (t.dataset.href) {
      location.hash = t.dataset.href;
      return;
    }
    if (t.dataset.wr != null) {
      wRange = +t.dataset.wr;
      try {
        localStorage.setItem("forma.wRange", wRange);
      } catch {
      }
      rerender();
      return;
    }
    if (t.dataset.log) {
      openLog(t.dataset.log);
      return;
    }
    if (t.dataset.buy) {
      buySupp(S.supps.find((x) => x.id === t.dataset.buy));
      return;
    }
    if (t.dataset.editSupp) {
      editSupp(S.supps.find((x) => x.id === t.dataset.editSupp));
      return;
    }
    if (t.dataset.editProd) {
      editProd(S.skin.products.find((x) => x.id === t.dataset.editProd));
      return;
    }
    if (t.dataset.finish) {
      finishProd(S.skin.products.find((x) => x.id === t.dataset.finish));
      return;
    }
    if (t.dataset.bought) {
      const p = S.skin.products.find((x) => x.id === t.dataset.bought);
      if (p) {
        p.buy = false;
        p.opened = today();
        save(`${p.name}: liczę od dziś`);
        rerender();
      }
      return;
    }
    if (t.dataset.editLab) {
      editLab(S.labs.find((x) => x.id === t.dataset.editLab));
      return;
    }
    if (t.dataset.sf) {
      suppFilter = t.dataset.sf;
      rerender();
      return;
    }
    if (t.dataset.rd) {
      repDays = +t.dataset.rd;
      rerender();
      return;
    }
    if (t.dataset.ck) {
      const [k, v] = t.dataset.ck.split(":");
      $$(`[data-ck^="${k}:"]`).forEach((b) => b.setAttribute("aria-pressed", b === t));
      t.closest("form").dataset[k] = v;
      return;
    }
    if (t.dataset.dstep) {
      const [id, d] = t.dataset.dstep.split(":");
      const x = S.supps.find((s) => s.id === id);
      if (!x) return;
      const step = doseStep(x), nd = Math.max(step, Math.round((x.dose + step * +d) * 10) / 10);
      if (nd === x.dose) return;
      const st = suppState(x);
      if (st.k === "ok" || st.k === "soon") {
        x.stock = st.left;
        x.stockDate = today();
      }
      x.dose = nd;
      save(`${x.name}: ${fmtNum(nd)} ${x.unit} dziennie`);
      patchRow(t.closest("tr"), `[data-dstep="${x.id}:1"]`);
      return;
    }
    if (t.dataset.mus !== void 0) {
      bodySel = t.dataset.mus || null;
      patchBody();
      return;
    }
    if (t.dataset.bodymode) {
      bodyMode = t.dataset.bodymode;
      patchBody();
      return;
    }
    if (t.dataset.cin) {
      S.cartIn = S.cartIn || {};
      if (!S.cartIn[t.dataset.cin]) {
        S.cartIn[t.dataset.cin] = today();
        save();
        setTimeout(rerender, 300);
      }
      return;
    }
    if (t.dataset.cout) {
      ev.preventDefault();
      delete S.cartIn[t.dataset.cout];
      save("Zdjęto znacznik");
      rerender();
      return;
    }
    if (t.dataset.copen) {
      const list = cartRows().filter((r) => r.status === "need" && r.shop === t.dataset.copen && r.on && safeUrl(r.url) && !r.inCart);
      const go2 = NATIVE ? list : list.slice(0, 1);
      go2.forEach((r) => {
        window.open(r.url, "_blank", "noopener");
        S.cartIn[r.item] = today();
      });
      save(go2.length < list.length ? `Otwarto ${go2.length}. Kliknij jeszcze raz, żeby otworzyć następny (zostało ${list.length - go2.length}).` : `Otwarto ${go2.length} ${plural(go2.length, "produkt", "produkty", "produktów")}. Dodaj je do koszyka w sklepie.`);
      rerender();
      return;
    }
    if (t.dataset.method) {
      const m = window.METHODS.find((x) => x.id === t.dataset.method);
      if (!m) return;
      S.profile.method = m.id;
      S.profile.methodStart = today();
      save(`Metoda: ${m.name}. Podpowiedzi liczę teraz według niej.`);
      rerender();
      return;
    }
    if (t.dataset.ob) {
      const [k, v] = t.dataset.ob.split(":");
      ob.v[k] = k === "activity" ? +v : v === "true" ? true : v === "false" ? false : v;
      render({ animate: false, scroll: false });
      return;
    }
    if (t.dataset.inbdrop) {
      inbox = inbox.filter((x) => x.id !== t.dataset.inbdrop);
      rerender();
      return;
    }
    if (t.dataset.inbjson) {
      const [id, mode] = t.dataset.inbjson.split(":"), it = inbox.find((x) => x.id === id);
      if (!it) return;
      if (mode === "replace") {
        if (!confirm("Zastąpić wszystkie obecne dane tą kopią? Tego nie da się cofnąć bez innej kopii.")) return;
        S = normalize(it.data);
        applyTheme();
        save("Wczytano kopię");
      } else {
        const r = mergeInto(S, normalize(it.data));
        S = normalize(S);
        save(`Scalono: ${r.added} nowych wpisów`);
      }
      inbox = inbox.filter((x) => x !== it);
      render();
      return;
    }
    if (t.dataset.ostock) {
      const o = (S.orders || []).find((x) => x.key === t.dataset.ostock);
      if (o) stockOrder(o);
      return;
    }
    if (t.dataset.odone) {
      const o = (S.orders || []).find((x) => x.key === t.dataset.odone);
      if (o) {
        o.stocked = true;
        save("Ukryto zamówienie");
        rerender();
      }
      return;
    }
    if (t.dataset.cpick) {
      const r = cartRows().find((x) => x.item === t.dataset.cpick);
      if (r?.pick) {
        S.cartPick[r.item] = r.pick === "mine" ? "alt" : "mine";
        save();
        rerender();
      }
      return;
    }
    if (t.dataset.cbuy) {
      buyCart(t.dataset.cbuy);
      return;
    }
    if (t.dataset.cskip) {
      skipCart(t.dataset.cskip, true);
      return;
    }
    if (t.dataset.cunskip) {
      skipCart(t.dataset.cunskip, false);
      return;
    }
    if (t.dataset.addorder) {
      const [name, , , , est, step] = window.SEED_SKIN_ORDERS[+t.dataset.addorder];
      editProd(null, { name, step, est });
      return;
    }
    if (t.dataset.addstep) {
      const part = t.dataset.addstep, inp = $(`[data-newstep="${part}"]`);
      const n = inp.value.trim();
      if (!n) {
        inp.focus();
        return;
      }
      S.skin.routine[part].push({ id: uid(), n, every: +($(`[data-newevery="${part}"]`)?.value || 1) });
      save("Dodano krok");
      rerender();
      return;
    }
    if (t.dataset.delstep) {
      const [part, id] = t.dataset.delstep.split(":");
      S.skin.routine[part] = S.skin.routine[part].filter((x) => x.id !== id);
      save("Usunięto krok");
      rerender();
      return;
    }
    const a = t.dataset.act;
    if (a === "log") openLog();
    else if (a === "csv") $("#fileCsv").click();
    else if (a === "inbox") $("#fileInbox").click();
    else if (a === "obNext") obNext();
    else if (a === "obBack") {
      ob.step = Math.max(0, ob.step - 1);
      render();
    } else if (a === "demoOn") demoOn();
    else if (a === "demoOff") demoOff();
    else if (a === "inbSaveAll") {
      const list = inbox.filter((x) => x.kind === "makro");
      list.forEach(saveMakro);
      save(`Zapisano ${list.length} ${plural(list.length, "dzień", "dni", "dni")} z Makro`);
      rerender();
    } else if (a === "openFolder") NATIVE?.openFolder();
    else if (a === "syncNew") {
      if (!syncUrl()) {
        toast("Synchronizacja zadziała po opublikowaniu aplikacji.");
        return;
      }
      setSyncCfg({ code: newSyncCode() });
      fillSync();
      syncNow(true);
    } else if (a === "syncNow") syncNow(true);
    else if (a === "syncQr") showSyncQr();
    else if (a === "syncScan") scanSyncQr();
    else if (a === "syncShow") {
      const el = $("#syncCode");
      if (el) el.textContent = syncCfg()?.code || "";
    } else if (a === "syncCopy") navigator.clipboard.writeText(syncCfg()?.code || "").then(() => toast("Skopiowano kod. Wklej go na telefonie."), () => toast("Nie udało się skopiować, kliknij „Pokaż” i przepisz."));
    else if (a === "syncOff") {
      if (confirm("Wyłączyć synchronizację na tym urządzeniu? Dane zostaną tutaj.")) {
        setSyncCfg(null);
        fillSync();
        toast("Synchronizacja wyłączona na tym urządzeniu");
      }
    } else if (a === "mailCheck") checkMail(true);
    else if (a === "mailOff") {
      if (confirm("Odłączyć pocztę? Zapisane hasło zostanie usunięte z komputera.")) NATIVE.mailDisconnect().then(() => {
        toast("Poczta odłączona");
        fillMail();
      });
    } else if (a === "addSupp") editSupp();
    else if (a === "addProd") editProd();
    else if (a === "addBuy") editProd(null, { buy: true });
    else if (a === "editIso") editIso();
    else if (a === "addLab") editLab();
    else if (a === "copyReport") {
      navigator.clipboard.writeText($("#reportText").textContent).then(() => toast("Skopiowano raport. Wklej go do nowej rozmowy."), () => toast("Nie udało się skopiować. Zaznacz tekst ręcznie."));
    } else if (a === "dlReport") download(`forma-raport-${today()}.md`, buildReport(repDays), "text/markdown");
    else if (a === "export") download(`forma-kopia-${today()}.json`, JSON.stringify(S, null, 1), "application/json");
    else if (a === "importJson") $("#fileJson").click();
    else if (a === "reset") {
      if (confirm("Usunąć wszystkie dane z tej przeglądarki? Tego nie da się cofnąć bez kopii.")) {
        if (NATIVE) NATIVE.save("");
        else localStorage.removeItem(KEY);
        S = load();
        save("Wyczyszczono. Wczytałem dane startowe.");
        render();
      }
    }
  });
  document.addEventListener("keydown", (ev) => {
    if ((ev.key === "Enter" || ev.key === " ") && ev.target.matches("tr[data-href],tr[data-log],.drop,g[data-mus]")) {
      ev.preventDefault();
      ev.target.click();
    }
    if (ev.key === "Enter" && ev.target.dataset.newstep) {
      ev.preventDefault();
      $(`[data-addstep="${ev.target.dataset.newstep}"]`)?.click();
    }
  });
  document.addEventListener("change", (ev) => {
    const t = ev.target;
    if (t.dataset.check) {
      const [part, id, date] = t.dataset.check.split(":");
      S.skin.checks[date] = S.skin.checks[date] || {};
      S.skin.checks[date][part] = S.skin.checks[date][part] || {};
      if (t.checked) S.skin.checks[date][part][id] = true;
      else delete S.skin.checks[date][part][id];
      save();
      rerender();
      return;
    }
    if (t.dataset.rm) {
      S.rm = S.rm || {};
      const v = parseFloat(String(t.value).replace(",", "."));
      if (v > 0) S.rm[t.dataset.rm] = v;
      else delete S.rm[t.dataset.rm];
      save("Zapisano rekord");
      return;
    }
    if (t.dataset.inb) {
      const [id, k] = t.dataset.inb.split(":"), it = inbox.find((x) => x.id === id);
      if (it) {
        it.data[k] = k === "date" ? t.value : t.value === "" ? null : parseFloat(t.value.replace(",", "."));
        if (k === "date") rerender();
      }
      return;
    }
    if (t.id === "autostart" && NATIVE) {
      NATIVE.autostart(t.checked).then((v) => toast(v ? "Forma uruchomi się razem z Windows, w tle przy zegarze." : "Forma nie będzie się sama uruchamiać."));
      return;
    }
    if (t.dataset.cart) {
      S.cartOff = S.cartOff || {};
      S.cartOff[t.dataset.cart] = !t.checked;
      save();
      rerender();
      return;
    }
    if (t.dataset.prof) {
      const k = t.dataset.prof;
      const v = t.type === "number" ? parseFloat(String(t.value).replace(",", ".")) : t.value;
      if (t.type === "number" && !Number.isFinite(v) || t.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(v) || t.type === "text" && !String(v).trim()) {
        toast("To pole nie może być puste, zostawiam poprzednią wartość.");
        rerender();
        return;
      }
      if (["height", "activity", "protein"].includes(k) && v <= 0) {
        toast("Ta wartość musi być większa od zera.");
        rerender();
        return;
      }
      S.profile[k] = v;
      if (k === "goal" && t.tagName === "SELECT") S.profile.ratePct = { redukcja: -0.5, rekompozycja: -0.25, masa: 0.25 }[t.value];
      save("Zapisano");
      if (route().r !== "ustawienia") rerender();
    }
  });
  document.addEventListener("input", (ev) => {
    if (ev.target.dataset?.obv) {
      ob.v[ev.target.dataset.obv] = ev.target.value;
      return;
    }
  });
  document.addEventListener("change", (ev) => {
    if (ev.target.dataset?.obv) ob.v[ev.target.dataset.obv] = ev.target.value;
  });
  document.addEventListener("input", (ev) => {
    if (ev.target.id !== "exSearch") return;
    exFilter = ev.target.value;
    const q = exFilter.toLowerCase();
    $$('tr[data-href^="#/cwiczenie/"]', main).forEach((tr) => {
      tr.hidden = !!q && !tr.textContent.toLowerCase().includes(q);
    });
  });
  document.addEventListener("submit", (ev) => {
    if (ev.target.id !== "ckForm") return;
    ev.preventDefault();
    const f = ev.target, wk = weekKey(), cur = S.checkins[wk] || {};
    const c = { ...cur, date: today(), hard: f.hard.value.trim(), good: f.good.value.trim() };
    for (const [k] of CK_FIELDS) {
      const v = f.dataset[k] ?? (cur[k] != null ? String(cur[k]) : null);
      if (v != null) c[k] = +v;
    }
    S.checkins[wk] = c;
    save("Zapisano check-in");
    rerender();
  });
  $("#fileCsv").addEventListener("change", (ev) => {
    const f = ev.target.files[0];
    if (f) handleCsv(f);
    ev.target.value = "";
  });
  $("#fileInbox").addEventListener("change", (ev) => {
    const f = [...ev.target.files];
    ev.target.value = "";
    processFiles(f);
  });
  $("#fileJson").addEventListener("change", async (ev) => {
    const f = ev.target.files[0];
    ev.target.value = "";
    if (!f) return;
    try {
      const s = JSON.parse(await readFile(f));
      if (!s || !s.version || !s.profile) throw new Error();
      if (!confirm("Zastąpić obecne dane kopią z pliku?")) return;
      S = normalize(s);
      save("Wczytano kopię");
      applyTheme();
      render();
    } catch {
      toast("To nie jest kopia z Formy.");
    }
  });
  let dragDepth = 0;
  addEventListener("dragenter", (e) => {
    if ([...e.dataTransfer?.types || []].includes("Files")) {
      dragDepth++;
      document.body.classList.add("dragging");
    }
  });
  addEventListener("dragleave", () => {
    dragDepth = Math.max(0, dragDepth - 1);
    if (!dragDepth) document.body.classList.remove("dragging");
  });
  addEventListener("dragover", (e) => e.preventDefault());
  addEventListener("drop", (e) => {
    e.preventDefault();
    dragDepth = 0;
    document.body.classList.remove("dragging");
    if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
  });
  $("#logBtn").addEventListener("click", () => openLog());
  $("#menuBtn").addEventListener("click", () => {
    const o = $("#sidebar").classList.toggle("open");
    $("#menuBtn").setAttribute("aria-expanded", o);
  });
  addEventListener("hashchange", () => render());
  let rz, rzW = innerWidth;
  addEventListener("resize", () => {
    clearTimeout(rz);
    rz = setTimeout(() => {
      if (innerWidth === rzW) return;
      rzW = innerWidth;
      if (["checkin", "pielegnacja", "ustawienia"].includes(route().r) || main.contains(document.activeElement) && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
      render({ animate: false, scroll: false });
    }, 180);
  });
  document.addEventListener("click", (ev) => {
    const c = ev.target.closest("[data-close]");
    if (c) c.closest("dialog")?.close();
  });
  let shownDay = today();
  let themeVT = null;
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && today() !== shownDay) {
      shownDay = today();
      version++;
      rerender();
    }
  });
  function starfield() {
    const c = $("#stars");
    if (!c) return;
    const ctx = c.getContext("2d");
    let W = 0, H = 0, dpr = 1, stars = [], raf = 0, last = 0;
    const make = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = innerWidth;
      H = innerHeight;
      c.width = W * dpr;
      c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(W * H / 7e3);
      stars = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() < 0.08 ? 1 + Math.random() * 0.6 : 0.35 + Math.random() * 0.6, a: 0.12 + Math.random() * 0.5, p: Math.random() * Math.PI * 2, s: 0.4 + Math.random() * 1.2, v: 4e-3 + Math.random() * 0.012, blue: Math.random() < 0.15 }));
    };
    const draw = (t) => {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        const tw = isReduced() ? 1 : 0.65 + 0.35 * Math.sin(s.p + t * 6e-4 * s.s);
        ctx.globalAlpha = s.a * tw;
        ctx.fillStyle = s.blue ? "#9fb6ff" : "#ffffff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    const loop = (t) => {
      const dt = Math.min(64, t - (last || t));
      last = t;
      for (const s of stars) {
        s.x -= s.v * dt * 0.6;
        s.y -= s.v * dt * 0.15;
        if (s.x < -2) s.x = W + 2;
        if (s.y < -2) s.y = H + 2;
      }
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      last = 0;
      if (isReduced()) draw(0);
      else raf = requestAnimationFrame(loop);
    };
    make();
    start();
    let sw = innerWidth;
    addEventListener("resize", () => {
      if (innerWidth === sw && innerHeight <= H) return;
      sw = innerWidth;
      make();
      start();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else start();
    });
    motionMq.addEventListener?.("change", start);
  }
  function animateTitle() {
    const h = $(".title-row h1", main);
    if (!h || !animateNext || isReduced() || !window.Motion) return;
    const words = h.textContent.split(/(\s+)/);
    h.innerHTML = words.map((w) => /^\s+$/.test(w) ? w : `<span class="w">${esc(w)}</span>`).join("");
    const spans = $$(".w", h);
    try {
      Motion.animate(spans, { opacity: [0, 1], filter: ["blur(12px)", "blur(0px)"], y: [10, 0] }, { duration: 0.9, delay: Motion.stagger(0.08), ease: [0.22, 0.7, 0.18, 1] });
    } catch (e) {
      spans.forEach((s) => {
        s.style.opacity = 1;
        s.style.filter = "none";
      });
    }
    setTimeout(() => spans.forEach((s) => {
      s.style.opacity = "";
      s.style.filter = "";
    }), 2500);
  }
  const OSTAT = { ordered: 1, paid: 1, shipped: 2, ready: 3, delivered: 4, cancelled: 9 };
  const OLABEL = { ordered: "zamówione", paid: "opłacone", shipped: "w drodze", ready: "czeka do odbioru", delivered: "dotarło", cancelled: "anulowane" };
  const normTxt = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l");
  function itemsIn(text) {
    const KW = window.CART_KW || {};
    const keys = [];
    for (const [item, kws] of Object.entries(KW)) for (const k of kws) keys.push([normTxt(k), item]);
    keys.sort((a, b) => b[0].length - a[0].length);
    return (line) => {
      const l = normTxt(line);
      for (const [k, item] of keys) if (l.includes(k)) return item;
      return null;
    };
  }
  function senderOf(m) {
    const from = String(m.from || "").toLowerCase();
    return (window.MAIL_SENDERS || []).find((r) => r.match.some((d) => from.endsWith(d) || from === d)) || null;
  }
  const grab = (re, t) => {
    if (!re) return null;
    const x = t.match(new RegExp(re, "i"));
    return x ? x.slice(1).find(Boolean) || null : null;
  };
  function qtyNear(lines, i) {
    const own = lines[i], win = lines.slice(i, i + 5).join(" ").replace(/\s+/g, " ");
    const tries = [
      [own, /^\s*(\d{1,2})\s*x\s/i],
      [win, /zł\s+(\d{1,2})\s+\d+[,.]\d{2}\s*zł/i],
      [win, /ilo\S*:?\s*(\d{1,2})\b/i],
      [win, /(?:^|\s)x\s?(\d{1,2})(?=\s|$)/i],
      [win, / - (\d{1,2})x \d/i],
      [win, /(?:\t|\|)\s*(\d{1,2})\s*szt\./i]
    ];
    for (const [t, re] of tries) {
      const x = t.match(re);
      if (x && +x[1] >= 1 && +x[1] <= 20) return +x[1];
    }
    return 1;
  }
  function parseMail(m) {
    const snd = senderOf(m);
    if (!snd) return null;
    const subj = String(m.subject || "").replace(/[\u200b\u200c\u200d\ufeff]/g, "").replace(/[\u2013\u2014]/g, "-").replace(/\s+/g, " ").trim();
    const body = String(m.text || "").replace(/[\u200b\u200c\u200d\ufeff]/g, "").replace(/&nbsp;|&#847;|&zwnj;/g, " ");
    if (snd.skip && new RegExp(snd.skip, "i").test(subj)) return null;
    let status = null;
    for (const [st, re] of snd.status || []) if (new RegExp(re, "i").test(subj)) {
      status = st;
      break;
    }
    if (!status) return null;
    const all = `${subj}
${body}`;
    const no = grab(snd.order, all), tracking = grab(snd.tracking, all);
    const items = [];
    if (snd.shop && status !== "delivered") {
      const find = itemsIn(), lines = body.split("\n");
      lines.forEach((line, i) => {
        if (/pr[oó]bka|gratis|r[eę]cznik|0,00\s*z[lł]|rabat|polecane|zobacz tak[zż]e/i.test(line)) return;
        const item = find(line);
        if (!item) return;
        const qty = qtyNear(lines, i), ex = items.find((x) => x.item === item);
        if (ex) ex.qty = Math.max(ex.qty, qty);
        else items.push({ item, name: line.replace(/\s+/g, " ").trim().slice(0, 120), qty });
      });
    }
    const low = normTxt(body);
    const mentions = snd.courier ? (window.MAIL_SENDERS || []).filter((r) => r.shop && (r.alias || []).some((a) => low.includes(normTxt(a)))).map((r) => r.shop) : [];
    return { shop: snd.shop || null, courier: snd.courier || null, no, status, items, tracking, date: m.date, mentions };
  }
  function applyMail(m) {
    const P = parseMail(m);
    if (!P) return null;
    S.orders = S.orders || [];
    const open = (x) => OSTAT[x.status] < 4 && !x.stocked;
    const latest = (list) => list.sort((a, b) => (b.updated || "").localeCompare(a.updated || ""))[0] || null;
    let o = null, created = false;
    if (P.shop) {
      o = P.no && S.orders.find((x) => x.shop === P.shop && x.no === P.no) || null;
      if (!o && P.status !== "ordered") o = latest(S.orders.filter((x) => x.shop === P.shop && open(x)));
      if (!o) {
        o = { key: uid(), shop: P.shop, no: P.no, date: String(P.date || "").slice(0, 10) || today(), status: "ordered", items: [], tracking: null, courier: null, updated: P.date, stocked: false };
        S.orders.push(o);
        created = true;
      }
    } else {
      o = P.tracking && S.orders.find((x) => x.tracking === P.tracking) || latest(S.orders.filter((x) => open(x) && !x.tracking && (P.mentions.length ? P.mentions.includes(x.shop) : false)));
      if (!o) return null;
      if (P.tracking && !o.tracking) o.tracking = P.tracking;
      o.courier = P.courier;
    }
    if (P.items.length && (!o.items.length || P.status === "ordered")) o.items = P.items;
    if (P.tracking && !o.tracking) o.tracking = P.tracking;
    if (!o.no && P.no && P.status === "ordered") o.no = P.no;
    const from = o.status;
    if (P.status === "cancelled" || OSTAT[P.status] > OSTAT[o.status]) {
      o.status = P.status;
      o.updated = P.date;
    }
    return created || from !== o.status ? { o, from: created ? null : from, to: o.status } : null;
  }
  const orderName = (o) => `${o.shop}${o.no ? ` #${o.no}` : ""}`;
  const orderItems = (o) => o.items.map((x) => `${x.item}${x.qty > 1 ? ` ×${x.qty}` : ""}`).join(", ") || "pozycje nierozpoznane";
  function orderFor(item) {
    return (S.orders || []).filter((o) => !o.stocked && o.status !== "cancelled" && o.items.some((x) => x.item === item)).sort((a, b) => (b.updated || "").localeCompare(a.updated || ""))[0] || null;
  }
  function stockOrder(o) {
    const rows = cartRows();
    const done = [];
    for (const it of o.items) {
      const r = rows.find((x) => x.item === it.item);
      if (!r) continue;
      const size = packOf(r.pack)[1];
      if (r.kind === "supp") {
        const list = r.supps.filter((x) => x.active).length ? r.supps.filter((x) => x.active) : r.supps;
        if (!list.length) continue;
        for (const x of list) {
          const st = suppState(x);
          const left = st.k === "ok" || st.k === "soon" ? st.left : 0;
          const pk = size > 0 ? size : x.pack;
          Object.assign(x, { pack: pk, stock: left + it.qty * pk, stockDate: today(), active: true });
        }
        done.push(it.item);
      } else if (r.kind === "skin") {
        const sk = window.CART_SKIN[it.item];
        if (r.prods.length) r.prods[0].spare = (r.prods[0].spare || 0) + it.qty;
        else S.skin.products.push({ id: uid(), name: r.product, step: sk.step, opened: today(), est: sk.est, spare: Math.max(0, it.qty - 1), history: [] });
        done.push(it.item);
      }
    }
    o.stocked = true;
    save(done.length ? `Dopisano do zapasu: ${done.join(", ")}` : "Zapisano");
    rerender();
  }
  const MAIL_ERR = { auth: "Gmail nie przyjął hasła. Utwórz nowe hasło aplikacji i połącz jeszcze raz.", net: "Brak połączenia z Gmailem. Spróbuję później.", secure: "Windows nie pozwolił zaszyfrować hasła.", form: "Wpisz adres Gmail i 16-znakowe hasło aplikacji.", busy: "Już sprawdzam pocztę.", off: "Poczta nie jest połączona." };
  let mailChecking = false;
  async function checkMail(manual) {
    if (DEMO || !NATIVE?.mailCheck || mailChecking) return;
    const st = await NATIVE.mailStatus();
    if (!st.connected) return;
    mailChecking = true;
    if (manual) toast("Sprawdzam pocztę…");
    try {
      S.mailSeen = S.mailSeen || [];
      const first = !S.mailInit;
      const r = await NATIVE.mailCheck(window.MAIL_QUERY || "", S.mailSeen);
      if (!r.ok) {
        if (manual || r.error === "auth") toast(MAIL_ERR[r.error] || "Nie udało się sprawdzić poczty.", 6e3);
        return;
      }
      const msgs = r.msgs.sort((a, b) => a.date.localeCompare(b.date));
      const changes = [];
      let csvAdded = 0;
      for (const m of msgs) {
        S.mailSeen.push(m.id);
        for (const c of m.csv || []) {
          try {
            const x = importCsv(S, c.text, `${c.name} (z poczty)`);
            csvAdded += x.added + x.updated;
          } catch (e) {
            console.warn(e);
          }
        }
        const ch = applyMail(m);
        if (ch) changes.push(ch);
      }
      S.mailSeen = S.mailSeen.slice(-3e3);
      if (first) {
        for (const o of S.orders || []) if (o.status === "delivered" || diffDays((o.updated || o.date).slice(0, 10), today()) > 14) o.stocked = true;
        S.mailInit = true;
      }
      save();
      render({ animate: false, scroll: false });
      if (csvAdded) toast(`CSV z poczty: ${csvAdded} ${plural(csvAdded, "trening", "treningi", "treningów")} dopisane`, 5e3);
      if (first) {
        const open = (S.orders || []).filter((o) => !o.stocked).length;
        toast(`Poczta połączona. ${open ? `Otwarte zamówienia: ${open}.` : "Nie ma otwartych zamówień."}`, 6e3);
        return;
      }
      for (const { o, to } of changes) {
        if (o.stocked) continue;
        const title = to === "delivered" ? `Dotarło: ${orderName(o)}` : to === "ready" ? `Paczka czeka do odbioru: ${o.shop}` : to === "shipped" ? `Wysłane: ${orderName(o)}` : to === "cancelled" ? `Anulowane: ${orderName(o)}` : `Nowe zamówienie: ${orderName(o)}`;
        const body = to === "delivered" ? `${orderItems(o)}. Kliknij, żeby dopisać do zapasu.` : orderItems(o);
        toast(`${title} · ${body}`, 6e3);
        NATIVE.notify({ id: `order-${o.key}-${to}`, title, body, route: "koszyk" });
      }
    } catch (e) {
      console.warn(e);
      if (manual) toast("Nie udało się sprawdzić poczty.");
    } finally {
      mailChecking = false;
    }
  }
  function ordersCard() {
    const arrived = (S.orders || []).filter((o) => o.status === "delivered" && !o.stocked);
    const open = (S.orders || []).filter((o) => !o.stocked && OSTAT[o.status] < 4);
    if (!arrived.length && !open.length) return "";
    return `<section class="card c12"><div class="card-head"><h2>Zamówienia z poczty</h2><div class="right">${open.length ? `${open.length} w drodze` : ""}${arrived.length ? `${open.length ? " · " : ""}<span style="color:var(--accent)">${arrived.length} dotarło</span>` : ""}</div></div>
    <table class="rows"><tbody>${[...arrived, ...open].map((o) => `<tr><td>${esc(orderName(o))}<span class="sub">${esc(orderItems(o))}</span></td>
      <td class="muted hide-phone">zamówione ${dShort(o.date)}${o.courier ? ` · ${esc(o.courier)}` : ""}</td>
      <td class="num"><span class="pill ${o.status === "delivered" ? "" : o.status === "ready" ? "warn" : ""}">${OLABEL[o.status]}</span></td>
      <td class="num"><div class="cart-act" style="max-width:220px">${o.status === "delivered" || o.status === "ready" ? `<button class="btn small primary" data-ostock="${o.key}">Dopisz do zapasu</button>` : ""}<button class="link faint" data-odone="${o.key}">${o.status === "delivered" ? "już dopisane" : "ukryj"}</button></div></td></tr>`).join("")}
    </tbody></table></section>`;
  }
  function mailCard() {
    if (!NATIVE?.mailStatus) return "";
    return `<section class="card c12" id="mailCard"><div class="card-head"><h2>Poczta: zamówienia i CSV</h2><div class="right" id="mailState">sprawdzam…</div></div><div id="mailBody"></div></section>`;
  }
  function fillMail() {
    const box = $("#mailBody");
    if (!box || !NATIVE?.mailStatus) return;
    NATIVE.mailStatus().then((st) => {
      if (!$("#mailBody")) return;
      $("#mailState").textContent = st.connected ? `połączona · ${st.user}` : "niepołączona";
      $("#mailBody").innerHTML = st.connected ? `<ul class="list"><li style="align-items:center"><span class="grow">Ostatnie sprawdzenie<span class="faint" style="display:block;font-size:12px">${st.last ? `${dRel(st.last.slice(0, 10))}, ${new Date(st.last).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}` : "jeszcze nie"}${st.error ? ` · <span class="neg">${esc(MAIL_ERR[st.error] || st.error)}</span>` : ""}. Program sprawdza co 20 minut i czyta tylko maile od sklepów, kurierów i eksporty z pliku CSV.</span></span><button class="btn small" data-act="mailCheck">Sprawdź teraz</button></li>
         <li style="align-items:center"><span class="grow">Odłącz pocztę<span class="faint" style="display:block;font-size:12px">Usuwa zapisane hasło z komputera. Hasło aplikacji możesz też unieważnić w koncie Google.</span></span><button class="btn small danger" data-act="mailOff">Odłącz</button></li></ul>` : `<div class="faint" style="font-size:13px;line-height:1.55;margin-bottom:14px">Program sam zobaczy w Gmailu, co zamówiłeś w sklepach, kiedy paczka wyszła i kiedy dotarła. Dopisze też treningi z eksportu pliku CSV wysłanego mailem do siebie. Czyta tylko te maile, niczego nie wysyła, nie usuwa i nie oznacza jako przeczytane.<br><br>
          <b style="color:var(--text);font-weight:500">Jak połączyć (2 minuty):</b> 1. Na koncie Google włącz weryfikację dwuetapową (jeśli jej nie masz). 2. Wejdź na <a class="link" href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener">myaccount.google.com/apppasswords</a>, wpisz nazwę „Forma” i skopiuj 16-znakowe hasło. 3. Wklej je poniżej. Hasło jest szyfrowane przez Windows i zostaje na tym komputerze.</div>
         <form id="mailForm" class="form-grid" autocomplete="off"><label class="field">Adres Gmail<input type="email" name="user" required placeholder="twoj.adres@gmail.com"></label><label class="field">Hasło aplikacji (16 znaków)<input type="password" name="pass" required minlength="16" placeholder="xxxx xxxx xxxx xxxx"></label>
         <div class="full" style="display:flex;justify-content:flex-end"><button class="btn primary" type="submit">Połącz</button></div></form>`;
      const f = $("#mailForm");
      if (f) f.onsubmit = async (ev) => {
        ev.preventDefault();
        const b = f.querySelector("button");
        b.disabled = true;
        b.textContent = "Łączę…";
        const r = await NATIVE.mailConnect(f.user.value, f.pass.value);
        if (!r.ok) {
          toast(MAIL_ERR[r.error] || "Nie udało się połączyć.", 6e3);
          b.disabled = false;
          b.textContent = "Połącz";
          return;
        }
        fillMail();
        checkMail(true);
      };
    }).catch(() => {
    });
  }
  const SYNC_SCALARS = ["profile", "rm", "theme", "cartOff", "cartPick", "cartSkip", "cartIn", "cartMine", "cartSame", "lastImport", "mailInit"];
  function recordsOf(st) {
    const m = /* @__PURE__ */ new Map();
    for (const k of SYNC_SCALARS) if (st[k] !== void 0 && st[k] !== null) m.set(k, st[k]);
    const map = (pre, o) => {
      for (const [k, v] of Object.entries(o || {})) m.set(`${pre}/${k}`, v);
    };
    const arr = (pre, a, id = "id") => {
      for (const v of a || []) if (v && v[id] != null) m.set(`${pre}/${v[id]}`, v);
    };
    map("days", st.days);
    map("sessions", st.sessions);
    map("checkins", st.checkins);
    arr("supps", st.supps);
    arr("labs", st.labs);
    arr("orders", st.orders, "key");
    arr("skin.products", st.skin?.products);
    if (st.skin?.routine) m.set("skin.routine", st.skin.routine);
    map("skin.checks", st.skin?.checks);
    return m;
  }
  function fromRecords(m, base) {
    const st = { ...base, days: {}, sessions: {}, checkins: {}, supps: [], labs: [], orders: [], skin: { routine: base.skin?.routine || { am: [], pm: [] }, products: [], checks: {} } };
    for (const k of SYNC_SCALARS) delete st[k];
    for (const [k, v] of m) {
      const i = k.indexOf("/"), pre = i < 0 ? k : k.slice(0, i), id = i < 0 ? null : k.slice(i + 1);
      if (id == null) {
        if (pre === "skin.routine") st.skin.routine = v;
        else st[pre] = v;
        continue;
      }
      if (pre === "days" || pre === "sessions" || pre === "checkins") st[pre][id] = v;
      else if (pre === "supps" || pre === "labs" || pre === "orders") st[pre].push(v);
      else if (pre === "skin.products") st.skin.products.push(v);
      else if (pre === "skin.checks") st.skin.checks[id] = v;
    }
    const order = new Map((base.supps || []).map((x, i) => [x.id, i]));
    st.supps.sort((a, b) => (order.get(a.id) ?? 1e9) - (order.get(b.id) ?? 1e9));
    return st;
  }
  let lastRec = null;
  function stamp(fresh) {
    S._ts = S._ts || {};
    const now = Date.now(), cur = /* @__PURE__ */ new Map();
    for (const [k, v] of recordsOf(S)) cur.set(k, JSON.stringify(v));
    if (lastRec) {
      for (const [k, j] of cur) if (lastRec.get(k) !== j) S._ts[k] = now;
      for (const k of lastRec.keys()) if (!cur.has(k)) S._ts[k] = -now;
    } else for (const k of cur.keys()) if (!(k in S._ts)) S._ts[k] = fresh ? 0 : 1;
    for (const [k, t] of Object.entries(S._ts)) if (t < 0 && now + t > 120 * 864e5) delete S._ts[k];
    lastRec = cur;
  }
  function mergeSync(local, remote) {
    const L = recordsOf(local), R = recordsOf(remote), lt = local._ts || {}, rt = remote._ts || {};
    const keys = /* @__PURE__ */ new Set([...L.keys(), ...R.keys(), ...Object.keys(lt), ...Object.keys(rt)]);
    const out = /* @__PURE__ */ new Map(), ts = {};
    let fromRemote = 0, fromLocal = 0;
    for (const k of keys) {
      const a = lt[k] ?? (L.has(k) ? 1 : 0), b = rt[k] ?? (R.has(k) ? 1 : 0);
      if (a === 0 && !R.has(k) && R.size) continue;
      const useR = Math.abs(b) > Math.abs(a) || Math.abs(b) === Math.abs(a) && !L.has(k) && R.has(k);
      const t = useR ? b : a, v = useR ? R.get(k) : L.get(k);
      if (useR && (JSON.stringify(R.get(k)) !== JSON.stringify(L.get(k)) || b !== a)) fromRemote++;
      if (!useR && (JSON.stringify(R.get(k)) !== JSON.stringify(L.get(k)) || b !== a)) fromLocal++;
      if (t !== 0 || v !== void 0) ts[k] = t;
      if (t >= 0 && v !== void 0) out.set(k, v);
    }
    const st = fromRecords(out, local);
    st._ts = ts;
    st.mailSeen = [.../* @__PURE__ */ new Set([...local.mailSeen || [], ...remote.mailSeen || []])].slice(-3e3);
    return { st, fromRemote, fromLocal };
  }
  const SYNC_KEY = "forma.sync";
  const SYNC_ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const syncCfg = () => {
    try {
      return JSON.parse(localStorage.getItem(SYNC_KEY) || "null");
    } catch {
      return null;
    }
  };
  const setSyncCfg = (c) => {
    try {
      if (c) localStorage.setItem(SYNC_KEY, JSON.stringify(c));
      else localStorage.removeItem(SYNC_KEY);
    } catch {
    }
  };
  function newSyncCode() {
    const b = crypto.getRandomValues(new Uint8Array(25));
    return [...b].map((x) => SYNC_ABC[x % 32]).join("").replace(/(.{5})(?!$)/g, "$1-");
  }
  const cleanCode = (c) => String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/O/g, "0").replace(/I/g, "1");
  async function syncKeys(code) {
    const raw = new TextEncoder().encode(cleanCode(code));
    const idHash = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("forma-id:" + cleanCode(code))));
    const base = await crypto.subtle.importKey("raw", raw, "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: new TextEncoder().encode("forma-sync-v1"), iterations: 15e4, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    return { id: [...idHash].map((x) => x.toString(16).padStart(2, "0")).join(""), key };
  }
  const b64 = (u8) => {
    let s = "";
    for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode(...u8.subarray(i, i + 32768));
    return btoa(s);
  };
  const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  async function seal(key, text) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(text)));
    return `${b64(iv)}.${b64(data)}`;
  }
  async function unseal(key, blob) {
    const [iv, data] = String(blob).split(".");
    return new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, key, unb64(data)));
  }
  const syncUrl = () => "";
  let syncState = { busy: false, last: null, err: null, keys: null, timer: null };
  async function syncNow(manual) {
    const cfg = syncCfg();
    if (DEMO || !cfg?.code || !syncUrl()) return;
    if (syncState.busy) {
      syncState.again = true;
      return;
    }
    syncState.busy = true;
    if (manual) toast("Synchronizuję…");
    try {
      if (!syncState.keys || syncState.keys.code !== cfg.code) syncState.keys = { code: cfg.code, ...await syncKeys(cfg.code) };
      const { id, key } = syncState.keys;
      for (let attempt = 0; attempt < 3; attempt++) {
        const res = await fetch(`${syncUrl()}?id=${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`serwer: ${res.status}`);
        const got = await res.json();
        let changedHere = false, needPush = !got.data;
        if (got.data) {
          let remote;
          try {
            remote = normalize(JSON.parse(await unseal(key, got.data)));
          } catch {
            throw new Error("Kod nie pasuje do danych w chmurze.");
          }
          const r = mergeSync(S, remote);
          if (r.fromRemote) {
            S = normalize(r.st);
            version++;
            lastRec = null;
            stamp();
            changedHere = true;
          }
          needPush = r.fromLocal > 0;
        }
        if (changedHere) {
          persist();
          applyTheme();
          render({ animate: false, scroll: false });
        }
        if (!needPush) break;
        const body = JSON.stringify({ data: await seal(key, JSON.stringify(S)), rev: got.rev || 0 });
        const put = await fetch(`${syncUrl()}?id=${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body });
        if (put.status === 409) continue;
        if (!put.ok) throw new Error(`serwer: ${put.status}`);
        break;
      }
      syncState.last = (/* @__PURE__ */ new Date()).toISOString();
      syncState.err = null;
      setSyncCfg({ ...cfg, last: syncState.last });
      if (manual) toast("Zsynchronizowano");
    } catch (e) {
      syncState.err = e.message || String(e);
      if (manual) toast(`Synchronizacja nie wyszła: ${syncState.err}`, 6e3);
    } finally {
      syncState.busy = false;
      if ($("#syncBody")) fillSync();
      if (syncState.again) {
        syncState.again = false;
        setTimeout(() => syncNow(), 500);
      }
    }
  }
  function qrDialog(html, onClose) {
    let d = $("#qrDialog");
    if (!d) {
      d = document.createElement("dialog");
      d.id = "qrDialog";
      document.body.appendChild(d);
    }
    d.innerHTML = `<form method="dialog" style="align-items:center;text-align:center">${html}<div class="dialog-actions" style="justify-content:center"><button class="btn" type="button" data-close>Zamknij</button></div></form>`;
    d.onclose = () => onClose?.();
    d.showModal();
    return d;
  }
  async function showSyncQr() {
    const code = syncCfg()?.code;
    if (!code) return;
    await loadScript("vendor/qr/qrcode.js");
    const q = window.qrcode(0, "M");
    q.addData(cleanCode(code));
    q.make();
    qrDialog(`<h2>Zeskanuj telefonem</h2><div class="qr-box">${q.createSvgTag({ cellSize: 6, margin: 3, scalable: true })}</div><p class="faint" style="font-size:13px;margin:0">Na telefonie: Forma → Ustawienia → Synchronizacja → „Zeskanuj QR”. Nie pokazuj tego kodu nikomu.</p>`);
  }
  async function scanSyncQr() {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast("Ta przeglądarka nie daje dostępu do aparatu. Wklej kod ręcznie.");
      return;
    }
    let stream = null, stop = false;
    const d = qrDialog('<h2>Skieruj aparat na kod QR</h2><video class="qr-cam" playsinline muted autoplay></video><p class="faint" style="font-size:13px;margin:0">Kod z komputera: Ustawienia → Synchronizacja → „Kod QR”.</p>', () => {
      stop = true;
      stream?.getTracks().forEach((t) => t.stop());
    });
    try {
      await loadScript("vendor/qr/jsQR.js");
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      if (stop) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      const v = d.querySelector("video");
      v.srcObject = stream;
      await v.play();
      const cv = document.createElement("canvas"), g = cv.getContext("2d", { willReadFrequently: true });
      const tick = () => {
        if (stop) return;
        if (v.videoWidth) {
          cv.width = v.videoWidth;
          cv.height = v.videoHeight;
          g.drawImage(v, 0, 0);
          const hit = window.jsQR(g.getImageData(0, 0, cv.width, cv.height).data, cv.width, cv.height, { inversionAttempts: "dontInvert" });
          const c = hit && cleanCode(hit.data);
          if (c && c.length === 25) {
            d.close();
            setSyncCfg({ code: c.replace(/(.{5})(?!$)/g, "$1-") });
            fillSync();
            syncNow(true);
            return;
          }
        }
        setTimeout(tick, 200);
      };
      tick();
    } catch (e) {
      d.close();
      toast(e?.name === "NotAllowedError" ? "Brak zgody na aparat. Zezwól w ustawieniach albo wklej kod." : "Nie udało się włączyć aparatu. Wklej kod ręcznie.", 6e3);
    }
  }
  function syncSoon() {
    if (!syncCfg()?.code) return;
    clearTimeout(syncState.timer);
    syncState.timer = setTimeout(() => syncNow(), 4e3);
  }
  function syncCard() {
    return `<section class="card c12"><div class="card-head"><h2>Synchronizacja z telefonem</h2><div class="right" id="syncState"></div></div><div id="syncBody"></div></section>`;
  }
  function fillSync() {
    const box = $("#syncBody");
    if (!box) return;
    const cfg = syncCfg();
    $("#syncState").textContent = cfg?.code ? syncState.err ? "błąd" : "włączona" : "wyłączona";
    box.innerHTML = cfg?.code ? `<ul class="list"><li style="align-items:center"><span class="grow">Ostatnio<span class="faint" style="display:block;font-size:12px">${cfg.last ? `${dRel(cfg.last.slice(0, 10))}, ${new Date(cfg.last).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}` : "jeszcze nie"}${syncState.err ? ` · <span class="neg">${esc(syncState.err)}</span>` : ""}. Synchronizuje się samo po każdej zmianie i przy otwarciu.</span></span><button class="btn small" data-act="syncNow">Synchronizuj teraz</button></li>
        <li style="align-items:center"><span class="grow">Kod do drugiego urządzenia<span class="faint" style="display:block;font-size:12px">Wpisz go na telefonie w Ustawieniach → Synchronizacja → „Mam już kod”. Nikomu go nie dawaj: kto ma kod, ma twoje dane.</span><span class="num" id="syncCode" style="display:block;margin-top:6px;letter-spacing:.08em;font-size:15px">•••••-•••••-•••••-•••••-•••••</span></span><button class="btn small" data-act="syncQr">Kod QR</button><button class="btn small" data-act="syncShow">Pokaż</button><button class="btn small" data-act="syncCopy">Kopiuj</button></li>
        <li style="align-items:center"><span class="grow">Wyłącz na tym urządzeniu<span class="faint" style="display:block;font-size:12px">Dane zostają tutaj i w chmurze, tylko to urządzenie przestaje się zgrywać.</span></span><button class="btn small danger" data-act="syncOff">Wyłącz</button></li></ul>` : `<div class="faint" style="font-size:13px;line-height:1.55;margin-bottom:14px">Komputer i telefon będą miały te same dane. Wszystko jest szyfrowane na urządzeniu twoim kodem, zanim trafi do chmury, więc nikt bez kodu tego nie odczyta.</div>
       <div class="sync-start"><button class="btn primary" data-act="syncNew">Włącz i utwórz kod</button>
       <form id="syncJoin" class="sync-join"><label class="field" style="flex:1">Mam już kod<input name="code" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"></label><button class="btn" type="submit">Połącz</button><button class="btn" type="button" data-act="syncScan">Zeskanuj QR</button></form></div>`;
    const j = $("#syncJoin");
    if (j) j.onsubmit = (ev) => {
      ev.preventDefault();
      const c = cleanCode(j.code.value);
      if (c.length !== 25) {
        toast("Kod ma 25 znaków (5 grup po 5).");
        return;
      }
      setSyncCfg({ code: c.replace(/(.{5})(?!$)/g, "$1-") });
      fillSync();
      syncNow(true);
    };
  }
  const foldTxt = (t) => String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l");
  function paletteItems() {
    const go = (r) => () => {
      location.hash = "#/" + r;
    };
    const ex = exercises();
    const exList = Array.isArray(ex) ? ex : [...ex?.values?.() || []];
    return [
      { t: "Wpis dnia", k: "Akcja", hint: "Alt+N", run: () => openLog() },
      ...NAV.filter(([id]) => !(DEMO && id === "raport")).map(([id, label], i) => ({ t: label, k: "Zakładka", hint: `Alt+${i + 1}`, run: go(id) })),
      { t: "Ustawienia", k: "Zakładka", hint: "Alt+0", run: go("ustawienia") },
      { t: "Metody treningowe", k: "Zakładka", run: go("metody") },
      { t: "Atlas ćwiczeń", k: "Zakładka", run: () => {
        bodyMode = "atlas";
        bodySel = null;
        location.hash = "#/cialo";
        render();
      } },
      ...Object.entries(window.MUSCLES || {}).map(([m, l]) => ({ t: `Ćwiczenia: ${l}`, k: "Atlas", run: () => {
        bodyMode = "atlas";
        bodySel = m;
        location.hash = "#/cialo";
        render();
      } })),
      { t: "Wczytaj eksport treningów (CSV)", k: "Akcja", run: () => $("#fileCsv").click() },
      ...DEMO ? [] : [{ t: "Skopiuj raport dla Claude", k: "Akcja", run: () => {
        navigator.clipboard.writeText(buildReport(repDays)).then(() => toast("Skopiowano raport. Wklej go do nowej rozmowy."), () => {
          location.hash = "#/raport";
        });
      } }],
      { t: "Pobierz kopię danych (JSON)", k: "Akcja", run: () => download(`forma-kopia-${today()}.json`, JSON.stringify(S, null, 1), "application/json") },
      { t: "Dodaj kosmetyk", k: "Akcja", run: () => editProd() },
      { t: "Dodaj wynik badania", k: "Akcja", run: () => editLab() },
      ...[["noc", "Noc"], ["grafit", "Grafit"], ["bursztyn", "Bursztyn"], ["jasny", "Jasny"]].map(([id, n]) => ({ t: `Motyw: ${n}`, k: "Wygląd", run: () => $(`#themes [data-theme="${id}"]`)?.click() })),
      ...cartRows().filter((r) => r.status === "need").map((r) => ({ t: `Kupiłem: ${r.item}`, k: "Koszyk", run: () => buyCart(r.item) })),
      ...S.supps.map((x) => ({ t: x.name, k: "Suplement", sub: x.brand, run: () => editSupp(x) })),
      ...S.skin.products.map((p) => ({ t: p.name, k: "Kosmetyk", run: () => editProd(p) })),
      ...exList.map((x) => ({ t: x.name, k: "Ćwiczenie", sub: x.group, run: go("cwiczenie/" + encodeURIComponent(x.name)) }))
    ];
  }
  let palSel = 0, palList = [];
  function paletteDraw(q) {
    const words = foldTxt(q).split(/\s+/).filter(Boolean);
    const all = paletteItems();
    palList = words.length ? all.filter((x) => {
      const h = foldTxt(`${x.t} ${x.k} ${x.sub || ""}`);
      return words.every((w) => h.includes(w));
    }).sort((a, b) => (foldTxt(a.t).startsWith(words[0]) ? 0 : 1) - (foldTxt(b.t).startsWith(words[0]) ? 0 : 1)).slice(0, 40) : all.filter((x) => x.k === "Akcja" || x.k === "Zakładka").slice(0, 12);
    palSel = Math.min(palSel, Math.max(0, palList.length - 1));
    const ul = $("#cmdk ul");
    ul.innerHTML = palList.length ? palList.map((x, i) => `<li role="option" data-pi="${i}" aria-selected="${i === palSel}"><span class="t">${esc(x.t)}${x.sub ? `<span class="sub">${esc(x.sub)}</span>` : ""}</span><span class="k">${esc(x.k)}</span>${x.hint ? `<kbd>${esc(x.hint)}</kbd>` : ""}</li>`).join("") : '<li class="none">Nic nie pasuje. Spróbuj innego słowa.</li>';
    ul.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }
  function openPalette() {
    let d = $("#cmdk");
    if (!d) {
      d = document.createElement("dialog");
      d.id = "cmdk";
      d.setAttribute("aria-label", "Szukaj i działaj");
      d.innerHTML = `<div class="cmdk-in"><div class="cmdk-q"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input type="text" placeholder="Zakładka, suplement, ćwiczenie albo akcja" aria-label="Szukaj" autocomplete="off" spellcheck="false"></div><ul role="listbox"></ul>
      <div class="cmdk-foot"><span><kbd>↑</kbd><kbd>↓</kbd> wybór</span><span><kbd>Enter</kbd> otwórz</span><span><kbd>Esc</kbd> zamknij</span></div></div>`;
      document.body.appendChild(d);
      const inp2 = d.querySelector("input");
      inp2.addEventListener("input", () => {
        palSel = 0;
        paletteDraw(inp2.value);
      });
      inp2.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          palSel = (palSel + (e.key === "ArrowDown" ? 1 : -1) + palList.length) % Math.max(1, palList.length);
          paletteDraw(inp2.value);
        } else if (e.key === "Enter") {
          e.preventDefault();
          runPalette(palSel);
        }
      });
      d.addEventListener("click", (e) => {
        const li = e.target.closest("[data-pi]");
        if (li) runPalette(+li.dataset.pi);
        else if (e.target === d) d.close();
      });
    }
    if (d.open) {
      d.close();
      return;
    }
    palSel = 0;
    const inp = d.querySelector("input");
    inp.value = "";
    paletteDraw("");
    d.showModal();
    inp.focus();
  }
  function runPalette(i) {
    const x = palList[i];
    if (!x) return;
    $("#cmdk").close();
    setTimeout(() => x.run(), 60);
  }
  document.addEventListener("keydown", (ev) => {
    const typing = ev.target.closest?.("input, textarea, select, [contenteditable]");
    if ((ev.ctrlKey || ev.metaKey) && !ev.altKey && ev.key.toLowerCase() === "k") {
      ev.preventDefault();
      openPalette();
      return;
    }
    if (document.querySelector("dialog[open]") || typing) return;
    if (ev.key === "/" && !ev.ctrlKey && !ev.altKey) {
      ev.preventDefault();
      openPalette();
      return;
    }
    if (ev.altKey && !ev.ctrlKey) {
      if (ev.code === "KeyN") {
        ev.preventDefault();
        openLog();
        return;
      }
      const m = ev.code.match(/^Digit(\d)$/);
      if (!m) return;
      const n = +m[1];
      ev.preventDefault();
      location.hash = "#/" + (n === 0 ? "ustawienia" : NAV[n - 1]?.[0] || "pulpit");
    }
  });
  S = DEMO ? demoState() : load();
  if (S.cartMine === void 0) S.cartMine = { ...window.CART_MINE || {} };
  if (S.cartSame === void 0) S.cartSame = [...window.CART_SAME || []];
  stamp(loadedFresh);
  persist();
  applyTheme();
  starfield();
  setTimeout(() => syncNow(), 2500);
  setInterval(() => {
    if (!document.hidden) syncNow();
  }, 3 * 6e4);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) syncNow();
  });
  addEventListener("online", () => syncNow());
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    const had = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (had) location.reload();
    });
    navigator.serviceWorker.register("sw.js").then((reg) => document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") reg.update().catch(() => {
      });
    })).catch(() => {
    });
  }
  (document.fonts?.ready || Promise.resolve()).then(() => {
    render();
    if (firstRun) setTimeout(() => toast("Pierwsze uruchomienie programu. Żeby przenieść swoje wpisy z przeglądarki: tam w Ustawieniach pobierz kopię, a tutaj ją wczytaj.", 9e3), 900);
  });
  if (NATIVE) {
    NATIVE.onCsv((name, text) => {
      try {
        const r = importCsv(S, text, `${name} (z Pobranych)`);
        if (!r.added && !r.updated) return;
        save();
        render({ animate: false, scroll: false });
        const msg = `${r.added} ${plural(r.added, "nowy trening", "nowe treningi", "nowych treningów")}${r.updated ? `, ${r.updated} ${plural(r.updated, "zmieniony", "zmienione", "zmienionych")}` : ""}`;
        toast(`CSV z Pobranych: ${msg}`, 5e3);
        if (document.hidden) NATIVE.notify({ id: `csv-${name}-${r.added}-${r.updated}`, title: "Dopisano treningi z pliku CSV", body: msg, route: "treningi" });
      } catch (e) {
        console.warn(e);
      }
    });
    NATIVE.onNav((r) => {
      if (r === "log") openLog();
      else if (VIEWS[r]) location.hash = "#/" + r;
    });
    const remind = () => {
      for (const x of runningOut()) {
        if (x.k !== "soon" && x.k !== "out") continue;
        NATIVE.notify({ id: `ro-${x.kind}-${x.id}`, title: x.k === "out" || x.daysLeft <= 0 ? `${x.name}: koniec zapasu` : `${x.name}: zostało ${days(x.daysLeft)}`, body: x.kind === "supp" ? "Zamów teraz, żeby zdążyło dojść. Wszystko jest w Koszyku." : "Pora na nowe opakowanie. Jest w Koszyku.", route: "koszyk" });
      }
      if ((/* @__PURE__ */ new Date()).getHours() >= 20 && !S.days[today()]) NATIVE.notify({ id: "log", title: "Brak dzisiejszego wpisu", body: "Wpisz wagę i kalorie, żeby wyliczenie TDEE było dokładne.", route: "log" });
    };
    setTimeout(remind, 8e3);
    setInterval(remind, 30 * 6e4);
    setTimeout(() => checkMail(), 15e3);
    setInterval(() => checkMail(), 20 * 6e4);
  }
})();
