import "server-only";
import sql from "mssql";
import { env } from "@/lib/env";
import { TAGS } from "@/config/tags";

export type TrendMetric = "moisture" | "production";
export type TrendRange = "live" | "daily" | "custom";
export interface TrendPoint { timestamp: string; value: number | null }
export interface TrendPayload {
  metric: TrendMetric;
  range: TrendRange;
  source: "historian" | "demo";
  from: string;
  to: string;
  points: TrendPoint[];
}

let poolPromise: Promise<sql.ConnectionPool> | null = null;
function pool() {
  if (!env.username || !env.password) throw new Error("SQL credentials are not configured");
  if (!poolPromise) poolPromise = new sql.ConnectionPool({
    server: env.host, port: env.port, database: env.database,
    user: env.username, password: env.password,
    options:{encrypt:env.encrypt,trustServerCertificate:env.trustCert},
    pool:{min:0,max:5,idleTimeoutMillis:30000},connectionTimeout:8000,requestTimeout:20000
  }).connect().catch(e=>{poolPromise=null;throw e});
  return poolPromise;
}

function metricTag(metric: TrendMetric) {
  return metric === "moisture" ? TAGS.moistureMo2 : TAGS.dayProduction;
}

export function defaultWindow(range: TrendRange) {
  const to = new Date();
  if (range === "live") return { from:new Date(to.getTime()-40_000), to };
  // Daily means current calendar day in IST. Convert IST midnight to UTC.
  const ist = new Date(to.getTime()+330*60_000);
  const from = new Date(Date.UTC(ist.getUTCFullYear(),ist.getUTCMonth(),ist.getUTCDate())-330*60_000);
  return {from,to};
}

function downsample(points: TrendPoint[], max=1200) {
  if (points.length<=max) return points;
  const step=Math.ceil(points.length/max);
  const out:TrendPoint[]=[];
  for(let i=0;i<points.length;i+=step){
    const chunk=points.slice(i,i+step);
    const valid=chunk.filter(x=>x.value!==null);
    out.push({
      timestamp:chunk[Math.floor(chunk.length/2)].timestamp,
      value:valid.length?valid.reduce((a,b)=>a+(b.value??0),0)/valid.length:null
    });
  }
  return out;
}

export async function getTrend(metric:TrendMetric, range:TrendRange, from:Date, to:Date):Promise<TrendPayload>{
  if(!env.enabled) return {metric,range,source:"demo",from:from.toISOString(),to:to.toISOString(),points:[]};
  const db=await pool();
  const result=await db.request()
    .input("tag",sql.NVarChar(255),metricTag(metric))
    .input("from",sql.DateTime2,from)
    .input("to",sql.DateTime2,to)
    .query(`
      SELECT ts_utc, TRY_CONVERT(float, tag_value) AS numeric_value
      FROM ${env.view}
      WHERE asset_path='pp'
        AND tag_name=@tag
        AND ts_utc>=@from AND ts_utc<=@to
      ORDER BY ts_utc ASC;
    `);
  const raw=(result.recordset as Array<{ts_utc:Date;numeric_value:number|null}>)
    .map(r=>({timestamp:new Date(r.ts_utc).toISOString(),value:r.numeric_value===null?null:Number(r.numeric_value)}));

  // Preserve real historian gaps: insert null separators when interval jumps materially.
  const withGaps:TrendPoint[]=[];
  const expected = range==="live" ? 6000 : 120000;
  for(let i=0;i<raw.length;i++){
    if(i>0){
      const gap=new Date(raw[i].timestamp).getTime()-new Date(raw[i-1].timestamp).getTime();
      if(gap>expected) withGaps.push({timestamp:new Date(new Date(raw[i-1].timestamp).getTime()+1).toISOString(),value:null});
    }
    withGaps.push(raw[i]);
  }
  return {metric,range,source:"historian",from:from.toISOString(),to:to.toISOString(),points:downsample(withGaps)};
}
