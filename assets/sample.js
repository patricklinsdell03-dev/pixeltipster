/* ---------- SAMPLE DATA (replace with the real feed) ----------
   Made-up fixtures and numbers for the demo. The live data job replaces this
   file with real fixture files in the same shape. Only liv-mci has players and trends.
   Fixture status fields the data job must also write:
     updated  ISO time the sheet was built      lineups  true once line-ups are confirmed
     status   'scheduled' | 'postponed'           missing  market groups with no data, e.g. ['Corners']
     big      chosen for trend notes        ref      referee id once appointed, else null
   Players also carry minutes (10 values, 0 = didn't play) and started (10 values, 1/0). */
const TODAY = '2026-10-11';   // live: today's date
const FIXTURES = [
  ['liv-mci', 'Liverpool', 'LIV', 'Man City', 'MCI', 'Premier League', 'Anfield', '2026-10-11', '16:30', 'big lineups'],
  ['eve-new', 'Everton', 'EVE', 'Newcastle', 'NEW', 'Premier League', 'Hill Dickinson Stadium', '2026-10-11', '14:00'],
  ['rma-bar', 'Real Madrid', 'RMA', 'Barcelona', 'BAR', 'LaLiga', 'Bernabéu', '2026-10-11', '20:00', 'big'],
  ['atm-sev', 'Atlético Madrid', 'ATM', 'Sevilla', 'SEV', 'LaLiga', 'Metropolitano', '2026-10-11', '17:30'],
  ['int-juv', 'Inter', 'INT', 'Juventus', 'JUV', 'Serie A', 'San Siro', '2026-10-11', '19:45', 'big'],
  ['lyo-mon', 'Lyon', 'LYO', 'Monaco', 'MON', 'Ligue 1', 'Groupama Stadium', '2026-10-11', '16:15'],
  ['eng-esp', 'England', 'ENG', 'Spain', 'ESP', 'Nations League', 'Wembley', '2026-10-13', '19:45', 'big nocorners'],
  ['fra-ita', 'France', 'FRA', 'Italy', 'ITA', 'Nations League', 'Stade de France', '2026-10-13', '19:45'],
  ['ger-ned', 'Germany', 'GER', 'Netherlands', 'NED', 'Nations League', 'Düsseldorf Arena', '2026-10-13', '19:45'],
  ['ars-che', 'Arsenal', 'ARS', 'Chelsea', 'CHE', 'Premier League', 'Emirates', '2026-10-17', '17:30', 'big'],
  ['avl-tot', 'Aston Villa', 'AVL', 'Tottenham', 'TOT', 'Premier League', 'Villa Park', '2026-10-17', '15:00'],
  ['bha-ful', 'Brighton', 'BHA', 'Fulham', 'FUL', 'Premier League', 'Amex Stadium', '2026-10-17', '15:00'],
  ['bay-bvb', 'Bayern', 'FCB', 'Dortmund', 'BVB', 'Bundesliga', 'Allianz Arena', '2026-10-17', '17:30', 'big'],
  ['rbl-b04', 'Leipzig', 'RBL', 'Leverkusen', 'B04', 'Bundesliga', 'Red Bull Arena', '2026-10-17', '14:30'],
  ['mil-laz', 'Milan', 'MIL', 'Lazio', 'LAZ', 'Serie A', 'San Siro', '2026-10-17', '19:45'],
  ['vil-bet', 'Villarreal', 'VIL', 'Real Betis', 'BET', 'LaLiga', 'La Cerámica', '2026-10-17', '20:00'],
  ['psg-om', 'PSG', 'PSG', 'Marseille', 'OM', 'Ligue 1', 'Parc des Princes', '2026-10-18', '20:45', 'big'],
  ['lil-nic', 'Lille', 'LIL', 'Nice', 'NIC', 'Ligue 1', 'Stade Pierre-Mauroy', '2026-10-18', '15:00'],
  ['vfb-sge', 'Stuttgart', 'VFB', 'Frankfurt', 'SGE', 'Bundesliga', 'MHPArena', '2026-10-18', '17:30'],
  ['ata-fio', 'Atalanta', 'ATA', 'Fiorentina', 'FIO', 'Serie A', 'Gewiss Stadium', '2026-10-18', '14:00'],
  ['nap-ben', 'Napoli', 'NAP', 'Benfica', 'BEN', 'Champions League', 'Maradona', '2026-10-20', '20:00'],
  ['ars-fcb', 'Arsenal', 'ARS', 'Bayern', 'FCB', 'Champions League', 'Emirates', '2026-10-20', '20:00', 'big'],
  ['mci-int', 'Man City', 'MCI', 'Inter', 'INT', 'Champions League', 'Etihad', '2026-10-21', '20:00', 'big'],
  ['rom-aja', 'Roma', 'ROM', 'Ajax', 'AJA', 'Europa League', 'Olimpico', '2026-10-22', '17:45', 'postponed'],
  ['tot-por', 'Tottenham', 'TOT', 'Porto', 'POR', 'Europa League', 'Tottenham Hotspur Stadium', '2026-10-22', '20:00']
].map(([id, home, hc, away, ac, comp, venue, date, ko, flags = '']) => ({
  id, home, hc, away, ac, comp, venue, date, ko, full: id === 'liv-mci', big: flags.includes('big'), lineups: flags.includes('lineups'),
  status: flags.includes('postponed') ? 'postponed' : 'scheduled', missing: flags.includes('nocorners') ? ['Corners'] : [],
  updated: flags.includes('lineups') ? '2026-10-11T14:20:00Z' : '2026-10-11T07:05:00Z'
}));
/* Made-up referees, so no real official gets invented numbers. ref = referee id once appointed, else null. */
const REFS = [['whitlow', 'Sam Whitlow', 'Premier League'], ['hargreaves', 'Dan Hargreaves', 'Premier League'], ['ortega', 'Luis Ortega', 'LaLiga'],
  ['bellini', 'Marco Bellini', 'Serie A'], ['keller', 'Jonas Keller', 'Bundesliga'], ['moreau', 'Paul Moreau', 'Ligue 1']].map(([id, name, comp]) => ({ id, name, comp }));
