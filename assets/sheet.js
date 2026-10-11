/* ============================================================================
   PIXELTIPSTER MATCH SHEET
   One sheet = one fixture. openFixture(id) loads its DATA, sheetHTML() draws it.
   In the live project the data job writes one DATA object per fixture
   (same shape as fixtureData() returns) and this renderer stays unchanged.

   Team:  { name, code, games, groups:[{ name, stats }], players:[{ name, pos, mins, starts, stats }] }
   Game:  { date, opp, comp, ha:'H'|'A', score }   last 10, oldest first
   Stat:  { key, label, mode, vals, core?, venue?, opp? }
     mode  'over'  count stat, line is x.5 (team stats)
           'plus'  count stat, line is n+ (player stats)
           'yn'    1/0 per game      'form'  'W'/'D'/'L' per game
     vals  one per game, same order as games
     core  shown by default; the rest sit behind "Show more"
     venue per-game average at this venue, opp = what the opponent allows
   Both teams list the same groups and stats in the same order.
   ========================================================================== */
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
let FX = null, DATA, T, S;   // open fixture id, its data, its teams, sheet view state
function openFixture(id) {
  if (FX === id) return;
  FX = id; DATA = fixtureData(id); T = DATA.teams;
  S = { tab: 'Goals', pstat: 'sot', lines: {}, open: {}, more: {}, off: {}, comp: {}, filt: false };
}
/* Run fn against another fixture with no games left out, then put the open sheet back. */
function withFixture(id, fn) {
  const keep = [FX, DATA, T, S];
  FX = null; openFixture(id);
  try { return fn(); } finally { [FX, DATA, T, S] = keep; }
}
const W = matchMedia('(min-width:1000px)'), WM = matchMedia('(min-width:1500px)');   // desktop layout; WM = room for the player matrix
const REG = {};   // line id -> { st, ti }, filled on render so the +/- handler can find the stat
const TABS = ['Goals', 'Result', 'Shots', 'Corners', 'Cards', 'Players', 'Trends'];
const LEGEND = `<div class="sm mu">Last 10 games, oldest first. Green landed, faded is left out.</div>`;

const isCount = st => st.mode === 'over' || st.mode === 'plus';
const sel = ti => T[ti].games.map((g, i) => i).filter(i => !S.off[ti + '.' + i] && !S.comp[T[ti].games[i].comp]);
const pick = (st, ti) => sel(ti).map(i => st.vals[i]);
const baseLine = (st, v) => st.mode === 'over' ? Math.floor(avg(v)) + 0.5 : Math.max(1, Math.round(avg(v)));
const hitFn = (st, line) => st.mode === 'over' ? v => v > line : st.mode === 'plus' ? v => v >= line : st.mode === 'form' ? v => v === 'W' : v => v === 1;
const lineName = (st, line) => st.mode === 'over' ? 'Over ' + line : line + '+';
const lineShort = (st, line) => st.mode === 'over' ? 'O' + line : st.mode === 'plus' ? line + '+' : st.mode === 'form' ? 'Win' : 'Yes';
const lineOf = (id, st, ti) => isCount(st) ? (S.lines[id] ?? baseLine(st, pick(st, ti))) : null;
function rate(st, ti, line) {
  const v = pick(st, ti), f = hitFn(st, line), n = v.filter(f).length, l5 = v.slice(-5), n5 = l5.filter(f).length;
  return { v, f, n, N: v.length, n5, N5: l5.length, pct: v.length ? Math.round(100 * n / v.length) : 0, hot: v.length >= 5 && n / v.length >= 0.8 && n5 >= 4 };
}

/* ---------- rendering ---------- */
const chev = open => `<svg class="tw ${open ? '' : 'cl'}" viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="2,5 7,10 12,5"/></svg>`;
const meter = pct => `<span class="meter"><i style="width:${pct}%"></i></span>`;
const stepper = (id, st, line) => `<span class="step"><button data-a="line" data-id="${id}" data-d="-1" aria-label="Lower the line">-</button><span>${lineShort(st, line)}</span><button data-a="line" data-id="${id}" data-d="1" aria-label="Raise the line">+</button></span>`;

function cell(id, st, ti) {
  const c = rate(st, ti, lineOf(id, st, ti));
  return `<span class="cell ${c.hot ? 'hot' : ''}"><span class="t"><span><span class="mu">${T[ti].code}</span> ${lineShort(st, lineOf(id, st, ti))}</span><b class="mono">${c.n}/${c.N}</b></span>${meter(c.pct)}</span>`;
}

