const QUIZ_SPREADSHEET_ID = '1lKQWO2D9f0f4smqHDc1hswI7t4XsJqbw6qVd2jj9Cm4';
const QUIZ_FALLBACK_COUNT = 20;
const QUIZ_POINTS_PER_QUESTION = 5;
const QUIZ_TOTAL_SCORE = QUIZ_FALLBACK_COUNT * QUIZ_POINTS_PER_QUESTION;

function doGet() {
  return HtmlService.createHtmlOutput(getHtmlContent())
    .setTitle('英文單字測驗')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getHtmlContent() {
  return `
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>英文單字測驗</title>
  <style>
    :root {
      --bg-1: #fff6e8;
      --bg-2: #f8ddb7;
      --bg-3: #f1c98f;
      --panel: rgba(255, 251, 244, 0.88);
      --ink: #2b241b;
      --muted: #7a5d3f;
      --line: rgba(115, 84, 48, 0.18);
      --accent: #c95e20;
      --accent-2: #f19a63;
      --good: #1f7a46;
      --bad: #c63d2a;
      --shadow: rgba(63, 40, 14, 0.18);
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      color: var(--ink);
      font-family: 'Noto Sans TC', 'Microsoft JhengHei', sans-serif;
      background:
        radial-gradient(1100px 500px at 10% -10%, rgba(255, 255, 255, 0.88), transparent 55%),
        radial-gradient(900px 450px at 110% 120%, rgba(255, 255, 255, 0.3), transparent 55%),
        linear-gradient(180deg, var(--bg-1) 0%, var(--bg-2) 56%, var(--bg-3) 100%);
      overflow-x: hidden;
    }

    .shell {
      width: min(1080px, calc(100% - 24px));
      margin: 0 auto;
      padding: 22px 0 30px;
    }

    .hero {
      display: grid;
      gap: 16px;
      grid-template-columns: 1.15fr 0.85fr;
      margin-bottom: 16px;
    }

    .card {
      background: var(--panel);
      border: 1px solid rgba(255, 255, 255, 0.78);
      border-radius: 24px;
      box-shadow: 0 18px 34px var(--shadow);
      backdrop-filter: blur(8px);
    }

    .title-card {
      padding: 22px;
    }

    .badge {
      display: inline-block;
      font-weight: 800;
      font-size: 0.78rem;
      letter-spacing: 0.12em;
      color: #7b4720;
      background: rgba(201, 94, 32, 0.14);
      border-radius: 999px;
      padding: 7px 12px;
    }

    h1 {
      margin: 12px 0 10px;
      font-size: clamp(2rem, 4vw, 3.6rem);
      line-height: 0.96;
    }

    .subtitle {
      margin: 0;
      line-height: 1.72;
      color: var(--muted);
      max-width: 46ch;
    }

    .meta-note {
      margin-top: 12px;
      font-weight: 700;
      color: #674228;
    }

    .stats-card {
      padding: 18px;
      display: grid;
      gap: 12px;
      align-content: start;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .stat {
      padding: 16px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(115, 84, 48, 0.1);
    }

    .stat span {
      display: block;
      font-size: 0.84rem;
      opacity: 0.72;
      margin-bottom: 6px;
    }

    .stat strong {
      font-size: clamp(1.5rem, 3vw, 2.4rem);
      line-height: 1;
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
    }

    button {
      border: 0;
      cursor: pointer;
      border-radius: 999px;
      padding: 12px 18px;
      font-weight: 800;
      font-size: 0.95rem;
      transition: transform 0.15s ease, filter 0.15s ease;
    }

    button:hover { transform: translateY(-1px); filter: brightness(1.03); }
    button:active { transform: translateY(1px); }
    button:disabled { opacity: 0.56; cursor: not-allowed; }

    .primary-btn {
      color: #fff;
      background: linear-gradient(180deg, var(--accent-2), var(--accent));
      box-shadow: 0 12px 20px rgba(201, 94, 32, 0.24);
    }

    .secondary-btn {
      color: var(--ink);
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 8px 18px rgba(63, 40, 14, 0.1);
      border: 1px solid rgba(115, 84, 48, 0.12);
    }

    .message {
      min-height: 24px;
      font-weight: 700;
      color: var(--accent);
    }

    .quiz-shell {
      position: relative;
      padding: 22px;
      border-radius: 30px;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.14));
      box-shadow: 0 24px 46px var(--shadow);
      overflow: hidden;
    }

    .quiz-shell::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 10% 18%, rgba(255, 255, 255, 0.38), transparent 22%),
        radial-gradient(circle at 90% 8%, rgba(255, 255, 255, 0.24), transparent 18%),
        linear-gradient(180deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0));
      pointer-events: none;
    }

    .panel {
      position: relative;
      z-index: 1;
      background: rgba(255, 253, 248, 0.92);
      border: 1px solid rgba(115, 84, 48, 0.12);
      border-radius: 22px;
      padding: 18px;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
    }

    .hidden { display: none !important; }

    .start-screen, .result-screen {
      text-align: center;
      display: grid;
      gap: 14px;
      justify-items: center;
      padding: 18px;
    }

    .start-screen h2, .result-screen h2 {
      margin: 0;
      font-size: clamp(1.8rem, 4vw, 2.6rem);
    }

    .start-screen p, .result-screen p {
      margin: 0;
      color: var(--muted);
      line-height: 1.7;
      max-width: 54ch;
    }

    .progress-row {
      display: grid;
      gap: 10px;
      margin-bottom: 14px;
    }

    .progress-line {
      width: 100%;
      height: 12px;
      border-radius: 999px;
      background: rgba(115, 84, 48, 0.1);
      overflow: hidden;
    }

    .progress-fill {
      width: 0%;
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, var(--accent-2), var(--accent));
      transition: width 0.25s ease;
    }

    .progress-text {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
      color: var(--muted);
      font-weight: 700;
      font-size: 0.92rem;
    }

    .question-card {
      display: grid;
      gap: 16px;
    }

    .prompt {
      display: grid;
      gap: 8px;
    }

    .prompt .label {
      font-size: 0.86rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--accent);
      font-weight: 800;
    }

    .prompt .word {
      font-size: clamp(1.9rem, 4vw, 3rem);
      font-weight: 900;
      line-height: 1.05;
    }

    .prompt .hint {
      color: var(--muted);
      line-height: 1.6;
    }

    .options {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .option {
      text-align: left;
      width: 100%;
      border: 1px solid rgba(115, 84, 48, 0.12);
      background: rgba(255, 255, 255, 0.94);
      color: var(--ink);
      padding: 16px 18px;
      border-radius: 18px;
      min-height: 68px;
      display: flex;
      align-items: center;
      gap: 12px;
      line-height: 1.45;
      box-shadow: 0 8px 18px rgba(63, 40, 14, 0.06);
    }

    .option .chip {
      flex: 0 0 auto;
      width: 30px;
      height: 30px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      font-weight: 900;
      color: var(--accent);
      background: rgba(201, 94, 32, 0.12);
    }

    .option.selected {
      border-color: rgba(201, 94, 32, 0.55);
      box-shadow: 0 12px 22px rgba(201, 94, 32, 0.12);
      transform: translateY(-1px);
    }

    .option.correct {
      border-color: rgba(31, 122, 70, 0.6);
      background: rgba(31, 122, 70, 0.08);
    }

    .option.wrong {
      border-color: rgba(198, 61, 42, 0.6);
      background: rgba(198, 61, 42, 0.08);
    }

    .footer-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 16px;
      align-items: center;
    }

    .feedback {
      min-height: 24px;
      font-weight: 700;
    }

    .feedback.good { color: var(--good); }
    .feedback.bad { color: var(--bad); }

    .review-list {
      display: grid;
      gap: 10px;
      margin-top: 4px;
      text-align: left;
    }

    .review-item {
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.82);
      border: 1px solid rgba(115, 84, 48, 0.12);
      padding: 14px 16px;
    }

    .review-item strong {
      display: block;
      margin-bottom: 4px;
    }

    .review-item .small {
      color: var(--muted);
      line-height: 1.5;
    }

    @media (max-width: 900px) {
      .hero { grid-template-columns: 1fr; }
      .options { grid-template-columns: 1fr; }
    }

    @media (max-width: 640px) {
      .shell { width: min(100% - 14px, 1080px); }
      .title-card, .stats-card, .quiz-shell { border-radius: 18px; }
      .quiz-shell { padding: 14px; }
      .panel { padding: 14px; border-radius: 16px; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <section class="hero">
      <div class="card title-card">
        <div class="badge">ENGLISH QUIZ</div>
        <h1>英文單字測驗</h1>
        <p class="subtitle">系統會優先從你提供的 Google 試算表讀入單字與中文意思；如果試算表暫時無法讀取，會使用內建字庫維持正常作答。共 20 題，每題 5 分，滿分 100 分。</p>
        <div class="meta-note">資料來源：Google 試算表 + GAS</div>
      </div>
      <div class="card stats-card">
        <div class="stats-grid">
          <div class="stat">
            <span>題數</span>
            <strong id="statTotal">20</strong>
          </div>
          <div class="stat">
            <span>滿分</span>
            <strong id="statScore">100</strong>
          </div>
          <div class="stat">
            <span>目前分數</span>
            <strong id="statCurrent">0</strong>
          </div>
          <div class="stat">
            <span>作答進度</span>
            <strong id="statProgress">0%</strong>
          </div>
        </div>
        <div class="controls">
          <button class="primary-btn" id="startBtn">開始測驗</button>
          <button class="secondary-btn" id="resetBtn">重新開始</button>
        </div>
        <div class="message" id="message"></div>
      </div>
    </section>

    <section class="quiz-shell">
      <div class="panel start-screen" id="startScreen">
        <h2>準備好了就開始</h2>
        <p>每題會顯示一個英文單字，請選出正確中文意思。答完 20 題後交卷計分，總分 100 分。</p>
        <button class="primary-btn" id="startBtn2">開始作答</button>
      </div>

      <div class="panel question-card hidden" id="quizScreen">
        <div class="progress-row">
          <div class="progress-text">
            <span id="questionCount">第 1 題 / 20 題</span>
            <span id="questionScore">目前得分 0 / 100</span>
          </div>
          <div class="progress-line"><div class="progress-fill" id="progressFill"></div></div>
        </div>

        <div class="prompt">
          <div class="label">Word</div>
          <div class="word" id="promptWord">-</div>
          <div class="hint" id="promptHint">請選擇正確中文意思</div>
        </div>

        <div class="options" id="options"></div>

        <div class="footer-row">
          <div class="feedback" id="feedback"></div>
          <button class="primary-btn" id="nextBtn" disabled>下一題</button>
        </div>
      </div>

      <div class="panel result-screen hidden" id="resultScreen">
        <h2>測驗完成</h2>
        <p id="resultSummary">你的分數是 0 / 100。</p>
        <div class="controls">
          <button class="primary-btn" id="restartBtn">再做一次</button>
        </div>
        <div class="review-list" id="reviewList"></div>
      </div>
    </section>
  </main>

  <script>
    const QUIZ_POINTS_PER_QUESTION = ${QUIZ_POINTS_PER_QUESTION};
    const QUIZ_TOTAL_SCORE = ${QUIZ_TOTAL_SCORE};
    const QUIZ_TOTAL_QUESTIONS = ${QUIZ_FALLBACK_COUNT};
    const OPTION_KEYS = ['A', 'B', 'C', 'D'];

    let quizItems = [];
    let currentIndex = 0;
    let score = 0;
    let selectedOption = null;
    let answered = false;
    let answers = [];

    const el = {
      startScreen: document.getElementById('startScreen'),
      quizScreen: document.getElementById('quizScreen'),
      resultScreen: document.getElementById('resultScreen'),
      options: document.getElementById('options'),
      promptWord: document.getElementById('promptWord'),
      promptHint: document.getElementById('promptHint'),
      questionCount: document.getElementById('questionCount'),
      questionScore: document.getElementById('questionScore'),
      progressFill: document.getElementById('progressFill'),
      feedback: document.getElementById('feedback'),
      nextBtn: document.getElementById('nextBtn'),
      startBtn: document.getElementById('startBtn'),
      startBtn2: document.getElementById('startBtn2'),
      resetBtn: document.getElementById('resetBtn'),
      restartBtn: document.getElementById('restartBtn'),
      message: document.getElementById('message'),
      statTotal: document.getElementById('statTotal'),
      statScore: document.getElementById('statScore'),
      statCurrent: document.getElementById('statCurrent'),
      statProgress: document.getElementById('statProgress'),
      resultSummary: document.getElementById('resultSummary'),
      reviewList: document.getElementById('reviewList')
    };

    document.getElementById('startBtn').addEventListener('click', startQuiz);
    document.getElementById('startBtn2').addEventListener('click', startQuiz);
    document.getElementById('resetBtn').addEventListener('click', startQuiz);
    document.getElementById('restartBtn').addEventListener('click', startQuiz);
    document.getElementById('nextBtn').addEventListener('click', goNext);

    window.addEventListener('keydown', (event) => {
      if (!el.quizScreen.classList.contains('hidden') && !answered) {
        const index = OPTION_KEYS.indexOf(event.key.toUpperCase());
        if (index !== -1 && quizItems[currentIndex]) {
          pickAnswer(quizItems[currentIndex].options[index], index);
        }
      }
      if (event.key === 'Enter' && !el.nextBtn.disabled) {
        goNext();
      }
    });

    function startQuiz() {
      setMessage('載入題庫中...');
      google.script.run
        .withSuccessHandler((items) => {
          quizItems = Array.isArray(items) ? items : [];
          if (!quizItems.length) {
            setMessage('題庫載入失敗，請檢查試算表內容或權限。');
            showStartScreen();
            return;
          }
          currentIndex = 0;
          score = 0;
          selectedOption = null;
          answered = false;
          answers = [];
          el.statTotal.textContent = quizItems.length;
          el.statScore.textContent = quizItems.length * QUIZ_POINTS_PER_QUESTION;
          el.statCurrent.textContent = '0';
          el.statProgress.textContent = '0%';
          setMessage('題庫已準備完成。');
          showQuizScreen();
          renderQuestion();
        })
        .withFailureHandler((error) => {
          setMessage('載入失敗：' + error.message);
          showStartScreen();
        })
        .getQuizItems();
    }

    function showStartScreen() {
      el.startScreen.classList.remove('hidden');
      el.quizScreen.classList.add('hidden');
      el.resultScreen.classList.add('hidden');
    }

    function showQuizScreen() {
      el.startScreen.classList.add('hidden');
      el.quizScreen.classList.remove('hidden');
      el.resultScreen.classList.add('hidden');
    }

    function showResultScreen() {
      el.startScreen.classList.add('hidden');
      el.quizScreen.classList.add('hidden');
      el.resultScreen.classList.remove('hidden');
    }

    function renderQuestion() {
      const item = quizItems[currentIndex];
      if (!item) {
        finishQuiz();
        return;
      }

      answered = false;
      selectedOption = null;
      el.feedback.textContent = '';
      el.feedback.className = 'feedback';
      el.nextBtn.disabled = true;
      el.promptWord.textContent = item.word;
      el.promptHint.textContent = '請選擇正確中文意思';
      el.questionCount.textContent = '第 ' + (currentIndex + 1) + ' 題 / ' + quizItems.length + ' 題';
      el.questionScore.textContent = '目前得分 ' + score + ' / ' + (quizItems.length * QUIZ_POINTS_PER_QUESTION);
      el.progressFill.style.width = Math.round((currentIndex / quizItems.length) * 100) + '%';
      el.options.innerHTML = '';

      item.options.forEach((option, optionIndex) => {
        const button = document.createElement('button');
        button.className = 'option';
        button.type = 'button';
        button.innerHTML = '<span class="chip">' + OPTION_KEYS[optionIndex] + '</span><span>' + option + '</span>';
        button.addEventListener('click', () => pickAnswer(option, optionIndex));
        el.options.appendChild(button);
      });
    }

    function pickAnswer(optionText, optionIndex) {
      if (answered) return;
      answered = true;
      selectedOption = optionText;
      const item = quizItems[currentIndex];
      const buttons = Array.from(el.options.querySelectorAll('.option'));
      const correctIndex = item.options.indexOf(item.answer);
      const isCorrect = optionText === item.answer;

      buttons.forEach((button, idx) => {
        button.disabled = true;
        if (idx === optionIndex) {
          button.classList.add('selected');
        }
        if (idx === correctIndex) {
          button.classList.add('correct');
        }
        if (idx === optionIndex && !isCorrect) {
          button.classList.add('wrong');
        }
      });

      if (isCorrect) {
        score += QUIZ_POINTS_PER_QUESTION;
        el.feedback.textContent = '答對了 +5 分';
        el.feedback.className = 'feedback good';
      } else {
        el.feedback.textContent = '答錯了，正確答案是：' + item.answer;
        el.feedback.className = 'feedback bad';
      }

      answers.push({
        word: item.word,
        chosen: optionText,
        answer: item.answer,
        isCorrect: isCorrect
      });

      el.questionScore.textContent = '目前得分 ' + score + ' / ' + (quizItems.length * QUIZ_POINTS_PER_QUESTION);
      el.statCurrent.textContent = String(score);
      el.statProgress.textContent = Math.round(((currentIndex + 1) / quizItems.length) * 100) + '%';
      el.nextBtn.disabled = false;
      if (currentIndex + 1 === quizItems.length) {
        el.nextBtn.textContent = '交卷';
      } else {
        el.nextBtn.textContent = '下一題';
      }
    }

    function goNext() {
      if (!answered) return;
      currentIndex += 1;
      if (currentIndex >= quizItems.length) {
        finishQuiz();
        return;
      }
      renderQuestion();
    }

    function finishQuiz() {
      showResultScreen();
      el.resultSummary.textContent = '你的分數是 ' + score + ' / ' + (quizItems.length * QUIZ_POINTS_PER_QUESTION) + '。';
      el.statCurrent.textContent = String(score);
      el.statProgress.textContent = '100%';
      el.progressFill.style.width = '100%';
      renderReview();
    }

    function renderReview() {
      el.reviewList.innerHTML = '';
      answers.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'review-item';
        row.innerHTML = '<strong>' + (index + 1) + '. ' + item.word + '</strong>' +
          '<div class="small">你的答案：' + item.chosen + '</div>' +
          '<div class="small">正確答案：' + item.answer + '</div>';
        row.style.borderColor = item.isCorrect ? 'rgba(31, 122, 70, 0.18)' : 'rgba(198, 61, 42, 0.18)';
        el.reviewList.appendChild(row);
      });
    }

    function setMessage(text) {
      el.message.textContent = text;
    }

    showStartScreen();
  </script>
</body>
</html>
`;
}

function getQuizItems() {
  const wordBank = loadWordBank();
  const uniqueItems = deduplicateWordBank(wordBank);
  const pool = shuffleArray(uniqueItems);
  const quizSource = pool.slice(0, Math.min(QUIZ_TOTAL_QUESTIONS, pool.length));
  return buildQuizItems(quizSource, uniqueItems);
}

function loadWordBank() {
  const rows = [];

  try {
    const spreadsheet = SpreadsheetApp.openById(QUIZ_SPREADSHEET_ID);
    const sheet = spreadsheet.getSheets()[0];
    const values = sheet.getDataRange().getDisplayValues();
    if (values.length >= 2) {
      const headerIndex = findHeaderRow(values);
      const mapping = resolveColumns(values[headerIndex] || []);
      for (let index = headerIndex + 1; index < values.length; index += 1) {
        const row = values[index];
        const english = cleanCell(row[mapping.english]);
        const chinese = cleanCell(row[mapping.chinese]);
        if (english && chinese) {
          rows.push({ word: english, meaning: chinese });
        }
      }
    }
  } catch (error) {
    Logger.log('loadWordBank spreadsheet error: ' + error);
  }

  if (rows.length >= QUIZ_TOTAL_QUESTIONS) {
    return rows;
  }

  const fallback = [
    ['ability', '能力'], ['absorb', '吸收'], ['accept', '接受'], ['accident', '事故'], ['across', '橫跨'],
    ['advice', '建議'], ['affect', '影響'], ['amount', '數量'], ['ancient', '古老的'], ['answer', '回答'],
    ['arrival', '到達'], ['balance', '平衡'], ['borrow', '借用'], ['capture', '捕捉'], ['careful', '小心的'],
    ['ceiling', '天花板'], ['choose', '選擇'], ['collect', '收集'], ['combine', '結合'], ['common', '常見的'],
    ['connect', '連接'], ['continue', '繼續'], ['courage', '勇氣'], ['create', '創造'], ['danger', '危險'],
    ['decide', '決定'], ['detail', '細節'], ['develop', '發展'], ['discover', '發現'], ['divide', '分開'],
    ['easily', '容易地'], ['enemy', '敵人'], ['energy', '能量'], ['enjoy', '享受'], ['event', '事件'],
    ['famous', '有名的'], ['forget', '忘記'], ['friend', '朋友'], ['future', '未來'], ['gather', '聚集'],
    ['gentle', '溫和的'], ['growth', '成長'], ['habit', '習慣'], ['honest', '誠實的'], ['improve', '改善'],
    ['journey', '旅程'], ['knowledge', '知識'], ['library', '圖書館'], ['manage', '管理'], ['nature', '自然'],
    ['notice', '注意'], ['object', '物體'], ['perform', '表演'], ['protect', '保護'], ['refuse', '拒絕'],
    ['reduce', '減少'], ['remember', '記得'], ['safely', '安全地'], ['season', '季節'], ['simple', '簡單的'],
    ['special', '特別的'], ['success', '成功'], ['suggest', '建議'], ['support', '支持'], ['truth', '真相'],
    ['unusual', '不尋常的'], ['victory', '勝利'], ['weather', '天氣'], ['wonder', '想知道'], ['yesterday', '昨天'],
    ['achieve', '達成'], ['balance', '平衡'], ['bright', '明亮的'], ['clean', '乾淨的'], ['damage', '損害'],
    ['effect', '效果'], ['forward', '向前'], ['global', '全球的'], ['hidden', '隱藏的'], ['inform', '通知'],
    ['journey', '旅程'], ['limited', '有限的'], ['memory', '記憶'], ['normal', '正常的'], ['oxygen', '氧氣'],
    ['patient', '有耐心的'], ['quality', '品質'], ['recent', '最近的'], ['surface', '表面'], ['talent', '才能']
  ];

  fallback.forEach(([word, meaning]) => {
    rows.push({ word: word, meaning: meaning });
  });

  return rows;
}

function buildQuizItems(sourceItems, fullBank) {
  const meaningPool = fullBank.map((item) => item.meaning);
  return sourceItems.map((item) => {
    const choices = [item.meaning];
    const distractors = shuffleArray(meaningPool.filter((meaning) => meaning !== item.meaning));
    distractors.forEach((meaning) => {
      if (choices.length < 4 && !choices.includes(meaning)) {
        choices.push(meaning);
      }
    });

    while (choices.length < 4) {
      const extra = '選項 ' + (choices.length + 1);
      if (!choices.includes(extra)) {
        choices.push(extra);
      }
    }

    return {
      word: item.word,
      answer: item.meaning,
      options: shuffleArray(choices)
    };
  });
}

function deduplicateWordBank(wordBank) {
  const seen = new Set();
  const result = [];

  wordBank.forEach((item) => {
    const word = cleanCell(item.word);
    const meaning = cleanCell(item.meaning);
    if (!word || !meaning) {
      return;
    }
    const key = `${word}::${meaning}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    result.push({ word: word, meaning: meaning });
  });

  return result;
}

function findHeaderRow(values) {
  for (let index = 0; index < Math.min(values.length, 5); index += 1) {
    const row = values[index] || [];
    const joined = row.join(' ').toLowerCase();
    if (/english|word|vocab|單字|英文/.test(joined) || /中文|meaning|translation|解釋|意思/.test(joined)) {
      return index;
    }
  }
  return 0;
}

function resolveColumns(headerRow) {
  const headers = headerRow.map((value) => cleanCell(value).toLowerCase());
  let english = headers.findIndex((value) => /english|word|vocab|單字|英文/.test(value));
  let chinese = headers.findIndex((value) => /中文|meaning|translation|解釋|意思/.test(value));

  if (english === -1) {
    english = 0;
  }
  if (chinese === -1) {
    chinese = headers.length > 1 ? 1 : 0;
  }

  return { english: english, chinese: chinese };
}

function cleanCell(value) {
  return String(value || '').trim();
}

function shuffleArray(array) {
  const result = array.slice();
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const temp = result[index];
    result[index] = result[randomIndex];
    result[randomIndex] = temp;
  }
  return result;
}
