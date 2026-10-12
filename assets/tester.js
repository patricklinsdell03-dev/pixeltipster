/* ============================================================================
   BACKTESTER (prototype): test a betting system on past games and races.
   Football: sample seasons with sharp closing prices and bookmaker averages.
   Racing: sample races with Betfair Starting Price (win and place).
   The newest season / last fifth of races is held back as "unseen" games.
   Results are always shown exactly as they come out.
   ========================================================================== */
const FB_LEAGUES = {
  'Premier League': ['Liverpool', 'Man City', 'Arsenal', 'Chelsea', 'Aston Villa', 'Newcastle', 'Tottenham', 'Brighton', 'Everton', 'Fulham'],
  LaLiga: ['Real Madrid', 'Barcelona', 'Atlético Madrid', 'Villarreal', 'Real Betis', 'Sevilla', 'Girona', 'Valencia', 'Osasuna', 'Celta'],
  'Serie A': ['Inter', 'Napoli', 'Juventus', 'Milan', 'Atalanta', 'Roma', 'Lazio', 'Fiorentina', 'Bologna', 'Torino'],
  Bundesliga: ['Bayern', 'Leverkusen', 'Dortmund', 'Leipzig', 'Stuttgart', 'Frankfurt', 'Freiburg', 'Wolfsburg', 'Mainz', 'Union'],
  'Ligue 1': ['PSG', 'Monaco', 'Marseille', 'Lille', 'Lyon', 'Nice', 'Lens', 'Rennes', 'Brest', 'Nantes']
};
const FB_SEASONS = ['2023-24', '2024-25', '2025-26'];
const poisCdf = (l, k) => { let s = 0, t = Math.exp(-l); for (let i = 0; i <= k; i++) { s += t; t *= l / (i + 1); } return s; };
function probs1x2(lh, la) {
  const dist = l => { const o = []; let t = Math.exp(-l); for (let i = 0; i < 11; i++) { o.push(t); t *= l / (i + 1); } return o; };
  const ph = dist(lh), pa = dist(la); let H = 0, D = 0;
  for (let i = 0; i < 11; i++) for (let j = 0; j < 11; j++) { if (i > j) H += ph[i] * pa[j]; else if (i === j) D += ph[i] * pa[j]; }
  return { H, D, A: 1 - H - D };
}
const shuffle = (a, r) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function fbData() {
  if (fbData.c) return fbData.c;
  const rows = [];
  Object.entries(FB_LEAGUES).forEach(([lg, teams]) => FB_SEASONS.forEach((season, si) => {
    const r = rng(hash(lg + season)), n = teams.length;
    const att = teams.map((_, i) => 1.35 - i * 0.06 + (r() - 0.5) * 0.25), def = teams.map((_, i) => 0.75 + i * 0.05 + (r() - 0.5) * 0.2), cor = teams.map((_, i) => 1.15 - i * 0.03 + (r() - 0.5) * 0.2);
    const hist = teams.map(() => ({ gf: [], ga: [], cf: [] })), l5 = x => avg(x.slice(-5)), games = [];
    for (let k = 0; k < 2; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j) games.push([i, j]);
    shuffle(games, r).forEach(([h, a], gi) => {
      const lh = 1.45 * att[h] * def[a], la = 1.15 * att[a] * def[h], H = hist[h], W = hist[a];
      const gh = pois(r, lh), ga = pois(r, la), ch = pois(r, 5.3 * cor[h]), ca = pois(r, 4.5 * cor[a]);
      if (H.gf.length >= 5 && W.gf.length >= 5) {
        const p = probs1x2(lh, la); p.O = 1 - poisCdf(lh + la, 2); p.U = 1 - p.O;
        const price = (q, m) => +(1 / (q * m) * (1 + (r() - 0.5) * 0.06)).toFixed(2), keys = Object.keys(p);
        rows.push({ lg, season, unseen: si === 2, t: si * 1000 + gi, h: teams[h], a: teams[a], hgf: l5(H.gf), agc: l5(W.ga), tg: l5(H.gf) + l5(W.gf), hc: l5(H.cf),
          sharp: Object.fromEntries(keys.map(k => [k, price(p[k], 1.025)])), book: Object.fromEntries(keys.map(k => [k, price(p[k], 1.065)])), gh, ga, ch, ca });
      }
      H.gf.push(gh); H.ga.push(ga); H.cf.push(ch); W.gf.push(ga); W.ga.push(gh); W.cf.push(ca);
    });
  }));
  return fbData.c = rows.sort((x, y) => x.t - y.t);
}
const FB_MARKETS = { 'Home win': ['H', m => m.gh > m.ga], Draw: ['D', m => m.gh === m.ga], 'Away win': ['A', m => m.gh < m.ga], 'Over 2.5 goals': ['O', m => m.gh + m.ga > 2],
  'Under 2.5 goals': ['U', m => m.gh + m.ga < 3], 'Match corners over 9.5': [null, m => m.ch + m.ca > 9], 'Both teams to score': [null, m => m.gh > 0 && m.ga > 0] };

