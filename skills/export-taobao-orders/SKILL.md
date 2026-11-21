---
name: 导出淘宝消费记录
description: 当用户要把淘宝/天猫的历史订单全部导出成表格（或据此做消费统计）时使用。
start_url: https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm
sites:
  - buyertrade.taobao.com
  - taobao.com
kind: task
---

把用户淘宝账号下的**全部**订单一次抓下来存成两个 CSV。只读，绝不点删除订单/确认收货/退款/取消。

**前提（不满足就先问用户，别硬跑）**
- 用户已在浏览器里登录淘宝、且是本人账号：打开订单页能看到「已买到的宝贝」列表、右上角有用户名。跳到登录页就请用户先登录，不要自己扫码。
- 页面上的「导出订单」按钮每次只导 10 页、还得按日期分批，不使用它。

**怎么抓**
- 接口：`POST https://buyertrade.taobao.com/trade/itemlist/asyncBought.htm`
  表单 `action=itemlist/BoughtQueryAction&event_submit_do_query=1&_input_charset=utf8&pageNum=N&pageSize=50&prePageNo=N-1`
- 返回 **GBK** 编码 JSON，必须 `new TextDecoder('gbk')` 解码，否则中文全乱码。
- 第 1 页的 `page.totalPage` 就是总页数（经验 30–40 页，覆盖到账号最早的订单，能到 2017 年）。`dateBegin/dateEnd` 无效，只能翻页。

**流程**
1. 开一个标签页到订单页，确认已登录（body 里有「已买到的宝贝」+ 用户名）。
2. 在页面里定义 XHR 抓取函数，结果累加进 `window.__ALL`，已取的页记进 `window.__DONE`，这样中断后可续抓。
3. 每批 5 页、页间约 1.1 秒；拿到 `mainOrders` 就继续，出现 `FAIL_SYS_USER_VALIDATE`/`RGV587`（"被挤爆啦"）立即停，不要连环重试。
4. 被风控后的处理：静等 15–30 分钟（1 小时更稳）再补剩下的页；**不要**去拖那个 x5 滑块——脚本拖拽必然失败（报 error:xxxx），只会白等；可以请用户本人拖一次。
5. 抓完按 `mainOrders[].id` 去重，核对最早/最晚时间是否连续、有没有缺页。
6. 在页面里拼 CSV（`\ufeff` BOM + `\r\n` 换行），用 Blob + `a.click()` 直接下载到 Downloads；几十万字符不要试图搬回对话里。
7. 出两个文件：`淘宝消费记录_按商品_<日期>.csv`（每商品一行）、`淘宝消费记录_按订单_<日期>.csv`（每单一行）。
8. 汇报：总单数、时间跨度、实付合计（注明含关闭/取消单）、剔除「交易关闭/已取消」后的净额、按年分布、Top 店铺。

**字段映射**
- 主订单：`m.id`、`m.orderInfo.createTime`、`m.seller.shopName`、`m.statusInfo.text`（中文状态）、`m.extra.tradeStatus`、`m.payInfo.actualFee`（订单实付）。
- 子商品 `m.subOrders[]`：`itemInfo.title`、`itemInfo.skuText[].value`（可能是数组也可能直接是字符串，先 `Array.isArray` 判断）、`s.quantity`、`itemInfo.id`、`priceInfo.original`（标价）、`priceInfo.realTotal`（该商品小计，不是单价）。
- 机票/充值类订单没有 subOrders，也要为它留一行，别让总单数对不上。
