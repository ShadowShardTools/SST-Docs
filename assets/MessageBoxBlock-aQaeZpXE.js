import{c as t,j as e}from"./index-Cp27bux7.js";/**
 * @license lucide-react v0.509.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]],p=t("circle-check-big",d);/**
 * @license lucide-react v0.509.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]],x=t("circle-help",h);/**
 * @license lucide-react v0.509.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]],y=t("circle-x",m);/**
 * @license lucide-react v0.509.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],f=t("info",k);/**
 * @license lucide-react v0.509.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]],j=t("triangle-alert",g),b=({index:n,styles:s,messageBoxData:c})=>{const o=()=>{switch(c.size){case"small":return"p-3 text-sm";case"medium":return"p-4 text-base";case"large":return"p-6 text-lg";default:return"p-4 text-base"}},l=()=>{const r=`rounded-lg border ${o()}`,a=c.type??"neutral",u={info:s.messageBox.info,warning:s.messageBox.warning,error:s.messageBox.error,success:s.messageBox.success,neutral:s.messageBox.neutral,quote:s.messageBox.quote};return`${r} ${u[a]??""}`},i=()=>{if(!c.showIcon)return null;const r={className:"w-5 h-5 mr-3 flex-shrink-0"};switch(c.type){case"info":return e.jsx(f,{...r});case"warning":return e.jsx(j,{...r});case"error":return e.jsx(y,{...r});case"success":return e.jsx(p,{...r});case"neutral":return e.jsx(x,{...r});default:return null}};return c.type==="quote"?e.jsx("blockquote",{className:`pl-4 py-2 mb-4 ${s.messageBox.quote}`,children:c.text&&e.jsx("p",{children:c.text})},n):e.jsx("div",{className:"my-4",children:e.jsx("div",{className:l(),children:e.jsxs("div",{className:"flex items-center",children:[i(),e.jsx("div",{className:"flex-1",children:c.text&&e.jsx("div",{className:"mb-2 last:mb-0",children:c.text})})]})})},n)};export{b as default};
