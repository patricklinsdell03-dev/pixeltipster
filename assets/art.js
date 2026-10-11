/* ============================================================================
   PIXEL ART: team shirts, icons and competition colours.
   Everything is drawn from small character grids and turned into CSS classes
   once at load, so pages only print <i class="jer j-LIV"> or <i class="pi pi-cal">.
   Shirts use team colours only, never club badges.
   ========================================================================== */
/* code: [main, second, pattern, sleeves, trim]   pattern: plain | stripes | centre | band */
const KITS = {
  LIV: ['#c8102e', '#c8102e', 'plain', '#c8102e', '#f6eb61'], MCI: ['#6cabdd', '#6cabdd', 'plain', '#6cabdd', '#ffffff'],
  RMA: ['#ffffff', '#ffffff', 'plain', '#ffffff', '#febe10'], BAR: ['#a50044', '#004d98', 'stripes', '#a50044', '#edbb00'],
  INT: ['#0068a8', '#111111', 'stripes', '#0068a8', '#ffffff'], JUV: ['#ffffff', '#111111', 'stripes', '#111111', '#ffffff'],
  ENG: ['#ffffff', '#ffffff', 'plain', '#ffffff', '#cf142b'], ESP: ['#c60b1e', '#c60b1e', 'plain', '#c60b1e', '#ffc400'],
  ARS: ['#ef0107', '#ef0107', 'plain', '#ffffff', '#ffffff'], CHE: ['#034694', '#034694', 'plain', '#034694', '#ffffff'],
  FCB: ['#dc052d', '#dc052d', 'plain', '#dc052d', '#ffffff'], BVB: ['#fde100', '#fde100', 'plain', '#fde100', '#111111'],
  PSG: ['#004170', '#da291c', 'centre', '#004170', '#ffffff'], OM: ['#ffffff', '#ffffff', 'plain', '#ffffff', '#2faee0'],
  NAP: ['#12a0d7', '#12a0d7', 'plain', '#12a0d7', '#ffffff'], BEN: ['#e83030', '#e83030', 'plain', '#e83030', '#ffffff'],
  ROM: ['#8e1f2f', '#8e1f2f', 'plain', '#8e1f2f', '#f0bc42'], AJA: ['#ffffff', '#d2122e', 'band', '#ffffff', '#d2122e'],
  EVE: ['#003399', '#003399', 'plain', '#003399', '#ffffff'], NEW: ['#111111', '#ffffff', 'stripes', '#111111', '#ffffff'],
  ATM: ['#cb3524', '#ffffff', 'stripes', '#cb3524', '#262f61'], SEV: ['#ffffff', '#ffffff', 'plain', '#ffffff', '#d80027'],
  LYO: ['#ffffff', '#ffffff', 'plain', '#ffffff', '#1a3c8f'], MON: ['#e7262e', '#ffffff', 'halves', '#e7262e', '#ffffff'],
  FRA: ['#21304d', '#21304d', 'plain', '#21304d', '#ffffff'], ITA: ['#1a62b6', '#1a62b6', 'plain', '#1a62b6', '#ffffff'],
  GER: ['#ffffff', '#ffffff', 'plain', '#ffffff', '#111111'], NED: ['#f36c21', '#f36c21', 'plain', '#f36c21', '#111111'],
  AVL: ['#7a003c', '#7a003c', 'plain', '#95bfe5', '#95bfe5'], TOT: ['#ffffff', '#ffffff', 'plain', '#ffffff', '#132257'],
  BHA: ['#0057b8', '#ffffff', 'stripes', '#0057b8', '#ffffff'], FUL: ['#ffffff', '#ffffff', 'plain', '#ffffff', '#111111'],
  RBL: ['#ffffff', '#ffffff', 'plain', '#ffffff', '#dd0741'], B04: ['#e32221', '#e32221', 'plain', '#111111', '#111111'],
  MIL: ['#fb090b', '#111111', 'stripes', '#fb090b', '#ffffff'], LAZ: ['#87d8f7', '#87d8f7', 'plain', '#87d8f7', '#ffffff'],
  VIL: ['#ffe667', '#ffe667', 'plain', '#ffe667', '#005187'], BET: ['#0bb363', '#ffffff', 'stripes', '#0bb363', '#ffffff'],
  LIL: ['#e01e13', '#e01e13', 'plain', '#e01e13', '#20325f'], NIC: ['#c8102e', '#111111', 'stripes', '#c8102e', '#ffffff'],
  VFB: ['#ffffff', '#e32219', 'hoop', '#ffffff', '#e32219'], SGE: ['#111111', '#111111', 'plain', '#111111', '#e1000f'],
  ATA: ['#1e71b8', '#111111', 'stripes', '#1e71b8', '#ffffff'], FIO: ['#482e92', '#482e92', 'plain', '#482e92', '#ffffff'],
  POR: ['#ffffff', '#00428c', 'stripes', '#00428c', '#ffffff']
};
const COMPC = { 'Premier League': '#7b3fe4', LaLiga: '#ff7a1a', 'Serie A': '#1aa3e8', Bundesliga: '#e5202e', 'Ligue 1': '#b8c400', 'Champions League': '#3557e8', 'Europa League': '#ff9a1f', 'Nations League': '#19a974' };
const compDot = c => `<i class="cdot" style="background:${COMPC[c] || 'var(--mu)'}"></i>`;

