import {NextRequest,NextResponse} from "next/server"; import {adminCookieName,validToken} from "@/lib/admin-auth"; import {getRuntimeConfig,updateRuntimeThresholds} from "@/lib/runtime-config";
function allowed(req:NextRequest){return validToken(req.cookies.get(adminCookieName())?.value)}
export async function GET(req:NextRequest){if(!allowed(req))return NextResponse.json({error:"Unauthorized"},{status:401});return NextResponse.json(getRuntimeConfig())}
export async function PATCH(req:NextRequest){if(!allowed(req))return NextResponse.json({error:"Unauthorized"},{status:401});try{const body=await req.json();return NextResponse.json(updateRuntimeThresholds(body.thresholds??{}))}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Invalid configuration"},{status:400})}}
