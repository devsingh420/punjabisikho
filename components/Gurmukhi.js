'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  signUp, logIn, logOut, resetPassword, resendVerification,
  checkVerified, getUserProfile, updateUserProfile,
  getProgress as fetchProgress, completeTask as fbCompleteTask,
  updateStreak as fbUpdateStreak, getAllStudents, onAuthChange
} from '../lib/authService';
import { auth } from '../lib/firebase';

// ═══════════════ CONSTANTS ═══════════════
const FACES=["🦁","🐯","🐼","🦊","🐨","🦋","🦄","🐙","🐝","🦜","🐳","🐸","🐶","🐱","🦘"];
const COLORS=['#FF9500','#FF2D55','#5856D6','#34C759','#5AC8FA','#AF52DE','#FFCC00','#FF6B35','#FF3B30','#007AFF'];

const L=[
  {g:"ੳ",r:"Ura",s:"oo",d:"Vowel helper — holds 'oo' sounds 🌙"},
  {g:"ਅ",r:"Airā",s:"a",d:"Vowel helper — the 'a' in 'about' ☀️"},
  {g:"ੲ",r:"Īṛī",s:"ee",d:"Vowel helper — holds 'ee' sounds 🌟"},
  {g:"ਸ",r:"Sassā",s:"s",d:"Hiss like a snake — 'sun' 🐍"},
  {g:"ਹ",r:"Hāhā",s:"h",d:"A gentle breath — 'hat' 😮‍💨"},
  {g:"ਕ",r:"Kakkā",s:"k",d:"Pop from the back — 'kite' 🪁"},
  {g:"ਖ",r:"Khakhā",s:"kh",d:"K with a puff! 💨"},
  {g:"ਗ",r:"Gaggā",s:"g",d:"Buzz in your throat — 'go' 🏃"},
  {g:"ਘ",r:"Ghaggā",s:"gh",d:"G with a big breath out 🌬️"},
  {g:"ਙ",r:"Ngangā",s:"ng",d:"Like the end of 'sing' 🎵"},
  {g:"ਚ",r:"Chachchā",s:"ch",d:"Tongue up — 'chair' 🪑"},
  {g:"ਛ",r:"Chhachchhā",s:"chh",d:"Ch with extra air! 🌊"},
  {g:"ਜ",r:"Jajjā",s:"j",d:"Jump with your tongue — 'jump' 🦘"},
  {g:"ਝ",r:"Jhajjhā",s:"jh",d:"J while blowing candles 🕯️"},
  {g:"ਞ",r:"Nyanyā",s:"ny",d:"Like Spanish 'señor' 💃"},
  {g:"ਟ",r:"Ṭainkā",s:"ṭ",d:"Curl tongue back — strong T 💪"},
  {g:"ਠ",r:"Ṭhaṭṭhā",s:"ṭh",d:"Strong T with a puff 🔥"},
  {g:"ਡ",r:"Ḍaddā",s:"ḍ",d:"Curl tongue back — bold D 🥁"},
  {g:"ਢ",r:"Ḍhaddā",s:"ḍh",d:"Bold D with extra breath 💥"},
  {g:"ਣ",r:"Ṇāṇā",s:"ṇ",d:"N with curled tongue 🔄"},
  {g:"ਤ",r:"Tattā",s:"t",d:"Gentle T — tongue on teeth 🌸"},
  {g:"ਥ",r:"Thaththā",s:"th",d:"Gentle T plus a puff 🍃"},
  {g:"ਦ",r:"Daddā",s:"d",d:"D on your teeth — soft buzz 🐝"},
  {g:"ਧ",r:"Dhaddā",s:"dh",d:"Soft D with extra air 🌈"},
  {g:"ਨ",r:"Nannā",s:"n",d:"Friendly N — like 'now' 👋"},
  {g:"ਪ",r:"Pappā",s:"p",d:"Lips pop! Like 'pen' ✏️"},
  {g:"ਫ",r:"Phaphphā",s:"ph",d:"P with a puff — NOT 'F' 😤"},
  {g:"ਬ",r:"Babbā",s:"b",d:"Lips buzz — 'ball' ⚽"},
  {g:"ਭ",r:"Bhabbhā",s:"bh",d:"B with a big puff 💨"},
  {g:"ਮ",r:"Mammā",s:"m",d:"Humming — 'mom' 🤱"},
  {g:"ਯ",r:"Yayyā",s:"y",d:"Tongue up — 'yes!' ✅"},
  {g:"ਰ",r:"Rārā",s:"r",d:"Quick tongue tap 🥁"},
  {g:"ਲ",r:"Lallā",s:"l",d:"Tongue up — 'love' ❤️"},
  {g:"ਵ",r:"Vavvā",s:"v",d:"Between V and W 🫧"},
  {g:"ੜ",r:"Ṛāṛā",s:"ṛ",d:"Flap! Uniquely Punjabi 🇮🇳"},
];
const WORDS=[
  {w:"ਜਲ",t:"jal",m:"water",e:"💧",l:["ਜ","ਲ"]},
  {w:"ਘਰ",t:"ghar",m:"home",e:"🏠",l:["ਘ","ਰ"]},
  {w:"ਕਮਲ",t:"kamal",m:"lotus",e:"🪷",l:["ਕ","ਮ","ਲ"]},
  {w:"ਨਮਕ",t:"namak",m:"salt",e:"🧂",l:["ਨ","ਮ","ਕ"]},
  {w:"ਕਲਮ",t:"kalam",m:"pen",e:"🖊️",l:["ਕ","ਲ","ਮ"]},
  {w:"ਹਰ",t:"har",m:"every",e:"✨",l:["ਹ","ਰ"]},
  {w:"ਸਬਰ",t:"sabar",m:"patience",e:"🧘",l:["ਸ","ਬ","ਰ"]},
  {w:"ਨਗਰ",t:"nagar",m:"city",e:"🏙️",l:["ਨ","ਗ","ਰ"]},
];
const SENTS=[
  {p:["ਮੇਰਾ","ਨਾਮ","ਗੁਰੂ","ਹੈ"],m:"My name is Guru"},
  {p:["ਪਾਣੀ","ਠੰਡਾ","ਹੈ"],m:"The water is cold"},
  {p:["ਇਹ","ਫੁੱਲ","ਸੋਹਣਾ","ਹੈ"],m:"This flower is beautiful"},
  {p:["ਸੂਰਜ","ਚਮਕਦਾ","ਹੈ"],m:"The sun shines"},
];
const MAATRA=[
  {n:"Kannā",sym:"ਾ",snd:"aa",ex:[{w:"ਕਾਮ",m:"work"},{w:"ਨਾਮ",m:"name"}]},
  {n:"Sihari",sym:"ਿ",snd:"i",ex:[{w:"ਦਿਲ",m:"heart"},{w:"ਮਿਲ",m:"meet"}]},
  {n:"Bihari",sym:"ੀ",snd:"ee",ex:[{w:"ਨਦੀ",m:"river"},{w:"ਪਾਣੀ",m:"water"}]},
  {n:"Aunkarh",sym:"ੁ",snd:"u",ex:[{w:"ਗੁਰ",m:"jaggery"},{w:"ਪੁਲ",m:"bridge"}]},
  {n:"Dulainkarh",sym:"ੂ",snd:"oo",ex:[{w:"ਫੂਲ",m:"flower"},{w:"ਸੂਰਜ",m:"sun"}]},
  {n:"Lāvāṅ",sym:"ੇ",snd:"e",ex:[{w:"ਸੇਬ",m:"apple"},{w:"ਖੇਤ",m:"field"}]},
  {n:"Dulāvāṅ",sym:"ੈ",snd:"ai",ex:[{w:"ਪੈਰ",m:"foot"},{w:"ਬੈਲ",m:"ox"}]},
  {n:"Hoṛā",sym:"ੋ",snd:"o",ex:[{w:"ਰੋਟੀ",m:"bread"},{w:"ਮੋਰ",m:"peacock"}]},
  {n:"Kanoṛā",sym:"ੌ",snd:"au",ex:[{w:"ਕੌਰ",m:"princess"},{w:"ਸੌ",m:"hundred"}]},
];
const CHS=[
  {id:1,t:"First Steps",tp:"ਪਹਿਲੇ ਕਦਮ",icon:"🌱",color:"#FF9500",tasks:[
    {id:"1a",ty:"meet",t:"Meet ੳ ਅ ੲ",xp:10,d:[0,1,2]},
    {id:"1b",ty:"quiz",t:"Sound Quiz",xp:15,d:[0,1,2,3,4]},
    {id:"1c",ty:"trace",t:"Trace Them!",xp:15,d:[0,1,2]},
    {id:"1d",ty:"meet",t:"ਸ ਹ ਕ ਖ ਗ",xp:10,d:[3,4,5,6,7]},
    {id:"1e",ty:"quiz",t:"Listen & Pick",xp:15,d:[3,4,5,6,7,8,9]},
    {id:"1f",ty:"meet",t:"ਚ ਜ ਟ ਤ ਪ",xp:10,d:[10,12,15,20,25]},
    {id:"1g",ty:"quiz",t:"Big Quiz!",xp:25,d:[0,1,2,3,5,6,10,12,15,20,25]},
    {id:"1h",ty:"meet",t:"ਮ ਯ ਰ ਲ ਵ ੜ",xp:10,d:[29,30,31,32,33,34]},
    {id:"1i",ty:"trace",t:"Trace Faves",xp:15,d:[5,12,25,29,32]},
  ]},
  {id:2,t:"First Words",tp:"ਪਹਿਲੇ ਸ਼ਬਦ",icon:"💬",color:"#FF2D55",tasks:[
    {id:"2a",ty:"word",t:"💧🏠✨",xp:10,d:[0,1,5]},
    {id:"2b",ty:"spell",t:"Spell It!",xp:20,d:[0,1,5]},
    {id:"2c",ty:"word",t:"🪷🧂🖊️",xp:10,d:[2,3,4]},
    {id:"2d",ty:"spell",t:"Spell More!",xp:20,d:[2,3,4,6,7]},
    {id:"2e",ty:"quiz_w",t:"Word Master",xp:25,d:[0,1,2,3,4,5,6,7]},
  ]},
  {id:3,t:"Maatra Magic",tp:"ਮਾਤਰਾ ਜਾਦੂ",icon:"✨",color:"#5856D6",tasks:[
    {id:"3a",ty:"maatra",t:"ਾ ਿ ੀ",xp:15,d:[0,1,2]},
    {id:"3b",ty:"maatra",t:"ੁ ੂ ੇ ੈ",xp:15,d:[3,4,5,6]},
    {id:"3c",ty:"maatra",t:"ੋ ੌ",xp:15,d:[7,8]},
  ]},
  {id:4,t:"Reading",tp:"ਪੜ੍ਹੋ",icon:"📖",color:"#34C759",tasks:[
    {id:"4a",ty:"read",t:"My Name",xp:15,d:0},
    {id:"4b",ty:"read",t:"Cold Water",xp:15,d:1},
    {id:"4c",ty:"read",t:"Beautiful!",xp:15,d:2},
    {id:"4d",ty:"read",t:"Sunshine",xp:15,d:3},
  ]},
];
const TOTAL=CHS.reduce((s,c)=>s+c.tasks.length,0);
const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=0|Math.random()*(i+1);[b[i],b[j]]=[b[j],b[i]]}return b};

