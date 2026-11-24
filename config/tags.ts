export const TAGS = {
  dayProduction: "DAY PRODUCTION",
  gp3Feed: "GP-3 FEED",
  returnFeed: "TG ACTUAL FEED",
  moistureMo2: "MOISTURE ANAYZER MO2",
  bins: {
    B: "B BALLING DISC BIN",
    C: "C BALLING DISC BIN",
    D: "D BALLING DISC BIN",
    E: "E BALLING DISC BIN",
    F: "F BALLING DISC BIN",
    G: "G BALLING DISC BIN",
    H: "H BALLING DISC BIN",
    I: "I BALLING DISC BIN",
    J: "J BALLING DISC BIN",
    K: "K BALLING DISC BIN",
    L: "L BALLING DISC BIN"
  }
} as const;

export const ALL_TAGS = [
  TAGS.dayProduction,
  TAGS.gp3Feed,
  TAGS.returnFeed,
  TAGS.moistureMo2,
  ...Object.values(TAGS.bins)
] as const;
