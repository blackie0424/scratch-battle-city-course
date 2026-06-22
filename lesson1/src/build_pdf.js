// Lesson 1 PDF — 4-scene progression: 1-1 straight, 1-2 corner, 1-3 maze, 1-4 sandbox
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const OUT = path.join(__dirname, '..', 'Lesson1_新手教學.pdf');
const FONT = path.join(__dirname, '..', '..', 'fonts', 'NotoSansTC-Regular.otf');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 50, left: 55, right: 55 },
  info: {
    Title: '坦克大戰 Scratch 第 1 堂：4 關闖關 + 自己設計',
    Author: 'Hacci',
    Subject: 'Scratch 新手教學（國小二年級）',
  },
});

doc.registerFont('CJK', FONT);
doc.font('CJK');
doc.pipe(fs.createWriteStream(OUT));

const C = {
  green: '#2e7d32',
  greenLight: '#e8f5e9',
  brown: '#8d4a1e',
  brownLight: '#b86a2a',
  dark: '#1a1a1a',
  gray: '#666',
  rule: '#cccccc',
  yellow: '#fff8e1',
  gold: '#daa520',
  goldLight: '#fff3c4',
  blue: '#1976d2',
  blueLight: '#e3f2fd',
  red: '#c62828',
  redLight: '#ffebee',
};
const PAGE_W = doc.page.width;
const PAGE_H = doc.page.height;
const ML = doc.page.margins.left;
const MR = doc.page.margins.right;
const MB = doc.page.margins.bottom;
const CONTENT_W = PAGE_W - ML - MR;

function ensureSpace(min) {
  if (doc.y + min > PAGE_H - MB) doc.addPage();
}

function H1(text) {
  ensureSpace(60);
  doc.x = ML;
  doc.fillColor(C.green).fontSize(20).text(text, { align: 'left' });
  doc.moveDown(0.2);
  const y = doc.y;
  doc.moveTo(ML, y).lineTo(PAGE_W - MR, y).strokeColor(C.green).lineWidth(2).stroke();
  doc.moveDown(0.7);
}

function H2(text) {
  ensureSpace(40);
  doc.x = ML;
  doc.fillColor(C.dark).fontSize(14).text(text);
  doc.moveDown(0.3);
}

function P(text, opts = {}) {
  doc.x = ML;
  doc.fillColor(C.dark).fontSize(11).text(text, { lineGap: 4, width: CONTENT_W, ...opts });
  doc.moveDown(0.4);
}

function Step(num, title, body) {
  ensureSpace(70);
  const startY = doc.y;
  doc.save();
  doc.circle(ML + 10, startY + 9, 11).fillColor(C.green).fill();
  doc.fillColor('white').fontSize(12).text(String(num), ML + 4, startY + 3, { width: 12, align: 'center' });
  doc.restore();
  doc.fillColor(C.dark).fontSize(12);
  doc.text(title, ML + 30, startY, { width: CONTENT_W - 30, lineGap: 3 });
  doc.fillColor(C.dark).fontSize(11);
  doc.text(body, ML + 30, doc.y + 2, { width: CONTENT_W - 30, lineGap: 4 });
  doc.moveDown(0.7);
  doc.x = ML;
}

function Box(text, bgColor, labelColor, label) {
  doc.fontSize(10);
  const innerW = CONTENT_W - 16;
  const labelText = label + '  ';
  const textH = doc.heightOfString(labelText + text, { width: innerW, lineGap: 3 });
  const boxH = textH + 16;
  ensureSpace(boxH + 10);
  const boxY = doc.y;
  doc.save();
  doc.roundedRect(ML, boxY, CONTENT_W, boxH, 6).fillColor(bgColor).fill();
  doc.restore();
  doc.fillColor(labelColor).fontSize(10).text(labelText, ML + 8, boxY + 8, { continued: true, width: innerW, lineGap: 3 });
  doc.fillColor(C.dark).text(text);
  doc.y = boxY + boxH + 8;
  doc.x = ML;
}

const Tip = (t) => Box(t, C.greenLight, C.green, '[ 小提示 ]');
const Warn = (t) => Box(t, C.redLight, C.red, '[ 注意！ ]');

function Spacer(n = 1) { doc.moveDown(n); }

