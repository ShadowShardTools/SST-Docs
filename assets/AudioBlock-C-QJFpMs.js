import{c as x,r as s,j as r}from"./index-CSzWdVZ4.js";/**
 * @license lucide-react v0.509.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["rect",{x:"14",y:"4",width:"4",height:"16",rx:"1",key:"zuxfzm"}],["rect",{x:"6",y:"4",width:"4",height:"16",rx:"1",key:"1okwgv"}]],v=x("pause",g);/**
 * @license lucide-react v0.509.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]],N=x("play",w),f=t=>{if(isNaN(t))return"0:00";const n=Math.floor(t/60),a=Math.floor(t%60).toString().padStart(2,"0");return`${n}:${a}`},k=({styles:t,audioData:n})=>{const a=s.useRef(null),[u,c]=s.useState(!1),[l,m]=s.useState(0),[p,d]=s.useState(0);s.useEffect(()=>{const e=a.current;if(!e)return;const o=()=>m(e.duration),i=()=>d(e.currentTime),h=()=>c(!1);return e.addEventListener("loadedmetadata",o),e.addEventListener("timeupdate",i),e.addEventListener("ended",h),()=>{e.removeEventListener("loadedmetadata",o),e.removeEventListener("timeupdate",i),e.removeEventListener("ended",h)}},[]),s.useEffect(()=>{a.current&&(a.current.load(),c(!1),d(0),m(0))},[n.src]);const y=s.useCallback(async()=>{const e=a.current;if(e)try{u?(e.pause(),c(!1)):(await e.play(),c(!0))}catch(o){console.error("Cannot play audio:",o),c(!1)}},[u]),b=s.useCallback(e=>{const o=a.current;if(!o)return;const i=Number(e.target.value);o.currentTime=i,d(i)},[]);return r.jsxs("div",{className:"mb-6",children:[r.jsxs("audio",{ref:a,src:n.src,preload:"metadata",children:[r.jsx("source",{src:n.src,type:n.mimeType}),"Your browser does not support the audio element."]}),r.jsxs("div",{className:`flex items-center gap-3 rounded-md px-4 py-3 ${t.audioPlayer.container}`,children:[r.jsx("button",{onClick:y,className:`p-2 rounded-full cursor-pointer ${t.audioPlayer.playButton}`,children:u?r.jsx(v,{className:"w-5 h-5"}):r.jsx(N,{className:"w-5 h-5"})}),r.jsx("span",{className:`w-12 select-none ${t.audioPlayer.time}`,children:f(p)}),r.jsx("input",{type:"range",min:0,max:l||0,step:.1,value:p,onChange:b,className:`flex-1 h-1 rounded-lg appearance-none cursor-pointer ${t.audioPlayer.slider}
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3
            [&::-moz-range-thumb]:rounded-full 
            ${t.audioPlayer.sliderThumb}`}),r.jsx("span",{className:`w-12 select-none ${t.audioPlayer.time}`,children:f(l)})]}),n.caption&&r.jsx("p",{className:t.text.alternative,children:n.caption})]})};export{k as default};
