import{c as y,r as o,j as a}from"./index-CK5Adyi0.js";/**
 * @license lucide-react v0.509.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=[["rect",{x:"14",y:"4",width:"4",height:"16",rx:"1",key:"zuxfzm"}],["rect",{x:"6",y:"4",width:"4",height:"16",rx:"1",key:"1okwgv"}]],N=y("pause",w);/**
 * @license lucide-react v0.509.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]],k=y("play",j),x=t=>{if(isNaN(t))return"0:00";const s=Math.floor(t/60),d=Math.floor(t%60).toString().padStart(2,"0");return`${s}:${d}`},P=({styles:t,audioSrc:s="",audioCaption:d,audioMimeType:g="audio/mpeg"})=>{const n=o.useRef(null),[l,i]=o.useState(!1),[m,p]=o.useState(0),[h,c]=o.useState(0);o.useEffect(()=>{const e=n.current;if(!e)return;const r=()=>p(e.duration),u=()=>c(e.currentTime),f=()=>i(!1);return e.addEventListener("loadedmetadata",r),e.addEventListener("timeupdate",u),e.addEventListener("ended",f),()=>{e.removeEventListener("loadedmetadata",r),e.removeEventListener("timeupdate",u),e.removeEventListener("ended",f)}},[]),o.useEffect(()=>{n.current&&(n.current.load(),i(!1),c(0),p(0))},[s]);const b=async()=>{const e=n.current;if(e)try{l?(e.pause(),i(!1)):(await e.play(),i(!0))}catch(r){console.error("Cannot play audio:",r),i(!1)}},v=e=>{const r=n.current;if(!r)return;const u=Number(e.target.value);r.currentTime=u,c(u)};return a.jsxs("div",{className:"mb-6",children:[a.jsxs("audio",{ref:n,src:s,preload:"metadata",children:[a.jsx("source",{src:s,type:g}),"Your browser does not support the audio element."]}),a.jsxs("div",{className:`flex items-center gap-3 rounded-md px-4 py-3 ${t.audioPlayer.container}`,children:[a.jsx("button",{onClick:b,className:`p-2 rounded-full cursor-pointer ${t.audioPlayer.playButton}`,children:l?a.jsx(N,{className:"w-5 h-5"}):a.jsx(k,{className:"w-5 h-5"})}),a.jsx("span",{className:`w-12 select-none ${t.audioPlayer.time}`,children:x(h)}),a.jsx("input",{type:"range",min:0,max:m||0,step:.1,value:h,onChange:v,className:`flex-1 h-1 rounded-lg appearance-none cursor-pointer ${t.audioPlayer.slider}
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3
            [&::-moz-range-thumb]:rounded-full 
            ${t.audioPlayer.sliderThumb}`}),a.jsx("span",{className:`w-12 select-none ${t.audioPlayer.time}`,children:x(m)})]}),d&&a.jsx("p",{className:t.text.alternative,children:d})]})};export{P as default};