// ============= mini drawing helpers =============
function drawTank(x, y, size = 16) {
  const s = size / 40;
  doc.save();
  doc.translate(x, y);
  doc.scale(s);
  doc.rect(2, 6, 8, 28).fillAndStroke('#2e7d32', '#1b5e20');
  doc.rect(30, 6, 8, 28).fillAndStroke('#2e7d32', '#1b5e20');
  doc.rect(10, 10, 20, 22).fillAndStroke('#4caf50', '#1b5e20');
  doc.circle(20, 20, 6).fillAndStroke('#66bb6a', '#1b5e20');
  doc.rect(18, 2, 4, 14).fillAndStroke('#1b5e20', '#1b5e20');
  doc.restore();
}

function drawBrick(x, y, size = 14) {
  doc.save();
  doc.rect(x, y, size, size).fillAndStroke(C.brownLight, '#3e2010');
  doc.moveTo(x, y + size/2).lineTo(x + size, y + size/2).strokeColor('#3e2010').stroke();
  doc.moveTo(x + size/2, y).lineTo(x + size/2, y + size/2).strokeColor('#3e2010').stroke();
  doc.moveTo(x + size/4, y + size/2).lineTo(x + size/4, y + size).strokeColor('#3e2010').stroke();
  doc.moveTo(x + 3*size/4, y + size/2).lineTo(x + 3*size/4, y + size).strokeColor('#3e2010').stroke();
  doc.restore();
}

function drawEagle(x, y, size = 18) {
  const s = size / 48;
  doc.save();
  doc.translate(x, y);
  doc.scale(s);
  doc.roundedRect(2, 2, 44, 44, 4).fillAndStroke(C.goldLight, '#b8860b');
  doc.moveTo(24, 10).lineTo(18, 18).lineTo(10, 22).lineTo(16, 22).lineTo(12, 28).lineTo(18, 26)
     .lineTo(16, 36).lineTo(24, 32).lineTo(32, 36).lineTo(30, 26).lineTo(36, 28).lineTo(32, 22)
     .lineTo(38, 22).lineTo(30, 18).closePath().fillAndStroke(C.gold, '#704c00');
  doc.circle(24, 14, 3).fillAndStroke(C.gold, '#704c00');
  doc.restore();
}

// Draw a mini level diagram (15x12 grid)
// brickCells: array of [col, row]; tank: {col, row}; eagle: {col, row}
function drawLevel(x, y, w, h, title, brickCells, tank, eagle) {
  const cols = 15, rows = 12;
  const cellW = w / cols;
  const cellH = h / rows;
  doc.save();
  doc.rect(x, y, w, h).fillAndStroke('#1a1a1a', '#4caf50').lineWidth(1.5).stroke();
  doc.restore();
  for (const [c, r] of brickCells) {
    drawBrick(x + c * cellW, y + r * cellH, Math.min(cellW, cellH));
  }
  if (tank) drawTank(x + tank.col * cellW - 4, y + tank.row * cellH - 4, Math.min(cellW, cellH) * 1.5);
  if (eagle) drawEagle(x + eagle.col * cellW - 4, y + eagle.row * cellH - 4, Math.min(cellW, cellH) * 1.8);
  if (title) {
    doc.fillColor(C.dark).fontSize(10).text(title, x, y + h + 4, { width: w, align: 'center' });
  }
}

// ============= Scene definitions (matches build_sb3.js) =============
const rng = (a, b) => Array.from({length: b - a + 1}, (_, i) => i + a);
const SCENE_LAYOUTS = {
  '1-1': {
    bricks: [
      ...rng(0, 11).map(r => [4, r]),
      ...rng(0, 11).map(r => [10, r]),
    ],
    tank: { col: 7, row: 8 },
    eagle: { col: 7, row: 1 },
  },
  '1-2': {
    bricks: [
      ...rng(0, 9).map(c => [c, 4]),
      ...rng(0, 9).map(c => [c, 5]),
    ],
    tank: { col: 7, row: 8 },
    eagle: { col: 11, row: 1 },
  },
  '1-3': {
    bricks: [
      ...rng(0, 9).map(c => [c, 4]),
      ...rng(5, 14).map(c => [c, 7]),
    ],
    tank: { col: 7, row: 8 },
    eagle: { col: 13, row: 1 },
  },
  '1-4': {
    bricks: [],
    tank: { col: 7, row: 8 },
    eagle: { col: 7, row: 1 },
  },
};

