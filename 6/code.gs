// Google Apps Script - Online Notepad
// Folder ID: 1FwoK1MbbcfgYC7sw3pbF6rZUQgJZcy45

const FOLDER_ID = '1FwoK1MbbcfgYC7sw3pbF6rZUQgJZcy45';
const FILE_NAME = '記事本.txt';

/**
 * 打開Web應用程序的主入口
 */
function doGet() {
  const html = HtmlService.createHtmlOutput(getHtmlContent());
  html.setWidth(900);
  html.setHeight(700);
  return html;
}

/**
 * 獲取HTML UI內容
 */
function getHtmlContent() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>線上記事本</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        
        .container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 800px;
          display: flex;
          flex-direction: column;
          height: 600px;
        }
        
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 12px 12px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .header-title {
          font-size: 24px;
          font-weight: bold;
        }
        
        .header-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .status-icon {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #4ade80;
          animation: pulse 2s infinite;
        }
        
        .status-icon.saving {
          background: #fbbf24;
          animation: saving 0.6s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes saving {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        
        .status-text {
          font-size: 14px;
        }
        
        .button-group {
          display: flex;
          gap: 10px;
        }
        
        button {
          background: white;
          color: #667eea;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          transition: all 0.3s ease;
        }
        
        button:hover {
          background: rgba(255, 255, 255, 0.9);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        button:active {
          transform: translateY(0);
        }
        
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .content-area {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }
        
        .editor-wrapper {
          flex: 1;
          overflow: hidden;
          padding: 20px;
          background: #f9fafb;
        }
        
        textarea {
          width: 100%;
          height: 100%;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 15px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          resize: none;
          outline: none;
          transition: border-color 0.3s ease;
        }
        
        textarea:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .footer {
          background: #f3f4f6;
          padding: 15px 20px;
          border-top: 1px solid #e5e7eb;
          border-radius: 0 0 12px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #6b7280;
        }
        
        .file-info {
          display: flex;
          gap: 20px;
        }
        
        .info-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: #9ca3af;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-title">📝 線上記事本</div>
          <div class="header-info">
            <div>
              <div class="status-icon" id="statusIcon"></div>
              <div class="status-text" id="statusText">已連線</div>
            </div>
            <div class="button-group">
              <button id="saveBtn" onclick="saveNote()">💾 Save</button>
              <button id="reloadBtn" onclick="reloadNote()">🔄 Reload</button>
            </div>
          </div>
        </div>
        
        <div class="content-area">
          <div id="loadingIndicator" class="loading">載入中...</div>
          <div id="editorWrapper" class="editor-wrapper" style="display:none;">
            <textarea id="noteEditor" placeholder="在這裡輸入或編輯您的筆記..."></textarea>
          </div>
        </div>
        
        <div class="footer">
          <div class="file-info">
            <div class="info-item">
              <span>📄 檔案:</span>
              <span id="fileName">記事本.txt</span>
            </div>
            <div class="info-item">
              <span>⏰ 最後保存:</span>
              <span id="lastSaveTime">--:--:--</span>
            </div>
            <div class="info-item">
              <span>📊 字數:</span>
              <span id="charCount">0</span>
            </div>
          </div>
          <div id="editStatus" style="color: #d97706; font-weight: bold;">未編輯</div>
        </div>
      </div>

      <script>
        let originalContent = '';
        let hasChanges = false;
        let autoSaveTimer;

        // 初始化
        window.addEventListener('load', function() {
          loadNoteContent();
          
          // 監聽編輯區域的變化
          document.getElementById('noteEditor').addEventListener('input', function() {
            hasChanges = true;
            updateEditStatus();
            updateCharCount();
            clearTimeout(autoSaveTimer);
            
            // 自動保存 (3秒未編輯後)
            autoSaveTimer = setTimeout(() => {
              saveNote(true);
            }, 3000);
          });
          
          // 監聽頁面關閉，提示保存
          window.addEventListener('beforeunload', function(e) {
            if (hasChanges) {
              e.preventDefault();
              e.returnValue = '';
            }
          });
        });

        function loadNoteContent() {
          document.getElementById('loadingIndicator').style.display = 'block';
          document.getElementById('editorWrapper').style.display = 'none';
          
          google.script.run.withSuccessHandler(function(content) {
            originalContent = content;
            document.getElementById('noteEditor').value = content;
            document.getElementById('editorWrapper').style.display = 'flex';
            document.getElementById('loadingIndicator').style.display = 'none';
            updateCharCount();
            hasChanges = false;
            updateEditStatus();
          }).withFailureHandler(function(error) {
            document.getElementById('loadingIndicator').innerHTML = 
              '<div style="color: red; font-weight: bold;">載入失敗: ' + error + '</div>';
          }).getFileContent();
        }

        function saveNote(isAutoSave = false) {
          const editor = document.getElementById('noteEditor');
          const content = editor.value;
          const saveBtn = document.getElementById('saveBtn');
          const statusIcon = document.getElementById('statusIcon');
          const statusText = document.getElementById('statusText');
          
          saveBtn.disabled = true;
          statusIcon.classList.add('saving');
          
          if (!isAutoSave) {
            statusText.textContent = '保存中...';
          }
          
          google.script.run
            .withSuccessHandler(function(result) {
              if (result.success) {
                originalContent = content;
                hasChanges = false;
                updateEditStatus();
                updateLastSaveTime();
                statusIcon.classList.remove('saving');
                statusText.textContent = '已保存';
                saveBtn.disabled = false;
                
                setTimeout(() => {
                  if (!hasChanges) {
                    statusText.textContent = '已連線';
                  }
                }, 2000);
              } else {
                alert('保存失敗: ' + result.message);
                statusIcon.classList.remove('saving');
                saveBtn.disabled = false;
              }
            })
            .withFailureHandler(function(error) {
              alert('保存出錯: ' + error);
              statusIcon.classList.remove('saving');
              saveBtn.disabled = false;
            })
            .saveFileContent(content);
        }

        function reloadNote() {
          if (hasChanges) {
            if (!confirm('您有未保存的變更，確定要重新載入嗎？')) {
              return;
            }
          }
          loadNoteContent();
        }

        function updateEditStatus() {
          const statusEl = document.getElementById('editStatus');
          if (hasChanges) {
            statusEl.textContent = '✎ 已編輯 (未保存)';
            statusEl.style.color = '#dc2626';
          } else {
            statusEl.textContent = '✓ 已保存';
            statusEl.style.color = '#16a34a';
          }
        }

        function updateCharCount() {
          const count = document.getElementById('noteEditor').value.length;
          document.getElementById('charCount').textContent = count;
        }

        function updateLastSaveTime() {
          const now = new Date();
          const timeStr = now.toLocaleTimeString('zh-TW');
          document.getElementById('lastSaveTime').textContent = timeStr;
        }
      </script>
    </body>
    </html>
  `;
}

/**
 * 獲取Google Drive資料夾中的檔案內容
 */
function getFileContent() {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const files = folder.getFilesByName(FILE_NAME);
    
    if (files.hasNext()) {
      // 檔案存在，讀取內容
      const file = files.next();
      const content = file.getBlob().getDataAsString('utf-8');
      return content;
    } else {
      // 檔案不存在，創建新檔案
      const newFile = folder.createFile(FILE_NAME, '');
      return '';
    }
  } catch (error) {
    Logger.log('getFileContent Error: ' + error.toString());
    throw new Error('無法存取資料夾。請確認Folder ID: ' + error.message);
  }
}

/**
 * 保存內容到Google Drive檔案
 */
function saveFileContent(content) {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const files = folder.getFilesByName(FILE_NAME);
    
    let file;
    if (files.hasNext()) {
      file = files.next();
    } else {
      file = folder.createFile(FILE_NAME, '');
    }
    
    // 更新檔案內容
    file.setContent(content);
    
    return {
      success: true,
      message: '檔案已保存',
      timestamp: new Date().toLocaleString('zh-TW')
    };
  } catch (error) {
    Logger.log('saveFileContent Error: ' + error.toString());
    return {
      success: false,
      message: '保存失敗: ' + error.message
    };
  }
}
