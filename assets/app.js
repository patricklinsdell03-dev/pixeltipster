/* ============================================================================
   PIXELTIPSTER SITE
   Hash routes (#/finder, #/match/liv-mci ...), the site bars, and every page
   except the match sheet itself (sheet.js). Bet check legs, tracker bets,
   alert choices and the theme are saved in this browser only.
   ========================================================================== */
const store = {
  get: (k, d) => { try { const v = localStorage.getItem('pt.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem('pt.' + k, JSON.stringify(v)); } catch {} }
};
const A = {
  slip: store.get('slip', []), bets: store.get('bets', null),
  alerts: store.get('alerts', { lineups: true, refs: true, trends: false, finder: false, tg: true, email: false }),
  comp: 'All', fcomp: 'All', fmin: 80, fkind: 'all', otab: 'signup'
};
const save = () => { store.set('slip', A.slip); store.set('bets', A.bets); store.set('alerts', A.alerts); };

const ICONS = {
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  check: '<rect x="4" y="4" width="16" height="17" rx="2"/><path d="m9 12 2 2 4-4"/>',
  chart: '<path d="M3 20h18M7 16v-4M12 16V7M17 16v-6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  tick: '<path d="m5 12 5 5 9-10"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  star: '<path d="m12 3 2.8 5.8 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.3l1.1-6.2L3 9.7l6.2-.9z"/>'
};
const ico = n => `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;

/* ---------- Shell ---------- */
const NAV = [['', 'Fixtures'], ['finder', 'Line finder'], ['check', 'Check my bet'], ['tracker', 'Bet tracker'], ['offers', 'Offers'], ['alerts', 'Alerts']];
const BNAV = [['', 'Fixtures', 'cal'], ['finder', 'Finder', 'search'], ['check', 'My bet', 'check'], ['tracker', 'Tracker', 'chart'], ['more', 'More', 'menu']];
const TITLES = { '': 'Fixtures', finder: 'Line finder', check: 'Check my bet', tracker: 'Bet tracker', offers: 'Offers', alerts: 'Alerts', premium: 'Premium', safer: 'Safer gambling', more: 'More' };
const route = () => { const [p = '', id] = location.hash.replace(/^#\/?/, '').split('/'); return { p, id }; };
const navOn = (k, p) => k === p || (k === '' && p === 'match') || (k === 'more' && ['offers', 'alerts', 'premium', 'safer'].includes(p));
const cur = (k, p) => navOn(k, p) ? ' class="on" aria-current="page"' : '';
const isDark = () => document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches;
const slipCount = () => A.slip.length ? `<span class="count">${A.slip.length}</span>` : '';

const topBar = p => `<header class="site-top"><div class="in"><a class="logo" href="#/" aria-label="Pixeltipster home">PIXEL<span>TIPSTER</span></a>`
  + `<nav class="nav" aria-label="Main">${NAV.map(([k, l]) => `<a href="#/${k}"${cur(k, p)}>${l}${k === 'check' ? slipCount() : ''}</a>`).join('')}</nav>`
  + `<div class="top-r"><button class="icon ghost" data-a="theme" data-id="t" aria-label="Switch to ${isDark() ? 'light' : 'dark'} mode">${ico(isDark() ? 'sun' : 'moon')}</button>`
  + `<a class="btn hide-m" href="#/premium">${ico('star')}Go Premium</a></div></div></header>`;
const bottomNav = p => `<nav class="bnav" aria-label="Main">${BNAV.map(([k, l, i]) => `<a href="#/${k}"${cur(k, p)} style="position:relative">${ico(i)}${l}${k === 'check' ? slipCount() : ''}</a>`).join('')}</nav>`;
const footer = () => `<footer class="foot"><div><b>18+</b> · Please gamble responsibly · <a href="#/safer">Safer gambling</a> · <a href="https://www.begambleaware.org" target="_blank" rel="noopener">BeGambleAware.org</a></div>`
  + `<div class="mu sm">Pixeltipster publishes statistics about past matches. We don't take bets, give tips or predict results. This demo uses sample data.</div></footer>`;
const pageHead = (title, sub, extra = '') => `<div class="head"><div><h1>${title}</h1>${sub ? `<p class="mu" style="margin-top:6px">${sub}</p>` : ''}</div>${extra}</div>`;
const demo = txt => `<div class="note">${txt}</div>`;
const pill = (k, v, l) => `<button data-a="${k}" data-id="${v}" class="${A[k] == v ? 'on' : ''}" aria-pressed="${A[k] == v}">${l}</button>`;

/* ---------- Fixtures ---------- */
function fixturesPage() {
  const comps = ['All', ...new Set(FIXTURES.map(f => f.comp))], list = FIXTURES.filter(f => A.comp === 'All' || f.comp === A.comp);
  return `<section class="card hero"><div><h1>Stat sheets for every bet builder</h1><p class="mu">Hit rates from each team's and player's recent games, grouped the way bookmakers group their bet builder markets. Facts about past games, never tips.</p>`
    + `<div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap"><a class="btn" href="#/match/liv-mci">See an example sheet</a><a class="btn btn2" href="#/premium">Free vs Premium</a></div></div>`
    + `<ul class="trust">${['Every number links to the games behind it', 'Leave out cup games or freak results', 'No odds, no tips, no predictions', '3 free sheets a week, no card needed'].map(t => `<li>${ico('tick')}${t}</li>`).join('')}</ul></section>`
    + demo('Demo: fixtures and numbers are sample data until the live feed is connected.')
    + `<div class="pills" data-k="fxcomp">${comps.map(c => `<button data-a="fxcomp" data-id="${c}" class="${A.comp === c ? 'on' : ''}" aria-pressed="${A.comp === c}">${c}</button>`).join('')}</div>`
    + [...new Set(list.map(f => f.date))].map(d => `<section><h2>${fmtDate(d)}</h2><div class="fxgrid">${list.filter(f => f.date === d).map(f =>
      `<a class="card fx" href="#/match/${f.id}"><span class="px">${f.comp} · ${f.ko}</span><span class="fxt"><b>${f.home}</b><span class="mu">v</span><b>${f.away}</b></span>`
      + `<span class="sm mu">${f.full ? 'Team, player and trend stats' : 'Team stats now · players at line-ups'}</span><span class="go">Open sheet ${ico('arrow')}</span></a>`).join('')}</div></section>`).join('');
}

function matchPage(id) {
  openFixture(FIXTURES.some(f => f.id === id) ? id : FIXTURES[0].id);
  return sheetHTML();
}

/* ---------- Line finder ---------- */
function finderPage() {
  const rows = [], comps = ['All', ...new Set(FIXTURES.map(f => f.comp))];
  FIXTURES.forEach(f => withFixture(f.id, () => strongest(true).forEach(x => rows.push({ ...x, f }))));
  const list = rows.filter(x => (A.fcomp === 'All' || x.f.comp === A.fcomp) && 100 * x.n / x.N >= A.fmin && (A.fkind === 'all' || (A.fkind === 'team') === !!x.team))
    .sort((a, b) => b.n / b.N - a.n / a.N || b.n5 - a.n5), cols = 'grid-template-columns:minmax(0,1fr) 64px 56px';
  return pageHead('Line finder <span class="prem">Premium</span>', 'The lines that landed most often across every fixture on the site, best first. Open any line to see the games behind it.')
    + demo('Demo: sample data. Free to use while the site is in testing.')
    + `<div class="card" style="gap:12px"><div class="pills" data-k="fcomp">${comps.map(c => pill('fcomp', c, c)).join('')}</div>`
    + `<div style="display:flex;gap:16px;flex-wrap:wrap"><div class="pills">${[80, 90, 100].map(v => pill('fmin', v, `Landed ${v}%${v < 100 ? '+' : ''}`)).join('')}</div>`
    + `<div class="pills">${[['all', 'All lines'], ['team', 'Team'], ['player', 'Player']].map(([v, l]) => pill('fkind', v, l)).join('')}</div></div></div>`
    + `<div class="card"><div class="tbl"><div class="tr th px" style="${cols}"><span>${list.length} lines</span><span class="r">Hits</span><span class="r">Last 5</span></div>`
    + (list.length ? list.map(x => `<a class="tr" style="${cols}" href="#/match/${x.f.id}"><span><b style="font-weight:600">${x.text}</b><br><span class="sm mu">${x.f.home} v ${x.f.away} · ${x.f.comp} · ${fmtDate(x.f.date)}</span></span>`
      + `<b class="mono g r">${x.n}/${x.N}</b><span class="mono r mu">${x.n5}/${x.N5}</span></a>`).join('') : `<div class="tr mu">No lines match these filters.</div>`) + `</div></div>`;
}

/* ---------- Check my bet ---------- */
const addLegBtn = spec => A.slip.includes(spec)
  ? `<button class="addleg done ghost" data-a="addleg" data-id="${spec}">${ico('tick')} In your bet check</button>`
  : `<button class="addleg ghost" data-a="addleg" data-id="${spec}">+ Add to bet check</button>`;
/* spec = fixture|t|group|stat|team|line or fixture|p|team|player|statKey|line */
function legInfo(spec) {
  const [fx, kind, a, b, c, ln] = spec.split('|'), line = ln === 'null' ? null : +ln;
  return withFixture(fx, () => {
    const t = kind === 't', ti = t ? +c : +a, st = t ? T[ti].groups[+a].stats[+b] : T[ti].players[+b].stats.find(s => s.key === c);
    const who = t ? T[ti].name : T[ti].players[+b].name;
    return { spec, fx, ti, st, team: T[ti].name, match: DATA.fixture.name, r: rate(st, ti, line), text: `${who}: ${isCount(st) ? lineName(st, line).toLowerCase() + ' ' : ''}${st.label.toLowerCase()}` };
  });
}
function checkPage() {
  const legs = A.slip.map(legInfo), groups = {};
  legs.forEach(l => (groups[l.fx + '|' + l.ti] ??= []).push(l));
  const clashes = legs.filter(l => l.st.key === 'cs' && legs.some(m => m.fx === l.fx && (m.st.key === 'btts' || (m.ti === l.ti && m.st.key === 'conceded') || (m.ti !== l.ti && m.st.key === 'goals'))))
    .map(l => `"${l.text}" can't land in the same game as a leg that needs ${l.team}'s opponents to score.`);
  const together = Object.values(groups).filter(g => g.length > 1).map(g => {
    const n = [...Array(10).keys()].filter(i => g.every(l => l.r.f(l.st.vals[i]))).length;
    return `<div class="box" style="display:flex;flex-direction:column;gap:6px"><span>All ${g.length} ${g[0].team} legs landed together in <b class="mono">${n}/10</b> of their last 10 games.</span><span class="meter"><i style="width:${n * 10}%;background:var(--g);opacity:1"></i></span></div>`;
  });
  const cols = 'grid-template-columns:minmax(0,1fr) 56px 44px';
  return pageHead('Check my bet <span class="prem">Premium</span>', 'Add legs from any sheet to see how often each one landed, and how often they landed together.', legs.length ? `<button data-a="clearslip" data-id="c">Clear all legs</button>` : '')
    + demo('Demo: sample data. Your legs are saved in this browser only.')
    + (!legs.length ? `<div class="card" style="gap:12px;align-items:flex-start"><h2>No legs yet</h2><p class="mu">Open a sheet, tap any stat and choose "Add to bet check".</p><div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn" href="#/">Browse fixtures</a><button data-a="demolegs" data-id="d">Try an example</button></div></div>`
      : `<div class="split"><div class="card"><h2 style="padding-bottom:6px">Each leg on its own</h2><div class="tbl">${legs.map(l => `<div class="tr" style="${cols}"><span><b style="font-weight:600">${l.text}</b><br><span class="sm mu">${l.match} · last 10 games</span>`
        + `<span class="meter ${l.r.hot ? 'hot' : ''}" style="margin-top:6px;display:block"><i style="width:${l.r.pct}%"></i></span></span><b class="mono r ${l.r.hot ? 'g' : ''}">${l.r.n}/${l.r.N}</b><button class="icon ghost" data-a="rmleg" data-id="${l.spec}" aria-label="Remove this leg">×</button></div>`).join('')}</div></div>`
        + `<div style="display:flex;flex-direction:column;gap:20px">${clashes.length ? `<div class="card" style="gap:8px;border-color:var(--bad)"><h2 class="bad">Clash found</h2>${clashes.map(c => `<p>${c}</p>`).join('')}</div>` : ''}`
        + `<div class="card" style="gap:10px"><h2>Landed together</h2>${together.join('') || `<p class="mu">Add two or more legs on the same team to see how often they landed in the same game.</p>`}`
        + `<p class="sm mu">Legs on different teams can't be combined this way, because each team's last 10 games are different matches.</p></div></div></div>`);
}

/* ---------- Bet tracker ---------- */
const SAMPLE_BETS = [
  ['2026-10-04', 'Bookmaker A', 'Bet builder', 5, 6.5, 'Lost'], ['2026-10-04', 'Bookmaker B', 'Acca', 2, 14, 'Lost'], ['2026-10-03', 'Bookmaker A', 'Single', 10, 1.9, 'Won'],
  ['2026-09-28', 'Bookmaker C', 'Lucky 15', 7.5, 3.2, 'Won'], ['2026-09-27', 'Bookmaker A', 'Bet builder', 5, 4.33, 'Won'], ['2026-09-27', 'Bookmaker B', 'Acca', 2, 22, 'Lost'],
  ['2026-09-21', 'Bookmaker C', 'Single', 10, 2.1, 'Lost'], ['2026-09-20', 'Bookmaker A', 'Bet builder', 5, 8, 'Lost'], ['2026-09-20', 'Bookmaker B', 'Single', 10, 1.8, 'Won'],
  ['2026-09-14', 'Bookmaker C', 'Lucky 15', 7.5, 2, 'Lost']
].map(([date, bk, type, stake, odds, res]) => ({ date, bk, type, stake, odds, res }));
const START = { 'Bookmaker A': 50, 'Bookmaker B': 40, 'Bookmaker C': 60 };   // sample starting balances
const TYPES = ['Bet builder', 'Single', 'Acca', 'Lucky 15', 'Other'];
const back = b => b.res === 'Won' ? b.stake * b.odds : b.res === 'Void' ? b.stake : 0;
const money = v => (v < 0 ? '-£' : '£') + Math.abs(v).toFixed(2);
function trackerPage() {
  const sample = A.bets === null, bets = sample ? SAMPLE_BETS : A.bets, done = bets.filter(b => b.res !== 'Pending');
  const staked = done.reduce((s, b) => s + b.stake, 0), returned = done.reduce((s, b) => s + back(b), 0), pl = returned - staked;
  const by = k => { const m = {}; done.forEach(b => { const x = m[b[k]] ??= { n: 0, pl: 0 }; x.n++; x.pl += back(b) - b.stake; }); return Object.entries(m).sort((a, b) => a[1].pl - b[1].pl); };
  const types = by('type'), books = by('bk'), top = Math.max(1, ...types.map(([, x]) => Math.abs(x.pl)));
  const tile = (l, v, c = '') => `<div class="card tile"><span class="px">${l}</span><b class="mono ${c}">${v}</b></div>`;
  const hc = 'grid-template-columns:90px minmax(0,1fr) 90px 60px 60px 64px 76px';
  return pageHead('Bet tracker <span class="prem">Premium</span>', 'Log your bets to see your balance at each bookmaker and which kinds of bet cost you money.')
    + demo(sample ? 'Demo: these are sample bets. Adding your first bet clears them. Bets are saved in this browser only.' : 'Your bets are saved in this browser only.')
    + `<div class="tiles">${tile('Staked', money(staked))}${tile('Returned', money(returned))}${tile('Profit or loss', money(pl), pl < 0 ? 'bad' : 'g')}${tile('Bets settled', done.length)}</div>`
    + `<div class="split"><div class="card" style="gap:10px"><h2>By bet type</h2>${types[0] && types[0][1].pl < 0 ? `<p class="mu">${types[0][0]} bets have cost you the most: ${money(types[0][1].pl)} over ${types[0][1].n} bets.</p>` : ''}`
    + types.map(([t, x]) => `<div style="display:flex;flex-direction:column;gap:4px"><div class="kv"><span>${t} <span class="mu sm">· ${x.n} bets</span></span><b class="mono ${x.pl < 0 ? 'bad' : 'g'}">${money(x.pl)}</b></div><div class="bar2"><i style="width:${Math.abs(x.pl) / top * 100}%;background:var(--${x.pl < 0 ? 'bad' : 'g'})"></i></div></div>`).join('') + `</div>`
    + `<div class="card"><h2 style="padding-bottom:6px">Bookmaker balances</h2><div class="tbl"><div class="tr th px" style="grid-template-columns:minmax(0,1fr) 80px 80px 80px"><span>Bookmaker</span><span class="r">Start</span><span class="r">P/L</span><span class="r">Balance</span></div>`
    + books.map(([k, x]) => `<div class="tr mono" style="grid-template-columns:minmax(0,1fr) 80px 80px 80px"><span style="font-family:'IBM Plex Sans'">${k}</span><span class="r mu">${money(START[k] || 0)}</span><span class="r ${x.pl < 0 ? 'bad' : 'g'}">${money(x.pl)}</span><b class="r">${money((START[k] || 0) + x.pl)}</b></div>`).join('') + `</div></div></div>`
    + `<div class="card" style="gap:12px"><h2>Add a bet</h2><div class="form"><label>Date<input id="nb-date" type="date" value="2026-10-11"></label><label>Bookmaker<input id="nb-bk" placeholder="e.g. Bookmaker A"></label>`
    + `<label>Type<select id="nb-type">${TYPES.map(t => `<option>${t}</option>`).join('')}</select></label><label>Stake (£)<input id="nb-stake" type="number" min="0" step="0.5" inputmode="decimal"></label>`
    + `<label>Odds (decimal)<input id="nb-odds" type="number" min="1" step="0.01" inputmode="decimal"></label><label>Result<select id="nb-res">${['Pending', 'Won', 'Lost', 'Void'].map(t => `<option>${t}</option>`).join('')}</select></label>`
    + `<button class="btn" data-a="addbet" data-id="b">Add bet</button></div></div>`
    + `<div class="card"><div class="head" style="padding-bottom:6px"><h2>Your bets</h2>${sample ? `<button data-a="clearbets" data-id="x">Clear sample bets</button>` : bets.length ? '' : `<button data-a="samplebets" data-id="s">Show sample bets</button>`}</div><div class="mxwrap"><div class="tbl" style="min-width:640px">`
    + `<div class="tr th px" style="${hc}"><span>Date</span><span>Bookmaker</span><span>Type</span><span class="r">Stake</span><span class="r">Odds</span><span>Result</span><span class="r">Return</span></div>`
    + (bets.map(b => `<div class="tr" style="${hc}"><span class="mono sm">${b.date.slice(5).split('-').reverse().join('/')}</span><span>${b.bk}</span><span>${b.type}</span><span class="mono r">${money(b.stake)}</span><span class="mono r">${b.odds ? b.odds.toFixed(2) : '-'}</span>`
      + `<span class="${b.res === 'Won' ? 'g' : b.res === 'Lost' ? 'bad' : 'mu'}">${b.res}</span><span class="mono r">${b.res === 'Pending' ? '-' : money(back(b))}</span></div>`).join('') || `<div class="tr mu">No bets yet.</div>`) + `</div></div></div>`;
}

/* ---------- Offers ---------- */
const OFFERS = {
  signup: ['Sign-up offers', ['Offer', 'Min odds', 'Key terms'], [['Bet £10, get £30 in free bets', '1/2', 'Free bets expire after 7 days'], ['Bet £5, get £20 in free bets', 'Evens', 'Paid after the bet settles'], ['Bet £10, get £40 in bonuses', '2/1', 'Split across bet types'], ['£20 back if your first bet loses', 'Evens', 'Refund paid as a free bet'], ['Bet £25, get £25 in free bets', '4/5', 'Paid in 5 x £5 free bets'], ['Bet £10, get £20 in free bets', '1/2', 'Football only']]],
  lucky15: ['Lucky 15 bonuses', ['One winner', 'All four win', 'Applies to'], [['Double odds', '10% bonus', 'Horse racing'], ['Treble odds', '20% bonus', 'UK and Irish racing'], ['Double odds', '25% bonus', 'Racing and football'], ['Double odds', 'None', 'Racing'], ['Quadruple odds', '10% bonus', 'Selected races'], ['Double odds', '15% bonus', 'Racing']]],
  boosts: ['Acca boosts and refunds', ['Boost', 'Refund', 'Min legs'], [['Up to 50%', 'Up to £10 if one leg loses', '5'], ['Up to 100%', 'None', '4'], ['Up to 30%', 'Up to £25 if one leg loses', '5'], ['Up to 70%', 'Free bet if one leg loses', '6'], ['None', 'Up to £5 if one leg loses', '4'], ['Up to 25%', 'None', '3']]],
  early: ['Early payout', ['Football', 'Applies to', 'Excludes'], [['Paid if 2 goals ahead', 'Pre-match singles', 'In-play bets'], ['Paid if 2 goals ahead', 'Singles and accas', 'Bet builders'], ['Paid if 3 goals ahead', 'Pre-match singles', 'Cup games'], ['Paid if 2 goals ahead', 'Match result bets', 'Accas'], ['None', '-', '-'], ['Paid if 2 goals ahead', 'Top 5 leagues', 'Bet builders']]]
};
function offersPage() {
  const [, cols, rows] = OFFERS[A.otab], g = 'grid-template-columns:130px 1.4fr 1fr 1fr 120px';
  return pageHead('Bookmaker offers', 'Compare offers side by side. We may earn a commission if you join a bookmaker through our links. It never changes the stats we show.')
    + demo("Example layout. Bookmaker names and terms are placeholders until offers come from the bookmakers' affiliate feeds.")
    + `<div class="pills" data-k="otab">${Object.entries(OFFERS).map(([k, [l]]) => pill('otab', k, l)).join('')}</div>`
    + (A.otab === 'signup' ? `<div class="card" style="gap:14px"><h2>How sign-up offers work</h2><ol class="steps"><li>Pick an offer and read its full terms.</li><li>Join through the link and verify your account.</li><li>Place the qualifying bet at the minimum odds or above.</li><li>The free bets are added once that bet settles.</li></ol></div>` : '')
    + `<div class="card"><div class="tbl"><div class="tr th px otr" style="${g}"><span>Bookmaker</span>${cols.map(c => `<span>${c}</span>`).join('')}<span></span></div>`
    + rows.map((r, i) => `<div class="tr otr" style="${g}"><b style="font-weight:600">Bookmaker ${'ABCDEF'[i]}</b>${r.map((c, j) => `<span><span class="lbl px">${cols[j]}</span>${c}</span>`).join('')}<button class="btn" disabled title="Links go live with the affiliate programmes">Get offer</button></div>`).join('')
    + `</div><p class="sm mu" style="margin-top:12px">18+. New customers only where stated. Full terms on each bookmaker's site. BeGambleAware.org</p></div>`;
}

/* ---------- Alerts, Premium, Safer gambling, More ---------- */
function alertsPage() {
  const sw = (k, l, s, p) => `<button class="sw" data-a="alert" data-id="${k}" aria-pressed="${!!A.alerts[k]}"><span><b style="font-weight:600">${l}</b>${p ? ' <span class="prem">Premium</span>' : ''}<br><span class="sm mu">${s}</span></span><i></i></button>`;
  return pageHead('Alerts', 'Choose what we tell you about, and where.')
    + demo('Demo: your choices are saved in this browser, but no alerts are sent yet.')
    + `<div class="split"><div class="card"><h2 style="padding-bottom:4px">What to send</h2>${sw('lineups', 'Line-ups confirmed', 'For games whose sheets you open.', 1)}${sw('refs', 'Referee appointed', 'With their card and foul averages.', 1)}${sw('trends', 'New trend notes', 'When notes are published for a big game.')}${sw('finder', 'New 90%+ lines', 'When the line finder spots a new strong line.', 1)}</div>`
    + `<div style="display:flex;flex-direction:column;gap:20px"><div class="card"><h2 style="padding-bottom:4px">Where to send them</h2>${sw('tg', 'Telegram', 'Through our Telegram bot.')}${sw('email', 'Email', 'A short summary email.')}</div>`
    + `<div class="card" style="gap:10px"><h2>Free Telegram channel</h2><p class="mu">The strongest lines from each new sheet, posted when it's ready, with a link to the full sheet.</p><button class="btn" disabled style="align-self:flex-start">Channel link coming soon</button></div></div></div>`;
}

function premiumPage() {
  const li = t => `<li>${ico('tick')}<span>${t}</span></li>`;
  return pageHead('Free and Premium', 'Start free. Upgrade if the extra tools are worth it to you.')
    + demo('Demo: prices are provisional and sign-up is not open yet.')
    + `<div class="plans"><div class="card"><h2>Free</h2><div class="price">£0</div><ul>${['3 full sheets a week', 'Strongest lines on every sheet', 'Games filter and line controls', 'Free Telegram channel'].map(li).join('')}</ul><a class="btn btn2" href="#/">Browse fixtures</a></div>`
    + `<div class="card" style="border-color:var(--y);box-shadow:0 0 0 1px var(--y)"><h2>Premium <span class="prem">7-day free trial</span></h2><div class="price">£4.99<span class="mu" style="font-size:15px;font-weight:400"> a month</span></div><div class="sm mu">or £39 a year</div>`
    + `<ul>${['Every sheet in every competition', 'Line finder across all games', 'Check my bet, with clash warnings', 'Line-up and referee alerts', 'Bet tracker and bet-type report'].map(li).join('')}</ul><button class="btn" disabled>Start free trial (coming soon)</button></div></div>`
    + `<div class="card" style="gap:10px;max-width:900px"><h2>Good to know</h2><p><b>Cancel any time.</b> Premium stays on until the end of the period you've paid for.</p>`
    + `<p><b>We don't sell tips.</b> Premium gives you more stats and tools. It doesn't make any bet more likely to win.</p><p><b>Stay in control.</b> If betting stops being fun, see our <a href="#/safer">safer gambling page</a>.</p></div>`;
}

function saferPage() {
  const ext = (u, l, s) => `<a href="${u}" target="_blank" rel="noopener"><span>${l}<br><span class="sm mu" style="font-weight:400">${s}</span></span>${ico('arrow')}</a>`;
  return pageHead('Safer gambling', 'Betting should be something you enjoy, never something you need.')
    + `<div class="split"><div class="card" style="gap:12px"><h2>Keep it in check</h2><ul class="trust">${['Only bet money you can afford to lose.', 'Set a deposit limit with every bookmaker you use.', 'Take a break with a time-out, or block all UK gambling sites with GamStop.', "Don't chase losses.", 'Hit rates describe past games. They don\'t make a bet more likely to win.'].map(t => `<li>${ico('tick')}<span>${t}</span></li>`).join('')}</ul></div>`
    + `<div class="card" style="gap:8px"><h2>Free, confidential help</h2><p>National Gambling Helpline: <b class="mono">0808 8020 133</b>, open 24 hours a day.</p><div class="links">`
    + ext('https://www.gamcare.org.uk', 'GamCare', 'Support, live chat and counselling') + ext('https://www.begambleaware.org', 'BeGambleAware', 'Advice and self-assessment')
    + ext('https://www.gamstop.co.uk', 'GamStop', 'Block yourself from UK gambling sites') + `</div></div></div>`;
}

const morePage = () => pageHead('More', '')
  + `<div class="card links">${[['offers', 'Bookmaker offers'], ['alerts', 'Alerts'], ['premium', 'Free and Premium'], ['safer', 'Safer gambling']].map(([k, l]) => `<a href="#/${k}">${l}${ico('arrow')}</a>`).join('')}</div>`
  + `<button data-a="theme" data-id="t2" style="align-self:flex-start;display:inline-flex;gap:8px;align-items:center">${ico(isDark() ? 'sun' : 'moon')}${isDark() ? 'Light' : 'Dark'} mode</button>`;

/* ---------- Actions and rendering ---------- */
function appAction(a, id) {
  const v = k => document.getElementById(k).value;
  if (a === 'fxcomp') A.comp = id;
  else if (a === 'fcomp' || a === 'fkind' || a === 'otab') A[a] = id;
  else if (a === 'fmin') A.fmin = +id;
  else if (a === 'addleg') A.slip = A.slip.includes(id) ? A.slip.filter(s => s !== id) : [...A.slip, id];
  else if (a === 'rmleg') A.slip = A.slip.filter(s => s !== id);
  else if (a === 'clearslip') A.slip = [];
  else if (a === 'demolegs') A.slip = ['liv-mci|t|0|0|0|1.5', 'liv-mci|t|3|0|0|4.5', 'liv-mci|p|1|0|sot|1'];
  else if (a === 'alert') A.alerts[id] = !A.alerts[id];
  else if (a === 'clearbets') A.bets = [];
  else if (a === 'samplebets') A.bets = null;
  else if (a === 'addbet') {
    const b = { date: v('nb-date') || '2026-10-11', bk: v('nb-bk').trim() || 'Bookmaker', type: v('nb-type'), stake: +v('nb-stake'), odds: +v('nb-odds') || 0, res: v('nb-res') };
    if (!(b.stake > 0)) { document.getElementById('nb-stake').focus(); return false; }
    A.bets = [b, ...(A.bets || [])];
  } else if (a === 'theme') {
    const t = isDark() ? 'light' : 'dark';
    document.documentElement.dataset.theme = t; store.set('theme', t);
  } else return false;
  save();
  return true;
}

const PAGES = { '': fixturesPage, match: matchPage, finder: finderPage, check: checkPage, tracker: trackerPage, offers: offersPage, alerts: alertsPage, premium: premiumPage, safer: saferPage, more: morePage };
function render() {
  const r = route(), site = document.getElementById('site');
  const sx = {}; site.querySelectorAll('.pills[data-k]').forEach(p => sx[p.dataset.k] = p.scrollLeft);
  const fo = { ...(document.activeElement?.dataset || {}) };
  site.innerHTML = topBar(r.p) + `<main class="page" id="main">${(PAGES[r.p] || fixturesPage)(r.id)}${footer()}</main>` + bottomNav(r.p);
  document.title = (r.p === 'match' ? DATA.fixture.name : TITLES[r.p] || 'Fixtures') + ' · Pixeltipster';
  site.querySelectorAll('.pills[data-k]').forEach(p => p.scrollLeft = sx[p.dataset.k] || 0);
  if (fo.a) site.querySelector(`[data-a="${fo.a}"][data-id="${fo.id}"]${fo.d ? `[data-d="${fo.d}"]` : ''}`)?.focus({ preventScroll: true });
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-a]'); if (!b) return;
  const { a, id, d } = b.dataset;
  if (sheetAction(a, id, d) || appAction(a, id)) render();
});
addEventListener('hashchange', () => { render(); scrollTo(0, 0); });
W.addEventListener('change', render); WM.addEventListener('change', render);
render();
