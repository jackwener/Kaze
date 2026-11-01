/* Kaze — kaze.build
   Plain JS. The live window is driven by a small state object and a tour runner. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ------------------------------------------------------------------
     Copy: page sections (Chinese; English lives in the HTML) and the
     strings used inside the live window (both languages).
     ------------------------------------------------------------------ */
  var ZH = {
    'skip': '跳到正文',
    'nav.agent': '智能体', 'nav.tabs': '标签页', 'nav.translate': '翻译', 'nav.colour': '颜色', 'nav.privacy': '隐私',
    'cta.short': '下载',
    'hero.title': '你在浏览，<br>它在做事<span class="dot">。</span>',
    'hero.sub': '安静、轻快的浏览器，支持 macOS 和 Windows。它的智能体在自己的标签页里做事，付款、发送或删除之前，一定先问你。',
    'cta.download': '下载 macOS 版', 'cta.watch': '看它做事', 'cta.more': '选择下载版本', 'cta.arm': 'Apple 芯片', 'cta.intel': 'Intel', 'cta.win': '下载 Windows 版', 'cta.winx64': 'Windows（x64）', 'cta.winarm': 'Windows（ARM）', 'cta.all': '所有版本',
    'works.from': '一键搬来', 'works.with': '也能借给这些 agent 用',
    'chap.agent': '订一张机票', 'chap.palette': '⌘K 面板', 'chap.translate': '翻译', 'chap.tidy': '整理标签页',
    'swatches.label': '窗口颜色',
    'demo.hint': '这是一个真的窗口。点点标签页，按 ⌘K，或者让它做点什么。',
    'eb.agent': '智能体', 'eb.tabs': '标签页', 'eb.tr': '翻译', 'eb.pal': '命令面板', 'eb.ads': '广告拦截', 'eb.colour': '颜色',
    'eb.imp': '换过来', 'eb.priv': '隐私', 'eb.agents': '你的其他 agent', 'eb.faq': '常见问题',
    'agents.title': 'Claude Code 也能用你的标签页。',
    'agents.lead': 'Kaze 会找到你电脑上的 Claude Code、Codex、Cursor 等 agent，通过它的 MCP 服务器一次接好。它们在你真实的标签页里读和做事，用的是你的登录状态，每一步都像 Kaze 自己做的一样显示出来。',
    'agents.note': '在设置里断开任何一个，它就一直保持断开。',
    'term.ask': '读一下我在 Kaze 里开着的航班，把最便宜的加进 plan.md',
    'term.r1': '「飞往里斯本的航班」里有 3 个标签页', 'term.r3': '已加入 11 月 20 日周五，TP1351，€97',
    'faq.title': '下载之前。',
    'faq.more': '还有别的问题？<a href="https://github.com/jackwener/Kaze/issues">在 GitHub 上问</a>。',
    'faq.q1.q': 'Kaze 免费吗？', 'faq.q1.a': '免费，也不用注册账号。智能体用你选的模型运行：用 ChatGPT 登录、填你自己的 API 密钥，或者接任何兼容 OpenAI 的接口。',
    'faq.q2.q': '支持哪些电脑？', 'faq.q2.a': 'macOS 13 及以上的 Mac（Apple 芯片和 Intel），以及 Windows 10 和 11 的电脑（x64 和 ARM，从 0.27 版开始）。',
    'faq.q3.q': '我浏览的内容会离开我的电脑吗？', 'faq.q3.a': '活动记录、历史和设置都留在你的电脑上。你交给智能体一件事时，它为这件事读到的内容会发给你选的模型，不会发到别处。',
    'faq.q4.q': '智能体会做我没让它做的事吗？', 'faq.q4.a': '它在自己的标签页里做事，每一步都让你看见。付款、发送、删除或运行任何东西之前，它都会先问你。随时按 ⌘. 就能接管。',
    'faq.q5.q': '我的 Chrome 扩展能用吗？', 'faq.q5.a': '能。可以从 Chrome 一起搬过来，也可以从 Chrome 网上应用店装新的。',
    'faq.q6.q': '怎么更新？', 'faq.q6.a': 'Kaze 会自己检查新版本并更新。每个版本和更新说明都在 GitHub 上。',
    'foot.issues': '报告问题', 'foot.faq': '常见问题',
    'agent.title': '它在自己的标签页里做事。',
    'agent.lead': '在侧边栏或浮动卡片里提出要求，用你自己选的模型。Kaze 会在后台标签页里打开需要的网页，并把它们归进一个以任务命名的分组。你自己的标签页原样不动。',
    'dock.stop': '停止', 'dock.take': '接管',
    'agent.dock.t': '每一步，都在页面底部。',
    'agent.dock.p': '底栏告诉你它此刻在做什么。可以让它停下，也可以按 <kbd>⌘.</kbd> 接管，亲手操作页面；按 <kbd>⇧⌘↩</kbd> 再交还给它。',
    'state.working': '进行中', 'state.needs': '需要你', 'state.done': '完成', 'state.driving': '你在操作',
    'agent.states.t': '状态，就写在标签页上。',
    'agent.states.p': '工作时有一圈光晕；需要你时亮起琥珀色圆点，程序坞图标上也会提示；完成后打勾；你在操作时显示指针。',
    'perm.title': '向 TAP Air Portugal 支付 €97', 'perm.sub': '伦敦飞里斯本，09:40', 'perm.no': '暂不', 'perm.yes': '支付',
    'agent.perm.t': '付钱之前，先问你。',
    'agent.perm.p': '在付款、发送、删除或运行任何东西之前，它会弹出一张卡片，写清楚具体是哪件事。你不点头，什么都不会发生。',
    'group.name': '飞往里斯本的航班', 'group.tab3': '选座', 'group.close3': '关闭它打开的 3 个标签页', 'group.keep': '保留',
    'agent.group.t': '做完，顺手收拾。',
    'agent.group.p': '它打开的标签页会归进以任务命名的分组。任务完成后，一键关掉它们，或者留着。',
    'more.sub.t': '子智能体', 'more.sub.p': '大任务会拆成几份并行进行，每份都在自己的标签页里。',
    'more.sched.t': '定时任务', 'more.sched.p': '让它每天早上 8 点查一次价格，或者周五 9 点执行一次。',
    'more.act.t': '活动记录', 'more.act.p': '一份私密、只存在本地的记录，记下你做过和读过的内容。问它“上周那篇讲电车的文章”，它就能找到。',
    'more.media.t': '说话与下载', 'more.media.p': '输入框支持语音转文字。通过 yt-dlp 和 ffmpeg 下载视频与音频。',
    'more.mcp.t': '你的其他智能体', 'more.mcp.p': 'Claude Code、Codex 和 Cursor 可以通过 Kaze 的 MCP 服务器操作它的标签页。',
    'tabs.title': '一直整整齐齐的标签页。',
    'tabs.lead': '今天打开的标签页都在“清除”分隔线上方。一键全部关闭，点“撤销”又都回来。',
    'tabs.f1': '清除掉的标签页，连同分组，按“撤销”或 ⌘⇧T 就能整批回来。',
    'tabs.f2': '闲置的标签页会休眠，把内存还给你。',
    'tidy.clear': '清除', 'tidy.undo': '撤销',
    'tr.title': '任何语言，对照着读。',
    'tr.lead': '按 <kbd>⌥E</kbd> 翻译整页，双语对照或只看译文。按住 <kbd>⌥</kbd> 悬停在某一段上，只翻译那一段。默认使用免费的 Google 翻译，也可以换成你自己的模型。',
    'tr.off': '原文', 'tr.bi': '双语', 'tr.only': '仅译文',
    'tr.hint': '切到“原文”，再按住 ⌥ 悬停在某一段上（触屏上点一下）。',
    'pal.title': '⌘K 记得你刚才在哪。',
    'pal.lead': '面板一打开就停在你上一个标签页上，按 <kbd>↩</kbd> 就回去了。每一行都写明 <kbd>↩</kbd> 会做什么。它会算数。按 <kbd>⌘↩</kbd>，把你输入的内容交给 Kaze。',
    'pal.try': '试试', 'pal.tryAsk': '周六在阿尔法玛怎么玩',
    'ads.title': '广告和跟踪器，根本不加载。',
    'ads.lead': '拦截是内置的，规则列表每天更新。不用装任何东西，也可以对某个网站一键关闭。',
    'ads.on': '这个页面上拦下了 31 个广告和跟踪器。',
    'colour.title': '一种颜色，铺满整个窗口。',
    'colour.lead': '选一个色调，它会塑造一切：带颗粒的有色底板、同一色相的文字、页面和面板用的白纸。每个窗口可以有自己的颜色。无痕窗口是深色的。',
    'tone.sky': '天空', 'tone.lavender': '薰衣草', 'tone.mint': '薄荷', 'tone.mono': '单色', 'tone.private': '无痕',
    'imp.title': '一步，全部搬过来。',
    'imp.lead': '从 Chrome、Arc、Edge、Brave 或 Safari，带上你的标签页、登录信息、书签、历史记录和扩展。Chrome 扩展照常能用。',
    'imp.tabs': '打开的标签页', 'imp.logins': '登录信息', 'imp.bookmarks': '书签', 'imp.history': '历史记录', 'imp.ext': '扩展',
    'priv.title': '用你自己的模型，数据留在你的电脑上。',
    'priv.1.t': '用你自己的模型', 'priv.1.p': '智能体用你选的模型、你自己的密钥运行。想换随时换。',
    'priv.2.t': '本地优先', 'priv.2.p': '活动记录、历史和设置都存在你的电脑上，智能体也从那里回忆。',
    'priv.3.t': 'English 和简体中文', 'priv.3.p': '整个应用，两种语言。',
    'close.title': '风过，事成。',
    'close.p': 'Kaze 是日语里的「風」。交给它一件事，看你的标签页自己动起来。',
    'foot.releases': '版本发布'
  };

  var T = {
    en: {
      newTab: 'New tab', askLabel: 'Ask Kaze', askPh: 'Ask Kaze, or @ a tab', model: 'Sonnet 5.5',
      clear: 'Clear', undo: 'Undo', closedN: 'Closed {n} tabs',
      emptyHi: 'What should I do?', emptySub: 'I work in tabs of my own.',
      sug1: 'Find a flight to Lisbon under €120', sug2: 'Translate this page', sug3: "Tidy up today's tabs",
      userFlight: 'Find me a flight to Lisbon on Friday morning, under €120, and book it.',
      aiStart: "On it. I'll search in a tab of my own and ask before I pay.",
      groupName: 'Flights to Lisbon',
      s1: 'Opening skyfare.travel', s2: 'Searching London to Lisbon, Fri 20 Nov', s3: 'Reading 6 results',
      s4: 'Filtering under €120: 4 flights', s5: 'Picking TAP TP1351, 09:40, €97', s6: 'Opening checkout on flytap.com',
      s7: 'Filling in passenger details', s8: 'Waiting for you to approve €97', s9: 'Paying €97',
      permTitle: 'Pay €97 to TAP Air Portugal', permSub: 'London to Lisbon, 09:40', notNow: 'Not now', pay: 'Pay',
      took: 'You took over.', handedBack: 'Back to Kaze.', driving: "You're driving", handBack: 'Hand back',
      stop: 'Stop', takeOver: 'Take over',
      stopped: 'Stopped. The tabs I opened are still in “Flights to Lisbon”.',
      notNowReply: "Okay, I didn't pay. The checkout is still open in its tab if you want it.",
      booked: 'Booked. TP1351 leaves Heathrow at 09:40 on Friday 20 Nov and lands in Lisbon at 12:15. €97, paid with the card ending 4242.',
      closeN: 'Close the {n} tabs it opened', keep: 'Keep', closedGroup: 'Closed {n} tabs.', keptGroup: 'Kept in “Flights to Lisbon”.',
      demoReply: "In the app I'd do that right in your tabs. In this demo, try one of these:",
      palPh: 'Search tabs and history, or ask Kaze', aSwitch: 'Switch to tab', aOpen: 'Open', aSearch: 'Search', aCopy: 'Copy', aAsk: 'Ask Kaze',
      secTabs: 'Open tabs', secHist: 'History', searchFor: 'Search the web for “{q}”', askFor: 'Ask Kaze: {q}', copied: 'Copied {v}',
      trFrom: 'Translated from <b>Portuguese</b> by Google Translate', trOff: 'Original', trBi: 'Bilingual', trOnly: 'Translation only',
      would: '↩ would {a}: {t}', switchTo: 'switch to', open: 'open', search: 'search', copy: 'copy', ask: 'ask Kaze',
      cap_agent1: 'You ask in the side panel. Kaze opens a tab of its own and groups it under the task.',
      cap_agent2: 'The dock at the page\'s foot shows the live step. Press <b>Take over ⌘.</b> to drive it yourself.',
      cap_agent3: 'Before it pays, it asks. Press <b>Pay ↩</b> or <b>Not now</b>.',
      cap_agent4: 'Done. One press closes the tabs it opened.',
      cap_pal: '<b>⌘K</b> opens on your last tab. Each row says what ↩ does. It does sums, and ⌘↩ asks Kaze.',
      cap_tr: '<b>⌥E</b> turns the page bilingual. Hold ⌥ and hover to translate one paragraph.',
      cap_tidy: 'Today\'s tabs sit above <b>Clear</b>. One press, and Undo if you change your mind.',
      cap_drive: 'You\'re driving. Kaze waits. Press <b>Hand back ⇧⌘↩</b> when you\'re done.',
      dockWords: ['Reading Orbit…', 'Comparing 4 flights…', 'Filling in passenger details…', 'Checking the seat map…']
    },
    zh: {
      newTab: '新标签页', askLabel: '问 Kaze', askPh: '问 Kaze，或 @ 一个标签页', model: 'Sonnet 5.5',
      clear: '清除', undo: '撤销', closedN: '已关闭 {n} 个标签页',
      emptyHi: '要我做点什么？', emptySub: '我会在自己的标签页里做事。',
      sug1: '找一张 €120 以内飞里斯本的机票', sug2: '翻译这个页面', sug3: '收拾一下今天的标签页',
      userFlight: '帮我订一张周五上午飞里斯本的机票，€120 以内。',
      aiStart: '好的。我会在自己的标签页里搜索，付款前先问你。',
      groupName: '飞往里斯本的航班',
      s1: '打开 skyfare.travel', s2: '搜索 伦敦 → 里斯本，11 月 20 日周五', s3: '读取 6 个结果',
      s4: '筛选 €120 以内：4 个航班', s5: '选定 TAP TP1351，09:40，€97', s6: '在 flytap.com 打开结账页',
      s7: '填写乘客信息', s8: '等你确认支付 €97', s9: '正在支付 €97',
      permTitle: '向 TAP Air Portugal 支付 €97', permSub: '伦敦飞里斯本，09:40', notNow: '暂不', pay: '支付',
      took: '你接管了。', handedBack: '已交还给 Kaze。', driving: '你在操作', handBack: '交还',
      stop: '停止', takeOver: '接管',
      stopped: '已停止。我打开的标签页还在「飞往里斯本的航班」分组里。',
      notNowReply: '好的，没有付款。结账页还开在它的标签页里。',
      booked: '订好了。TP1351 于 11 月 20 日周五 09:40 从希思罗起飞，12:15 抵达里斯本。€97，已用尾号 4242 的卡支付。',
      closeN: '关闭它打开的 {n} 个标签页', keep: '保留', closedGroup: '已关闭 {n} 个标签页。', keptGroup: '已保留在「飞往里斯本的航班」。',
      demoReply: '在应用里，我会直接在你的标签页里做完。这个演示里，先试试这些：',
      palPh: '搜索标签页和历史，或问 Kaze', aSwitch: '切换到标签页', aOpen: '打开', aSearch: '搜索', aCopy: '复制', aAsk: '问 Kaze',
      secTabs: '打开的标签页', secHist: '历史', searchFor: '在网上搜索「{q}」', askFor: '问 Kaze：{q}', copied: '已复制 {v}',
      trFrom: '已由 Google 翻译从<b>葡萄牙语</b>译出', trOff: '原文', trBi: '双语', trOnly: '仅译文',
      would: '↩ 会{a}：{t}', switchTo: '切换到', open: '打开', search: '搜索', copy: '复制', ask: '交给 Kaze',
      cap_agent1: '你在侧边栏提出要求。Kaze 打开自己的标签页，归进以任务命名的分组。',
      cap_agent2: '页面底部的底栏显示它正在做的那一步。按 <b>接管 ⌘.</b> 就能亲手操作。',
      cap_agent3: '付款之前，它先问你。点 <b>支付 ↩</b> 或 <b>暂不</b>。',
      cap_agent4: '完成了。一键关掉它打开的标签页。',
      cap_pal: '<b>⌘K</b> 一打开就停在上一个标签页。每行写明 ↩ 会做什么。它会算数，⌘↩ 交给 Kaze。',
      cap_tr: '<b>⌥E</b> 把页面变成双语对照。按住 ⌥ 悬停，只翻译一段。',
      cap_tidy: '今天的标签页都在 <b>清除</b> 上方。一键关闭，后悔了就撤销。',
      cap_drive: '你在操作，Kaze 在等。做完按 <b>交还 ⇧⌘↩</b>。',
      dockWords: ['正在读 Orbit…', '正在比较 4 个航班…', '正在填写乘客信息…', '正在查看座位图…']
    }
  };

  /* A visitor on Windows: the main download button is the Windows installer
     (x64; ARM from the menu), and the line under it says what that runs on. */
  var onWindows = /Windows/.test(navigator.userAgent);
  if (onWindows) $$('.dl-main').forEach(function (a) {
    a.dataset.dl = 'win-x64';
    var label = $('[data-i18n="cta.download"]', a);
    if (label) { label.dataset.i18n = 'cta.win'; label.textContent = 'Download for Windows'; }
  });

  var hashLang = new URLSearchParams(location.hash.slice(1)).get('lang');
  var lang = hashLang ? (hashLang === 'zh' ? 'zh' : 'en') : (root.lang === 'zh-CN' ? 'zh' : 'en');
  root.lang = lang === 'zh' ? 'zh-CN' : 'en';
  function t(k, vars) {
    var s = (T[lang] && T[lang][k]) || T.en[k] || k;
    if (vars) Object.keys(vars).forEach(function (v) { s = s.replace('{' + v + '}', vars[v]); });
    return s;
  }

  function applyLang(l, user) {
    lang = l;
    root.lang = l === 'zh' ? 'zh-CN' : 'en';
    if (user) store.set('kaze.lang', l);
    $$('[data-i18n]').forEach(function (el) {
      if (el.dataset.en == null) el.dataset.en = el.textContent;
      el.textContent = l === 'zh' && ZH[el.dataset.i18n] ? ZH[el.dataset.i18n] : el.dataset.en;
    });
    $$('[data-i18n-html]').forEach(function (el) {
      if (el.dataset.en == null) el.dataset.en = el.innerHTML;
      el.innerHTML = l === 'zh' && ZH[el.dataset.i18nHtml] ? ZH[el.dataset.i18nHtml] : el.dataset.en;
    });
    $$('[data-i18n-aria]').forEach(function (el) {
      if (el.dataset.enAria == null) el.dataset.enAria = el.getAttribute('aria-label');
      el.setAttribute('aria-label', l === 'zh' ? ZH[el.dataset.i18nAria] : el.dataset.enAria);
    });
    $$('[data-i18n-try]').forEach(function (el) {
      if (el.dataset.enTry == null) el.dataset.enTry = el.dataset.try;
      el.dataset.try = l === 'zh' ? ZH[el.dataset.i18nTry] : el.dataset.enTry;
      el.textContent = el.dataset.try;
    });
    $$('[data-k]').forEach(function (el) { el.textContent = t(el.dataset.k); });
    $$('[data-kph]').forEach(function (el) { el.placeholder = t(el.dataset.kph); });
    $$('.lang-btn').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === l)); });
    document.title = l === 'zh' ? 'Kaze：你在浏览，它在做事' : 'Kaze: the browser that works while you browse';
    var md = $('meta[name="description"]');
    if (md) {
      if (!md.dataset.en) md.dataset.en = md.content;
      md.content = l === 'zh' ? 'Kaze 是一款安静、轻快的浏览器，支持 macOS 和 Windows，内置智能体。它在自己的标签页里做事，每一步都让你看见，付款、发送或删除之前先问你。免费。' : md.dataset.en;
    }
    paintMeta();
    if (typeof onLangChange === 'function') onLangChange();
  }

  /* The line under the download buttons: what the latest release really
     is — its version, and Intel only once a release carries an x64 build;
     on Windows, Windows's. */
  var release = null;
  function paintMeta() {
    var zh = lang === 'zh', intel = release && release.intel;
    var parts = onWindows
      ? (zh ? ['免费', 'Windows 10 和 11', 'x64 和 ARM'] : ['Free', 'Windows 10 and 11', 'x64 and ARM'])
      : zh
        ? ['免费', 'macOS 13 及以上', intel ? 'Apple 芯片和 Intel' : 'Apple 芯片']
        : ['Free', 'macOS 13 or later', intel ? 'Apple silicon and Intel' : 'Apple silicon'];
    if (release && release.version) parts.push((zh ? '版本 ' : 'Version ') + release.version);
    $$('[data-meta]').forEach(function (el) { el.textContent = parts.join(' · '); });
  }
  if (window.fetch) {
    fetch('https://api.github.com/repos/jackwener/Kaze/releases/latest')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (r) {
        if (!r || !r.tag_name) return;
        var names = (r.assets || []).map(function (a) { return a.name; });
        release = {
          version: r.tag_name.replace(/^v/, ''),
          intel: names.some(function (n) { return /\.dmg$/.test(n) && !/arm64/.test(n); })
        };
        paintMeta();
        // The download buttons go straight to the file: the Mac's DMG (Apple silicon by default,
        // Intel from the menu) or Windows's installer (x64, ARM from the menu).
        var file = {};
        (r.assets || []).forEach(function (a) {
          if (/\.dmg$/.test(a.name)) file[/arm64/.test(a.name) ? 'arm64' : 'x64'] = a.browser_download_url;
          var win = /-win-(x64|arm64)\.exe$/.exec(a.name);
          if (win) file['win-' + win[1]] = a.browser_download_url;
        });
        $$('[data-dl]').forEach(function (el) { if (file[el.dataset.dl]) el.href = file[el.dataset.dl]; });
        ['x64', 'win-x64', 'win-arm64'].forEach(function (k) {
          $$('.dl-menu [data-dl="' + k + '"]').forEach(function (el) { el.hidden = !file[k]; });
        });
      })
      .catch(function () {});
  }

  /* The download button's menu: Apple silicon, Intel, every release. */
  $$('[data-dl-split]').forEach(function (split) {
    var more = $('.dl-more', split), menu = $('.dl-menu', split);
    function set(open) {
      menu.hidden = !open;
      more.setAttribute('aria-expanded', String(open));
      if (open) { var first = $('a:not([hidden])', menu); if (first) first.focus(); }
    }
    more.addEventListener('click', function (e) { e.stopPropagation(); set(menu.hidden); });
    menu.addEventListener('keydown', function (e) {
      var items = $$('a:not([hidden])', menu), i = items.indexOf(document.activeElement);
      if (e.key === 'Escape') { set(false); more.focus(); }
      else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus();
      }
    });
    document.addEventListener('click', function (e) { if (!split.contains(e.target)) set(false); });
  });

  /* ------------------------------------------------------------------
     Tone
     ------------------------------------------------------------------ */
  var TONES = ['sky', 'lavender', 'mint', 'mono'];
  var THEME = { sky: '#C4D0EE', lavender: '#D2CAEE', mint: '#BFDCD0', mono: '#D3D5D9' };
  function setTone(name, user) {
    if (TONES.indexOf(name) < 0) return;
    root.setAttribute('data-tone', name);
    $$('[data-tone-set]').forEach(function (b) { b.setAttribute('aria-checked', String(b.dataset.toneSet === name)); });
    var tc = $('meta[name="theme-color"]'); if (tc) tc.content = THEME[name];
    if (user) store.set('kaze.tone', name);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-tone-set]');
    if (b) { setTone(b.dataset.toneSet, true); }
    var l = e.target.closest('.lang-btn');
    if (l) applyLang(l.dataset.lang, true);
  });

  /* ------------------------------------------------------------------
     Mock data
     ------------------------------------------------------------------ */
  var ART = {
    h: { pt: 'Os elétricos voltam a subir à Graça', en: 'The trams are climbing to Graça again', zh: '电车又开上格拉萨了' },
    p: [
      { pt: 'Às sete da manhã de segunda-feira, o primeiro elétrico amarelo subiu a Rua da Graça com meia dúzia de passageiros e um guarda-freio que não parava de sorrir. Os vizinhos vieram à janela para ver.',
        en: 'At seven on Monday morning, the first yellow tram climbed Rua da Graça with half a dozen passengers and a driver who couldn’t stop smiling. Neighbours came to their windows to watch.',
        zh: '周一早上七点，第一辆黄色电车载着六七位乘客驶上格拉萨街，司机一路笑个不停。邻居们纷纷探出窗外观看。' },
      { pt: 'A obra custou 4,2 milhões de euros e trocou quase dois quilómetros de carris. Durante oito meses, os moradores dependeram de autocarros que demoravam o dobro do tempo.',
        en: 'The work cost €4.2 million and replaced almost two kilometres of track. For eight months, residents relied on buses that took twice as long.',
        zh: '这项工程耗资 420 万欧元，更换了近两公里的轨道。八个月里，居民只能依靠用时翻倍的公交车。' },
      { pt: '«Para quem tem oitenta anos, como eu, o elétrico não é turismo, é a única maneira de chegar à farmácia», diz Dona Amélia, que vive no Largo da Graça há cinquenta anos.',
        en: '“For someone who’s eighty, like me, the tram isn’t tourism. It’s the only way to get to the pharmacy,” says Dona Amélia, who has lived on Largo da Graça for fifty years.',
        zh: '“对我这样八十岁的人来说，电车不是观光，而是去药房的唯一办法。”在格拉萨广场住了五十年的阿梅莉亚太太说。' },
      { pt: 'A Carris promete um elétrico a cada nove minutos nas horas de ponta. Ao fim de semana, a fila no Martim Moniz continua a dar a volta à praça.',
        en: 'Carris promises a tram every nine minutes at rush hour. At weekends, the queue at Martim Moniz still wraps around the square.',
        zh: 'Carris 承诺高峰时段每九分钟一班。到了周末，马丁·莫尼兹的队伍依然绕广场一圈。' }
    ]
  };
  var FLIGHTS = [
    { a: 'Atlantica', l: 'A', c: 'f-teal', dep: '06:15', arr: '13:40', info: '1 stop, 7h 25m', p: 79 },
    { a: 'TAP Air Portugal', l: 'T', c: 'f-red', dep: '09:40', arr: '12:15', info: 'Direct, 2h 35m', p: 97, pick: true },
    { a: 'Northwind', l: 'N', c: 'f-violet', dep: '07:05', arr: '09:45', info: 'Direct, 2h 40m', p: 118 },
    { a: 'Albion Air', l: 'A', c: 'f-ink', dep: '08:20', arr: '10:55', info: 'Direct, 2h 35m', p: 148 },
    { a: 'Northwind', l: 'N', c: 'f-violet', dep: '12:30', arr: '15:10', info: 'Direct, 2h 40m', p: 104 },
    { a: 'Albion Air', l: 'A', c: 'f-ink', dep: '18:45', arr: '21:20', info: 'Direct, 2h 35m', p: 132 }
  ];
  var HISTORY = [
    { t: 'Tram 28, stop by stop', host: 'lisboa.guide' },
    { t: 'Alfama walking route', host: 'lisboa.guide' },
    { t: 'Lisbon weather, 10 days', host: 'tempo.pt' },
    { t: 'Miradouro da Senhora do Monte', host: 'maps.place' },
    { t: 'Pastelarias in Graça', host: 'notes.one' }
  ];

  function baseTabs() {
    return [
      { id: 'mail', zone: 'pin', title: 'Inbox', host: 'inbox.mail', path: '/', l: 'M', c: 'f-sky', page: 'mail', blocked: 3 },
      { id: 'cal', zone: 'pin', title: 'Calendar', host: 'week.cal', path: '/2026/w47', l: '20', c: 'f-paper', page: 'cal', blocked: 0 },
      { id: 'music', zone: 'pin', title: 'Fado radio', host: 'radio.fm', path: '/fado', l: '♪', c: 'f-pink', page: 'music', blocked: 6 },
      { id: 'maps', zone: 'pin', title: 'Graça, Lisbon', host: 'maps.place', path: '/@38.716,-9.131', l: '◆', c: 'f-green', page: 'maps', blocked: 2 },
      { id: 'jornal', zone: 'today', title: 'Os elétricos voltam a subir à Graça', host: 'jornaldotejo.pt', path: '/lisboa/eletricos-graca', l: 'J', c: 'f-ink', page: 'article', blocked: 12 },
      { id: 'notes', zone: 'today', title: 'Weekend plan', host: 'notes.one', path: '/lisbon-weekend', l: 'N', c: 'f-amber', page: 'notes', blocked: 0 },
      { id: 'orbit', zone: 'today', title: 'Orbit, front page', host: 'orbit.news', path: '/', l: 'O', c: 'f-violet', page: 'orbit', blocked: 4 },
      { id: 'recipe', zone: 'today', title: 'Pastéis de nata, the slow way', host: 'panela.pt', path: '/receitas/pasteis-de-nata', l: 'P', c: 'f-amber', page: 'recipe', blocked: 31 },
      { id: 'budget', zone: 'kept', title: 'Trip budget', host: 'grid.so', path: '/s/lisbon', l: 'B', c: 'f-green', page: 'sheet', blocked: 0, asleep: true },
      { id: 'lesson', zone: 'kept', title: 'Portuguese in ten minutes a day', host: 'falar.app', path: '/lesson/12', l: 'F', c: 'f-teal', page: 'lesson', blocked: 1, asleep: true }
    ];
  }

  var S;
  function freshState() {
    return {
      tabs: baseTabs(), active: 'jornal', prev: 'notes', group: null, cleared: null,
      tr: 'off', trOne: {}, chat: true,
      sky: { filter: false, read: -1, out: false, pick: false },
      tap: { name: '', email: '', card: '', typing: '', paid: false },
      notesDone: false, mailNew: false
    };
  }

  /* ------------------------------------------------------------------
     The live window
     ------------------------------------------------------------------ */
  var kz = $('#kz');
  var stage = $('#stage');
  var hasDemo = !!kz;
  var entering = {};

  function tabById(id) { for (var i = 0; i < S.tabs.length; i++) if (S.tabs[i].id === id) return S.tabs[i]; return null; }
  function stateClass(tb) { return tb.state ? ' is-' + tb.state : ''; }
  function favHTML(tb, cls) {
    return '<span class="fav ' + tb.c + stateClass(tb) + (cls ? ' ' + cls : '') + '">' + esc(tb.l) + '</span>';
  }
  function tabHTML(tb) {
    var cls = 'tab' + (tb.id === S.active ? ' is-cur' : '') + (tb.asleep ? ' is-asleep' : '') + (entering[tb.id] ? ' enter' : '');
    return '<button type="button" class="' + cls + '" data-tab="' + tb.id + '" aria-current="' + (tb.id === S.active) + '">' +
      favHTML(tb) + '<span class="tab-t">' + esc(tb.title) + '</span>' +
      (tb.asleep ? '<svg class="tab-moon" aria-hidden="true"><use href="#i-moon"/></svg>' : '') +
      '<span class="tab-x" data-close="' + tb.id + '" aria-hidden="true"><svg><use href="#i-x"/></svg></span></button>';
  }
  function renderSide() {
    var pins = S.tabs.filter(function (x) { return x.zone === 'pin'; });
    $('#kz-pins').innerHTML = pins.map(function (tb) {
      return '<button type="button" class="kz-pin' + (tb.id === S.active ? ' is-cur' : '') + '" data-tab="' + tb.id + '" aria-label="' + esc(tb.title) + '">' + favHTML(tb, 'lg') + '</button>';
    }).join('');
    var html = '';
    if (S.group) {
      var gt = S.tabs.filter(function (x) { return x.group === S.group.id; });
      if (gt.length) {
        html += '<div class="kz-group' + (S.group.leaving ? ' leave' : '') + '" role="group" aria-label="' + esc(S.group.name) + '"><div class="kz-ghead"><svg><use href="#i-spark"/></svg>' + esc(S.group.name) + '</div>' +
          gt.map(tabHTML).join('') + '</div>';
      }
    }
    html += S.tabs.filter(function (x) { return x.zone === 'today' && !x.group; }).map(tabHTML).join('');
    html += '<div class="kz-div" id="kz-div"><span class="kz-div-line"></span><button type="button" id="kz-clear">' + esc(t('clear')) + '</button></div>';
    html += S.tabs.filter(function (x) { return x.zone === 'kept'; }).map(tabHTML).join('');
    $('#kz-list').innerHTML = html;
    entering = {};
  }

  /* Pages */
  var PAGES = {
    article: function () {
      var tl = lang === 'zh' ? 'zh' : 'en';
      var on = S.tr !== 'off';
      var h = '<div class="art' + (S.tr === 'only' ? ' only' : '') + '">' +
        '<div class="art-mast"><b>Jornal do Tejo</b><span>Lisboa, 22 de outubro de 2026</span></div>' +
        '<h1 class="para">' + ART.h.pt + '</h1>' + (on ? '<span class="tr-line" style="font-size:20px;font-weight:600">' + ART.h[tl] + '</span>' : '') +
        '<p class="dek">Depois de oito meses de obras, a linha 28 regressa ao bairro com carris novos.</p>' +
        '<p class="by">Por Inês Duarte</p><div class="art-img" aria-hidden="true"></div>';
      ART.p.forEach(function (p, i) {
        h += '<p class="para" data-para="' + i + '">' + p.pt + '</p>';
        if (on || S.trOne[i]) h += '<span class="tr-line">' + p[tl] + '</span>';
      });
      return h + '</div>';
    },
    notes: function () {
      var items = [
        ['Flight on Friday morning, under €120', S.notesDone],
        ['Stay in Graça or Alfama', false],
        ['Tram 28 early, before the queue', false],
        ['Pastéis de nata in Belém', true],
        ['Saturday night: fado, book ahead', false]
      ];
      return '<div class="note"><h1>Lisbon, 20–22 Nov</h1><p class="meta">Edited today, 08:12</p><ul>' +
        items.map(function (it) { return '<li class="' + (it[1] ? 'done' : '') + '"><span class="cb' + (it[1] ? ' on' : '') + '">' + (it[1] ? '<svg><use href="#i-check"/></svg>' : '') + '</span><span>' + it[0] + '</span></li>'; }).join('') +
        '</ul></div>';
    },
    orbit: function () {
      var rows = [
        ['A browser that tidies its own tabs', '412 points, 188 comments'],
        ['Lisbon’s trams are back on the hill', '96 points, 41 comments'],
        ['How we cut cold start to 180 ms', '233 points, 74 comments'],
        ['The quiet return of the bookmark', '61 points, 28 comments'],
        ['Show Orbit: a pinwheel made of three curves', '148 points, 39 comments'],
        ['Reading on paper, reading on glass', '88 points, 52 comments'],
        ['Why every map app gets ferries wrong', '57 points, 23 comments'],
        ['A field guide to grain and noise', '120 points, 31 comments']
      ];
      return '<div class="orb"><div class="orb-head"><b><span class="fav f-violet">O</span>Orbit</b><span>new</span><span>past</span><span>ask</span></div><ol>' +
        rows.map(function (r) { return '<li>' + r[0] + '<small>' + r[1] + '</small></li>'; }).join('') + '</ol></div>';
    },
    mail: function () {
      var rows = [
        ['TAP Air Portugal', 'Your booking TP1351, London to Lisbon', 'now', true],
        ['Inês Duarte', 'Re: the tram piece, <em>photos attached</em>', '09:14'],
        ['Falar', 'Lesson 12 is ready: ordering coffee', '08:30'],
        ['Grid', 'Trip budget was edited', 'Wed'],
        ['Radio.fm', 'Your week in fado', 'Tue'],
        ['Mara', 'Saturday dinner?', 'Mon']
      ].filter(function (r) { return !r[3] || S.mailNew; });
      return '<div class="mail"><div class="mail-side"><div class="on">Inbox <span>' + (S.mailNew ? 4 : 3) + '</span></div><div>Starred</div><div>Sent</div><div>Drafts</div></div><div class="mail-list">' +
        rows.map(function (r) { return '<div class="mail-row' + (r[3] ? ' new' : '') + '"><b>' + r[0] + '</b><span>' + r[1] + '</span><i>' + r[2] + '</i></div>'; }).join('') + '</div></div>';
    },
    cal: function () {
      var d = ['', 'Mon 16', 'Tue 17', 'Wed 18', 'Thu 19', 'Fri 20'], h = '';
      d.forEach(function (x) { h += '<div class="dh">' + x + '</div>'; });
      for (var r = 0; r < 9; r++) {
        h += '<div>' + (8 + r) + ':00</div>';
        for (var c = 1; c <= 5; c++) {
          var ev = '';
          if (r === 1 && c === 5) ev = '<span class="ev a">Flight to Lisbon 09:40</span>';
          if (r === 2 && c === 2) ev = '<span class="ev b">Design review</span>';
          if (r === 5 && c === 3) ev = '<span class="ev c">Portuguese lesson</span>';
          h += '<div>' + ev + '</div>';
        }
      }
      return '<div class="calp"><h2>November 2026</h2><div class="cal-grid">' + h + '</div></div>';
    },
    music: function () { return '<div class="mus"><div class="mus-card"><div class="mus-art"></div><b>Fado radio</b><p>Live from Alfama</p><div class="mus-bar"><i></i></div></div></div>'; },
    maps: function () {
      return '<div style="position:absolute;inset:0;background:#EEF0E6">' +
        '<div style="position:absolute;left:-10%;right:-10%;bottom:-8%;height:38%;background:#B9D7EE;transform:rotate(-6deg)"></div>' +
        '<div style="position:absolute;left:8%;top:0;bottom:0;width:10px;background:#fff;transform:rotate(18deg)"></div>' +
        '<div style="position:absolute;left:0;right:0;top:32%;height:9px;background:#fff;transform:rotate(-8deg)"></div>' +
        '<div style="position:absolute;left:46%;top:-5%;bottom:30%;width:8px;background:#FBE7A8;transform:rotate(-24deg)"></div>' +
        '<div style="position:absolute;left:30%;top:18%;width:120px;height:80px;border-radius:40%;background:#D7E8CF"></div>' +
        '<div style="position:absolute;left:58%;top:36%;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center">' +
        '<span style="background:#fff;border-radius:8px;padding:5px 9px;font-size:12px;font-weight:650;box-shadow:0 2px 8px rgb(0 0 0/.15)">Largo da Graça</span>' +
        '<span style="width:14px;height:14px;border-radius:50%;background:#E5483E;border:3px solid #fff;margin-top:4px;box-shadow:0 2px 6px rgb(0 0 0/.25)"></span></div></div>';
    },
    recipe: function () {
      return '<div class="rec"><h1>Pastéis de nata, the slow way</h1><p class="meta">12 tarts, 2 hours</p><div class="rec-img" aria-hidden="true"></div><ul>' +
        ['250 g puff pastry, rolled tight', '3 egg yolks and 1 whole egg', '250 ml whole milk', '200 g sugar, 120 ml water', '1 lemon peel, 1 cinnamon stick'].map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>';
    },
    sheet: function () {
      var r = [['Flight', '€97'], ['Stay, 2 nights', '€180'], ['Food', '€90'], ['Trams and taxis', '€25'], ['Total', '€392']];
      return '<div class="sheet"><table><tr><th></th><th>A</th><th>B</th></tr>' + r.map(function (x, i) { return '<tr><th>' + (i + 1) + '</th><td>' + x[0] + '</td><td>' + x[1] + '</td></tr>'; }).join('') + '</table></div>';
    },
    lesson: function () {
      return '<div class="note"><h1>Lesson 12: Ordering coffee</h1><p class="meta">10 minutes</p><ul>' +
        [['Um café, por favor.', 'An espresso, please.'], ['Uma meia de leite.', 'A milky coffee.'], ['Um galão, se faz favor.', 'A tall milky coffee, please.'], ['Quanto é?', 'How much is it?']]
          .map(function (x) { return '<li><span class="cb"></span><span><b>' + x[0] + '</b><br><small style="color:#8a90a0">' + x[1] + '</small></span></li>'; }).join('') + '</ul></div>';
    },
    generic: function (tb) {
      return '<div class="rec"><h1 style="font-size:24px">' + esc(tb.title) + '</h1><p class="meta">' + esc(tb.host) + '</p>' +
        '<div style="display:flex;flex-direction:column;gap:12px;margin-top:20px"><i class="sk w90"></i><i class="sk w80"></i><i class="sk w90"></i><i class="sk w60"></i><i class="sk w70"></i></div></div>';
    },
    sky: function () {
      var k = S.sky;
      return '<div class="sky"><div class="sky-head"><b>Skyfare</b><div class="sky-q"><span><em>From</em>London, all airports</span><span><em>To</em>Lisbon</span><span><em>Depart</em>Fri 20 Nov</span><span><em>Travellers</em>1 adult</span></div></div>' +
        '<div class="sky-filters"><span>Morning</span><span>Direct</span>' + (k.filter ? '<span class="on">Under €120</span>' : '<span>Price</span>') + '</div>' +
        '<div class="sky-rows">' + FLIGHTS.map(function (f, i) {
          var cls = 'fl' + (k.read === i ? ' is-read' : '') + (k.out && f.p > 120 ? ' is-out' : '') + (k.pick && f.pick ? ' is-pick' : '');
          return '<div class="' + cls + '" data-fl="' + i + '"><span class="fav ' + f.c + '">' + f.l + '</span><div><b>' + f.dep + ' → ' + f.arr + '</b><small>' + f.a + '</small></div><small>' + f.info + '</small><span class="pr-v">€' + f.p + '</span></div>';
        }).join('') + '</div></div>';
    },
    tap: function () {
      var k = S.tap;
      if (k.paid) {
        return '<div class="co"><div class="co-head"><span class="fav lg f-red">T</span><b>TAP Air Portugal</b></div><div class="co-ok"><div class="big"><svg><use href="#i-check"/></svg></div><b style="font-size:18px">Booking confirmed</b><p style="color:#6b7280;margin-top:6px">TP1351, Fri 20 Nov, 09:40 London Heathrow to Lisbon</p><p style="color:#6b7280;margin-top:4px">Reference QX7M2P</p></div></div>';
      }
      function f(lbl, key) { return '<div class="co-f"><label>' + lbl + '</label><div class="' + (k.typing === key ? 'is-typing' : '') + '" data-f="' + key + '">' + esc(k[key]) + '</div></div>'; }
      return '<div class="co"><div class="co-head"><span class="fav lg f-red">T</span><b>TAP Air Portugal</b></div>' +
        '<div class="co-trip"><div><b>LHR 09:40 → LIS 12:15</b><small>Fri 20 Nov, TP1351, Economy Light</small></div><strong>€97</strong></div>' +
        f('Passenger', 'name') + f('Email', 'email') + f('Card', 'card') +
        '<div class="co-pay">Pay €97</div></div>';
    }
  };

  function renderPage(anim) {
    var tb = tabById(S.active);
    if (!tb) return;
    var view = $('#kz-view');
    var fn = PAGES[tb.page] || PAGES.generic;
    view.innerHTML = '<div class="pg pg-' + tb.page + '"' + (anim === false ? ' style="animation:none"' : '') + '>' + fn(tb) + '</div>';
    $('#kz-host').textContent = tb.host;
    $('#kz-path').textContent = tb.path;
    $('#kz-blocked').textContent = tb.blocked;
    $('#kz-shield').style.visibility = tb.blocked ? 'visible' : 'hidden';
    var trb = $('#kz-tr');
    trb.style.display = tb.page === 'article' ? '' : 'none';
    trb.setAttribute('aria-pressed', String(S.tr !== 'off'));
    if (tb.page !== 'article') hideTrPop();
    var ctx = $('#kz-ctx');
    ctx.innerHTML = favHTML({ l: tb.l, c: tb.c }) + '<span>' + esc(tb.title) + '</span>';
  }
  function refreshPage() { renderPage(false); }

  function setActive(id, opts) {
    if (!tabById(id)) return;
    if (id !== S.active) { S.prev = S.active; }
    S.active = id;
    var tb = tabById(id);
    if (tb.asleep) tb.asleep = false;
    renderSide();
    renderPage(!(opts && opts.quiet));
  }

  function render() { renderSide(); renderPage(); renderChatEmpty(); }

  /* Chat */
  var msgs = $('#kz-msgs');
  function renderChatEmpty() {
    msgs.innerHTML = '<div class="empty"><div class="empty-hi"><img src="icon.svg" alt=""><p>' + esc(t('emptyHi')) + '</p><span>' + esc(t('emptySub')) + '</span></div>' +
      '<div class="sugs">' +
      '<button type="button" class="sug" data-go="agent">' + esc(t('sug1')) + '</button>' +
      '<button type="button" class="sug" data-go="translate">' + esc(t('sug2')) + '</button>' +
      '<button type="button" class="sug" data-go="tidy">' + esc(t('sug3')) + '</button></div></div>';
  }
  function clearEmpty() { var e = $('.empty', msgs); if (e) e.remove(); }
  function addMsg(cls, html) {
    clearEmpty();
    var d = document.createElement('div');
    d.className = 'm ' + cls;
    d.innerHTML = html;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }
  var stepsEl = null;
  function addStep(text, kind) {
    if (!stepsEl) stepsEl = addMsg('steps', '');
    var last = $('.step.is-now, .step.is-wait', stepsEl);
    if (last) { last.className = 'step'; last.firstChild.outerHTML = '<svg class="ck"><use href="#i-check"/></svg>'; }
    var s = document.createElement('div');
    s.className = 'step ' + (kind === 'wait' ? 'is-wait' : 'is-now');
    s.innerHTML = (kind === 'wait' ? '<span class="wdot"></span>' : '<span class="spin"></span>') + '<span>' + esc(text) + '</span>';
    stepsEl.appendChild(s);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function endSteps() {
    if (!stepsEl) return;
    var last = $('.step.is-now, .step.is-wait', stepsEl);
    if (last) { last.className = 'step'; last.firstChild.outerHTML = '<svg class="ck"><use href="#i-check"/></svg>'; }
    stepsEl = null;
  }

  /* Dock */
  var dock = $('#kz-dock');
  var dockMode = null;
  function showDock(word) {
    dockMode = 'work';
    dock.className = 'kz-dock';
    dock.hidden = false;
    dock.innerHTML = '<span class="halo-dot"></span><span class="dock-words"><span class="dock-word">' + esc(word) + '</span></span><span class="dock-sep"></span>' +
      '<button type="button" class="dbtn" data-act="stop"><svg><use href="#i-stop"/></svg>' + esc(t('stop')) + '</button>' +
      '<button type="button" class="dbtn" data-act="take">' + esc(t('takeOver')) + '<kbd>⌘.</kbd></button>';
  }
  function setDockWord(word) {
    if (dockMode !== 'work') return;
    var box = $('.dock-words', dock);
    if (!box) return;
    var old = $('.dock-word:not(.out)', box);
    if (old && old.textContent === word) return;
    if (old) { old.classList.remove('in'); old.classList.add('out'); setTimeout(function () { old.remove(); }, 320); }
    var n = document.createElement('span');
    n.className = 'dock-word in';
    n.textContent = word;
    box.appendChild(n);
  }
  function showDrive() {
    dockMode = 'drive';
    dock.className = 'kz-dock';
    dock.hidden = false;
    dock.innerHTML = '<span class="halo-dot is-paused"></span><span class="dock-words"><span class="dock-word in">' + esc(t('driving')) + '</span></span><span class="dock-sep"></span>' +
      '<button type="button" class="dbtn glass" data-act="back">' + esc(t('handBack')) + '<kbd>⇧⌘↩</kbd></button>';
  }
  var permResolve = null;
  function showPerm() {
    dockMode = 'perm';
    dock.className = 'kz-dock is-perm';
    dock.hidden = false;
    dock.innerHTML = '<div class="perm" role="alertdialog" aria-label="' + esc(t('permTitle')) + '"><div class="perm-top"><span class="perm-ico" aria-hidden="true"><svg><use href="#i-card"/></svg></span><div><p class="perm-title">' + esc(t('permTitle')) + '</p><p class="perm-sub">' + esc(t('permSub')) + '</p></div></div>' +
      '<div class="perm-btns"><button type="button" class="kbtn fill" data-act="no">' + esc(t('notNow')) + '<kbd>Esc</kbd></button><button type="button" class="kbtn glass" data-act="yes">' + esc(t('pay')) + '<kbd>↩</kbd></button></div></div>';
    return new Promise(function (res) { permResolve = res; });
  }
  function hideDock() { dock.hidden = true; dock.innerHTML = ''; dockMode = null; }
  function answerPerm(v) { if (permResolve) { var r = permResolve; permResolve = null; r(v); } }

  /* Toast */
  var toastTimer;
  function toast(html, undoFn) {
    var el = $('#kz-toast');
    el.innerHTML = '<span>' + html + '</span>' + (undoFn ? '<button type="button" data-act="undo">' + esc(t('undo')) + '</button>' : '');
    el.hidden = false;
    el._undo = undoFn || null;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; el._undo = null; }, undoFn ? 6000 : 2400);
  }
  function hideToast() { var el = $('#kz-toast'); el.hidden = true; el._undo = null; }

  /* Translate */
  function hideTrPop() { var p = $('#kz-trpop'); if (p) p.hidden = true; }
  function showTrPop() {
    var p = $('#kz-trpop');
    p.innerHTML = '<p>' + t('trFrom') + '</p><div class="seg" role="radiogroup" aria-label="Translation">' +
      ['off', 'bi', 'only'].map(function (m) { return '<button type="button" role="radio" data-trmode="' + m + '" aria-checked="' + (S.tr === m) + '">' + esc(t(m === 'off' ? 'trOff' : m === 'bi' ? 'trBi' : 'trOnly')) + '</button>'; }).join('') + '</div>';
    p.hidden = false;
  }
  function setTr(mode) {
    S.tr = mode;
    if (mode === 'off') S.trOne = {};
    refreshPage();
    if (!$('#kz-trpop').hidden) showTrPop();
  }
  function toggleTr() {
    var tb = tabById(S.active);
    if (!tb || tb.page !== 'article') return;
    if (S.tr === 'off') { setTr('bi'); showTrPop(); } else { setTr('off'); hideTrPop(); }
  }

  /* Clear divider */
  function clearToday() {
    var today = S.tabs.filter(function (x) { return x.zone === 'today'; });
    if (!today.length) return;
    $$('#kz-list .tab, #kz-list .kz-group').forEach(function (el) {
      var id = el.dataset.tab;
      if (el.classList.contains('kz-group') || (id && tabById(id) && tabById(id).zone === 'today')) el.classList.add('leave');
    });
    var div = $('#kz-div'); if (div) div.classList.add('is-flash');
    var stash = { tabs: today, group: S.group, active: S.active };
    setTimeout(function () {
      S.tabs = S.tabs.filter(function (x) { return x.zone !== 'today'; });
      S.group = null;
      S.cleared = stash;
      if (!tabById(S.active)) { S.active = 'budget'; tabById('budget').asleep = false; }
      renderSide(); renderPage();
      toast(esc(t('closedN', { n: today.length })), undoClear);
    }, 260);
  }
  function undoClear() {
    if (!S.cleared) return;
    var c = S.cleared; S.cleared = null;
    c.tabs.forEach(function (x) { entering[x.id] = true; });
    var kept = S.tabs.filter(function (x) { return x.zone !== 'today'; });
    var pins = kept.filter(function (x) { return x.zone === 'pin'; });
    var rest = kept.filter(function (x) { return x.zone !== 'pin'; });
    S.tabs = pins.concat(c.tabs, rest);
    S.group = c.group;
    S.active = c.active;
    renderSide(); renderPage();
    hideToast();
  }

  /* Close a tab (hover ×) */
  function closeTab(id) {
    var tb = tabById(id);
    if (!tb || tb.zone === 'pin') return;
    var el = $('#kz-list [data-tab="' + id + '"]');
    if (el) el.classList.add('leave');
    setTimeout(function () {
      var idx = S.tabs.indexOf(tb);
      S.tabs.splice(idx, 1);
      if (S.group && !S.tabs.some(function (x) { return x.group === S.group.id; })) S.group = null;
      if (S.active === id) {
        var list = S.tabs.filter(function (x) { return x.zone !== 'pin'; });
        S.active = (list[0] || S.tabs[0]).id;
      }
      renderSide(); renderPage();
    }, 220);
  }

  /* ------------------------------------------------------------------
     Palette (shared by the window and the section demo)
     ------------------------------------------------------------------ */
  function calc(src) {
    var s = src.replace(/×/g, '*').replace(/÷/g, '/').replace(/,/g, '.').replace(/\s+/g, '');
    if (!/^[\d.+\-*/()%^]+$/.test(s) || !/[+\-*/%^]/.test(s.replace(/^-/, '')) || !/\d/.test(s)) return null;
    var i = 0;
    function peek() { return s[i]; }
    function num() {
      var m = /^\d*\.?\d+(?:e[+-]?\d+)?/.exec(s.slice(i)) || /^\d+\.?/.exec(s.slice(i));
      if (!m) throw 0;
      i += m[0].length; return parseFloat(m[0]);
    }
    function atom() {
      if (peek() === '(') { i++; var v = expr(); if (peek() !== ')') throw 0; i++; return v; }
      if (peek() === '-') { i++; return -atom(); }
      if (peek() === '+') { i++; return atom(); }
      var n = num();
      if (peek() === '%') { i++; n = n / 100; }
      return n;
    }
    function pow() { var b = atom(); if (peek() === '^') { i++; return Math.pow(b, pow()); } return b; }
    function term() { var v = pow(); while (peek() === '*' || peek() === '/') { var o = s[i++]; var r = pow(); v = o === '*' ? v * r : v / r; } return v; }
    function expr() { var v = term(); while (peek() === '+' || peek() === '-') { var o = s[i++]; var r = term(); v = o === '+' ? v + r : v - r; } return v; }
    try { var v = expr(); if (i !== s.length || !isFinite(v)) return null; return Math.round(v * 1e10) / 1e10; } catch (e) { return null; }
  }
  function hl(text, q) {
    var i = text.toLowerCase().indexOf(q.toLowerCase());
    if (!q || i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  }
  var ICON_ROW = { tab: '', hist: '#i-clock', search: '#i-search', calc: '#i-plus', ask: '#i-spark' };

  function makePalette(opts) {
    var input = opts.input, list = opts.list, items = [], sel = 0;
    input.placeholder = t('palPh');
    function build() {
      var q = input.value.trim();
      var tabs = opts.tabs();
      var out = [];
      if (!q) {
        var prev = opts.prev && opts.prev();
        var ordered = tabs.slice().sort(function (a, b) { return (b.id === prev) - (a.id === prev); });
        ordered.forEach(function (tb) { out.push({ kind: 'tab', tb: tb, label: tb.title, sub: tb.host, act: 'aSwitch' }); });
        out = out.slice(0, 7);
      } else {
        var v = calc(q);
        if (v !== null) out.push({ kind: 'calc', label: '= ' + v.toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', { maximumFractionDigits: 10 }), value: v, act: 'aCopy' });
        var ql = q.toLowerCase();
        tabs.forEach(function (tb) { if ((tb.title + ' ' + tb.host).toLowerCase().indexOf(ql) >= 0) out.push({ kind: 'tab', tb: tb, label: tb.title, sub: tb.host, act: 'aSwitch' }); });
        HISTORY.forEach(function (h) { if ((h.t + ' ' + h.host).toLowerCase().indexOf(ql) >= 0) out.push({ kind: 'hist', h: h, label: h.t, sub: h.host, act: 'aOpen' }); });
        out = out.slice(0, 5);
        if (v === null) out.push({ kind: 'search', label: t('searchFor', { q: q }), act: 'aSearch', q: q });
        out.push({ kind: 'ask', label: t('askFor', { q: q }), act: 'aAsk', q: q, key: '⌘↩' });
      }
      items = out; sel = 0; paint();
    }
    function paint() {
      var q = input.value.trim();
      list.innerHTML = items.map(function (it, i) {
        var ic = it.kind === 'tab' ? favHTML(it.tb) : '<svg><use href="' + ICON_ROW[it.kind] + '"/></svg>';
        var lbl = it.kind === 'tab' || it.kind === 'hist' ? hl(it.label, q) + '<small>' + esc(it.sub) + '</small>' : esc(it.label);
        return '<li class="pr' + (i === sel ? ' is-sel' : '') + (it.kind === 'calc' ? ' pr-calc' : '') + '" role="option" aria-selected="' + (i === sel) + '" data-i="' + i + '">' +
          '<span class="pr-ic">' + ic + '</span><span class="pr-t">' + lbl + '</span><span class="pr-a">' + esc(t(it.act)) + '<kbd>' + (it.key || '↩') + '</kbd></span></li>';
      }).join('');
    }
    function move(d) { if (!items.length) return; sel = (sel + d + items.length) % items.length; paint(); }
    function act(i, meta) {
      var it = meta ? items.filter(function (x) { return x.kind === 'ask'; })[0] || { kind: 'ask', q: input.value.trim() } : items[i == null ? sel : i];
      if (!it) return;
      opts.onAct(it);
    }
    input.addEventListener('input', build);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); act(null, e.metaKey || e.ctrlKey); }
      else if (e.key === 'Escape' && opts.onEsc) { e.preventDefault(); opts.onEsc(); }
      e.stopPropagation();
    });
    list.addEventListener('mousemove', function (e) { var li = e.target.closest('.pr'); if (li && +li.dataset.i !== sel) { sel = +li.dataset.i; paint(); } });
    list.addEventListener('click', function (e) { var li = e.target.closest('.pr'); if (li) act(+li.dataset.i); });
    return { build: build, move: move, act: act, set: function (v) { input.value = v; build(); }, input: input, get sel() { return sel; } };
  }

  /* ------------------------------------------------------------------
     Tour runner
     ------------------------------------------------------------------ */
  var runId = 0, paused = false, jump = null, autoplay = !reduced, userTouched = false, current = null, follow = true;
  var CANCEL = { cancel: true };
  var K = reduced ? 0.6 : 1;

  function sleep(ms) {
    var id = runId;
    return new Promise(function (res, rej) {
      if (jump) { if (id !== runId) rej(CANCEL); else res(); return; }
      var left = ms * K, last = Date.now();
      (function tick() {
        if (id !== runId) return rej(CANCEL);
        var now = Date.now();
        if (!paused) left -= now - last;
        last = now;
        if (left <= 0) return res();
        setTimeout(tick, Math.min(left, 100));
      })();
    });
  }
  function guard(id) { if (id !== runId) throw CANCEL; }
  function mark(name) {
    if (jump && jump === name) { jump = null; setProgress(1); return new Promise(function () {}); }
    return Promise.resolve();
  }
  function setProgress(p) { if (current) { var b = $('.chap[data-chapter="' + current + '"] .chap-bar'); if (b) b.style.setProperty('--p', Math.max(0, Math.min(1, p))); } }
  function caption(html) { var c = $('#caption'); if (c) c.innerHTML = html; }
  function view(id) { if (follow) setActive(id); }

  function resetMock() {
    S = freshState();
    paused = false; follow = true; permResolve = null; stepsEl = null;
    kz.classList.remove('is-driving', 'no-chat');
    $('#kz-agentbtn').setAttribute('aria-pressed', 'true');
    hideDock(); hideToast(); hideTrPop(); closePal(true);
    render();
  }

  async function typeInto(el, text, per) {
    var id = runId;
    for (var i = 1; i <= text.length; i++) {
      if (jump) { el.value = text; break; }
      el.value = text.slice(0, i);
      el.dispatchEvent(new Event('input'));
      await sleep(per || 45); guard(id);
    }
    el.dispatchEvent(new Event('input'));
  }
  async function typeField(key, text) {
    var id = runId;
    S.tap.typing = key;
    for (var i = 1; i <= text.length; i++) {
      S.tap[key] = text.slice(0, i);
      if (jump) { S.tap[key] = text; break; }
      if (tabById(S.active) && tabById(S.active).id === 'tap') { var f = $('[data-f="' + key + '"]', kz); if (f) { f.textContent = S.tap[key]; f.className = 'is-typing'; } }
      await sleep(38); guard(id);
    }
    S.tap.typing = '';
    if (S.active === 'tap') refreshPage();
  }

  var TOURS = {};

  TOURS.agent = async function () {
    var id = runId;
    var input = $('#kz-input');
    setActive('notes');
    caption(t('cap_agent1'));
    await sleep(700); guard(id);
    await typeInto(input, t('userFlight'), 22); guard(id);
    await sleep(300);
    input.value = '';
    addMsg('m-user', esc(t('userFlight')));
    setProgress(.08);
    await sleep(700); guard(id);
    addMsg('m-ai', '<p>' + esc(t('aiStart')) + '</p>');
    await sleep(500); guard(id);

    // A group named for the task, with a background tab.
    S.group = { id: 'g1', name: t('groupName') };
    S.tabs.splice(4, 0, { id: 'sky', zone: 'today', group: 'g1', title: 'London to Lisbon, Fri 20 Nov', host: 'skyfare.travel', path: '/search?from=LON&to=LIS&date=2026-11-20', l: 'S', c: 'f-sky', page: 'sky', blocked: 9, state: 'working' });
    entering.sky = true;
    renderSide();
    addStep(t('s1'));
    await sleep(1100); guard(id);

    view('sky');
    showDock(t('s1') + '…');
    caption(t('cap_agent2'));
    await sleep(500); guard(id);
    addStep(t('s2')); setDockWord(t('s2') + '…'); setProgress(.22);
    await sleep(1300); guard(id);
    await mark('dock');
    addStep(t('s3')); setDockWord(t('s3') + '…'); setProgress(.32);
    for (var r = 0; r < FLIGHTS.length; r++) {
      S.sky.read = r;
      if (S.active === 'sky') $$('.fl', kz).forEach(function (el, i) { el.classList.toggle('is-read', i === r); });
      await sleep(330); guard(id);
    }
    S.sky.read = -1;
    addStep(t('s4')); setDockWord(t('s4') + '…'); setProgress(.42);
    S.sky.filter = true; S.sky.out = true;
    if (S.active === 'sky') refreshPage();
    await sleep(1200); guard(id);
    addStep(t('s5')); setDockWord(t('s5') + '…'); setProgress(.5);
    S.sky.pick = true;
    if (S.active === 'sky') refreshPage();
    await sleep(1300); guard(id);

    addStep(t('s6')); setDockWord(t('s6') + '…'); setProgress(.58);
    tabById('sky').state = null;
    S.tabs.splice(S.tabs.indexOf(tabById('sky')) + 1, 0, { id: 'tap', zone: 'today', group: 'g1', title: 'Review and pay', host: 'flytap.com', path: '/booking/checkout', l: 'T', c: 'f-red', page: 'tap', blocked: 5, state: 'working' });
    entering.tap = true;
    renderSide();
    await sleep(900); guard(id);
    view('tap');
    showDock(t('s7') + '…');
    addStep(t('s7')); setProgress(.66);
    await typeField('name', 'Jordan Lee'); guard(id);
    await typeField('email', 'jordan@hey.example'); guard(id);
    await typeField('card', 'Visa •••• 4242'); guard(id);
    await sleep(400); guard(id);

    // Needs you.
    tabById('tap').state = 'needs';
    renderSide();
    addStep(t('s8'), 'wait'); setProgress(.78);
    caption(t('cap_agent3'));
    var p = showPerm();
    await mark('perm');
    var timer = new Promise(function (res) { var tid = runId; sleep(7000).then(function () { if (tid === runId) res('yes'); }, function () {}); });
    var ans = await Promise.race([p, timer]); guard(id);
    permResolve = null;
    hideDock();

    if (ans === 'no') {
      tabById('tap').state = null; renderSide();
      endSteps();
      addMsg('m-ai', '<p>' + esc(t('notNowReply')) + '</p>' + groupActs());
      caption(t('cap_agent4'));
      setProgress(1);
      return;
    }
    tabById('tap').state = 'working'; renderSide();
    addStep(t('s9')); showDock(t('s9') + '…'); setProgress(.88);
    await sleep(1300); guard(id);
    hideDock();
    S.tap.paid = true; S.notesDone = true; S.mailNew = true;
    tabById('tap').state = 'done'; tabById('sky').state = 'done';
    renderSide();
    if (S.active === 'tap') refreshPage();
    endSteps();
    addMsg('m-ai', '<p>' + esc(t('booked')) + '</p>' + groupActs());
    caption(t('cap_agent4'));
    setProgress(1);
    await mark('done');
  };
  function groupActs() {
    var n = S.tabs.filter(function (x) { return S.group && x.group === S.group.id; }).length;
    return '<div class="m-acts"><button type="button" class="kbtn glass" data-act="gclose">' + esc(t('closeN', { n: n })) + '<kbd>⌥⌘W</kbd></button><button type="button" class="kbtn fill" data-act="gkeep">' + esc(t('keep')) + '<kbd>⌥⌘K</kbd></button></div>';
  }
  function groupClose() {
    if (!S.group) return;
    var n = S.tabs.filter(function (x) { return x.group === S.group.id; }).length;
    S.group.leaving = true; renderSide();
    $$('.m-acts', msgs).forEach(function (a) { a.remove(); });
    setTimeout(function () {
      S.tabs = S.tabs.filter(function (x) { return !S.group || x.group !== S.group.id; });
      S.group = null;
      if (!tabById(S.active)) S.active = 'notes';
      renderSide(); renderPage();
      addMsg('m-note', '<svg><use href="#i-check"/></svg>' + esc(t('closedGroup', { n: n })));
    }, 260);
  }
  function groupKeep() {
    $$('.m-acts', msgs).forEach(function (a) { a.remove(); });
    S.tabs.forEach(function (x) { if (x.state === 'done') x.state = null; });
    renderSide();
    addMsg('m-note', '<svg><use href="#i-check"/></svg>' + esc(t('keptGroup')));
  }
  function takeOver() {
    if (dockMode !== 'work') return;
    paused = true;
    kz.classList.add('is-driving');
    S.tabs.forEach(function (x) { if (x.state === 'working') x.state = 'driving'; });
    renderSide();
    showDrive();
    addMsg('m-note', '<svg><use href="#i-hand"/></svg>' + esc(t('took')));
    caption(t('cap_drive'));
  }
  function handBack() {
    if (dockMode !== 'drive') return;
    kz.classList.remove('is-driving');
    S.tabs.forEach(function (x) { if (x.state === 'driving') x.state = 'working'; });
    renderSide();
    var last = $('.step.is-now span:last-child', msgs);
    showDock((last ? last.textContent : '') + '…');
    addMsg('m-note', '<svg><use href="#i-spark"/></svg>' + esc(t('handedBack')));
    caption(t('cap_agent2'));
    paused = false;
  }
  function stopAgent() {
    runId++;
    paused = false;
    kz.classList.remove('is-driving');
    hideDock();
    S.tabs.forEach(function (x) { if (x.state) x.state = null; });
    renderSide();
    var last = $('.step.is-now', msgs); if (last) last.remove();
    stepsEl = null;
    addMsg('m-ai', '<p>' + esc(t('stopped')) + '</p>' + (S.group ? groupActs() : ''));
    endChapter();
  }

  TOURS.palette = async function () {
    var id = runId;
    setActive('jornal'); S.prev = 'notes';
    caption(t('cap_pal'));
    await sleep(600); guard(id);
    openPal();
    await mark('palette0');
    await sleep(1600); guard(id);
    setProgress(.25);
    await typeInto(pal.input, 'lis', 120); guard(id);
    await mark('palette');
    await sleep(1400); guard(id);
    pal.move(1); await sleep(500); guard(id); pal.move(1); await sleep(800); guard(id);
    setProgress(.55);
    pal.set(''); await sleep(300); guard(id);
    await typeInto(pal.input, '97 * 2 + 14', 70); guard(id);
    await mark('palette-sum');
    await sleep(1800); guard(id);
    setProgress(.8);
    pal.set(''); await sleep(300); guard(id);
    await typeInto(pal.input, lang === 'zh' ? '周六晚上订一场法朵' : 'book fado for Saturday night', 40); guard(id);
    await sleep(600); guard(id);
    var rows = $$('#kz-pal-rows .pr'); rows.forEach(function (r) { r.classList.remove('is-sel'); }); if (rows.length) rows[rows.length - 1].classList.add('is-sel');
    await sleep(1600); guard(id);
    closePal();
    setProgress(1);
  };

  TOURS.translate = async function () {
    var id = runId;
    setActive('jornal');
    caption(t('cap_tr'));
    await sleep(1000); guard(id);
    setProgress(.2);
    var b = $('#kz-tr'); b.classList.add('is-hot');
    toggleTr();
    await mark('translate');
    await sleep(2600); guard(id);
    setProgress(.5);
    setTr('only');
    await sleep(2400); guard(id);
    setTr('off'); hideTrPop();
    setProgress(.7);
    await sleep(900); guard(id);
    // ⌥-hover a single paragraph.
    var p = $('[data-para="2"]', kz);
    if (p) p.classList.add('is-hot');
    await sleep(700); guard(id);
    S.trOne[2] = true; refreshPage();
    var p2 = $('[data-para="2"]', kz); if (p2) p2.classList.add('is-hot');
    await sleep(2400); guard(id);
    setProgress(1);
  };

  TOURS.tidy = async function () {
    var id = runId;
    setActive('orbit');
    caption(t('cap_tidy'));
    await sleep(1000); guard(id);
    setProgress(.3);
    var d = $('#kz-div'); if (d) d.classList.add('is-flash');
    await sleep(900); guard(id);
    clearToday();
    await sleep(400);
    await mark('tidy');
    await sleep(2600); guard(id);
    setProgress(.7);
    var u = $('#kz-toast [data-act="undo"]'); if (u) u.classList.add('is-hot');
    await sleep(500); guard(id);
    undoClear();
    await sleep(1600); guard(id);
    setProgress(1);
  };

  var ORDER = ['agent', 'palette', 'translate', 'tidy'];
  function endChapter() {
    var c = current;
    $$('.chap').forEach(function (b) { b.classList.remove('is-on'); });
    current = null;
    return c;
  }
  async function startChapter(name, how) {
    if (!hasDemo || !TOURS[name]) return;
    runId++;
    var id = runId;
    resetMock();
    current = name;
    $$('.chap').forEach(function (b) { b.classList.toggle('is-on', b.dataset.chapter === name); var bar = $('.chap-bar', b); if (bar) bar.style.setProperty('--p', 0); });
    try {
      await TOURS[name]();
      if (id !== runId) return;
      var done = name;
      await sleep(how === 'chain' ? 3800 : 600);
      if (id !== runId) return;
      endChapter();
      if (how === 'chain' && autoplay && !userTouched) {
        var nx = ORDER[(ORDER.indexOf(done) + 1) % ORDER.length];
        if (nx !== 'agent') startChapter(nx, 'chain');
      }
    } catch (e) {
      if (e !== CANCEL) { console.error(e); }
    }
  }

  /* Window palette */
  var pal;
  function openPal() {
    $('#kz-scrim').hidden = false;
    $('#kz-pal').hidden = false;
    pal.set('');
    if (!current) pal.input.focus({ preventScroll: true });
  }
  function closePal(quiet) {
    var p = $('#kz-pal'); if (!p) return;
    p.hidden = true; $('#kz-scrim').hidden = true;
    if (!quiet && document.activeElement === pal.input) kz.focus({ preventScroll: true });
  }
  function palAct(it) {
    closePal();
    if (it.kind === 'tab') { setActive(it.tb.id); }
    else if (it.kind === 'calc') { toast(esc(t('copied', { v: it.value }))); }
    else if (it.kind === 'hist' || it.kind === 'search') {
      var nid = 'n' + Date.now();
      var title = it.kind === 'hist' ? it.h.t : it.q;
      S.tabs.splice(4, 0, { id: nid, zone: 'today', title: title, host: it.kind === 'hist' ? it.h.host : 'search.example', path: it.kind === 'hist' ? '/' : '/?q=' + encodeURIComponent(it.q), l: title.charAt(0).toUpperCase(), c: 'f-sky', page: 'generic', blocked: 2 });
      entering[nid] = true;
      setActive(nid);
    } else if (it.kind === 'ask') { askKaze(it.q); }
  }
  function askKaze(q) {
    if (!q) return;
    if (!S.chat) toggleChat(true);
    addMsg('m-user', esc(q));
    if (/lisbo|lisbon|flight|里斯本|机票|航班/i.test(q)) {
      setTimeout(function () { startChapter('agent'); }, 400);
      return;
    }
    setTimeout(function () {
      addMsg('m-ai', '<p>' + esc(t('demoReply')) + '</p><div class="sugs" style="margin-top:8px">' +
        '<button type="button" class="sug" data-go="agent">' + esc(t('sug1')) + '</button>' +
        '<button type="button" class="sug" data-go="translate">' + esc(t('sug2')) + '</button></div>');
    }, 500);
  }
  function toggleChat(on) {
    S.chat = on == null ? !S.chat : on;
    kz.classList.toggle('no-chat', !S.chat);
    $('#kz-agentbtn').setAttribute('aria-pressed', String(S.chat));
    $$('.kz-sec').forEach(function (b) { if (b.dataset.sec === 'agent') b.classList.toggle('is-on', S.chat); });
  }

  function interrupt() {
    userTouched = true;
    if (current) { runId++; paused = false; endChapter(); }
  }

  if (hasDemo) {
    S = freshState();
    pal = makePalette({
      input: $('#kz-pal-input'), list: $('#kz-pal-rows'),
      tabs: function () { return S.tabs.filter(function (x) { return x.zone !== 'pin'; }).concat(S.tabs.filter(function (x) { return x.zone === 'pin'; })); },
      prev: function () { return S.prev; },
      onAct: function (it) { interrupt(); palAct(it); },
      onEsc: function () { closePal(); }
    });
    render();

    // Scale the 1280×800 window to the stage.
    var fit = function () {
      var compact = stage.clientWidth < 600;
      stage.classList.toggle('is-compact', compact);
      kz.classList.toggle('is-compact', compact);
      kz.style.setProperty('--s', stage.clientWidth / (compact ? 860 : 1280));
    };
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(stage); else window.addEventListener('resize', fit);

    var demoFocus = false;
    document.addEventListener('pointerdown', function (e) { demoFocus = !!e.target.closest('#kz, .chapters'); });
    kz.addEventListener('focusin', function () { demoFocus = true; });

    kz.addEventListener('click', function (e) {
      var el;
      if ((el = e.target.closest('[data-act]'))) {
        var a = el.dataset.act;
        if (a === 'stop') { stopAgent(); }
        else if (a === 'take') { userTouched = true; takeOver(); }
        else if (a === 'back') { handBack(); }
        else if (a === 'yes' || a === 'no') { userTouched = true; answerPerm(a); }
        else if (a === 'gclose') { groupClose(); }
        else if (a === 'gkeep') { groupKeep(); }
        else if (a === 'undo') { var tEl = $('#kz-toast'); if (tEl._undo) tEl._undo(); }
        return;
      }
      if ((el = e.target.closest('[data-go]'))) { startChapter(el.dataset.go); userTouched = true; return; }
      if ((el = e.target.closest('[data-close]'))) { e.stopPropagation(); interrupt(); closeTab(el.dataset.close); return; }
      if ((el = e.target.closest('[data-tab]'))) {
        userTouched = true; follow = false;
        if (current && current !== 'agent') interrupt();
        setActive(el.dataset.tab);
        return;
      }
      if (e.target.closest('#kz-clear')) { interrupt(); clearToday(); return; }
      if (e.target.closest('#kz-tr')) { interrupt(); toggleTr(); return; }
      if ((el = e.target.closest('[data-trmode]'))) { interrupt(); setTr(el.dataset.trmode); return; }
      if (e.target.closest('#kz-agentbtn')) { toggleChat(); return; }
      if ((el = e.target.closest('.kz-sec'))) {
        if (el.dataset.sec === 'agent') toggleChat();
        else { $$('.kz-sec').forEach(function (b) { if (b.dataset.sec !== 'agent') b.classList.toggle('is-on', b === el); }); }
        return;
      }
      if (e.target.closest('#kz-new')) { interrupt(); openPal(); return; }
      if (e.target.closest('#kz-scrim')) { closePal(); return; }
      if (!e.target.closest('#kz-trpop')) hideTrPop();
    });

    // ⌥-hover a paragraph translates just that one.
    kz.addEventListener('mousemove', function (e) {
      if (!e.altKey) return;
      var p = e.target.closest('[data-para]');
      if (p && S.tr === 'off' && !S.trOne[p.dataset.para]) { S.trOne[p.dataset.para] = true; refreshPage(); }
    });

    $('#kz-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('#kz-input').value.trim();
      if (!v) return;
      interrupt();
      $('#kz-input').value = '';
      askKaze(v);
    });
    $('#kz-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#kz-form').requestSubmit ? $('#kz-form').requestSubmit() : $('#kz-form').dispatchEvent(new Event('submit')); }
      e.stopPropagation();
    });
    $('#kz-input').addEventListener('focus', function () { if (current && current !== 'agent') interrupt(); });

    document.addEventListener('keydown', function (e) {
      if (!demoFocus) return;
      var meta = e.metaKey || e.ctrlKey;
      var k = e.key.toLowerCase();
      if (meta && k === 'k' && !e.altKey) { e.preventDefault(); interrupt(); openPal(); return; }
      if (meta && e.shiftKey && e.key === 'Enter') { e.preventDefault(); handBack(); return; }
      if (meta && e.key === '.') { e.preventDefault(); userTouched = true; takeOver(); return; }
      if (meta && e.altKey && e.code === 'KeyW') { e.preventDefault(); groupClose(); return; }
      if (meta && e.altKey && e.code === 'KeyK') { e.preventDefault(); groupKeep(); return; }
      if (e.altKey && !meta && e.code === 'KeyE') { e.preventDefault(); interrupt(); toggleTr(); return; }
      if (dockMode === 'perm') {
        if (e.key === 'Enter') { e.preventDefault(); userTouched = true; answerPerm('yes'); return; }
        if (e.key === 'Escape') { e.preventDefault(); userTouched = true; answerPerm('no'); return; }
      }
      if (e.key === 'Escape') { closePal(); hideTrPop(); }
    });

    $$('[data-chapter]').forEach(function (b) {
      b.addEventListener('click', function () {
        autoplay = false; userTouched = false;
        if (b.dataset.scroll) { var d = $('#demo'); var y = d.getBoundingClientRect().top + window.scrollY - 70; window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' }); }
        startChapter(b.dataset.chapter, b.dataset.scroll ? 'chain' : null);
        if (b.dataset.scroll) autoplay = true;
      });
    });

    // Start the tours when the window comes into view.
    var started = false;
    var params = new URLSearchParams(location.hash.slice(1));
    if (params.get('demo')) {
      var dv = params.get('demo'), dname = dv.split('-')[0];
      var JUMP = { agent: 'done', 'agent-dock': 'dock', 'agent-perm': 'perm', palette: 'palette', 'palette-0': 'palette0', 'palette-sum': 'palette-sum', translate: 'translate', tidy: 'tidy' };
      jump = JUMP[dv] || null;
      started = true; autoplay = false;
      startChapter(dname);
    } else if ('IntersectionObserver' in window && autoplay) {
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (x) {
          if (x.isIntersecting && !started && !userTouched) { started = true; startChapter('agent', 'chain'); io.disconnect(); }
        });
      }, { threshold: .55 });
      io.observe(stage);
    }
  }

  /* ------------------------------------------------------------------
     Section demos
     ------------------------------------------------------------------ */
  // Dock words in the agent card.
  (function () {
    var el = $('#viz-dock-word'); if (!el) return;
    var i = 0;
    el.textContent = t('dockWords')[0];
    if (reduced) return;
    setInterval(function () {
      var box = el.parentNode;
      var words = t('dockWords');
      i = (i + 1) % words.length;
      var old = $('.dock-word:not(.out)', box);
      if (old) { old.classList.add('out'); setTimeout(function () { old.remove(); }, 320); }
      var n = document.createElement('span'); n.className = 'dock-word in'; n.textContent = words[i]; box.appendChild(n);
      el = n;
    }, 2400);
  })();

  // Permission card in the agent card.
  (function () {
    var card = $('#viz-perm'); if (!card) return;
    var done = $('.perm-done', card);
    card.addEventListener('click', function (e) {
      var b = e.target.closest('[data-perm]'); if (!b) return;
      card.classList.add('is-done');
      done.hidden = false;
      done.innerHTML = b.dataset.perm === 'yes'
        ? '<svg aria-hidden="true"><use href="#i-check"/></svg>' + (lang === 'zh' ? '已支付 €97，订单号 QX7M2P。' : 'Paid €97. Booking reference QX7M2P.')
        : (lang === 'zh' ? '没有付款。卡片会一直等你。' : 'Nothing was paid. The card waits for you.');
      setTimeout(function () { card.classList.remove('is-done'); done.hidden = true; }, 3200);
    });
  })();

  // Tidy section.
  var TIDY = [
    { l: 'J', c: 'f-ink', t: 'Os elétricos voltam a subir à Graça' },
    { l: 'N', c: 'f-amber', t: 'Weekend plan' },
    { l: 'O', c: 'f-violet', t: 'Orbit, front page' },
    { l: 'S', c: 'f-sky', t: 'London to Lisbon, Fri 20 Nov' },
    { l: 'P', c: 'f-amber', t: 'Pastéis de nata, the slow way' }
  ];
  (function () {
    var list = $('#tidy-list'); if (!list) return;
    var toastEl = $('#tidy-toast');
    function paint(anim) {
      list.innerHTML = TIDY.map(function (x, i) { return '<div class="tab' + (i === 1 ? ' is-cur' : '') + (anim ? ' enter' : '') + '" style="animation-delay:' + (anim ? i * 40 : 0) + 'ms"><span class="fav ' + x.c + '">' + x.l + '</span><span class="tab-t">' + esc(x.t) + '</span></div>'; }).join('');
    }
    paint();
    $('#tidy-clear').addEventListener('click', function () {
      if (!list.children.length || list.querySelector('.tidy-empty')) return;
      $$('.tab', list).forEach(function (el) { el.classList.add('leave'); });
      setTimeout(function () {
        list.innerHTML = '<p class="tidy-empty">' + (lang === 'zh' ? '今天的标签页都收好了。新标签页会出现在这里。' : "Today's tabs are cleared. New tabs land here.") + '</p>';
        $('#tidy-toast-t').textContent = lang === 'zh' ? '已关闭 5 个标签页' : 'Closed 5 tabs';
        toastEl.hidden = false;
      }, 260);
    });
    $('#tidy-undo').addEventListener('click', function () { toastEl.hidden = true; paint(true); });
  })();

  // Translation section.
  var trDoc = $('#trv-doc');
  var trOne = {};
  function paintTr() {
    if (!trDoc) return;
    var m = trDoc.dataset.mode, tl = lang === 'zh' ? 'zh' : 'en';
    var h = '<h4>' + ART.h.pt + '</h4>' + (m !== 'off' ? '<span class="tr-line">' + ART.h[tl] + '</span>' : '');
    [0, 2].forEach(function (i) {
      h += '<p class="para" data-p="' + i + '">' + ART.p[i].pt + '</p>';
      if (m !== 'off' || trOne[i]) h += '<span class="tr-line">' + ART.p[i][tl] + '</span>';
    });
    trDoc.innerHTML = h;
  }
  if (trDoc) {
    paintTr();
    $('#tr-seg').addEventListener('click', function (e) {
      var b = e.target.closest('[data-mode]'); if (!b) return;
      $$('#tr-seg [data-mode]').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
      trDoc.dataset.mode = b.dataset.mode; trOne = {}; paintTr();
    });
    trDoc.addEventListener('mousemove', function (e) {
      if (!e.altKey || trDoc.dataset.mode !== 'off') return;
      var p = e.target.closest('[data-p]'); if (p && !trOne[p.dataset.p]) { trOne[p.dataset.p] = true; paintTr(); }
    });
    trDoc.addEventListener('click', function (e) {
      if (trDoc.dataset.mode !== 'off') return;
      var p = e.target.closest('[data-p]'); if (p) { trOne[p.dataset.p] = !trOne[p.dataset.p]; paintTr(); }
    });
  }

  // Standalone palette section.
  var spal, spalNote;
  (function () {
    var input = $('#spal-input'); if (!input) return;
    var tabs = baseTabs().filter(function (x) { return x.zone !== 'pin'; });
    spal = makePalette({
      input: input, list: $('#spal-rows'),
      tabs: function () { return tabs; }, prev: function () { return 'notes'; },
      onAct: function (it) {
        var a = { tab: 'switchTo', hist: 'open', search: 'search', calc: 'copy', ask: 'ask' }[it.kind];
        var label = it.kind === 'calc' ? String(it.value) : it.kind === 'tab' ? it.tb.title : it.kind === 'hist' ? it.h.t : it.q;
        if (!spalNote) { spalNote = document.createElement('p'); spalNote.className = 'trv-hint'; spalNote.setAttribute('aria-live', 'polite'); spalNote.style.cssText = 'margin:16px 4px 0;color:var(--ink-2)'; $('#spal').parentNode.appendChild(spalNote); }
        spalNote.textContent = t('would', { a: t(a), t: label });
      }
    });
    spal.build();
    $$('.try').forEach(function (b) { b.addEventListener('click', function () { spal.set(b.dataset.try); input.focus({ preventScroll: true }); }); });
  })();

  // Ad blocking section.
  (function () {
    var adv = $('#adv'); if (!adv) return;
    $('#adv-switch').addEventListener('click', function () {
      var on = adv.dataset.on !== 'true';
      adv.dataset.on = String(on);
      this.setAttribute('aria-checked', String(on));
      $('#adv-count').textContent = on ? '31' : '0';
      var n = $('#adv-note');
      n.textContent = on ? (lang === 'zh' ? ZH['ads.on'] : n.dataset.en || '31 ads and trackers stopped on this page.')
        : (lang === 'zh' ? '已对这个网站关闭拦截。' : 'Blocking is off for this site.');
    });
  })();

  // Import section.
  (function () {
    var imp = $('#imp'); if (!imp) return;
    var from = 'Chrome', busy = false;
    function label() { $('#imp-go-t').textContent = lang === 'zh' ? '从 ' + from + ' 搬过来' : 'Bring from ' + from; }
    label();
    $('#imp-from').addEventListener('click', function (e) {
      var b = e.target.closest('[data-b]'); if (!b || busy) return;
      from = b.dataset.b;
      $$('#imp-from [data-b]').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
      $$('#imp-list li').forEach(function (li) { li.classList.remove('is-done', 'is-now'); });
      label();
    });
    $('#imp-go').addEventListener('click', function () {
      if (busy) return; busy = true;
      var lis = $$('#imp-list li');
      lis.forEach(function (li) { li.classList.remove('is-done', 'is-now'); });
      var i = 0;
      (function next() {
        if (i > 0) { lis[i - 1].classList.remove('is-now'); lis[i - 1].classList.add('is-done'); }
        if (i >= lis.length) {
          $('#imp-go-t').textContent = lang === 'zh' ? '都搬过来了' : 'All here';
          setTimeout(function () { busy = false; label(); }, 2200);
          return;
        }
        lis[i].classList.add('is-now'); i++;
        setTimeout(next, reduced ? 60 : 420);
      })();
    });
    imp._label = label;
  })();

  /* ------------------------------------------------------------------
     Page chrome
     ------------------------------------------------------------------ */
  var nav = $('.nav');
  var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  if ('IntersectionObserver' in window && !reduced) {
    var rio = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); rio.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.sec-head, .split-text, .split-viz, .card, .mini, .tones, .faq-head, .faq-list, .closing-in').forEach(function (el, i) {
      el.classList.add('rv');
      if (el.classList.contains('card') || el.classList.contains('mini')) el.style.transitionDelay = ((i % 5) * 60) + 'ms';
      rio.observe(el);
    });
  }

  var onLangChange = function () {
    if (hasDemo) {
      var was = current;
      runId++; current = null; $$('.chap').forEach(function (b) { b.classList.remove('is-on'); });
      resetMock();
      caption(lang === 'zh' ? ZH['demo.hint'] : $('#caption').dataset.en);
      if (was) startChapter(was);
    }
    paintTr();
    if (spal) { spal.input.placeholder = t('palPh'); spal.build(); }
    var imp = $('#imp'); if (imp && imp._label) imp._label();
    var w = $('#viz-dock-word'); if (w) w.textContent = t('dockWords')[0];
  };

  // Initial language, tone, and hash overrides (#lang=zh, #tone=mint).
  var hp = new URLSearchParams(location.hash.slice(1));
  if (hp.get('tone')) setTone(hp.get('tone')); else setTone(root.getAttribute('data-tone') || 'sky');
  // Capture English originals, then apply.
  var cap = $('#caption'); if (cap) cap.dataset.en = cap.textContent;
  var savedHook = onLangChange; onLangChange = null;
  applyLang(lang);
  onLangChange = savedHook;
})();