/* Expanded view of one stat for one team. ctx is set for team stats; players share one line, passed as fixed. */
function detail(id, st, ti, ctx, fixed, leg) {
  const count = isCount(st), line = fixed !== undefined ? fixed : lineOf(id, st, ti), c = rate(st, ti, line), on = sel(ti), gs = T[ti].games;
  if (ctx && count) REG[id] = { st, ti };
  let hint = (count ? lineName(st, line) + ' landed' : st.mode === 'form' ? 'Won' : 'Happened') + ` in ${c.n} of ${c.N} selected games and ${c.n5} of the last ${c.N5}.`;
  if (count && st.opp && ctx && c.N) {
    const lean = st.opp / avg(c.v);
    if (lean >= 1.05) hint += ` ${ctx.opp} give up more of these than ${ctx.team} usually get, which leans towards the over.`;
    if (lean <= 0.95) hint += ` ${ctx.opp} give up fewer of these than ${ctx.team} usually get, which leans towards the under.`;
  }
  const kv = (k, v) => `<div class="kv"><span class="mu">${k}</span><span class="mono">${v.toFixed(1)}</span></div>`;
  return `<div style="display:flex;flex-direction:column;gap:8px">`
    + (ctx ? `<div class="kv" style="align-items:center"><b>${ctx.team}</b>${count && !W.matches ? stepper(id, st, line) : ''}</div>` : '')
    + `<div class="chips mono">${st.vals.map((v, i) => `<i class="${!on.includes(i) ? 'x' : c.f(v) ? 'y' : ''}" title="${gs[i].date} ${gs[i].ha === 'H' ? 'v' : '@'} ${gs[i].opp} (${gs[i].comp})">${st.mode === 'yn' ? (v ? 'Y' : 'N') : v}</i>`).join('')}</div>`
    + (count ? kv('Average, selected games', avg(c.v)) + (ctx && st.venue ? kv(ctx.home ? 'At home, per game' : 'Away, per game', st.venue) : '') + (ctx && st.opp ? kv(`${ctx.opp} allow, per game`, st.opp) : '') : '')
    + `<div class="box">${hint}</div>`
    + (leg ? addLegBtn(`${FX}|${leg}|${line}`) : '') + `</div>`;
}

/* Desktop cell: line buttons, last 5 and average sit inline. */
function wcell(id, st, ti) {
  const count = isCount(st), line = lineOf(id, st, ti), c = rate(st, ti, line);
  if (count) REG[id] = { st, ti };
  return `<div class="cell ${c.hot ? 'hot' : ''}"><span class="wt">${count ? stepper(id, st, line) : `<span class="mu">${lineShort(st, line)}</span>`}`
    + `<span class="r mu mono">${count ? avg(c.v).toFixed(1) : '-'}</span><span class="r mu mono">${c.n5}/${c.N5}</span><b class="r mono">${c.n}/${c.N}</b></span>${meter(c.pct)}</div>`;
}

function teamRow(gi, si) {
  const id = `t${gi}.${si}`, open = !!S.open[id], sts = [0, 1].map(ti => T[ti].groups[gi].stats[si]);
  const toggle = inner => `<button class="rh" data-a="open" data-id="${id}" aria-expanded="${open}"><span class="lab">${chev(open)}${sts[0].label}</span>${inner}</button>`;
  return `<div class="row">` + (W.matches
      ? `<div class="wrow">${toggle('')}${sts.map((st, ti) => wcell(`${id}.${ti}`, st, ti)).join('')}</div>`
      : toggle(`<span class="cells">${sts.map((st, ti) => cell(`${id}.${ti}`, st, ti)).join('')}</span>`))
    + (open ? `<div class="det fade">${LEGEND}<div class="pair">${sts.map((st, ti) => detail(`${id}.${ti}`, st, ti, { team: T[ti].name, opp: T[1 - ti].name, home: ti === 0 }, undefined, `t|${gi}|${si}|${ti}`)).join('')}</div></div>` : '') + `</div>`;
}

function marketTab(name) {
  const gi = T[0].groups.findIndex(g => g.name === name), stats = T[0].groups[gi].stats, more = !!S.more[name];
  const hidden = stats.filter(s => !s.core).length;
  return `<div class="card mcard" style="padding-top:4px">${W.matches ? `<h2 style="padding-top:10px">${name}</h2>` +`<div class="wrow whd px mu"><span>Stat</span>${T.map(t => `<span class="wt"><span>${t.name}</span><span class="r">Avg</span><span class="r">L5</span><span class="r">Hits</span></span>`).join('')}</div>` : ''}${stats.map((st, si) => more || st.core ? teamRow(gi, si) : '').join('')}`
    + (hidden ? `<button data-a="more" data-id="${name}" style="margin-top:8px;font-weight:600;font-size:14px">${more ? 'Show fewer' : `Show ${hidden} more`}</button>` : '') + `</div>`
    + (name === 'Cards' && !W.matches ? `<div class="card"><h2>Referee</h2><div>${DATA.fixture.refLine}</div></div>` : '');
}

