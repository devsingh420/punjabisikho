'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  signUp, logIn, logOut, resetPassword, resendVerification,
  checkVerified, getUserProfile, updateUserProfile,
  getProgress as fetchProgress, completeTask as fbCompleteTask,
  updateStreak as fbUpdateStreak, getAllStudents, onAuthChange,
  addLadoos as fbAddLadoos
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
  // Basic 2-letter words
  {w:"ਜਲ",t:"jal",m:"water",e:"💧",l:["ਜ","ਲ"]},
  {w:"ਘਰ",t:"ghar",m:"home",e:"🏠",l:["ਘ","ਰ"]},
  {w:"ਹਰ",t:"har",m:"every",e:"✨",l:["ਹ","ਰ"]},
  {w:"ਦਮ",t:"dam",m:"breath",e:"🌬️",l:["ਦ","ਮ"]},
  {w:"ਕਬ",t:"kab",m:"when",e:"⏰",l:["ਕ","ਬ"]},
  {w:"ਅਬ",t:"ab",m:"now",e:"👆",l:["ਅ","ਬ"]},
  {w:"ਤਨ",t:"tan",m:"body",e:"🧍",l:["ਤ","ਨ"]},
  {w:"ਮਨ",t:"man",m:"mind",e:"🧠",l:["ਮ","ਨ"]},
  {w:"ਜਗ",t:"jag",m:"world",e:"🌍",l:["ਜ","ਗ"]},
  {w:"ਦਰ",t:"dar",m:"door",e:"🚪",l:["ਦ","ਰ"]},
  // 3-letter words
  {w:"ਕਮਲ",t:"kamal",m:"lotus",e:"🪷",l:["ਕ","ਮ","ਲ"]},
  {w:"ਨਮਕ",t:"namak",m:"salt",e:"🧂",l:["ਨ","ਮ","ਕ"]},
  {w:"ਕਲਮ",t:"kalam",m:"pen",e:"🖊️",l:["ਕ","ਲ","ਮ"]},
  {w:"ਸਬਰ",t:"sabar",m:"patience",e:"🧘",l:["ਸ","ਬ","ਰ"]},
  {w:"ਨਗਰ",t:"nagar",m:"city",e:"🏙️",l:["ਨ","ਗ","ਰ"]},
  {w:"ਅਮਰ",t:"amar",m:"immortal",e:"♾️",l:["ਅ","ਮ","ਰ"]},
  {w:"ਅਗਰ",t:"agar",m:"if",e:"❓",l:["ਅ","ਗ","ਰ"]},
  {w:"ਸਮਰ",t:"samar",m:"summer",e:"☀️",l:["ਸ","ਮ","ਰ"]},
  {w:"ਕਦਮ",t:"kadam",m:"step",e:"👣",l:["ਕ","ਦ","ਮ"]},
  {w:"ਸਫਰ",t:"safar",m:"journey",e:"🧳",l:["ਸ","ਫ","ਰ"]},
  {w:"ਅਸਰ",t:"asar",m:"effect",e:"✨",l:["ਅ","ਸ","ਰ"]},
  {w:"ਜਨਮ",t:"janam",m:"birth",e:"👶",l:["ਜ","ਨ","ਮ"]},
  {w:"ਪਲਕ",t:"palak",m:"eyelid",e:"👁️",l:["ਪ","ਲ","ਕ"]},
  {w:"ਸਰਲ",t:"saral",m:"simple",e:"😊",l:["ਸ","ਰ","ਲ"]},
  {w:"ਮਹਲ",t:"mahal",m:"palace",e:"🏰",l:["ਮ","ਹ","ਲ"]},
  // Animals & Nature
  {w:"ਬਘ",t:"bagh",m:"tiger",e:"🐅",l:["ਬ","ਘ"]},
  {w:"ਮਛ",t:"machh",m:"fish",e:"🐟",l:["ਮ","ਛ"]},
  {w:"ਵਣ",t:"van",m:"forest",e:"🌲",l:["ਵ","ਣ"]},
  {w:"ਫਲ",t:"phal",m:"fruit",e:"🍎",l:["ਫ","ਲ"]},
  {w:"ਪਰ",t:"par",m:"feather",e:"🪶",l:["ਪ","ਰ"]},
];

// Words WITH MAATRAS for advanced spelling
const MAATRA_WORDS=[
  // Kannā (ਾ) words
  {w:"ਕਾਮ",t:"kaam",m:"work",e:"💼",l:["ਕ","ਾ","ਮ"],maatra:"ਾ"},
  {w:"ਨਾਮ",t:"naam",m:"name",e:"📛",l:["ਨ","ਾ","ਮ"],maatra:"ਾ"},
  {w:"ਰਾਮ",t:"raam",m:"Ram",e:"🙏",l:["ਰ","ਾ","ਮ"],maatra:"ਾ"},
  {w:"ਸ਼ਾਮ",t:"shaam",m:"evening",e:"🌆",l:["ਸ਼","ਾ","ਮ"],maatra:"ਾ"},
  {w:"ਗਾਣਾ",t:"gaana",m:"song",e:"🎵",l:["ਗ","ਾ","ਣ","ਾ"],maatra:"ਾ"},
  // Sihari (ਿ) words
  {w:"ਦਿਲ",t:"dil",m:"heart",e:"❤️",l:["ਦ","ਿ","ਲ"],maatra:"ਿ"},
  {w:"ਮਿਲ",t:"mil",m:"meet",e:"🤝",l:["ਮ","ਿ","ਲ"],maatra:"ਿ"},
  {w:"ਗਿਣ",t:"gin",m:"count",e:"🔢",l:["ਗ","ਿ","ਣ"],maatra:"ਿ"},
  {w:"ਬਿਨ",t:"bin",m:"without",e:"🚫",l:["ਬ","ਿ","ਨ"],maatra:"ਿ"},
  // Bihari (ੀ) words
  {w:"ਨਦੀ",t:"nadee",m:"river",e:"🏞️",l:["ਨ","ਦ","ੀ"],maatra:"ੀ"},
  {w:"ਪਾਣੀ",t:"paani",m:"water",e:"💧",l:["ਪ","ਾ","ਣ","ੀ"],maatra:"ੀ"},
  {w:"ਰੋਟੀ",t:"roti",m:"bread",e:"🫓",l:["ਰ","ੋ","ਟ","ੀ"],maatra:"ੀ"},
  {w:"ਮੱਛੀ",t:"machhee",m:"fish",e:"🐟",l:["ਮ","ੱ","ਛ","ੀ"],maatra:"ੀ"},
  // Aunkarh (ੁ) words
  {w:"ਗੁਰ",t:"gur",m:"jaggery",e:"🍬",l:["ਗ","ੁ","ਰ"],maatra:"ੁ"},
  {w:"ਪੁਲ",t:"pul",m:"bridge",e:"🌉",l:["ਪ","ੁ","ਲ"],maatra:"ੁ"},
  {w:"ਸੁਖ",t:"sukh",m:"happiness",e:"😊",l:["ਸ","ੁ","ਖ"],maatra:"ੁ"},
  {w:"ਦੁਖ",t:"dukh",m:"sorrow",e:"😢",l:["ਦ","ੁ","ਖ"],maatra:"ੁ"},
  // Dulainkarh (ੂ) words
  {w:"ਫੂਲ",t:"phool",m:"flower",e:"🌸",l:["ਫ","ੂ","ਲ"],maatra:"ੂ"},
  {w:"ਸੂਰਜ",t:"sooraj",m:"sun",e:"☀️",l:["ਸ","ੂ","ਰ","ਜ"],maatra:"ੂ"},
  {w:"ਧੂਪ",t:"dhoop",m:"sunshine",e:"🌞",l:["ਧ","ੂ","ਪ"],maatra:"ੂ"},
  {w:"ਝੂਲਾ",t:"jhoola",m:"swing",e:"🎠",l:["ਝ","ੂ","ਲ","ਾ"],maatra:"ੂ"},
  // Lāvāṅ (ੇ) words
  {w:"ਸੇਬ",t:"seb",m:"apple",e:"🍎",l:["ਸ","ੇ","ਬ"],maatra:"ੇ"},
  {w:"ਖੇਤ",t:"khet",m:"field",e:"🌾",l:["ਖ","ੇ","ਤ"],maatra:"ੇ"},
  {w:"ਮੇਲਾ",t:"mela",m:"fair",e:"🎪",l:["ਮ","ੇ","ਲ","ਾ"],maatra:"ੇ"},
  {w:"ਦੇਸ਼",t:"desh",m:"country",e:"🗺️",l:["ਦ","ੇ","ਸ਼"],maatra:"ੇ"},
  // Dulāvāṅ (ੈ) words
  {w:"ਪੈਰ",t:"pair",m:"foot",e:"🦶",l:["ਪ","ੈ","ਰ"],maatra:"ੈ"},
  {w:"ਬੈਲ",t:"bail",m:"ox",e:"🐂",l:["ਬ","ੈ","ਲ"],maatra:"ੈ"},
  {w:"ਮੈਲ",t:"mail",m:"dirt",e:"💩",l:["ਮ","ੈ","ਲ"],maatra:"ੈ"},
  {w:"ਰੈਣ",t:"rain",m:"night",e:"🌙",l:["ਰ","ੈ","ਣ"],maatra:"ੈ"},
  // Hoṛā (ੋ) words
  {w:"ਮੋਰ",t:"mor",m:"peacock",e:"🦚",l:["ਮ","ੋ","ਰ"],maatra:"ੋ"},
  {w:"ਢੋਲ",t:"dhol",m:"drum",e:"🥁",l:["ਢ","ੋ","ਲ"],maatra:"ੋ"},
  {w:"ਬੋਲ",t:"bol",m:"speak",e:"🗣️",l:["ਬ","ੋ","ਲ"],maatra:"ੋ"},
  {w:"ਚੋਰ",t:"chor",m:"thief",e:"🦹",l:["ਚ","ੋ","ਰ"],maatra:"ੋ"},
  // Kanoṛā (ੌ) words
  {w:"ਕੌਰ",t:"kaur",m:"princess",e:"👸",l:["ਕ","ੌ","ਰ"],maatra:"ੌ"},
  {w:"ਸੌ",t:"sau",m:"hundred",e:"💯",l:["ਸ","ੌ"],maatra:"ੌ"},
  {w:"ਮੌਤ",t:"maut",m:"death",e:"💀",l:["ਮ","ੌ","ਤ"],maatra:"ੌ"},
  {w:"ਦੌੜ",t:"daur",m:"run",e:"🏃",l:["ਦ","ੌ","ੜ"],maatra:"ੌ"},
];
const SENTS=[
  {p:["ਮੇਰਾ","ਨਾਮ","ਗੁਰੂ","ਹੈ"],m:"My name is Guru"},
  {p:["ਪਾਣੀ","ਠੰਡਾ","ਹੈ"],m:"The water is cold"},
  {p:["ਇਹ","ਫੁੱਲ","ਸੋਹਣਾ","ਹੈ"],m:"This flower is beautiful"},
  {p:["ਸੂਰਜ","ਚਮਕਦਾ","ਹੈ"],m:"The sun shines"},
];
const MAATRA=[
  {n:"Kannā",sym:"ਾ",snd:"aa",d:"Makes 'aa' sound like in 'car' 🚗",ex:[{w:"ਕਾਮ",m:"work"},{w:"ਨਾਮ",m:"name"},{w:"ਰਾਮ",m:"Ram"},{w:"ਗਾਣਾ",m:"song"}]},
  {n:"Sihari",sym:"ਿ",snd:"i",d:"Makes short 'i' sound like in 'sit' 🪑",ex:[{w:"ਦਿਲ",m:"heart"},{w:"ਮਿਲ",m:"meet"},{w:"ਗਿਣ",m:"count"},{w:"ਬਿਨ",m:"without"}]},
  {n:"Bihari",sym:"ੀ",snd:"ee",d:"Makes long 'ee' sound like in 'see' 👀",ex:[{w:"ਨਦੀ",m:"river"},{w:"ਪਾਣੀ",m:"water"},{w:"ਰੋਟੀ",m:"bread"},{w:"ਮੱਛੀ",m:"fish"}]},
  {n:"Aunkarh",sym:"ੁ",snd:"u",d:"Makes short 'u' sound like in 'put' 📦",ex:[{w:"ਗੁਰ",m:"jaggery"},{w:"ਪੁਲ",m:"bridge"},{w:"ਸੁਖ",m:"happiness"},{w:"ਦੁਖ",m:"sorrow"}]},
  {n:"Dulainkarh",sym:"ੂ",snd:"oo",d:"Makes long 'oo' sound like in 'moon' 🌙",ex:[{w:"ਫੂਲ",m:"flower"},{w:"ਸੂਰਜ",m:"sun"},{w:"ਧੂਪ",m:"sunshine"},{w:"ਝੂਲਾ",m:"swing"}]},
  {n:"Lāvāṅ",sym:"ੇ",snd:"e",d:"Makes 'e' sound like in 'day' ☀️",ex:[{w:"ਸੇਬ",m:"apple"},{w:"ਖੇਤ",m:"field"},{w:"ਮੇਲਾ",m:"fair"},{w:"ਦੇਸ਼",m:"country"}]},
  {n:"Dulāvāṅ",sym:"ੈ",snd:"ai",d:"Makes 'ai' sound like in 'pair' 👯",ex:[{w:"ਪੈਰ",m:"foot"},{w:"ਬੈਲ",m:"ox"},{w:"ਮੈਲ",m:"dirt"},{w:"ਰੈਣ",m:"night"}]},
  {n:"Hoṛā",sym:"ੋ",snd:"o",d:"Makes 'o' sound like in 'go' 🚀",ex:[{w:"ਮੋਰ",m:"peacock"},{w:"ਢੋਲ",m:"drum"},{w:"ਬੋਲ",m:"speak"},{w:"ਚੋਰ",m:"thief"}]},
  {n:"Kanoṛā",sym:"ੌ",snd:"au",d:"Makes 'au' sound like in 'caught' 🎣",ex:[{w:"ਕੌਰ",m:"princess"},{w:"ਸੌ",m:"hundred"},{w:"ਮੌਤ",m:"death"},{w:"ਦੌੜ",m:"run"}]},
];
const CHS=[
  {id:1,t:"First Steps",tp:"ਪਹਿਲੇ ਕਦਮ",icon:"🌱",color:"#FF9500",tasks:[
    {id:"1a",ty:"meet",t:"Meet ੳ ਅ ੲ",xp:5,d:[0,1,2]},
    {id:"1b",ty:"quiz",t:"Sound Quiz 🎧",xp:8,d:[0,1,2,3,4]},
    {id:"1c",ty:"trace",t:"Trace Time ✏️",xp:8,d:[0,1,2]},
    {id:"1d",ty:"meet",t:"ਸ ਹ ਕ ਖ ਗ",xp:5,d:[3,4,5,6,7]},
    {id:"1e",ty:"quiz",t:"Listen & Pick 👂",xp:8,d:[3,4,5,6,7,8,9]},
    {id:"1f",ty:"trace",t:"Trace ਸ ਹ ਕ",xp:8,d:[3,4,5]},
    {id:"1g",ty:"meet",t:"ਘ ਙ ਚ ਛ ਜ",xp:5,d:[8,9,10,11,12]},
    {id:"1h",ty:"quiz",t:"Mix Quiz 🎯",xp:10,d:[0,1,2,3,5,6,8,10,12]},
    {id:"1i",ty:"meet",t:"ਝ ਞ ਟ ਠ ਡ",xp:5,d:[13,14,15,16,17]},
    {id:"1j",ty:"trace",t:"Trace More ✍️",xp:8,d:[10,12,15]},
    {id:"1k",ty:"meet",t:"ਢ ਣ ਤ ਥ ਦ",xp:5,d:[18,19,20,21,22]},
    {id:"1l",ty:"quiz",t:"Super Quiz 🌟",xp:12,d:[0,1,2,5,10,15,20]},
    {id:"1m",ty:"meet",t:"ਧ ਨ ਪ ਫ ਬ",xp:5,d:[23,24,25,26,27]},
    {id:"1n",ty:"meet",t:"ਭ ਮ ਯ ਰ ਲ ਵ ੜ",xp:5,d:[28,29,30,31,32,33,34]},
    {id:"1o",ty:"trace",t:"Trace Favorites 💪",xp:10,d:[5,12,25,29,32]},
    {id:"1p",ty:"quiz",t:"Champion Quiz 🏆",xp:15,d:[0,1,2,3,5,10,15,20,25,29,32,34]},
  ]},
  {id:2,t:"First Words",tp:"ਪਹਿਲੇ ਸ਼ਬਦ",icon:"💬",color:"#FF2D55",tasks:[
    // Section 1: 2-letter words
    {id:"2a",ty:"word",t:"Water & Home 💧🏠",xp:5,d:[0,1]},
    {id:"2b",ty:"spell",t:"Spell Them! ✏️",xp:8,d:[0,1]},
    {id:"2c",ty:"word",t:"Body & Mind 🧍🧠",xp:5,d:[6,7]},
    {id:"2d",ty:"spell",t:"Spell Challenge",xp:8,d:[6,7]},
    {id:"2e",ty:"word",t:"World & Door 🌍🚪",xp:5,d:[8,9]},
    {id:"2f",ty:"quiz_w",t:"Quick Quiz 📝",xp:10,d:[0,1,6,7,8,9]},
    // Section 2: 3-letter words
    {id:"2g",ty:"word",t:"Lotus & Salt 🪷🧂",xp:5,d:[10,11]},
    {id:"2h",ty:"spell",t:"Spell 3-Letters",xp:10,d:[10,11]},
    {id:"2i",ty:"word",t:"Pen & Patience 🖊️🧘",xp:5,d:[12,13]},
    {id:"2j",ty:"word",t:"City & Immortal 🏙️♾️",xp:5,d:[14,15]},
    {id:"2k",ty:"spell",t:"Tricky Spelling 🎯",xp:12,d:[12,13,14]},
    {id:"2l",ty:"quiz_w",t:"Word Master 📚",xp:12,d:[10,11,12,13,14,15]},
    // Section 3: More words
    {id:"2m",ty:"word",t:"Step & Journey 👣🧳",xp:5,d:[18,19]},
    {id:"2n",ty:"word",t:"Birth & Palace 👶🏰",xp:5,d:[21,24]},
    {id:"2o",ty:"spell",t:"Big Words! 💪",xp:12,d:[18,19,21]},
    // Section 4: Animals & Nature
    {id:"2p",ty:"word",t:"Tiger & Fish 🐅🐟",xp:5,d:[25,26]},
    {id:"2q",ty:"word",t:"Forest & Fruit 🌲🍎",xp:5,d:[27,28]},
    {id:"2r",ty:"spell",t:"Nature Spell 🌿",xp:10,d:[25,26,27,28]},
    {id:"2s",ty:"quiz_w",t:"Word Champion 🏆",xp:15,d:[0,1,10,12,14,18,21,25,27]},
  ]},
  {id:3,t:"Maatra Magic",tp:"ਮਾਤਰਾ ਜਾਦੂ",icon:"✨",color:"#5856D6",tasks:[
    // Kannā & Sihari
    {id:"3a",ty:"maatra",t:"Meet ਾ (aa)",xp:5,d:[0]},
    {id:"3b",ty:"maatra",t:"Meet ਿ (i)",xp:5,d:[1]},
    {id:"3c",ty:"maatra_quiz",t:"Quiz: ਾ vs ਿ 🎧",xp:8,d:[0,1]},
    {id:"3d",ty:"maatra_spell",t:"Spell with ਾ",xp:10,d:[0,1,2,3]},
    // Bihari & Aunkarh
    {id:"3e",ty:"maatra",t:"Meet ੀ (ee)",xp:5,d:[2]},
    {id:"3f",ty:"maatra",t:"Meet ੁ (u)",xp:5,d:[3]},
    {id:"3g",ty:"maatra_quiz",t:"Quiz: ੀ vs ੁ 🎯",xp:10,d:[2,3]},
    {id:"3h",ty:"maatra_spell",t:"Spell with ੀ ੁ",xp:10,d:[9,10,11,14,15]},
    // Dulainkarh & Lāvāṅ
    {id:"3i",ty:"maatra",t:"Meet ੂ (oo)",xp:5,d:[4]},
    {id:"3j",ty:"maatra",t:"Meet ੇ (e)",xp:5,d:[5]},
    {id:"3k",ty:"maatra_quiz",t:"Quiz: ੂ vs ੇ 🌟",xp:10,d:[4,5]},
    {id:"3l",ty:"maatra_spell",t:"Spell with ੂ ੇ",xp:12,d:[17,18,19,21,22]},
    // Dulāvāṅ & Hoṛā
    {id:"3m",ty:"maatra",t:"Meet ੈ (ai)",xp:5,d:[6]},
    {id:"3n",ty:"maatra",t:"Meet ੋ (o)",xp:5,d:[7]},
    {id:"3o",ty:"maatra_quiz",t:"Quiz: ੈ vs ੋ 🔥",xp:10,d:[6,7]},
    {id:"3p",ty:"maatra_spell",t:"Spell with ੈ ੋ",xp:12,d:[24,25,26,28,29,30]},
    // Kanoṛā & Final
    {id:"3q",ty:"maatra",t:"Meet ੌ (au)",xp:5,d:[8]},
    {id:"3r",ty:"maatra_quiz",t:"All Maatras Quiz 🏆",xp:15,d:[0,1,2,3,4,5,6,7,8]},
    {id:"3s",ty:"maatra_spell",t:"Maatra Master 👑",xp:15,d:[32,33,34,35]},
  ]},
  {id:4,t:"Reading Time",tp:"ਪੜ੍ਹਨ ਦਾ ਸਮਾਂ",icon:"📖",color:"#34C759",tasks:[
    {id:"4a",ty:"read",t:"My Name 👋",xp:5,d:0},
    {id:"4b",ty:"read",t:"Cold Water ❄️",xp:5,d:1},
    {id:"4c",ty:"read",t:"Beautiful Flower 🌸",xp:5,d:2},
    {id:"4d",ty:"read",t:"Sunshine ☀️",xp:5,d:3},
    {id:"4e",ty:"quiz",t:"Reading Quiz 📚",xp:10,d:[0,1,2,3]},
    {id:"4f",ty:"spell",t:"Sentence Spell ✍️",xp:12,d:[0,1,2]},
    {id:"4g",ty:"read",t:"Story Time 📖",xp:8,d:0},
    {id:"4h",ty:"quiz",t:"Final Challenge 🏆",xp:15,d:[0,1,2,3,4,5,6,7]},
  ]},
];
const TOTAL=CHS.reduce((s,c)=>s+c.tasks.length,0);
const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=0|Math.random()*(i+1);[b[i],b[j]]=[b[j],b[i]]}return b};

