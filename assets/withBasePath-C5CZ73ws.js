function c(t){if(!t)return"";if(/^https?:\/\//i.test(t)||/^data:/i.test(t))return t;const e="/SST-Docs/",s=e.endsWith("/")?e.slice(0,-1):e,n=t.replace(/^\//,"");return`${s}/${n}`}export{c as w};
