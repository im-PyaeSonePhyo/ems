import dayjs from "dayjs";

export const calculateDaysRequested = (startDate, endDate, halfDay = {}) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  let days = end.diff(start, "day") + 1;

  if (halfDay.type === "start" || halfDay.type === "end") {
    days -= 0.5;
  }

  return days;
};
