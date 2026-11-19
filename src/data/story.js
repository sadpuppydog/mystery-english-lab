// 劇情、線索、推理、揭曉、補救學習（文字來自 Figma 偵探版 v2）

export const GAME_TITLE = '英語實驗室密室命案';
export const GAME_SUB = 'THE MYSTERY IN ENGLISH LAB';

export const SUSPECTS = [
  { id: 'Alex', role: '英文社學生' },
  { id: 'Emma', role: '研究生' },
  { id: 'Kevin', role: '設備管理員' },
  { id: 'Sophia', role: '研究助理' },
];

export const PROLOGUE = {
  time: '2024-11-12 21:04 ・ AI English Lab A101',
  text: '學校即將舉辦「國際學習科技展」。成果展前一晚，林教授獨自留在英語學習實驗室整理資料。\n隔天早上，研究助理 Sophia 發現教授一直沒有回應——房門上鎖、窗戶緊閉，沒有打鬥痕跡，也沒有兇器。',
  message: '「如果你看到了這段訊息，代表事情可能已經失控了。我發現研究資料中有一些不尋常的地方……重要的資料已經整理在這個盤面中，希望你能找出真相。」',
};

export const STAGES = {
  1: {
    key: 'HOW', label: '第一關', name: '犯案方式', bingo: 'BINGO 1',
    mission: 'MISSION 01', missionTitle: '第一關｜HOW\n找出犯案方式',
    brief: '成果展前一晚，林教授獨自留在英語學習實驗室。隔天早上，他被發現已經死亡。\n房門上鎖、窗戶緊閉，沒有打鬥痕跡，也沒有兇器。',
    task: '完成 Grammar Bingo 累積學習分數、解鎖現場證據照片，在 1,500 分時推理出教授是怎麼被殺害的。',
    homeDesc: '房門上鎖、窗戶緊閉、沒有兇器。教授是怎麼被殺害的？',
    clueTitle: '調查進度', folderTitle: '案件證據資料夾｜第一關 犯案方式',
    clues: [
      { short: '門口監視器', title: '實驗室門口監視器', photo: '實驗室門口監視器', image: '/clues/lab-surveillance.png', quote: '教授進入後，沒有人再從門口進入。', source: '監視器紀錄・11/12 20:41–21:30', summary: '沒有人再從門口進入' },
      { short: '鑑識紀錄', title: '教授桌邊的鑑識紀錄', photo: '教授桌邊的鑑識紀錄', image: '/clues/forensic-report.png', quote: '沒有明顯外傷，疑似吸入異常物質。', source: '鑑識報告・11/13 08:52', summary: '疑似吸入異常物質' },
      { short: '空氣警示燈', title: '實驗室空氣警示燈', photo: '實驗室的空氣警示燈', image: '/clues/red-alert.png', quote: '教授進入後，空氣才出現異常。', source: '警示紀錄・11/12 21:05', summary: '空氣在教授進入後才異常' },
      { short: '共用通風口', title: '實驗室與設備室共用通風口', photo: '天花板的共用通風口', image: '/clues/shared-ventilation.png', quote: '實驗室與設備室共用通風系統。', source: '建築平面圖・設備區', summary: '與設備室共用通風' },
      { short: '通風控制面板', title: '設備室通風控制面板', photo: '設備室通風控制面板', image: '/clues/ventilation-log.png', quote: '案發時間，通風系統曾被啟動。', source: '系統操作紀錄・11/12 21:12', summary: '案發時曾被啟動' },
    ],
    question: '根據所有線索，你認為林教授的犯案方式是？',
    options: [
      '兇手事先在實驗室內設置裝置',
      '林教授在進入實驗室以前就已接觸到致命物質',
      '兇手利用沒有被正常門禁記錄的其他入口進入實驗室',
      '兇手沒有進入實驗室，而是從隔壁設備室影響室內環境',
    ],
    answer: 3,
    confirmLabel: '你選擇的犯案方式',
    reveal: {
      tag: 'STAGE 01・TRUTH', title: '真相揭曉｜不需要進門的密室殺人',
      scenes: [
        { title: '設備室・案發時間', text: '有人在隔壁設備室，啟動了通風控制面板。' },
        { title: '共用的通風管線', text: '實驗室與設備室共用通風系統，異常物質順著管線送進實驗室。' },
        { title: '上鎖的實驗室', text: '門窗緊閉、沒有人進出，教授在不知情下吸入異常物質。' },
      ],
    },
    truth: '兇手沒有進入實驗室，\n而是從隔壁設備室，透過共用的通風系統影響室內空氣。',
    teaser: '但是——誰有權限啟動設備室的通風系統？\n第二關，找出真正兇手。',
    nextLabel: '進入第二關｜WHO',
  },
  2: {
    key: 'WHO', label: '第二關', name: '真正兇手', bingo: 'BINGO 2',
    mission: 'MISSION 02', missionTitle: '第二關｜WHO\n找出真正兇手',
    brief: '犯案方式已確認：兇手從設備室啟動了通風系統。\nAlex、Emma、Kevin、Sophia——四人都說了當晚的行蹤，但有人隱瞞了真相。',
    task: '完成 Grammar Bingo 解鎖嫌疑人線索，在 1,500 分時推理出誰是真正的兇手。',
    homeDesc: 'Alex、Emma、Kevin、Sophia——四人之中，誰在說謊？',
    clueTitle: '嫌疑人線索', folderTitle: '案件證據資料夾｜第二關 真正兇手',
    clues: [
      { short: '社團合照', title: '社團合照：案發時的英文社', photo: '英文社社團合照', image: '/clues/bingo2-english-club.png', quote: '社團合照證明，案發時 Alex 在英文社活動。', source: '社團活動紀錄・11/12 20:30', summary: 'Alex 案發時在英文社' },
      { short: '監視器畫面', title: '圖書館監視器畫面', photo: '圖書館大廳監視器畫面', image: '/clues/bingo2-emma-cctv.png', quote: '監視器畫面顯示，案發當晚 Emma 出現在校園圖書館。', source: '圖書館監視器紀錄・11/12 21:00', summary: 'Emma 當晚在圖書館' },
      { short: '通風啟動帳號', title: '通風系統的登入帳號', photo: '通風系統登入紀錄', quote: '設備室的通風系統，是用 Kevin 的帳號啟動的。', source: '系統操作紀錄・11/12 21:12', summary: '用 Kevin 的帳號啟動' },
      { short: '不在場證明', title: 'Kevin 的不在場證明', photo: '另一棟樓的門禁紀錄', quote: '案發時 Kevin 本人在另一棟樓。', source: '門禁紀錄・11/12 21:10', summary: 'Kevin 本人在另一棟樓' },
      { short: '設備室目擊', title: '設備室附近的目擊者', photo: '設備室附近的目擊紀錄', quote: '案發時，Sophia 曾出現在設備室附近。', source: '目擊證詞・11/12 21:08', summary: 'Sophia 出現在設備室附近' },
    ],
    question: '根據所有線索，你認為真正的兇手是誰？',
    options: ['Alex（英文社學生）', 'Emma（研究生）', 'Kevin（設備管理員）', 'Sophia（研究助理）'],
    answer: 3,
    confirmLabel: '你選擇的兇手',
    reveal: {
      tag: 'STAGE 02・THE CULPRIT', title: '真正的兇手是——研究助理 Sophia',
      suspects: [
        { name: 'Alex', role: '英文社學生', text: '社團合照證明，案發時他在英文社活動。', verdict: '排除' },
        { name: 'Emma', role: '研究生', text: '監視器畫面證明她當晚的行蹤。', verdict: '排除' },
        { name: 'Kevin', role: '設備管理員', text: '設備室使用了他的帳號，但他本人在另一棟樓。', verdict: '被冒用' },
        { name: 'Sophia', role: '研究助理', text: '案發時曾出現在設備室附近，用 Kevin 的帳號啟動通風系統。林教授發現研究資料有問題，正準備揭發她。', verdict: '兇手' },
      ],
    },
    truth: '真正的兇手是研究助理 Sophia。\n她用 Kevin 的帳號，從設備室啟動了通風系統。',
    teaser: '案件真相大白。兩關的成績會一起計入最終結算。',
    nextLabel: '查看最終結算',
  },
};

