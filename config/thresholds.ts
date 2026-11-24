export const THRESHOLDS = {
  dayProductionTarget: 15000,
  dayProductionRangeMax: 16000,
  gp3Setpoint: 440,
  feedRangeMax: 500,
  moisture: {
    okMax: 10,
    warningMax: 11.5
  },
  bins: {
    starvingBelow: 15,
    lowBelow: 25,
    normalMax: 80
  },
  staleAfterSeconds: 60
} as const;