// =====================================================================
// PAGE 1: COVER
// =====================================================================
doc.fillColor(C.gray).fontSize(11).text('坦克大戰 Scratch 課程   ·   國小二年級', ML, 50, { align: 'right', width: CONTENT_W });
Spacer(2);
doc.fillColor(C.green).fontSize(32).text('第 1 堂課', { align: 'center' });
Spacer(0.2);
doc.fillColor(C.dark).fontSize(18).text('4 關闖關 + 自己當設計師', { align: 'center' });
Spacer(0.6);
doc.fillColor(C.gray).fontSize(11).text('給第一次寫程式的小朋友   ·   約 60 ~ 80 分鐘', { align: 'center' });

Spacer(1.5);

// 4-scene roadmap
const lvW = (CONTENT_W - 30) / 4;
const lvH = lvW * 12 / 15;
const lvY = doc.y;
['1-1', '1-2', '1-3', '1-4'].forEach((key, i) => {
  const layout = SCENE_LAYOUTS[key];
  const x = ML + (lvW + 10) * i;
  drawLevel(x, lvY, lvW, lvH, null, layout.bricks, layout.tank, layout.eagle);
  doc.fillColor(C.green).fontSize(11).text(key, x, lvY + lvH + 4, { width: lvW, align: 'center' });
  const names = { '1-1': '直線', '1-2': '轉彎', '1-3': '迷宮', '1-4': '沙盒' };
  doc.fillColor(C.dark).fontSize(9).text(names[key], x, lvY + lvH + 18, { width: lvW, align: 'center' });
});
doc.y = lvY + lvH + 50;

// Info card
const cardX = ML + 20;
const cardW = CONTENT_W - 40;
const cardY = doc.y;
const cardH = 175;
doc.save();
doc.roundedRect(cardX, cardY, cardW, cardH, 10).fillColor(C.greenLight).fill();
doc.restore();
doc.fillColor(C.green).fontSize(13).text('今天的任務', cardX + 16, cardY + 12);
doc.fillColor(C.dark).fontSize(11).text(
  '1.  打開老師給你的遊戲檔  Lesson1_BattleCity.sb3\n' +
  '2.  玩 1-1 → 1-2 → 1-3 三個關卡（按 ← ↑ → ↓ 開坦克碰老鷹）\n' +
  '3.  學會「換背景」就是「換關卡」\n' +
  '4.  到 1-4 自己擺磚塊，設計關卡',
  cardX + 16, cardY + 36, { width: cardW - 32, lineGap: 6 }
);
doc.fillColor(C.green).fontSize(13).text('開始之前', cardX + 16, cardY + 122);
doc.fillColor(C.dark).fontSize(11).text(
  '電腦上網 → 打開 scratch.mit.edu   ·   記得開喇叭！',
  cardX + 16, cardY + 144, { width: cardW - 32 }
);

doc.y = cardY + cardH + 20;
doc.fillColor(C.gray).fontSize(9).text('Hacci × Wu   ·   Battle City Edition', ML, doc.y, { align: 'center', width: CONTENT_W });

// =====================================================================
// PAGE 2: open the file + interface tour
// =====================================================================
doc.addPage();
H1('一、打開遊戲檔');

Step(1, '打開瀏覽器，去  scratch.mit.edu',
  '網址列輸入：scratch.mit.edu  （一定要是 .mit.edu，不要寫錯！）按 Enter。');

Step(2, '點橘色的「Create / 創造」按鈕',
  '網頁上面有一顆橘色的圓角按鈕，英文寫 Create，中文寫「創造」。\n按下去，編輯器會自己打開。');

Step(3, '左上角  File / 檔案 → Load from your computer',
  '英文 File（檔案）→ 中文「從你的電腦上載」。選老師給你的 Lesson1_BattleCity.sb3。');

Warn('開檔時會跳出「要捨棄目前的專案嗎？」按「OK / 確定」就好！');

H1('二、認識編輯器');

P('Scratch 畫面分成 4 個區塊，這次要特別注意右下角的「舞台面板」：');