export const FINAL_TEXT = '她用 Kevin 的帳號在設備室啟動通風系統，因為林教授準備揭發她在研究資料上的問題。';

export const REMEDIAL = [
  { topic: '主被動', q: 'The lab door _______ from the inside when the staff arrived.', opts: ['locked', 'had been locked', 'has locked', 'was locking'], ans: 1,
    wrong: ['門不會自己「鎖」，是被人鎖上，主詞 the lab door 是動作的接受者，要用被動語態。', '', 'has locked 是主動的現在完成式；門是被鎖上的，而且事情發生在過去。', 'was locking 是主動進行式；門是被人鎖上的，要用被動語態。'],
    point: '過去完成被動：had been + p.p.，表示在過去某時間點（員工抵達）之前就已完成的被動動作。',
    example: 'The report had been finished before the meeting started.' },
  { topic: '時態', q: 'By the time the police arrived, the professor _______ for an hour.', opts: ['waits', 'had been waiting', 'has waited', 'was waited'], ans: 1,
    wrong: ['waits 是現在簡單式，但事情發生在過去，而且是一段持續的時間。', '', 'has waited 是現在完成式；這裡是到「過去某個時間點」為止，要用過去完成進行式。', 'wait 是不及物動詞，不能用被動 was waited。'],
    point: '過去完成進行式：had been + V-ing，表示到過去某時間點為止，動作已持續一段時間。',
    example: 'She had been studying for two hours before the exam started.' },
  { topic: '分詞構句', q: '_______ the email, Kevin realized his account had been used.', opts: ['Read', 'Reading', 'To read', 'Being read'], ans: 1,
    wrong: ['Read 是原形動詞，不能直接放在句首當分詞構句；Kevin 是主動讀信，要用 V-ing。', '', 'To read 放句首表示「為了讀」，這裡是讀信時發現，要用分詞構句 V-ing。', 'Being read 是被動，但 Kevin 是主動讀信，要用 Reading。'],
    point: '分詞構句：兩子句主詞相同時，省略主詞和連接詞；主動用 V-ing，被動用 p.p.。',
    example: 'Opening the door, Sophia saw the professor.' },
];