const SHIRT = [
  '...bbccbb...',
  '.sbbbbbbbbs.',
  'ssbbbbbbbbss',
  'ssbbbbbbbbss',
  '.ttbbbbbbtt.',
  '..bbbbbbbb..',
  '..bbbbbbbb..',
  '..bbbbbbbb..',
  '..bbbbbbbb..',
  '..bbbbbbbb..'
];
/* Icons: '#' = current text colour (drawn as a mask), other letters = fixed colours. */
const PIX = {
  cal: ['.#.....#.', '#########', '#########', '#.......#', '#.#.#.#.#', '#.......#', '#.#.#.#.#', '#.......#', '#########'],
  search: ['..####...', '.#....#..', '#......#.', '#......#.', '#......#.', '.#....#..', '..####...', '......##.', '.......##'],
  check: ['#########', '#.......#', '#......##', '#.....#.#', '#.#..#..#', '#..##...#', '#.......#', '#.#.#.#.#', '.#.#.#.#.'],
  chart: ['.......##', '.......##', '....##.##', '....##.##', '.##.##.##', '.##.##.##', '.##.##.##', '.........', '#########'],
  menu: ['.........', '#########', '.........', '.........', '#########', '.........', '.........', '#########', '.........'],
  tick: ['.........', '........#', '.......##', '......##.', '#....##..', '##..##...', '.####....', '..##.....', '.........'],
  arrow: ['....#....', '.....#...', '......#..', '#########', '......#..', '.....#...', '....#....'],
  moon: ['..####...', '.###.....', '###......', '###......', '###......', '###.....#', '.###...##', '..######.', '...####..'],
  bell: ['....#....', '...###...', '..#####..', '..#####..', '..#####..', '.#######.', '#########', '.........', '...###...'],
  gift: ['.#.....#.', '..#...#..', '#########', '#...#...#', '#########', '.#..#..#.', '.#..#..#.', '.#..#..#.', '.#######.'],
  sun: ['....y....', '.y.....y.', '...yyy...', '..yyyyy..', 'y.yyyyy.y', '..yyyyy..', '...yyy...', '.y.....y.', '....y....'],
  star: ['....y....', '....y....', '...yyy...', 'yyyyyyyyy', '.yyyyyyy.', '..yyyyy..', '..yy.yy..', '.yy...yy.', '.y.....y.'],
  ball: ['..kkkkk..', '.kwwkwwk.', 'kwwkkkwwk', 'kwwkkkwwk', 'kwwwkwwwk', 'kkwwwwwkk', 'kwwwkwwwk', '.kwkkkwk.', '..kkkkk..'],
  info: ['..#####..', '.#.....#.', '#...#...#', '#.......#', '#...#...#', '#...#...#', '#...#...#', '.#.....#.', '..#####..'],
  trophy: ['#########', '#.#####.#', '#.#####.#', '.#######.', '..#####..', '...###...', '....#....', '..#####..', '.#######.'],
  horse: ['......##.', '.....###.', '....####.', '#######..', '########.', '.######..', '.#....#..', '.#....#..', '.#....#..'],
  flask: ['..#####..', '...#.#...', '...#.#...', '..#...#..', '.#.....#.', '#..###..#', '#.#####.#', '#########', '.#######.'],
  calc: ['#########', '#.......#', '#.#####.#', '#.......#', '#.#.#.#.#', '#.......#', '#.#.#.#.#', '#.......#', '#########'],
  card: ['yyyyy....', 'yyyyy....', 'yyyyrrrrr', 'yyyyrrrrr', 'yyyyrrrrr', 'yyyyrrrrr', '....rrrrr', '....rrrrr', '.........'],
  shield: ['#########', '#.......#', '#.....#.#', '#....#..#', '#.#.#...#', '#..#....#', '.#.....#.', '..#...#..', '...###...']
};
const PIXCOL = { r: '#e5484d', y: '#f5b700', k: '#1a2233', w: '#ffffff' };

