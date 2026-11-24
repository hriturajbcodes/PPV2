import { TAGS } from "@/config/tags";
import { THRESHOLDS } from "@/config/thresholds";
import { binSummary, reading } from "@/lib/presentation";
import type { DashboardSnapshot } from "@/lib/types";

export type AlarmSeverity = "WARNING" | "CRITICAL";
export interface Alarm {
  id: string;
  severity: AlarmSeverity;
  title: string;
  message: string;
  tag?: string;
}

export function evaluateAlarms(snapshot: DashboardSnapshot | null): Alarm[] {
  if (!snapshot) return [];
  const alarms: Alarm[] = [];
  const add = (a: Alarm) => alarms.push(a);

  if (snapshot.state === "DATA_UNAVAILABLE") {
    add({id:"system-data-unavailable",severity:"CRITICAL",title:"Historian unavailable",message:"No current historian data is available."});
  }

  const moisture=reading(snapshot,TAGS.moistureMo2);
  if(moisture.quality==="STALE") add({id:"moisture-stale",severity:"WARNING",title:"Moisture data stale",message:"MO-2 has exceeded the stale-data limit.",tag:TAGS.moistureMo2});
  if(moisture.value!==null && moisture.quality==="GOOD"){
    if(moisture.value>THRESHOLDS.moisture.warningMax) add({id:"moisture-high",severity:"CRITICAL",title:"High moisture",message:`MO-2 is ${moisture.value.toFixed(1)}% (>11.5%).`,tag:TAGS.moistureMo2});
    else if(moisture.value>=THRESHOLDS.moisture.okMax) add({id:"moisture-warning",severity:"WARNING",title:"Moisture warning",message:`MO-2 is ${moisture.value.toFixed(1)}% (10–11.5%).`,tag:TAGS.moistureMo2});
  }

  const gp=reading(snapshot,TAGS.gp3Feed);
  if(gp.quality==="STALE") add({id:"gp3-stale",severity:"WARNING",title:"GP-3 feed data stale",message:"Primary feed value is stale.",tag:TAGS.gp3Feed});
  if(gp.value!==null && gp.quality==="GOOD"){
    const deviation=Math.abs(gp.value-THRESHOLDS.gp3Setpoint);
    if(deviation>=60) add({id:"gp3-deviation",severity:"WARNING",title:"GP-3 feed deviation",message:`Feed is ${deviation.toFixed(1)} TPH away from the 440 TPH setpoint.`,tag:TAGS.gp3Feed});
  }

  for(const bin of binSummary(snapshot).rows){
    if(bin.quality==="STALE") add({id:`bin-${bin.name}-stale`,severity:"WARNING",title:`Bin ${bin.name} stale`,message:"Bin level data is stale.",tag:bin.tag});
    if(bin.state==="starving") add({id:`bin-${bin.name}-starving`,severity:"CRITICAL",title:`Bin ${bin.name} starving`,message:`Level is ${bin.value?.toFixed(1)}% (<15%).`,tag:bin.tag});
    if(bin.state==="low") add({id:`bin-${bin.name}-low`,severity:"WARNING",title:`Bin ${bin.name} low`,message:`Level is ${bin.value?.toFixed(1)}% (15–25%).`,tag:bin.tag});
    if(bin.state==="overfeed") add({id:`bin-${bin.name}-overfeed`,severity:"CRITICAL",title:`Bin ${bin.name} overfeed`,message:`Level is ${bin.value?.toFixed(1)}% (>80%).`,tag:bin.tag});
  }
  return alarms;
}
