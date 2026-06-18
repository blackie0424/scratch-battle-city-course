# Scratch 坦克大戰 Battle City 五堂課程

Hacci × Wu 為朋友小孩設計的 Scratch 入門課程。透過重做經典 GameBoy 遊戲 **Battle City（坦克大戰）**，
讓國小二年級小朋友在 5 堂課內學會 Scratch 基本操作。

## 課程目標

| 堂數 | 主題 | 學會的能力 |
|---|---|---|
| 1 | 開坦克，吃老鷹！ | 認識介面、複製角色、方向鍵控制、碰撞偵測 |
| 2 | 四方向造型 + 撞牆停下 | 造型切換、條件判斷、邊界處理 |
| 3 | 發射子彈 | 分身 (clone)、廣播 (broadcast)、迴圈 |
| 4 | 敵人 + 計分 | 變數、敵人 AI、生命值 |
| 5 | 音效 + 勝利畫面 | 音效播放、背景切換、遊戲結束流程 |

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

1. 把 `lesson1/Lesson1_新手教學.pdf` 列印或開在平板上給小朋友看
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

## 第 1 堂課內容

- 半成品 `.sb3` 已內建：
  - 戰場背景 480×360
  - 玩家坦克（綠色，已綁好方向鍵控制）
  - 老鷹基地（金色，當作目標）
  - 1 塊磚牆（讓小朋友複製）
  - 勝利偵測（碰到老鷹 → 說「我贏了！」→ 停止）
- PDF 教學 7 頁，含 3 個範例關卡布局供小朋友模仿

## 授權

教學內容：CC BY-NC-SA 4.0
程式碼：MIT
字型 (Noto Sans CJK)：[SIL Open Font License](https://github.com/notofonts/noto-cjk/blob/main/Sans/LICENSE)