/* Grid of characters -> SVG, merging runs of the same colour into one rect. */
function gridSVG(rows, colour, pad = 0, extra = '') {
  const w = Math.max(...rows.map(r => r.length)) + pad * 2, h = rows.length + pad * 2;
  let body = '';
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      const c = colour(row[x], x, y); let e = x + 1;
      while (e < row.length && colour(row[e], e, y) === c) e++;
      if (c) body += `<rect x="${x + pad}" y="${y + pad}" width="${e - x}" height="1" fill="${c}"/>`;
      x = e;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${extra}${body}</svg>`;
}
const uri = svg => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

function shirtSVG([main, second, pat, sleeve, trim]) {
  const at = (x, y) => (SHIRT[y] || '')[x] || '.';
  let outline = '';
  for (let y = -1; y <= SHIRT.length; y++) for (let x = -1; x <= 12; x++)
    if (at(x, y) === '.' && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => at(x + dx, y + dy) !== '.')) outline += `<rect x="${x + 1}" y="${y + 1}" width="1" height="1" fill="#0b1020" opacity=".6"/>`;
  const fill = (ch, x, y) => ch === '.' ? null : ch === 'c' || ch === 't' ? trim : ch === 's' ? sleeve
    : pat === 'halves' ? (x < 6 ? main : second) : pat === 'hoop' ? (y === 3 || y === 4 ? second : main)
    : pat === 'stripes' ? (x % 2 ? second : main) : pat === 'centre' ? (x === 5 || x === 6 ? second : main) : pat === 'band' ? (x >= 4 && x <= 7 ? second : main) : main;
  const shade = '<rect x="10" y="2" width="1" height="10" fill="#000" opacity=".16"/><rect x="3" y="2" width="1" height="10" fill="#fff" opacity=".18"/>';
  return gridSVG(SHIRT, fill, 1, outline).replace('</svg>', shade + '</svg>');
}

(function injectPixelCSS() {
  let css = Object.entries(KITS).map(([k, v]) => `.j-${k}{background-image:${uri(shirtSVG(v))}}`).join('');
  css += `.j-none{background-image:${uri(shirtSVG(['#8a94a6', '#8a94a6', 'plain', '#8a94a6', '#ffffff']))}}`;
  css += Object.entries(PIX).map(([k, rows]) => {
    const mono = rows.every(r => /^[#.]+$/.test(r));
    return mono ? `.pi-${k}{--m:${uri(gridSVG(rows, ch => ch === '#' ? '#000' : null))}}`
      : `.pi-${k}{background-image:${uri(gridSVG(rows, ch => PIXCOL[ch] || null))}}`;
  }).join('');
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
})();

const MONO = Object.keys(PIX).filter(k => PIX[k].every(r => /^[#.]+$/.test(r)));
const ico = n => `<i class="${MONO.includes(n) ? 'pi' : 'pc'} pi-${n}" aria-hidden="true"></i>`;
/* size: s 14x12, m 28x24, l 42x36 */
const jer = (code, size = 'm') => `<i class="jer ${size} j-${KITS[code] ? code : 'none'}" aria-hidden="true"></i>`;