// ═══════════════ SOUND SYSTEM (FIX #1) ═══════════════
// Voices load async. We cache them and only speak after user gesture.
let voicesLoaded = false;
let cachedVoice = null;
const loadVoices = () => {
  if(typeof window==='undefined'||!('speechSynthesis' in window)) return;
  const voices = speechSynthesis.getVoices();
  cachedVoice = voices.find(v=>v.lang.startsWith('pa')) || voices.find(v=>v.lang.startsWith('hi')) || null;
  voicesLoaded = voices.length > 0;
};
const say = (text) => {
  if(typeof window==='undefined'||!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const doSpeak = () => {
    const voices = speechSynthesis.getVoices();
    if(voices.length === 0) { setTimeout(doSpeak, 200); return; }
    const paVoice = voices.find(v => v.lang.startsWith('pa'));
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pa-IN';
    u.rate = 0.55;
    u.pitch = 1.0;
    if(paVoice) u.voice = paVoice;
    speechSynthesis.speak(u);
  };
  doSpeak();
};

// ═══════════════ STYLES ═══════════════
const G = "'Noto Sans Gurmukhi', sans-serif"; // Gurmukhi font
const F = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"; // System font
const S = {
  card: {background:'#fff',borderRadius:20,padding:20,boxShadow:'0 2px 12px rgba(0,0,0,.04)'},
  input: {width:'100%',padding:'14px 18px',border:'2px solid rgba(0,0,0,.06)',borderRadius:14,fontFamily:'inherit',fontSize:15,fontWeight:500,outline:'none',background:'#fff',transition:'border-color .2s'},
  btn: {width:'100%',padding:16,border:'none',borderRadius:16,fontFamily:'inherit',fontSize:16,fontWeight:700,cursor:'pointer',transition:'all .2s'},
  btnPrimary: {background:'linear-gradient(135deg,#FF9500,#FF6B35)',color:'#fff',boxShadow:'0 6px 24px rgba(255,107,53,.25)'},
  btnDark: {background:'#1C1C1E',color:'#fff'},
  btnGreen: {background:'#34C759',color:'#fff',boxShadow:'0 4px 16px rgba(52,199,89,.25)'},
  btnGhost: {background:'#fff',color:'#1C1C1E',border:'2px solid rgba(0,0,0,.06)'},
  label: {display:'block',fontSize:12,fontWeight:700,color:'#8E8E93',textTransform:'uppercase',letterSpacing:1,marginBottom:6},
  link: {fontSize:14,fontWeight:600,color:'#FF9500',cursor:'pointer',background:'none',border:'none',fontFamily:'inherit',padding:0},
  // FIX #7: Proper back button with 44px minimum tap target
  backBtn: {display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6,minWidth:44,minHeight:44,padding:'8px 14px',borderRadius:12,border:'none',background:'rgba(0,0,0,.04)',cursor:'pointer',fontFamily:'inherit',fontSize:14,fontWeight:600,color:'#666',transition:'.2s'},
};

const CSS = `
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes scaleIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
@keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
@keyframes pop{from{transform:scale(0)}to{transform:scale(1)}}
@keyframes pulse2{0%{box-shadow:0 0 0 0 rgba(255,149,0,.3)}70%{box-shadow:0 0 0 14px rgba(255,149,0,0)}100%{box-shadow:0 0 0 0 rgba(255,149,0,0)}}
@keyframes particle{0%{opacity:1;transform:scale(0) translateY(0)}50%{opacity:1;transform:scale(1.2) translateY(-40px)}100%{opacity:0;transform:scale(.6) translateY(-80px) rotate(180deg)}}
@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
@keyframes drift{0%,100%{transform:translateY(0) rotate(var(--r))}50%{transform:translateY(-12px) rotate(calc(var(--r) + 10deg))}}
@media(min-width:860px){.g-layout{grid-template-columns:1fr 280px!important}.g-sb{display:block!important}}
body{font-family:${F};margin:0;background:#F2F2F7}
`;

// ═══════════════ SHARED COMPONENTS ═══════════════
const BG_ITEMS = [
  {c:'ੳ',x:5,y:5,s:40,r:-10,dur:12},{c:'ਅ',x:30,y:8,s:45,r:-7,dur:14},
  {c:'ੲ',x:55,y:3,s:50,r:-4,dur:16},{c:'ਸ',x:80,y:10,s:55,r:-1,dur:18},
  {c:'ਕ',x:8,y:35,s:60,r:2,dur:20},{c:'ਗ',x:35,y:40,s:48,r:5,dur:15},
  {c:'ਚ',x:60,y:32,s:53,r:8,dur:17},{c:'ਜ',x:85,y:38,s:43,r:11,dur:19},
  {c:'ਤ',x:10,y:65,s:58,r:14,dur:21},{c:'ਪ',x:40,y:70,s:46,r:17,dur:13},
  {c:'ਮ',x:65,y:62,s:51,r:20,dur:16},{c:'ਰ',x:88,y:68,s:44,r:23,dur:14},
];

const WarmBg = React.memo(() => (
  <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
    {BG_ITEMS.map((b,i)=><div key={i} style={{position:'absolute',fontFamily:G,fontWeight:900,fontSize:b.s,color:`rgba(255,149,0,${.03+i*.003})`,left:`${b.x}%`,top:`${b.y}%`,'--r':`${b.r}deg`,animation:`drift ${b.dur}s ease-in-out infinite`,userSelect:'none'}}>{b.c}</div>)}
    <div style={{position:'absolute',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,149,0,.06) 0%,transparent 70%)',top:'50%',left:'50%',transform:'translate(-50%,-50%)'}}/>
  </div>
));

const Shell = ({children}) => (
  <div style={{minHeight:'100dvh',display:'flex',alignItems:'center',justifyContent:'center',padding:24,background:'linear-gradient(165deg,#FFFAF5 0%,#FFF3E8 30%,#FFE8D6 60%,#FFF5EE 100%)',fontFamily:F,position:'relative',overflow:'hidden'}}>
    <WarmBg/>
    <div style={{maxWidth:440,width:'100%',position:'relative',zIndex:2,animation:'fadeIn .4s ease'}}>{children}</div>
  </div>
);

const Logo = React.memo(({size=80}) => (
  <div style={{textAlign:'center',marginBottom:24}}>
    <div style={{animation:'float 4s ease-in-out infinite',display:'inline-block'}}>
      <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:size,height:size,borderRadius:size*.28,background:'linear-gradient(135deg,#FF9500,#FF6B35)',boxShadow:'0 12px 40px rgba(255,107,53,.2)',fontSize:size*.52,fontFamily:G,fontWeight:900,color:'#fff'}}>ੳ</div>
    </div>
    <h1 style={{fontFamily:G,fontSize:28,fontWeight:800,color:'#1C1C1E',marginTop:10}}>ਗੁਰਮੁਖੀ</h1>
  </div>
));