const REF_FOR = { 'liv-mci': 'whitlow', 'eve-new': 'hargreaves', 'rma-bar': 'ortega', 'int-juv': 'bellini', 'lyo-mon': 'moreau', 'bay-bvb': 'keller' };
FIXTURES.forEach(f => f.ref = REF_FOR[f.id] || null);
const REFCACHE = {};
function refData(id) {
  if (REFCACHE[id]) return REFCACHE[id];
  const ref = REFS.find(r => r.id === id), r = rng(hash('ref' + id)), lean = 0.8 + r() * 0.5;
  const pool = FIXTURES.filter(f => f.comp === ref.comp).flatMap(f => [f.home, f.away]);
  const games = ten((_, i) => { const a = pool[(i * 3) % pool.length], b = pool[(i * 5 + 1) % pool.length]; return { date: new Date(Date.UTC(2026, 9, 5) - (9 - i) * 7 * 864e5).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }), match: `${a} v ${a === b ? 'Opponent' : b}`, comp: ref.comp }; });
  return REFCACHE[id] = { ...ref, games, cards: ten(() => pois(r, 4.2 * lean)), fouls: ten(() => pois(r, 22 * (0.85 + r() * 0.3))), reds: ten(() => r() < 0.08 ? 1 : 0), pens: ten(() => r() < 0.25 ? 1 : 0) };
}
const fmtDate = d => new Date(d + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
const FXCACHE = {};
const fixtureData = id => {
  if (FXCACHE[id]) return FXCACHE[id];
  const f = FIXTURES.find(x => x.id === id) || FIXTURES[0], d = sample(f);
  Object.assign(d.fixture, { updated: f.updated, lineups: f.lineups, status: f.status, missing: f.missing, ref: f.ref });
  return FXCACHE[id] = d;
};

const hash = s => { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pois = (r, m) => { const L = Math.exp(-m); let k = 0, p = 1; do { k++; p *= r(); } while (p > L); return k - 1; };
const bin = (r, n, p) => { let k = 0; for (let i = 0; i < n; i++) if (r() < p) k++; return k; };
const ten = fn => Array.from({ length: 10 }, fn);
function sample(f) {
  const FIX = {   // hand-set series so the headline players look sensible; Liverpool's 6 is the cup freak result
    'Erling Haaland|sot': [2, 2, 1, 3, 2, 2, 4, 1, 2, 3], 'Hugo Ekitike|sot': [1, 2, 1, 1, 3, 0, 1, 2, 1, 1], 'Florian Wirtz|shots': [3, 1, 2, 4, 2, 0, 3, 2, 1, 2],
    'Ryan Gravenberch|fouls': [2, 3, 1, 2, 2, 0, 3, 2, 1, 2], 'Jeremy Doku|fouled': [3, 4, 3, 1, 5, 3, 2, 3, 2, 4], 'Josko Gvardiol|cards': [0, 1, 0, 0, 1, 0, 0, 1, 1, 0],
    'Liverpool|goals': [2, 3, 1, 2, 6, 0, 3, 2, 1, 2], 'Man City|goals': [2, 1, 3, 2, 0, 2, 4, 1, 2, 2]
  };
  const BASE = { F: [3.0, 1.3, 0.9, 1.4, 0.6, 0.12], W: [2.2, 0.8, 0.9, 2.4, 1.0, 0.15], M: [1.3, 0.4, 1.6, 1.3, 2.4, 0.25], D: [0.6, 0.2, 1.2, 0.6, 2.2, 0.22] };
  const GOAL = { F: 0.32, W: 0.22, M: 0.15, D: 0.1 }, AST = { F: 0.18, W: 0.24, M: 0.14, D: 0.05 }, POS = { F: 'Forward', W: 'Winger', M: 'Midfielder', D: 'Defender' };
  const TCORE = ['goals', 'conceded', 'mgoals', 'btts', 'form', 'dc', 'htlead', 'shots', 'sot', 'msot', 'corners', 'mcorners', 'mostcorners', 'cards', 'mcards', 'fouls'];
  const PCORE = ['shots', 'sot', 'fouls', 'fouled', 'tackles', 'cards'];
  const st = (key, label, vals, mode, x) => ({ key, label, vals, mode, ...x });
  const day = i => new Date(Date.UTC(2026, 9, 4) - (9 - i) * 4 * 864e5).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

  function team(name, code, home, squad, opps, comps) {
    const r = rng(hash(name)), gen = m => ten(() => pois(r, m)), tv = (k, m) => FIX[name + '|' + k] || gen(m * (0.85 + r() * 0.3));
    const goals = tv('goals', 1.6), shots = tv('shots', 13.5), sot = tv('sot', 4.8), corners = tv('corners', 5.6), fouls = tv('fouls', 10.8), cards = tv('cards', 1.9), offs = tv('offs', 1.8);
    const goalsA = gen(1.2), cornersA = gen(4.8), cardsA = gen(2.1), sotA = gen(4.0);
    for (let i = 0; i < 10; i++) { sot[i] = Math.max(sot[i], goals[i]); shots[i] = Math.max(shots[i], sot[i] + 2); sotA[i] = Math.max(sotA[i], goalsA[i]); }
    const games = ten((_, i) => ({ date: day(i), opp: opps[i], comp: comps[i], ha: (i + (home ? 0 : 1)) % 2 ? 'A' : 'H', score: `${goals[i]}-${goalsA[i]}` }));
    const half = (a, p) => a.map(n => bin(r, n, p)), sub = (a, b) => a.map((x, i) => x - b[i]), add = (a, b) => a.map((x, i) => x + b[i]), yn = f => ten((_, i) => f(i) ? 1 : 0);
    const g1 = half(goals, 0.45), gA1 = half(goalsA, 0.45), s1 = half(sot, 0.47), c1 = half(corners, 0.48), k1 = half(cards, 0.35);
    const v = a => ({ venue: avg(a) * (home ? 1.04 + r() * 0.1 : 0.88 + r() * 0.1) }), vo = a => ({ ...v(a), opp: avg(a) * (0.7 + r() * 0.6) });
    const o = (k, l, a) => st(k, l, a, 'over', vo(a)), ov = (k, l, a) => st(k, l, a, 'over', v(a));
    const groups = [
      { name: 'Goals', stats: [o('goals', 'Team goals', goals), ov('conceded', 'Goals conceded', goalsA), ov('mgoals', 'Match goals', add(goals, goalsA)), ov('g1h', 'Team 1st-half goals', g1), ov('g2h', 'Team 2nd-half goals', sub(goals, g1)),
        st('btts', 'Both teams scored', yn(i => goals[i] > 0 && goalsA[i] > 0), 'yn'), st('gbh', 'Goal in both halves', yn(i => g1[i] + gA1[i] > 0 && goals[i] - g1[i] + goalsA[i] - gA1[i] > 0), 'yn'), st('cs', 'Clean sheet', yn(i => goalsA[i] === 0), 'yn')] },
      { name: 'Result', stats: [st('form', 'Result', goals.map((x, i) => x > goalsA[i] ? 'W' : x === goalsA[i] ? 'D' : 'L'), 'form'), st('dc', 'Won or drew', yn(i => goals[i] >= goalsA[i]), 'yn'), st('htlead', 'Led at half-time', yn(i => g1[i] > gA1[i]), 'yn'), st('win2', 'Won by 2 or more', yn(i => goals[i] - goalsA[i] >= 2), 'yn')] },
      { name: 'Shots', stats: [o('shots', 'Team shots', shots), o('sot', 'Team shots on target', sot), ov('sot1h', '1st-half shots on target', s1), ov('sot2h', '2nd-half shots on target', sub(sot, s1)), ov('msot', 'Match shots on target', add(sot, sotA)), st('mostsot', 'Most shots on target', yn(i => sot[i] > sotA[i]), 'yn')] },
      { name: 'Corners', stats: [o('corners', 'Team corners', corners), ov('cornersA', 'Corners conceded', cornersA), ov('mcorners', 'Match corners', add(corners, cornersA)), ov('c1h', 'Team 1st-half corners', c1), ov('c2h', 'Team 2nd-half corners', sub(corners, c1)), st('mostcorners', 'Most corners', yn(i => corners[i] > cornersA[i]), 'yn')] },
      { name: 'Cards', stats: [o('cards', 'Team cards', cards), ov('mcards', 'Match cards', add(cards, cardsA)), ov('k1h', 'Team 1st-half cards', k1), ov('k2h', 'Team 2nd-half cards', sub(cards, k1)), st('mostcards', 'Most cards', yn(i => cards[i] > cardsA[i]), 'yn'), o('fouls', 'Fouls committed', fouls), o('offs', 'Offsides', offs)] }
    ];
    groups.forEach(g => g.stats.forEach(s => s.core = TCORE.includes(s.key)));
    const players = squad.map(([pn, pos]) => {
      const pr = rng(hash(pn)), raw = {};
      ['shots', 'sot', 'fouls', 'fouled', 'tackles', 'cards'].forEach((k, i) => { const m = BASE[pos][i] * (0.8 + pr() * 0.4); raw[k] = FIX[pn + '|' + k] || ten(() => k === 'cards' ? (pr() < m ? 1 : 0) : pois(pr, m)); });
      for (let i = 0; i < 10; i++) { if (FIX[pn + '|sot']) raw.shots[i] = Math.max(raw.shots[i], raw.sot[i]); else raw.sot[i] = Math.min(raw.sot[i], raw.shots[i]); }
      const g = raw.sot.map(n => bin(pr, n, GOAL[pos])), a = ten(() => pois(pr, AST[pos])), p = (k, l, vals) => st(k, l, vals, 'plus');
      const stats = [p('shots', 'Shots', raw.shots), p('sot', 'Shots on target', raw.sot), p('fouls', 'Fouls committed', raw.fouls), p('fouled', 'Fouls won', raw.fouled), p('tackles', 'Tackles', raw.tackles), st('cards', 'Carded', raw.cards, 'yn'),
        p('goals', 'Goals', g), p('assists', 'Assists', a), p('ga', 'Goal or assist', g.map((x, i) => x + a[i])), p('finv', 'Foul involvements', raw.fouls.map((x, i) => x + raw.fouled[i])), p('f1h', '1st-half fouls', raw.fouls.map(n => bin(pr, n, 0.5))), st('s2h', 'Shot in each half', raw.shots.map(n => n >= 2 && pr() < 0.6 ? 1 : 0), 'yn')];
      stats.forEach(s => s.core = PCORE.includes(s.key));
      const fixed = Object.keys(FIX).some(k => k.startsWith(pn + '|'));
      const started = ten(() => fixed || pr() < (pos === 'D' ? 0.92 : 0.8) ? 1 : 0);
      const minutes = started.map(s => s ? Math.min(90, Math.round((pos === 'D' ? 82 : pos === 'M' ? 62 : 55) + pr() * 40)) : pr() < 0.6 ? 1 + Math.floor(pr() * 30) : 0);
      minutes.forEach((m, i) => { if (!m) stats.forEach(s => { if (!FIX[pn + '|' + s.key]) s.vals[i] = 0; }); });
      return { name: pn, pos: POS[pos], minutes, started, mins: Math.round(avg(minutes.filter(Boolean))), starts: started.reduce((a, b) => a + b, 0), stats };
    });
    return { name, code, games, groups, players };
  }

  const meta = `${f.comp} · ${f.venue} · ${fmtDate(f.date)}, ${f.ko}`;
  if (!f.full) {
    const LEAGUE = { RMA: 'LaLiga', BAR: 'LaLiga', INT: 'Serie A', JUV: 'Serie A', ENG: 'NT', ESP: 'NT', ARS: 'PL', CHE: 'PL', FCB: 'BL', BVB: 'BL', PSG: 'L1', OM: 'L1', NAP: 'Serie A', BEN: 'Liga PT', ROM: 'Serie A', AJA: 'Erediv',
      EVE: 'PL', NEW: 'PL', AVL: 'PL', TOT: 'PL', BHA: 'PL', FUL: 'PL', MCI: 'PL', ATM: 'LaLiga', SEV: 'LaLiga', VIL: 'LaLiga', BET: 'LaLiga', MIL: 'Serie A', LAZ: 'Serie A', ATA: 'Serie A', FIO: 'Serie A',
      RBL: 'BL', B04: 'BL', VFB: 'BL', SGE: 'BL', LYO: 'L1', MON: 'L1', LIL: 'L1', NIC: 'L1', POR: 'Liga PT', FRA: 'NT', ITA: 'NT', GER: 'NT', NED: 'NT' };
    const EURO = { CHE: 'UECL', FIO: 'UECL', OM: 'UEL', ROM: 'UEL', AJA: 'UEL', TOT: 'UEL', POR: 'UEL', LYO: 'UEL', NIC: 'UEL', BET: 'UEL', LAZ: 'UEL', SGE: 'UEL' };
    const UCL = 'RMA BAR INT JUV ARS FCB BVB PSG NAP BEN MCI ATM B04 MIL ATA AVL MON LIL NEW RBL VFB'.split(' ');
    const POOL = { PL: ['Everton', 'Brentford', 'Fulham', 'Wolves', 'Brighton', 'Villa', 'Newcastle', 'Spurs'], LaLiga: ['Sevilla', 'Valencia', 'Betis', 'Villarreal', 'Girona', 'Osasuna', 'Getafe', 'Celta'],
      'Serie A': ['Lazio', 'Atalanta', 'Torino', 'Bologna', 'Fiorentina', 'Genoa', 'Udinese', 'Como'], BL: ['Leipzig', 'Leverkusen', 'Stuttgart', 'Freiburg', 'Mainz', 'Wolfsburg', 'Union', 'Bremen'],
      L1: ['Lyon', 'Monaco', 'Lille', 'Nice', 'Rennes', 'Lens', 'Nantes', 'Brest'], 'Liga PT': ['Porto', 'Sporting', 'Braga', 'Guimarães', 'Rio Ave', 'Estoril', 'Arouca', 'Famalicão'],
      Erediv: ['PSV', 'Feyenoord', 'AZ', 'Twente', 'Utrecht', 'Heerenveen', 'Sparta', 'NEC'], NT: ['Italy', 'France', 'Germany', 'Portugal', 'Netherlands', 'Belgium', 'Croatia', 'Denmark'] };
    const side = (name, code, home) => {
      const lg = LEAGUE[code], pool = POOL[lg].filter(n => n !== name);
      const comps = lg === 'NT' ? ['WCQ', 'WCQ', 'Friendly', 'NL', 'NL', 'Friendly', 'WCQ', 'NL', 'WCQ', 'NL'] : ten((_, i) => [2, 5, 8].includes(i) ? EURO[code] || (UCL.includes(code) ? 'UCL' : 'Cup') : lg);
      return team(name, code, home, [], ten((_, i) => pool[(i * 3 + code.length) % pool.length]), comps);
    };
    return { fixture: { name: `${f.home} v ${f.away}`, meta }, teams: [side(f.home, f.hc, true), side(f.away, f.ac, false)], notes: [] };
  }
  return {
    fixture: { name: 'Liverpool v Man City', meta },
    teams: [
      team('Liverpool', 'LIV', true, [['Hugo Ekitike', 'F'], ['Florian Wirtz', 'W'], ['Dominik Szoboszlai', 'M'], ['Ryan Gravenberch', 'M'], ['Alexis Mac Allister', 'M'], ['Virgil van Dijk', 'D']],
        ['Bournemouth', 'Newcastle', 'Atletico', 'Burnley', 'Southampton', 'Everton', 'Galatasaray', 'Crystal Palace', 'Chelsea', 'Frankfurt'], ['PL', 'PL', 'UCL', 'PL', 'EFL Cup', 'PL', 'UCL', 'PL', 'PL', 'UCL']),
      team('Man City', 'MCI', false, [['Erling Haaland', 'F'], ['Jeremy Doku', 'W'], ['Phil Foden', 'W'], ['Rodri', 'M'], ['Tijjani Reijnders', 'M'], ['Josko Gvardiol', 'D']],
        ['Wolves', 'Tottenham', 'Brighton', 'Napoli', 'Man Utd', 'Huddersfield', 'Arsenal', 'Monaco', 'Burnley', 'Brentford'], ['PL', 'PL', 'PL', 'UCL', 'PL', 'EFL Cup', 'PL', 'UCL', 'PL', 'PL'])
    ],
    notes: [
      { tag: 'Role change', title: 'Szoboszlai is playing higher up', body: 'His average position over the last 3 games is 9 metres further forward than in the 7 before. His touches in the box went from 2.1 to 5.4 a game in that spell.', touch: 'His shots and shots on target, upwards. His tackles, downwards. The 10-game numbers lag behind the change.' },
      { tag: 'Formation', title: 'City switched to a back three last game', body: 'It was the first time in 12 games. The wing-backs took 41% of City’s final-third touches, up from 24%, and City forced 9 corners.', touch: 'City corners, Doku’s fouls won, and shots from the wide players.' },
      { tag: 'Partnership', title: 'Kerkez and Wirtz on the left', body: 'They started together in 6 of the last 10. Liverpool’s left side produced 5 goals and assists in those 6 games, and 1 in the 4 without the pairing. Both start today.', touch: 'Wirtz shots and assists, Liverpool team goals.' },
      { tag: 'Set pieces', title: 'Van Dijk is the first target at corners', body: 'He won first contact at 7 of Liverpool’s last 18 corners and has had 4 headed attempts in the last 5 games, after none in the 5 before.', touch: 'Van Dijk shots, Liverpool corners.' }
    ]
  };
}
