// Lesson 1 PDF — for 2nd grader, with concrete examples
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const OUT = path.join(__dirname, '..', 'Lesson1_新手教學.pdf');
const FONT = path.join(__dirname, '..', '..', 'fonts', 'NotoSansTC-Regular.otf');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 50, left: 55, right: 55 },
  info: {
    Title: '坦克大戰 Scratch 第 1 堂：認識介面、控制坦克、吃到老鷹',
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

function Tip(text) {
  doc.fontSize(10);
  const innerW = CONTENT_W - 16;
  const labelText = '[ 小提示 ]  ';
  const textH = doc.heightOfString(labelText + text, { width: innerW, lineGap: 3 });
  const boxH = textH + 16;
  ensureSpace(boxH + 10);
  const boxY = doc.y;
  doc.save();
  doc.roundedRect(ML, boxY, CONTENT_W, boxH, 6).fillColor(C.greenLight).fill();
  doc.restore();
  doc.fillColor(C.green).fontSize(10).text(labelText, ML + 8, boxY + 8, { continued: true, width: innerW, lineGap: 3 });
  doc.fillColor(C.dark).text(text);
  doc.y = boxY + boxH + 8;
  doc.x = ML;
}

function Warn(text) {
  doc.fontSize(10);
  const innerW = CONTENT_W - 16;
  const labelText = '[ 注意！ ]  ';
  const textH = doc.heightOfString(labelText + text, { width: innerW, lineGap: 3 });
  const boxH = textH + 16;
  ensureSpace(boxH + 10);
  const boxY = doc.y;
  doc.save();
  doc.roundedRect(ML, boxY, CONTENT_W, boxH, 6).fillColor('#ffebee').fill();
  doc.restore();
  doc.fillColor(C.red).fontSize(10).text(labelText, ML + 8, boxY + 8, { continued: true, width: innerW, lineGap: 3 });
  doc.fillColor(C.dark).text(text);
  doc.y = boxY + boxH + 8;
  doc.x = ML;
}

function Spacer(n = 1) { doc.moveDown(n); }

// ===== Mini sprites for diagrams =====
function drawTank(x, y, size = 16) {
  const s = size / 40;
  doc.save();
  doc.translate(x, y);
  doc.scale(s);
  // tracks
  doc.rect(2, 6, 8, 28).fillAndStroke('#2e7d32', '#1b5e20');
  doc.rect(30, 6, 8, 28).fillAndStroke('#2e7d32', '#1b5e20');
  // body
  doc.rect(10, 10, 20, 22).fillAndStroke('#4caf50', '#1b5e20');
  // turret
  doc.circle(20, 20, 6).fillAndStroke('#66bb6a', '#1b5e20');
  // barrel
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
  // simplified eagle body
  doc.moveTo(24, 10).lineTo(18, 18).lineTo(10, 22).lineTo(16, 22).lineTo(12, 28).lineTo(18, 26)
     .lineTo(16, 36).lineTo(24, 32).lineTo(32, 36).lineTo(30, 26).lineTo(36, 28).lineTo(32, 22)
     .lineTo(38, 22).lineTo(30, 18).closePath().fillAndStroke(C.gold, '#704c00');
  doc.circle(24, 14, 3).fillAndStroke(C.gold, '#704c00');
  doc.restore();
}

// ===== Level layout diagram =====
// layout: array of { type: 'brick'|'tank'|'eagle', col, row } on a 15x12 grid
function drawLevel(x, y, w, h, title, layout) {
  const cols = 15, rows = 12;
  const cellW = w / cols;
  const cellH = h / rows;
  doc.save();
  doc.rect(x, y, w, h).fillAndStroke('#1a1a1a', '#4caf50').lineWidth(1.5).stroke();
  doc.restore();
  for (const item of layout) {
    const cx = x + item.col * cellW;
    const cy = y + item.row * cellH;
    const size = Math.min(cellW, cellH) * 1.5;
    if (item.type === 'brick') drawBrick(cx, cy, size);
    else if (item.type === 'tank') drawTank(cx - size * 0.2, cy - size * 0.2, size * 1.4);
    else if (item.type === 'eagle') drawEagle(cx - size * 0.3, cy - size * 0.3, size * 1.6);
  }
  // title under
  doc.fillColor(C.dark).fontSize(10).text(title, x, y + h + 4, { width: w, align: 'center' });
}

// =====================================================================
// PAGE 1: COVER
// =====================================================================
doc.fillColor(C.gray).fontSize(11).text('坦克大戰 Scratch 課程   ·   國小二年級', ML, 50, { align: 'right', width: CONTENT_W });
Spacer(3);
doc.fillColor(C.green).fontSize(34).text('第 1 堂課', { align: 'center' });
Spacer(0.2);
doc.fillColor(C.dark).fontSize(20).text('開坦克，吃老鷹！', { align: 'center' });
Spacer(0.8);
doc.fillColor(C.gray).fontSize(11).text('給第一次寫程式的小朋友   ·   約 60 分鐘', { align: 'center' });

Spacer(1.5);

// preview of stage
const previewY = doc.y;
const previewW = 280;
const previewH = previewW * 360 / 480;
const previewX = (PAGE_W - previewW) / 2;
doc.save();
doc.rect(previewX, previewY, previewW, previewH).fillAndStroke('#1a1a1a', '#4caf50').lineWidth(2).stroke();
doc.restore();
// place mini sprites — tank bottom center, eagle top center, 3 bricks
drawTank(previewX + previewW/2 - 12, previewY + previewH - 36, 24);
drawEagle(previewX + previewW/2 - 14, previewY + 24, 28);
drawBrick(previewX + previewW/2 - 40, previewY + previewH/2, 18);
drawBrick(previewX + previewW/2 - 9, previewY + previewH/2, 18);
drawBrick(previewX + previewW/2 + 22, previewY + previewH/2, 18);

doc.y = previewY + previewH + 14;

// Info card
const cardX = ML + 20;
const cardW = CONTENT_W - 40;
const cardY = doc.y;
const cardH = 160;
doc.save();
doc.roundedRect(cardX, cardY, cardW, cardH, 10).fillColor(C.greenLight).fill();
doc.restore();
doc.fillColor(C.green).fontSize(13).text('今天的任務', cardX + 16, cardY + 12);
doc.fillColor(C.dark).fontSize(11).text(
  '1.  打開老師給你的遊戲檔  Lesson1_BattleCity.sb3\n' +
  '2.  按方向鍵 ← ↑ → ↓ 開坦克\n' +
  '3.  開到老鷹的位置，坦克會說「我贏了！」\n' +
  '4.  自己加磚牆，做一個更難的關卡',
  cardX + 16, cardY + 36, { width: cardW - 32, lineGap: 6 }
);
doc.fillColor(C.green).fontSize(13).text('開始之前', cardX + 16, cardY + 114);
doc.fillColor(C.dark).fontSize(11).text(
  '電腦上網 → 打開 scratch.mit.edu',
  cardX + 16, cardY + 134, { width: cardW - 32 }
);

doc.y = cardY + cardH + 30;
doc.fillColor(C.gray).fontSize(9).text('Hacci × Wu   ·   Battle City Edition', ML, doc.y, { align: 'center', width: CONTENT_W });

// =====================================================================
// PAGE 2: open the file
// =====================================================================
doc.addPage();
H1('一、打開遊戲檔');

P('我們已經幫你做好一個「半成品」遊戲。先把它打開，看看裡面有什麼。');

Step(1, '打開瀏覽器，去  scratch.mit.edu',
  '網址列輸入：scratch.mit.edu  （一定要是 .mit.edu，不要寫錯！）按 Enter。');

Step(2, '點橘色的「Create / 創造」按鈕',
  '網頁上面有一顆橘色的圓角按鈕，英文寫 Create，中文寫「創造」。\n按下去，編輯器會自己打開。');

Step(3, '把語言切到中文（選用）',
  '畫面最上面，左邊有一個地球符號。點地球 → 找「正體中文」，按下去。\n（用英文也沒關係，等一下我們認得到圖示。）');

Step(4, '檔案 → 從你的電腦上載',
  '左上角找「File / 檔案」→ 點下去 → 找「Load from your computer / 從你的電腦上載」。\n選老師給你的  Lesson1_BattleCity.sb3。');

Warn('開檔時會跳出「要捨棄目前的專案嗎？」這時候要按「OK / 確定」，不然檔案不會打開喔！');

H1('二、看看舞台上有什麼');

P('檔案打開後，右上角黑色的方框叫「舞台」。仔細看，上面有 3 樣東西：');

// inline mini legend
const legX = ML + 10;
const legY = doc.y + 4;
const rowH = 28;

function legendRow(yOffset, drawFn, name, desc) {
  drawFn(legX, legY + yOffset);
  doc.fillColor(C.dark).fontSize(11).text(name, legX + 36, legY + yOffset + 4, { continued: true });
  doc.fillColor(C.gray).text('   — ' + desc);
}
legendRow(0, (x, y) => drawTank(x, y, 22), '綠色坦克', '主角，你來開它');
legendRow(rowH, (x, y) => drawBrick(x + 4, y + 4, 16), '橘色磚牆', '障礙物，擋路用');
legendRow(rowH * 2, (x, y) => drawEagle(x, y, 22), '金色老鷹', '目標，開坦克碰到它就贏了！');

doc.y = legY + rowH * 3 + 10;

// =====================================================================
// PAGE 3: drive the tank (already wired)
// =====================================================================
doc.addPage();
H1('三、按綠旗，馬上玩！');

P('檔案裡的程式已經寫好了。你不用拼任何積木，直接玩看看！');

Step(1, '按舞台上方的綠旗 ▶',
  '舞台上面有一面綠色的小旗子，按它一下。\n坦克會跳到舞台「下方中間」，那是它的起點。');

Step(2, '按鍵盤的方向鍵',
  '← 向左　　→ 向右　　↑ 向上　　↓ 向下\n按一下走一步，一直按就會一直走！');

Step(3, '開坦克去碰老鷹',
  '把坦克開到金色老鷹的位置。當坦克「碰到」老鷹的時候，\n坦克頭上會出現「我贏了！」的對話框，然後遊戲停下來。');

Tip('玩不順？按一下紅色八角形 ⏹（綠旗右邊那顆）就會停止。重新按綠旗 ▶ 就能再玩。');

doc.addPage();
H1('四、看看程式長什麼樣子');

P('讓我們偷看一下幫你寫好的程式。');

Step(1, '點右下角的「玩家坦克」',
  '畫面右下角是「角色清單」，把所有角色都列出來。\n用滑鼠左鍵點「玩家坦克」一下。');

Step(2, '看中間的「程式區」',
  '中間白色那一大塊就是程式區。你會看到 6 組積木：\n' +
  '   ▸  起始位置（綠旗 → 移到 x:0 y:-120）\n' +
  '   ▸  4 個方向鍵（↑ ↓ ← →）\n' +
  '   ▸  勝利偵測（碰到老鷹 → 說我贏了 → 停止）');

Step(3, '試試看改數字',
  '找到「↑ 方向鍵」那一組。下面寫「y 改變 10」。\n把 10 改成 20，再按綠旗，再按 ↑ — 坦克跑得更快了！\n（不喜歡改回 10 就好。）');

Tip('改數字就是你的第一個「程式設計」！恭喜你！');

// =====================================================================
// PAGE 4: place bricks (CORRECTED: from sprite list)
// =====================================================================
doc.addPage();
H1('五、自己加磚牆做關卡');

P('現在舞台上只有 1 塊磚牆。讓我們加更多塊，做一個迷宮！');

Warn('複製要在「角色清單」做，不要在「舞台」上做！\n舞台上的物件不能直接複製，會找不到右鍵選單。');

Step(1, '看右下角的「角色清單」',
  '右下角會看到 4 個小方框：玩家坦克、磚牆、老鷹基地、(可能還有 Stage)。\n這個區域就叫「角色清單」。');

Step(2, '對著「磚牆」按右鍵',
  '把滑鼠移到「磚牆」那個方框上，按右鍵。\n會跳出一個小選單。');

Step(3, '選「複製 / duplicate」',
  '選單裡會有「複製」（英文 duplicate）。點下去。\n角色清單裡會多出一個「磚牆2」。');

Step(4, '在舞台上拖動新磚牆到想放的位置',
  '剛剛複製出來的磚牆，會出現在舞台中央。\n用滑鼠左鍵按住它，拖到你想放的位置放開。');

Step(5, '重複到大約 8 ~ 12 塊磚牆',
  '排出迷宮，記得留走道給坦克通過，不然坦克會卡住！');

Tip('如果磚牆放壞了想刪掉，在角色清單對它按右鍵 → 「刪除 / delete」就會消失。');

// =====================================================================
// PAGE 5: example layouts
// =====================================================================
doc.addPage();
H1('六、三個範例關卡：先模仿，再修改');

P('不知道怎麼排嗎？試試下面三種設計。先照著做一個，再改成你自己的！');

const lvW = 160, lvH = lvW * 12 / 15;
const lvY1 = doc.y + 10;

// Level A: 一字長城（中央水平牆有缺口）
const layoutA = [
  { type: 'tank',  col: 7, row: 10 },
  { type: 'eagle', col: 7, row: 1 },
  { type: 'brick', col: 1, row: 6 }, { type: 'brick', col: 2, row: 6 }, { type: 'brick', col: 3, row: 6 },
  { type: 'brick', col: 4, row: 6 }, { type: 'brick', col: 5, row: 6 },
  { type: 'brick', col: 9, row: 6 }, { type: 'brick', col: 10, row: 6 },
  { type: 'brick', col: 11, row: 6 }, { type: 'brick', col: 12, row: 6 }, { type: 'brick', col: 13, row: 6 },
];

// Level B: 環形堡壘（圍著老鷹）
const layoutB = [
  { type: 'tank',  col: 7, row: 10 },
  { type: 'eagle', col: 7, row: 3 },
  { type: 'brick', col: 5, row: 2 }, { type: 'brick', col: 6, row: 2 }, { type: 'brick', col: 8, row: 2 }, { type: 'brick', col: 9, row: 2 },
  { type: 'brick', col: 5, row: 3 }, { type: 'brick', col: 9, row: 3 },
  { type: 'brick', col: 5, row: 4 }, { type: 'brick', col: 9, row: 4 },
  { type: 'brick', col: 5, row: 5 }, { type: 'brick', col: 6, row: 5 }, { type: 'brick', col: 8, row: 5 }, { type: 'brick', col: 9, row: 5 },
];

// Level C: Z 字路線
const layoutC = [
  { type: 'tank',  col: 1, row: 10 },
  { type: 'eagle', col: 13, row: 1 },
  { type: 'brick', col: 4, row: 8 }, { type: 'brick', col: 5, row: 8 }, { type: 'brick', col: 6, row: 8 }, { type: 'brick', col: 7, row: 8 },
  { type: 'brick', col: 8, row: 8 }, { type: 'brick', col: 9, row: 8 }, { type: 'brick', col: 10, row: 8 }, { type: 'brick', col: 11, row: 8 },
  { type: 'brick', col: 4, row: 5 }, { type: 'brick', col: 5, row: 5 }, { type: 'brick', col: 6, row: 5 }, { type: 'brick', col: 7, row: 5 },
  { type: 'brick', col: 8, row: 5 }, { type: 'brick', col: 9, row: 5 }, { type: 'brick', col: 10, row: 5 }, { type: 'brick', col: 11, row: 5 },
];

const gap = (CONTENT_W - lvW * 3) / 2;
drawLevel(ML, lvY1, lvW, lvH, '範例 A：一字牆（簡單）', layoutA);
drawLevel(ML + lvW + gap, lvY1, lvW, lvH, '範例 B：保護老鷹（中等）', layoutB);
drawLevel(ML + (lvW + gap) * 2, lvY1, lvW, lvH, '範例 C：Z 字迷宮（困難）', layoutC);

doc.y = lvY1 + lvH + 30;

H2('怎麼看圖？');
P('・綠色的是坦克起點　・金色的是老鷹（終點）　・橘色的是磚牆');
P('・建議先做「範例 A」最簡單的，能贏了再挑戰 B、C。');

Tip('排好後一定要按綠旗 ▶ 測試！如果走不到老鷹，表示牆排太密，要拆掉幾塊。');

// =====================================================================
// PAGE 6: save + challenge
// =====================================================================
doc.addPage();
H1('七、存檔：別讓辛苦白費！');

Step(1, 'File / 檔案 → Save to your computer',
  '左上角「檔案」→「下載到你的電腦」。Scratch 會把你整個專案存成新的 .sb3 檔。');

Step(2, '改一個你喜歡的名字',
  '建議命名為  MyTank_Lesson1.sb3，這樣下次很好找。');

Tip('每做一段就存一次！Scratch 不會自動儲存。如果電腦當機，沒存的東西就不見了。');

H1('八、課後挑戰');

doc.fillColor(C.green).fontSize(13).text('★    一星挑戰', { lineGap: 4 });
doc.fillColor(C.dark).fontSize(11).text('       讓坦克跑更快：把 4 個方向鍵裡的「10」全部改成「20」。', { lineGap: 4 });
Spacer(0.5);
doc.fillColor(C.green).fontSize(13).text('★ ★   二星挑戰', { lineGap: 4 });
doc.fillColor(C.dark).fontSize(11).text('       讓老鷹換位置：點老鷹，看舞台右上的 x, y。改成 x: 200, y: 100。', { lineGap: 4 });
Spacer(0.5);
doc.fillColor(C.green).fontSize(13).text('★ ★ ★  三星挑戰', { lineGap: 4 });
doc.fillColor(C.dark).fontSize(11).text('       把贏了的台詞「我贏了！」改成「我是坦克大師！」或你想說的任何話。', { lineGap: 4 });
Spacer(1);

H1('九、下一堂預告');

P('第 2 堂課，我們會幫坦克畫上、下、左、右 4 個不同的造型，讓它真的像在「轉彎」！');
P('還會教坦克「撞牆會被擋住」，不能再穿過磚牆喔。');

Spacer(2);
doc.fillColor(C.gray).fontSize(10).text('做得很棒！記得儲存你的作品，下堂課見。', ML, doc.y, { align: 'center', width: CONTENT_W });

doc.end();
doc.on('end', () => console.log('PDF done:', OUT));