function rcData() {
  if (rcData.c) return rcData.c;
  const r = rng(hash('racing-history')), rows = [], RACE_N = 900;
  for (let ri = 0; ri < RACE_N; ri++) {
    const code = ['Flat', 'AW', 'Hurdle', 'Chase'][Math.floor(r() * 4)], hcap = r() < 0.55, going = code === 'AW' ? 'Standard' : ['Firm', 'Good', 'Good', 'Soft', 'Heavy'][Math.floor(r() * 5)];
    const pool = COURSES[code === 'Hurdle' || code === 'Chase' ? 'Jumps' : code], course = pool[Math.floor(r() * pool.length)];
    const n = 5 + Math.floor(r() * 14), ab = Array.from({ length: n }, () => Math.exp((r() + r() + r() - 1.5) * 1.6)), tot = ab.reduce((s, x) => s + x, 0), p = ab.map(x => x / tot);
    const qr = p.map(x => Math.pow(x, 0.92)), qt = qr.reduce((s, x) => s + x, 0), q = qr.map(x => x / qt);   // the market slightly over-bets outsiders
    const places = placesFor(n, hcap ? 'Handicap' : ''), order = [], left = p.map((x, i) => [x, i]);
    while (left.length) { let t = r() * left.reduce((s, x) => s + x[0], 0), k = 0; while ((t -= left[k][0]) > 0 && k < left.length - 1) k++; order.push(left.splice(k, 1)[0][1]); }
    const bsp = q.map(x => +Math.max(1.05, (1 / x) * (1 + (r() - 0.5) * 0.1)).toFixed(2)), a0 = Math.floor(r() * 20);
    p.forEach((x, i) => {
      const pos = order.indexOf(i) + 1, qp = 1 - Math.pow(1 - q[i], places * 0.85);
      rows.push({ t: ri, unseen: ri >= RACE_N * 0.8, code, hcap, going, n, course, bsp: bsp[i], pbsp: +Math.max(1.01, 1 / qp).toFixed(2), won: pos === 1, placed: pos <= places,
        rank: bsp.filter(b => b < bsp[i]).length + 1, C: r() < 0.08 + x * 0.6, D: r() < 0.12 + x * 0.6, G: r() < 0.12 + x * 0.5, TF: r() < 0.25,
        days: r() < 0.15 ? 91 + Math.floor(r() * 200) : 7 + Math.floor(r() * 80), name: `${RN_A[(a0 + i * 7) % 20]} ${RN_B[(a0 + i * 3) % 20]}`, pos });
    });
  }
  return rcData.c = rows;
}

