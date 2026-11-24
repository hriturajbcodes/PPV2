import {NextRequest,NextResponse} from "next/server";
import {adminCookieName,expectedPassword,makeToken} from "@/lib/admin-auth";
export async function POST(req:NextRequest){
 const body=await req.json().catch(()=>({}));
 if(body.password!==expectedPassword()) return NextResponse.json({ok:false,error:"Invalid password"},{status:401});
 const res=NextResponse.json({ok:true});
 res.cookies.set(adminCookieName(),makeToken(),{httpOnly:true,sameSite:"strict",secure:process.env.NODE_ENV==="production",path:"/",maxAge:8*3600});
 return res;
}
