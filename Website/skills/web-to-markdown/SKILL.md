---
name: Web to Markdown
description: Save a web page as a Markdown file. Use when the user asks to save, clip, archive or export a page, or to read it as Markdown.
---

Read the page with BrowserMCP (`tab.read()`, following `r.next` until complete; reuse the user's open tab rather than opening a duplicate). Write clean Markdown yourself: keep headings, lists, code blocks with their language, tables, links and images with absolute URLs; drop navigation, sidebars, comments, recommendations and banners. Start with frontmatter: title, source, fetched (author and published when shown).

Save it with `save_file` under the title as the file name (where the user said, else the default folder). Reply with the path and one line about the page — not the Markdown.

If the page is a sign-in or consent wall or nearly empty, don't invent content: ask the user to sign in in that tab and retry. One file per page; several pages also get an `index.md`.
