import{r as s,j as e,R as a,_ as n}from"./input.js";const i=9999999,l=a.lazy(()=>n(()=>import("./workflowChat-okCatpI6.js"),__vite__mapDeps([0,1,2])));function d(){const o=s.useRef(null),[r,t]=s.useState(!1);return e.jsx("div",{ref:o,children:e.jsxs("div",{className:"absolute top-0 right-0",style:{zIndex:i},children:[e.jsx("button",{onClick:()=>t(!0),className:"px-4 py-2 cursor-pointer border border-gray-300 rounded-md bg-white text-black hover:bg-green-600 transition-colors",children:"show chat"}),e.jsx(l,{onClose:()=>t(!1),visible:r})]})})}export{d as default};
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = ["copilot_web/workflowChat-okCatpI6.js","copilot_web/input.js","copilot_web/assets/input-E9RzrsRA.css"]
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}