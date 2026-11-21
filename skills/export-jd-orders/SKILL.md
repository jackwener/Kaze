---
name: 导出京东消费记录
description: 把京东的全部历史订单导出成一张表格，可以直接拿来做消费分析。用户要导出京东订单或消费记录时使用。
start_url: https://order.jd.hk/center/list.action
sites:
  - order.jd.com
  - order.jd.hk
  - jd.com
kind: task
---

先把前提一条条核过，缺一条就停下来问用户，别硬跑：
1. 用户已在浏览器里登录京东（能正常看到订单列表）。没登录就让用户自己登，不要碰账号密码。
2. 能进订单中心列表页 order.jd.com/center/list.action（会被跳到 order.jd.hk，正常）。
3. 页头昵称是用户本人的账号；有多个京东账号时先确认是哪一个，避免导错人。
4. 问清范围：全部历史（默认，按年循环）还是近 3 个月 / 某一年；要 CSV 还是要分析结论。

抓取流程：
1. 自己开一个 agent 标签页到 order.jd.hk/center/list.action，别抢占用户正在看的标签；开 network 录制后 reload。
2. 从录到的请求里取一条 `functionId=pcorder_center_list` 的 POST 完整 URL（带 x-api-eid-token、h5st、t）。这串就是签名，全程复用；只改 body，绝不要改 `t`，改了签名立刻失效。
3. 在页面里 fetch 这串 URL：`Content-Type: application/x-www-form-urlencoded`，body 为 `'body=' + encodeURIComponent(JSON.stringify({page, s:4096, d}))`。`d` 传年份字符串（如 "2025"），`s=4096` = 全部状态，每页固定 20 条。
4. 年份 2013→今年逐年循环，page 从 1 翻到 orderList 为空或总数够为止。**坑**：`d` 传一个没有订单的无效年份会静默回退成「近 3 个月」列表，所以必须按 orderId 全局去重。
5. 别在一次 evaluate 里跑完全部年份（默认 10s 超时会被打断）：先把 `window.__jdFetch(d)` 装进页面，然后每次 evaluate 只跑一年。
6. 拆单按 parentId 合并成一个订单：金额取 `parentOrderList[parentId].shouldPay`，没有父单记录才回退到子单 `itemPayInfo.shouldPay`（>0 才用），否则会漏算或重复算；店铺、状态、商品从子单取。
7. 导出 3 个 CSV，都要带 `\ufeff` BOM（否则 Excel 打开乱码）：订单全量（一行一单，含商品明细串）、商品明细（一行一商品）、年度汇总（有效单/取消单/实付/客单价）。用页面里 `new Blob` + `a.download` 落到 ~/Downloads，下完用 ffprobe 之类确认文件真的存在。
8. 汇报时给清口径：时间跨度、有效单数、取消单数、实付合计、各年趋势；并说明用 E 卡/京豆/权益支付的单实付显示 0，真实花费会略高。顺便看一眼订单回收站（order.jd.hk/center/recycle.action，同一个接口），有已删除订单要问用户是否并入。
