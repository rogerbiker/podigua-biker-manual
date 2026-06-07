# 完騎感言模式（第二階段）實作計畫

本計畫旨在評估並規劃「完騎感言模式」的最小改版方案，利用現有網站的 AI 寫作助理能力，協助每位隊友透過「交談式引導」整理出適合放在完騎證書下方的個人感言。

## User Review Required

> [!IMPORTANT]
> - **感言回填流程**：由於前端靜態網頁無法直接自動寫入本地原始碼 `certificateData.js`，本方案將採用**「半自動/手動回填」**流程：由隊友或 Roger 在「記錄中心」複製 AI 整理好的短版或完整版感言，再由 Roger 手動貼入 `src/data/certificateData.js` 對應成員的 `reflection` 欄位並部屬。
> - **對話輪數設計**：對話流程為「原則 2 題，必要時最多 3 題」。第一題固定，第二題 AI 根據回答動態追問。若使用者回答過於簡短或抽象，AI 可溫和追問第三題。在使用者回答第 2 題或第 3 題後，系統皆會提供「整理感言」按鈕。
> - **API Key 安全規範**：在正式 Production 環境下，不向普通使用者暴露或引導輸入 API Key。所有生產環境流量一律透過 Vercel Serverless Function `/api/gemini-reflection` 進行，`localStorage` 中的 API Key 僅保留於本地 localhost 測試或 Sandbox 環境作為偵錯備援，且該輸入框僅在 Debug/Admin 模式下對 Roger 可見。

## 評估與實作方案