const Particles = React.memo(({show}) => {
  if(!show) return null;
  return <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:9999}}>
    {Array.from({length:20},(_,i)=><div key={i} style={{position:'absolute',left:`${50+(Math.random()-.5)*60}%`,top:`${50+(Math.random()-.5)*40}%`,fontSize:8+Math.random()*16,animation:`particle 1s ease-out ${Math.random()*400}ms forwards`,opacity:0}}>{['⭐','✨','🌟','💫','🎉','🎊','❤️','🔥'][i%8]}</div>)}
  </div>;
});

// FIX #7: Proper back button component
const BackBtn = ({onClick, color='#666', label='Back'}) => (
  <button onClick={onClick} style={{...S.backBtn,color}}>
    <span style={{fontSize:16}}>←</span> {label}
  </button>
);

// FIX #10: Scroll to top helper
const scrollTop = () => window.scrollTo({top:0,behavior:'instant'});

// ═══════════════ AUTH FORMS (each has own state — no parent re-render) ═══════════════

function SignupForm({onDone, onSwitch}) {
  const [f,sF]=useState({fname:'',lname:'',email:'',pass:'',pass2:'',gender:'',dob:'',role:'student'});
  const [showP,setShowP]=useState(false);
  const [err,setErr]=useState({});
  const [loading,setLoading]=useState(false);
  const set=(k,v)=>sF(p=>({...p,[k]:v}));

  const go=async()=>{
    const e={};
    if(!f.fname.trim())e.fname='Required';if(!f.lname.trim())e.lname='Required';
    if(!f.email.trim())e.email='Required';else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))e.email='Invalid email';
    if(!f.pass)e.pass='Required';else if(f.pass.length<6)e.pass='Min 6 characters';
    if(f.pass!==f.pass2)e.pass2="Doesn't match";
    if(!f.gender)e.gender='Required';if(!f.dob)e.dob='Required';
    setErr(e);if(Object.keys(e).length)return;
    setLoading(true);
    try{await signUp({email:f.email,password:f.pass,fname:f.fname,lname:f.lname,gender:f.gender,dob:f.dob,role:f.role,face:'',color:'#FF9500'});onDone(f.email)}
    catch(ex){setErr({email:ex.code==='auth/email-already-in-use'?'Email already registered':ex.message})}
    setLoading(false);
  };

  const inp=(label,key,ph,type='text')=>(
    <div style={{marginBottom:14}}>
      <label style={S.label}>{label}</label>
      <input type={type==='password'?(showP?'text':'password'):type} value={f[key]} onChange={e=>set(key,e.target.value)} placeholder={ph} style={S.input}/>
      {err[key]&&<div style={{fontSize:13,color:'#FF3B30',marginTop:3}}>{err[key]}</div>}
    </div>
  );

  const sel=(label,key,opts)=>(
    <div style={{marginBottom:14}}>
      <label style={S.label}>{label}</label>
      <select value={f[key]} onChange={e=>set(key,e.target.value)} style={{...S.input,cursor:'pointer'}}>
        <option value="">Select...</option>
        {opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
      {err[key]&&<div style={{fontSize:13,color:'#FF3B30',marginTop:3}}>{err[key]}</div>}
    </div>
  );

  return <div style={{...S.card,padding:28,animation:'fadeIn .4s ease'}}>
    <h2 style={{fontSize:20,fontWeight:800,textAlign:'center',marginBottom:4}}>Create your account</h2>
    <p style={{textAlign:'center',fontSize:14,color:'#8E8E93',marginBottom:20}}>Start your Punjabi journey</p>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
      {inp('First Name','fname','Gurpreet')}
      {inp('Last Name','lname','Singh')}
    </div>
    {inp('Email','email','you@example.com','email')}
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
      {sel('Gender','gender',[{v:'male',l:'Male'},{v:'female',l:'Female'},{v:'other',l:'Other'}])}
      {inp('Date of Birth','dob','','date')}
    </div>
    {inp('Password','pass','Min 6 characters','password')}
    {inp('Confirm Password','pass2','Type again','password')}
    <label style={{display:'flex',alignItems:'center',gap:6,marginBottom:14,cursor:'pointer',fontSize:13,color:'#8E8E93'}}>
      <input type="checkbox" checked={showP} onChange={e=>setShowP(e.target.checked)} style={{accentColor:'#FF9500'}}/>Show passwords
    </label>
    {sel('I am a','role',[{v:'student',l:'Student 🎒'},{v:'teacher',l:'Teacher 👩‍🏫'},{v:'parent',l:'Parent 👨‍👩‍👧'}])}
    <button onClick={go} disabled={loading} style={{...S.btn,...(loading?{background:'#D1D1D6',boxShadow:'none'}:S.btnPrimary)}}>{loading?'Creating...':'Sign Up'}</button>
    <p style={{textAlign:'center',marginTop:16,fontSize:14,color:'#8E8E93'}}>Already have an account? <button onClick={onSwitch} style={S.link}>Log In</button></p>
  </div>;
}

function LoginForm({onForgot, onSwitch, onNeedVerify}) {
  const [email,setEmail]=useState('');const [pass,setPass]=useState('');
  const [showP,setShowP]=useState(false);const [err,setErr]=useState({});const [loading,setLoading]=useState(false);

  const go=async()=>{
    const e={};if(!email.trim())e.email='Required';if(!pass)e.pass='Required';
    setErr(e);if(Object.keys(e).length)return;
    setLoading(true);
    try{
      const u=await logIn(email,pass);
      if(!u.emailVerified){onNeedVerify(email);setLoading(false);return}
      // onAuthChange listener handles the rest
    }catch(ex){setErr({email:'Wrong email or password'})}
    setLoading(false);
  };

  return <div style={{...S.card,padding:28,animation:'fadeIn .4s ease'}}>
    <h2 style={{fontSize:20,fontWeight:800,textAlign:'center',marginBottom:4}}>Welcome back!</h2>
    <p style={{textAlign:'center',fontSize:14,color:'#8E8E93',marginBottom:20}}>Log in to continue learning</p>
    <div style={{marginBottom:14}}><label style={S.label}>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" style={S.input}/>{err.email&&<div style={{fontSize:13,color:'#FF3B30',marginTop:3}}>{err.email}</div>}</div>
    <div style={{marginBottom:14}}><label style={S.label}>Password</label><input type={showP?'text':'password'} value={pass} onChange={e=>setPass(e.target.value)} placeholder="Your password" style={S.input} onKeyDown={e=>{if(e.key==='Enter')go()}}/>{err.pass&&<div style={{fontSize:13,color:'#FF3B30',marginTop:3}}>{err.pass}</div>}</div>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
      <label style={{display:'flex',alignItems:'center',gap:6,fontSize:13,color:'#8E8E93',cursor:'pointer'}}><input type="checkbox" checked={showP} onChange={e=>setShowP(e.target.checked)} style={{accentColor:'#FF9500'}}/>Show</label>
      <button onClick={onForgot} style={S.link}>Forgot password?</button>
    </div>
    <button onClick={go} disabled={loading} style={{...S.btn,...(loading?{background:'#D1D1D6',boxShadow:'none'}:S.btnPrimary)}}>{loading?'Logging in...':'Log In'}</button>
    <p style={{textAlign:'center',marginTop:16,fontSize:14,color:'#8E8E93'}}>New here? <button onClick={onSwitch} style={S.link}>Create Account</button></p>
  </div>;
}

