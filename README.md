# Scratch 坦克大戰 Battle City 五堂課程

Hacci × Wu 為朋友小孩設計的 Scratch 入門課程。透過重做經典 GameBoy 遊戲 **Battle City（坦克大戰）**，
讓國小二年級小朋友在 5 堂課內學會 Scratch 基本操作。

---

## 📥 一鍵入口（永遠是最新版 main）

### Lesson 1 — 開坦克、吃老鷹
| | 連結 |
|---|---|
| ▶️ | [TurboWarp 線上玩](https://turbowarp.org/?project_url=https://raw.githubusercontent.com/blackie0424/scratch-battle-city-course/main/lesson1/Lesson1_BattleCity.sb3) |
| 📄 | [PDF 線上看](https://docs.google.com/viewer?url=https://raw.githubusercontent.com/blackie0424/scratch-battle-city-course/main/lesson1/Lesson1_%E6%96%B0%E6%89%8B%E6%95%99%E5%AD%B8.pdf) |
| 📦 | [.sb3 直接下載](https://raw.githubusercontent.com/blackie0424/scratch-battle-city-course/main/lesson1/Lesson1_BattleCity.sb3) |
| 📑 | [PDF 直接下載](https://raw.githubusercontent.com/blackie0424/scratch-battle-city-course/main/lesson1/Lesson1_%E6%96%B0%E6%89%8B%E6%95%99%E5%AD%B8.pdf) |

### Lesson 2 — 學會改積木
| | 連結 |
|---|---|
| ▶️ | [TurboWarp 線上玩](https://turbowarp.org/?project_url=https://raw.githubusercontent.com/blackie0424/scratch-battle-city-course/main/lesson2/Lesson2_BattleCity.sb3) |
| 📄 | [PDF 線上看](https://docs.google.com/viewer?url=https://raw.githubusercontent.com/blackie0424/scratch-battle-city-course/main/lesson2/Lesson2_%E6%96%B0%E6%89%8B%E6%95%99%E5%AD%B8.pdf) |
| 📦 | [.sb3 直接下載](https://raw.githubusercontent.com/blackie0424/scratch-battle-city-course/main/lesson2/Lesson2_BattleCity.sb3) |
| 📑 | [PDF 直接下載](https://raw.githubusercontent.com/blackie0424/scratch-battle-city-course/main/lesson2/Lesson2_%E6%96%B0%E6%89%8B%E6%95%99%E5%AD%B8.pdf) |

> ⚠️ 上面 4 個連結需要 repo 是 **public**（私有的 repo TurboWarp / Google Viewer 都無法存取）。

---

## 課程目標

| 堂數 | 主題 | 學會的能力 |
|---|---|---|
| 1 | 4 關闖關 + 自己設計 | 介面熟悉、背景切換、複製角色、方向鍵 + 碰撞偵測、音效 |
| 2 | 四方向造型 + 邊界處理 | 造型切換、條件判斷 |
| 3 | 發射子彈 | 分身 (clone)、廣播 (broadcast)、迴圈 |
| 4 | 敵人 + 計分 | 變數、敵人 AI、生命值 |
| 5 | 勝利畫面 + 進階音效 | 多 backdrop 流程、音效編輯 |

## 第 1 堂課內容

半成品 `.sb3` 已內建：

- **4 個關卡 backdrop**：
  - `1-1_直線`  ← 只用 ↑ 鍵
  - `1-2_轉彎`  ← ↑ + →
  - `1-3_迷宮`  ← 4 方向都用得到
  - `1-4_沙盒`  ← 空白舞台，自己擺磚塊
- **玩家坦克**：4 方向鍵控制 + 碰到橘色磚塊會被擋住
- **老鷹基地**：碰到就播勝利音效 + 說「我贏了！」+ 停止
- **磚牆 sprite**：1-1~1-3 隱藏（磚塊烤進背景），1-4 才顯示給小朋友複製
- **勝利音效**：C-E-G-C 上升音階，約 0.85 秒

PDF 教學 9 頁，含 4 關 mini-map、Backdrops 面板教學、3 個沙盒範例。

## 倉庫結構

```
.
├── lesson1/
│   ├── Lesson1_BattleCity.sb3      ← 直接拖到 Scratch 就能玩
│   ├── Lesson1_新手教學.pdf         ← 給小朋友看的圖文步驟
│   └── src/
│       ├── build_sb3.js            ← 重新產生 .sb3 的程式
│       └── build_pdf.js            ← 重新產生 PDF 的程式
├── scripts/
│   └── download-font.js            ← 下載 PDF 用的中文字型
├── package.json
└── README.md
```

## 給家長／老師：怎麼開始用

最快路徑（不用下載任何東西）：

1. 按上面 **▶️ 線上玩 Lesson 1（TurboWarp）** 直接在瀏覽器試玩
2. 開上面 **📄 Lesson 1 PDF** 看教學，跟著步驟操作
3. 想存自己改的版本：TurboWarp 左上角 File → Save to your computer

傳統路徑：

1. 下載 `lesson1/Lesson1_新手教學.pdf` 列印或開在平板上
2. 用瀏覽器打開 https://scratch.mit.edu → Create → File → Load from your computer
3. 選 `lesson1/Lesson1_BattleCity.sb3`
4. 按綠旗，跟著 PDF 一步一步操作

## 給開發者：重新產生素材

```bash
git clone <this-repo>
cd scratch-battle-city-course
npm install
npm run setup:font      # 下載 Noto Sans CJK TC（約 16 MB，gitignore）
npm run build:lesson1   # 重新產出 .sb3 與 PDF
```

字型 (`fonts/NotoSansTC-Regular.otf`) 因檔案過大不放進 repo，請用 `npm run setup:font` 下載。

## 設計準則

- **TDD 對小朋友的版本**：每堂課先給「半成品」(.sb3) 讓小朋友模仿，再請他們修改
- **明確引導**：步驟分小塊、每步一個動作、用顏色框出注意事項
- **可玩優先**：第 1 堂結束就能玩、有勝利條件，建立成就感
- 每堂課提供 1 ~ 3 個成品範例供模仿

## 授權

教學內容：CC BY-NC-SA 4.0
程式碼：MIT
字型 (Noto Sans CJK)：[SIL Open Font License](https://github.com/notofonts/noto-cjk/blob/main/Sans/LICENSE)
