import{r as s,j as e,R as a,_ as n}from"./input.js";const i=9999999,l=a.lazy(()=>n(()=>import("./workflowChat-cP3Jqqxe.js"),__vite__mapDeps([0,1,2])));function d(){const o=s.useRef(null),[r,t]=s.useState(!1);return e.jsx("div",{ref:o,children:e.jsxs("div",{className:"absolute top-0 right-0",style:{zIndex:i},children:[e.jsx("button",{onClick:()=>t(!0),className:"px-4 py-2 cursor-pointer border border-gray-300 rounded-md bg-white text-black hover:bg-green-600 transition-colors",children:"show chat"}),e.jsx(l,{onClose:()=>t(!1),visible:r})]})})}export{d as default};
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = ["dsw-2976/proxy/8188/copilot_web/workflowChat-cP3Jqqxe.js","dsw-2976/proxy/8188/copilot_web/input.js","dsw-2976/proxy/8188/copilot_web/assets/input-pKT7PI1W.css"]
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}