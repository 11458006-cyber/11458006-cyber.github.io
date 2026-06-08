使用說明

1. 目的

此 Apps Script 會從您提供的試算表（預設使用 ID：1TnURczgG3fTMlz2Dnm7fW5UvXsWBd5mwH808eSp2c00）讀取前兩欄資料（English, Chinese），為每個英文單字產生一題四選一（A~D）的選擇題，並把結果寫入同一試算表的新工作表 `Quiz`。

2. 操作步驟

- 開啟該 Google 試算表。
- 選單：`擴充功能 -> Apps Script`（或 `工具 -> 指令碼編輯器`）。
- 建立新專案，把 `generate_quiz.gs` 的內容貼上並儲存（或上傳此專案檔）。
- 若試算表 ID 不同，請修改 `generate_quiz.gs` 內第一行的 `id` 常數。
- 在 Apps Script 中執行 `generateQuizFromSheet()`，授權後程式會在試算表新增（或覆寫）工作表 `Quiz`，每列為一題：Question, A, B, C, D, Answer。

3. 注意事項

- 若資料行數少於 4 個不同中文選項，會以「（無）」補足選項。
- 程式會嘗試自動偵測是否有標題列（包含 `English` 或 `Chinese`），若有會跳過第一列。

需要我幫你把 `generate_quiz.gs` 上傳到該 Google 試算表專案，並代你執行（需要授權或提供存取方式）嗎？