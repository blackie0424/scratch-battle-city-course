// Lesson 2 .sb3 builder — eagle-pocketed scenes + 4-direction tank costumes (kid adds switch-costume blocks)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const archiver = require('archiver');

const OUT_DIR = path.join(__dirname, '..');
const BUILD_DIR = path.join(__dirname, 'build_sb3');
fs.rmSync(BUILD_DIR, { recursive: true, force: true });
fs.mkdirSync(BUILD_DIR, { recursive: true });

// ---------- SVG assets ----------

// ---------- Backdrop generator (4 scenes, bricks baked into backdrop SVG) ----------
function brickInlineSVG(x, y) {
  return `<g transform="translate(${x},${y})">
    <rect width="32" height="32" fill="#8d4a1e"/>
    <g stroke="#3e2010" stroke-width="1" fill="#b86a2a">
      <rect x="0" y="0" width="16" height="8"/>
      <rect x="16" y="0" width="16" height="8"/>
      <rect x="-8" y="8" width="16" height="8"/>
      <rect x="8" y="8" width="16" height="8"/>
      <rect x="24" y="8" width="16" height="8"/>
      <rect x="0" y="16" width="16" height="8"/>
      <rect x="16" y="16" width="16" height="8"/>
      <rect x="-8" y="24" width="16" height="8"/>
      <rect x="8" y="24" width="16" height="8"/>
      <rect x="24" y="24" width="16" height="8"/>
    </g>
  </g>`;
}
const gridBg = Array.from({length: 15}, (_, i) =>
  Array.from({length: 12}, (_, j) =>
    `<rect x="${i*32}" y="${j*30}" width="30" height="28" />`
  ).join('')
).join('');
function makeBackdropSVG(brickCells, label) {
  const bricks = brickCells.map(({col, row}) => brickInlineSVG(col*32, row*32)).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">
  <rect width="480" height="360" fill="#1a1a1a"/>
  <g fill="#2a2a2a">${gridBg}</g>
  ${bricks}
  <rect x="0" y="0" width="480" height="360" fill="none" stroke="#4caf50" stroke-width="4"/>
  <text x="240" y="22" font-family="Arial" font-size="16" fill="#4caf50" text-anchor="middle">${label}</text>
</svg>`;
}
function rng(start, end) {
  return Array.from({length: end - start + 1}, (_, i) => i + start);
}

// ---------- 4 SCENE DEFINITIONS (eagle pocketed, exit varies) ----------
// Eagle stays at (0, 132) = col 7 row 1 in every scene; pocket walls differ.
const SCENES = [
  {
    name: '2-1_南口',
    label: 'BATTLE CITY  /  2-1  EXIT SOUTH',
    // South exit pocket. Side walls at col 5 / col 9 (far from eagle so
    // tank tracks don't graze them). row 0 col 7 is intentionally OPEN
    // — at sprite.y=130 the tank's gun barrel tip lands on y=148, which
    // is exactly the bottom edge of row 0; if col 7 had a brick there
    // the gun tip would touch the brick highlight stripe and undo the
    // move before the win loop could detect the eagle.
    bricks: [
      { col: 5, row: 0 }, { col: 6, row: 0 }, { col: 8, row: 0 }, { col: 9, row: 0 },
      { col: 5, row: 1 }, { col: 9, row: 1 },
      { col: 5, row: 2 }, { col: 9, row: 2 },
      ...rng(3, 11).map(c => ({ col: c, row: 5 })),
    ],
    eagle: { x: 0, y: 132 },
  },
  {
    name: '2-2_東口',
    label: 'BATTLE CITY  /  2-2  EXIT EAST',
    bricks: [
      // pocket — open at col 8 row 1 (east of eagle)
      { col: 6, row: 0 }, { col: 7, row: 0 }, { col: 8, row: 0 },
      { col: 6, row: 1 }, // col 8 row 1 left open (exit)
      { col: 6, row: 2 }, { col: 7, row: 2 }, { col: 8, row: 2 },
      // detour wall — forces going right past col 11 then up
      ...rng(0, 10).map(c => ({ col: c, row: 5 })),
    ],
    eagle: { x: 0, y: 132 },
  },
  {
    name: '2-3_西口',
    label: 'BATTLE CITY  /  2-3  EXIT WEST',
    bricks: [
      // pocket — open at col 6 row 1 (west of eagle)
      { col: 6, row: 0 }, { col: 7, row: 0 }, { col: 8, row: 0 },
      { col: 8, row: 1 }, // col 6 row 1 left open (exit)
      { col: 6, row: 2 }, { col: 7, row: 2 }, { col: 8, row: 2 },
      // detour wall — forces going left past col 3 then up
      ...rng(4, 14).map(c => ({ col: c, row: 5 })),
    ],
    eagle: { x: 0, y: 132 },
  },
  {
    name: '2-4_沙盒',
    label: 'BATTLE CITY  /  2-4  ALL FOUR DIRECTIONS',
    bricks: [],
    eagle: { x: 0, y: 132 },
  },
];

// Vertical tracks (left/right), gun pointing up or down
function tankVerticalSVG(gunUp) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
  <rect x="2" y="6" width="8" height="28" fill="#2e7d32" stroke="#1b5e20" stroke-width="1"/>
  <rect x="30" y="6" width="8" height="28" fill="#2e7d32" stroke="#1b5e20" stroke-width="1"/>
  ${[8,14,20,26,32].map(y => `<line x1="2" y1="${y}" x2="10" y2="${y}" stroke="#1b5e20" stroke-width="1"/><line x1="30" y1="${y}" x2="38" y2="${y}" stroke="#1b5e20" stroke-width="1"/>`).join('')}
  <rect x="10" y="10" width="20" height="22" fill="#4caf50" stroke="#1b5e20" stroke-width="1"/>
  <circle cx="20" cy="20" r="6" fill="#66bb6a" stroke="#1b5e20" stroke-width="1"/>
  <rect x="18" y="${gunUp ? 2 : 24}" width="4" height="14" fill="#1b5e20"/>
</svg>`;
}
// Horizontal tracks (top/bottom), gun pointing left or right
function tankHorizontalSVG(gunRight) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
  <rect x="6" y="2" width="28" height="8" fill="#2e7d32" stroke="#1b5e20" stroke-width="1"/>
  <rect x="6" y="30" width="28" height="8" fill="#2e7d32" stroke="#1b5e20" stroke-width="1"/>
  ${[8,14,20,26,32].map(x => `<line x1="${x}" y1="2" x2="${x}" y2="10" stroke="#1b5e20" stroke-width="1"/><line x1="${x}" y1="30" x2="${x}" y2="38" stroke="#1b5e20" stroke-width="1"/>`).join('')}
  <rect x="10" y="10" width="20" height="20" fill="#4caf50" stroke="#1b5e20" stroke-width="1"/>
  <circle cx="20" cy="20" r="6" fill="#66bb6a" stroke="#1b5e20" stroke-width="1"/>
  <rect x="${gunRight ? 24 : 2}" y="18" width="14" height="4" fill="#1b5e20"/>
