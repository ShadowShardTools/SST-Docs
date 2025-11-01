import{c as b,r as o,j as r}from"./index-B377ZACG.js";import{w}from"./withBasePath-C5CZ73ws.js";/**
 * @license lucide-react v0.509.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=[["rect",{x:"14",y:"4",width:"4",height:"16",rx:"1",key:"zuxfzm"}],["rect",{x:"6",y:"4",width:"4",height:"16",rx:"1",key:"1okwgv"}]],P=b("pause",$);/**
 * @license lucide-react v0.509.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]],N=b("play",j);/**
 * @license lucide-react v0.509.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["path",{d:"M16 9a5 5 0 0 1 0 6",key:"1q6k2b"}]],C=b("volume-1",E);/**
 * @license lucide-react v0.509.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["path",{d:"M16 9a5 5 0 0 1 0 6",key:"1q6k2b"}],["path",{d:"M19.364 18.364a9 9 0 0 0 0-12.728",key:"ijwkga"}]],L=b("volume-2",M);/**
 * @license lucide-react v0.509.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["line",{x1:"22",x2:"16",y1:"9",y2:"15",key:"1ewh16"}],["line",{x1:"16",x2:"22",y1:"9",y2:"15",key:"5ykzw1"}]],z=b("volume-x",S),k=a=>{if(isNaN(a)||a<0)return"0:00";const t=Math.floor(a/60),u=Math.floor(a%60);return`${t}:${u.toString().padStart(2,"0")}`};function _(a){const t=o.useRef(null),[u,s]=o.useState(!1),[y,c]=o.useState(0),[h,p]=o.useState(0),[f,i]=o.useState(1);o.useEffect(()=>{const e=t.current;if(!e)return;const n=()=>c(e.duration),l=()=>p(e.currentTime),d=()=>s(!1);return e.addEventListener("loadedmetadata",n),e.addEventListener("timeupdate",l),e.addEventListener("ended",d),()=>{e.removeEventListener("loadedmetadata",n),e.removeEventListener("timeupdate",l),e.removeEventListener("ended",d)}},[]),o.useEffect(()=>{const e=t.current;if(!e)return;const n=()=>i(e.volume);return i(e.volume),e.addEventListener("volumechange",n),()=>{e.removeEventListener("volumechange",n)}},[]),o.useEffect(()=>{t.current&&(t.current.load(),s(!1),p(0),c(0))},[a]),o.useEffect(()=>{t.current&&(t.current.volume=f)},[f]);const g=o.useCallback(async()=>{const e=t.current;if(e)try{u?(e.pause(),s(!1)):(await e.play(),s(!0))}catch(n){console.error("Cannot play audio:",n),s(!1)}},[u]),x=o.useCallback(e=>{const n=t.current;if(!n)return;const l=Number(e.target.value);n.currentTime=l,p(l)},[]),m=o.useCallback(e=>{const n=t.current;if(!n)return;const l=Number(e.target.value),d=Math.min(1,Math.max(0,l));n.volume=d,i(d)},[]);return{audioRef:t,isPlaying:u,duration:y,current:h,togglePlay:g,handleSeek:x,volume:f,handleVolumeChange:m}}const V=({styles:a,audioData:t})=>{const u=t?w(t.src):"",{audioRef:s,isPlaying:y,duration:c,current:h,togglePlay:p,handleSeek:f,volume:i,handleVolumeChange:g}=_(u),x=i===0?z:i<.5?C:L,m=a.audioPlayer.sliderTrackColor??"rgba(148, 163, 184, 0.35)",e=a.audioPlayer.sliderFillColor??"rgba(41, 37, 36, 0.9)",n=c>0?Math.min(100,Math.max(0,h/c*100)):0,l=Math.min(100,Math.max(0,i*100)),d={background:`linear-gradient(to right, ${e} 0%, ${e} ${l}%, ${m} ${l}%, ${m} 100%)`},v={background:`linear-gradient(to right, ${e} 0%, ${e} ${n}%, ${m} ${n}%, ${m} 100%)`};return r.jsxs("div",{className:"mb-6",children:[r.jsxs("audio",{ref:s,src:u,preload:"metadata",children:[r.jsx("source",{src:u,type:t.mimeType}),"Your browser does not support the audio element."]}),r.jsxs("div",{className:`flex flex-wrap md:flex-nowrap items-center gap-3 rounded-md px-4 py-3 ${a.audioPlayer.container}`,children:[r.jsx("button",{onClick:p,className:`p-2 rounded-full cursor-pointer ${a.audioPlayer.playButton}`,"aria-label":y?"Pause audio":"Play audio",children:y?r.jsx(P,{className:"w-5 h-5"}):r.jsx(N,{className:"w-5 h-5"})}),r.jsx("span",{className:`w-12 select-none ${a.audioPlayer.time}`,children:k(h)}),r.jsx("input",{type:"range",min:0,max:c||0,step:.1,value:h,onChange:f,className:`flex-1 min-w-[160px] h-1 rounded-lg appearance-none cursor-pointer ${a.audioPlayer.slider}
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3
            [&::-moz-range-thumb]:rounded-full 
            ${a.audioPlayer.sliderThumb}`,"aria-label":"Seek within audio",style:v}),r.jsx("span",{className:`w-12 select-none ${a.audioPlayer.time}`,children:k(c)}),r.jsxs("div",{className:"flex items-center gap-2 w-28 shrink-0",children:[r.jsx(x,{className:`w-4 h-4 ${a.audioPlayer.time}`}),r.jsx("input",{type:"range",min:0,max:1,step:.01,value:i,onChange:g,"aria-label":"Adjust volume",className:`w-full h-1 rounded-lg appearance-none cursor-pointer ${a.audioPlayer.slider}
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3
              [&::-moz-range-thumb]:rounded-full 
              ${a.audioPlayer.sliderThumb}`,style:d})]})]}),t.caption&&r.jsx("p",{className:a.text.alternative,children:t.caption})]})};export{V as AudioBlock,V as default};
