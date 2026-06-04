# 2026 剖地瓜壯騎行程手冊 MVP v1.1 實作計畫

本專案旨在為 3480 自行車隊夥伴、扶輪社友及支援團隊建立一個「手機優先（Mobile-First）」的行程手冊網站。第一階段 MVP 的核心目標是清晰、穩定、手機好用且資料準確，方便成員在騎乘過程中隨時查閱路線、餐廳、住宿、提醒、成員與費用資訊。

## User Review Required

> [!IMPORTANT]
> **專案儲存位置**：我們將在 `/Users/rogerhuang/AI/AI筆記/podigua-biker-manual` 目錄中初始化此 React + Vite + Tailwind CSS 專案，避免污染外層的 AI 筆記與其他專案目錄。
>
> **視覺設計系統**：
> - 採用熟齡車隊專屬配色：深藍（海線/穩重）、山綠（山路/自然）、暖橘（燈塔/夕陽/補給/熱情）。
> - 卡片採用乾淨白底，搭配適當的陰影與間距，確保在戶外陽光下的手機螢幕上依然清晰易讀。
> - 手機版底部固定導航欄（今日、行程、地圖、提醒、成員），方便單手操作。

## Open Questions

> [!IMPORTANT]
> **1. Tailwind CSS 版本選擇**：
> 預設建議使用最新的 **Tailwind CSS v4.0**，其編譯速度更快且配置更精簡。如果您有特定原因需要使用 **Tailwind CSS v3.4**（例如需相容特定舊版套件或舊有的配置習慣），請告訴我。
>
> **2. 部署與打包計畫**：
> 目前的技術方向提及「可部署到 GitHub Pages」，本計畫第一階段將先專注於本地開發與功能驗證（`npm run dev`），預留好 `vite.config.js` 的 `base` 路徑設定，方便您後續打包部署。

---

## Proposed Changes

### 1. 專案基礎架構與配置 [NEW]

我們會建立一個新的 React 專案，並配置 Tailwind CSS。

#### [NEW] [package.json](file:///Users/rogerhuang/AI/AI筆記/podigua-biker-manual/package.json)
- 定義 React, Vite, Tailwind CSS 相關依賴。

#### [NEW] [vite.config.js](file:///Users/rogerhuang/AI/AI筆記/podigua-biker-manual/vite.config.js)
- 配置 Vite，加入相對路徑設定（為 GitHub Pages 部署做準備）。

#### [NEW] [tailwind.config.js](file:///Users/rogerhuang/AI/AI筆記/podigua-biker-manual/tailwind.config.js)
- 設定 Tailwind CSS 的 content 與自訂顏色（深藍、山綠、暖橘）。

#### [NEW] [index.html](file:///Users/rogerhuang/AI/AI筆記/podigua-biker-manual/index.html)
- 手機 RWD 設定，SEO 標題與 meta 設定。

---

### 2. 靜態資料檔 [NEW]

整理完整的 8 天行程與成員、提醒資訊，並預留第二階段所需的欄位。

#### [NEW] [tripData.js](file:///Users/rogerhuang/AI/AI筆記/podigua-biker-manual/src/data/tripData.js)
- 包含 `tripDays`（8天完整資料，包含距離、爬升、路線、餐食、住宿、費用、提醒，以及預留的 `media` 與 `reflections` 結構）。
- 包含 `members`（角色分組：領騎、領隊、夫妻卡、隊友、支援車）。
- 包含 `globalReminders`（全域重要提醒）。

---

### 3. 共用元件與導航 [NEW]

實作響應式導航系統，尤其是手機版的底部選單。

#### [NEW] [App.jsx](file:///Users/rogerhuang/AI/AI筆記/podigua-biker-manual/src/App.jsx)
- 路由與狀態管理（切換分頁：首頁、每日行程、住宿餐食、成員名單、重要提醒、費用整理）。

#### [NEW] [index.css](file:///Users/rogerhuang/AI/AI筆記/podigua-biker-manual/src/index.css)
- 引入 Tailwind CSS 指令，設定全域樣式（例如隱藏滾動條、自訂字體等）。

