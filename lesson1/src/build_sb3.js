// Lesson 1 .sb3 builder — tank + eagle + bricks + arrow-key movement + win condition
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ZipArchive } = require('archiver');

const OUT_DIR = path.join(__dirname, '..');
const BUILD_DIR = path.join(__dirname, 'build_sb3');
fs.rmSync(BUILD_DIR, { recursive: true, force: true });
fs.mkdirSync(BUILD_DIR, { recursive: true });

// ---------- SVG assets ----------

const battlefieldSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">
  <rect width="480" height="360" fill="#1a1a1a"/>
  <g fill="#2a2a2a">
    ${Array.from({length: 15}, (_, i) =>
      Array.from({length: 12}, (_, j) =>
        `<rect x="${i*32}" y="${j*30}" width="30" height="28" />`
      ).join('')
    ).join('')}
  </g>
  <rect x="0" y="0" width="480" height="360" fill="none" stroke="#4caf50" stroke-width="4"/>
  <text x="240" y="30" font-family="Arial" font-size="18" fill="#4caf50" text-anchor="middle">BATTLE CITY</text>
</svg>`;

const tankUpSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
  <rect x="2" y="6" width="8" height="28" fill="#2e7d32" stroke="#1b5e20" stroke-width="1"/>
  <rect x="30" y="6" width="8" height="28" fill="#2e7d32" stroke="#1b5e20" stroke-width="1"/>
  ${[8,14,20,26,32].map(y => `<line x1="2" y1="${y}" x2="10" y2="${y}" stroke="#1b5e20" stroke-width="1"/><line x1="30" y1="${y}" x2="38" y2="${y}" stroke="#1b5e20" stroke-width="1"/>`).join('')}
  <rect x="10" y="10" width="20" height="22" fill="#4caf50" stroke="#1b5e20" stroke-width="1"/>
  <circle cx="20" cy="20" r="6" fill="#66bb6a" stroke="#1b5e20" stroke-width="1"/>
  <rect x="18" y="2" width="4" height="14" fill="#1b5e20"/>
</svg>`;

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

const bgAsset = writeAsset(battlefieldSVG);
const tankAsset = writeAsset(tankUpSVG);
const brickAsset = writeAsset(brickSVG);
const eagleAsset = writeAsset(eagleSVG);

// ---------- Tank blocks: init + 4 arrow keys + win detection ----------

const tankBlocks = {
  // init: when flag clicked -> goto -> set size -> set rotation style
  init1: {
    opcode: 'event_whenflagclicked',
    next: 'init2', parent: null, inputs: {}, fields: {},
    shadow: false, topLevel: true, x: 30, y: 30,
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
    shadow: false, topLevel: true, x: 250, y: 30,
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
    shadow: false, topLevel: true, x: 250, y: 150,
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
    shadow: false, topLevel: true, x: 250, y: 270,
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
    shadow: false, topLevel: true, x: 250, y: 390,
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
    shadow: false, topLevel: true, x: 30, y: 250,
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
    inputs: { CONDITION: [2, 'w4'], SUBSTACK: [2, 'w6'] },
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
  w6: {
    opcode: 'looks_sayforsecs',
    next: 'w7', parent: 'w3',
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

// ---------- project.json ----------
const project = {
  targets: [
    {
      isStage: true,
      name: 'Stage',
      variables: {}, lists: {}, broadcasts: {}, blocks: {}, comments: {},
      currentCostume: 0,
      costumes: [{
        assetId: bgAsset.assetId, name: '\u6230\u5834', md5ext: bgAsset.md5ext, // 戰場
        dataFormat: 'svg', rotationCenterX: 240, rotationCenterY: 180,
      }],
      sounds: [], volume: 100, layerOrder: 0,
      tempo: 60, videoTransparency: 50, videoState: 'on', textToSpeechLanguage: null,
    },
    {
      isStage: false,
      name: '\u73a9\u5bb6\u5766\u514b', // 玩家坦克
      variables: {}, lists: {}, broadcasts: {}, blocks: tankBlocks, comments: {},
      currentCostume: 0,
      costumes: [{
        assetId: tankAsset.assetId, name: '\u5766\u514b-\u4e0a', md5ext: tankAsset.md5ext,
        dataFormat: 'svg', rotationCenterX: 20, rotationCenterY: 20,
      }],
      sounds: [], volume: 100, layerOrder: 3,
      visible: true, x: 0, y: -120, size: 100, direction: 90,
      draggable: false, rotationStyle: 'don\'t rotate',
    },
    {
      isStage: false,
      name: '\u8001\u9df9\u57fa\u5730', // 老鷹基地
      variables: {}, lists: {}, broadcasts: {}, blocks: {}, comments: {},
      currentCostume: 0,
      costumes: [{
        assetId: eagleAsset.assetId, name: '\u8001\u9df9', md5ext: eagleAsset.md5ext,
        dataFormat: 'svg', rotationCenterX: 24, rotationCenterY: 24,
      }],
      sounds: [], volume: 100, layerOrder: 2,
      visible: true, x: 0, y: 120, size: 100, direction: 90,
      draggable: true, rotationStyle: 'don\'t rotate',
    },
    {
      isStage: false,
      name: '\u78da\u7246', // 磚牆
      variables: {}, lists: {}, broadcasts: {}, blocks: {}, comments: {},
      currentCostume: 0,
      costumes: [{
        assetId: brickAsset.assetId, name: '\u78da\u584a', md5ext: brickAsset.md5ext,
        dataFormat: 'svg', rotationCenterX: 16, rotationCenterY: 16,
      }],
      sounds: [], volume: 100, layerOrder: 1,
      visible: true, x: -100, y: 0, size: 100, direction: 90,
      draggable: true, rotationStyle: 'don\'t rotate',
    },
  ],
  monitors: [], extensions: [],
  meta: { semver: '3.0.0', vm: '2.3.0', agent: 'Hacci-Lesson1-Builder' },
};

fs.writeFileSync(path.join(BUILD_DIR, 'project.json'), JSON.stringify(project, null, 2), 'utf8');

// ---------- zip ----------
const sb3Path = path.join(OUT_DIR, 'Lesson1_BattleCity.sb3');
const output = fs.createWriteStream(sb3Path);
const archive = new ZipArchive({ zlib: { level: 9 } });
output.on('close', () => console.log(`built ${sb3Path} (${archive.pointer()} bytes)`));
archive.on('error', err => { throw err; });
archive.pipe(output);
archive.directory(BUILD_DIR, false);
archive.finalize();
