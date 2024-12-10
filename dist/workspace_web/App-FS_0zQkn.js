import{r as o,j as e,R as a,_ as n}from"./input.js";const c=9999999,i=a.lazy(()=>n(()=>import("./workflowChat-_jccEjkM.js"),__vite__mapDeps([0,1,2])));function d(){const r=o.useRef(null),[s,t]=o.useState(!0);return e.jsx("div",{ref:r,children:e.jsxs("div",{className:"absolute top-0 right-0",style:{zIndex:c},children:[e.jsx("button",{onClick:()=>t(!0),className:"px-4 py-2 cursor-pointer border border-gray-300 rounded-md bg-white text-black hover:bg-green-600 transition-colors",children:"show chat"}),s&&e.jsx(i,{onClose:()=>t(!1)})]})})}export{d as default};
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = ["workspace_web/workflowChat-_jccEjkM.js","workspace_web/input.js","workspace_web/assets/input-E0UkDwze.css"]
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}