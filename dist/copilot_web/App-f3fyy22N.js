import{r as t,j as s,R as p,_ as v}from"./input.js";const w=9999999,E=p.lazy(()=>v(()=>import("./workflowChat-Irtg-vKs.js"),__vite__mapDeps([0,1,2])));function y(){const d=t.useRef(null),[f,a]=t.useState(!1),[r,c]=t.useState(),[o,u]=t.useState(!1),[i,m]=t.useState({x:0,y:0});t.useEffect(()=>{c({x:window.innerWidth-160,y:20})},[]);const h=e=>{e.preventDefault(),u(!0);const n=e.currentTarget.getBoundingClientRect();m({x:e.clientX-n.left,y:e.clientY-n.top})};return t.useEffect(()=>{const e=l=>{if(o){const x=Math.min(Math.max(0,l.clientX-i.x),window.innerWidth-100),g=Math.min(Math.max(0,l.clientY-i.y),window.innerHeight-40);c({x,y:g})}},n=()=>{u(!1)};return o&&(document.addEventListener("mousemove",e),document.addEventListener("mouseup",n)),()=>{document.removeEventListener("mousemove",e),document.removeEventListener("mouseup",n)}},[o,i]),r?s.jsx("div",{ref:d,children:s.jsxs("div",{className:"fixed",style:{zIndex:w,left:r.x,top:r.y,cursor:o?"grabbing":"grab"},children:[s.jsx("button",{onMouseDown:h,onClick:()=>a(!0),className:"px-4 py-2 border border-gray-300 rounded-md bg-white text-black hover:bg-green-600 transition-colors select-none",children:"copilot"}),s.jsx(E,{onClose:()=>a(!1),visible:f})]})}):null}export{y as default};
function __vite__mapDeps(indexes) {
          const apiBase = window.comfyAPI?.api?.api?.api_base;
          const prefix = apiBase ? `${apiBase.substring(1)}/` : '';
          if (!__vite__mapDeps.viteFileDeps) {
            __vite__mapDeps.viteFileDeps = ["copilot_web/workflowChat-Irtg-vKs.js","copilot_web/input.js","copilot_web/assets/input-Vr0StwNx.css"].map(
              path => `${prefix}${path}`
            );
          }
          return indexes.map((i) => __vite__mapDeps.viteFileDeps[i]);
        }