// editor schematic
const sx = ML, sw = CONTENT_W, sy = doc.y, sh = 170;
doc.save();
doc.rect(sx, sy, sw, sh).strokeColor(C.rule).lineWidth(1).stroke();
doc.rect(sx, sy, sw * 0.25, sh).fillColor(C.yellow).fillAndStroke(C.yellow, C.rule);
doc.rect(sx + sw * 0.25, sy, sw * 0.45, sh).fillColor('#f5f5f5').fillAndStroke('#f5f5f5', C.rule);
doc.rect(sx + sw * 0.70, sy, sw * 0.30, sh * 0.55).fillColor('#1a1a1a').fillAndStroke('#1a1a1a', C.rule);
doc.rect(sx + sw * 0.70, sy + sh * 0.55, sw * 0.15, sh * 0.45).fillColor('#ffe0b2').fillAndStroke('#ffe0b2', C.rule);
doc.rect(sx + sw * 0.85, sy + sh * 0.55, sw * 0.15, sh * 0.45).fillColor('#ffffff').fillAndStroke('#ffffff', C.rule);
doc.restore();
doc.fillColor(C.dark).fontSize(10);
doc.text('1\n積木區', sx + 4, sy + 60, { width: sw * 0.25 - 8, align: 'center' });
doc.text('2\n程式區', sx + sw * 0.25 + 4, sy + 60, { width: sw * 0.45 - 8, align: 'center' });
doc.fillColor('#fff').text('3 舞台', sx + sw * 0.70 + 4, sy + 40, { width: sw * 0.30 - 8, align: 'center' });
doc.fillColor(C.red).fontSize(9).text('4 舞台面板\n（換關卡用）', sx + sw * 0.70 + 4, sy + sh * 0.55 + 10, { width: sw * 0.15 - 8, align: 'center' });
doc.fillColor(C.dark).fontSize(9).text('5 角色清單', sx + sw * 0.85 + 4, sy + sh * 0.55 + 18, { width: sw * 0.15 - 8, align: 'center' });
doc.y = sy + sh + 10;

P('・1 積木區　・2 程式區　・3 舞台（看遊戲畫面）');
P('・4 舞台面板（橘色那塊，新的重點！按它就能換關卡背景）');
P('・5 角色清單（之前看過：玩家坦克、老鷹基地、磚牆）');

// =====================================================================
// PAGE 3: scene 1-1
// =====================================================================
doc.addPage();
H1('三、第 1 關  1-1  直線');

// scene preview
const previewY = doc.y;
const previewW = 260;
const previewH = previewW * 12 / 15;
const previewX = ML + (CONTENT_W - previewW) / 2;
const layout11 = SCENE_LAYOUTS['1-1'];
drawLevel(previewX, previewY, previewW, previewH, '1-1 直線：按 ↑ 就過關！', layout11.bricks, layout11.tank, layout11.eagle);
doc.y = previewY + previewH + 22;

P('剛打開的時候，舞台會顯示「1-1 直線」這個關卡。');

Step(1, '按舞台上方的綠旗 ▶',
  '坦克自動跳到舞台下方中間，準備好出發！');

Step(2, '按  ↑  方向鍵',
  '一直按 ↑，坦克會穿過中間的走道。\n左右兩邊有磚牆，坦克會被擋住、不能穿過。');

Step(3, '碰到金色老鷹',
  '當坦克碰到老鷹：\n   ▸  播放「叮叮叮叮」勝利音效\n   ▸  說「我贏了！」\n   ▸  遊戲自動停下來');

Tip('如果按 ↑ 沒反應，先用滑鼠點一下舞台（讓 Scratch 知道你在玩遊戲）。');

// =====================================================================
// PAGE 4: change scene + 1-2
// =====================================================================
doc.addPage();
H1('四、怎麼換關卡？');

P('這是這堂課最重要的一個操作 — 用「舞台面板」換背景圖。');

Step(1, '點右下角的「舞台」（小縮圖）',
  '右下角有 4 個小方框（角色清單）的左邊，還有一個更小的「舞台」縮圖。\n點它一下。');

Step(2, '按左上方的「背景」頁籤',
  '上方有 3 個頁籤：「程式 / 背景 / 聲音」。\n點「背景」（英文 Backdrops）。');

Step(3, '左邊會出現 4 個背景小圖',
  '看到了嗎？  1-1_直線、1-2_轉彎、1-3_迷宮、1-4_沙盒。\n它們就是 4 個關卡！');