/* Players: pick a stat, every player ranked at one shared line. */
/* Desktop players: every player against every stat, one line per stat, click a heading to sort. */
function playersMatrix() {
  const all = T.flatMap((t, ti) => t.players.map((p, pi) => ({ p, ti, pi }))), keys = T[0].players[0].stats.filter(s => S.more.players || s.core), lines = {};
  const of = (r, k) => r.p.stats.find(x => x.key === k), share = c => c.N ? c.n / c.N : 0;
  keys.forEach(s => { const id = 'p.' + s.key; lines[s.key] = isCount(s) ? (S.lines[id] ?? 1) : null; REG[id] = { st: { mode: s.mode, vals: all.flatMap(r => of(r, s.key).vals) }, ti: null }; });
  all.forEach(r => r.c = Object.fromEntries(keys.map(s => [s.key, rate(of(r, s.key), r.ti, lines[s.key])])));
  const sk = keys.some(s => s.key === S.pstat) ? S.pstat : keys[0].key, cols = `style="--n:${keys.length}"`;
  all.sort((a, b) => share(b.c[sk]) - share(a.c[sk]));
  return `<div class="card"><div class="kv" style="align-items:center;padding-bottom:6px"><span class="sm mu">Click a stat heading to sort by it. Use - and + to set that stat's line for every player. Click a player for game-by-game numbers.</span>`
    + `<button data-a="more" data-id="players" style="flex:none;font-size:14px;font-weight:600">${S.more.players ? 'Main stats only' : 'All stats'}</button></div><div class="mxwrap">`
    + `<div class="mx hd" ${cols}><span class="px mu">Player</span><span class="px mu">Team</span><span class="px mu r">Mins</span>${keys.map(s => `<span style="display:flex;flex-direction:column;gap:4px;align-items:center"><button class="sorter sm ${s.key === sk ? 'on' : ''}" data-a="pstat" data-id="${s.key}" aria-pressed="${s.key === sk}">${s.label}</button>${isCount(s) ? stepper('p.' + s.key, s, lines[s.key]) : '<span class="sm mu">Yes</span>'}</span>`).join('')}</div>`
    + all.map(r => {
      const rid = `x${r.ti}.${r.pi}`, open = !!S.open[rid], st = of(r, sk);
      return `<div class="row"><button class="rh mx" ${cols} data-a="open" data-id="${rid}" aria-expanded="${open}"><span class="lab">${chev(open)}${r.p.name}</span><span class="sm mu">${T[r.ti].code} · ${r.p.pos}</span><span class="mono r mu">${r.p.mins}</span>`
        + keys.map(s => { const c = r.c[s.key]; return `<span class="hc mono ${c.hot ? 'hot' : ''}" style="${c.hot ? '' : `background:rgba(var(--g-rgb),${(c.pct / 330).toFixed(2)})`}"><b>${c.n}/${c.N}</b></span>`; }).join('') + `</button>`
        + (open ? `<div class="det fade" style="padding-left:20px">${LEGEND}<b>${st.label}, ${lineShort(st, lines[sk])}</b>${detail(rid, st, r.ti, null, lines[sk], `p|${r.ti}|${r.pi}|${sk}`)}</div>` : '') + `</div>`;
    }).join('') + `</div></div>`;
}

