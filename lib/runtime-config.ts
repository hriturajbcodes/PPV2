import "server-only";
import { TAGS } from "@/config/tags";
import { THRESHOLDS } from "@/config/thresholds";

export interface RuntimeThresholds {
  dayProductionTarget:number;
  gp3Setpoint:number;
  moistureOkMax:number;
  moistureWarningMax:number;
  binStarvingBelow:number;
  binLowBelow:number;
  binNormalMax:number;
  staleAfterSeconds:number;
}

let runtime:RuntimeThresholds={
  dayProductionTarget:THRESHOLDS.dayProductionTarget,
  gp3Setpoint:THRESHOLDS.gp3Setpoint,
  moistureOkMax:THRESHOLDS.moisture.okMax,
  moistureWarningMax:THRESHOLDS.moisture.warningMax,
  binStarvingBelow:THRESHOLDS.bins.starvingBelow,
  binLowBelow:THRESHOLDS.bins.lowBelow,
  binNormalMax:THRESHOLDS.bins.normalMax,
  staleAfterSeconds:THRESHOLDS.staleAfterSeconds
};

export function getRuntimeConfig(){
  return {thresholds:{...runtime},tags:TAGS};
}

export function updateRuntimeThresholds(input:Partial<RuntimeThresholds>){
  const next={...runtime,...input};
  if(next.binStarvingBelow<0||next.binLowBelow<=next.binStarvingBelow||next.binNormalMax<=next.binLowBelow||next.binNormalMax>100)
    throw new Error("Invalid bin threshold order");
  if(next.moistureOkMax<0||next.moistureWarningMax<=next.moistureOkMax)
    throw new Error("Invalid moisture thresholds");
  if(next.staleAfterSeconds<5||next.staleAfterSeconds>3600)
    throw new Error("Stale limit must be 5–3600 seconds");
  runtime=next;
  return getRuntimeConfig();
}
