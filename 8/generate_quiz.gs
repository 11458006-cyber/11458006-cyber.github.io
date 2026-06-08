function generateQuizFromSheet() {
  var id = '1TnURczgG3fTMlz2Dnm7fW5UvXsWBd5mwH808eSp2c00'; // <-- replace if needed
  var ss = SpreadsheetApp.openById(id);
  var sheet = ss.getSheets()[0];
  var values = sheet.getDataRange().getValues();

  var quiz = buildQuizItems(values);

  var quizSheet = ss.getSheetByName('Quiz');
  if (!quizSheet) quizSheet = ss.insertSheet('Quiz');
  else quizSheet.clearContents();

  // write header and rows
  quizSheet.getRange(1, 1, 1, 6).setValues([['Question (English)', 'A', 'B', 'C', 'D', 'Answer']]);
  if (quiz.length > 0) {
    var rows = quiz.map(function(q) { return [q.question, q.options[0], q.options[1], q.options[2], q.options[3], q.answer]; });
    quizSheet.getRange(2, 1, rows.length, 6).setValues(rows);
  }

  notify('已產生 ' + quiz.length + ' 題選擇題，結果寫入工作表：Quiz', quizSheet);
}

/**
 * Build quiz items from sheet values (2-column English/Chinese)
 * Returns array of objects: {question, options: [..4..], answer: 'A'|'B'..}
 */
function buildQuizItems(values) {
  var startRow = 0;
  if (values.length && values[0].length >= 2) {
    var h0 = String(values[0][0]).toLowerCase();
    var h1 = String(values[0][1]).toLowerCase();
    if (h0.indexOf('english') !== -1 || h1.indexOf('chinese') !== -1) startRow = 1;
  }

  var items = [];
  for (var i = startRow; i < values.length; i++) {
    var eng = String(values[i][0]).trim();
    var chi = values[i].length > 1 ? String(values[i][1]).trim() : '';
    if (eng) items.push({eng: eng, chi: chi});
  }

  // Fisher-Yates shuffle
  function shuffleArray(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
  }

  var quiz = [];
  for (var i = 0; i < items.length; i++) {
    var correct = items[i];
    var pool = items.slice(0, i).concat(items.slice(i + 1));
    shuffleArray(pool);
    var distractors = [];
    for (var d = 0; d < pool.length && distractors.length < 3; d++) {
      if (pool[d].chi && pool[d].chi !== correct.chi && distractors.indexOf(pool[d].chi) === -1) {
        distractors.push(pool[d].chi);
      }
    }
    while (distractors.length < 3) distractors.push('（無）');

    var options = [correct.chi].concat(distractors);
    shuffleArray(options);
    var answerLetter = ['A', 'B', 'C', 'D'][options.indexOf(correct.chi) >= 0 ? options.indexOf(correct.chi) : 0];

    quiz.push({question: correct.eng, options: options, answer: answerLetter});
  }
  return quiz;
}

/**
 * Web app entry point — render interactive quiz page
 */
function doGet(e) {
  var id = '1TnURczgG3fTMlz2Dnm7fW5UvXsWBd5mwH808eSp2c00';
  var ss = SpreadsheetApp.openById(id);
  var sheet = ss.getSheets()[0];
  var values = sheet.getDataRange().getValues();
  var quiz = buildQuizItems(values);

  var tpl = HtmlService.createTemplateFromFile('Index');
  tpl.quizJson = JSON.stringify(quiz);
  return tpl.evaluate().setTitle('Vocabulary Quiz').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

/**
 * Robust notification helper: try sheet toast, then UI alert, then Logger
 */
function notify(msg, container) {
  // Try toast on the provided container first (Sheet or Spreadsheet)
  try {
    if (container && typeof container.toast === 'function') {
      container.toast(msg, 'Generate Quiz', 5);
      return;
    }
  } catch (e) {
    // ignore and try other methods
  }

  // Fallback to UI alert when available
  try {
    var ui = SpreadsheetApp.getUi();
    if (ui && typeof ui.alert === 'function') {
      ui.alert(msg);
      return;
    }
  } catch (e) {
    // ignore
  }

  // Last resort: Logger
  Logger.log(msg);
}