function playersTab() {
  if (WM.matches) return playersMatrix();
  const key = S.pstat, id = 'p.' + key, rows = [];
  T.forEach((t, ti) => t.players.forEach((p, pi) => rows.push({ p, ti, pi, st: p.stats.find(s => s.key === key) })));
  const st0 = rows[0].st, count = isCount(st0), line = count ? (S.lines[id] ?? 1) : null;
  REG[id] = { st: { mode: st0.mode, vals: rows.flatMap(r => r.st.vals) }, ti: null };
  rows.forEach(r => { r.c = rate(r.st, r.ti, line); r.a = avg(r.c.v); });
  rows.sort((a, b) => b.c.n / (b.c.N || 1) - a.c.n / (a.c.N || 1) || b.a - a.a);
  return `<div class="pills" data-k="pstat">${T[0].players[0].stats.map(s => `<button data-a="pstat" data-id="${s.key}" class="${s.key === key ? 'on' : ''}">${s.label}</button>`).join('')}</div>`
    + `<div class="card" style="padding-top:4px"><div class="kv" style="align-items:center;padding:8px 0"><span>${count ? 'Line for every player' : 'Counts as a hit if it happened'}</span>${count ? stepper(id, st0, line) : ''}</div>`
    + (W.matches ? `<div class="prow whd px mu"><span>Player</span><span>Team</span><span class="r">Avg</span><span class="r">L5</span><span>Hits</span><span class="r">Mins</span></div>` : '')
    + rows.map(r => {
      const rid = `p${r.ti}.${r.pi}.${key}`, open = !!S.open[rid], tag = `${T[r.ti].code} · ${r.p.pos}`;
      return `<div class="row"><button class="rh ${W.matches ? 'prow' : ''} ${r.c.hot ? 'hot' : ''}" data-a="open" data-id="${rid}" aria-expanded="${open}">` + (W.matches
          ? `<span class="lab">${chev(open)}${r.p.name}</span><span class="sm mu">${tag}</span><span class="mono r">${count ? r.a.toFixed(1) : '-'}</span><span class="mono r">${r.c.n5}/${r.c.N5}</span><span class="hits"><b class="mono">${r.c.n}/${r.c.N}</b>${meter(r.c.pct)}</span><span class="mono r mu">${r.p.mins}</span>`
          : `<span class="lab">${chev(open)}<span style="flex:1">${r.p.name} <span class="mu sm" style="font-weight:400">${tag}</span></span><b class="mono">${r.c.n}/${r.c.N}</b></span>${meter(r.c.pct)}`) + `</button>`
        + (open ? `<div class="det fade">${LEGEND}${detail(rid, r.st, r.ti, null, line, `p|${r.ti}|${r.pi}|${key}`)}<div class="sm mu">${r.p.mins} minutes a game · started ${r.p.starts} of the last 10</div></div>` : '') + `</div>`;
    }).join('') + `</div>`;
}

const notesTab = () => `<div class="mu">Recent changes in roles, shape and partnerships that the 10-game numbers can hide.</div><div class="notes">`
  + (DATA.notes.length ? '' : `<div class="card mu">No trend notes for this game yet. Trends are written for the biggest games.</div>`)
  + DATA.notes.map(n => `<div class="card" style="gap:8px"><span class="tag">${n.tag}</span><h2>${n.title}</h2><div>${n.body}</div><div class="box"><div class="px mu">Lines this touches</div>${n.touch}</div></div>`).join('') + `</div>`;

/* Games filter: leave out a competition or single games from every hit rate. */
const gamesBtn = () => `<button data-a="filt" data-id="f" aria-expanded="${S.filt}" style="display:flex;justify-content:space-between;align-items:center;font-size:14px"><span>Games used: <b class="mono">${sel(0).length + sel(1).length}/20</b>${Object.values(S.off).some(Boolean) || Object.values(S.comp).some(Boolean) ? ' · filtered' : ' · all'}</span>${chev(S.filt)}</button>`;
function gamesPanel() {
  const comps = [...new Set(T.flatMap(t => t.games.map(g => g.comp)))];
  return `<div class="card fade" style="gap:12px"><div class="sm mu">Leave out a competition or a single game, such as a freak result or a cup tie against a weak side. Every hit rate updates.</div>`
    + `<div class="pills" style="flex-wrap:wrap;margin:0;padding:0">${comps.map(c => `<button data-a="comp" data-id="${c}" class="${S.comp[c] ? '' : 'on'}" aria-pressed="${!S.comp[c]}">${c}</button>`).join('')}</div>`
    + T.map((t, ti) => `<div><div class="px mu">${t.name}, newest first</div>` + t.games.map((g, i) => [g, i]).reverse().map(([g, i]) => {
      const out = S.off[ti + '.' + i] || S.comp[g.comp];
      return `<button class="gm ${out ? 'x' : ''}" data-a="game" data-id="${ti}.${i}" aria-pressed="${!out}"><span>${g.date} · ${g.ha === 'H' ? 'v' : '@'} ${g.opp}</span><span class="mono">${g.score} · ${g.comp}</span></button>`;
    }).join('') + `</div>`).join('')
    + `<button data-a="reset" data-id="r">Use all games</button></div>`;
}