// ═══════════════ SOUND SYSTEM - AUTHENTIC PUNJABI AUDIO ═══════════════
// Uses our API route to proxy Google Translate TTS (real Punjabi pronunciation)

let currentAudio = null;

const say = (text) => {
  if (typeof window === 'undefined' || !text) return;

  // Stop any currently playing audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  // Use our API route which proxies Google Translate TTS (has authentic Punjabi)
  const audioUrl = `/api/speak?text=${encodeURIComponent(text)}`;

  currentAudio = new Audio(audioUrl);
  currentAudio.volume = 1.0;
  currentAudio.playbackRate = 0.9; // Slightly slower for learning

  currentAudio.play().catch((err) => {
    console.error('Audio play failed:', err);
  });
};

// No-op for compatibility
const loadVoices = () => {};

// Play celebration sound
const playSuccess = () => {
  if(typeof window==='undefined') return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch(e) {}
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
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes scaleIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
@keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@keyframes pop{from{transform:scale(0)}to{transform:scale(1)}}
@keyframes pulse2{0%{box-shadow:0 0 0 0 rgba(255,149,0,.4)}70%{box-shadow:0 0 0 20px rgba(255,149,0,0)}100%{box-shadow:0 0 0 0 rgba(255,149,0,0)}}
@keyframes particle{0%{opacity:1;transform:scale(0) translateY(0)}50%{opacity:1;transform:scale(1.2) translateY(-40px)}100%{opacity:0;transform:scale(.6) translateY(-80px) rotate(180deg)}}
@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
@keyframes drift{0%,100%{transform:translateY(0) rotate(var(--r))}50%{transform:translateY(-20px) rotate(calc(var(--r) + 12deg))}}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes bounce2{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-20px) scale(1.1)}}
@keyframes wiggle{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
@keyframes glow{0%,100%{box-shadow:0 0 30px rgba(255,149,0,.4)}50%{box-shadow:0 0 60px rgba(255,149,0,.6)}}
@keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}
@keyframes fireFlicker{0%,100%{transform:scale(1) rotate(-3deg)}25%{transform:scale(1.15) rotate(3deg)}50%{transform:scale(0.9) rotate(-2deg)}75%{transform:scale(1.1) rotate(2deg)}}
@keyframes rainbow{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}
@keyframes starPop{0%{transform:scale(0) rotate(0deg)}50%{transform:scale(1.4) rotate(180deg)}100%{transform:scale(1) rotate(360deg)}}
@keyframes treeGrow{0%{transform:scale(0.8)}50%{transform:scale(1.1)}100%{transform:scale(1)}}
@keyframes sparkle{0%,100%{opacity:0;transform:scale(0)}50%{opacity:1;transform:scale(1)}}
@keyframes wave{0%,100%{transform:rotate(0deg)}25%{transform:rotate(20deg)}75%{transform:rotate(-10deg)}}

/* Responsive iPad/Desktop mascots */
@media(min-width:1024px){
  .mascot-left,.mascot-right{display:block!important}
}

/* Chapter cards hover effects */
@media(hover:hover){
  div[style*="borderRadius:32px"]:hover{transform:translateY(-6px) scale(1.02)!important;box-shadow:0 20px 60px rgba(0,0,0,.12)!important}
}

@media(min-width:860px){.g-layout{grid-template-columns:1fr 280px!important}.g-sb{display:block!important}.g-mobile-only{display:none!important}}

/* Make touch targets bigger on mobile */
@media(max-width:600px){
  button{min-height:56px!important}
}

/* Smooth scrolling */
html{scroll-behavior:smooth}