function ForgotForm({onBack}) {
  const [email,setEmail]=useState('');const [err,setErr]=useState('');const [msg,setMsg]=useState('');const [loading,setLoading]=useState(false);
  const go=async()=>{
    if(!email.trim()||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setErr('Enter a valid email');return}
    setLoading(true);setErr('');
    try{await resetPassword(email);setMsg('Reset link sent! Check your email.')}
    catch(e){setErr('Could not send reset email')}
    setLoading(false);
  };
  return <div style={{...S.card,padding:28,animation:'fadeIn .4s ease'}}>
    <h2 style={{fontSize:20,fontWeight:800,textAlign:'center',marginBottom:4}}>Reset password</h2>
    <p style={{textAlign:'center',fontSize:14,color:'#8E8E93',marginBottom:20}}>We'll send you a reset link</p>
    <div style={{marginBottom:14}}><label style={S.label}>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" style={S.input} onKeyDown={e=>{if(e.key==='Enter')go()}}/>{err&&<div style={{fontSize:13,color:'#FF3B30',marginTop:3}}>{err}</div>}</div>
    {msg&&<div style={{fontSize:13,color:'#34C759',textAlign:'center',marginBottom:12}}>{msg}</div>}
    <button onClick={go} disabled={loading} style={{...S.btn,...(loading?{background:'#D1D1D6',boxShadow:'none'}:S.btnPrimary)}}>{loading?'Sending...':'Send Reset Link'}</button>
    <p style={{textAlign:'center',marginTop:16,fontSize:14,color:'#8E8E93'}}>Remember it? <button onClick={onBack} style={S.link}>Log In</button></p>
  </div>;
}

function VerifyScreen({email:initEmail, onDone, onBack}) {
  const [msg,setMsg]=useState('');const [loading,setLoading]=useState(false);
  const em=initEmail||auth.currentUser?.email||'';
  const resend=async()=>{setLoading(true);try{await resendVerification();setMsg('Verification email resent!')}catch(e){}setLoading(false)};
  const check=async()=>{setLoading(true);const ok=await checkVerified();if(ok)onDone();else setMsg('Not verified yet. Check your inbox.');setLoading(false)};
  return <div style={{textAlign:'center',animation:'fadeIn .4s ease'}}>
    <div style={{fontSize:64,marginBottom:12}}>📬</div>
    <h2 style={{fontSize:22,fontWeight:800}}>Check your email!</h2>
    <p style={{fontSize:15,color:'#8E8E93',marginTop:6,lineHeight:1.6,maxWidth:340,margin:'6px auto 24px'}}>We sent a verification link to<br/><strong style={{color:'#1C1C1E'}}>{em}</strong></p>
    {msg&&<div style={{fontSize:13,color:'#34C759',marginBottom:12}}>{msg}</div>}
    <button onClick={check} disabled={loading} style={{...S.btn,...S.btnPrimary,maxWidth:300,margin:'0 auto'}}>{loading?'Checking...':'I\'ve verified my email'}</button>
    <div style={{marginTop:16}}><button onClick={resend} disabled={loading} style={S.link}>{loading?'Sending...':'Resend email'}</button></div>
    <div style={{marginTop:8}}><button onClick={onBack} style={{...S.link,color:'#8E8E93',fontSize:13}}>Back to login</button></div>
  </div>;
}

function AvatarPicker({name,onDone}) {
  const [face,setFace]=useState('');const [color,setColor]=useState('#FF9500');
  const [err,setErr]=useState('');const [loading,setLoading]=useState(false);
  const go=async()=>{
    if(!face){setErr('Pick your buddy!');return}
    setLoading(true);
    try{await updateUserProfile(auth.currentUser.uid,{face,color});onDone()}catch(e){console.error(e)}
    setLoading(false);
  };
  return <div style={{textAlign:'center',animation:'fadeIn .4s ease'}}>
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:4}}>Pick your buddy!</h2>
    <p style={{fontSize:14,color:'#8E8E93',marginBottom:24}}>This is you in the classroom</p>
    {face&&<div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 18px 10px 12px',background:'#fff',borderRadius:50,boxShadow:'0 2px 12px rgba(0,0,0,.04)',marginBottom:20,animation:'scaleIn .3s ease'}}>
      <div style={{width:36,height:36,borderRadius:'50%',background:color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,boxShadow:`0 3px 10px ${color}33`}}>{face}</div>
      <span style={{fontWeight:700,fontSize:15}}>{name||'You'}</span>
    </div>}
    <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:24}}>
      {FACES.map(f=>{const on=face===f;return<div key={f} onClick={()=>{setFace(f);setColor(COLORS[Math.floor(Math.random()*COLORS.length)])}}
        style={{aspectRatio:'1',borderRadius:18,background:on?`${color}12`:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,cursor:'pointer',transition:'all .2s cubic-bezier(.34,1.56,.64,1)',border:on?`2.5px solid ${color}`:'2px solid rgba(0,0,0,.04)',boxShadow:on?`0 4px 16px ${color}22`:'0 2px 8px rgba(0,0,0,.03)',transform:on?'scale(1.08)':'scale(1)'}}>{f}</div>})}
    </div>
    {err&&<div style={{fontSize:13,color:'#FF3B30',textAlign:'center',marginBottom:12}}>{err}</div>}
    <button onClick={go} disabled={loading} style={{...S.btn,...S.btnPrimary,maxWidth:320,margin:'0 auto'}}>{loading?'Saving...':'Let\'s Go! 🚀'}</button>
  </div>;
}

// ═══════════════ GAME COMPONENTS (FIX #2,#3,#6,#11,#12) ═══════════════

