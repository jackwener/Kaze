# Kaze's skills

Kaze's skills market. Each is a folder with a `SKILL.md` in the
[Agent Skills](https://agentskills.io) format (a name and description in frontmatter, then the
instructions). Kaze lists them in Skills › Market, where you add the ones you want; an added skill
is kept up to date until you edit it, and an edited one is never overwritten.

| Skill | What it does |
|---|---|
| [`web-to-markdown`](web-to-markdown/SKILL.md) | Saves a web page as a clean Markdown file |
| [`xiaohongshu-limit-check`](xiaohongshu-limit-check/SKILL.md) | 小红书发笔记前的防限流自检 |
| [`export-jd-orders`](export-jd-orders/SKILL.md) | 导出京东全部历史订单为表格 |
| [`export-alipay-bills`](export-alipay-bills/SKILL.md) | 导出支付宝全部账单为表格 |
| [`export-taobao-orders`](export-taobao-orders/SKILL.md) | 导出淘宝/天猫全部历史订单为表格 |

They're written for Kaze's agent: they read pages through [BrowserMCP](https://github.com/jackwener/BrowserMCP)
(`tab.read()`) and write with Kaze's `save_file`. Another agent with BrowserMCP can use them with
its own way of writing files.

A skill merged into this folder is in the market at the next deploy of kaze.build — no Kaze release
needed (`node scripts/skills-index.mjs` builds `kaze.build/skills/index.json` from it; run it to check a
new skill). To suggest one, open a pull request with its folder.