/* ---------- Rules -> bets ---------- */
const num = v => v === '' || v == null || isNaN(+v) ? null : +v;
const atLeast = (x, v) => num(v) == null || x >= num(v), atMost = (x, v) => num(v) == null || x <= num(v);
function fbBets(f) {
  const [k, won] = FB_MARKETS[f.market];
  return fbData().filter(m => (f.league === 'All' || m.lg === f.league) && atLeast(m.hgf, f.hgf) && atLeast(m.agc, f.agc) && atLeast(m.tg, f.tg) && atLeast(m.hc, f.hc)
    && (!k || (atLeast(m.sharp[k], f.pmin) && atMost(m.sharp[k], f.pmax))))
    .map(m => ({ won: won(m), unseen: m.unseen, label: `${m.h} v ${m.a}`, sub: `${m.lg} ${m.season}`, res: `${m.gh}-${m.ga}${k ? '' : ` · ${m.ch + m.ca} corners`}`, ex: k ? m.sharp[k] : null, bk: k ? m.book[k] : null, seg: { League: m.lg, 'Closing price': k ? bandOf(PRICE_BANDS, m.sharp[k]) : null } }));
}
function rcBets(f) {
  const place = f.market === 'Place';
  return rcData().filter(x => (f.code === 'All' || x.code === f.code) && (f.type === 'All' || (f.type === 'Handicap') === x.hcap)
    && (f.going === 'All' || (f.going === 'Firm/Good' ? /^(Firm|Good)$/.test(x.going) : f.going === 'Soft/Heavy' ? /Soft|Heavy/.test(x.going) : x.going === 'Standard'))
    && (f.fav === 'Any' || (f.fav === 'Favourite' ? x.rank === 1 : x.rank <= 3)) && Object.entries(f.flags).every(([k, on]) => !on || x[k])
    && (f.days === 'Any' || (f.days === '30 or less' ? x.days <= 30 : f.days === '31-90' ? x.days > 30 && x.days <= 90 : x.days > 90))
    && (f.field === 'Any' || (f.field === '8 or fewer' ? x.n <= 8 : f.field === '9-15' ? x.n > 8 && x.n < 16 : x.n >= 16)) && atLeast(x.bsp, f.bmin) && atMost(x.bsp, f.bmax))
    .map(x => { const ex = place ? x.pbsp : x.bsp; return { won: place ? x.placed : x.won, unseen: x.unseen, label: x.name, sub: `${x.course} · ${x.code} · ${x.going} · ${x.n} ran`, res: x.pos === 1 ? 'Won' : `${x.pos}${['st', 'nd', 'rd'][x.pos - 1] || 'th'}`, ex, bk: +(1 + (ex - 1) * (1 - f.marg / 100)).toFixed(2),
      seg: { 'Race type': x.code, Handicaps: x.hcap ? 'Handicap' : 'Non-handicap', Runners: x.n <= 8 ? '8 or fewer' : x.n < 16 ? '9-15' : '16+', BSP: bandOf(BSP_BANDS, x.bsp), Going: /^(Firm|Good)$/.test(x.going) ? 'Firm/Good' : x.going === 'Standard' ? 'Standard (AW)' : 'Soft/Heavy' } }; });
}

/* ---------- Stats: flat 1-point stakes ---------- */
function btStats(bets, comm) {
  const n = bets.length, w = bets.filter(b => b.won).length;
  if (!n || bets[0].ex == null) return { n, w };
  const ret = (b, k) => !b.won ? -1 : k === 'ex' ? b.ex - 1 : k === 'net' ? (b.ex - 1) * (1 - comm / 100) : b.bk - 1;
  const sum = k => bets.reduce((s, b) => s + ret(b, k), 0), nets = bets.map(b => ret(b, 'net')), mean = sum('net') / n;
  const sd = Math.sqrt(nets.reduce((s, x) => s + (x - mean) ** 2, 0) / Math.max(1, n - 1)), se = sd / Math.sqrt(n);
  let cum = 0, peak = 0, dd = 0, run = 0, worst = 0; const curve = [0];
  nets.forEach(x => { cum += x; curve.push(cum); peak = Math.max(peak, cum); dd = Math.max(dd, peak - cum); run = x < 0 ? run + 1 : 0; worst = Math.max(worst, run); });
  const part = u => { const s = bets.filter(b => b.unseen === u); return { n: s.length, roi: s.length ? s.reduce((a, b) => a + ret(b, 'net'), 0) / s.length : 0 }; };
  return { n, w, ex: sum('ex'), net: sum('net'), bk: sum('book'), lo: mean - 1.96 * se, hi: mean + 1.96 * se, dd, worst, curve, seen: part(false), unseen: part(true) };
}

/* ---------- Page ---------- */
const btGet = p => p.split('.').reduce((o, k) => o[k], A.bt);
const btSet = (p, v) => { const ks = p.split('.'), last = ks.pop(); ks.reduce((o, k) => o[k], A.bt)[last] = v; };
const btPills = (path, opts, label) => `<div class="btf"><span class="px">${label}</span><div class="pills">${opts.map(o => `<button data-a="btset" data-id="${path}|${o}" class="${btGet(path) === o ? 'on' : ''}" aria-pressed="${btGet(path) === o}">${o}</button>`).join('')}</div></div>`;
const btNum = (path, label, ph = 'Any') => `<label>${label}<input id="bt-${path}" type="number" step="0.1" min="0" inputmode="decimal" placeholder="${ph}" value="${esc(btGet(path))}"></label>`;
const pctTxt = x => (x > 0 ? '+' : '') + (x * 100).toFixed(1) + '%', ptsTxt = x => (x > 0 ? '+' : '') + x.toFixed(1);