</svg>`;
}
const tankUpSVG    = tankVerticalSVG(true);
const tankDownSVG  = tankVerticalSVG(false);
const tankLeftSVG  = tankHorizontalSVG(false);
const tankRightSVG = tankHorizontalSVG(true);

const brickSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#8d4a1e"/>
  <g stroke="#3e2010" stroke-width="1" fill="#b86a2a">
    <rect x="0" y="0" width="16" height="8"/>
    <rect x="16" y="0" width="16" height="8"/>
    <rect x="-8" y="8" width="16" height="8"/>
    <rect x="8" y="8" width="16" height="8"/>
    <rect x="24" y="8" width="16" height="8"/>
    <rect x="0" y="16" width="16" height="8"/>
    <rect x="16" y="16" width="16" height="8"/>
    <rect x="-8" y="24" width="16" height="8"/>
    <rect x="8" y="24" width="16" height="8"/>
    <rect x="24" y="24" width="16" height="8"/>
  </g>
</svg>`;

// Eagle / base: yellow stylized eagle, 48x48
const eagleSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <rect x="2" y="2" width="44" height="44" fill="#fff3c4" stroke="#b8860b" stroke-width="2" rx="4"/>
  <!-- eagle body -->
  <path d="M 24 10 L 18 18 L 10 22 L 16 22 L 12 28 L 18 26 L 16 36 L 24 32 L 32 36 L 30 26 L 36 28 L 32 22 L 38 22 L 30 18 Z"
        fill="#daa520" stroke="#704c00" stroke-width="1.5" stroke-linejoin="round"/>
  <!-- head -->
  <circle cx="24" cy="14" r="3" fill="#daa520" stroke="#704c00" stroke-width="1"/>
  <!-- eye -->
  <circle cx="24" cy="13" r="0.8" fill="#fff"/>
  <!-- beak -->
  <polygon points="24,16 22,18 26,18" fill="#704c00"/>