/* Strongest lines: for each stat, the highest line near its average that landed in 80%+ of selected games and 4 of the last 5. */
function strongest(all) {
  const out = [];
  const best = (st, ti) => { const b = baseLine(st, pick(st, ti)); return [b + 1, b, b - 1].filter(l => l > 0).map(l => ({ l, ...rate(st, ti, l) })).find(x => x.hot); };
  T.forEach((t, ti) => {
    t.groups.forEach(g => g.stats.filter(st => st.opp).forEach(st => { const b = best(st, ti); if (b) out.push({ who: t.name, text: `${t.name}: ${lineName(st, b.l).toLowerCase()} ${st.label.toLowerCase()}`, ...b, team: 1 }); }));
    t.players.forEach(p => p.stats.filter(st => st.core && isCount(st)).forEach(st => { const b = best(st, ti); if (b) out.push({ who: p.name, text: `${p.name} ${lineName(st, b.l)} ${st.label.toLowerCase()}`, ...b, team: 0 }); }));
  });
  const seen = {}, by = (a, b) => b.n / b.N - a.n / a.N || b.n5 - a.n5;
  if (all) return out.sort(by);
  return out.sort((a, b) => a.team - b.team || by(a, b)).filter(x => !seen[x.who] && (seen[x.who] = 1)).slice(0, 6).sort(by);
}

/* The sheet page. app.js puts it inside the site shell and calls it on every render. */
function sheetHTML() {
  const f = DATA.fixture, top = strongest(), hasP = T[0].players.length > 0;
  const wide = W.matches, tab = wide && TABS.slice(0, 5).includes(S.tab) ? 'Teams' : !wide && S.tab === 'Teams' ? 'Goals' : S.tab;
  const note = `<div class="note">Sample data. Every number on this sheet is made up for the demo.</div>`;
  const title = `<div><a class="back sm" href="#/">← All fixtures</a><div class="px" style="margin-top:4px">${f.meta}</div><h1>${f.name}</h1></div>`;
  const head = `<div class="card strong"><h2>Strongest lines</h2>
       ${top.length ? top.map(x => `<div class="kv"><span>${x.text}</span><span class="mono g" style="flex:none">${x.n}/${x.N}</span></div>`).join('') : `<div class="mu sm">No line landed in 80% of the selected games.</div>`}
       <div class="sm mu" style="padding-top:8px">Landed in at least 80% of the selected games and 4 of the last 5.</div></div>`;
  const list = (wide ? ['Teams', 'Players', 'Trends'] : TABS).filter(t => hasP || t !== 'Players');
  const tabs = `<div class="pills" data-k="tabs">${list.map(t => `<button data-a="tab" data-id="${t}" class="${tab === t ? 'on' : ''}">${t}</button>`).join('')}</div>`;
  const body = (tab === 'Trends' ? notesTab() : tab === 'Players' && hasP ? playersTab() : tab === 'Teams' ? `<div class="mgrid">${T[0].groups.map(g => marketTab(g.name)).join('')}</div>` : marketTab(tab === 'Players' ? 'Goals' : tab))
    + (hasP ? '' : `<div class="sm mu">Player stats are added when the line-ups are confirmed.</div>`)
    + `<div class="sm mu">${wide ? 'Click' : 'Tap'} any stat for the game-by-game numbers${wide ? '' : ' and to move the line'}. Hit rates describe past games. They are not predictions or a promise of profit.</div>`;
  return wide
    ? `<div class="sheet wide"><header class="dhead">${title}${tabs}</header><aside class="side">${note}${head}<div class="card"><h2>Referee</h2><div>${f.refLine}</div></div>`
      + `<h2>Games used <span class="mono">${sel(0).length + sel(1).length}/20</span></h2>${gamesPanel()}</aside><section class="smain">${body}</section></div>`
    : `<div class="sheet">${note}${title}${head}<div class="top">${tabs}${tab === 'Trends' ? '' : gamesBtn()}</div>${tab !== 'Trends' && S.filt ? gamesPanel() : ''}${body}</div>`;
}

/* Sheet clicks. Returns true when it handled the action. */
function sheetAction(a, id, d) {
  if (a === 'tab') S.tab = id;
  else if (a === 'pstat') S.pstat = id;
  else if (a === 'open') S.open[id] = !S.open[id];
  else if (a === 'more') S.more[id] = !S.more[id];
  else if (a === 'filt') S.filt = !S.filt;
  else if (a === 'comp') S.comp[id] = !S.comp[id];
  else if (a === 'game') S.off[id] = !S.off[id];
  else if (a === 'reset') { S.off = {}; S.comp = {}; }
  else if (a === 'line') {
    const { st, ti } = REG[id], step = st.mode === 'over' ? 0.5 : 1, max = Math.max(...st.vals) + step;
    const cur = S.lines[id] ?? (ti === null ? 1 : baseLine(st, pick(st, ti)));
    S.lines[id] = Math.min(max, Math.max(step, cur + +d));
  } else return false;
  return true;
}