#### [NEW] [MobileNav.jsx](file:///Users/rogerhuang/AI/AI筆記/podigua-biker-manual/src/components/MobileNav.jsx)
- 手機版底部快速選單，支援快速切換常用頁面（今日、行程、地圖、提醒、成員）。

#### [NEW] [Header.jsx](file:///Users/rogerhuang/AI/AI筆記/podigua-biker-manual/src/components/Header.jsx)
- 桌機版頂部導航與標題列。

---

### 4. 頁面元件 [NEW]

實作各功能頁面。

#### [NEW] [HomePage.jsx](file:///Users/rogerhuang/AI/AI筆記/podigua-biker-manual/src/pages/HomePage.jsx)
- 首頁 Hero 區（活動日期、起訖點）。
- 統計卡片（騎乘天數、總里程、總爬升等）。
- 行程主文與車隊簡介。

#### [NEW] [TripOverview.jsx](file:///Users/rogerhuang/AI/AI筆記/podigua-biker-manual/src/pages/TripOverview.jsx)
- 顯示 Day 1 至 Day 8 的行程列表。
- 點擊可展開顯示詳細資訊（`DayDetail`）。

#### [NEW] [DayCard.jsx](file:///Users/rogerhuang/AI/AI筆記/podigua-biker-manual/src/components/DayCard.jsx)
- 每一天的精簡資訊卡，包含 Day 編號、日期、路線、距離/爬升、中餐、住宿、晚餐。
- 提供 Google Maps 導航按鈕（今日路線、中餐導航、住宿導航、晚餐導航）。

#### [NEW] [DayDetail.jsx](file:///Users/rogerhuang/AI/AI筆記/podigua-biker-manual/src/components/DayDetail.jsx)
- 展開後的詳細資訊（如房間數、設施提醒、詳細特別提醒等）。
- 為未來「高度圖」、「景點說明」、「每日影片/相簿/感言」預留渲染區域。

#### [NEW] [FoodLodgingPage.jsx](file:///Users/rogerhuang/AI/AI筆記/podigua-biker-manual/src/pages/FoodLodgingPage.jsx)
- 住宿餐食整理頁，以乾淨的表格或卡片列表呈現每日中餐、住宿、晚餐明細與地圖連結。

#### [NEW] [MembersPage.jsx](file:///Users/rogerhuang/AI/AI筆記/podigua-biker-manual/src/pages/MembersPage.jsx)
- 成員名單頁。依角色分組：
  1. 領騎與領隊（山神、CP Volvo）
  2. 夫妻同行卡（PP Roger & Sally 放在同一個精美卡片中）
  3. 隊友成員（PP Pure, PP Server, Medicine, Fenny）
  4. 支援車（司機待決定）

#### [NEW] [ReminderPage.jsx](file:///Users/rogerhuang/AI/AI筆記/podigua-biker-manual/src/pages/ReminderPage.jsx)
- 重要提醒頁面，精簡且醒目地呈現關鍵注意事項（例如 5/27 需帶泳衣、5/31 提前點餐、6/3 返程等）。

#### [NEW] [CostPage.jsx](file:///Users/rogerhuang/AI/AI筆記/podigua-biker-manual/src/pages/CostPage.jsx)
- 費用整理頁。以表格展示每日已知住宿費、已付訂金、中餐與晚餐的預算或備註。
- 計算並顯示「住宿費粗估合計」與「已知訂金合計」。
- 清楚標示「本頁僅為資料整理，不進行最終分攤計算」的警示文字。

---

## Verification Plan

### Automated Tests
- 本階段無自動化測試腳本。將使用 Vite 本地開發伺服器進行熱重載測試：
  `npm run dev`
- 驗證編譯過程無語法錯誤或警告。

### Manual Verification
1. **RWD 手機版面測試**：在 Chrome DevTools 開啟行動裝置模擬（例如 iPhone 12 Pro），驗證底部導航欄是否固定、卡片文字是否適中、按鈕是否好按。
2. **導航按鈕測試**：點擊各項 Google Maps 導航按鈕，確認是否能在新分頁正確開啟對應的 URL。
3. **頁面切換測試**：點擊底部選單或頂部選單，確認能在各個分頁間平滑切換，無狀態丟失或白屏。
4. **資料顯示核對**：比對網頁上的距離、爬升、費用數字與需求書完全一致。