function MeetGame({task, ch, sub, setSub, complete}) {
  const l = L[task.d[sub]];
  // FIX #2: No auto-play — user taps Listen button (browser requires gesture)
  return <div style={{textAlign:'center'}}>
    <div style={{...S.card,padding:'40px 24px',borderRadius:28,boxShadow:'0 8px 40px rgba(0,0,0,.04)'}}>
      <div onClick={()=>say(l.g)} style={{fontFamily:G,fontSize:'min(36vw,160px)',fontWeight:900,lineHeight:1,cursor:'pointer',background:`linear-gradient(135deg,${ch.color},${ch.color}CC)`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'breathe 3s ease-in-out infinite'}}>{l.g}</div>
      <div style={{fontSize:24,fontWeight:700,marginTop:12}}>{l.r}</div>
      <div style={{fontSize:16,color:'#8E8E93',marginTop:2}}>sounds like "{l.s}"</div>
      <button onClick={()=>say(l.g)} style={{marginTop:20,padding:'14px 32px',background:ch.color,color:'#fff',border:'none',borderRadius:50,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit',boxShadow:`0 4px 20px ${ch.color}44`}}>🔊 Tap to Listen</button>
      <div style={{marginTop:20,padding:'14px 18px',background:'#F2F2F7',borderRadius:16,fontSize:15,color:'#333',lineHeight:1.6}}>{l.d}</div>
    </div>
    <button onClick={()=>{
      if(sub < task.d.length-1) setSub(sub+1);
      else complete(task);
    }} style={{...S.btn,marginTop:20,maxWidth:340,...(sub<task.d.length-1?S.btnDark:S.btnGreen)}}>
      {sub<task.d.length-1?'Next Letter →':'Done! ✓'}
    </button>
  </div>;
}

function QuizGame({task, ch, complete}) {
  const [round,setRound]=useState(0);
  const [ans,setAns]=useState(null);
  const pool = task.ty==='quiz'
    ? task.d.map(i=>({g:L[i].g,label:L[i].r,sp:L[i].g}))
    : task.d.map(i=>({g:WORDS[i].w,label:WORDS[i].m,sp:WORDS[i].w}));
  const rounds = Math.min(5, pool.length);
  // FIX #3: Shuffle ONCE in useMemo, not on every render
  const shuffledPool = useMemo(()=>shuffle(pool),[]);
  const correct = shuffledPool[round % shuffledPool.length];
  const options = useMemo(()=>shuffle([correct,...shuffle(pool.filter(p=>p.g!==correct.g)).slice(0,3)]),[round]);

  // FIX #1: Don't auto-play on mount — require tap on speaker
  if(round>=rounds) return <div style={{textAlign:'center',padding:40}}>
    <div style={{fontSize:72}}>🎉</div>
    <div style={{fontSize:24,fontWeight:800,marginTop:8}}>Perfect!</div>
    <button onClick={()=>complete(task)} style={{...S.btn,...S.btnGreen,marginTop:20,maxWidth:300}}>Done! ✓</button>
  </div>;

  return <div style={{textAlign:'center'}}>
    <div style={{display:'flex',justifyContent:'center',gap:6,marginBottom:16}}>
      {Array.from({length:rounds}).map((_,i)=><div key={i} style={{width:i===round?20:8,height:8,borderRadius:4,background:i<round?'#34C759':i===round?ch.color:'#D1D1D6',transition:'.3s'}}/>)}
    </div>
    {/* FIX #11: Clear "tap to hear" label */}
    <div onClick={()=>say(correct.sp)} style={{width:88,height:88,borderRadius:'50%',background:`${ch.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,margin:'0 auto 8px',cursor:'pointer',animation:'pulse2 2s infinite',transition:'.2s'}}>🔊</div>
    <p style={{fontSize:14,fontWeight:700,color:ch.color,marginBottom:16}}>Tap speaker, then pick the answer!</p>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,maxWidth:320,margin:'0 auto'}}>
      {options.map((o,i)=><div key={o.g+'-'+i} onClick={()=>{
        if(ans!==null)return;
        setAns(o.g);
        if(o.g===correct.g){say(correct.sp);setTimeout(()=>{setRound(round+1);setAns(null)},700)}
        else setTimeout(()=>setAns(null),600);
      }} style={{background:ans===o.g?(o.g===correct.g?'#F0FFF4':'#FFF0F0'):'#fff',
        border:`2.5px solid ${ans===o.g?(o.g===correct.g?'#34C759':'#FF3B30'):'rgba(0,0,0,.05)'}`,
        borderRadius:20,padding:'22px 12px',cursor:'pointer',transition:'.15s',
        animation:ans===o.g&&o.g!==correct.g?'shake .4s ease':'none'}}>
        <div style={{fontFamily:G,fontSize:36,fontWeight:800,lineHeight:1}}>{o.g}</div>
        <div style={{fontSize:13,fontWeight:600,color:'#8E8E93',marginTop:6}}>{o.label}</div>
      </div>)}
    </div>
  </div>;
}

function TraceGame({task, ch, sub, setSub, complete}) {
  const cRef=useRef(null),bRef=useRef(null);
  const [drawing,setDrawing]=useState(false);
  const [color,setColor]=useState(ch.color);
  const l = L[task.d[sub]];

  useEffect(()=>{
    const c=cRef.current,b=bRef.current;if(!c||!b)return;
    const r=b.getBoundingClientRect(),dpr=devicePixelRatio||1;
    c.width=r.width*dpr;c.height=r.height*dpr;
    c.getContext('2d').setTransform(dpr,0,0,dpr,0,0);
  },[sub]);

  const gp=e=>{const r=cRef.current.getBoundingClientRect();const t=e.touches?e.touches[0]:e;return{x:t.clientX-r.left,y:t.clientY-r.top}};
  const sd=e=>{e.preventDefault();setDrawing(true);const p=gp(e),ctx=cRef.current.getContext('2d');ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.strokeStyle=color;ctx.lineWidth=6;ctx.lineCap='round';ctx.lineJoin='round'};
  const dm=e=>{if(!drawing)return;e.preventDefault();const p=gp(e),ctx=cRef.current.getContext('2d');ctx.lineTo(p.x,p.y);ctx.stroke();ctx.beginPath();ctx.moveTo(p.x,p.y)};
  const ed=()=>setDrawing(false);

  return <div style={{textAlign:'center'}}>
    {/* FIX #6: Show letter name and listen button */}
    <div style={{marginBottom:16}}>
      <div style={{fontFamily:G,fontSize:24,fontWeight:800,color:ch.color}}>{l.g}</div>
      <div style={{fontSize:14,color:'#8E8E93',fontWeight:600}}>{l.r} — trace it below!</div>
      <button onClick={()=>say(l.g)} style={{marginTop:8,padding:'8px 20px',background:`${ch.color}15`,color:ch.color,border:'none',borderRadius:50,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>🔊 Hear it</button>
    </div>
    <div ref={bRef} style={{position:'relative',width:'100%',maxWidth:300,margin:'0 auto',aspectRatio:'1',borderRadius:24,overflow:'hidden',background:'#fff',border:'2px solid rgba(0,0,0,.04)',touchAction:'none',boxShadow:'0 4px 24px rgba(0,0,0,.04)'}}>
      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:G,fontSize:'min(50vw,200px)',fontWeight:900,color:`${ch.color}0D`,pointerEvents:'none',zIndex:1}}>{l.g}</div>
      <canvas ref={cRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:2,cursor:'crosshair'}} onMouseDown={sd} onMouseMove={dm} onMouseUp={ed} onMouseLeave={ed} onTouchStart={sd} onTouchMove={dm} onTouchEnd={ed}/>
    </div>
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:14}}>
      {[ch.color,'#FF2D55','#5856D6','#34C759','#1C1C1E'].map(c=><div key={c} onClick={()=>setColor(c)} style={{width:28,height:28,borderRadius:'50%',background:c,cursor:'pointer',border:color===c?'3px solid #1C1C1E':'3px solid transparent',boxShadow:color===c?'0 0 0 2px #fff, 0 0 0 4px #1C1C1E':'none',transition:'.15s'}}/>)}
      <button onClick={()=>{const c=cRef.current;if(c)c.getContext('2d').clearRect(0,0,c.width,c.height)}} style={{marginLeft:8,padding:'8px 16px',border:'none',borderRadius:50,fontSize:13,fontWeight:600,background:'#F2F2F7',cursor:'pointer',fontFamily:'inherit'}}>Clear</button>
    </div>
    <button onClick={()=>{if(sub<task.d.length-1)setSub(sub+1);else complete(task)}} style={{...S.btn,marginTop:20,maxWidth:340,...(sub<task.d.length-1?S.btnDark:S.btnGreen)}}>{sub<task.d.length-1?'Next →':'Done! ✓'}</button>
  </div>;
}

function WordGame({task, ch, sub, setSub, complete}) {
  const w = WORDS[task.d[sub]];
  return <div style={{textAlign:'center'}}>
    <div style={{...S.card,padding:'36px 24px',borderRadius:28}}>
      <div style={{fontSize:56}}>{w.e}</div>
      <div onClick={()=>say(w.w)} style={{fontFamily:G,fontSize:'min(20vw,80px)',fontWeight:900,lineHeight:1,marginTop:8,cursor:'pointer',color:'#1C1C1E'}}>{w.w}</div>
      <div style={{fontSize:20,fontWeight:700,color:ch.color,marginTop:8}}>{w.t}</div>
      <div style={{fontSize:16,color:'#8E8E93'}}>"{w.m}"</div>
      <button onClick={()=>say(w.w)} style={{marginTop:16,padding:'12px 28px',background:ch.color,color:'#fff',border:'none',borderRadius:50,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>🔊 Tap to Listen</button>
    </div>
    <button onClick={()=>{if(sub<task.d.length-1)setSub(sub+1);else complete(task)}} style={{...S.btn,marginTop:20,maxWidth:340,...(sub<task.d.length-1?S.btnDark:S.btnGreen)}}>{sub<task.d.length-1?'Next Word →':'Done! ✓'}</button>
  </div>;
}

function SpellGame({task, ch, complete}) {
  const [wi,setWi]=useState(0);
  const [filled,setFilled]=useState([]);
  const [wrong,setWrong]=useState(false); // FIX #12
  const scrambled = useMemo(()=>task.d.map(i=>shuffle([...WORDS[i].l])),[]);
  const w = WORDS[task.d[wi]];
  const tiles = scrambled[wi];

  const add=(l,i)=>{
    if(filled.some(f=>f.i===i))return;
    const nf=[...filled,{l,i}];setFilled(nf);
    if(nf.length===w.l.length){
      if(nf.map(f=>f.l).join('')===w.l.join('')){
        say(w.w);
        setTimeout(()=>{if(wi<task.d.length-1){setWi(wi+1);setFilled([])}else complete(task)},900);
      } else {
        // FIX #12: Show wrong feedback
        setWrong(true);
        setTimeout(()=>{setFilled([]);setWrong(false)},800);
      }
    }
  };

  return <div style={{textAlign:'center'}}>
    <div style={{fontSize:40,marginBottom:4}}>{w.e}</div>
    <div style={{fontSize:20,fontWeight:700,marginBottom:6}}>Spell "{w.m}"</div>
    <div style={{fontSize:13,color:'#8E8E93',marginBottom:16}}>{wi+1} of {task.d.length}</div>
    {/* FIX #12: Wrong answer message */}
    {wrong&&<div style={{fontSize:14,fontWeight:700,color:'#FF3B30',marginBottom:10,animation:'shake .4s ease'}}>Oops! Try again 💪</div>}
    <div style={{display:'flex',justifyContent:'center',gap:10,marginBottom:20}}>
      {w.l.map((_,i)=><div key={i} onClick={()=>{if(filled[i])setFilled(filled.filter((_,j)=>j!==i))}}
        style={{width:52,height:56,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:G,fontSize:24,fontWeight:700,cursor:'pointer',
        background:filled[i]?(wrong?'#FFF0F0':'#fff'):'rgba(0,0,0,.02)',
        border:filled[i]?`2.5px solid ${wrong?'#FF3B30':ch.color}`:'2.5px dashed rgba(0,0,0,.08)',
        animation:wrong&&filled[i]?'shake .4s ease':'none',
        transition:'.2s'}}>{filled[i]?.l||''}</div>)}
    </div>
    <div style={{display:'flex',justifyContent:'center',gap:10,flexWrap:'wrap'}}>
      {tiles.map((l,i)=><div key={i} onClick={()=>add(l,i)}
        style={{width:52,height:56,borderRadius:14,background:'#fff',border:'2px solid rgba(0,0,0,.05)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:G,fontSize:24,fontWeight:700,cursor:'pointer',boxShadow:'0 2px 8px rgba(0,0,0,.04)',
        opacity:filled.some(f=>f.i===i)?.15:1,pointerEvents:filled.some(f=>f.i===i)?'none':'auto',transition:'.2s'}}>{l}</div>)}
    </div>
  </div>;
}

function MaatraGame({task, ch, sub, setSub, complete}) {
  const m = MAATRA[task.d[sub]];
  return <div style={{textAlign:'center'}}>
    <div style={{...S.card,padding:'36px 24px',borderRadius:28}}>
      <div style={{fontFamily:G,fontSize:80,fontWeight:900,color:ch.color,lineHeight:1}}>{m.sym}</div>
      <div style={{fontSize:22,fontWeight:700,marginTop:8}}>{m.n}</div>
      <div style={{fontSize:15,color:'#8E8E93'}}>sounds like "{m.snd}"</div>
      <div style={{marginTop:16,padding:14,background:'#F2F2F7',borderRadius:16,textAlign:'left'}}>
        {m.ex.map((e,i)=><div key={i} onClick={()=>say(e.w)} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',cursor:'pointer',borderBottom:i<m.ex.length-1?'1px solid rgba(0,0,0,.04)':'none'}}>
          <span style={{fontFamily:G,fontSize:22,fontWeight:700}}>{e.w}</span>
          <span style={{fontSize:14,color:'#8E8E93'}}>"{e.m}"</span>
          <span style={{marginLeft:'auto',fontSize:14}}>🔊</span>
        </div>)}
      </div>
    </div>
    <button onClick={()=>{if(sub<task.d.length-1)setSub(sub+1);else complete(task)}} style={{...S.btn,marginTop:20,maxWidth:340,...(sub<task.d.length-1?S.btnDark:S.btnGreen)}}>{sub<task.d.length-1?'Next →':'Done! ✓'}</button>
  </div>;
}

function ReadGame({task, ch, complete}) {
  const s = SENTS[task.d];
  const [hl,setHl]=useState(-1);
  const play=()=>{let i=0;const go=()=>{if(i>=s.p.length){setHl(-1);return}setHl(i);say(s.p[i]);i++;setTimeout(go,900)};go()};
  return <div style={{textAlign:'center'}}>
    <div style={{...S.card,padding:'32px 20px',borderRadius:28}}>
      <div style={{fontFamily:G,fontSize:'min(8vw,34px)',fontWeight:700,lineHeight:2.4}}>
        {s.p.map((w,i)=><span key={i} onClick={()=>{say(w);setHl(i)}} style={{display:'inline-block',padding:'4px 10px',borderRadius:10,cursor:'pointer',transition:'.2s',margin:'0 2px',background:hl===i?ch.color:'transparent',color:hl===i?'#fff':'#1C1C1E'}}>{w}</span>)}
      </div>
      <div style={{fontSize:15,color:'#8E8E93',marginTop:8}}>{s.m}</div>
      <button onClick={play} style={{marginTop:16,padding:'14px 32px',background:ch.color,color:'#fff',border:'none',borderRadius:50,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>▶ Play All</button>
    </div>
    <button onClick={()=>complete(task)} style={{...S.btn,...S.btnGreen,marginTop:20,maxWidth:340}}>Done! ✓</button>
  </div>;
}

// ═══════════════ MAIN APP ═══════════════
export default function Gurmukhi() {
  const [screen,setScreen]=useState('loading');
  const [profile,setProfile]=useState(null);
  const [progress,setProgress]=useState({xp:0,streak:0,done:[]});
  const [students,setStudents]=useState([]);
  const [ch,setCh]=useState(null);
  const [ti,setTi]=useState(0);
  const [sub,setSub]=useState(0);
  const [burst,setBurst]=useState(false);
  const [toast,setToast]=useState(null);
  const [verifyEmail,setVerifyEmail]=useState('');
  const [lockedMsg,setLockedMsg]=useState(''); // FIX #22

  // Load voices on mount
  useEffect(()=>{
    if(typeof window!=='undefined'&&'speechSynthesis' in window){
      loadVoices();
      speechSynthesis.onvoiceschanged=loadVoices;
    }
  },[]);

  // Auth state listener
  useEffect(()=>{
    const unsub=onAuthChange(async(u)=>{
      if(u){
        try{
          const prof=await getUserProfile(u.uid);
          if(prof){
            setProfile(prof);
            const prog=await fetchProgress(u.uid);
            setProgress(prog||{xp:0,streak:0,done:[]});
            if(prof.role==='teacher'){
              const s=await getAllStudents();setStudents(s);setScreen('teacher');
            } else if(!prof.face) setScreen('avatar');
            else {
              try{await fbUpdateStreak(u.uid);const up=await fetchProgress(u.uid);setProgress(up)}catch(e){}
              setScreen('home');
            }
          } else setScreen('avatar');
        }catch(e){console.error(e);setScreen('welcome')}
      } else {
        setProfile(null);setProgress({xp:0,streak:0,done:[]});setScreen('welcome');
      }
    });
    return ()=>unsub();
  },[]);

  const done=id=>(progress.done||[]).includes(id);
  const pct=Math.round((progress.done||[]).length/TOTAL*100);
  const displayName=profile?`${profile.fname||''} ${profile.lname||''}`.trim():'Learner';

  const complete=async(task)=>{
    if(!done(task.id)){
      try{
        await fbCompleteTask(auth.currentUser.uid,task.id,task.xp);
        setProgress(p=>({...p,done:[...(p.done||[]),task.id],xp:(p.xp||0)+task.xp}));
        setBurst(true);setToast(task.xp);
        setTimeout(()=>{setBurst(false);setToast(null);advance()},1500);
      }catch(e){console.error(e);advance()}
    } else advance();
  };
  const advance=()=>{
    if(ch&&ti<ch.tasks.length-1){setTi(ti+1);setSub(0);scrollTop();}
    else {setScreen('home');scrollTop();}
  };
  const openCh=(c)=>{
    setCh(c);
    const idx=c.tasks.findIndex(t=>!done(t.id));
    setTi(idx>=0?idx:0);setSub(0);setScreen('task');scrollTop();
  };

  // FIX #22: Locked chapter feedback
  const tapLocked=(chName)=>{setLockedMsg(`Complete the previous chapter first!`);setTimeout(()=>setLockedMsg(''),2000)};

  const goHome=()=>{setScreen('home');scrollTop()};
  const doLogout=async()=>{await logOut()};

  // ═══════ Sidebar ═══════
  const Friends=()=>(
    <div style={{...S.card,borderRadius:24,position:'sticky',top:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:`${profile?.color||'#FF9500'}10`,borderRadius:16,marginBottom:16}}>
        <div style={{width:36,height:36,borderRadius:'50%',background:profile?.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,boxShadow:`0 3px 10px ${profile?.color}33`}}>{profile?.face}</div>
        <div><div style={{fontWeight:700,fontSize:14}}>{displayName}</div><div style={{fontSize:12,color:'#8E8E93'}}>🔥 {progress.streak||0} · ⭐ {progress.xp||0}</div></div>
      </div>
      <div style={{fontSize:11,fontWeight:700,color:'#8E8E93',textTransform:'uppercase',letterSpacing:1.5,marginBottom:10}}>Classmates</div>
      {students.filter(s=>s.uid!==auth.currentUser?.uid).slice(0,8).map((p,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 0',borderBottom:'1px solid rgba(0,0,0,.04)'}}>
          <div style={{width:32,height:32,borderRadius:'50%',background:p.color||COLORS[i%COLORS.length],display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>{p.face||FACES[i%FACES.length]}</div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{p.fname||'Student'}</div><div style={{fontSize:11,color:'#8E8E93'}}>⭐{p.xp||0}</div></div>
        </div>
      ))}
      {students.length<=1&&<div style={{textAlign:'center',padding:12,color:'#C7C7CC',fontSize:12}}>Invite friends!</div>}
    </div>
  );

  // ═══════ RENDER ═══════
  return <>
    <style>{CSS}</style>

    {screen==='loading'&&<Shell><div style={{textAlign:'center'}}><Logo size={100}/><p style={{color:'#8E8E93'}}>Loading...</p></div></Shell>}

    {screen==='welcome'&&<Shell>
      <Logo size={100}/>
      <p style={{textAlign:'center',fontSize:16,color:'#8E8E93',fontWeight:500,marginBottom:32}}>The fun way to learn Punjabi</p>
      <button onClick={()=>setScreen('signup')} style={{...S.btn,...S.btnPrimary,marginBottom:12}}>Create Account</button>
      <button onClick={()=>setScreen('login')} style={{...S.btn,...S.btnGhost}}>I already have an account</button>
    </Shell>}

    {screen==='signup'&&<Shell><Logo/><SignupForm onDone={em=>{setVerifyEmail(em);setScreen('verify')}} onSwitch={()=>setScreen('login')}/></Shell>}
    {screen==='login'&&<Shell><Logo/><LoginForm onForgot={()=>setScreen('forgot')} onSwitch={()=>setScreen('signup')} onNeedVerify={em=>{setVerifyEmail(em);setScreen('verify')}}/></Shell>}
    {screen==='forgot'&&<Shell><Logo/><ForgotForm onBack={()=>setScreen('login')}/></Shell>}
    {screen==='verify'&&<Shell><VerifyScreen email={verifyEmail} onDone={()=>setScreen('avatar')} onBack={()=>setScreen('login')}/></Shell>}
    {screen==='avatar'&&<Shell><AvatarPicker name={profile?.fname} onDone={async()=>{const p=await getUserProfile(auth.currentUser.uid);setProfile(p);setScreen('home')}}/></Shell>}

    {/* PROFILE */}
    {screen==='profile'&&<div style={{minHeight:'100dvh',background:'#F2F2F7',fontFamily:F}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 20px',background:'rgba(242,242,247,.92)',backdropFilter:'blur(20px)',position:'sticky',top:0,zIndex:100}}>
        <BackBtn onClick={goHome}/><span style={{fontWeight:700,fontSize:16}}>Profile</span><div style={{width:80}}/>
      </div>
      <div style={{maxWidth:440,margin:'0 auto',padding:20}}>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{width:80,height:80,borderRadius:'50%',background:profile?.color,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:40,boxShadow:`0 6px 24px ${profile?.color}33`}}>{profile?.face}</div>
          <h2 style={{fontSize:22,fontWeight:800,marginTop:12}}>{displayName}</h2>
          <p style={{fontSize:14,color:'#8E8E93'}}>{profile?.email}</p>
        </div>
        <div style={S.card}>
          <div style={{display:'flex',justifyContent:'space-around',textAlign:'center'}}>
            <div><div style={{fontSize:24,fontWeight:800,color:'#FF9500'}}>{progress.xp||0}</div><div style={{fontSize:11,color:'#8E8E93'}}>XP</div></div>
            <div><div style={{fontSize:24,fontWeight:800,color:'#FF2D55'}}>🔥 {progress.streak||0}</div><div style={{fontSize:11,color:'#8E8E93'}}>Streak</div></div>
            <div><div style={{fontSize:24,fontWeight:800,color:'#34C759'}}>{pct}%</div><div style={{fontSize:11,color:'#8E8E93'}}>Done</div></div>
          </div>
        </div>
        {/* FIX #4: Show personal info */}
        <div style={{...S.card,marginTop:12}}>
          {[{l:'Gender',v:profile?.gender},{l:'Date of Birth',v:profile?.dob},{l:'Role',v:profile?.role}].map((r,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:i<2?'1px solid rgba(0,0,0,.04)':'none'}}>
              <span style={{fontSize:14,color:'#8E8E93'}}>{r.l}</span>
              <span style={{fontSize:14,fontWeight:600,textTransform:'capitalize'}}>{r.v||'—'}</span>
            </div>
          ))}
        </div>
        <button onClick={doLogout} style={{...S.btn,marginTop:20,background:'#FFF0F0',color:'#FF3B30'}}>Log Out</button>
      </div>
    </div>}

    {/* TEACHER */}
    {screen==='teacher'&&<div style={{minHeight:'100dvh',background:'#F2F2F7',fontFamily:F}}>
      <div style={{background:'#fff',padding:'18px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(0,0,0,.04)'}}>
        <h2 style={{fontSize:20,fontWeight:700}}>👩‍🏫 Classroom</h2>
        <button onClick={doLogout} style={{fontSize:13,fontWeight:600,color:'#FF3B30',padding:'8px 16px',borderRadius:50,background:'#FFF0F0',border:'none',cursor:'pointer',fontFamily:'inherit'}}>Log Out</button>
      </div>
      <div style={{maxWidth:800,margin:'0 auto',padding:20}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:24}}>
          {[
            {v:students.length,l:'Students',c:'#5856D6',e:'👨‍🎓'},
            {v:students.length?Math.round(students.reduce((s,p)=>s+(p.done?.length||0)/TOTAL*100,0)/students.length)+'%':0,l:'Avg Progress',c:'#34C759',e:'📊'},
            {v:students.filter(p=>p.lastDate===new Date().toDateString()).length,l:'Active Today',c:'#FF9500',e:'🟢'},
          ].map((s,i)=>(
            <div key={i} style={{...S.card,textAlign:'center'}}><div style={{fontSize:28}}>{s.e}</div><div style={{fontSize:28,fontWeight:800,color:s.c,marginTop:4}}>{s.v}</div><div style={{fontSize:11,fontWeight:600,color:'#8E8E93',textTransform:'uppercase',letterSpacing:1,marginTop:2}}>{s.l}</div></div>
          ))}
        </div>
        <div style={{fontSize:13,fontWeight:700,color:'#8E8E93',textTransform:'uppercase',letterSpacing:1.5,marginBottom:12}}>Students ({students.length})</div>
        {students.length===0&&<div style={{textAlign:'center',padding:40,color:'#bbb'}}>No students yet!</div>}
        {students.map((p,i)=>{
          const spct=Math.round((p.done?.length||0)/TOTAL*100);
          // FIX #16: Show which chapter they're on
          const lastCh=CHS.slice().reverse().find(c=>c.tasks.some(t=>(p.done||[]).includes(t.id)));
          return(
            <div key={i} style={{background:'#fff',borderRadius:16,padding:16,marginBottom:10,display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:48,height:48,borderRadius:'50%',background:p.color||COLORS[i%COLORS.length],display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{p.face||FACES[i%FACES.length]}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:15}}>{p.fname} {p.lname} {p.lastDate===new Date().toDateString()&&<span style={{fontSize:11,color:'#34C759'}}>● online</span>}</div>
                <div style={{fontSize:12,color:'#8E8E93',marginTop:2}}>🔥 {p.streak||0} · ⭐ {p.xp||0} · {(p.done?.length||0)}/{TOTAL} tasks{lastCh?` · Ch${lastCh.id}`:''}</div>
                <div style={{height:4,background:'#F2F2F7',borderRadius:10,marginTop:6,overflow:'hidden'}}><div style={{height:'100%',width:`${spct}%`,background:p.color||COLORS[i%COLORS.length],borderRadius:10}}/></div>
              </div>
              <div style={{fontSize:20,fontWeight:800,color:p.color||COLORS[i%COLORS.length]}}>{spct}%</div>
            </div>
          );
        })}
      </div>
    </div>}

    {/* TASK */}
    {screen==='task'&&ch&&(()=>{
      const task=ch.tasks[ti];
      const renderGame=()=>{
        switch(task.ty){
          case 'meet': return <MeetGame task={task} ch={ch} sub={sub} setSub={setSub} complete={complete}/>;
          case 'quiz': case 'quiz_w': return <QuizGame key={task.id} task={task} ch={ch} complete={complete}/>;
          case 'trace': return <TraceGame task={task} ch={ch} sub={sub} setSub={setSub} complete={complete}/>;
          case 'word': return <WordGame task={task} ch={ch} sub={sub} setSub={setSub} complete={complete}/>;
          case 'spell': return <SpellGame key={task.id} task={task} ch={ch} complete={complete}/>;
          case 'maatra': return <MaatraGame task={task} ch={ch} sub={sub} setSub={setSub} complete={complete}/>;
          case 'read': return <ReadGame key={task.id} task={task} ch={ch} complete={complete}/>;
          default: return <div style={{textAlign:'center',padding:40,color:'#8E8E93'}}>Coming soon!</div>;
        }
      };
      return <div style={{minHeight:'100dvh',background:'#F2F2F7',fontFamily:F}}>
        <Particles show={burst}/>
        <div style={{maxWidth:1100,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr',gap:0}} className="g-layout">
          <div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 20px',position:'sticky',top:0,zIndex:100,background:'rgba(242,242,247,.92)',backdropFilter:'blur(20px)'}}>
              <BackBtn onClick={goHome} color={ch.color}/>
              <div style={{display:'flex',gap:5}}>{ch.tasks.map((_,i)=><div key={i} style={{width:i===ti?20:8,height:8,borderRadius:4,background:i<ti?'#34C759':i===ti?ch.color:'#D1D1D6',transition:'.3s'}}/>)}</div>
              <div style={{fontSize:14,fontWeight:700,color:'#FF9500'}}>🔥 {progress.streak||0}</div>
            </div>
            <div style={{padding:'8px 20px 100px',maxWidth:480,margin:'0 auto'}}>
              <div style={{textAlign:'center',marginBottom:24}}>
                <div style={{fontSize:12,fontWeight:700,color:'#8E8E93',textTransform:'uppercase',letterSpacing:2}}>{ch.t}</div>
                <h2 style={{fontSize:26,fontWeight:800,marginTop:4}}>{task.t}</h2>
                {/* FIX #14: Skip button */}
                {ti<ch.tasks.length-1&&<button onClick={advance} style={{marginTop:6,fontSize:13,color:'#C7C7CC',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit'}}>Skip this task →</button>}
              </div>
              {renderGame()}
            </div>
          </div>
          <div className="g-sb" style={{padding:'20px 16px 20px 0',display:'none'}}><Friends/></div>
        </div>
        {/* XP Toast — FIX #13: shorter, auto-dismisses */}
        {toast!==null&&<div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:9998,background:'rgba(0,0,0,.12)',backdropFilter:'blur(6px)'}}>
          <div style={{background:'#fff',borderRadius:28,padding:'32px 48px',textAlign:'center',boxShadow:'0 20px 60px rgba(0,0,0,.15)',animation:'pop .3s cubic-bezier(.34,1.56,.64,1)'}}>
            <div style={{fontSize:48}}>🌟</div>
            <div style={{fontSize:28,fontWeight:800,color:'#FF9500',marginTop:4}}>+{toast} XP</div>
          </div>
        </div>}
      </div>;
    })()}

    {/* HOME */}
    {screen==='home'&&<div style={{minHeight:'100dvh',background:'#F2F2F7',fontFamily:F}}>
      <div style={{maxWidth:1100,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr',gap:0}} className="g-layout">
        <div>
          {/* FIX #5: Top bar with profile + home context */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 20px 8px',position:'sticky',top:0,zIndex:100,background:'rgba(242,242,247,.92)',backdropFilter:'blur(20px)'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div onClick={()=>{setScreen('profile');scrollTop()}} style={{width:40,height:40,borderRadius:'50%',background:profile?.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,cursor:'pointer',boxShadow:`0 3px 10px ${profile?.color}33`}}>{profile?.face}</div>
              <div style={{fontWeight:700,fontSize:17}}>Hey, {profile?.fname||'Learner'} 👋</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:14,fontWeight:700,color:'#FF9500'}}>🔥 {progress.streak||0}</span>
              <span style={{fontSize:13,fontWeight:700,color:'#8E8E93'}}>⭐ {progress.xp||0}</span>
            </div>
          </div>

          {/* FIX #22: Locked chapter toast */}
          {lockedMsg&&<div style={{position:'fixed',bottom:100,left:'50%',transform:'translateX(-50%)',background:'#1C1C1E',color:'#fff',padding:'12px 24px',borderRadius:50,fontSize:14,fontWeight:600,zIndex:999,animation:'fadeIn .3s ease',boxShadow:'0 8px 30px rgba(0,0,0,.2)'}}>{lockedMsg}</div>}

          {/* FIX #15: Welcome banner only on first visit */}
          {(progress.done||[]).length===0&&<div style={{margin:'12px 20px',padding:'18px 20px',background:'linear-gradient(135deg,#FFF8F0,#FFEEDD)',borderRadius:20,display:'flex',alignItems:'center',gap:14}}>
            <div style={{fontSize:36,animation:'float 4s ease-in-out infinite'}}>🌟</div>
            <div><div style={{fontWeight:700,fontSize:15}}>Welcome, {profile?.fname||'Learner'}!</div><div style={{fontSize:14,color:'#666',marginTop:2}}>Tap your first lesson to begin</div></div>
          </div>}

          <div style={{padding:'16px 20px 100px',maxWidth:540,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:24}}>
              <div style={{fontSize:12,fontWeight:700,color:'#8E8E93',textTransform:'uppercase',letterSpacing:2}}>Your Journey</div>
              <div style={{marginTop:8,height:6,background:'#E5E5EA',borderRadius:10,overflow:'hidden',maxWidth:200,margin:'0 auto'}}>
                <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#FF9500,#FF2D55)',borderRadius:10,transition:'width .6s'}}/>
              </div>
              <div style={{fontSize:13,color:'#8E8E93',marginTop:4,fontWeight:600}}>{pct}% complete</div>
            </div>

            {CHS.map((c,ci)=>{
              const cd=c.tasks.filter(t=>done(t.id)).length;
              const cp=Math.round(cd/c.tasks.length*100);
              const prevOk=ci===0||CHS[ci-1].tasks.every(t=>done(t.id));
              const locked=ci>0&&!prevOk;
              const full=cd===c.tasks.length;
              // FIX #19: Show next task name
              const nextTask=c.tasks.find(t=>!done(t.id));
              return <div key={c.id} onClick={()=>locked?tapLocked(c.t):openCh(c)}
                style={{background:'#fff',borderRadius:24,padding:'20px 20px 16px',marginBottom:14,
                cursor:'pointer',transition:'.25s',opacity:locked?.4:1,
                boxShadow:full?'0 0 0 2px #34C759, 0 4px 20px rgba(52,199,89,.12)':'0 2px 12px rgba(0,0,0,.03)',
                position:'relative'}}>
                <div style={{display:'flex',alignItems:'center',gap:14}}>
                  <div style={{width:52,height:52,borderRadius:16,background:`${c.color}12`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{c.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:16}}>{c.t}</div>
                    <div style={{fontFamily:G,fontSize:13,color:'#8E8E93'}}>{c.tp}</div>
                    {/* FIX #19: Next task preview */}
                    {nextTask&&!locked&&<div style={{fontSize:12,color:c.color,fontWeight:600,marginTop:2}}>Next: {nextTask.t}</div>}
                  </div>
                  {locked&&<span style={{fontSize:18,opacity:.3}}>🔒</span>}
                  {full&&<div style={{width:28,height:28,borderRadius:'50%',background:'#34C759',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:14,fontWeight:700}}>✓</div>}
                </div>
                <div style={{height:4,background:'#F2F2F7',borderRadius:10,marginTop:12,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${cp}%`,background:c.color,borderRadius:10,transition:'width .5s'}}/>
                </div>
                <div style={{fontSize:12,color:'#8E8E93',fontWeight:600,marginTop:5}}>{cd}/{c.tasks.length}</div>
              </div>;
            })}
          </div>
        </div>
        <div className="g-sb" style={{padding:'20px 20px 20px 0',display:'none'}}><Friends/></div>
      </div>
    </div>}
  </>;
}
