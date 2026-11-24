import { NextRequest, NextResponse } from "next/server";
import { defaultWindow, getTrend, type TrendMetric, type TrendRange } from "@/lib/trends";

export const dynamic="force-dynamic";

export async function GET(req:NextRequest){
  const q=req.nextUrl.searchParams;
  const metric=(q.get("metric")??"moisture") as TrendMetric;
  const range=(q.get("range")??"live") as TrendRange;
  if(!["moisture","production"].includes(metric) || !["live","daily","custom"].includes(range))
    return NextResponse.json({error:"Invalid trend query"},{status:400});

  let {from,to}=defaultWindow(range);
  if(range==="custom"){
    const f=q.get("from"),t=q.get("to");
    if(!f||!t) return NextResponse.json({error:"Custom range requires from and to"},{status:400});
    from=new Date(f);to=new Date(t);
    if(Number.isNaN(from.getTime())||Number.isNaN(to.getTime())||from>=to)
      return NextResponse.json({error:"Invalid custom range"},{status:400});
    if(to.getTime()-from.getTime()>31*24*3600_000)
      return NextResponse.json({error:"Custom range is limited to 31 days"},{status:400});
  }

  try{return NextResponse.json(await getTrend(metric,range,from,to),{headers:{"Cache-Control":"no-store"}})}
  catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Trend query failed"},{status:503})}
}