Step(4, '點「1-2_轉彎」',
  '舞台上的磚牆會立刻變成 1-2 的樣子。\n坦克和老鷹也會自動跳到 1-2 的位置。\n（不用按綠旗，自動就好！）');

Tip('這就是「換關卡 = 換背景」的操作。任何時候想換關卡，回到這裡按就好。');

H1('五、第 2 關  1-2  轉彎');

const lY = doc.y;
const layout12 = SCENE_LAYOUTS['1-2'];
const smallW = 200, smallH = smallW * 12 / 15;
const smallX = ML + (CONTENT_W - smallW) / 2;
drawLevel(smallX, lY, smallW, smallH, '1-2 轉彎：直走會撞牆，要往右繞', layout12.bricks, layout12.tank, layout12.eagle);
doc.y = lY + smallH + 22;

P('1-2 中間有一面很長的橫牆擋著。坦克要先 ↑ 走幾步，然後 →，再 ↑。');
P('提示：先按 ↑ 試試看，撞牆了就改按 → 試。');

// =====================================================================
// PAGE 5: scene 1-3
// =====================================================================
doc.addPage();
H1('六、第 3 關  1-3  迷宮');

P('1-3 有兩面牆，需要用到不只一個方向鍵。先換到 1-3 背景（同樣按舞台面板 → 背景 → 1-3_迷宮）。');

const lY3 = doc.y;
const layout13 = SCENE_LAYOUTS['1-3'];
const mW = 220, mH = mW * 12 / 15;
const mX = ML + (CONTENT_W - mW) / 2;
drawLevel(mX, lY3, mW, mH, '1-3 迷宮：上有牆、下有牆，要 Z 字走', layout13.bricks, layout13.tank, layout13.eagle);
doc.y = lY3 + mH + 22;

H2('破關線索');
P('1.  下方有一面牆擋住你的右邊，先按 ← 往左走幾步');
P('2.  ← 走過頭了再按 → 修正（這時候你也用到第 3 個方向了！）');
P('3.  從牆的左邊往上 ↑，往右 → 繞過上面那面牆');
P('4.  繼續 ↑ 到頂，最後 ↓ 一下碰到老鷹');

Tip('迷路了？按綠旗 ▶ 就回到起點。多試幾次！');

// =====================================================================
// PAGE 6: scene 1-4 sandbox
// =====================================================================
doc.addPage();
H1('七、第 4 關  1-4  沙盒：你來當設計師！');

P('換到 1-4 背景，會發現舞台是「空的」 — 沒有磚牆。但角色清單會多出來一個「磚牆」！');

P('現在你要自己擺磚牆，設計給自己玩的關卡。');

Warn('複製要在「角色清單」做，不要在「舞台」上做！');

Step(1, '在角色清單對「磚牆」按右鍵',
  '右下角的角色清單裡，找到「磚牆」（橘色那個），按滑鼠右鍵。');

Step(2, '選「複製 / duplicate」',
  '會多出來一個「磚牆2」。');

Step(3, '把它拖到想放的位置',
  '剛複製出來的磚牆會跑到舞台中央。\n用滑鼠左鍵按住它，拖到你想放的位置放開。');

Step(4, '重複到 8 ~ 12 塊磚牆',
  '排出迷宮，記得留走道給坦克通過。');

Step(5, '按綠旗測試',
  '看看你的關卡能不能玩。\n走不通？刪掉幾塊磚牆。太簡單？多加幾塊。');

Tip('要刪磚牆？在角色清單對它按右鍵 → 刪除 / delete。');

// =====================================================================
// PAGE 7: example layouts for 1-4
// =====================================================================
doc.addPage();
H1('八、三個範例設計：先模仿，再修改');

P('不知道怎麼擺嗎？看下面三個範例。先做出來其中一個，再自己改！');

const eY = doc.y + 5;
const eLvW = 160, eLvH = eLvW * 12 / 15;
const eGap = (CONTENT_W - eLvW * 3) / 2;