body{font-family:${F};margin:0;background:#FFF9F0;overflow-x:hidden}
*{-webkit-tap-highlight-color:transparent}
`;

// ═══════════════ MASCOT CHARACTERS - SIKH BOY & GIRL ═══════════════
const PunjabiBoy = ({size=140,style={}}) => (
  <div style={{width:size,height:'auto',...style}}>
    <img
      src="/mascots/boy.png?v=5"
      alt="Sikh Boy"
      style={{
        width:'100%',
        height:'auto',
        filter:'drop-shadow(0 8px 20px rgba(0,0,0,0.15))',
        animation:'float 3s ease-in-out infinite',
      }}
    />
  </div>
);

const PunjabiGirl = ({size=140,style={}}) => (
  <div style={{width:size,height:'auto',...style}}>
    <img
      src="/mascots/girl.png?v=5"
      alt="Sikh Girl"
      style={{
        width:'100%',
        height:'auto',
        filter:'drop-shadow(0 8px 20px rgba(0,0,0,0.15))',
        animation:'float 3s ease-in-out infinite',
        animationDelay:'-1.5s',
      }}
    />
  </div>
);

// ═══════════════ PROGRESS TREE ═══════════════
const ProgressTree = ({progress, total}) => {
  const pct = Math.round((progress / total) * 100);
  // Tree stages: seed(0-10), sprout(11-25), sapling(26-50), small tree(51-75), full tree(76-100)
  const getTreeStage = () => {
    if(pct === 0) return {emoji: '🌰', label: 'Plant your seed!', bg: '#8B4513'};
    if(pct <= 15) return {emoji: '🌱', label: 'Sprouting!', bg: '#90EE90'};
    if(pct <= 35) return {emoji: '🌿', label: 'Growing!', bg: '#32CD32'};
    if(pct <= 55) return {emoji: '🪴', label: 'Getting bigger!', bg: '#228B22'};
    if(pct <= 75) return {emoji: '🌳', label: 'Almost there!', bg: '#006400'};
    if(pct < 100) return {emoji: '🌲', label: 'So close!', bg: '#004d00'};
    return {emoji: '🎄', label: 'COMPLETE!', bg: '#FFD700'};
  };
  const stage = getTreeStage();

  return (
    <div style={{textAlign:'center',padding:'20px 0'}}>
      <div style={{position:'relative',display:'inline-block'}}>
        {/* Ground */}
        <div style={{position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)',width:120,height:30,background:'linear-gradient(to top, #8B4513, #A0522D)',borderRadius:'50%',zIndex:1}}/>
        {/* Tree/Seed */}
        <div style={{fontSize:pct===0?60:80+pct*0.5,transition:'all 0.5s ease',animation:pct>0?'bounce 2s ease-in-out infinite':'none',position:'relative',zIndex:2,filter:'drop-shadow(0 8px 16px rgba(0,0,0,0.2))'}}>
          {stage.emoji}
        </div>
        {/* Sparkles for high progress */}
        {pct >= 50 && <div style={{position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',animation:'starPop 1s ease infinite'}}>✨</div>}
      </div>
      <div style={{marginTop:16,fontSize:16,fontWeight:800,color:'#1C1C1E'}}>{stage.label}</div>
      <div style={{fontSize:13,color:'#666',marginTop:2}}>{progress} of {total} lessons</div>
    </div>
  );
};

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

// Beautiful Landing Page with split layout
const LandingPage = ({children, showPreview=true}) => (
  <div style={{minHeight:'100dvh',display:'flex',fontFamily:F,position:'relative',overflow:'hidden'}}>

    {/* Left side - Vibrant App Showcase (hidden on mobile) */}
    <div className="landing-preview" style={{flex:1.2,display:'none',flexDirection:'column',justifyContent:'center',alignItems:'center',padding:50,position:'relative',overflow:'hidden',background:'linear-gradient(135deg,#FF6B35 0%,#FF9500 30%,#FFB347 60%,#FF6B35 100%)'}}>

      {/* Animated background pattern */}
      <div style={{position:'absolute',inset:0,overflow:'hidden'}}>
        {/* Large decorative circles */}
        <div style={{position:'absolute',width:400,height:400,borderRadius:'50%',background:'rgba(255,255,255,0.08)',top:-100,left:-100,animation:'breathe 8s ease-in-out infinite'}}/>
        <div style={{position:'absolute',width:300,height:300,borderRadius:'50%',background:'rgba(255,255,255,0.06)',bottom:-50,right:-50,animation:'breathe 10s ease-in-out infinite',animationDelay:'-3s'}}/>
        {/* Floating Gurmukhi letters */}
        {['ੳ','ਅ','ੲ','ਸ','ਕ','ਗ','ਮ','ਪ'].map((c,i)=>(
          <div key={i} style={{position:'absolute',fontFamily:G,fontSize:50+i*10,fontWeight:900,color:'rgba(255,255,255,0.1)',left:`${5+i*12}%`,top:`${15+((i*17)%60)}%`,animation:`drift ${14+i*2}s ease-in-out infinite`,animationDelay:`${-i*1.8}s`,'--r':`${-12+i*4}deg`}}>{c}</div>
        ))}
      </div>

      {/* Mascots on sides */}
      <div style={{position:'absolute',bottom:60,left:50,animation:'float 4s ease-in-out infinite',zIndex:3}}>
        <PunjabiBoy size={140}/>
      </div>
      <div style={{position:'absolute',bottom:60,right:50,animation:'float 4s ease-in-out infinite',animationDelay:'-2s',zIndex:3}}>
        <PunjabiGirl size={140}/>
      </div>

      {/* Central showcase content */}
      <div style={{position:'relative',zIndex:2,textAlign:'center',color:'#fff',maxWidth:480}}>
        {/* Big Gurmukhi title with glow */}
        <div style={{marginBottom:16}}>
          <div style={{fontFamily:G,fontSize:80,fontWeight:900,textShadow:'0 8px 40px rgba(0,0,0,0.3), 0 0 80px rgba(255,255,255,0.3)',animation:'breathe 4s ease-in-out infinite'}}>ਗੁਰਮੁਖੀ</div>
        </div>
        <p style={{fontSize:26,fontWeight:700,marginTop:8,textShadow:'0 2px 10px rgba(0,0,0,0.2)'}}>The Fun Way to Learn Punjabi!</p>
        <p style={{fontSize:16,opacity:0.9,marginTop:8}}>Join 1000+ kids mastering Gurmukhi script</p>

        {/* Stats row */}
        <div style={{display:'flex',justifyContent:'center',gap:20,marginTop:32}}>
          {[
            {num:'35',label:'Letters'},
            {num:'9',label:'Maatras'},
            {num:'4',label:'Chapters'},
          ].map((s,i)=>(
            <div key={i} style={{background:'rgba(255,255,255,0.2)',backdropFilter:'blur(10px)',borderRadius:20,padding:'16px 24px',textAlign:'center',animation:'fadeIn 0.5s ease',animationDelay:`${i*0.15}s`,animationFillMode:'both'}}>
              <div style={{fontSize:32,fontWeight:900}}>{s.num}</div>
              <div style={{fontSize:12,fontWeight:600,opacity:0.9}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Feature highlights with icons */}
        <div style={{display:'flex',flexWrap:'wrap',gap:10,justifyContent:'center',marginTop:28}}>
          {[
            {icon:'🎮',text:'Interactive Games'},
            {icon:'🔊',text:'Native Audio'},
            {icon:'✏️',text:'Trace & Write'},
            {icon:'🟡',text:'Earn Ladoos'},
          ].map((f,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:6,padding:'10px 18px',background:'rgba(255,255,255,0.15)',borderRadius:50,backdropFilter:'blur(8px)',animation:'slideUp 0.4s ease',animationDelay:`${0.3+i*0.1}s`,animationFillMode:'both'}}>
              <span style={{fontSize:18}}>{f.icon}</span>
              <span style={{fontSize:13,fontWeight:700}}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div style={{marginTop:36,background:'rgba(255,255,255,0.95)',borderRadius:20,padding:'20px 24px',color:'#333',textAlign:'left',boxShadow:'0 20px 60px rgba(0,0,0,0.2)',animation:'float 8s ease-in-out infinite'}}>
          <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:10}}>
            <div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,#FF9500,#FF6B35)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>👩‍👧</div>
            <div>
              <div style={{fontWeight:700,fontSize:14}}>Preet Kaur</div>
              <div style={{fontSize:12,color:'#888'}}>Parent from Toronto</div>
            </div>
            <div style={{marginLeft:'auto',color:'#FFB800'}}>⭐⭐⭐⭐⭐</div>
          </div>
          <p style={{fontSize:14,color:'#555',lineHeight:1.6,margin:0}}>"My daughter loves learning Punjabi now! The games make it so fun and she's earned 200+ ladoos already."</p>
        </div>
      </div>
    </div>

    {/* Right side - Clean Auth Form */}
    <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',padding:'40px 24px',position:'relative',minHeight:'100dvh',background:'linear-gradient(180deg,#FFFBF5 0%,#FFF5E6 100%)'}}>

      {/* Very subtle decorative elements */}
      <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
        <div style={{position:'absolute',width:250,height:250,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,149,0,0.08) 0%,transparent 70%)',top:'10%',right:'-5%'}}/>
        <div style={{position:'absolute',width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,107,53,0.06) 0%,transparent 70%)',bottom:'15%',left:'-5%'}}/>
      </div>

      <div style={{width:'100%',maxWidth:400,position:'relative',zIndex:2,animation:'fadeIn .5s ease'}}>
        {children}
      </div>

      {/* Trust badges */}
      <div style={{position:'absolute',bottom:30,left:'50%',transform:'translateX(-50%)',display:'flex',gap:16,alignItems:'center'}}>
        <div style={{fontSize:12,color:'#aaa',fontWeight:500}}>🔒 Secure</div>
        <div style={{width:1,height:12,background:'#ddd'}}/>
        <div style={{fontSize:12,color:'#aaa',fontWeight:500}}>👨‍👩‍👧 Family Safe</div>
        <div style={{width:1,height:12,background:'#ddd'}}/>
        <div style={{fontSize:12,color:'#aaa',fontWeight:500}}>🆓 Free</div>
      </div>
    </div>

    <style>{`
      @media(min-width:900px){
        .landing-preview{display:flex!important}
      }
    `}</style>
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
    {Array.from({length:20},(_,i)=><div key={i} style={{position:'absolute',left:`${50+(Math.random()-.5)*60}%`,top:`${50+(Math.random()-.5)*40}%`,fontSize:8+Math.random()*16,animation:`particle 1s ease-out ${Math.random()*400}ms forwards`,opacity:0}}>{['🟡','✨','🌟','💫','🎉','🎊','🟡','🔥'][i%8]}</div>)}
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
  return <div style={{textAlign:'center',minHeight:'60vh',display:'flex',flexDirection:'column',justifyContent:'center'}}>
    <div style={{background:'linear-gradient(180deg,#fff,#FFFAF5)',padding:'clamp(32px,8vw,60px)',borderRadius:40,boxShadow:'0 20px 80px rgba(0,0,0,.08)',position:'relative',overflow:'hidden',border:'3px solid rgba(255,149,0,0.1)'}}>
      {/* Big background letter */}
      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:G,fontSize:'min(70vw,400px)',fontWeight:900,color:`${ch.color}06`,pointerEvents:'none'}}>{l.g}</div>

      <div style={{position:'relative',zIndex:2}}>
        {/* Main letter - HUGE and tappable */}
        <div onClick={()=>say(l.g)} style={{fontFamily:G,fontSize:'clamp(120px,35vw,220px)',fontWeight:900,lineHeight:1,cursor:'pointer',background:`linear-gradient(135deg,${ch.color},${ch.color}CC)`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'breathe 3s ease-in-out infinite',filter:'drop-shadow(0 10px 30px rgba(0,0,0,.1))',transition:'transform .2s'}}>{l.g}</div>

        {/* Name and sound */}
        <div style={{fontSize:'clamp(24px,5vw,36px)',fontWeight:900,marginTop:20,color:'#1C1C1E'}}>{l.r}</div>
        <div style={{fontSize:'clamp(16px,3.5vw,22px)',color:'#666',marginTop:6,fontWeight:600}}>sounds like "<span style={{color:ch.color,fontWeight:800}}>{l.s}</span>"</div>

        {/* BIG listen button */}
        <button onClick={()=>say(l.g)} style={{marginTop:28,padding:'clamp(16px,4vw,24px) clamp(36px,8vw,60px)',background:`linear-gradient(135deg,${ch.color},${ch.color}DD)`,color:'#fff',border:'none',borderRadius:60,fontSize:'clamp(18px,4vw,24px)',fontWeight:800,cursor:'pointer',fontFamily:'inherit',boxShadow:`0 12px 40px ${ch.color}50`,display:'inline-flex',alignItems:'center',gap:12,transition:'transform .2s',animation:'glow 2s ease-in-out infinite'}}>
          <span style={{fontSize:'clamp(24px,5vw,36px)'}}>🔊</span> Listen
        </button>

        {/* Description */}
        <div style={{marginTop:28,padding:'clamp(16px,4vw,24px)',background:`linear-gradient(135deg,${ch.color}10,${ch.color}05)`,borderRadius:24,fontSize:'clamp(15px,3vw,18px)',color:'#444',lineHeight:1.7,border:`2px solid ${ch.color}15`,maxWidth:500,margin:'28px auto 0'}}>{l.d}</div>
      </div>
    </div>

    {/* Progress dots */}
    <div style={{display:'flex',gap:10,marginTop:20,justifyContent:'center'}}>
      {task.d.map((_,i)=><div key={i} style={{width:i===sub?32:14,height:14,borderRadius:7,background:i<sub?'#34C759':i===sub?ch.color:'#D1D1D6',transition:'.3s',boxShadow:i===sub?`0 0 15px ${ch.color}60`:'none'}}/>)}
    </div>

    {/* Next button */}
    <button onClick={()=>{
      if(sub < task.d.length-1) { playSuccess(); setSub(sub+1); }
      else complete(task);
    }} style={{marginTop:24,padding:'clamp(18px,4vw,24px)',maxWidth:400,width:'100%',margin:'24px auto 0',background:sub<task.d.length-1?'linear-gradient(135deg,#1C1C1E,#333)':'linear-gradient(135deg,#34C759,#2FB84E)',color:'#fff',border:'none',borderRadius:60,fontSize:'clamp(18px,4vw,22px)',fontWeight:800,cursor:'pointer',fontFamily:'inherit',boxShadow:sub<task.d.length-1?'0 8px 30px rgba(0,0,0,.2)':'0 10px 40px rgba(52,199,89,.4)'}}>
      {sub<task.d.length-1?'Next Letter →':'Complete! 🎉'}
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
  const shuffledPool = useMemo(()=>shuffle(pool),[]);
  const correct = shuffledPool[round % shuffledPool.length];
  const options = useMemo(()=>shuffle([correct,...shuffle(pool.filter(p=>p.g!==correct.g)).slice(0,3)]),[round]);

  if(round>=rounds) return <div style={{textAlign:'center',padding:'clamp(40px,10vw,80px)',minHeight:'60vh',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
    <div style={{fontSize:'clamp(80px,20vw,140px)',animation:'starPop .6s ease'}}>🎉</div>
    <div style={{fontSize:'clamp(28px,6vw,42px)',fontWeight:900,marginTop:16,color:'#1C1C1E'}}>Perfect Score!</div>
    <div style={{fontSize:'clamp(16px,3.5vw,22px)',color:'#666',marginTop:8}}>You got all {rounds} right!</div>
    <button onClick={()=>{playSuccess();complete(task)}} style={{marginTop:32,padding:'clamp(18px,4vw,24px) clamp(40px,10vw,60px)',background:'linear-gradient(135deg,#34C759,#2FB84E)',color:'#fff',border:'none',borderRadius:60,fontSize:'clamp(18px,4vw,24px)',fontWeight:800,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 12px 45px rgba(52,199,89,.4)'}}>Continue! 🎉</button>
  </div>;

  return <div style={{textAlign:'center',minHeight:'70vh',display:'flex',flexDirection:'column',justifyContent:'center'}}>
    {/* Progress dots */}
    <div style={{display:'flex',justifyContent:'center',gap:10,marginBottom:28}}>
      {Array.from({length:rounds}).map((_,i)=><div key={i} style={{width:i===round?32:14,height:14,borderRadius:7,background:i<round?'#34C759':i===round?ch.color:'#D1D1D6',transition:'.3s',boxShadow:i===round?`0 0 15px ${ch.color}60`:'none'}}/>)}
    </div>

    {/* HUGE speaker button */}
    <div onClick={()=>say(correct.sp)} style={{width:'clamp(120px,30vw,180px)',height:'clamp(120px,30vw,180px)',borderRadius:'50%',background:`linear-gradient(135deg,${ch.color},${ch.color}CC)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'clamp(50px,12vw,90px)',margin:'0 auto 20px',cursor:'pointer',animation:'pulse2 2s infinite, glow 2s ease-in-out infinite',boxShadow:`0 15px 60px ${ch.color}50`,transition:'transform .2s'}}>🔊</div>

    <p style={{fontSize:'clamp(20px,5vw,28px)',fontWeight:800,color:'#1C1C1E',marginBottom:8}}>Listen & Pick!</p>
    <p style={{fontSize:'clamp(14px,3vw,18px)',color:'#888',marginBottom:28}}>Tap the speaker, then choose your answer</p>

    {/* BIG answer buttons - 2x2 grid */}
    <div style={{display:'grid',gridTemplateColumns:'repeat(2, 1fr)',gap:'clamp(12px,3vw,20px)',maxWidth:500,margin:'0 auto',width:'100%'}}>
      {options.map((o,i)=><div key={o.g+'-'+i} onClick={()=>{
        if(ans!==null)return;
        setAns(o.g);
        if(o.g===correct.g){playSuccess();say(correct.sp);setTimeout(()=>{setRound(round+1);setAns(null)},700)}
        else setTimeout(()=>setAns(null),600);
      }} style={{background:ans===o.g?(o.g===correct.g?'linear-gradient(135deg,#D4F5DC,#B8EEC2)':'linear-gradient(135deg,#FFE0E0,#FFCACA)'):'linear-gradient(135deg,#fff,#FFFAF5)',
        border:`4px solid ${ans===o.g?(o.g===correct.g?'#34C759':'#FF3B30'):'rgba(0,0,0,.06)'}`,
        borderRadius:28,padding:'clamp(20px,5vw,32px)',cursor:'pointer',transition:'.15s',
        boxShadow:ans===o.g?(o.g===correct.g?'0 8px 30px rgba(52,199,89,.3)':'0 8px 30px rgba(255,59,48,.3)'):'0 6px 25px rgba(0,0,0,.05)',
        animation:ans===o.g&&o.g!==correct.g?'shake .4s ease':'none',minHeight:'clamp(100px,20vw,140px)',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
        <div style={{fontFamily:G,fontSize:'clamp(36px,10vw,56px)',fontWeight:900,lineHeight:1,color:'#1C1C1E'}}>{o.g}</div>
        <div style={{fontSize:'clamp(14px,3vw,18px)',fontWeight:700,color:'#666',marginTop:10}}>{o.label}</div>
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
  const sd=e=>{e.preventDefault();setDrawing(true);const p=gp(e),ctx=cRef.current.getContext('2d');ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.strokeStyle=color;ctx.lineWidth=8;ctx.lineCap='round';ctx.lineJoin='round'};
  const dm=e=>{if(!drawing)return;e.preventDefault();const p=gp(e),ctx=cRef.current.getContext('2d');ctx.lineTo(p.x,p.y);ctx.stroke();ctx.beginPath();ctx.moveTo(p.x,p.y)};
  const ed=()=>setDrawing(false);

  return <div style={{textAlign:'center',minHeight:'60vh',display:'flex',flexDirection:'column',justifyContent:'center'}}>
    {/* Letter name and listen button */}
    <div style={{marginBottom:20}}>
      <div style={{fontFamily:G,fontSize:'clamp(32px,8vw,48px)',fontWeight:900,color:ch.color}}>{l.g}</div>
      <div style={{fontSize:'clamp(16px,4vw,20px)',color:'#666',fontWeight:600,marginTop:4}}>{l.r} — trace the letter!</div>
      <button onClick={()=>say(l.g)} style={{marginTop:12,padding:'12px 28px',background:`linear-gradient(135deg,${ch.color},${ch.color}DD)`,color:'#fff',border:'none',borderRadius:50,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit',boxShadow:`0 6px 20px ${ch.color}40`}}>🔊 Listen</button>
    </div>

    {/* Tracing canvas - BIGGER and more visible letter */}
    <div ref={bRef} style={{position:'relative',width:'100%',maxWidth:360,margin:'0 auto',aspectRatio:'1',borderRadius:32,overflow:'hidden',background:'linear-gradient(135deg,#fff,#FAFAFA)',border:`4px solid ${ch.color}30`,touchAction:'none',boxShadow:`0 8px 40px ${ch.color}20`}}>
      {/* Letter to trace - MORE VISIBLE (30% opacity) */}
      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:G,fontSize:'min(55vw,240px)',fontWeight:900,color:ch.color,opacity:0.3,pointerEvents:'none',zIndex:1,textShadow:`0 0 60px ${ch.color}30`}}>{l.g}</div>
      {/* Dotted outline guide */}
      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:G,fontSize:'min(55vw,240px)',fontWeight:900,WebkitTextStroke:`3px ${ch.color}`,WebkitTextFillColor:'transparent',opacity:0.5,pointerEvents:'none',zIndex:1}}>{l.g}</div>
      <canvas ref={cRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:2,cursor:'crosshair'}} onMouseDown={sd} onMouseMove={dm} onMouseUp={ed} onMouseLeave={ed} onTouchStart={sd} onTouchMove={dm} onTouchEnd={ed}/>
    </div>

    {/* Color picker and clear */}
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginTop:20}}>
      {[ch.color,'#FF2D55','#5856D6','#34C759','#1C1C1E'].map(c=><div key={c} onClick={()=>setColor(c)} style={{width:36,height:36,borderRadius:'50%',background:c,cursor:'pointer',border:color===c?'4px solid #1C1C1E':'4px solid transparent',boxShadow:color===c?'0 0 0 3px #fff, 0 4px 15px rgba(0,0,0,0.2)':'0 2px 8px rgba(0,0,0,0.1)',transition:'.2s',transform:color===c?'scale(1.15)':'scale(1)'}}/>)}
      <button onClick={()=>{const c=cRef.current;if(c)c.getContext('2d').clearRect(0,0,c.width,c.height)}} style={{marginLeft:12,padding:'12px 24px',border:'none',borderRadius:50,fontSize:15,fontWeight:700,background:'#F2F2F7',cursor:'pointer',fontFamily:'inherit'}}>Clear</button>
    </div>

    {/* Next button */}
    <button onClick={()=>{if(sub<task.d.length-1){playSuccess();setSub(sub+1)}else complete(task)}} style={{marginTop:24,padding:'18px',maxWidth:400,width:'100%',margin:'24px auto 0',background:sub<task.d.length-1?'linear-gradient(135deg,#1C1C1E,#333)':'linear-gradient(135deg,#34C759,#2FB84E)',color:'#fff',border:'none',borderRadius:50,fontSize:18,fontWeight:800,cursor:'pointer',fontFamily:'inherit',boxShadow:sub<task.d.length-1?'0 6px 25px rgba(0,0,0,.2)':'0 8px 30px rgba(52,199,89,.4)'}}>
      {sub<task.d.length-1?'Next Letter →':'Complete! 🎉'}
    </button>
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
  return <div style={{textAlign:'center',minHeight:'60vh',display:'flex',flexDirection:'column',justifyContent:'center'}}>
    <div style={{...S.card,padding:'40px 28px',borderRadius:32,background:'linear-gradient(180deg,#fff,#FAFAFA)'}}>
      {/* Big maatra symbol */}
      <div style={{position:'relative',display:'inline-block'}}>
        <div style={{fontFamily:G,fontSize:100,fontWeight:900,color:ch.color,lineHeight:1,animation:'breathe 3s ease-in-out infinite'}}>{m.sym}</div>
      </div>
      <div style={{fontSize:26,fontWeight:800,marginTop:12}}>{m.n}</div>
      <div style={{fontSize:17,color:'#666',marginTop:6}}>sounds like "<span style={{color:ch.color,fontWeight:700}}>{m.snd}</span>"</div>
      {m.d&&<div style={{fontSize:14,color:'#888',marginTop:8,padding:'10px 16px',background:`${ch.color}10`,borderRadius:12}}>{m.d}</div>}

      {/* Example words */}
      <div style={{marginTop:20,padding:16,background:'#F8F8F8',borderRadius:20}}>
        <div style={{fontSize:12,fontWeight:700,color:'#8E8E93',textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>Example Words</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
          {m.ex.map((e,i)=><div key={i} onClick={()=>say(e.w)} style={{padding:'14px',background:'#fff',borderRadius:16,cursor:'pointer',boxShadow:'0 2px 8px rgba(0,0,0,.04)',transition:'transform .2s',border:`2px solid ${ch.color}20`}}>
            <span style={{fontFamily:G,fontSize:24,fontWeight:700,color:'#1C1C1E'}}>{e.w}</span>
            <div style={{fontSize:12,color:'#888',marginTop:4}}>"{e.m}" 🔊</div>
          </div>)}
        </div>
      </div>
    </div>
    <button onClick={()=>{playSuccess();if(sub<task.d.length-1)setSub(sub+1);else complete(task)}} style={{...S.btn,marginTop:24,maxWidth:400,...(sub<task.d.length-1?S.btnDark:S.btnGreen),padding:18,fontSize:18}}>{sub<task.d.length-1?'Next Maatra →':'Complete! 🎉'}</button>
  </div>;
}

// Maatra Quiz - Listen and identify the maatra sound
function MaatraQuizGame({task, ch, complete}) {
  const [round,setRound]=useState(0);
  const [ans,setAns]=useState(null);
  const rounds = Math.min(5, task.d.length);

  // Get maatras for this quiz
  const quizMaatras = useMemo(()=>task.d.map(i=>MAATRA[i]),[]);
  const current = quizMaatras[round % quizMaatras.length];

  // Pick a random example word from the current maatra
  const exampleWord = useMemo(()=>current.ex[Math.floor(Math.random()*current.ex.length)],[round]);

  // Create 4 options including the correct one
  const options = useMemo(()=>{
    const others = MAATRA.filter(m=>m.sym!==current.sym).sort(()=>Math.random()-.5).slice(0,3);
    return shuffle([current,...others]);
  },[round]);

  if(round>=rounds) return <div style={{textAlign:'center',padding:'clamp(40px,10vw,80px)',minHeight:'60vh',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
    <div style={{fontSize:'clamp(80px,20vw,140px)',animation:'starPop .6s ease'}}>🎉</div>
    <div style={{fontSize:'clamp(28px,6vw,42px)',fontWeight:900,marginTop:16,color:'#1C1C1E'}}>Maatra Master!</div>
    <div style={{fontSize:'clamp(16px,3.5vw,22px)',color:'#666',marginTop:8}}>You got all {rounds} right!</div>
    <button onClick={()=>{playSuccess();complete(task)}} style={{marginTop:32,padding:'clamp(18px,4vw,24px) clamp(40px,10vw,60px)',background:'linear-gradient(135deg,#34C759,#2FB84E)',color:'#fff',border:'none',borderRadius:60,fontSize:'clamp(18px,4vw,24px)',fontWeight:800,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 12px 45px rgba(52,199,89,.4)'}}>Continue! 🎉</button>
  </div>;

  return <div style={{textAlign:'center',minHeight:'70vh',display:'flex',flexDirection:'column',justifyContent:'center'}}>
    {/* Progress dots */}
    <div style={{display:'flex',justifyContent:'center',gap:10,marginBottom:28}}>
      {Array.from({length:rounds}).map((_,i)=><div key={i} style={{width:i===round?32:14,height:14,borderRadius:7,background:i<round?'#34C759':i===round?ch.color:'#D1D1D6',transition:'.3s',boxShadow:i===round?`0 0 15px ${ch.color}60`:'none'}}/>)}
    </div>

    <p style={{fontSize:'clamp(18px,4vw,24px)',fontWeight:700,color:'#666',marginBottom:8}}>Which maatra is in this word?</p>

    {/* Show the word and play button */}
    <div onClick={()=>say(exampleWord.w)} style={{display:'inline-block',margin:'0 auto 20px',padding:'24px 40px',background:`linear-gradient(135deg,${ch.color},${ch.color}CC)`,borderRadius:24,cursor:'pointer',boxShadow:`0 12px 40px ${ch.color}40`}}>
      <div style={{fontFamily:G,fontSize:'clamp(40px,12vw,70px)',fontWeight:900,color:'#fff'}}>{exampleWord.w}</div>
      <div style={{fontSize:16,color:'rgba(255,255,255,0.9)',marginTop:8}}>"{exampleWord.m}" — Tap to hear! 🔊</div>
    </div>

    {/* 4 maatra options */}
    <div style={{display:'grid',gridTemplateColumns:'repeat(2, 1fr)',gap:'clamp(12px,3vw,20px)',maxWidth:400,margin:'0 auto',width:'100%'}}>
      {options.map((m,i)=><div key={m.sym+'-'+i} onClick={()=>{
        if(ans!==null)return;
        setAns(m.sym);
        if(m.sym===current.sym){playSuccess();setTimeout(()=>{setRound(round+1);setAns(null)},700)}
        else setTimeout(()=>setAns(null),600);
      }} style={{background:ans===m.sym?(m.sym===current.sym?'linear-gradient(135deg,#D4F5DC,#B8EEC2)':'linear-gradient(135deg,#FFE0E0,#FFCACA)'):'linear-gradient(135deg,#fff,#FFFAF5)',
        border:`4px solid ${ans===m.sym?(m.sym===current.sym?'#34C759':'#FF3B30'):'rgba(0,0,0,.06)'}`,
        borderRadius:24,padding:'clamp(16px,4vw,28px)',cursor:'pointer',transition:'.15s',
        boxShadow:ans===m.sym?(m.sym===current.sym?'0 8px 30px rgba(52,199,89,.3)':'0 8px 30px rgba(255,59,48,.3)'):'0 6px 25px rgba(0,0,0,.05)',
        animation:ans===m.sym&&m.sym!==current.sym?'shake .4s ease':'none'}}>
        <div style={{fontFamily:G,fontSize:'clamp(36px,10vw,56px)',fontWeight:900,lineHeight:1,color:'#1C1C1E'}}>{m.sym}</div>
        <div style={{fontSize:'clamp(12px,3vw,16px)',fontWeight:700,color:'#888',marginTop:8}}>{m.n} ({m.snd})</div>
      </div>)}
    </div>
  </div>;
}

// Maatra Spell Game - Spell words that have maatras
function MaatraSpellGame({task, ch, complete}) {
  const [wi,setWi]=useState(0);
  const [filled,setFilled]=useState([]);
  const [wrong,setWrong]=useState(false);

  // Get maatra words for spelling
  const words = useMemo(()=>task.d.map(i=>MAATRA_WORDS[i]).filter(Boolean),[]);
  if(words.length===0) return <div style={{textAlign:'center',padding:40}}>No words available</div>;

  const w = words[wi];
  const tiles = useMemo(()=>shuffle([...w.l]),[wi]);

  const add=(l,i)=>{
    if(filled.some(f=>f.i===i))return;
    const nf=[...filled,{l,i}];setFilled(nf);
    if(nf.length===w.l.length){
      if(nf.map(f=>f.l).join('')===w.l.join('')){
        playSuccess();say(w.w);
        setTimeout(()=>{if(wi<words.length-1){setWi(wi+1);setFilled([])}else complete(task)},900);
      } else {
        setWrong(true);
        setTimeout(()=>{setFilled([]);setWrong(false)},800);
      }
    }
  };

  return <div style={{textAlign:'center',minHeight:'60vh',display:'flex',flexDirection:'column',justifyContent:'center'}}>
    <div style={{fontSize:50,marginBottom:8}}>{w.e}</div>
    <div style={{fontSize:22,fontWeight:800,marginBottom:4}}>Spell "{w.m}"</div>
    <div style={{fontSize:14,color:ch.color,fontWeight:600,marginBottom:4}}>Uses: {w.maatra} ({MAATRA.find(m=>m.sym===w.maatra)?.n})</div>
    <div style={{fontSize:13,color:'#8E8E93',marginBottom:20}}>{wi+1} of {words.length}</div>

    {wrong&&<div style={{fontSize:16,fontWeight:700,color:'#FF3B30',marginBottom:12,animation:'shake .4s ease'}}>Oops! Try again 💪</div>}

    {/* Slots for letters */}
    <div style={{display:'flex',justifyContent:'center',gap:8,marginBottom:24,flexWrap:'wrap'}}>
      {w.l.map((_,i)=><div key={i} onClick={()=>{if(filled[i])setFilled(filled.filter((_,j)=>j!==i))}}
        style={{width:48,height:54,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:G,fontSize:22,fontWeight:700,cursor:'pointer',
        background:filled[i]?(wrong?'#FFF0F0':'#fff'):'rgba(0,0,0,.02)',
        border:filled[i]?`3px solid ${wrong?'#FF3B30':ch.color}`:'3px dashed rgba(0,0,0,.1)',
        animation:wrong&&filled[i]?'shake .4s ease':'none',
        boxShadow:filled[i]?'0 4px 12px rgba(0,0,0,.08)':'none',
        transition:'.2s'}}>{filled[i]?.l||''}</div>)}
    </div>

    {/* Letter tiles to drag */}
    <div style={{display:'flex',justifyContent:'center',gap:10,flexWrap:'wrap',maxWidth:360,margin:'0 auto'}}>
      {tiles.map((l,i)=><div key={i} onClick={()=>add(l,i)}
        style={{width:52,height:58,borderRadius:16,background:'linear-gradient(180deg,#fff,#F8F8F8)',border:'2px solid rgba(0,0,0,.06)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:G,fontSize:24,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 12px rgba(0,0,0,.06)',
        opacity:filled.some(f=>f.i===i)?0.2:1,pointerEvents:filled.some(f=>f.i===i)?'none':'auto',transition:'.2s',transform:filled.some(f=>f.i===i)?'scale(0.9)':'scale(1)'}}>{l}</div>)}
    </div>

    {/* Listen button */}
    <button onClick={()=>say(w.w)} style={{marginTop:24,padding:'12px 28px',background:ch.color,color:'#fff',border:'none',borderRadius:50,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit',boxShadow:`0 4px 16px ${ch.color}40`}}>🔊 Hear the word</button>
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

// ═══════════════ FUN GAMES SECTION ═══════════════

// Balloon Pop Game - Pop balloons with the correct letter
function BalloonPopGame({onBack, onScore}) {
  const [balloons, setBalloons] = useState([]);
  const [targetIdx, setTargetIdx] = useState(() => Math.floor(Math.random() * L.length));
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [started, setStarted] = useState(false);
  const [popEffects, setPopEffects] = useState([]);
  const [confetti, setConfetti] = useState([]);
  const scoreRef = useRef(0);
  const balloonIdRef = useRef(0);
  const usedLetterIndicesRef = useRef(new Set());

  const BALLOON_COLORS = [
    {main:'#FF6B6B',shine:'#FFB3B3',shadow:'#E64545'},
    {main:'#4ECDC4',shine:'#8EEBE5',shadow:'#2DB5AC'},
    {main:'#FFE66D',shine:'#FFF2B3',shadow:'#E6CC45'},
    {main:'#FF9FF3',shine:'#FFCFF9',shadow:'#E67FD9'},
    {main:'#54E346',shine:'#8FF285',shadow:'#3BC92F'},
    {main:'#48DBFB',shine:'#8AEBFF',shadow:'#20C5E8'},
    {main:'#FF9F43',shine:'#FFCF9E',shadow:'#E68526'},
    {main:'#A29BFE',shine:'#D0CDFF',shadow:'#7B73E6'},
  ];
  const target = L[targetIdx];

  useEffect(() => { scoreRef.current = score; }, [score]);

  useEffect(() => {
    if (target && started) say(target.g);
  }, [targetIdx, started]);

  // Pick new target from remaining balloons or random
  const pickNewTarget = useCallback(() => {
    // Get letters currently on screen (excluding the one just popped)
    setBalloons(prev => {
      const onScreenLetters = prev.map(b => b.letter.g);
      if (onScreenLetters.length > 0) {
        // Pick a letter that's already on screen
        const randomOnScreen = onScreenLetters[Math.floor(Math.random() * onScreenLetters.length)];
        const newIdx = L.findIndex(l => l.g === randomOnScreen);
        if (newIdx !== -1) {
          setTargetIdx(newIdx);
          return prev;
        }
      }
      // Fallback: pick random
      let newIdx;
      do {
        newIdx = Math.floor(Math.random() * L.length);
      } while (newIdx === targetIdx);
      setTargetIdx(newIdx);
      return prev;
    });
  }, [targetIdx]);

  // Spawn balloons with DIFFERENT letters
  useEffect(() => {
    if (gameOver || !started) return;

    const spawnBalloon = (forceTarget = false) => {
      const currentTarget = L[targetIdx];

      // Count current balloons
      setBalloons(prev => {
        // Check if we need a target balloon
        const targetCount = prev.filter(b => b.letter.g === currentTarget.g).length;
        const needsTarget = targetCount === 0 || forceTarget;

        let letter;
        let letterIdx;

        if (needsTarget) {
          letter = currentTarget;
          letterIdx = targetIdx;
        } else {
          // Pick a DIFFERENT letter not currently on screen
          const onScreenLetters = new Set(prev.map(b => b.letter.g));
          let attempts = 0;
          do {
            letterIdx = Math.floor(Math.random() * L.length);
            letter = L[letterIdx];
            attempts++;
          } while ((onScreenLetters.has(letter.g) || letter.g === currentTarget.g) && attempts < 30);

          // If we couldn't find a unique letter, just use any different letter
          if (attempts >= 30) {
            letterIdx = Math.floor(Math.random() * L.length);
            letter = L[letterIdx];
          }
        }

        const colorSet = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
        balloonIdRef.current += 1;

        return [...prev, {
          id: balloonIdRef.current,
          letter: letter,
          x: 8 + Math.random() * 80,
          colors: colorSet,
          isTarget: letter.g === currentTarget.g,
          speed: 0.15 + Math.random() * 0.08,
          y: -8 - Math.random() * 5,
          wobble: Math.random() * 360,
          wobbleSpeed: 1.2 + Math.random() * 0.8,
          size: 68 + Math.random() * 14,
        }];
      });
    };

    // Spawn initial balloons - mix of target and different letters
    spawnBalloon(true); // First one is target
    setTimeout(() => spawnBalloon(false), 200);
    setTimeout(() => spawnBalloon(false), 400);
    setTimeout(() => spawnBalloon(false), 600);
    setTimeout(() => spawnBalloon(true), 800); // Another target

    // Continue spawning mix of letters
    const interval = setInterval(() => {
      setBalloons(prev => {
        const targetCount = prev.filter(b => b.letter.g === L[targetIdx].g).length;
        // 30% chance for target, or if no targets on screen
        spawnBalloon(targetCount === 0 || Math.random() < 0.3);
        return prev;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [gameOver, started, targetIdx]);

  // Update isTarget when target changes
  useEffect(() => {
    setBalloons(prev => prev.map(b => ({
      ...b,
      isTarget: b.letter.g === L[targetIdx].g
    })));
  }, [targetIdx]);

  // Animate balloons
  useEffect(() => {
    if (gameOver || !started) return;
    const animate = setInterval(() => {
      setBalloons(prev => {
        let lostLife = false;
        const updated = prev.map(b => ({
          ...b,
          y: b.y + b.speed,
          wobble: b.wobble + b.wobbleSpeed,
        })).filter(b => {
          if (b.y > 100) {
            if (b.isTarget) lostLife = true;
            return false;
          }
          return true;
        });
        if (lostLife) setLives(l => Math.max(0, l - 1));
        return updated;
      });
      setPopEffects(prev => prev.filter(p => Date.now() - p.time < 800));
      setConfetti(prev => prev.filter(c => Date.now() - c.time < 1500));
    }, 45);
    return () => clearInterval(animate);
  }, [gameOver, started]);

  useEffect(() => {
    if (lives <= 0 && !gameOver) {
      setGameOver(true);
      onScore?.(scoreRef.current);
    }
  }, [lives, gameOver, onScore]);

  const popBalloon = (balloon, e) => {
    if (gameOver) return;
    e?.stopPropagation?.();

    if (balloon.isTarget) {
      playSuccess();

      // Pop ALL target balloons (same letter)
      const matchingBalloons = balloons.filter(b => b.letter.g === balloon.letter.g);

      matchingBalloons.forEach((b, idx) => {
        setPopEffects(prev => [...prev, {
          id: Date.now() + idx,
          x: b.x, y: b.y,
          color: b.colors.main,
          time: Date.now(),
          isCorrect: true,
        }]);
      });

      // Confetti!
      const newConfetti = [];
      for (let i = 0; i < 20; i++) {
        newConfetti.push({
          id: Date.now() + i,
          x: balloon.x + (Math.random() - 0.5) * 15,
          y: balloon.y,
          color: BALLOON_COLORS[Math.floor(Math.random() * 8)].main,
          vx: (Math.random() - 0.5) * 8,
          vy: -Math.random() * 5 - 2,
          rotation: Math.random() * 360,
          time: Date.now(),
          shape: Math.random() > 0.5 ? 'circle' : 'star',
        });
      }
      setConfetti(prev => [...prev, ...newConfetti]);

      // Remove all matching target balloons, keep others
      setBalloons(prev => prev.filter(b => b.letter.g !== balloon.letter.g));

      const points = (10 + combo * 3) * matchingBalloons.length;
      setScore(s => s + points);
      setCombo(c => c + 1);

      // Pick new target after a tiny delay
      setTimeout(pickNewTarget, 100);
    } else {
      // Wrong balloon - only pop this one
      setPopEffects(prev => [...prev, {
        id: Date.now(),
        x: balloon.x, y: balloon.y,
        color: '#FF3B30',
        time: Date.now(),
        isCorrect: false,
      }]);
      setBalloons(prev => prev.filter(b => b.id !== balloon.id));
      setLives(l => Math.max(0, l - 1));
      setCombo(0);
    }
  };

  const restartGame = () => {
    setScore(0);
    setLives(5);
    setGameOver(false);
    setCombo(0);
    setBalloons([]);
    setPopEffects([]);
    setConfetti([]);
    setElapsedTime(0);
    activeLettersRef.current.clear();
    balloonIdRef.current = 0;
    setStarted(true);
    pickNewTarget();
  };

  // Fun colorful start screen
  if (!started && !gameOver) {
    return (
      <div style={{textAlign:'center',padding:40,minHeight:'80vh',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',background:'linear-gradient(180deg,#667eea 0%,#764ba2 50%,#f093fb 100%)',borderRadius:24,position:'relative',overflow:'hidden'}}>
        {/* Floating decorative balloons */}
        <div style={{position:'absolute',top:'10%',left:'10%',fontSize:60,animation:'float 3s ease-in-out infinite'}}>🎈</div>
        <div style={{position:'absolute',top:'20%',right:'15%',fontSize:50,animation:'float 2.5s ease-in-out infinite',animationDelay:'-1s'}}>🎈</div>
        <div style={{position:'absolute',bottom:'20%',left:'20%',fontSize:45,animation:'float 3.5s ease-in-out infinite',animationDelay:'-2s'}}>🎈</div>
        <div style={{position:'absolute',bottom:'15%',right:'10%',fontSize:55,animation:'float 2.8s ease-in-out infinite',animationDelay:'-0.5s'}}>🎈</div>
        {/* Stars */}
        <div style={{position:'absolute',top:'15%',left:'30%',fontSize:30,animation:'sparkle 1.5s ease-in-out infinite'}}>✨</div>
        <div style={{position:'absolute',top:'25%',right:'25%',fontSize:25,animation:'sparkle 1.8s ease-in-out infinite',animationDelay:'-0.5s'}}>⭐</div>

        <div style={{fontSize:120,marginBottom:20,animation:'bounce2 1s ease-in-out infinite',filter:'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',position:'relative',zIndex:1}}>🎈</div>
        <h2 style={{fontSize:42,fontWeight:900,color:'#fff',textShadow:'0 4px 15px rgba(0,0,0,0.3)',marginBottom:10,position:'relative',zIndex:1}}>Balloon Pop!</h2>
        <p style={{fontSize:20,color:'rgba(255,255,255,0.9)',margin:'16px 0',maxWidth:320,position:'relative',zIndex:1}}>Pop the balloons with the correct Punjabi letter! 🎉</p>
        <button onClick={()=>setStarted(true)} style={{padding:'22px 55px',background:'linear-gradient(135deg,#FFE66D,#FF9F43)',color:'#333',border:'none',borderRadius:60,fontSize:26,fontWeight:900,cursor:'pointer',boxShadow:'0 10px 40px rgba(255,159,67,0.5)',transform:'scale(1)',transition:'all 0.2s',position:'relative',zIndex:1}} onMouseOver={e=>{e.target.style.transform='scale(1.08)';e.target.style.boxShadow='0 15px 50px rgba(255,159,67,0.6)'}} onMouseOut={e=>{e.target.style.transform='scale(1)';e.target.style.boxShadow='0 10px 40px rgba(255,159,67,0.5)'}}>🎮 Let's Play!</button>
        <button onClick={onBack} style={{marginTop:20,padding:'14px 28px',background:'rgba(255,255,255,0.2)',color:'#fff',border:'none',borderRadius:30,fontSize:18,cursor:'pointer',position:'relative',zIndex:1}}>← Back</button>
      </div>
    );
  }

  if (gameOver) {
    const ladoosEarned = Math.floor(score / 10);
    return (
      <div style={{textAlign:'center',padding:40,minHeight:'80vh',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',background:'linear-gradient(180deg,#667eea 0%,#764ba2 50%,#f093fb 100%)',borderRadius:24,position:'relative',overflow:'hidden'}}>
        {/* Celebration effects */}
        <div style={{position:'absolute',top:'10%',left:'10%',fontSize:50,animation:'bounce2 1s ease-in-out infinite'}}>🎊</div>
        <div style={{position:'absolute',top:'15%',right:'10%',fontSize:45,animation:'bounce2 1.2s ease-in-out infinite'}}>🎉</div>
        <div style={{position:'absolute',bottom:'20%',left:'15%',fontSize:40,animation:'bounce2 0.9s ease-in-out infinite'}}>⭐</div>
        <div style={{position:'absolute',bottom:'25%',right:'15%',fontSize:55,animation:'bounce2 1.1s ease-in-out infinite'}}>🌟</div>

        <div style={{fontSize:100,marginBottom:20,animation:'bounce2 1s ease-in-out infinite'}}>🏆</div>
        <h2 style={{fontSize:38,fontWeight:900,color:'#fff',textShadow:'0 4px 15px rgba(0,0,0,0.3)'}}>Amazing Job!</h2>
        <div style={{fontSize:60,fontWeight:900,color:'#FFE66D',margin:'20px 0',textShadow:'0 4px 20px rgba(255,230,109,0.5)'}}>🟡 {score}</div>
        <div style={{fontSize:24,color:'rgba(255,255,255,0.95)',marginBottom:8,fontWeight:700}}>+{ladoosEarned} Ladoos! 🍬</div>
        <div style={{display:'flex',gap:16,marginTop:28}}>
          <button onClick={restartGame} style={{padding:'18px 40px',background:'linear-gradient(135deg,#FFE66D,#FF9F43)',color:'#333',border:'none',borderRadius:50,fontSize:20,fontWeight:800,cursor:'pointer',boxShadow:'0 8px 30px rgba(255,159,67,0.4)'}}>🔄 Play Again!</button>
          <button onClick={onBack} style={{padding:'18px 40px',background:'rgba(255,255,255,0.25)',color:'#fff',border:'none',borderRadius:50,fontSize:20,fontWeight:700,cursor:'pointer'}}>🏠 Back</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{position:'relative',width:'100%',height:'85vh',background:'linear-gradient(180deg,#74b9ff 0%,#81ecec 35%,#a8e6cf 70%,#55efc4 100%)',borderRadius:24,overflow:'hidden',touchAction:'none'}}>
      {/* Happy Sun */}
      <div style={{position:'absolute',top:12,right:15,width:65,height:65,background:'radial-gradient(circle,#FFEAA7 0%,#FDCB6E 50%,#F39C12 100%)',borderRadius:'50%',boxShadow:'0 0 50px #FDCB6E',zIndex:1,display:'flex',alignItems:'center',justifyContent:'center',fontSize:35}}>😊</div>

      {/* Rainbow */}
      <div style={{position:'absolute',top:-50,left:'50%',transform:'translateX(-50%)',width:300,height:150,borderRadius:'150px 150px 0 0',background:'conic-gradient(from 180deg, #FF6B6B, #FFE66D, #54E346, #48DBFB, #A29BFE, #FF9FF3, #FF6B6B)',opacity:0.3,zIndex:0}}/>

      {/* Fluffy Clouds */}
      <div style={{position:'absolute',top:20,left:'8%',fontSize:65,opacity:0.8,animation:'drift 25s linear infinite',filter:'drop-shadow(0 5px 15px rgba(255,255,255,0.5))'}}>☁️</div>
      <div style={{position:'absolute',top:50,right:'5%',fontSize:55,opacity:0.7,animation:'drift 30s linear infinite',animationDelay:'-8s'}}>☁️</div>
      <div style={{position:'absolute',top:35,left:'45%',fontSize:45,opacity:0.6,animation:'drift 35s linear infinite',animationDelay:'-15s'}}>☁️</div>

      {/* Flying birds */}
      <div style={{position:'absolute',top:'12%',left:'20%',fontSize:22,animation:'drift 15s linear infinite'}}>🐦</div>
      <div style={{position:'absolute',top:'18%',left:'25%',fontSize:18,animation:'drift 15s linear infinite',animationDelay:'-0.3s'}}>🐦</div>

      {/* Cute ground with flowers */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:45,background:'linear-gradient(180deg,#00b894 0%,#00a085 100%)',borderRadius:'50% 50% 0 0 / 20px 20px 0 0'}}>
        <div style={{position:'absolute',bottom:15,left:'10%',fontSize:22}}>🌸</div>
        <div style={{position:'absolute',bottom:20,left:'25%',fontSize:18}}>🌼</div>
        <div style={{position:'absolute',bottom:12,left:'45%',fontSize:24}}>🌺</div>
        <div style={{position:'absolute',bottom:18,left:'65%',fontSize:20}}>🌻</div>
        <div style={{position:'absolute',bottom:14,left:'85%',fontSize:22}}>🌷</div>
      </div>

      {/* HUD - Lives and Score */}
      <div style={{position:'absolute',top:12,left:12,right:12,display:'flex',justifyContent:'space-between',alignItems:'center',zIndex:10}}>
        <div style={{display:'flex',gap:4,background:'rgba(255,255,255,0.9)',padding:'8px 14px',borderRadius:30,boxShadow:'0 4px 15px rgba(0,0,0,0.1)'}}>
          {[0,1,2,3,4].map(i => <span key={i} style={{fontSize:24,opacity:i<lives?1:0.2,transition:'all 0.3s',transform:i<lives?'scale(1)':'scale(0.8)'}}>{i<lives?'❤️':'🖤'}</span>)}
        </div>
        <div style={{padding:'10px 22px',background:'linear-gradient(135deg,#FFEAA7,#FDCB6E)',borderRadius:50,fontWeight:900,fontSize:22,boxShadow:'0 6px 20px rgba(253,203,110,0.4)',color:'#333'}}>🟡 {score}</div>
      </div>

      {/* Target letter card - Big and colorful */}
      <div style={{position:'absolute',top:55,left:'50%',transform:'translateX(-50%)',textAlign:'center',zIndex:10,background:'linear-gradient(135deg,#fff 0%,#f8f9fa 100%)',padding:'16px 32px',borderRadius:28,boxShadow:'0 10px 40px rgba(0,0,0,0.15)',border:'4px solid #FFE66D'}}>
        <div style={{fontSize:13,fontWeight:800,color:'#e17055',textTransform:'uppercase',letterSpacing:2}}>🎯 Find & Pop!</div>
        <div onClick={()=>say(target.g)} style={{fontFamily:G,fontSize:56,fontWeight:900,color:'#6c5ce7',cursor:'pointer',textShadow:'0 4px 10px rgba(108,92,231,0.3)',margin:'4px 0'}}>{target.g}</div>
        <div style={{fontSize:14,color:'#636e72',display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontWeight:600}}>{target.r} <span style={{fontSize:18,cursor:'pointer'}} onClick={()=>say(target.g)}>🔊</span></div>
        {combo > 1 && <div style={{fontSize:16,fontWeight:900,color:'#e84393',marginTop:6,animation:'pulse2 0.5s ease-in-out infinite'}}>🔥 {combo}x COMBO! 🔥</div>}
      </div>

      {/* Confetti */}
      {confetti.map(c => {
        const age = Date.now() - c.time;
        const progress = age / 1500;
        const x = c.x + c.vx * progress * 20;
        const y = c.y - c.vy * progress * 15 + progress * progress * 50;
        return (
          <div key={c.id} style={{
            position:'absolute',
            left:`${x}%`,
            bottom:`${Math.max(0, 100 - y)}%`,
            width: c.shape === 'star' ? 0 : 12,
            height: c.shape === 'star' ? 0 : 12,
            background: c.shape === 'circle' ? c.color : 'transparent',
            borderRadius: c.shape === 'circle' ? '50%' : 0,
            borderLeft: c.shape === 'star' ? '6px solid transparent' : 'none',
            borderRight: c.shape === 'star' ? '6px solid transparent' : 'none',
            borderBottom: c.shape === 'star' ? `12px solid ${c.color}` : 'none',
            transform:`rotate(${c.rotation + progress * 720}deg)`,
            opacity:1 - progress,
            pointerEvents:'none',
            zIndex:25,
          }}/>
        );
      })}

      {/* Pop Effects */}
      {popEffects.map(pop => {
        const age = Date.now() - pop.time;
        const progress = Math.min(age / 800, 1);
        return (
          <div key={pop.id} style={{position:'absolute',left:`${pop.x}%`,bottom:`${pop.y}%`,transform:'translate(-50%, 50%)',pointerEvents:'none',zIndex:20}}>
            {/* Starburst */}
            {[...Array(12)].map((_, i) => {
              const angle = (i / 12) * 360;
              const distance = 20 + progress * 80;
              const x = Math.cos(angle * Math.PI / 180) * distance;
              const y = Math.sin(angle * Math.PI / 180) * distance;
              return (
                <div key={i} style={{
                  position:'absolute',
                  left:x,
                  top:-y,
                  width:16 - progress * 12,
                  height:16 - progress * 12,
                  background:pop.isCorrect ? ['#FFE66D','#FF6B6B','#4ECDC4','#FF9FF3','#54E346'][i%5] : '#FF3B30',
                  borderRadius:i%2===0?'50%':'2px',
                  opacity:1 - progress,
                  transform:`rotate(${progress * 180}deg)`,
                }}/>
              );
            })}
            {/* Center emoji */}
            <div style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%, -50%)',fontSize:45 + progress * 25,opacity:1 - progress}}>
              {pop.isCorrect ? '💥' : '😢'}
            </div>
          </div>
        );
      })}

      {/* Balloons - Big, cute, with faces */}
      {balloons.map(b => {
        const wobbleX = Math.sin(b.wobble * Math.PI / 180) * 8;
        const wobbleRot = Math.sin(b.wobble * Math.PI / 180) * 8;
        return (
          <div key={b.id} onClick={(e) => popBalloon(b, e)} style={{
            position:'absolute',
            left:`calc(${b.x}% + ${wobbleX}px)`,
            bottom:`${b.y}%`,
            transform:`translateX(-50%) rotate(${wobbleRot}deg)`,
            cursor:'pointer',
            zIndex:5,
            transition:'transform 0.1s ease-out',
          }}>
            {/* Balloon body - bigger and rounder */}
            <div style={{
              width:b.size,
              height:b.size * 1.15,
              background:`radial-gradient(ellipse at 35% 25%, ${b.colors.shine} 0%, ${b.colors.main} 50%, ${b.colors.shadow} 100%)`,
              borderRadius:'50% 50% 45% 45%',
              display:'flex',
              flexDirection:'column',
              alignItems:'center',
              justifyContent:'center',
              fontFamily:G,
              fontSize:b.size * 0.38,
              fontWeight:900,
              color:'#fff',
              boxShadow:`0 12px 35px ${b.colors.main}50, inset 0 -10px 25px ${b.colors.shadow}30, inset 0 10px 25px ${b.colors.shine}40`,
              textShadow:'0 3px 6px rgba(0,0,0,0.25)',
              border:b.isTarget ? `5px solid #FFE66D` : '3px solid rgba(255,255,255,0.3)',
              position:'relative',
              animation:b.isTarget ? 'pulse2 0.8s ease-in-out infinite' : 'none',
            }}>
              {/* Big shine */}
              <div style={{position:'absolute',top:'12%',left:'18%',width:'35%',height:'25%',background:'rgba(255,255,255,0.6)',borderRadius:'50%',filter:'blur(4px)'}}/>
              {/* Small shine */}
              <div style={{position:'absolute',top:'38%',left:'55%',width:'12%',height:'10%',background:'rgba(255,255,255,0.5)',borderRadius:'50%',filter:'blur(2px)'}}/>
              {/* Letter */}
              <span style={{position:'relative',zIndex:2}}>{b.letter.g}</span>
              {/* Cute face for target */}
              {b.isTarget && <span style={{fontSize:b.size * 0.18,marginTop:-4}}>⭐</span>}
            </div>
            {/* Knot */}
            <div style={{width:0,height:0,borderLeft:'8px solid transparent',borderRight:'8px solid transparent',borderTop:`14px solid ${b.colors.shadow}`,margin:'-2px auto 0'}}/>
            {/* Curvy string */}
            <svg width="24" height="40" style={{display:'block',margin:'0 auto'}}>
              <path d={`M12,0 Q${6 + Math.sin(b.wobble * 0.5 * Math.PI / 180) * 5},12 12,24 Q${18 + Math.sin(b.wobble * 0.7 * Math.PI / 180) * 4},36 12,40`} stroke="#aaa" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
        );
      })}

      {/* Back button */}
      <button onClick={onBack} style={{position:'absolute',bottom:55,left:12,padding:'12px 22px',background:'rgba(255,255,255,0.95)',borderRadius:50,border:'none',fontSize:16,fontWeight:800,cursor:'pointer',zIndex:10,boxShadow:'0 6px 20px rgba(0,0,0,0.15)',color:'#6c5ce7'}}>← Back</button>
    </div>
  );
}

// Letter Rain Game - Catch falling letters in bucket
// Feed the Monster - Tap the correct letters!
function LetterRainGame({onBack, onScore}) {
  const [letters, setLetters] = useState([]);
  const [targetIdx, setTargetIdx] = useState(() => Math.floor(Math.random() * L.length));
  const [score, setScore] = useState(0);
  const [fed, setFed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [effects, setEffects] = useState([]);
  const [monsterMood, setMonsterMood] = useState('hungry');
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(5);
  const scoreRef = useRef(0);
  const letterIdRef = useRef(0);

  const target = L[targetIdx];
  const GOAL = 10; // Feed monster 10 times to win

  useEffect(() => { scoreRef.current = score; }, [score]);

  useEffect(() => {
    if (target && started) say(target.g);
  }, [targetIdx, started]);

  const pickNewTarget = useCallback(() => {
    let newIdx;
    do {
      newIdx = Math.floor(Math.random() * L.length);
    } while (newIdx === targetIdx);
    setTargetIdx(newIdx);
  }, [targetIdx]);

  // Spawn letters floating around
  useEffect(() => {
    if (gameOver || !started) return;

    const spawnLetter = () => {
      const currentTarget = L[targetIdx];
      // Always have mix of target and other letters
      setLetters(prev => {
        const targetCount = prev.filter(l => l.letter.g === currentTarget.g).length;
        const needsTarget = targetCount < 2;

        let letter;
        if (needsTarget || Math.random() < 0.35) {
          letter = currentTarget;
        } else {
          // Pick different letter
          const onScreen = new Set(prev.map(l => l.letter.g));
          let attempts = 0;
          do {
            letter = L[Math.floor(Math.random() * L.length)];
            attempts++;
          } while ((onScreen.has(letter.g) || letter.g === currentTarget.g) && attempts < 20);
        }

        letterIdRef.current += 1;
        const colors = ['#FF6B6B','#4ECDC4','#FFE66D','#FF9FF3','#54E346','#48DBFB','#A29BFE','#FF9F43'];

        return [...prev, {
          id: letterIdRef.current,
          letter,
          x: 10 + Math.random() * 75,
          y: 15 + Math.random() * 50,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.2,
          isTarget: letter.g === currentTarget.g,
          wobble: Math.random() * 360,
          color: colors[Math.floor(Math.random() * colors.length)],
          scale: 1,
          popping: false,
        }];
      });
    };

    // Spawn initial letters
    for (let i = 0; i < 6; i++) {
      setTimeout(spawnLetter, i * 200);
    }

    const interval = setInterval(spawnLetter, 1500);
    return () => clearInterval(interval);
  }, [gameOver, started, targetIdx]);

  // Update isTarget when target changes
  useEffect(() => {
    setLetters(prev => prev.map(l => ({
      ...l,
      isTarget: l.letter.g === L[targetIdx].g
    })));
  }, [targetIdx]);

  // Animate letters floating
  useEffect(() => {
    if (gameOver || !started) return;
    const animate = setInterval(() => {
      setLetters(prev => prev.map(l => {
        if (l.popping) return l;
        let newX = l.x + l.vx;
        let newY = l.y + l.vy;
        let newVx = l.vx;
        let newVy = l.vy;

        // Bounce off walls
        if (newX < 5 || newX > 90) newVx = -newVx * 0.8;
        if (newY < 12 || newY > 65) newVy = -newVy * 0.8;

        // Add gentle random movement
        newVx += (Math.random() - 0.5) * 0.02;
        newVy += (Math.random() - 0.5) * 0.02;

        // Limit speed
        newVx = Math.max(-0.4, Math.min(0.4, newVx));
        newVy = Math.max(-0.3, Math.min(0.3, newVy));

        return {
          ...l,
          x: Math.max(5, Math.min(90, newX)),
          y: Math.max(12, Math.min(65, newY)),
          vx: newVx,
          vy: newVy,
          wobble: l.wobble + 2,
        };
      }).filter(l => !l.popping || Date.now() - l.popTime < 500));

      setEffects(prev => prev.filter(e => Date.now() - e.time < 800));
    }, 40);
    return () => clearInterval(animate);
  }, [gameOver, started]);

  // Win/lose conditions
  useEffect(() => {
    if (fed >= GOAL && !gameOver) {
      setGameOver(true);
      onScore?.(scoreRef.current + 50);
    }
    if (lives <= 0 && !gameOver) {
      setGameOver(true);
      onScore?.(scoreRef.current);
    }
  }, [fed, lives, gameOver, onScore]);

  const tapLetter = (letter, e) => {
    if (gameOver || letter.popping) return;
    e?.stopPropagation?.();

    if (letter.isTarget) {
      playSuccess();

      // Find all matching letters
      const matching = letters.filter(l => l.letter.g === letter.letter.g);

      // Create effects for each
      matching.forEach((l, i) => {
        setEffects(prev => [...prev, {
          id: Date.now() + i,
          x: l.x, y: l.y,
          time: Date.now(),
          isCorrect: true,
        }]);
      });

      // Mark as popping and remove
      setLetters(prev => prev.filter(l => l.letter.g !== letter.letter.g));

      // Score and progress
      const points = (15 + combo * 5) * matching.length;
      setScore(s => s + points);
      setCombo(c => c + 1);
      setFed(f => f + 1);
      setMonsterMood('happy');
      setTimeout(() => setMonsterMood('hungry'), 800);
      setTimeout(pickNewTarget, 200);
    } else {
      // Wrong letter
      setEffects(prev => [...prev, {
        id: Date.now(),
        x: letter.x, y: letter.y,
        time: Date.now(),
        isCorrect: false,
      }]);
      setLetters(prev => prev.filter(l => l.id !== letter.id));
      setLives(l => l - 1);
      setCombo(0);
      setMonsterMood('sad');
      setTimeout(() => setMonsterMood('hungry'), 600);
    }
  };

  const restartGame = () => {
    setScore(0);
    setFed(0);
    setLives(5);
    setGameOver(false);
    setLetters([]);
    setEffects([]);
    setCombo(0);
    setMonsterMood('hungry');
    letterIdRef.current = 0;
    setStarted(true);
    pickNewTarget();
  };

  // Cute start screen
  if (!started && !gameOver) {
    return (
      <div style={{textAlign:'center',padding:40,minHeight:'80vh',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',background:'linear-gradient(180deg,#a8e6cf 0%,#88d8b0 50%,#ffecd2 100%)',borderRadius:24,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'8%',left:'8%',fontSize:45,animation:'float 3s ease-in-out infinite'}}>🍎</div>
        <div style={{position:'absolute',top:'12%',right:'12%',fontSize:40,animation:'float 2.5s ease-in-out infinite',animationDelay:'-1s'}}>🍕</div>
        <div style={{position:'absolute',bottom:'20%',left:'15%',fontSize:35,animation:'float 2.8s ease-in-out infinite',animationDelay:'-0.5s'}}>🍩</div>

        <div style={{fontSize:130,marginBottom:10,animation:'bounce2 1s ease-in-out infinite'}}>🐸</div>
        <h2 style={{fontSize:42,fontWeight:900,color:'#2d3436',marginBottom:10}}>Feed the Frog!</h2>
        <p style={{fontSize:20,color:'#636e72',margin:'12px 0',maxWidth:320}}>Tap the correct letters to feed the hungry frog! 🎯</p>
        <button onClick={()=>setStarted(true)} style={{padding:'22px 55px',background:'linear-gradient(135deg,#00b894,#55efc4)',color:'#fff',border:'none',borderRadius:60,fontSize:26,fontWeight:900,cursor:'pointer',boxShadow:'0 10px 40px rgba(0,184,148,0.4)'}}>🎮 Let's Feed!</button>
        <button onClick={onBack} style={{marginTop:20,padding:'14px 28px',background:'rgba(0,0,0,0.1)',color:'#636e72',border:'none',borderRadius:30,fontSize:18,cursor:'pointer'}}>← Back</button>
      </div>
    );
  }

  if (gameOver) {
    const won = fed >= GOAL;
    const ladoosEarned = Math.floor(score / 10);
    return (
      <div style={{textAlign:'center',padding:40,minHeight:'80vh',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',background:'linear-gradient(180deg,#a8e6cf 0%,#88d8b0 50%,#ffecd2 100%)',borderRadius:24,position:'relative',overflow:'hidden'}}>
        {won && <>
          <div style={{position:'absolute',top:'10%',left:'15%',fontSize:50,animation:'bounce2 0.8s ease-in-out infinite'}}>🎉</div>
          <div style={{position:'absolute',top:'15%',right:'15%',fontSize:45,animation:'bounce2 1s ease-in-out infinite'}}>⭐</div>
        </>}
        <div style={{fontSize:110,marginBottom:15,animation:'bounce2 1s ease-in-out infinite'}}>{won ? '🐸' : '😢'}</div>
        <h2 style={{fontSize:38,fontWeight:900,color:'#2d3436'}}>{won ? 'Frog is Full! 🎊' : 'Try Again!'}</h2>
        <div style={{fontSize:55,fontWeight:900,color:'#00b894',margin:'20px 0'}}>🟡 {score}</div>
        <div style={{fontSize:22,color:'#636e72',fontWeight:700}}>+{ladoosEarned} Ladoos! 🍬</div>
        <div style={{display:'flex',gap:16,marginTop:28}}>
          <button onClick={restartGame} style={{padding:'18px 40px',background:'linear-gradient(135deg,#00b894,#55efc4)',color:'#fff',border:'none',borderRadius:50,fontSize:20,fontWeight:800,cursor:'pointer'}}>🔄 Play Again!</button>
          <button onClick={onBack} style={{padding:'18px 40px',background:'rgba(0,0,0,0.1)',color:'#636e72',border:'none',borderRadius:50,fontSize:20,fontWeight:700,cursor:'pointer'}}>🏠 Back</button>
        </div>
      </div>
    );
  }

  const monsterEmoji = monsterMood === 'happy' ? '🐸' : monsterMood === 'sad' ? '😵' : '🐸';

  return (
    <div style={{position:'relative',width:'100%',height:'85vh',background:'linear-gradient(180deg,#dfe6e9 0%,#b2bec3 30%,#a8e6cf 60%,#55efc4 100%)',borderRadius:24,overflow:'hidden',touchAction:'manipulation'}}>

      {/* Pond/ground at bottom */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:'25%',background:'linear-gradient(180deg,#74b9ff 0%,#0984e3 100%)',borderRadius:'50% 50% 0 0 / 40px 40px 0 0'}}>
        {/* Lily pads */}
        <div style={{position:'absolute',top:15,left:'20%',fontSize:35}}>🪷</div>
        <div style={{position:'absolute',top:25,right:'25%',fontSize:30}}>🪷</div>
      </div>

      {/* The Monster (Frog) */}
      <div style={{
        position:'absolute',
        bottom:'12%',
        left:'50%',
        transform:`translateX(-50%) scale(${monsterMood === 'happy' ? 1.15 : monsterMood === 'sad' ? 0.9 : 1})`,
        transition:'transform 0.2s ease-out',
        fontSize:90,
        filter: monsterMood === 'happy' ? 'drop-shadow(0 0 20px #55efc4)' : 'none',
        animation: monsterMood === 'happy' ? 'bounce2 0.3s ease-in-out' : 'none',
        zIndex:5,
      }}>{monsterEmoji}</div>

      {/* Speech bubble showing what frog wants */}
      <div style={{
        position:'absolute',
        bottom:'32%',
        left:'50%',
        transform:'translateX(-50%)',
        background:'#fff',
        padding:'12px 24px',
        borderRadius:20,
        boxShadow:'0 8px 30px rgba(0,0,0,0.15)',
        zIndex:10,
      }}>
        <div style={{position:'absolute',bottom:-12,left:'50%',transform:'translateX(-50%)',width:0,height:0,borderLeft:'12px solid transparent',borderRight:'12px solid transparent',borderTop:'15px solid #fff'}}/>
        <div style={{fontSize:12,fontWeight:800,color:'#00b894',textAlign:'center'}}>I want to eat:</div>
        <div onClick={()=>say(target.g)} style={{fontFamily:G,fontSize:42,fontWeight:900,color:'#2d3436',textAlign:'center',cursor:'pointer'}}>{target.g}</div>
        <div style={{fontSize:12,color:'#636e72',textAlign:'center'}}>{target.r} 🔊</div>
      </div>

      {/* HUD */}
      <div style={{position:'absolute',top:12,left:12,right:12,display:'flex',justifyContent:'space-between',alignItems:'center',zIndex:10}}>
        <div style={{display:'flex',gap:4,background:'rgba(255,255,255,0.95)',padding:'8px 14px',borderRadius:30,boxShadow:'0 4px 15px rgba(0,0,0,0.1)'}}>
          {[0,1,2,3,4].map(i => <span key={i} style={{fontSize:22,opacity:i<lives?1:0.2}}>{i<lives?'❤️':'🖤'}</span>)}
        </div>
        <div style={{padding:'10px 20px',background:'rgba(255,255,255,0.95)',borderRadius:50,fontWeight:900,fontSize:18,boxShadow:'0 4px 15px rgba(0,0,0,0.1)',color:'#00b894'}}>🟡 {score}</div>
      </div>

      {/* Progress bar - how many fed */}
      <div style={{position:'absolute',top:60,left:'50%',transform:'translateX(-50%)',background:'rgba(255,255,255,0.95)',borderRadius:20,padding:'8px 20px',zIndex:10,boxShadow:'0 4px 15px rgba(0,0,0,0.1)'}}>
        <div style={{fontSize:11,fontWeight:800,color:'#00b894',marginBottom:4,textAlign:'center'}}>🐸 Fed: {fed}/{GOAL}</div>
        <div style={{width:140,height:14,background:'rgba(0,184,148,0.2)',borderRadius:10,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${(fed/GOAL)*100}%`,background:'linear-gradient(90deg,#00b894,#55efc4)',borderRadius:10,transition:'width 0.3s'}}/>
        </div>
      </div>

      {/* Combo indicator */}
      {combo > 1 && (
        <div style={{position:'absolute',top:105,left:'50%',transform:'translateX(-50%)',padding:'6px 16px',background:'linear-gradient(135deg,#fdcb6e,#f39c12)',borderRadius:20,color:'#fff',fontSize:16,fontWeight:900,animation:'pulse2 0.5s infinite',zIndex:10}}>
          🔥 {combo}x!
        </div>
      )}

      {/* Floating letters - TAP to feed */}
      {letters.map(l => {
        const wobbleScale = 1 + Math.sin(l.wobble * Math.PI / 180) * 0.05;
        return (
          <div key={l.id} onClick={(e) => tapLetter(l, e)} style={{
            position:'absolute',
            left:`${l.x}%`,
            top:`${l.y}%`,
            transform:`translate(-50%, -50%) scale(${wobbleScale})`,
            cursor:'pointer',
            zIndex:3,
            transition:'transform 0.1s',
          }}>
            <div style={{
              width:65,
              height:65,
              borderRadius:'50%',
              background: l.isTarget
                ? 'radial-gradient(circle at 30% 30%, #ffeaa7 0%, #fdcb6e 50%, #f39c12 100%)'
                : `radial-gradient(circle at 30% 30%, ${l.color}aa 0%, ${l.color} 60%, ${l.color}dd 100%)`,
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              fontFamily:G,
              fontSize:30,
              fontWeight:900,
              color:'#fff',
              boxShadow: l.isTarget
                ? '0 8px 30px rgba(243,156,18,0.5), 0 0 20px rgba(253,203,110,0.4)'
                : `0 8px 25px ${l.color}40`,
              textShadow:'0 2px 6px rgba(0,0,0,0.2)',
              border: l.isTarget ? '4px solid #f39c12' : '3px solid rgba(255,255,255,0.5)',
              animation: l.isTarget ? 'pulse2 0.7s ease-in-out infinite' : 'none',
              position:'relative',
            }}>
              <div style={{position:'absolute',top:'12%',left:'18%',width:'30%',height:'22%',background:'rgba(255,255,255,0.5)',borderRadius:'50%',filter:'blur(3px)'}}/>
              {l.letter.g}
            </div>
          </div>
        );
      })}

      {/* Pop Effects */}
      {effects.map(e => {
        const age = Date.now() - e.time;
        const progress = Math.min(age / 800, 1);
        return (
          <div key={e.id} style={{position:'absolute',left:`${e.x}%`,top:`${e.y}%`,transform:'translate(-50%, -50%)',pointerEvents:'none',zIndex:20}}>
            {[...Array(10)].map((_, i) => {
              const angle = (i / 10) * 360;
              const dist = 20 + progress * 70;
              const x = Math.cos(angle * Math.PI / 180) * dist;
              const y = Math.sin(angle * Math.PI / 180) * dist;
              return (
                <div key={i} style={{
                  position:'absolute', left:x, top:y,
                  width:14 - progress * 10, height:14 - progress * 10,
                  background: e.isCorrect ? ['#55efc4','#00b894','#ffeaa7','#fdcb6e'][i%4] : '#e17055',
                  borderRadius:'50%', opacity:1 - progress,
                }}/>
              );
            })}
            <div style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%, -50%)',fontSize:40 + progress * 30,opacity:1 - progress}}>
              {e.isCorrect ? '✨' : '❌'}
            </div>
          </div>
        );
      })}

      <button onClick={onBack} style={{position:'absolute',bottom:15,left:12,padding:'12px 22px',background:'rgba(255,255,255,0.95)',borderRadius:50,border:'none',fontSize:16,fontWeight:800,cursor:'pointer',zIndex:10,boxShadow:'0 4px 15px rgba(0,0,0,0.1)',color:'#00b894'}}>← Back</button>
    </div>
  );
}

// Memory Match Game
function MemoryMatchGame({onBack, onScore}) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [previewPhase, setPreviewPhase] = useState('showing'); // 'showing', 'hiding', 'ready'
  const [previewCards, setPreviewCards] = useState([]);

  // Initialize cards and show preview
  useEffect(() => {
    const selected = shuffle([...L]).slice(0, 6);
    const pairs = shuffle([...selected, ...selected].map((l, i) => ({ ...l, id: i })));
    setCards(pairs);

    // Show all cards one by one with animation
    setPreviewPhase('showing');
    pairs.forEach((_, idx) => {
      setTimeout(() => {
        setPreviewCards(prev => [...prev, idx]);
        // Play sound for each card as it appears
        if (pairs[idx]) say(pairs[idx].g);
      }, idx * 150);
    });

    // After all shown, wait then hide them
    setTimeout(() => {
      setPreviewPhase('hiding');
    }, pairs.length * 150 + 1500);

    // Hide cards one by one
    setTimeout(() => {
      pairs.forEach((_, idx) => {
        setTimeout(() => {
          setPreviewCards(prev => prev.filter(i => i !== pairs.length - 1 - idx));
        }, idx * 100);
      });
    }, pairs.length * 150 + 1700);

    // Game ready
    setTimeout(() => {
      setPreviewCards([]);
      setPreviewPhase('ready');
    }, pairs.length * 150 + 1700 + pairs.length * 100 + 300);
  }, []);

  useEffect(() => {
    if (flipped.length === 2 && previewPhase === 'ready') {
      setMoves(m => m + 1);
      const [a, b] = flipped;
      if (cards[a].g === cards[b].g) {
        playSuccess();
        say(cards[a].g);
        setMatched(prev => [...prev, a, b]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  }, [flipped, previewPhase, cards]);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0 && previewPhase === 'ready') {
      setGameOver(true);
      const score = Math.max(10, 100 - moves * 5);
      onScore?.(score);
    }
  }, [matched, cards.length, previewPhase, moves, onScore]);

  const flipCard = (idx) => {
    if (previewPhase !== 'ready') return;
    if (flipped.length >= 2 || flipped.includes(idx) || matched.includes(idx)) return;
    say(cards[idx].g);
    setFlipped(prev => [...prev, idx]);
  };

  const restartGame = () => {
    const selected = shuffle([...L]).slice(0, 6);
    const pairs = shuffle([...selected, ...selected].map((l, i) => ({ ...l, id: i })));
    setCards(pairs);
    setMatched([]);
    setFlipped([]);
    setMoves(0);
    setGameOver(false);
    setPreviewCards([]);

    // Show preview again
    setPreviewPhase('showing');
    pairs.forEach((_, idx) => {
      setTimeout(() => {
        setPreviewCards(prev => [...prev, idx]);
        if (pairs[idx]) say(pairs[idx].g);
      }, idx * 150);
    });
    setTimeout(() => setPreviewPhase('hiding'), pairs.length * 150 + 1500);
    setTimeout(() => {
      pairs.forEach((_, idx) => {
        setTimeout(() => {
          setPreviewCards(prev => prev.filter(i => i !== pairs.length - 1 - idx));
        }, idx * 100);
      });
    }, pairs.length * 150 + 1700);
    setTimeout(() => {
      setPreviewCards([]);
      setPreviewPhase('ready');
    }, pairs.length * 150 + 1700 + pairs.length * 100 + 300);
  };

  const CARD_COLORS = ['#FF6B6B','#4ECDC4','#FFE66D','#FF9FF3','#54E346','#48DBFB','#A29BFE','#FF9F43','#FD79A8','#00CEC9','#6C5CE7','#FDCB6E'];

  if (gameOver) {
    const score = Math.max(10, 100 - moves * 5);
    const ladoosEarned = Math.floor(score / 10);
    return (
      <div style={{textAlign:'center',padding:40,minHeight:'80vh',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',background:'linear-gradient(180deg,#a29bfe 0%,#fd79a8 50%,#fdcb6e 100%)',borderRadius:24,position:'relative',overflow:'hidden'}}>
        {/* Celebration */}
        <div style={{position:'absolute',top:'10%',left:'10%',fontSize:50,animation:'bounce2 0.8s ease-in-out infinite'}}>🎉</div>
        <div style={{position:'absolute',top:'15%',right:'10%',fontSize:45,animation:'bounce2 1s ease-in-out infinite'}}>🌟</div>
        <div style={{position:'absolute',bottom:'20%',left:'15%',fontSize:40,animation:'bounce2 0.9s ease-in-out infinite'}}>✨</div>

        <div style={{fontSize:100,marginBottom:20,animation:'bounce2 1s ease-in-out infinite'}}>🧠</div>
        <h2 style={{fontSize:38,fontWeight:900,color:'#fff',textShadow:'0 4px 15px rgba(0,0,0,0.2)'}}>Super Memory!</h2>
        <p style={{fontSize:20,color:'rgba(255,255,255,0.9)',fontWeight:600}}>Completed in {moves} moves!</p>
        <div style={{fontSize:55,fontWeight:900,color:'#FFE66D',margin:'20px 0',textShadow:'0 4px 20px rgba(255,230,109,0.5)'}}>🟡 {score}</div>
        <div style={{fontSize:22,color:'rgba(255,255,255,0.95)',fontWeight:700}}>+{ladoosEarned} Ladoos! 🍬</div>
        <div style={{display:'flex',gap:16,marginTop:28}}>
          <button onClick={restartGame} style={{padding:'18px 40px',background:'linear-gradient(135deg,#00b894,#00cec9)',color:'#fff',border:'none',borderRadius:50,fontSize:20,fontWeight:800,cursor:'pointer',boxShadow:'0 8px 30px rgba(0,206,201,0.4)'}}>🔄 Play Again!</button>
          <button onClick={onBack} style={{padding:'18px 40px',background:'rgba(255,255,255,0.25)',color:'#fff',border:'none',borderRadius:50,fontSize:20,fontWeight:700,cursor:'pointer'}}>🏠 Back</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:20,minHeight:'80vh',background:'linear-gradient(180deg,#a29bfe 0%,#dfe6e9 50%,#fd79a8 100%)',borderRadius:24}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <button onClick={onBack} style={{padding:'12px 22px',background:'rgba(255,255,255,0.95)',borderRadius:50,border:'none',fontSize:15,fontWeight:800,cursor:'pointer',boxShadow:'0 4px 15px rgba(0,0,0,0.1)',color:'#6c5ce7'}}>← Back</button>
        <div style={{padding:'10px 22px',background:'rgba(255,255,255,0.95)',borderRadius:50,fontSize:18,fontWeight:800,boxShadow:'0 4px 15px rgba(0,0,0,0.1)',color:'#6c5ce7'}}>
          {previewPhase === 'ready' ? `Moves: ${moves}` : previewPhase === 'showing' ? '👀 Remember!' : '🙈 Hiding...'}
        </div>
      </div>

      <h3 style={{textAlign:'center',fontSize:26,fontWeight:900,marginBottom:24,color:'#fff',textShadow:'0 3px 10px rgba(0,0,0,0.15)'}}>
        {previewPhase === 'showing' ? '🧠 Remember the Letters!' : previewPhase === 'hiding' ? '🙈 Get Ready...' : '🎯 Find the Pairs!'}
      </h3>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:14,maxWidth:420,margin:'0 auto'}}>
        {cards.map((card, idx) => {
          const isPreviewShown = previewCards.includes(idx);
          const isFlippedByPlayer = flipped.includes(idx) || matched.includes(idx);
          const showFront = isPreviewShown || isFlippedByPlayer;
          const isMatched = matched.includes(idx);
          const cardColor = CARD_COLORS[idx % CARD_COLORS.length];

          return (
            <div key={idx} onClick={() => flipCard(idx)} style={{
              aspectRatio:'1',
              borderRadius:18,
              cursor: previewPhase === 'ready' && !isMatched ? 'pointer' : 'default',
              perspective:'1000px',
              transform: isPreviewShown && previewPhase === 'showing' ? 'scale(1.05)' : 'scale(1)',
              transition:'transform 0.2s',
            }}>
              <div style={{
                width:'100%',
                height:'100%',
                position:'relative',
                transformStyle:'preserve-3d',
                transform: showFront ? 'rotateY(180deg)' : 'rotateY(0)',
                transition:'transform 0.4s ease-in-out',
              }}>
                {/* Back of card */}
                <div style={{
                  position:'absolute',
                  width:'100%',
                  height:'100%',
                  backfaceVisibility:'hidden',
                  background:'linear-gradient(135deg,#6c5ce7,#a29bfe)',
                  borderRadius:18,
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  boxShadow:'0 6px 20px rgba(108,92,231,0.3)',
                  border:'3px solid rgba(255,255,255,0.3)',
                }}>
                  <span style={{fontSize:32}}>❓</span>
                </div>

                {/* Front of card */}
                <div style={{
                  position:'absolute',
                  width:'100%',
                  height:'100%',
                  backfaceVisibility:'hidden',
                  transform:'rotateY(180deg)',
                  background: isMatched
                    ? 'linear-gradient(135deg,#00b894,#00cec9)'
                    : `linear-gradient(135deg,${cardColor},${cardColor}CC)`,
                  borderRadius:18,
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  boxShadow: isMatched ? '0 6px 25px rgba(0,206,201,0.5)' : `0 6px 20px ${cardColor}50`,
                  border: isMatched ? '4px solid #00cec9' : '3px solid rgba(255,255,255,0.5)',
                }}>
                  <span style={{fontFamily:G,fontSize:38,fontWeight:900,color:'#fff',textShadow:'0 2px 8px rgba(0,0,0,0.2)'}}>{card.g}</span>
                  {isMatched && <span style={{position:'absolute',top:4,right:4,fontSize:16}}>✨</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {previewPhase === 'showing' && (
        <div style={{textAlign:'center',marginTop:24,fontSize:18,color:'#fff',fontWeight:700,animation:'pulse2 1s infinite'}}>
          👆 Try to remember where each letter is!
        </div>
      )}
    </div>
  );
}

// Speed Quiz Game
function SpeedQuizGame({onBack, onScore}) {
  const [current, setCurrent] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);

  const nextQuestion = () => {
    const correct = L[Math.floor(Math.random() * L.length)];
    const others = shuffle(L.filter(l => l.g !== correct.g)).slice(0, 3);
    setCurrent(correct);
    setOptions(shuffle([correct, ...others]));
    say(correct.g);
  };

  useEffect(() => {
    nextQuestion();
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameOver(true);
          onScore?.(score);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const answer = (opt) => {
    if (gameOver) return;
    if (opt.g === current.g) {
      playSuccess();
      setScore(s => s + 10 + streak * 2);
      setStreak(s => s + 1);
      setTimeLeft(t => Math.min(20, t + 2)); // Bonus time
    } else {
      setStreak(0);
      setTimeLeft(t => Math.max(0, t - 3)); // Penalty
    }
    nextQuestion();
  };

  if (gameOver) {
    return (
      <div style={{textAlign:'center',padding:40,minHeight:'80vh',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
        <div style={{fontSize:80,marginBottom:20}}>⚡</div>
        <h2 style={{fontSize:32,fontWeight:900}}>Speed Demon!</h2>
        <div style={{fontSize:48,fontWeight:900,color:'#FF9500',margin:'20px 0'}}>🟡 {score}</div>
        <div style={{display:'flex',gap:12,marginTop:24}}>
          <button onClick={()=>{setScore(0);setTimeLeft(20);setStreak(0);setGameOver(false);nextQuestion()}} style={{padding:'16px 32px',background:'linear-gradient(135deg,#FF2D55,#FF6B6B)',color:'#fff',border:'none',borderRadius:50,fontSize:18,fontWeight:700,cursor:'pointer'}}>Play Again</button>
          <button onClick={onBack} style={{padding:'16px 32px',background:'#F2F2F7',color:'#666',border:'none',borderRadius:50,fontSize:18,fontWeight:700,cursor:'pointer'}}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:20,minHeight:'80vh',background:'linear-gradient(180deg,#FFE5EC,#FFF0F5)',borderRadius:24}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <button onClick={onBack} style={{padding:'10px 20px',background:'#fff',borderRadius:50,border:'none',fontSize:14,fontWeight:700,cursor:'pointer'}}>← Back</button>
        <div style={{padding:'8px 20px',background:timeLeft<=5?'#FF3B30':'#34C759',borderRadius:50,color:'#fff',fontWeight:800,animation:timeLeft<=5?'pulse2 0.5s infinite':'none'}}>⏱️ {timeLeft}s</div>
        <div style={{padding:'8px 20px',background:'#FF9500',borderRadius:50,color:'#fff',fontWeight:800}}>🟡 {score}</div>
      </div>

      {streak > 2 && <div style={{textAlign:'center',fontSize:18,fontWeight:800,color:'#FF2D55',marginBottom:10}}>🔥 {streak}x Streak!</div>}

      <div style={{textAlign:'center',marginBottom:30}}>
        <div style={{fontSize:14,color:'#666',marginBottom:8}}>Tap the sound you hear!</div>
        <div onClick={()=>say(current?.g)} style={{display:'inline-block',width:100,height:100,borderRadius:'50%',background:'linear-gradient(135deg,#FF2D55,#FF6B6B)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:'0 8px 30px rgba(255,45,85,0.3)',margin:'0 auto'}}>
          <span style={{fontSize:48}}>🔊</span>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(2, 1fr)',gap:16,maxWidth:400,margin:'0 auto'}}>
        {options.map((opt, i) => (
          <div key={i} onClick={() => answer(opt)} style={{
            padding:24,borderRadius:20,background:'#fff',
            boxShadow:'0 4px 20px rgba(0,0,0,0.08)',cursor:'pointer',
            textAlign:'center',transition:'transform 0.1s',
          }}>
            <div style={{fontFamily:G,fontSize:48,fontWeight:900,color:'#1C1C1E'}}>{opt.g}</div>
            <div style={{fontSize:14,color:'#888',marginTop:4}}>{opt.r}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Games Hub Screen
function GamesHub({onBack, onSelectGame, ladoos}) {
  const games = [
    { id: 'balloon', name: 'Balloon Pop', icon: '🎈', color: '#FF6B6B', desc: 'Pop balloons with the right letters!' },
    { id: 'rain', name: 'Letter Rain', icon: '🌧️', color: '#5AC8FA', desc: 'Catch falling letters in your bucket!' },
    { id: 'memory', name: 'Memory Match', icon: '🧠', color: '#AF52DE', desc: 'Find matching letter pairs!' },
    { id: 'speed', name: 'Speed Quiz', icon: '⚡', color: '#FF2D55', desc: 'Quick! Pick the right sound!' },
  ];

  return (
    <div style={{minHeight:'100dvh',background:'linear-gradient(180deg,#FFF9F0 0%,#FFE8D6 100%)',padding:20}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
        <button onClick={onBack} style={{padding:'12px 20px',background:'#fff',borderRadius:50,border:'none',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>← Back</button>
        <div style={{padding:'10px 20px',background:'linear-gradient(135deg,#FFD700,#FFA500)',borderRadius:50,fontWeight:800,color:'#fff'}}>🟡 {ladoos}</div>
      </div>

      <div style={{textAlign:'center',marginBottom:32}}>
        <div style={{fontSize:64,marginBottom:12}}>🎮</div>
        <h1 style={{fontSize:32,fontWeight:900,color:'#1C1C1E',margin:0}}>Fun Games!</h1>
        <p style={{fontSize:16,color:'#666',marginTop:8}}>Play & earn ladoos while learning!</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(2, 1fr)',gap:16,maxWidth:500,margin:'0 auto'}}>
        {games.map(game => (
          <div key={game.id} onClick={() => onSelectGame(game.id)} style={{
            background:'#fff',borderRadius:24,padding:24,cursor:'pointer',
            boxShadow:'0 8px 30px rgba(0,0,0,0.06)',
            transition:'transform 0.2s',border:`3px solid ${game.color}20`,
          }}>
            <div style={{fontSize:48,marginBottom:12}}>{game.icon}</div>
            <div style={{fontSize:18,fontWeight:800,color:'#1C1C1E'}}>{game.name}</div>
            <div style={{fontSize:13,color:'#888',marginTop:6,lineHeight:1.4}}>{game.desc}</div>
            <div style={{marginTop:12,padding:'8px 16px',background:`${game.color}15`,borderRadius:50,display:'inline-block',fontSize:12,fontWeight:700,color:game.color}}>Play Now →</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════ MAIN APP ═══════════════
export default function Gurmukhi() {
  const [screen,setScreen]=useState('loading');
  const [profile,setProfile]=useState(null);
  const [progress,setProgress]=useState({ladoos:0,streak:0,done:[]});
  const [students,setStudents]=useState([]);
  const [ch,setCh]=useState(null);
  const [ti,setTi]=useState(0);
  const [sub,setSub]=useState(0);
  const [burst,setBurst]=useState(false);
  const [toast,setToast]=useState(null);
  const [verifyEmail,setVerifyEmail]=useState('');
  const [lockedMsg,setLockedMsg]=useState('');
  const [currentGame,setCurrentGame]=useState(null); // For fun games

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
            setProgress(prog||{ladoos:0,streak:0,done:[]});
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
        setProfile(null);setProgress({ladoos:0,streak:0,done:[]});setScreen('welcome');
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
        setProgress(p=>({...p,done:[...(p.done||[]),task.id],ladoos:(p.ladoos||0)+task.xp}));
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

  // ═══════ Invite Friends ═══════
  const [showInvite,setShowInvite]=useState(false);
  const [showLeaderboard,setShowLeaderboard]=useState(false);
  const [copied,setCopied]=useState(false);
  const inviteUrl=typeof window!=='undefined'?window.location.origin:'https://gurmukhi.app';
  const inviteMsg=`🎉 Join me learning Punjabi on ਗੁਰਮੁਖੀ! It's fun and free. Start here: ${inviteUrl}`;

  const shareInvite=async()=>{
    if(navigator.share){
      try{
        await navigator.share({title:'Learn Punjabi with me!',text:inviteMsg,url:inviteUrl});
      }catch(e){}
    }else{
      setShowInvite(true);
    }
  };
  const copyInvite=()=>{
    navigator.clipboard.writeText(inviteMsg);
    setCopied(true);
    setTimeout(()=>setCopied(false),2000);
  };

  // ═══════ Sidebar ═══════
  const Friends=()=>(
    <div style={{...S.card,borderRadius:24,position:'sticky',top:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:`${profile?.color||'#FF9500'}15`,borderRadius:16,marginBottom:16}}>
        <div style={{width:40,height:40,borderRadius:'50%',background:`linear-gradient(135deg,${profile?.color},${profile?.color}CC)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,boxShadow:`0 4px 12px ${profile?.color}33`}}>{profile?.face}</div>
        <div><div style={{fontWeight:700,fontSize:15}}>{displayName}</div><div style={{fontSize:12,color:'#8E8E93'}}>🟡 {progress.ladoos||0} Ladoos</div></div>
      </div>
      <div style={{fontSize:11,fontWeight:700,color:'#8E8E93',textTransform:'uppercase',letterSpacing:1.5,marginBottom:10}}>Classmates</div>
      {students.filter(s=>s.uid!==auth.currentUser?.uid).slice(0,6).map((p,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(0,0,0,.04)'}}>
          <div style={{width:34,height:34,borderRadius:'50%',background:p.color||COLORS[i%COLORS.length],display:'flex',alignItems:'center',justifyContent:'center',fontSize:17}}>{p.face||FACES[i%FACES.length]}</div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{p.fname||'Student'}</div><div style={{fontSize:11,color:'#8E8E93'}}>🟡 {p.ladoos||0}</div></div>
        </div>
      ))}
      {/* Invite Friends Button */}
      <button onClick={shareInvite} style={{width:'100%',marginTop:16,padding:'14px',background:'linear-gradient(135deg,#FF9500,#FF6B35)',color:'#fff',border:'none',borderRadius:16,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:'0 4px 15px rgba(255,107,53,.25)'}}>
        <span style={{fontSize:18}}>🎉</span> Invite Friends
      </button>
      {students.length<=1&&<div style={{textAlign:'center',padding:'12px 8px',color:'#8E8E93',fontSize:12,lineHeight:1.5}}>Learning together is more fun! Invite your friends to join.</div>}
    </div>
  );

  // ═══════ RENDER ═══════
  return <>
    <style>{CSS}</style>

    {/* Invite Friends Modal - Multiple sharing options */}
    {showInvite&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',backdropFilter:'blur(10px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,padding:20}} onClick={()=>setShowInvite(false)}>
      <div style={{background:'linear-gradient(180deg,#fff,#FFF8F0)',borderRadius:32,padding:32,maxWidth:420,width:'100%',animation:'scaleIn .3s ease',boxShadow:'0 25px 80px rgba(0,0,0,.2)'}} onClick={e=>e.stopPropagation()}>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{fontSize:64,marginBottom:12}}>🎉</div>
          <h3 style={{fontSize:26,fontWeight:900,margin:0,color:'#1C1C1E'}}>Invite Friends!</h3>
          <p style={{fontSize:15,color:'#666',marginTop:8,lineHeight:1.5}}>Learning Punjabi is more fun together.<br/>Share with friends and family!</p>
        </div>

        {/* Share buttons grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
          <a href={`https://wa.me/?text=${encodeURIComponent(inviteMsg)}`} target="_blank" rel="noopener" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,padding:16,background:'#25D366',borderRadius:20,textDecoration:'none',transition:'transform .2s'}}>
            <span style={{fontSize:28}}>💬</span>
            <span style={{fontSize:11,fontWeight:700,color:'#fff'}}>WhatsApp</span>
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteUrl)}&quote=${encodeURIComponent(inviteMsg)}`} target="_blank" rel="noopener" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,padding:16,background:'#1877F2',borderRadius:20,textDecoration:'none',transition:'transform .2s'}}>
            <span style={{fontSize:28}}>📘</span>
            <span style={{fontSize:11,fontWeight:700,color:'#fff'}}>Facebook</span>
          </a>
          <a href={`https://line.me/R/msg/text/?${encodeURIComponent(inviteMsg)}`} target="_blank" rel="noopener" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,padding:16,background:'#00B900',borderRadius:20,textDecoration:'none',transition:'transform .2s'}}>
            <span style={{fontSize:28}}>💚</span>
            <span style={{fontSize:11,fontWeight:700,color:'#fff'}}>Line</span>
          </a>
          <a href={`mailto:?subject=${encodeURIComponent('Learn Punjabi with me!')}&body=${encodeURIComponent(inviteMsg)}`} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,padding:16,background:'#EA4335',borderRadius:20,textDecoration:'none',transition:'transform .2s'}}>
            <span style={{fontSize:28}}>📧</span>
            <span style={{fontSize:11,fontWeight:700,color:'#fff'}}>Email</span>
          </a>
        </div>

        {/* Copy link section */}
        <div style={{background:'#F2F2F7',borderRadius:20,padding:16,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:'#8E8E93',marginBottom:8,textTransform:'uppercase',letterSpacing:1}}>Or copy link</div>
          <div style={{display:'flex',gap:10}}>
            <div style={{flex:1,background:'#fff',borderRadius:12,padding:'12px 14px',fontSize:13,color:'#666',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',border:'2px solid #E5E5EA'}}>{inviteUrl}</div>
            <button onClick={copyInvite} style={{padding:'12px 20px',background:copied?'#34C759':'linear-gradient(135deg,#FF9500,#FF6B35)',color:'#fff',border:'none',borderRadius:12,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit',minWidth:80}}>
              {copied?'✓ Copied':'Copy'}
            </button>
          </div>
        </div>

        <button onClick={()=>setShowInvite(false)} style={{width:'100%',padding:16,background:'#F2F2F7',color:'#666',border:'none',borderRadius:16,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Close</button>
      </div>
    </div>}

    {/* Leaderboard Modal */}
    {showLeaderboard&&(()=>{
      // Include current user in leaderboard with their actual ladoos
      const currentUserData = profile && auth.currentUser ? {
        uid: auth.currentUser.uid,
        fname: profile.fname,
        lname: profile.lname,
        face: profile.face,
        color: profile.color,
        ladoos: progress.ladoos || 0
      } : null;

      // Merge current user with students list, avoiding duplicates
      const allUsers = currentUserData
        ? [currentUserData, ...students.filter(s => s.uid !== auth.currentUser?.uid)]
        : students;

      // Sort by ladoos (descending)
      const rankedUsers = [...allUsers].sort((a,b)=>(b.ladoos||0)-(a.ladoos||0));

      return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',backdropFilter:'blur(10px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,padding:20}} onClick={()=>setShowLeaderboard(false)}>
      <div style={{background:'linear-gradient(180deg,#FFF8E1,#fff)',borderRadius:32,padding:28,maxWidth:400,width:'100%',maxHeight:'80vh',overflow:'auto',animation:'scaleIn .3s ease',boxShadow:'0 25px 80px rgba(255,193,7,.3)'}} onClick={e=>e.stopPropagation()}>
        <div style={{textAlign:'center',marginBottom:20}}>
          <div style={{fontSize:56,marginBottom:8}}>🏆</div>
          <h3 style={{fontSize:24,fontWeight:900,margin:0,color:'#F57C00'}}>Leaderboard</h3>
          <p style={{fontSize:14,color:'#888',marginTop:4}}>Ranked by Ladoos Earned</p>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {rankedUsers.slice(0,15).map((s,i)=>{
            const isMe = s.uid === auth.currentUser?.uid;
            return (
            <div key={s.uid||i} style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',background:i===0?'linear-gradient(135deg,#FFD700,#FFC107)':i===1?'linear-gradient(135deg,#E8E8E8,#BDBDBD)':i===2?'linear-gradient(135deg,#FFCC80,#FFB74D)':isMe?'linear-gradient(135deg,#E3F2FD,#BBDEFB)':'#fff',borderRadius:20,boxShadow:i<3?'0 6px 20px rgba(0,0,0,.12)':isMe?'0 4px 15px rgba(33,150,243,.2)':'0 2px 10px rgba(0,0,0,.05)',border:isMe?'3px solid #2196F3':'none'}}>
              <div style={{width:36,height:36,borderRadius:'50%',background:i<3?'rgba(255,255,255,0.9)':'#F5F5F5',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:900,color:i===0?'#FF8F00':i===1?'#757575':i===2?'#E65100':'#999'}}>
                {i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}
              </div>
              <div style={{width:42,height:42,borderRadius:'50%',background:s.color||COLORS[i%COLORS.length],display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,boxShadow:'0 3px 10px rgba(0,0,0,.1)'}}>{s.face||FACES[i%FACES.length]}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:15,color:i<3?'#fff':isMe?'#1976D2':'#333'}}>{s.fname||'Student'} {s.lname||''}</div>
                {isMe&&<div style={{fontSize:11,color:i<3?'rgba(255,255,255,0.8)':'#2196F3',fontWeight:700}}>⭐ That's you!</div>}
              </div>
              <div style={{display:'flex',alignItems:'center',gap:5,padding:'8px 14px',background:'rgba(255,255,255,0.95)',borderRadius:50,boxShadow:'0 2px 8px rgba(0,0,0,.08)'}}>
                <span style={{fontSize:18}}>🟡</span>
                <span style={{fontWeight:800,fontSize:16,color:'#FF8F00'}}>{s.ladoos||0}</span>
              </div>
            </div>
          )})}
          {rankedUsers.length===0&&<div style={{textAlign:'center',padding:'30px 20px',color:'#999'}}>
            <div style={{fontSize:48,marginBottom:12}}>👨‍👩‍👧‍👦</div>
            <div style={{fontSize:16,fontWeight:600}}>No learners yet!</div>
            <div style={{fontSize:14,marginTop:4}}>Invite friends to compete</div>
            <button onClick={()=>{setShowLeaderboard(false);setShowInvite(true)}} style={{marginTop:16,padding:'12px 24px',background:'linear-gradient(135deg,#FF9500,#FF6B35)',color:'#fff',border:'none',borderRadius:50,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Invite Friends</button>
          </div>}
        </div>

        <button onClick={()=>setShowLeaderboard(false)} style={{width:'100%',marginTop:20,padding:16,background:'#F5F5F5',color:'#666',border:'none',borderRadius:16,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Close</button>
      </div>
    </div>})()}

    {screen==='loading'&&<Shell><div style={{textAlign:'center'}}><Logo size={100}/><p style={{color:'#8E8E93'}}>Loading...</p></div></Shell>}

    {screen==='welcome'&&<LandingPage>
      <div style={{textAlign:'center',marginBottom:32}}>
        <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:100,height:100,borderRadius:28,background:'linear-gradient(135deg,#FF9500,#FF6B35)',boxShadow:'0 15px 50px rgba(255,107,53,.3)',fontSize:52,fontFamily:G,fontWeight:900,color:'#fff',animation:'float 4s ease-in-out infinite'}}>ੳ</div>
        <h1 style={{fontFamily:G,fontSize:36,fontWeight:900,color:'#1C1C1E',marginTop:16,marginBottom:4}}>ਗੁਰਮੁਖੀ</h1>
        <p style={{fontSize:17,color:'#666',fontWeight:500}}>The fun way to learn Punjabi</p>
      </div>

      {/* Feature highlights - mobile only */}
      <div className="mobile-features" style={{display:'flex',gap:8,justifyContent:'center',marginBottom:28,flexWrap:'wrap'}}>
        {['🎮 Games','🔊 Audio','✏️ Trace','🏆 Ladoos'].map((f,i)=>(
          <div key={i} style={{padding:'8px 14px',background:'linear-gradient(135deg,#FFF8F0,#FFE8D6)',borderRadius:50,fontSize:13,fontWeight:600,color:'#FF9500'}}>{f}</div>
        ))}
      </div>

      <button onClick={()=>setScreen('signup')} style={{...S.btn,background:'linear-gradient(135deg,#FF9500,#FF6B35)',color:'#fff',marginBottom:14,fontSize:18,padding:18,borderRadius:20,boxShadow:'0 8px 30px rgba(255,107,53,.3)',fontWeight:800}}>
        🚀 Get Started — It's Free!
      </button>
      <button onClick={()=>setScreen('login')} style={{...S.btn,background:'#fff',color:'#1C1C1E',border:'2px solid rgba(0,0,0,.08)',fontSize:16,padding:16,borderRadius:20,fontWeight:700}}>
        I already have an account
      </button>

      <div style={{textAlign:'center',marginTop:24,fontSize:13,color:'#aaa'}}>
        Join 1000+ kids learning Punjabi!
      </div>
    </LandingPage>}

    {screen==='signup'&&<LandingPage>
      <SignupForm onDone={em=>{setVerifyEmail(em);setScreen('verify')}} onSwitch={()=>setScreen('login')}/>
    </LandingPage>}

    {screen==='login'&&<LandingPage>
      <LoginForm onForgot={()=>setScreen('forgot')} onSwitch={()=>setScreen('signup')} onNeedVerify={em=>{setVerifyEmail(em);setScreen('verify')}}/>
    </LandingPage>}
    {screen==='forgot'&&<LandingPage><ForgotForm onBack={()=>setScreen('login')}/></LandingPage>}
    {screen==='verify'&&<LandingPage><VerifyScreen email={verifyEmail} onDone={()=>setScreen('avatar')} onBack={()=>setScreen('login')}/></LandingPage>}
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
            <div><div style={{fontSize:28,fontWeight:800,color:'#FF9500'}}>🟡 {progress.ladoos||0}</div><div style={{fontSize:12,color:'#8E8E93',marginTop:4}}>Ladoos Earned</div></div>
            <div><div style={{fontSize:28,fontWeight:800,color:'#34C759'}}>{pct}%</div><div style={{fontSize:12,color:'#8E8E93',marginTop:4}}>Complete</div></div>
            <div><div style={{fontSize:28,fontWeight:800,color:'#5856D6'}}>{(progress.done||[]).length}</div><div style={{fontSize:12,color:'#8E8E93',marginTop:4}}>Lessons Done</div></div>
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
                <div style={{fontSize:12,color:'#8E8E93',marginTop:2}}>🟡 {p.ladoos||0} ladoos · {(p.done?.length||0)}/{TOTAL} tasks{lastCh?` · Ch${lastCh.id}`:''}</div>
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
          case 'maatra_quiz': return <MaatraQuizGame key={task.id} task={task} ch={ch} complete={complete}/>;
          case 'maatra_spell': return <MaatraSpellGame key={task.id} task={task} ch={ch} complete={complete}/>;
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
              <div style={{display:'flex',alignItems:'center',gap:4,padding:'6px 12px',background:'linear-gradient(135deg,#FFD700,#FFA500)',borderRadius:50,fontSize:14,fontWeight:800,color:'#fff'}}>🟡 {progress.ladoos||0}</div>
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
        {/* Ladoo Toast - celebration when earning ladoos */}
        {toast!==null&&<div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:9998,background:'rgba(0,0,0,.12)',backdropFilter:'blur(6px)'}}>
          <div style={{background:'linear-gradient(135deg,#FFF8E1,#FFECB3)',borderRadius:32,padding:'40px 56px',textAlign:'center',boxShadow:'0 20px 60px rgba(255,152,0,.25)',animation:'pop .3s cubic-bezier(.34,1.56,.64,1)',border:'4px solid #FFB300'}}>
            <div style={{fontSize:64,animation:'bounce 0.5s ease infinite'}}>🟡</div>
            <div style={{fontSize:32,fontWeight:900,color:'#FF8F00',marginTop:8}}>+{toast} Ladoos!</div>
            <div style={{fontSize:16,color:'#F57C00',marginTop:4}}>Yummy! Keep going!</div>
          </div>
        </div>}
      </div>;
    })()}

    {/* HOME - FULL SCREEN IPAD STYLE */}
    {screen==='home'&&<div style={{minHeight:'100dvh',background:'linear-gradient(180deg, #FFF9F0 0%, #FFE8D6 50%, #FFDAB9 100%)',fontFamily:F,position:'relative',overflow:'hidden'}}>

      {/* Floating Punjabi Letters & Mini Mascots Background */}
      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,overflow:'hidden'}}>
        {/* Letters */}
        {['ੳ','ਅ','ੲ','ਸ','ਕ','ਗ','ਮ','ਪ'].map((c,i)=>(
          <div key={i} style={{position:'absolute',fontFamily:G,fontSize:50+i*8,fontWeight:900,color:`rgba(255,149,0,${0.04+i*0.006})`,left:`${8+i*11}%`,top:`${20+((i*19)%55)}%`,animation:`drift ${18+i*2}s ease-in-out infinite`,animationDelay:`${-i*2.5}s`,'--r':`${-12+i*4}deg`}}>{c}</div>
        ))}
        {/* Mini floating mascots in background */}
        <div style={{position:'absolute',left:'3%',top:'65%',opacity:0.12,animation:'float 6s ease-in-out infinite'}}>
          <PunjabiBoy size={80}/>
        </div>
        <div style={{position:'absolute',right:'5%',top:'20%',opacity:0.12,animation:'float 7s ease-in-out infinite',animationDelay:'-3s'}}>
          <PunjabiGirl size={75}/>
        </div>
        <div style={{position:'absolute',left:'80%',top:'60%',opacity:0.08,animation:'float 8s ease-in-out infinite',animationDelay:'-2s'}}>
          <PunjabiBoy size={60}/>
        </div>
        <div style={{position:'absolute',left:'15%',top:'30%',opacity:0.08,animation:'float 9s ease-in-out infinite',animationDelay:'-4s'}}>
          <PunjabiGirl size={55}/>
        </div>
      </div>

      {/* Mascot Characters - Left & Right - Big and Visible! */}
      <div className="mascot-left" onClick={()=>say('ਸਤ ਸ੍ਰੀ ਅਕਾਲ')} style={{position:'fixed',left:20,bottom:'8%',zIndex:10,display:'none',cursor:'pointer',transition:'transform .2s'}} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
        <PunjabiBoy size={180}/>
        <div style={{textAlign:'center',marginTop:8,padding:'12px 20px',background:'linear-gradient(135deg,#fff,#E0F7FA)',borderRadius:24,boxShadow:'0 8px 25px rgba(0,0,0,0.15)',border:'3px solid #26C6DA'}}>
          <span style={{fontWeight:800,fontSize:16,color:'#00ACC1',fontFamily:G}}>ਸਤ ਸ੍ਰੀ ਅਕਾਲ!</span>
          <div style={{fontSize:12,color:'#666',marginTop:3,fontWeight:600}}>Tap me! 🔊</div>
        </div>
      </div>
      <div className="mascot-right" onClick={()=>say('ਚੱਲੋ ਸਿੱਖੀਏ')} style={{position:'fixed',right:20,bottom:'8%',zIndex:10,display:'none',cursor:'pointer',transition:'transform .2s'}} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
        <PunjabiGirl size={180}/>
        <div style={{textAlign:'center',marginTop:8,padding:'12px 20px',background:'linear-gradient(135deg,#fff,#FCE4EC)',borderRadius:24,boxShadow:'0 8px 25px rgba(0,0,0,0.15)',border:'3px solid #F06292'}}>
          <span style={{fontWeight:800,fontSize:16,color:'#E91E63',fontFamily:G}}>ਚੱਲੋ ਸਿੱਖੀਏ!</span>
          <div style={{fontSize:12,color:'#666',marginTop:3,fontWeight:600}}>Tap me! 🔊</div>
        </div>
      </div>

      <div style={{position:'relative',zIndex:5,maxWidth:900,margin:'0 auto',padding:'0 20px'}}>

        {/* Top Bar - Big & Bold */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 0',position:'sticky',top:0,zIndex:100}}>
          <div style={{display:'flex',alignItems:'center',gap:14,cursor:'pointer'}} onClick={()=>{setScreen('profile');scrollTop()}}>
            <div style={{width:56,height:56,borderRadius:'50%',background:`linear-gradient(135deg, ${profile?.color}, ${profile?.color}AA)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,boxShadow:`0 6px 25px ${profile?.color}50`,border:'4px solid #fff',transition:'transform .2s'}}>{profile?.face}</div>
            <div>
              <div style={{fontWeight:900,fontSize:22,color:'#1C1C1E'}}>Hey {profile?.fname||'Learner'}! 👋</div>
              <div style={{fontSize:14,color:'#666',fontWeight:600}}>Ready to learn Punjabi?</div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            {/* Leaderboard button */}
            <div onClick={()=>setShowLeaderboard(true)} style={{width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,#FFD700,#FFC107)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,cursor:'pointer',boxShadow:'0 4px 20px rgba(255,193,7,.4)',transition:'transform .2s'}}>🏆</div>
            {/* Ladoos - main points display */}
            <div style={{display:'flex',alignItems:'center',gap:6,padding:'12px 20px',background:'linear-gradient(135deg,#FFD700,#FFA500)',borderRadius:50,boxShadow:'0 6px 25px rgba(255,215,0,.4)'}}>
              <span style={{fontSize:24}}>🟡</span>
              <span style={{fontSize:20,fontWeight:900,color:'#fff'}}>{progress.ladoos||0}</span>
            </div>
          </div>
        </div>

        {/* Locked chapter toast */}
        {lockedMsg&&<div style={{position:'fixed',bottom:120,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#1C1C1E,#333)',color:'#fff',padding:'18px 36px',borderRadius:60,fontSize:18,fontWeight:800,zIndex:999,animation:'slideUp .3s ease',boxShadow:'0 15px 50px rgba(0,0,0,.3)'}}>🔒 {lockedMsg}</div>}

        {/* Progress Tree Section */}
        <div style={{background:'linear-gradient(135deg,#fff,#FFFAF5)',borderRadius:40,padding:'30px',marginBottom:24,boxShadow:'0 10px 50px rgba(0,0,0,.06)',border:'3px solid rgba(255,149,0,0.1)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-around',flexWrap:'wrap',gap:20}}>
            {/* Tree */}
            <ProgressTree progress={(progress.done||[]).length} total={TOTAL}/>
            {/* Stats */}
            <div style={{display:'flex',gap:16,flexWrap:'wrap',justifyContent:'center'}}>
              <div style={{background:'linear-gradient(135deg,#E8F8EC,#D4F5DC)',borderRadius:24,padding:'20px 28px',textAlign:'center',minWidth:100}}>
                <div style={{fontSize:36,fontWeight:900,color:'#34C759'}}>{pct}%</div>
                <div style={{fontSize:13,fontWeight:700,color:'#2E8B57',marginTop:2}}>Complete</div>
              </div>
              <div style={{background:'linear-gradient(135deg,#FFF3E0,#FFE4CC)',borderRadius:24,padding:'20px 28px',textAlign:'center',minWidth:100}}>
                <div style={{fontSize:36,fontWeight:900,color:'#FF9500'}}>{CHS.filter(c=>c.tasks.every(t=>done(t.id))).length}</div>
                <div style={{fontSize:13,fontWeight:700,color:'#CC7000',marginTop:2}}>Chapters</div>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Banner for new users */}
        {(progress.done||[]).length===0&&<div style={{background:'linear-gradient(135deg,#FF9500 0%,#FF6B35 50%,#FF2D55 100%)',borderRadius:32,padding:'32px',marginBottom:24,color:'#fff',position:'relative',overflow:'hidden',boxShadow:'0 15px 50px rgba(255,107,53,.3)'}}>
          <div style={{position:'absolute',right:-40,top:-40,fontFamily:G,fontSize:180,fontWeight:900,opacity:0.15}}>ੳ</div>
          <div style={{position:'relative',zIndex:2,display:'flex',alignItems:'center',gap:20,flexWrap:'wrap'}}>
            <div style={{fontSize:64,animation:'bounce 2s ease-in-out infinite'}}>🎉</div>
            <div style={{flex:1,minWidth:200}}>
              <div style={{fontWeight:900,fontSize:28}}>Let's Start Learning!</div>
              <div style={{fontSize:18,opacity:0.9,marginTop:6}}>Tap any lesson below to begin your Punjabi journey</div>
            </div>
          </div>
        </div>}


        {/* Fun Games Section */}
        <div onClick={()=>setScreen('games')} style={{background:'linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f093fb 100%)',borderRadius:28,padding:'24px 28px',marginBottom:24,cursor:'pointer',display:'flex',alignItems:'center',gap:20,boxShadow:'0 12px 40px rgba(102,126,234,.3)',transition:'transform .2s'}}>
          <div style={{fontSize:56,animation:'bounce 2s ease-in-out infinite'}}>🎮</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:900,fontSize:24,color:'#fff'}}>Fun Games!</div>
            <div style={{fontSize:15,color:'rgba(255,255,255,0.9)',marginTop:4}}>Play & earn ladoos while learning</div>
          </div>
          <div style={{fontSize:32,color:'#fff'}}>→</div>
        </div>

        {/* Chapter Grid - BIG BUTTONS */}
        <div style={{fontSize:16,fontWeight:900,color:'#1C1C1E',marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:24}}>📚</span> Choose Your Lesson
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:20,marginBottom:40}}>
          {CHS.map((c,ci)=>{
            const cd=c.tasks.filter(t=>done(t.id)).length;
            const cp=Math.round(cd/c.tasks.length*100);
            const prevOk=ci===0||CHS[ci-1].tasks.every(t=>done(t.id));
            const locked=ci>0&&!prevOk;
            const full=cd===c.tasks.length;
            const nextTask=c.tasks.find(t=>!done(t.id));
            const isActive=!locked&&!full;
            return <div key={c.id} onClick={()=>locked?tapLocked(c.t):openCh(c)}
              style={{background:full?'linear-gradient(135deg,#D4F5DC,#B8EEC2)':'linear-gradient(135deg,#fff,#FFFAF5)',borderRadius:32,padding:'28px',
              cursor:'pointer',opacity:locked?0.5:1,
              boxShadow:full?'0 0 0 4px #34C759, 0 15px 50px rgba(52,199,89,.2)':isActive?`0 0 0 3px ${c.color}, 0 15px 50px ${c.color}20`:'0 8px 35px rgba(0,0,0,.06)',
              position:'relative',overflow:'hidden',transition:'all .3s cubic-bezier(.34,1.56,.64,1)',minHeight:180}}>

              {/* Background Icon */}
              <div style={{position:'absolute',right:-20,bottom:-20,fontSize:120,opacity:0.08}}>{c.icon}</div>

              <div style={{position:'relative',zIndex:2}}>
                {/* Icon & Lock */}
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:16}}>
                  <div style={{width:80,height:80,borderRadius:24,background:full?'#34C759':`linear-gradient(135deg,${c.color},${c.color}CC)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:44,boxShadow:`0 8px 30px ${full?'rgba(52,199,89,.4)':`${c.color}40`}`,animation:isActive?'bounce 3s ease-in-out infinite':'none'}}>
                    {full?'✅':c.icon}
                  </div>
                  {locked&&<div style={{width:44,height:44,borderRadius:'50%',background:'rgba(0,0,0,0.05)',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:24}}>🔒</span></div>}
                  {full&&<div style={{padding:'8px 16px',background:'#34C759',borderRadius:50,color:'#fff',fontSize:13,fontWeight:800}}>DONE!</div>}
                </div>

                {/* Title */}
                <div style={{fontWeight:900,fontSize:22,color:full?'#1B7F37':'#1C1C1E',marginBottom:4}}>{c.t}</div>
                <div style={{fontFamily:G,fontSize:18,color:full?'#34C759':'#666',fontWeight:600}}>{c.tp}</div>

                {/* Next task or completion */}
                {nextTask&&!locked&&!full&&<div style={{marginTop:12,padding:'10px 16px',background:`${c.color}15`,borderRadius:16,display:'inline-flex',alignItems:'center',gap:6}}>
                  <span style={{fontSize:14,animation:'pulse2 2s infinite'}}>▶</span>
                  <span style={{fontSize:14,fontWeight:700,color:c.color}}>{nextTask.t}</span>
                </div>}

                {/* Progress bar */}
                <div style={{height:10,background:full?'rgba(52,199,89,0.2)':'rgba(0,0,0,0.05)',borderRadius:10,marginTop:16,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${cp}%`,background:full?'#34C759':`linear-gradient(90deg,${c.color},${c.color}CC)`,borderRadius:10,transition:'width .5s'}}/>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10}}>
                  <div style={{fontSize:15,color:full?'#34C759':'#888',fontWeight:700}}>{cd}/{c.tasks.length} lessons</div>
                  {!locked&&!full&&<div style={{fontSize:14,color:c.color,fontWeight:800}}>🟡 +{c.tasks.filter(t=>!done(t.id)).reduce((s,t)=>s+t.xp,0)}</div>}
                </div>
              </div>
            </div>;
          })}
        </div>

        {/* Invite Friends Section */}
        <div style={{background:'linear-gradient(135deg,#667eea,#764ba2)',borderRadius:32,padding:'32px',textAlign:'center',marginBottom:40,boxShadow:'0 15px 50px rgba(102,126,234,.3)'}}>
          <div style={{fontSize:56,marginBottom:12}}>👨‍👩‍👧‍👦</div>
          <div style={{fontWeight:900,fontSize:26,color:'#fff',marginBottom:6}}>Learn Together!</div>
          <div style={{fontSize:16,color:'rgba(255,255,255,0.85)',marginBottom:20,maxWidth:400,margin:'0 auto 20px'}}>Learning is more fun with friends and family. Invite them to join!</div>
          <button onClick={shareInvite} style={{padding:'18px 48px',background:'#fff',color:'#667eea',border:'none',borderRadius:50,fontSize:18,fontWeight:900,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 8px 30px rgba(0,0,0,.15)',transition:'transform .2s'}}>
            🎉 Invite Friends
          </button>
        </div>
      </div>
    </div>}

    {/* GAMES HUB */}
    {screen==='games'&&!currentGame&&<GamesHub onBack={goHome} onSelectGame={setCurrentGame} ladoos={progress.ladoos||0}/>}

    {/* INDIVIDUAL GAMES */}
    {screen==='games'&&currentGame==='balloon'&&<BalloonPopGame onBack={()=>setCurrentGame(null)} onScore={async(s)=>{
      const ladoos = Math.floor(s/10);
      if(ladoos > 0 && auth.currentUser) {
        try { await fbAddLadoos(auth.currentUser.uid, ladoos); } catch(e) { console.error(e); }
      }
      setProgress(p=>({...p,ladoos:(p.ladoos||0)+ladoos}));
    }}/>}
    {screen==='games'&&currentGame==='rain'&&<LetterRainGame onBack={()=>setCurrentGame(null)} onScore={async(s)=>{
      const ladoos = Math.floor(s/10);
      if(ladoos > 0 && auth.currentUser) {
        try { await fbAddLadoos(auth.currentUser.uid, ladoos); } catch(e) { console.error(e); }
      }
      setProgress(p=>({...p,ladoos:(p.ladoos||0)+ladoos}));
    }}/>}
    {screen==='games'&&currentGame==='memory'&&<MemoryMatchGame onBack={()=>setCurrentGame(null)} onScore={async(s)=>{
      const ladoos = Math.floor(s/10);
      if(ladoos > 0 && auth.currentUser) {
        try { await fbAddLadoos(auth.currentUser.uid, ladoos); } catch(e) { console.error(e); }
      }
      setProgress(p=>({...p,ladoos:(p.ladoos||0)+ladoos}));
    }}/>}
    {screen==='games'&&currentGame==='speed'&&<SpeedQuizGame onBack={()=>setCurrentGame(null)} onScore={async(s)=>{
      const ladoos = Math.floor(s/10);
      if(ladoos > 0 && auth.currentUser) {
        try { await fbAddLadoos(auth.currentUser.uid, ladoos); } catch(e) { console.error(e); }
      }
      setProgress(p=>({...p,ladoos:(p.ladoos||0)+ladoos}));
    }}/>}
  </>;
}
