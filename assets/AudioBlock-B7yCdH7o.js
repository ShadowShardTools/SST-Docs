import{c as y,r,j as n}from"./index-B8HFizgY.js";/**
 * @license lucide-react v0.509.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=[["rect",{x:"14",y:"4",width:"4",height:"16",rx:"1",key:"zuxfzm"}],["rect",{x:"6",y:"4",width:"4",height:"16",rx:"1",key:"1okwgv"}]],N=y("pause",w);/**
 * @license lucide-react v0.509.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]],S=y("play",j),x=t=>{if(isNaN(t))return"0:00";const s=Math.floor(t/60),c=Math.floor(t%60).toString().padStart(2,"0");return`${s}:${c}`},E=({styles:t,audioSrc:s="",audioCaption:c,audioMimeType:g="audio/mpeg"})=>{const a=r.useRef(null),[l,i]=r.useState(!1),[m,p]=r.useState(0),[h,d]=r.useState(0);r.useEffect(()=>{const e=a.current;if(!e)return;const o=()=>p(e.duration),u=()=>d(e.currentTime),f=()=>i(!1);return e.addEventListener("loadedmetadata",o),e.addEventListener("timeupdate",u),e.addEventListener("ended",f),()=>{e.removeEventListener("loadedmetadata",o),e.removeEventListener("timeupdate",u),e.removeEventListener("ended",f)}},[]),r.useEffect(()=>{a.current&&(a.current.load(),i(!1),d(0),p(0))},[s]);const b=async()=>{const e=a.current;if(e)try{l?(e.pause(),i(!1)):(await e.play(),i(!0))}catch(o){console.error("Cannot play audio:",o),i(!1)}},v=e=>{const o=a.current;if(!o)return;const u=Number(e.target.value);o.currentTime=u,d(u)};return n.jsxs("div",{className:"mb-6",children:[n.jsxs("audio",{ref:a,src:s,preload:"metadata",children:[n.jsx("source",{src:s,type:g}),"Your browser does not support the audio element."]}),n.jsxs("div",{className:`flex items-center gap-3 rounded-md px-4 py-3 ${t.componentsStyles.audioContainer}`,children:[n.jsx("button",{onClick:b,className:`p-2 rounded-full cursor-pointer ${t.componentsStyles.audioPlayButton}`,children:l?n.jsx(N,{className:"w-5 h-5"}):n.jsx(S,{className:"w-5 h-5"})}),n.jsx("span",{className:`w-12 select-none ${t.componentsStyles.audioTime}`,children:x(h)}),n.jsx("input",{type:"range",min:0,max:m||0,step:.1,value:h,onChange:v,className:`flex-1 h-1 rounded-lg appearance-none cursor-pointer ${t.componentsStyles.audioSlider}
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3
            [&::-moz-range-thumb]:rounded-full 
            ${t.componentsStyles.audioSliderThumb}`}),n.jsx("span",{className:`w-12 select-none ${t.componentsStyles.audioTime}`,children:x(m)})]}),c&&n.jsx("p",{className:t.textStyles.alternativeText,children:c})]})};export{E as default};
