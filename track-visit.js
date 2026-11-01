import admin from "firebase-admin";
function firebaseAdmin(){
  if(!admin.apps.length){
    const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if(!raw) throw new Error("Missing Firebase service account");
    admin.initializeApp({credential:admin.credential.cert(JSON.parse(raw))});
  }
  return admin;
}
function parseAgent(ua=""){
  let browser="Unknown";
  if(/Edg\//.test(ua))browser="Edge";else if(/OPR\//.test(ua))browser="Opera";else if(/Chrome\//.test(ua))browser="Chrome";else if(/Firefox\//.test(ua))browser="Firefox";else if(/Safari\//.test(ua))browser="Safari";
  let os="Unknown";
  if(/Windows/.test(ua))os="Windows";else if(/Android/.test(ua))os="Android";else if(/iPhone|iPad|iOS/.test(ua))os="iOS";else if(/Mac OS/.test(ua))os="macOS";else if(/Linux/.test(ua))os="Linux";
  return {browser,os};
}
export default async req=>{
  if(req.method!=="POST")return new Response("Method not allowed",{status:405});
  let body;try{body=await req.json();}catch{return Response.json({error:"Invalid request"},{status:400});}
  const ua=String(body.userAgent||"").slice(0,1000);
  const ip=req.headers.get("x-nf-client-connection-ip")||(req.headers.get("x-forwarded-for")||"").split(",")[0].trim()||null;
  const {browser,os}=parseAgent(ua);
  try{
    const fb=firebaseAdmin();
    await fb.firestore().collection("visitor_events").add({
      createdAt:fb.firestore.FieldValue.serverTimestamp(),ipAddress:ip,
      userAgent:ua,browser,operatingSystem:os,
      device:["Mobile","Tablet","Desktop"].includes(body.device)?body.device:"Unknown",
      screenSize:String(body.screen||"").slice(0,30),
      language:String(body.language||"").slice(0,40)
    });
    return Response.json({ok:true},{status:201});
  }catch(e){return Response.json({error:"Could not record visit. Check server configuration."},{status:500});}
};