export const RULES = [
  { title: 'Grammar Bingo', body: '每關一個 5×5 盤面。按「抽格子」由系統隨機抽出下一格，抽到哪一格就挑戰哪一格。\n\n一般文法格：3 題，每題答完立即判斷；答錯即失敗，不能重新挑戰。\n\n事件格：補充案件背景，抽到時可選擇挑戰或略過。' },
  { title: '學習分數', body: '用來解鎖線索、開放推理\n（用提示或 AI 不會扣學習分數）\n\n一般格三題全對 +100\n事件格成功 +200\n連成一條 Bingo +150' },
  { title: '線索與推理', body: '進關前選擇要拿幾個線索（1–5 個）。\n\n1,500 分為推理門檻，依你選的數量平均切出解鎖點。\n\n集滿線索、到達 1,500 分，可推理一次。' },
  { title: '遊戲分數', body: '選越少線索，基礎分越高：\n\n1000 − 線索數 × 200\n\n推理猜對再 +200。' },
  { title: '金幣與道具', body: '每關開始金幣為 0\n完成一般格 +5\n事件成功 +20\n事件失敗 −20（一般格答錯不扣）。\n金幣用來在商店買道具\n（只用於事件格，每種道具每個事件限用一次）。' },
  { title: '協助分數', body: '每關 1,500 分，進第二關會重新給。\n問 AI −5・看提示 −5\n同一題換不同 AI，各扣一次。\n分數不足時仍可問 AI。\n事件格不能用 AI 與提示。' },
];