/* Splits and "try this": bands each bet falls into, and the rules that select a band. */
const PRICE_BANDS = { 'Under 1.80': ['', 1.79], '1.80–2.20': [1.8, 2.19], '2.20–3.00': [2.2, 2.99], '3.00 and up': [3, ''] };
const BSP_BANDS = { 'Under 3.0': ['', 2.99], '3.0–6.0': [3, 5.99], '6.0–12.0': [6, 11.99], '12.0 and up': [12, ''] };
const bandOf = (bands, p) => Object.keys(bands).find(k => (bands[k][0] === '' || p >= bands[k][0]) && (bands[k][1] === '' || p <= bands[k][1] + 0.009));
function btApply(dim, v) {
  const f = A.bt.fb, r = A.bt.rc;
  if (dim === 'League') f.league = v;
  else if (dim === 'Closing price') [f.pmin, f.pmax] = PRICE_BANDS[v].map(String);
  else if (dim === 'Race type') r.code = v;
  else if (dim === 'Handicaps') r.type = v;
  else if (dim === 'Runners') r.field = v;
  else if (dim === 'Going') r.going = v;
  else if (dim === 'BSP') [r.bmin, r.bmax] = BSP_BANDS[v].map(String);
}
/* Best bands, worked out on tuning games only so the unseen check stays fair. */
function btSplits(bets, comm, overall) {
  const seen = bets.filter(b => !b.unseen && b.ex != null), out = [];
  if (!seen.length) return out;
  Object.keys(seen[0].seg).forEach(d => {
    const g = {}; seen.forEach(b => (g[b.seg[d]] ??= []).push(b));
    if (Object.keys(g).length < 2) return;   // already narrowed on this one
    Object.entries(g).forEach(([v, bs]) => { if (bs.length < 30) return; const roi = bs.reduce((s, b) => s + (b.won ? (b.ex - 1) * (1 - comm / 100) : -1), 0) / bs.length; if (roi > overall) out.push({ d, v, n: bs.length, roi }); });
  });
  return out.sort((a, b) => b.roi - a.roi).slice(0, 4);
}
function btDescribe(sport, f) {
  if (sport === 'football') return [f.market, f.league === 'All' ? 'all leagues' : f.league, f.hgf && `home scored ${f.hgf}+`, f.agc && `away conceded ${f.agc}+`, f.tg && `combined ${f.tg}+`, f.hc && `home corners ${f.hc}+`,
    (f.pmin || f.pmax) && `price ${f.pmin || '1.01'}–${f.pmax || 'any'}`].filter(Boolean).join(', ');
  return [f.market, f.code === 'All' ? 'all races' : f.code, f.type !== 'All' && f.type, f.going !== 'All' && f.going, f.fav !== 'Any' && f.fav.toLowerCase(), ...Object.keys(f.flags).filter(k => f.flags[k]).map(k => FLAG_TXT[k][1].split(':')[0].toLowerCase()),
    f.days !== 'Any' && `${f.days} days off`, f.field !== 'Any' && `${f.field} runners`, (f.bmin || f.bmax) && `BSP ${f.bmin || '1.01'}–${f.bmax || 'any'}`].filter(Boolean).join(', ');
}
function btRun() {
  const B = A.bt, fb = B.sport === 'football', rules = fb ? B.fb : B.rc, key = B.sport + JSON.stringify(rules), isNew = key !== B.lastKey;
  if (isNew) { B.tried++; B.lastKey = key; }
  const bets = fb ? fbBets(rules) : rcBets(rules), comm = fb ? B.fb.comm : B.rc.comm, s = btStats(bets, comm);
  const base = fb && !FB_MARKETS[rules.market][0] ? (() => { const all = fbData().filter(m => rules.league === 'All' || m.lg === rules.league); return all.filter(FB_MARKETS[rules.market][1]).length / all.length; })() : null;
  const priced = s.ex != null && s.n > 0, per1 = priced ? 1 + s.net / s.n : null;
  B.res = { s, last: bets.slice(-8).reverse(), base, fb, comm, marg: B.rc.marg, market: rules.market, per1, splits: priced ? btSplits(bets, comm, s.seen.roi) : [] };
  if (isNew && s.n) {
    B.history = [...(B.history || []).filter(h => h.sport === B.sport), { v: B.tried, sport: B.sport, desc: btDescribe(B.sport, rules), n: s.n, per1, hit: s.w / s.n, unseen: priced ? s.unseen.roi : null }].slice(-8);
  }
}

