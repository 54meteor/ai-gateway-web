/**
 * 工具函数：将 UTC 时间字符串转换为 Asia/Shanghai 时区并格式化显示
 * 数据库存储的是 UTC，前端统一转为北京时间（+8小时）显示
 */

/**
 * 将 UTC 时间字符串转为北京时间字符串
 * 输入格式: "2026-04-10 14:31:43" (UTC)
 * 输出格式: "2026-04-10 22:31:43" (北京时间 +8)
 */
export function toShanghaiTime(utcString: string): string {
  if (!utcString) return "-";

  try {
    // 尝试解析 UTC 时间
    let date: Date;
    if (utcString.includes("T") && utcString.includes("Z")) {
      // ISO 格式: 2026-04-10T04:38:59Z
      date = new Date(utcString);
    } else {
      // 普通格式: 2026-04-10 14:31:43 - 视为 UTC
      const [datePart, timePart] = utcString.split(" ");
      const [y, m, d] = datePart.split("-").map(Number);
      const [hh, mm, ss] = timePart.split(":").map(Number);
      date = new Date(Date.UTC(y, m - 1, d, hh, mm, ss));
    }

    // 转为北京时间 (+8)
    const shanghaiOffset = 8 * 60; // 分钟
    const localOffset = date.getTimezoneOffset(); // 本地时区偏移（分钟，UTC 为负值）
    const diff = shanghaiOffset + localOffset; // 需要加的分钟数
    date.setMinutes(date.getMinutes() + diff);

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hour = String(date.getUTCHours()).padStart(2, "0");
    const minute = String(date.getUTCMinutes()).padStart(2, "0");
    const second = String(date.getUTCSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  } catch {
    return utcString;
  }
}

/**
 * 格式化日期显示（兼容旧格式，直接返回原值）
 */
export function formatDate(date: string | undefined | null): string {
  return toShanghaiTime(date || "");
}
