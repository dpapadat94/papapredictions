export const availableYears = Array.from(
  { length: 2040 - 2015 + 1 },
  (_, index) => String(2015 + index),
);
