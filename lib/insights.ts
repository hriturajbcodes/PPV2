import { TAGS } from "@/config/tags";
import { THRESHOLDS } from "@/config/thresholds";
import { binSummary, reading } from "@/lib/presentation";
import type { DashboardSnapshot } from "@/lib/types";

export type InsightSeverity="NORMAL"|"WATCH"|"ACTION";
export interface InsightItem{ id:string; title:string; detail:string; severity:InsightSeverity; metric:string }
export interface InsightsPayload{
  generatedAt:string; source:"historian"|"demo";
  scorecard:{productionProgress:number|null;feedDeviation:number|null;moisture:number|null;binSpread:number|null;reportingBins:number};
  items:InsightItem[];
}

export function deriveInsights(s:DashboardSnapshot):InsightsPayload{
 const prod=reading(s,TAGS.dayProduction),feed=reading(s,TAGS.gp3Feed),moist=reading(s,TAGS.moistureMo2),bins=binSummary(s);
 const valid=bins.rows.filter(x=>x.value!==null&&x.quality==="GOOD").map(x=>x.value as number);
 const spread=valid.length?Math.max(...valid)-Math.min(...valid):null;
 const progress=prod.value===null?null:prod.value/THRESHOLDS.dayProductionTarget*100;
 const deviation=feed.value===null?null:feed.value-THRESHOLDS.gp3Setpoint;
 const items:InsightItem[]=[];
 if(progress!==null)items.push({id:"production",title:progress>=100?"Production target achieved":"Production target progress",detail:`Current day production is ${progress.toFixed(1)}% of the 15,000 MT target.`,severity:progress>=100?"NORMAL":progress<60?"WATCH":"NORMAL",metric:"Production"});
 if(deviation!==null)items.push({id:"feed",title:"GP-3 feed stability",detail:`Primary feed is ${Math.abs(deviation).toFixed(1)} TPH ${deviation>=0?"above":"below"} the 440 TPH setpoint.`,severity:Math.abs(deviation)>=60?"ACTION":Math.abs(deviation)>=30?"WATCH":"NORMAL",metric:"Feed"});
 if(moist.value!==null)items.push({id:"moisture",title:"Moisture condition",detail:`MO-2 is ${moist.value.toFixed(1)}%.`,severity:moist.value>11.5?"ACTION":moist.value>=10?"WATCH":"NORMAL",metric:"Moisture"});
 if(spread!==null)items.push({id:"bins",title:"B–L bin distribution",detail:`Current max-to-min bin spread is ${spread.toFixed(1)} percentage points across ${valid.length} reporting bins.`,severity:spread>=50?"ACTION":spread>=30?"WATCH":"NORMAL",metric:"Bins"});
 if(bins.starving.length)items.push({id:"starvation",title:"Starvation exposure",detail:`${bins.starving.length} bin${bins.starving.length>1?"s are":" is"} below 15%.`,severity:"ACTION",metric:"Bins"});
 if(bins.reporting<11)items.push({id:"quality",title:"Incomplete bin telemetry",detail:`${bins.reporting} of 11 B–L bins currently have GOOD data quality.`,severity:bins.reporting<8?"ACTION":"WATCH",metric:"Data quality"});
 return {generatedAt:new Date().toISOString(),source:s.source,scorecard:{productionProgress:progress,feedDeviation:deviation,moisture:moist.value,binSpread:spread,reportingBins:bins.reporting},items};
}
