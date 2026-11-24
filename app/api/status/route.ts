import {NextResponse} from "next/server";import {env} from "@/lib/env";
export const dynamic="force-dynamic";
export async function GET(){return NextResponse.json({service:"pellet-plant-dashboard",ok:true,databaseMode:env.enabled?"historian":"demo",database:env.database,view:env.view,time:new Date().toISOString()},{headers:{"Cache-Control":"no-store"}})}
