<div align="center">

<img src="Website/icon-512.png" width="96" height="96" alt="Kaze" />

# Kaze

**一个安静、快速的 macOS 浏览器，内置一个在你的标签页里干活的 agent。**

<a href="https://github.com/jackwener/Kaze/releases/latest"><img src="https://img.shields.io/github/v/release/jackwener/Kaze?style=for-the-badge&logo=apple&logoColor=white&label=%E4%B8%8B%E8%BD%BD%20macOS%20%E7%89%88&color=000000" alt="下载 macOS 版" /></a>
<a href="https://kaze.build"><img src="https://img.shields.io/badge/%E4%B8%BB%E9%A1%B5-kaze.build-1E90FF?style=for-the-badge" alt="kaze.build" /></a>

[English](README.md) · **简体中文**

</div>

<p align="center"><img src="assets/kaze-zh.webp" width="800" alt="Kaze：agent 在自己的标签页里找机票" /></p>

Kaze 是一个可以天天用的浏览器，里面内置了 agent。你提一个要求，它就在你的标签页旁边、用它自己的
标签页去做：每一步都给你看，你随时可以接手，付款、发送、删除之前一定先问你。这些带着你登录状态的
标签页，你已经在用的 agent（比如 Claude Code、Codex）也能用。

现在让 AI 用浏览器，往往要做取舍：用浏览器插件，它干活时会占住你的浏览器；用内置或云端的浏览器，
哪个网站都没登录；用 AI 浏览器，又常常不适合天天用。Kaze 想两头都做好：对你是一个真正的浏览器，
对 agent 是一个不会挡你路的工作区。

## 快速上手

**1. 安装。** 在 [Releases](https://github.com/jackwener/Kaze/releases/latest) 下载 DMG：
Apple 芯片用 `Kaze-<版本>-arm64.dmg`，Intel 用 `Kaze-<版本>.dmg`，把 Kaze 拖进“应用程序”。
免费，不用注册账号，支持 macOS 13 及以上，会自动更新。

**2. 搬过来。** 第一次打开时，Kaze 会问你要不要从 Chrome、Arc、Edge、Brave 或 Safari 搬来标签页、
登录信息、书签、历史记录和扩展。选“要”，你登录过的网站在 Kaze 里照样是登录状态，agent 也一样。

**3. 选模型。** 用 ChatGPT 登录、填自己的 API key，或者接任何兼容 OpenAI 的接口（设置 › Agent）。

**4. 提要求。** 按 ⌘E 打开 agent，试试：

```
帮我找周五从伦敦到里斯本、120 欧以内的机票
```

它会把需要的网页放进一个以任务命名的标签组里，你照常浏览。按 ⌘. 可以接手；做完后一键关掉它开的
标签页。

**5. 让你的其他 agent 也用上。** Kaze 会找到你 Mac 上的 Claude Code、Codex、Cursor、
Claude Desktop、Gemini CLI 和 DeepSeek Harness，通过它的 MCP 服务一次接好。比如在 Claude Code 里：

```
读一下我在 Kaze 里开着的航班，把最便宜的加进 plan.md
```

在“设置 › 外部 Agent”里可以断开任何一个，断开后不会再自动连上。

## 自定义 Agent 接口

Kaze 内置的 Agent 可以使用自定义的 OpenAI 兼容接口。打开“设置 › Agent › 添加自定义端点…”即可配置。

以本地 Magpie 这类网关为例：

1. 启动网关，确认它支持 OpenAI Chat Completions 的流式输出和工具调用（function calling）。Kaze 请求 `{base}/chat/completions`，不使用 Responses API。
2. 填写**名称**和网关的 OpenAI 兼容基础地址（**Base URL**）。如果服务在 3425 端口提供 `/v1/...`，填写 `http://127.0.0.1:3425/v1`。
3. 网关不要求密钥时，**API 密钥**留空；否则填入对应密钥。
4. **模型**留空时，Kaze 会从 `{base}/models` 自动获取聊天模型，也可以手动填写模型 ID。
5. 选择支持工具调用的模型，再发送一个简单的浏览器任务。

要让外部 Agent 操作 Kaze 里已登录的标签页，打开“设置 › 外部 Agent”。支持的客户端可一键**连接**，其他 MCP 客户端可复制 **MCP 配置**进行配置。Magpie 提供模型服务；使用 Magpie 的 Agent 通过这条外部 Agent 路径连接 Kaze。

## 亮点

| | |
|---|---|
| **用它自己的标签页，不动你的** | agent 在后台标签页里干活，放在以任务命名的标签组里，你的标签页原样不动。每个标签都显示状态：在做、需要你、做完了、你在操作。 |
| **动手之前先问** | 付款、发送、删除或运行任何东西之前，都会弹出卡片写明具体要做什么，你同意了才做。 |
| **你的模型，你的 Mac** | 用你选的模型。活动、历史记录和设置都留在你的 Mac 上。 |
| **会记住网站怎么用** | agent 在某个网站上摸索出来的东西，会存成这个网站的技能，下次自动带上。在“技能”页里可以查看、修改、删除。 |
| **同时做几件事** | 子 agent 把大任务拆开并行做；定时任务可以每天早上 8 点或周五跑一次；“活动”记得你读过什么，问“上周那篇电车的文章”就能找到。 |
| **首先是个好浏览器** | 会自己整理的标签页、闲置标签自动休眠、⌘K 面板、⌥E 双语对照翻译、内置广告拦截、Chrome 扩展、每个窗口一种颜色，英文和简体中文。 |

## 这个仓库里有什么

| | |
|---|---|
| [Releases](https://github.com/jackwener/Kaze/releases) | Kaze 的安装包和更新说明 |
| [`skills/`](skills) | Kaze 自带的技能，Agent Skills 格式 |
| [`Website/`](Website) | 主页 [kaze.build](https://kaze.build)（纯静态文件，用 `npx wrangler deploy` 发布） |

Kaze 的浏览器能力来自 [BrowserMCP](https://github.com/jackwener/BrowserMCP)（Apache-2.0）：一个开源
的 MCP 服务，用来操作已登录的浏览器，带 JavaScript 工作区和可复用的网站适配器。Kaze 借给其他 agent
用的就是它，它也可以单独配合 Chrome 使用。

## 反馈

问题和建议请提到 [Issues](https://github.com/jackwener/Kaze/issues)，附上 Kaze 的版本
（Kaze › 关于 Kaze）和你的 Mac 是什么芯片。
