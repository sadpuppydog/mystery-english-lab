// 事件格：每關一套題目（A 給第一關、B 給第二關），每個事件另有一題「鑑識手套」換題用的備用題。
// 單選題：opts 第 ans 個是正確答案；多選題：ans 是正確選項索引陣列。

export const EVENTS = {
  E1: {
    name: '事件 1', mode: 'timed', modeLabel: '限時挑戰',
    title: '重新整理教授的工作筆記',
    shortTitle: '整理工作筆記',
    desc: '教授的工作筆記字跡模糊，有些內容看不清楚。\n在時間內完成文法題，把筆記整理出來。',
    special: '特殊玩法：限時挑戰（每題 60 秒）',
    instruction: '筆記上的字跡有些模糊，選出正確的字補上',
    items: ['magnifier', 'glove', 'coffee'],
    note: '成果展前幾天，設備系統常出現異常，需要再確認。',
    noteTitle: '工作筆記・整理完成',
    failText: '時間到或答錯了，\n筆記還是看不清楚。',
    sets: {
      A: {
        qs: [
          { q: 'The equipment system _______ problems several times before the exhibition.', opts: ['had', 'has', 'having', 'to have'], ans: 0 },
          { q: 'Professor Lin _______ the report when the alarm rang.', opts: ['writes', 'is writing', 'was writing', 'has written'], ans: 2 },
          { q: 'The notes _______ by Professor Lin last week.', opts: ['wrote', 'were written', 'have written', 'writing'], ans: 1 },
        ],
        spare: { q: 'The lab _______ quiet when the alarm went off.', opts: ['was', 'is', 'were', 'being'], ans: 0 },
      },
      B: {
        qs: [
          { q: 'Kevin _______ the doors every night before he leaves.', opts: ['checks', 'check', 'checking', 'to check'], ans: 0 },
          { q: 'While Emma _______ the data, the lights went out.', opts: ['was reading', 'reads', 'is reading', 'has read'], ans: 0 },
          { q: 'The report _______ to the professor yesterday.', opts: ['was sent', 'sent', 'sends', 'is sending'], ans: 0 },
        ],
        spare: { q: 'Sophia _______ in the lab since 8 p.m.', opts: ['has been', 'is', 'was being', 'be'], ans: 0 },
      },
    },
  },
  E2: {
    name: '事件 2', mode: 'six', modeLabel: '增加選項',
    title: '查看成果展展示紀錄',
    shortTitle: '查看成果展展示紀錄',
    desc: '實驗室的電腦裡還留著成果展的展示紀錄，但檔案被加密了。\n完成文法題，讀取這份紀錄。',
    special: '特殊玩法：增加選項（選項從 4 個變成 6 個）',
    instruction: '選出最適合填入空格的答案',
    items: ['magnifier', 'glove'],
    note: '成果展前一天，研究團隊多次進出實驗室與設備區。',
    noteTitle: '展示紀錄・讀取完成',
    failText: '檔案讀取到一半就中斷了，\n紀錄內容仍無法辨識。',
    sets: {
      A: {
        qs: [
          { q: 'The research team _______ the lab twice on the day before the exhibition.', opts: ['visits', 'visited', 'has visited', 'visiting', 'was visited', 'to visit'], ans: 1 },
          { q: 'By the time the staff opened the lab, Professor Lin _______ for several hours.', opts: ['has been dead', 'had been dead', 'was dying', 'is dead', 'has died', 'had died'], ans: 1 },
          { q: 'Nobody knew _______ turned on the ventilation system.', opts: ['who', 'whom', 'whose', 'which', 'what', 'where'], ans: 0 },
        ],
        spare: { q: 'The alarm _______ before anyone noticed the smell.', opts: ['had rung', 'rings', 'has rung', 'ringing', 'to ring', 'was rung'], ans: 0 },
      },
      B: {
        qs: [
          { q: 'Alex _______ the club room at nine last night.', opts: ['left', 'leaves', 'has left', 'leaving', 'was left', 'to leave'], ans: 0 },
          { q: 'The window _______ before the police arrived.', opts: ['had been closed', 'has closed', 'closes', 'closing', 'was closing', 'to close'], ans: 0 },
          { q: 'Do you know _______ key this is?', opts: ['whose', 'who', 'whom', 'which', 'what', 'where'], ans: 0 },
        ],
        spare: { q: 'Kevin couldn\'t remember _______ he had put the key.', opts: ['where', 'who', 'whose', 'which', 'what', 'whom'], ans: 0 },
      },
    },
  },
  E3: {
    name: '事件 3', mode: 'multi', modeLabel: '多選題',
    title: '整理研究團隊的日常紀錄',
    shortTitle: '整理日常紀錄',
    desc: '研究團隊的日常紀錄混在一起，有些句子寫錯了。\n選出所有正確的句子，整理出真正的紀錄。',
    special: '特殊玩法：多選題（答案不只一個）',
    instruction: '選出所有文法正確的句子',
    items: ['magnifier', 'glove'],
    note: 'Kevin 的帳號密碼，曾經被貼在設備室的電腦旁。',
    noteTitle: '日常紀錄・整理完成',
    failText: '有句子判斷錯了，\n紀錄還是不完整。',
    sets: {
      A: {
        qs: [
          { opts: ['Alex helps with the English club activities.', 'Emma have organized the research data.', 'Kevin is in charge of the lab equipment.', 'Sophia assist the professor with his research.', 'The team has worked together for two years.'], ans: [0, 2, 4] },
          { opts: ['Sophia has worked here since 2020.', 'Kevin go to the gym yesterday.', 'Emma is good at writing reports.', 'Alex was cleaned the room.', 'The professor don\'t like noise.'], ans: [0, 2] },
          { opts: ['Nobody entered the lab after nine.', 'The key was kept by Kevin.', 'Sophia didn\'t knew the password.', 'The system was turned on at 9:12.', 'Emma and Alex was in the club room.'], ans: [0, 1, 3] },
        ],
        spare: { opts: ['The lab was locked at night.', 'Kevin don\'t have the key.', 'Emma has worked here for a year.', 'Sophia were in the equipment room.', 'The professor was working late.'], ans: [0, 2, 4] },
      },
      B: {
        qs: [
          { opts: ['Emma is writing the report now.', 'Alex have a club meeting today.', 'The door was opened by someone.', 'Kevin forget his password yesterday.', 'Sophia works in the lab.'], ans: [0, 2, 4] },
          { opts: ['The professor was respected by everyone.', 'Emma don\'t know Kevin well.', 'The team is preparing for the show.', 'Alex were late for the meeting.'], ans: [0, 2] },
          { opts: ['Sophia had left before Kevin came.', 'The alarm ring at 9:05.', 'Nobody saw the person clearly.', 'Emma and Alex is good friends.', 'The lights were turned off.'], ans: [0, 2, 4] },
        ],
        spare: { opts: ['The data was saved at nine.', 'Kevin go home early.', 'Emma has finished her work.', 'Alex don\'t like the lab.', 'The room is very quiet.'], ans: [0, 2, 4] },
      },
    },
  },
};

export const ITEMS = {
  magnifier: { name: '線索放大鏡', price: 25, short: '排除部分錯誤選項', effect: '作答時排除 2 個錯誤選項（每個事件限用一次）',
    desc: '在事件挑戰作答時使用，替你排除該題中部分錯誤選項。', events: ['E1', 'E2', 'E3'], eventsLabel: '事件 1・事件 2・事件 3',
    confirm: '排除這一題的 2 個錯誤選項。', icon: 'magnifier' },
  glove: { name: '鑑識手套', price: 40, short: '重新抽一題新的事件題', effect: '把目前的事件題換成新的一題',
    desc: '事件題太難時，可以重新抽一題新的事件題。', events: ['E1', 'E2', 'E3'], eventsLabel: '事件 1・事件 2・事件 3',
    confirm: '把這一題換成一題新的事件題。', icon: 'glove' },
  coffee: { name: '偵探咖啡', price: 15, short: '延長限時挑戰作答時間', effect: '限時題作答時間 +20 秒（每個事件限用一次）',
    desc: '在限時事件作答時使用，延長本題的作答時間 20 秒。', events: ['E1'], eventsLabel: '事件 1 限時挑戰',
    confirm: '本題作答時間延長 20 秒。', icon: 'coffee' },
};
