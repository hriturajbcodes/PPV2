import {NextResponse} from "next/server"; import {getDashboardSnapshot} from "@/lib/dashboard-cache"; import {deriveInsights} from "@/lib/insights";
export const dynamic="force-dynamic";
export async function GET(){const snapshot=await getDashboardSnapshot();return NextResponse.json(deriveInsights(snapshot),{headers:{"Cache-Control":"no-store"}})}
