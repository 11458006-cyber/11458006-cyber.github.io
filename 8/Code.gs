// 原始提供的 200 個單字（English<TAB>Chinese 每行）
const PROVIDED_TEXT = `abandon	放棄
ability	能力
abroad	國外
absorb	吸收
academic	學術的
accept	接受
accident	事故
accompany	陪伴
achieve	達成
acquire	獲得
adapt	適應
admire	欽佩
advance	進步
advantage	優勢
affect	影響
afford	負擔得起
agency	機構
agriculture	農業
ambitious	有抱負的
analysis	分析
ancient	古代的
announce	宣布
anxiety	焦慮
apparent	明顯的
approach	方法；接近
appropriate	適當的
approve	贊成
argument	爭論
arrange	安排
artificial	人造的
aspect	方面
assign	指派
assist	協助
assume	假設
atmosphere	氣氛；大氣
attract	吸引
audience	觀眾
authority	權威
available	可取得的
average	平均的
aware	察覺的
balance	平衡
benefit	利益
biology	生物學
border	邊界
brief	簡短的
budget	預算
calculate	計算
campaign	活動；競選
capable	有能力的
career	職業
category	類別
challenge	挑戰
chemical	化學的
circumstance	情況
citizen	公民
climate	氣候
colleague	同事
combine	結合
comment	評論
commercial	商業的
commit	犯下；投入
communicate	溝通
community	社區
compare	比較
compete	競爭
complex	複雜的
concentrate	專心
concept	概念
concern	關心；憂慮
conclude	結論
conduct	執行
confidence	自信
confirm	確認
conflict	衝突
consequence	結果
conserve	保存
consider	考慮
consist	由…組成
constant	持續的
construct	建造
consume	消耗
contact	聯絡
contain	包含
contribute	貢獻
convenient	方便的
convince	說服
cooperate	合作
create	創造
culture	文化
curious	好奇的
decline	下降；拒絕
decrease	減少
define	定義
delay	延遲
demand	需求
demonstrate	證明
depend	依靠
describe	描述
design	設計
destroy	破壞
determine	決定
develop	發展
device	裝置
devote	奉獻
disaster	災難
discipline	紀律
discover	發現
discuss	討論
disease	疾病
distribute	分配
diversity	多樣性
economy	經濟
educate	教育
effective	有效的
efficient	有效率的
eliminate	消除
encourage	鼓勵
energy	能源
enormous	巨大的
environment	環境
essential	必要的
establish	建立
estimate	估計
evaluate	評估
evidence	證據
examine	檢查
exchange	交換
exist	存在
expand	擴展
expect	期待
experiment	實驗
expert	專家
explore	探索
express	表達
factor	因素
feature	特徵
fiction	小說
finance	財務
flexible	有彈性的
focus	專注
frequent	頻繁的
function	功能
generation	世代
generous	慷慨的
global	全球的
graduate	畢業
guarantee	保證
habit	習慣
harmful	有害的
hesitate	猶豫
identify	識別
ignore	忽視
illustrate	說明
immediate	立即的
impact	影響
improve	改善
include	包含
increase	增加
independent	獨立的
indicate	表示
individual	個人的
influence	影響力
inform	通知
ingredient	成分
inspire	啟發
instance	例子
interact	互動
international	國際的
interpret	解釋
interview	面試
involve	涉及
issue	議題
journal	期刊；日誌
knowledge	知識
laboratory	實驗室
language	語言
maintain	維持
majority	大多數
manage	管理
measure	測量
method	方法
motivate	激勵
natural	自然的
negative	負面的
observe	觀察
obtain	獲得
occur	發生
opportunity	機會
participate	參加
perform	執行；表演
persuade	說服
phenomenon	現象
positive	正面的
potential	潛力
practical	實用的
predict	預測
prepare	準備
principle	原則
process	過程
produce	生產
profession	職業
promote	促進
protect	保護
provide	提供`;

/**
 * 解析 PROVIDED_TEXT 為 pairs 陣列
 */
function getProvidedPairs() {
  const lines = PROVIDED_TEXT.split(/\r?\n/).map(function(l){ return l.trim(); }).filter(function(l){ return l; });
  const pairs = [];
  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split(/\t+/);
    if (parts.length >= 2) {
      pairs.push({ word: parts[0].trim(), def: parts[1].trim() });
    }
  }
  return pairs;
}

function shuffleArray(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
}

/**
 * 從任意 pairs 產生題目
 */
function generateQuestionsFromPairs(pairs, numQuestions) {
  numQuestions = parseInt(numQuestions, 10) || 10;
  if (!pairs || pairs.length === 0) return [];
  const copy = pairs.slice();
  shuffleArray(copy);
  const questions = [];
  for (let q = 0; q < Math.min(numQuestions, copy.length); q++) {
    const correct = copy[q];
    const distractors = [];
    let idx = q + 1;
    while (distractors.length < 3 && copy.length > 1) {
      const candidate = copy[idx % copy.length];
      if (candidate.def !== correct.def && distractors.indexOf(candidate.def) === -1) {
        distractors.push(candidate.def);
      }
      idx++;
      if (idx - q > copy.length + 5) break;
    }
    const options = [correct.def].concat(distractors);
    shuffleArray(options);
    const correctIndex = options.indexOf(correct.def);
    questions.push({ word: correct.word, options: options, correctIndex: correctIndex });
  }
  return questions;
}

/**
 * 回傳由提供清單產生的題目（供前端透過 google.script.run 呼叫）
 * @param {number} numQuestions
 * @return {Array}
 */
function getQuestions(numQuestions) {
  const pairs = getProvidedPairs();
  return generateQuestionsFromPairs(pairs, numQuestions || 25);
}

/**
 * 預設為 Web App 回傳 HTML，若帶入 format=json 則回傳 JSON
 */
function doGet(e) {
  if (e && e.parameter && e.parameter.format === 'json') {
    const n = e.parameter.n ? parseInt(e.parameter.n, 10) : 25;
    const pairs = getProvidedPairs();
    const qs = generateQuestionsFromPairs(pairs, n);
    return ContentService.createTextOutput(JSON.stringify(qs)).setMimeType(ContentService.MimeType.JSON);
  }
  return HtmlService.createHtmlOutputFromFile('index').setTitle('Vocabulary Quiz');
}
