import{c as d,u as x,s as p,j as a}from"./index-YtAVS9Or.js";/**
 * @license lucide-react v0.509.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=[["path",{d:"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",key:"1cjeqo"}],["path",{d:"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",key:"19qd67"}]],y=d("link",u),g=t=>t.toLowerCase().trim().replace(/\s+/g,"-").replace(/[^\w-]/g,""),$=({level:t,index:n,content:l,currentPath:o})=>{const r=x(),s=p.themes[r],i={h1:`${s.textStyles.h1}`,h2:`${s.textStyles.h2}`,h3:`${s.textStyles.h3}`},e=g(l),h=t;return a.jsxs(h,{id:e,className:`${i[t]} scroll-mt-20 group relative`,"data-anchor-id":e,children:[l,a.jsx("a",{href:`#${o}#${e}`,className:"ml-2 inline-block text-gray-400 hover:text-blue-500","aria-label":"Anchor link",onClick:m=>{var c;m.preventDefault(),window.history.replaceState(null,"",`#${o}#${e}`),(c=document.getElementById(e))==null||c.scrollIntoView({behavior:"smooth",block:"start"})},children:a.jsx(y,{className:"w-4 h-4"})})]},n)};export{$ as H};