const exA = {
  tank: { col: 7, row: 10 }, eagle: { col: 7, row: 1 },
  bricks: rng(1, 13).filter(c => c !== 7).map(c => [c, 6]),
};
const exB = {
  tank: { col: 7, row: 10 }, eagle: { col: 7, row: 4 },
  bricks: [
    [5, 3], [6, 3], [8, 3], [9, 3],
    [5, 4], [9, 4],
    [5, 5], [6, 5], [8, 5], [9, 5],
  ],
};
const exC = {
  tank: { col: 1, row: 10 }, eagle: { col: 13, row: 1 },
  bricks: [
    ...rng(4, 11).map(c => [c, 8]),
    ...rng(4, 11).map(c => [c, 5]),
  ],
};

drawLevel(ML, eY, eLvW, eLvH, '範例 A：一字牆（簡單）', exA.bricks, exA.tank, exA.eagle);
drawLevel(ML + eLvW + eGap, eY, eLvW, eLvH, '範例 B：保護老鷹（中等）', exB.bricks, exB.tank, exB.eagle);
drawLevel(ML + (eLvW + eGap) * 2, eY, eLvW, eLvH, '範例 C：Z 字迷宮（困難）', exC.bricks, exC.tank, exC.eagle);

doc.y = eY + eLvH + 28;

H2('怎麼看圖？');
P('・綠色的是坦克起點（自己不能搬）　・金色的是老鷹（自己可以拖動）　・橘色的是磚牆');
P('・範例 A 最簡單，先做這個；做完再挑戰 B、C。');

Tip('排好後記得按綠旗測試。如果走不到老鷹，表示牆排太密，要拆掉幾塊。');

// =====================================================================
// PAGE 8: peek at code + save + challenge
// =====================================================================
doc.addPage();
H1('九、偷看一下程式');

P('現在你已經會玩了。讓我們快速看看程式長什麼樣子。');

Step(1, '點角色清單的「玩家坦克」',
  '程式區會切換到坦克的程式。');

Step(2, '看程式區的 6 大組積木',
  '   ▸  起始位置（綠旗 → 移到起點）\n' +
  '   ▸  4 個方向鍵（每個都有「碰到橘色就退回」）\n' +
  '   ▸  勝利偵測（碰到老鷹 → 播勝利音效 → 說我贏了 → 停止）\n' +
  '   ▸  4 個「背景換成 XXX 時 → 回到起點」← 這就是換關卡自動歸位的秘密！');

Step(3, '點上面的「聲音」頁籤',
  '看到「勝利」那個音效了嗎？按播放鈕 ▶ 可以單獨聽一次！');

Step(4, '改數字試試',
  '把方向鍵下面「y 改變 10」的 10 改成 20。\n再按綠旗，再按 ↑ — 坦克跑得更快了！\n（不喜歡改回 10 就好。）');

H1('十、存檔');

Step(1, 'File / 檔案 → Save to your computer',
  'Scratch 會把你整個專案（4 關 + 你設計的）存成新的 .sb3 檔。\n建議命名為  MyTank_Lesson1.sb3。');

Tip('每做一段就存一次！Scratch 不會自動儲存。');

H1('十一、課後挑戰');

doc.fillColor(C.green).fontSize(13).text('★    一星挑戰', { lineGap: 4 });
doc.fillColor(C.dark).fontSize(11).text('       讓坦克跑更快：把 4 個方向鍵的 10 全部改成 20。', { lineGap: 4 });
Spacer(0.5);
doc.fillColor(C.green).fontSize(13).text('★ ★   二星挑戰', { lineGap: 4 });
doc.fillColor(C.dark).fontSize(11).text('       在 1-4 沙盒裡用 12 塊磚牆，做一個比範例 C 更難的關卡。', { lineGap: 4 });
Spacer(0.5);
doc.fillColor(C.green).fontSize(13).text('★ ★ ★  三星挑戰', { lineGap: 4 });
doc.fillColor(C.dark).fontSize(11).text('       把贏了的台詞「我贏了！」改成「我是坦克大師！」或自己想的話。', { lineGap: 4 });
Spacer(1);

H1('十二、下一堂預告');

P('第 2 堂課，我們會幫坦克畫上、下、左、右 4 個不同造型，讓它真的像在「轉彎」！');
P('還會教坦克遇到舞台邊邊會自己停下來，不會跑到外面去。');

Spacer(2);
doc.fillColor(C.gray).fontSize(10).text('做得很棒！記得儲存你的作品，下堂課見。', ML, doc.y, { align: 'center', width: CONTENT_W });

doc.end();
doc.on('end', () => console.log('PDF done:', OUT));