</svg>`;

function md5(buf) { return crypto.createHash('md5').update(buf).digest('hex'); }
function writeAsset(svg) {
  const buf = Buffer.from(svg, 'utf8');
  const hash = md5(buf);
  const filename = `${hash}.svg`;
  fs.writeFileSync(path.join(BUILD_DIR, filename), buf);
  return { assetId: hash, md5ext: filename, dataFormat: 'svg' };
}

// 4 backdrop costumes (one per scene)
const sceneAssets = SCENES.map(s => writeAsset(makeBackdropSVG(s.bricks, s.label)));
// 4 tank costumes — kid will add `switch costume to X` blocks in L2
const tankAssetUp    = writeAsset(tankUpSVG);
const tankAssetDown  = writeAsset(tankDownSVG);
const tankAssetLeft  = writeAsset(tankLeftSVG);
const tankAssetRight = writeAsset(tankRightSVG);
const brickAsset = writeAsset(brickSVG);
const eagleAsset = writeAsset(eagleSVG);

// ---------- Victory sound (PCM WAV, generated procedurally) ----------
// Ascending arpeggio C5 - E5 - G5 - C6, ~0.85s total, mono 22050 Hz 16-bit
function makeVictoryWav() {
  const sampleRate = 22050;
  const notes = [
    { freq: 523.25, dur: 0.15 }, // C5
    { freq: 659.25, dur: 0.15 }, // E5
    { freq: 783.99, dur: 0.15 }, // G5
    { freq: 1046.50, dur: 0.40 }, // C6 (held)
  ];
  const samples = [];
  for (const note of notes) {
    const n = Math.floor(sampleRate * note.dur);
    for (let i = 0; i < n; i++) {
      const t = i / sampleRate;
      const attack = 0.012, release = 0.06;
      let env = 1.0;
      if (t < attack) env = t / attack;
      if (t > note.dur - release) env = Math.max(0, (note.dur - t) / release);
      // Mix fundamental + soft second harmonic for a chime-like tone
      const s = Math.sin(2 * Math.PI * note.freq * t) * 0.7
              + Math.sin(2 * Math.PI * note.freq * 2 * t) * 0.2;
      samples.push(Math.max(-1, Math.min(1, s * env * 0.55)));
    }
  }
  const dataSize = samples.length * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);  // PCM
  buf.writeUInt16LE(1, 22);  // mono
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i++) {
    buf.writeInt16LE(Math.floor(samples[i] * 32767), 44 + i * 2);
  }
  return { buf, sampleRate, sampleCount: samples.length };
}

const victory = makeVictoryWav();
const victoryHash = md5(victory.buf);
const victoryFilename = `${victoryHash}.wav`;
fs.writeFileSync(path.join(BUILD_DIR, victoryFilename), victory.buf);
const victoryAsset = {
  assetId: victoryHash,
  md5ext: victoryFilename,
  dataFormat: 'wav',
  sampleRate: victory.sampleRate,
  sampleCount: victory.sampleCount,
};

// ---------- Tank blocks: init + 4 arrow keys + win detection ----------

const tankBlocks = {
  // init: when flag clicked -> goto -> set size -> set rotation style
  init1: {
    opcode: 'event_whenflagclicked',
    next: 'init2', parent: null, inputs: {}, fields: {},
    shadow: false, topLevel: true, x: 40, y: 20,
  },
  init2: {
    opcode: 'motion_gotoxy',
    next: 'init3', parent: 'init1',
    inputs: { X: [1, [4, '0']], Y: [1, [4, '-120']] },
    fields: {}, shadow: false, topLevel: false,
  },
  init3: {
    opcode: 'looks_setsizeto',
    next: 'init4', parent: 'init2',
    inputs: { SIZE: [1, [4, '100']] },
    fields: {}, shadow: false, topLevel: false,
  },
  init4: {
    opcode: 'motion_setrotationstyle',
    next: null, parent: 'init3',
    inputs: {},
    fields: { STYLE: ['don\'t rotate', null] },
    shadow: false, topLevel: false,
  },

  // ---- arrow keys with brick-color collision ----
  // pattern: when key -> move N -> if <touching brick color> -> move -N (undo)
  // brick color #b86a2a matches both original 磚牆 and any 磚牆2/3/... duplicates

  // up arrow
  up1: {
    opcode: 'event_whenkeypressed', next: 'up2', parent: null, inputs: {},
    fields: { KEY_OPTION: ['up arrow', null] },
    shadow: false, topLevel: true, x: 420, y: 20,
  },
  up2: {
    opcode: 'motion_changeyby', next: 'up3', parent: 'up1',
    inputs: { DY: [1, [4, '10']] }, fields: {}, shadow: false, topLevel: false,
  },
  up3: {
    opcode: 'control_if', next: null, parent: 'up2',
    inputs: { CONDITION: [2, 'up4'], SUBSTACK: [2, 'up5'] },
    fields: {}, shadow: false, topLevel: false,
  },
  up4: {
    opcode: 'sensing_touchingcolor', next: null, parent: 'up3',
    inputs: { COLOR: [1, [9, '#b86a2a']] },
    fields: {}, shadow: false, topLevel: false,
  },
  up5: {
    opcode: 'motion_changeyby', next: null, parent: 'up3',
    inputs: { DY: [1, [4, '-10']] }, fields: {}, shadow: false, topLevel: false,
  },

  // down arrow
  dn1: {
    opcode: 'event_whenkeypressed', next: 'dn2', parent: null, inputs: {},
    fields: { KEY_OPTION: ['down arrow', null] },
    shadow: false, topLevel: true, x: 420, y: 240,
  },
  dn2: {
    opcode: 'motion_changeyby', next: 'dn3', parent: 'dn1',
    inputs: { DY: [1, [4, '-10']] }, fields: {}, shadow: false, topLevel: false,
  },
  dn3: {
    opcode: 'control_if', next: null, parent: 'dn2',
    inputs: { CONDITION: [2, 'dn4'], SUBSTACK: [2, 'dn5'] },
    fields: {}, shadow: false, topLevel: false,
  },
  dn4: {
    opcode: 'sensing_touchingcolor', next: null, parent: 'dn3',
    inputs: { COLOR: [1, [9, '#b86a2a']] },
    fields: {}, shadow: false, topLevel: false,
  },
  dn5: {
    opcode: 'motion_changeyby', next: null, parent: 'dn3',
    inputs: { DY: [1, [4, '10']] }, fields: {}, shadow: false, topLevel: false,
  },

  // left arrow
  lf1: {
    opcode: 'event_whenkeypressed', next: 'lf2', parent: null, inputs: {},
    fields: { KEY_OPTION: ['left arrow', null] },
    shadow: false, topLevel: true, x: 420, y: 460,
  },
  lf2: {
    opcode: 'motion_changexby', next: 'lf3', parent: 'lf1',
    inputs: { DX: [1, [4, '-10']] }, fields: {}, shadow: false, topLevel: false,
  },
  lf3: {
    opcode: 'control_if', next: null, parent: 'lf2',
    inputs: { CONDITION: [2, 'lf4'], SUBSTACK: [2, 'lf5'] },
    fields: {}, shadow: false, topLevel: false,
  },
  lf4: {
    opcode: 'sensing_touchingcolor', next: null, parent: 'lf3',
    inputs: { COLOR: [1, [9, '#b86a2a']] },
    fields: {}, shadow: false, topLevel: false,
  },
  lf5: {
    opcode: 'motion_changexby', next: null, parent: 'lf3',
    inputs: { DX: [1, [4, '10']] }, fields: {}, shadow: false, topLevel: false,
  },

  // right arrow
  rt1: {
    opcode: 'event_whenkeypressed', next: 'rt2', parent: null, inputs: {},
    fields: { KEY_OPTION: ['right arrow', null] },
    shadow: false, topLevel: true, x: 420, y: 680,
  },
  rt2: {
    opcode: 'motion_changexby', next: 'rt3', parent: 'rt1',
    inputs: { DX: [1, [4, '10']] }, fields: {}, shadow: false, topLevel: false,
  },
  rt3: {
    opcode: 'control_if', next: null, parent: 'rt2',
    inputs: { CONDITION: [2, 'rt4'], SUBSTACK: [2, 'rt5'] },
    fields: {}, shadow: false, topLevel: false,
  },
  rt4: {
    opcode: 'sensing_touchingcolor', next: null, parent: 'rt3',
    inputs: { COLOR: [1, [9, '#b86a2a']] },
    fields: {}, shadow: false, topLevel: false,
  },
  rt5: {
    opcode: 'motion_changexby', next: null, parent: 'rt3',
    inputs: { DX: [1, [4, '-10']] }, fields: {}, shadow: false, topLevel: false,
  },

  // win loop: when flag clicked -> forever -> if touching eagle -> say + stop
  w1: {
    opcode: 'event_whenflagclicked',
    next: 'w2', parent: null, inputs: {}, fields: {},
    shadow: false, topLevel: true, x: 40, y: 280,
  },
  w2: {
    opcode: 'control_forever',
    next: null, parent: 'w1',
    inputs: { SUBSTACK: [2, 'w3'] },
    fields: {}, shadow: false, topLevel: false,
  },
  w3: {
    opcode: 'control_if',
    next: null, parent: 'w2',
    inputs: { CONDITION: [2, 'w4'], SUBSTACK: [2, 'ws'] }, // substack now starts with sound
    fields: {}, shadow: false, topLevel: false,
  },
  w4: {
    opcode: 'sensing_touchingobject',
    next: null, parent: 'w3',
    inputs: { TOUCHINGOBJECTMENU: [1, 'w5'] },
    fields: {}, shadow: false, topLevel: false,
  },
  w5: {
    opcode: 'sensing_touchingobjectmenu',
    next: null, parent: 'w4',
    inputs: {},
    fields: { TOUCHINGOBJECTMENU: ['\u8001\u9df9\u57fa\u5730', null] }, // 老鷹基地
    shadow: true, topLevel: false,
  },
  // 🆕 victory sound: play until done
  ws: {
    opcode: 'sound_playuntildone',
    next: 'w6', parent: 'w3',
    inputs: { SOUND_MENU: [1, 'wsm'] },
    fields: {}, shadow: false, topLevel: false,
  },
  wsm: {
    opcode: 'sound_sounds_menu',
    next: null, parent: 'ws',
    inputs: {},
    fields: { SOUND_MENU: ['\u52dd\u5229', null] }, // 勝利
    shadow: true, topLevel: false,
  },
  w6: {
    opcode: 'looks_sayforsecs',
    next: 'w7', parent: 'ws',
    inputs: {
      MESSAGE: [1, [10, '\u6211\u8d0f\u4e86\uff01']], // 我贏了！
      SECS: [1, [4, '2']],
    },
    fields: {}, shadow: false, topLevel: false,
  },
  w7: {
    opcode: 'control_stop',
    next: null, parent: 'w6',
    inputs: {}, fields: { STOP_OPTION: ['all', null] },
    shadow: false, topLevel: false,
    mutation: { tagName: 'mutation', children: [], hasnext: 'false' },
  },
};

// ---------- Tank: per-backdrop reset (tank start is same for all scenes) ----------
SCENES.forEach((scene, i) => {
  const k = `bd${i}`;
  tankBlocks[`${k}_1`] = {
    opcode: 'event_whenbackdropswitchesto', next: `${k}_2`, parent: null, inputs: {},
    fields: { BACKDROP: [scene.name, null] },
    shadow: false, topLevel: true, x: 820, y: 20 + i * 160,
  };
  tankBlocks[`${k}_2`] = {
    opcode: 'motion_gotoxy', next: null, parent: `${k}_1`,
    inputs: { X: [1, [4, '0']], Y: [1, [4, '-120']] },
    fields: {}, shadow: false, topLevel: false,
  };
});

// ---------- Eagle blocks: per-backdrop reposition ----------
const eagleBlocks = {};
SCENES.forEach((scene, i) => {
  const k = `eb${i}`;
  eagleBlocks[`${k}_1`] = {
    opcode: 'event_whenbackdropswitchesto', next: `${k}_2`, parent: null, inputs: {},
    fields: { BACKDROP: [scene.name, null] },
    shadow: false, topLevel: true, x: 40, y: 20 + i * 160,
  };
  eagleBlocks[`${k}_2`] = {
    opcode: 'motion_gotoxy', next: null, parent: `${k}_1`,
    inputs: { X: [1, [4, String(scene.eagle.x)]], Y: [1, [4, String(scene.eagle.y)]] },
    fields: {}, shadow: false, topLevel: false,
  };
});

// ---------- Brick blocks: per-backdrop visibility ----------
// 1-1~1-3 hide; 1-4 show + go to front layer (so duplicates don't get stuck
// under tank/eagle).  No goto in event substacks → kid's drag positions
// persist across scene switches.
const brickBlocks = {};
SCENES.forEach((scene, i) => {
  const k = `kb${i}`;
  const isSandbox = scene.name === '1-4_\u6c99\u76d2'; // 1-4_沙盒
  brickBlocks[`${k}_1`] = {
    opcode: 'event_whenbackdropswitchesto', next: `${k}_2`, parent: null, inputs: {},
    fields: { BACKDROP: [scene.name, null] },
    shadow: false, topLevel: true, x: 40, y: 20 + i * 180,
  };
  if (isSandbox) {
    brickBlocks[`${k}_2`] = {
      opcode: 'looks_show',
      next: `${k}_3`, parent: `${k}_1`, inputs: {}, fields: {},
      shadow: false, topLevel: false,
    };
    brickBlocks[`${k}_3`] = {
      opcode: 'looks_gotofrontback',
      next: null, parent: `${k}_2`, inputs: {},
      fields: { FRONT_BACK: ['front', null] },
      shadow: false, topLevel: false,
    };
  } else {
    brickBlocks[`${k}_2`] = {
      opcode: 'looks_hide',
      next: null, parent: `${k}_1`, inputs: {}, fields: {},
      shadow: false, topLevel: false,
    };
  }
});

// Brick green-flag handler — covers the "file loaded directly into 1-4"
// edge case where the backdrop-switch event never fires:
//   when flag clicked
//   if <backdrop name = "1-4_沙盒"> { show + go-to-front } else { hide }
brickBlocks.gf_1 = {
  opcode: 'event_whenflagclicked',
  next: 'gf_2', parent: null, inputs: {}, fields: {},
  shadow: false, topLevel: true, x: 480, y: 20,
};
brickBlocks.gf_2 = {
  opcode: 'control_if_else',
  next: null, parent: 'gf_1',
  inputs: {
    CONDITION: [2, 'gf_3'],
    SUBSTACK: [2, 'gf_5'],
    SUBSTACK2: [2, 'gf_7'],
  },
  fields: {}, shadow: false, topLevel: false,
};
brickBlocks.gf_3 = {
  opcode: 'operator_equals',
  next: null, parent: 'gf_2',
  inputs: {
    OPERAND1: [3, 'gf_4', [10, '']],
    OPERAND2: [1, [10, '1-4_\u6c99\u76d2']], // 1-4_沙盒
  },
  fields: {}, shadow: false, topLevel: false,
};
brickBlocks.gf_4 = {
  opcode: 'looks_backdropnumbername',
  next: null, parent: 'gf_3', inputs: {},
  fields: { NUMBER_NAME: ['name', null] },
  shadow: false, topLevel: false,
};
brickBlocks.gf_5 = {
  opcode: 'looks_show',
  next: 'gf_6', parent: 'gf_2', inputs: {}, fields: {},
  shadow: false, topLevel: false,
};
brickBlocks.gf_6 = {
  opcode: 'looks_gotofrontback',
  next: null, parent: 'gf_5', inputs: {},
  fields: { FRONT_BACK: ['front', null] },
  shadow: false, topLevel: false,
};
brickBlocks.gf_7 = {
  opcode: 'looks_hide',
  next: null, parent: 'gf_2', inputs: {}, fields: {},
  shadow: false, topLevel: false,
};

// ---------- project.json ----------
const project = {
  targets: [
    {
      isStage: true,
      name: 'Stage',
      variables: {}, lists: {}, broadcasts: {}, blocks: {}, comments: {},
      currentCostume: 0,
      costumes: SCENES.map((scene, i) => ({
        assetId: sceneAssets[i].assetId,
        name: scene.name,
        bitmapResolution: 1,
        md5ext: sceneAssets[i].md5ext,
        dataFormat: 'svg',
        rotationCenterX: 240, rotationCenterY: 180,
      })),
      sounds: [], volume: 100, layerOrder: 0,
      tempo: 60, videoTransparency: 50, videoState: 'on', textToSpeechLanguage: null,
    },
    {
      isStage: false,
      name: '\u73a9\u5bb6\u5766\u514b', // 玩家坦克
      variables: {}, lists: {}, broadcasts: {}, blocks: tankBlocks, comments: {},
      currentCostume: 0,
      costumes: [
        {
          assetId: tankAssetUp.assetId, name: '\u5766\u514b-\u4e0a', // 坦克-上
          bitmapResolution: 1, md5ext: tankAssetUp.md5ext,
          dataFormat: 'svg', rotationCenterX: 20, rotationCenterY: 20,
        },
        {
          assetId: tankAssetDown.assetId, name: '\u5766\u514b-\u4e0b', // 坦克-下
          bitmapResolution: 1, md5ext: tankAssetDown.md5ext,
          dataFormat: 'svg', rotationCenterX: 20, rotationCenterY: 20,
        },
        {
          assetId: tankAssetLeft.assetId, name: '\u5766\u514b-\u5de6', // 坦克-左
          bitmapResolution: 1, md5ext: tankAssetLeft.md5ext,
          dataFormat: 'svg', rotationCenterX: 20, rotationCenterY: 20,
        },
        {
          assetId: tankAssetRight.assetId, name: '\u5766\u514b-\u53f3', // 坦克-右
          bitmapResolution: 1, md5ext: tankAssetRight.md5ext,
          dataFormat: 'svg', rotationCenterX: 20, rotationCenterY: 20,
        },
      ],
      sounds: [{
        name: '\u52dd\u5229', // 勝利
        assetId: victoryAsset.assetId,
        dataFormat: 'wav',
        format: '',
        rate: victoryAsset.sampleRate,
        sampleCount: victoryAsset.sampleCount,
        md5ext: victoryAsset.md5ext,
      }],
      volume: 100, layerOrder: 3,
      visible: true, x: 0, y: -120, size: 100, direction: 90,
      draggable: false, rotationStyle: 'don\'t rotate',
    },
    {
      isStage: false,
      name: '\u8001\u9df9\u57fa\u5730', // 老鷹基地
      variables: {}, lists: {}, broadcasts: {}, blocks: eagleBlocks, comments: {},
      currentCostume: 0,
      costumes: [{
        assetId: eagleAsset.assetId, name: '\u8001\u9df9',
        bitmapResolution: 1,
        md5ext: eagleAsset.md5ext,
        dataFormat: 'svg', rotationCenterX: 24, rotationCenterY: 24,
      }],
      sounds: [], volume: 100, layerOrder: 2,
      visible: true, x: SCENES[0].eagle.x, y: SCENES[0].eagle.y, size: 100, direction: 90,
      draggable: true, rotationStyle: 'don\'t rotate',
    },
    {
      isStage: false,
      name: '\u78da\u7246', // 磚牆
      variables: {}, lists: {}, broadcasts: {}, blocks: brickBlocks, comments: {},
      currentCostume: 0,
      costumes: [{
        assetId: brickAsset.assetId, name: '\u78da\u584a',
        bitmapResolution: 1,
        md5ext: brickAsset.md5ext,
        dataFormat: 'svg', rotationCenterX: 16, rotationCenterY: 16,
      }],
      sounds: [], volume: 100, layerOrder: 1,
      visible: false, x: -100, y: 0, size: 100, direction: 90,
      draggable: true, rotationStyle: 'don\'t rotate',
    },
  ],
  monitors: [], extensions: [],
  meta: { semver: '3.0.0', vm: '2.3.0', agent: 'Hacci-Lesson2-Builder' },
};

fs.writeFileSync(path.join(BUILD_DIR, 'project.json'), JSON.stringify(project, null, 2), 'utf8');

// ---------- zip ----------
const sb3Path = path.join(OUT_DIR, 'Lesson2_BattleCity.sb3');
const output = fs.createWriteStream(sb3Path);
const archive = archiver('zip', { zlib: { level: 9 } });
output.on('close', () => console.log(`built ${sb3Path} (${archive.pointer()} bytes)`));
archive.on('error', err => { throw err; });
archive.pipe(output);
archive.directory(BUILD_DIR, false);
archive.finalize();
