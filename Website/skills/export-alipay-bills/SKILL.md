---
name: 导出支付宝全部账单
description: 当用户要把支付宝的历史账单/消费记录全部导出成表格（或据此做消费分析）时使用。
start_url: https://consumeprod.alipay.com/record/standard.htm
sites:
  - consumeprod.alipay.com
  - alipay.com
kind: task
---

目标：把「我的账单」全量导出成一份 CSV（时间、名称、对方、金额、状态、流水号），汇报总条数、跨度、支出/退款合计和 Top 商户。全量指从最早一条到现在，不是默认的最近 1 个月。

前提（缺一条先问用户，别硬跑）：在你能驱动的标签里打开账单页；被跳到 auth.alipay.com 就让用户在那个标签扫码登录（不要账号密码）；核对页头是「你好，XXX」；记下页脚「共 N 条」，它是唯一校验标准。默认全量 + CSV，范围或要不要分析结论不清楚就问一句。

不要翻页。点「下一页」几乎每次都会跳 checkSecurity.htm 要手机扫码，扫完再点又校验一次；直接 GET standard.htm?pageNum=2 也只会返回第 1 页。走「下载查询结果」。

1. 拼下载页：.../record/download.htm?_input_charset=utf-8&suffix=csv&dateRange=customDate&beginDate=YYYY.MM.DD&endDate=YYYY.MM.DD&dateType=createDate&fundFlow=all&beginTime=00%3A00&endTime=24%3A00&tradeType=ALL&status=all&pageNum=1。dateRange 只认 today/oneMonth/threeMonths/oneYear/customDate；写 custom 会被打回 standard.htm，跨度超 1 年会跳 error.htm「系统繁忙」。页面上那个下载链接的 data-link 就是现成模板。
2. 从近往远按 1 年一个窗口取，直到连续两年 0 条；按交易号去重（窗口相接会重叠）。最早一条的日期就是账号真实起点。
3. securityId 一次性：每次先 goto 下载页，再在**同一个** evaluate 里读表单 securityId 并 POST 到 download.resource（FormData：securityId + _xbox=true）。同一页面 POST 第二次必回「安全校验失败」HTML。
4. 响应是 zip：local header 的 sizes 为 0（flag 8），常常没有 EOCD。在数据区之后扫 0x08074b50 定位结束，slice 后用 DecompressionStream('deflate-raw')，再 TextDecoder('gbk')。别去解析中央目录。
5. 17 列顺序：交易号,商家订单号,交易创建时间,付款时间,最近修改时间,交易来源地,类型,交易对方,商品名称,金额（元）,收/支,交易状态,服务费（元）,成功退款（元）,备注,资金状态。字段带尾随制表符和空格，解析后 trim；按行首 8 位以上数字 + \t 挑数据行。
6. 这份导出里退款**不是**独立行（网页列表才是），在「成功退款（元）」列。要 6 列格式就在原交易之外补一条「退款-名称 / 状态=退款成功 / 正数」的行，流水号沿用原交易号。
7. evaluate 默认 10s 会超时，但 JS 还在跑：大窗口传 {timeoutMs:60000}；超时后先读页面里累计的条数，别重下。
8. 汇总口径：支出只算 收/支=支出 且 状态≠交易关闭；退款单列、不抵支出；不计收支（转账、理财、余额宝）另算。页脚「共 N 条」把退款单独行也算进去，所以 交易行 + 退款行 ≈ N，差 1~2 条属正常。

输出：\ufeff BOM、CRLF、金额两位小数字符串（支出负，收入/退款正）。文件上万行约 1MB：在页面里拼好 CSV，每 5 万字符切片经浏览器 REPL 取回，最后一并 save_file（别让大段文本反复过主上下文）。别动用户原来那个账单标签。
