import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
 const firebaseConfig = {
    apiKey: "AIzaSyBktONweTstK0jdTJCIvTNVIGSJReI9yZw",
    authDomain: "stmem-14f92.firebaseapp.com",
    projectId: "stmem-14f92",
    storageBucket: "stmem-14f92.firebasestorage.app",
    messagingSenderId: "568380212799",
    appId: "1:568380212799:web:993f2fac364d3b51525a8a",
    measurementId: "G-9LWD8F31LD"
  };
const configured=!firebaseConfig.apiKey.startsWith("PASTE_")&&!firebaseConfig.projectId.startsWith("PASTE_");
const $=id=>document.getElementById(id);
const say=(s,bad=false)=>{$("admin-message").textContent=s;$("admin-message").className="message "+(bad?"error":"success");};
let auth=null,records=[];
if(configured){auth=getAuth(initializeApp(firebaseConfig));}else say("Paste your Firebase web app config into public/admin.js.",true);
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
async function load(user){
  if(!user){$("admin-status").textContent="Not signed in";say("Sign in on the main page first.",true);return;}
  $("admin-status").textContent="Verifying administrator access…";
  $("admin-email").textContent=user.email||"";
  try{
    const token=await user.getIdToken();
    const res=await fetch("/.netlify/functions/admin-visitors",{headers:{Authorization:`Bearer ${token}`}});
    const data=await res.json();
    if(!res.ok){$("admin-status").textContent="Access denied";say(data.error||"Not authorized.",true);return;}
    $("admin-status").textContent="ADMIN ACCESS GRANTED";
    records=data.visitors||[];
    $("total").textContent=records.length;
    $("recent").textContent=records.filter(x=>Date.now()-Date.parse(x.createdAt)<86400000).length;
    $("visitor-rows").innerHTML=records.length?records.map(r=>`<tr><td>${esc(new Date(r.createdAt).toLocaleString())}</td><td>${esc(r.ipAddress||"Unavailable")}</td><td>${esc(r.device||"Unknown")}</td><td>${esc((r.browser||"Unknown")+" / "+(r.operatingSystem||"Unknown"))}</td><td>${esc(r.screenSize||"Unknown")}</td></tr>`).join(""):"<tr><td colspan='5'>No consented visits yet.</td></tr>";
    $("export").disabled=!records.length;say(`Loaded ${records.length} consented visitor record(s).`);
  }catch(e){say(`Admin request failed: ${e.message||e}. Check that the Netlify function is deployed.`,true);}
}
let currentUser=null;
if(auth) onAuthStateChanged(auth,user=>{currentUser=user;load(user);});
$("refresh").addEventListener("click",()=>load(currentUser));
$("export").addEventListener("click",()=>{
  const cols=["createdAt","ipAddress","device","browser","operatingSystem","screenSize","language"];
  const csv=[cols.join(","),...records.map(r=>cols.map(k=>'"'+String(r[k]??"").replace(/"/g,'""')+'"').join(","))].join("\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="stmem-visitors.csv";a.click();URL.revokeObjectURL(a.href);
});
