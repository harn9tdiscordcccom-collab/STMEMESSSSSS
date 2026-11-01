import admin from "firebase-admin";
function firebaseAdmin(){
  if(!admin.apps.length){
    const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if(!raw)throw new Error("Missing Firebase service account");
    admin.initializeApp({credential:admin.credential.cert(JSON.parse(raw))});
  }
  return admin;
}
export default async req=>{
  if(req.method!=="GET")return new Response("Method not allowed",{status:405});
  const token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
  if(!token)return Response.json({error:"Sign in required"},{status:401});
  try{
    const fb=firebaseAdmin();
    const decoded=await fb.auth().verifyIdToken(token);
    const adminEmail=(process.env.ADMIN_EMAIL||"").toLowerCase().trim();
    if(!adminEmail||String(decoded.email||"").toLowerCase()!==adminEmail)
      return Response.json({error:"This account is not authorized as the STMEM administrator."},{status:403});
    const snap=await fb.firestore().collection("visitor_events").orderBy("createdAt","desc").limit(500).get();
    const visitors=snap.docs.map(d=>{
      const x=d.data();
      return {id:d.id,createdAt:x.createdAt?.toDate?.().toISOString()||new Date().toISOString(),
        ipAddress:x.ipAddress||null,device:x.device||"Unknown",browser:x.browser||"Unknown",
        operatingSystem:x.operatingSystem||"Unknown",screenSize:x.screenSize||"Unknown",language:x.language||""};
    });
    return Response.json({visitors});
  }catch(e){
    // Keep secrets out of the browser response; the detailed cause is available in Netlify function logs.
    console.error("STMEM admin-visitors failure:", e?.code || "unknown", e?.message || e);
    const message = !process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      ? "Missing FIREBASE_SERVICE_ACCOUNT_JSON environment variable."
      : (e?.message?.includes("JSON") || e instanceof SyntaxError)
        ? "FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON."
        : "Firebase verification or Firestore query failed. Check the Netlify function logs and service-account project permissions.";
    return Response.json({error: message}, {status:500});
  }
};