function curveSVG(c) {
  const W = 600, H = 160, min = Math.min(0, ...c), max = Math.max(0, ...c), y = v => H - 10 - (v - min) / ((max - min) || 1) * (H - 20), x = i => i / ((c.length - 1) || 1) * W;
  const step = Math.max(1, Math.floor(c.length / 300)), pts = c.map((_, i) => i).filter(i => i % step === 0 || i === c.length - 1).map(i => `${x(i).toFixed(1)},${y(c[i]).toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 ${W} ${H}" class="curve" role="img" aria-label="Running profit over time, after commission"><line x1="0" x2="${W}" y1="${y(0)}" y2="${y(0)}" stroke="var(--ln)" stroke-dasharray="4 4"/>`
    + `<polyline points="${pts}" fill="none" stroke="${c[c.length - 1] >= 0 ? 'var(--g)' : 'var(--bad)'}" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
}

/* Result bands: green only when clearly ahead, red only when clearly behind, amber when close. */
const btBand = s => s.lo > 0 ? ['g', 'Ahead'] : s.hi < 0 ? ['bad', 'Behind'] : Math.abs(s.net / s.n) <= 0.03 ? ['amber', 'Close'] : ['mu', 'Not clear yet'];
const roiCls = roi => roi > 0 ? 'g' : roi >= -0.03 ? 'amber' : 'mu';
const pence = per1 => { const p = Math.round((per1 - 1) * 100); return p === 0 ? 'Right on break-even' : p < 0 ? `${-p}p short of break-even` : `${p}p above break-even`; };
const perPound = per1 => `£${per1.toFixed(2)}`;

function btHistory() {
  const H = (A.bt.history || []).filter(h => h.sport === A.bt.sport);
  if (H.length < 2) return '';
  const val = h => h.per1 != null ? h.per1 : h.hit, best = Math.max(...H.map(val));
  return `<div class="card"><h2 style="padding-bottom:6px">Your versions</h2><div class="tbl">` + H.slice().reverse().map((h, i, a) => {
    const prev = a[i + 1], d = prev ? val(h) - val(prev) : 0;
    return `<div class="tr" style="grid-template-columns:44px minmax(0,1fr) auto"><b class="mono mu">v${h.v}</b><span class="sm">${esc(h.desc)}<br><span class="mu">${h.n} bets${h.unseen != null ? ` · unseen games ${perPound(1 + h.unseen)}` : ''}</span></span>`
      + `<span class="r"><b class="mono ${val(h) === best ? 'g' : ''}">${h.per1 != null ? perPound(h.per1) : Math.round(h.hit * 100) + '%'}</b>${prev && Math.abs(d) >= 0.005 ? `<br><span class="sm ${d > 0 ? 'g' : 'mu'}">${d > 0 ? '▲' : '▼'} ${h.per1 != null ? Math.round(Math.abs(d) * 100) + 'p' : Math.round(Math.abs(d) * 100) + ' pts'}</span>` : ''}</span></div>`;
  }).join('') + `</div><p class="sm mu" style="margin-top:8px">${H[0].per1 != null ? 'Back per £1 staked, after commission.' : 'Hit rate.'} Best version in green.</p></div>`;
}

function btResults() {
  const R = A.bt.res;
  if (!R) return `<div class="card mu">Set your rules and press Run test. Every past game or race that fits becomes a 1-point bet.</div>`;
  const s = R.s, tile = (l, v, c = '') => `<div class="card tile"><span class="px">${l}</span><b class="mono ${c}">${v}</b></div>`;
  if (!s.n) return `<div class="card mu">No past bets fit these rules. Loosen one and run it again.</div>`;
  const tiles = `<div class="tiles">${tile('Bets', s.n)}${tile('Won', s.w)}${tile('Strike rate', Math.round(100 * s.w / s.n) + '%')}${R.base != null ? tile('Base rate', Math.round(100 * R.base) + '%') : ''}</div>`;
  const recent = `<div class="card"><h2 style="padding-bottom:6px">Latest bets in the test</h2><div class="tbl">${R.last.map(b => `<div class="tr" style="grid-template-columns:minmax(0,1fr) auto 60px"><span>${b.label}<br><span class="sm mu">${b.sub}</span></span>`
    + `<span class="mono sm">${b.res}${b.ex ? ` · ${b.ex.toFixed(2)}` : ''}</span><b class="${b.won ? 'g' : 'mu'} r">${b.won ? 'Won' : 'Lost'}</b></div>`).join('')}</div></div>`;
  if (s.ex == null) return tiles + `<div class="card" style="gap:6px"><h2>Price needed to break even</h2><p>This system landed ${Math.round(100 * s.w / s.n)}% of the time${R.base != null ? `, against ${Math.round(100 * R.base)}% for every game in the same leagues` : ''}. To break even you'd need an average price of <b class="mono">${(s.n / Math.max(1, s.w)).toFixed(2)}</b> or better.</p>`
    + `<p class="sm mu">There are no past prices for this market, so profit can't be tested. Compare this with the prices bookmakers usually offer for it.</p></div>` + btHistory() + recent;

  /* Once the rules have been tuned, "ahead" only counts if the unseen games agree. */
  let [cls, label] = btBand(s), aheadTxt = 'Ahead even at the low end of the luck range. Next: check it holds up on unseen games.';
  if (cls === 'g' && A.bt.tried > 1) {
    if (s.unseen.n < 30) [cls, label, aheadTxt] = ['amber', 'Ahead, unconfirmed', "Ahead on these games, but you tuned the rules to get here and there aren't enough unseen games to confirm it yet."];
    else if (s.unseen.roi <= 0) [cls, label, aheadTxt] = ['amber', 'Lucky fit', `Ahead on the games you tuned on, but only ${perPound(1 + s.unseen.roi)} per £1 on unseen games, so this is probably a lucky fit. Try a broader rule.`];
    else aheadTxt = `Ahead, and it held up on unseen games (${perPound(1 + s.unseen.roi)} per £1). Keep following it on new games before staking much.`;
  }
  const pos = Math.max(0, Math.min(1, (R.per1 - 0.85) / 0.25)) * 100;
  const verdict = cls === 'g' || label !== btBand(s)[1] ? aheadTxt
    : cls === 'bad' ? (Math.abs(s.net / s.n) <= 0.03 ? 'Just short, and consistently so. One sharper rule could change that: try a split below.' : 'This version lost money, and not by bad luck. Try a split below or a different market.')
    : cls === 'amber' ? 'Close to break-even. Most systems start about here. Try narrowing with one of the splits below.'
    : `Too early to call: the likely range runs from ${pctTxt(s.lo)} to ${pctTxt(s.hi)}. A sharper rule or more bets will tell you more.`;
  const close = `<div class="card closecard" style="gap:10px"><div class="kv" style="align-items:center"><span class="px">After ${R.comm}% commission</span><span class="badge ${cls}">${label}</span></div>`
    + `<div><b class="big mono">${perPound(R.per1)}</b> <span class="mu">back for every £1 staked</span></div><b class="${cls === 'mu' ? '' : cls}">${pence(R.per1)}</b>`
    + `<div class="closebar" role="img" aria-label="${pence(R.per1)}"><i style="left:${pos}%"></i><span style="left:60%"></span></div><div class="kv sm mu"><span>85p</span><span>Break-even £1</span><span>£1.10</span></div><p>${verdict}</p></div>`;

  const exL = R.fb ? 'Sharp closing price (exchange level)' : 'Betfair Starting Price', bkL = R.fb ? 'Typical bookmaker price' : `Bookmaker price (assumed ${R.marg}% worse than BSP)`;
  const row = (l, v) => `<div class="tr" style="grid-template-columns:minmax(0,1fr) 90px 90px"><span>${l}</span><b class="mono r ${roiCls(v / s.n)}">${perPound(1 + v / s.n)}</b><span class="mono r mu">${ptsTxt(v)} pts</span></div>`;
  const table = `<div class="card"><h2 style="padding-bottom:6px">At each price</h2><div class="tbl"><div class="tr th px" style="grid-template-columns:minmax(0,1fr) 90px 90px"><span>Price</span><span class="r">Per £1</span><span class="r">Profit</span></div>`
    + row(exL, s.ex) + row(`${exL} after ${R.comm}% commission`, s.net) + row(bkL, s.bk) + `</div><p class="sm mu" style="margin-top:10px">1-point stakes on every bet. Per £1 is what came back for each £1 staked.</p></div>`;

  const splits = R.splits.length ? `<div class="card" style="gap:8px"><h2>Where it did best</h2><p class="sm mu">Parts of this test that did better than the whole, worked out on the games you tune on only, so the unseen check stays fair.</p><div class="tbl">`
    + R.splits.map(x => `<div class="tr" style="grid-template-columns:minmax(0,1fr) 70px auto"><span><b style="font-weight:600">${x.d}: ${x.v}</b><br><span class="sm mu">${x.n} bets${x.n < 80 ? ' · small sample' : ''}</span></span><b class="mono r ${roiCls(x.roi)}">${perPound(1 + x.roi)}</b>`
      + `<button class="sm" style="min-height:34px" data-a="bttry" data-id="${x.d}|${x.v}">Try this</button></div>`).join('') + `</div></div>` : '';

  const held = s.unseen.n >= 30 && s.seen.roi > 0 ? (s.unseen.roi > 0 ? `<p class="badge good" style="align-self:flex-start">${ico('tick')} Held up on unseen games</p>` : `<p class="sm">It didn't hold up on unseen games, so the tuned result was probably a lucky fit. Try a broader rule.</p>`) : '';
  const deep = `<div class="split"><div class="card" style="gap:8px"><h2>Luck check</h2><p>Likely long-run return after commission: <b class="mono">${pctTxt(s.lo)} to ${pctTxt(s.hi)}</b>.</p>`
    + `<div class="kv"><span class="mu">Worst drop from a high point</span><b class="mono">${s.dd.toFixed(1)} pts</b></div><div class="kv"><span class="mu">Longest losing run</span><b class="mono">${s.worst} bets</b></div></div>`
    + `<div class="card" style="gap:8px"><h2>Unseen games check</h2><p class="sm mu">The ${R.fb ? '2025-26 season' : 'latest fifth of races'} is kept out of sight while you tune. A system that holds up here is the result worth chasing.</p>`
    + `<div class="kv"><span>Games you tuned on <span class="mu sm">(${s.seen.n} bets)</span></span><b class="mono ${roiCls(s.seen.roi)}">${perPound(1 + s.seen.roi)}</b></div>`
    + `<div class="kv"><span>Unseen games <span class="mu sm">(${s.unseen.n} bets)</span></span><b class="mono ${roiCls(s.unseen.roi)}">${perPound(1 + s.unseen.roi)}</b></div>${held}`
    + (A.bt.tried >= 3 ? `<p class="sm mu">You've tried ${A.bt.tried} versions. The more you try, the more likely the best one is a lucky fit, which is exactly what this column catches.</p>` : '') + `</div></div>`
    + `<div class="card"><h2>Running profit, after commission</h2>${curveSVG(s.curve)}</div>`;
  return close + tiles + splits + btHistory() + table + blurred(deep, 'The luck and unseen-games checks') + recent;
}

function fbToday(f) {
  const leagues = Object.keys(FB_LEAGUES);
  return FIXTURES.filter(x => x.status !== 'postponed' && (f.league === 'All' ? leagues.includes(x.comp) : x.comp === f.league)).filter(x => withFixture(x.id, () => {
    const st = (ti, k) => avg(T[ti].groups.flatMap(g => g.stats).find(s => s.key === k).vals.slice(5));
    return atLeast(st(0, 'goals'), f.hgf) && atLeast(st(1, 'conceded'), f.agc) && atLeast(st(0, 'goals') + st(1, 'goals'), f.tg) && atLeast(st(0, 'corners'), f.hc);
  }));
}

function testerPage() {
  const B = A.bt, fb = B.sport === 'football', mine = (A.systems || []).map((s, i) => ({ ...s, i }));
  const controls = fb
    ? btPills('fb.market', Object.keys(FB_MARKETS), 'Market') + btPills('fb.league', ['All', ...Object.keys(FB_LEAGUES)], 'League')
      + `<div class="form">${btNum('fb.hgf', 'Home team scored, last 5 avg, at least')}${btNum('fb.agc', 'Away team conceded, last 5 avg, at least')}${btNum('fb.tg', 'Both teams scored combined, last 5 avg, at least')}${btNum('fb.hc', 'Home corners, last 5 avg, at least')}`
      + (FB_MARKETS[B.fb.market][0] ? `${btNum('fb.pmin', 'Closing price at least')}${btNum('fb.pmax', 'Closing price at most')}${btNum('fb.comm', 'Exchange commission %', '2')}` : '') + `</div>`
    : btPills('rc.market', ['Win', 'Place'], 'Market') + btPills('rc.code', ['All', 'Flat', 'AW', 'Hurdle', 'Chase'], 'Race type') + btPills('rc.type', ['All', 'Handicap', 'Non-handicap'], 'Handicaps')
      + btPills('rc.going', ['All', 'Firm/Good', 'Soft/Heavy', 'Standard (AW)'], 'Going') + btPills('rc.fav', ['Any', 'Favourite', 'Top 3 in the betting'], 'Position in the betting')
      + `<div class="btf"><span class="px">Must have</span><div class="pills">${Object.entries(FLAG_TXT).map(([k, [, t]]) => `<button data-a="btflag" data-id="${k}" class="${B.rc.flags[k] ? 'on' : ''}" aria-pressed="${!!B.rc.flags[k]}" title="${t}">${t.split(':')[0]}</button>`).join('')}</div></div>`
      + btPills('rc.days', ['Any', '30 or less', '31-90', '90+'], 'Days since last run') + btPills('rc.field', ['Any', '8 or fewer', '9-15', '16+'], 'Runners')
      + `<div class="form">${btNum('rc.bmin', 'BSP at least')}${btNum('rc.bmax', 'BSP at most')}${btNum('rc.comm', 'Commission %', '5')}${btNum('rc.marg', 'Bookmaker price worse than BSP by %', '15')}</div>`;
  const saved = mine.filter(s => s.sport === B.sport);
  const sysCard = `<div class="card" style="gap:10px"><h2>Your systems</h2>` + (saved.length ? saved.map(s => {
      const today = s.sport === 'football' ? fbToday(s.rules).map(x => `${x.home} v ${x.away}`) : rcToday(s.rules).map(({ race, x }) => `${x.name} (${race.time} ${race.course})`);
      return `<div class="box" style="display:flex;flex-direction:column;gap:6px"><div class="kv"><b>${esc(s.name)}</b><span><button class="sm" style="min-height:32px" data-a="btload" data-id="${s.i}">Load</button> <button class="sm" style="min-height:32px" data-a="btdel" data-id="${s.i}" aria-label="Delete ${esc(s.name)}">×</button></span></div>`
        + `<span class="sm">${today.length ? `<b class="g">${today.length} today:</b> ${today.slice(0, 4).join(', ')}${today.length > 4 ? '…' : ''}` : '<span class="mu">Nothing fits today.</span>'}</span><span class="sm mu">Price rules are checked at kick-off or the off.</span></div>`;
    }).join('') : `<p class="mu">Save a system to see which of today's ${fb ? 'games' : 'runners'} fit it, and get alerts when they do.</p>`)
    + `<button data-a="btsave" data-id="s" style="align-self:flex-start">Save these rules as a system</button></div>`;
  return pageHead('Backtester <span class="prem">Premium</span>', 'Test a betting system on past games before you stake a penny. Pick your rules, run the test, tweak and run it again.')
    + demo('Demo: sample seasons and races. Results are shown exactly as they come out, good or bad.')
    + `<div class="pills" data-k="btsport">${[['football', 'Football'], ['racing', 'Racing']].map(([k, l]) => `<button data-a="btsport" data-id="${k}" class="${B.sport === k ? 'on' : ''}" aria-pressed="${B.sport === k}">${l}</button>`).join('')}</div>`
    + `<div class="btgrid"><div class="card" style="gap:14px"><h2>Rules</h2>${controls}<button class="btn" data-a="btrun" data-id="r" style="align-self:flex-start">Run test</button></div>`
    + `<div class="btres">${btResults()}</div></div>` + (isPrem() ? sysCard : blurred(sysCard, 'Saved systems and alerts'));
}
