# 访问统计口径

- 今日访问人数：同一公共 IP 在北京时间（Asia/Shanghai）同一天只计一次，零点切换至新日期，不使用滚动 24 小时窗口。
- 当前在线人数：最近五分钟有访问或心跳的不同 IP 数。同一出口 IP 下的多个浏览器/设备合计一人。
- 每次访问和一分钟一次的心跳都更新状态；页面跨零点保持打开时，下一次心跳登记新一天。
- IP 由 Vercel 提供的请求头读取，不使用浏览器本地 visitorId。优先 x-vercel-forwarded-for，再使用 x-forwarded-for；地址校验并规范化。自托管需要可信代理覆盖这些头。

## 存储与并发

使用既有 visitor_sessions 表，无需数据库迁移。主键 visitor_id 保证多标签页和并发请求去重：

- `ip:<hash>`：在线状态。
- `ipday:<北京时间日期>:<hash>`：当天唯一 IP 的记录。

记录中只保存带命名空间的 IP 哈希，未保存原始 IP。普通 SHA-256 哈希不应被视为不可识别的匿名数据。每天计数按日期前缀查询，不删除历史记录，也不依赖定时清空任务。

旧版本 visitor_events 是页面浏览事件，不能恢复准确的历史 IP 去重人数。新统计从修复上线后开始登记，不把旧事件或浏览器 session 混入新人数。旧 API 字段 visits24h 暂时保留为 visitsToday 的兼容别名，页脚显示“今日访问人数”。

## 验证

测试覆盖：同 IP 跨页面、20 个并发请求、不同 IP、旧记录隔离、五分钟在线窗口、北京时间零点/月末/年末、跨日心跳、IPv6 规范化，以及 JSON visitorId/IP 对统计无影响。npm test、npm run lint、npm run build。

IP 请求头依据：https://vercel.com/docs/headers/request-headers