### 1. 是否沿用現有心得輸入頁？
- **結論：是。** 
- **原因**：[ReflectionPage.jsx](file:///Users/rogerhuang/AI/AI筆記/podigua-biker-manual/src/pages/ReflectionPage.jsx) 已經具備成熟的對話氣泡 UI、打字指示器、編輯器、防斷網暫存及錯誤處理機制，沿用並在上方加入「模式切換」是最具成本效益且能維持體驗一致性的做法。

### 2. 模式切換設計
- 在 `chatStep === "setup"` 的設定區域，新增一個「記錄模式」的切換按鈕：
  - **每日心得**（預設）：顯示「天數」、「時段」下拉選單。
  - **完騎感言**：隱藏「天數」、「時段」選單（後端自動帶入 `day = 99`, `period = "certificate"`，以與每日心得資料區隔）。
- 在進入 `chatStep === "chat"` 後，上方 Header 顯示對應模式標籤（如：`🎓 完騎感言助理`）。

### 3. 第一題固定、第二題 AI 動態追問的技術可行性
- **技術完全可行**。
- **對話輪數與提示詞流程**：
  - **第一步**：使用者點擊「開始對聊」，AI 直接於對話視窗發送固定的第一句引導：
    > 「回顧這次 2026 熟齡剖地瓜壯騎，你現在最想留下的一句話或一段感受是什麼？」
  - **第二步**：使用者回覆後（`userMessageCount === 1`），觸發 `handleSendMessage`。此時會帶入系統指令 `getSystemInstructionForCertificateReflectionFollowUp` 呼叫 Gemini API。指令中會包含動態追問規範：
    1. 若回答偏辛苦，追問他是如何撐過挑戰。
    2. 若回答偏感謝，追問團隊互相照應的感受。
    3. 若回答偏開心，追問最值得記住的快樂。
    4. 若回答偏完成感，追問這張完騎證書對他的意義。
    5. 若回答偏平淡，請溫和引導他回想一個最有印象的感受或畫面。
  - **第三步**（`userMessageCount === 2`）：
    - 根據使用者的第二輪回答，若 AI 判斷使用者的答覆已足夠完整或感人，則進行溫和收尾，告訴使用者可以點擊「幫我整理成感言」；
    - 若答覆仍太短或抽象，AI 可以進行第二次溫和追問（第三題）。
  - **第四步**（`userMessageCount === 3`）：
    - AI 不再進行任何追問，直接溫馨收尾並提示點擊「幫我整理成感言」。
  - **按鈕露出**：只要使用者回答了第 2 次，畫面上就會提供「不補充，直接幫我整理感言 ✨」的按鈕，保留靈活性。

### 4. 完騎感言雙版本整理 (短版與完整版)
- 當使用者點擊「幫我整理成感言」時，呼叫 Gemini API 進行潤稿，並傳入專屬指令 `getSystemInstructionForCertificateReflectionPolish`。
- **感言長度限制**：
  1. **短版感言 (reflectionShort)**：字數嚴格限制在 **100–160 字** 之間（適合放在完騎證書卡片下方）。
  2. **完整版感言 (reflectionFull)**：保留較完整、有細節與脈絡的整理版，字數限制在 **200–350 字** 之間。
- **AI 整理回傳格式與強健容錯設計**：
  - 我們會要求 AI 同時提供 JSON 格式與備援標籤格式（即在回傳文本中同時包含 JSON 字串與 `[SHORT]...[/SHORT]` 與 `[FULL]...[/FULL]` 段落標籤）。
  - 前端解析邏輯將採取**多層級容錯**：
    1. **第一層（JSON Parse）**：嘗試對回傳內容進行 JSON 解析，並提取 `reflectionShort` 與 `reflectionFull`。
    2. **第二層（正規標籤解析）**：若 JSON 解析失敗，使用 RegExp 尋找 `[SHORT]...[/SHORT]` 與 `[FULL]...[/FULL]` 段落標籤。
    3. **第三層（關鍵字切分）**：若標籤匹配也失敗，嘗試以「短版：」與「完整版：」或「短版感言：」等中文關鍵字進行字串拆分。
    4. **第四層（極限退路）**：若上述解析皆失敗，將整段 AI 回傳的原始整理文字直接填入 `reflectionFull`，並截取其前 130 字作為 `reflectionShort`。確保系統絕不卡死，且依然能將原始文字呈現給使用者做最終手動修改。
- **整理原則**：
  - 保留隊友自己的語氣與個性。
  - 不要寫成官方新聞稿。
  - 不要過度華麗或太煽情。
  - 文字要自然、溫暖、有重點，並具備靈魂感。
- **資料庫欄位設計**：
  - 寫入 Firestore 時帶入 `type: "certificateReflection"`。
  - 儲存結構中將同時儲存 `reflectionShort` 與 `reflectionFull` 欄位。

### 5. Roger 後續查看、複製與整理
- 在「紀錄中心」（Viewer Tab）中，針對 `type: "certificateReflection"` 的卡片進行特殊視覺呈現：
  - 同時呈現「短版感言」與「完整版感言」的內容。
  - 為這兩個版本各自提供 **「一鍵複製」** 按鈕（`📋 複製短版`、`📋 複製完整版`），方便 Roger 直接複製，免去手動選取文字的困擾。
- **篩選器**：在「歷史紀錄篩選」中，新增「紀錄類型」篩選（每日心得 / 完騎感言），方便快速過濾。
- **管理員工具**：在底部的 Admin 診斷區，新增「完騎感言總覽」，方便 Roger 一覽所有已提交隊友的雙版本感言與對話紀錄。

### 6. 既有功能相容性
- **每日心得**：功能切換獨立，不修改既有的每日心得流程與資料庫結構。
- **Firebase 安全性規則**：無須調整，繼續沿用現有的安全規則。

---

## Proposed Changes

### [Frontend Components]

#### [MODIFY] [ReflectionPage.jsx](file:///Users/rogerhuang/AI/AI%E7%AD%86%E8%A8%98/podigua-biker-manual/src/pages/ReflectionPage.jsx)
- **新增模式狀態** `reflectionMode`（可選值：`"daily"` | `"certificate"`）。
- **調整 Setup 畫面**：加入模式切換的 UI Tab。當切換到 `"certificate"` 時隱藏天數與時段選單。
- **調整對話引導與 System Instruction**：
  - 實作完騎感言的固定第一題，以及隨後引導 AI 動態分析追問的 prompt 機制（限制原則上 2 題，最長 3 題）。
- **調整 Polish 潤稿邏輯**：
  - 實作多層級容錯解析，將 AI 回傳內容解析為 `reflectionShort` 和 `reflectionFull`，並在編輯區提供兩組文字編輯框，供使用者個別確認與調整。
- **調整儲存邏輯**：
  - 儲存至本地/Firestore 時，若是完騎感言，則附加 `type: "certificateReflection"`，並儲存 `reflectionShort` 與 `reflectionFull`。
- **調整紀錄中心 (Viewer)**：
  - 支援雙版本感言的顯示，並新增 `📋 複製短版` 與 `📋 複製完整版` 按鈕。

---

## Verification Plan

### Automated Tests
- 執行本地開發伺服器進行完整功能測試，確認 `npm run build` 通過無編譯錯誤。

### Manual Verification
1. **模式切換測試**：確認切換至「完騎感言」時，天數與時段選單正常隱藏。
2. **對話流程測試**：確認第一句為固定問題。輸入不同長短回答，驗證 AI 能否在第二輪或第三輪給予收尾，且在第二輪後能手動強制整理。
3. **AI 雙版本產出與容錯測試**：確認最終產出的 `reflectionShort`（100–160 字）與 `reflectionFull`（200–350 字）內容皆符合語氣規範，且即使 AI 回傳非 JSON 格式時，前端依然能正常拆分出雙版本，若解析完全失敗，也能正確顯示原始文字，保證不卡死。
4. **一鍵複製與篩選測試**：確認在「記錄中心」能正確複製雙版本內容至剪貼簿。
5. **相容性測試**：確認「每日心得」的對話、整理與提交功能完全正常。
