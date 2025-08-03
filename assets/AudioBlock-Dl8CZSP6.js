import{c as f,r as a,j as n}from"./index-Cp27bux7.js";/**
 * @license lucide-react v0.509.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["rect",{x:"14",y:"4",width:"4",height:"16",rx:"1",key:"zuxfzm"}],["rect",{x:"6",y:"4",width:"4",height:"16",rx:"1",key:"1okwgv"}]],b=f("pause",g);/**
 * @license lucide-react v0.509.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]],w=f("play",v);function k(r){const e=a.useRef(null),[o,s]=a.useState(!1),[d,c]=a.useState(0),[m,u]=a.useState(0);a.useEffect(()=>{const t=e.current;if(!t)return;const i=()=>c(t.duration),l=()=>u(t.currentTime),p=()=>s(!1);return t.addEventListener("loadedmetadata",i),t.addEventListener("timeupdate",l),t.addEventListener("ended",p),()=>{t.removeEventListener("loadedmetadata",i),t.removeEventListener("timeupdate",l),t.removeEventListener("ended",p)}},[]),a.useEffect(()=>{e.current&&(e.current.load(),s(!1),u(0),c(0))},[r]);const x=a.useCallback(async()=>{const t=e.current;if(t)try{o?(t.pause(),s(!1)):(await t.play(),s(!0))}catch(i){console.error("Cannot play audio:",i),s(!1)}},[o]),y=a.useCallback(t=>{const i=e.current;if(!i)return;const l=Number(t.target.value);i.currentTime=l,u(l)},[]);return{audioRef:e,isPlaying:o,duration:d,current:m,togglePlay:x,handleSeek:y}}const h=r=>{if(isNaN(r)||r<0)return"0:00";const e=Math.floor(r/60),o=Math.floor(r%60);return`${e}:${o.toString().padStart(2,"0")}`},P=({styles:r,audioData:e})=>{const{audioRef:o,isPlaying:s,duration:d,current:c,togglePlay:m,handleSeek:u}=k(e.src);return n.jsxs("div",{className:"mb-6",children:[n.jsxs("audio",{ref:o,src:e.src,preload:"metadata",children:[n.jsx("source",{src:e.src,type:e.mimeType}),"Your browser does not support the audio element."]}),n.jsxs("div",{className:`flex items-center gap-3 rounded-md px-4 py-3 ${r.audioPlayer.container}`,children:[n.jsx("button",{onClick:m,className:`p-2 rounded-full cursor-pointer ${r.audioPlayer.playButton}`,children:s?n.jsx(b,{className:"w-5 h-5"}):n.jsx(w,{className:"w-5 h-5"})}),n.jsx("span",{className:`w-12 select-none ${r.audioPlayer.time}`,children:h(c)}),n.jsx("input",{type:"range",min:0,max:d||0,step:.1,value:c,onChange:u,className:`flex-1 h-1 rounded-lg appearance-none cursor-pointer ${r.audioPlayer.slider}
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3
            [&::-moz-range-thumb]:rounded-full 
            ${r.audioPlayer.sliderThumb}`}),n.jsx("span",{className:`w-12 select-none ${r.audioPlayer.time}`,children:h(d)})]}),e.caption&&n.jsx("p",{className:r.text.alternative,children:e.caption})]})};export{P as default};
