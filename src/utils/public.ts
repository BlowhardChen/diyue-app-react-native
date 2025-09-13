/**
 * 获取当前日期
 * @returns string
 */
export const getNowDate = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  // 补零函数
  const addLeadingZero = (value: number): string => {
    return value < 10 ? "0" + value : value.toString();
  };

  // 补零处理
  month = Number(addLeadingZero(month));
  day = Number(addLeadingZero(day));

  const time = `${year}-${month}-${day} `;
  return time;
};
