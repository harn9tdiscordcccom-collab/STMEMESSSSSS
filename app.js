import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// Paste your Firebase web app config here (Firebase Console > Project settings > Your apps).
 const firebaseConfig = {
    apiKey: "AIzaSyBktONweTstK0jdTJCIvTNVIGSJReI9yZw",
    authDomain: "stmem-14f92.firebaseapp.com",
    projectId: "stmem-14f92",
    storageBucket: "stmem-14f92.firebasestorage.app",
    messagingSenderId: "568380212799",
    appId: "1:568380212799:web:993f2fac364d3b51525a8a",
    measurementId: "G-9LWD8F31LD"
  };
const configured = !firebaseConfig.apiKey.startsWith("PASTE_") && !firebaseConfig.projectId.startsWith("PASTE_");
const $ = id => document.getElementById(id);
const say = (s,bad=false) => { $("message").textContent=s; $("message").className="message "+(bad?"error":"success"); };
let auth = null;
if (configured) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} else say("Setup needed: paste your Firebase web app config into public/app.js.", true);

async function recordVisit() {
  if (localStorage.getItem("stmem-analytics-consent") !== "yes") return;
  const ua=navigator.userAgent||"";
  const info={
    userAgent:ua, platform:navigator.platform||"Unknown",
    language:navigator.language||"Unknown",
    screen:`${screen.width}x${screen.height}`,
    device:/Mobi|Android/i.test(ua)?"Mobile":/Tablet|iPad/i.test(ua)?"Tablet":"Desktop"
  };
  try {
    await fetch("/.netlify/functions/track-visit", {
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify(info),keepalive:true
    });
  } catch (_) {}
}
$("accept-consent").addEventListener("click",async()=>{
  localStorage.setItem("stmem-analytics-consent","yes");
  $("consent").classList.add("hidden");
  await recordVisit();
});
$("decline-consent").addEventListener("click",()=>{
  localStorage.setItem("stmem-analytics-consent","no");
  $("consent").classList.add("hidden");
});
if (localStorage.getItem("stmem-analytics-consent")) $("consent").classList.add("hidden");
else $("consent").classList.remove("hidden");
if (localStorage.getItem("stmem-analytics-consent")==="yes") recordVisit();

$("google-btn").addEventListener("click",async()=>{
  if(!auth)return say("Complete Firebase setup first.",true);
  try { await signInWithPopup(auth,new GoogleAuthProvider()); }
  catch(e){say(e.message,true);}
});
$("email-form").addEventListener("submit",async e=>{
  e.preventDefault(); if(!auth)return say("Complete Firebase setup first.",true);
  try { await signInWithEmailAndPassword(auth,$("email").value.trim(),$("password").value); }
  catch(err){say(err.message,true);}
});
$("signup-btn").addEventListener("click",async()=>{
  if(!auth)return say("Complete Firebase setup first.",true);
  try { await createUserWithEmailAndPassword(auth,$("email").value.trim(),$("password").value); say("Account created and signed in."); }
  catch(err){say(err.message,true);}
});
$("logout-btn").addEventListener("click",async()=>{if(auth)await signOut(auth);});
if(auth) onAuthStateChanged(auth,user=>{
  $("email-form").classList.toggle("hidden",!!user);
  $("google-btn").classList.toggle("hidden",!!user);
  document.querySelector(".or").classList.toggle("hidden",!!user);
  $("user-area").classList.toggle("hidden",!user);
  if(user){
    $("user-email").textContent=user.email||"Signed-in user";
    // The admin endpoint independently checks the account email on the server.
    $("admin-link").classList.remove("hidden");
  }
});
