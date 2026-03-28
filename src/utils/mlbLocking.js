export function getMLBLockDeadline(year) {
  const numericYear = Number(year);

  if (numericYear <= 2025) {
    return null;
  }

  return new Date(`${numericYear}-04-15T23:59:59`);
}

export function isPastMLBDeadline(year) {
  const deadline = getMLBLockDeadline(year);

  if (!deadline) {
    return false;
  }

  return new Date() > deadline;
}

export function isPredictionLocked(prediction, year) {
  if (prediction?.is_locked) {
    return true;
  }

  return isPastMLBDeadline(year);
}
