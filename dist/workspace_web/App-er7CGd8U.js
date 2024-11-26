import{c as x,f as l,j as e,r as i,P as d,B as p,R as h,_}from"./input.js";var n=x("div");n.displayName="Box";var c=l(function(t,s){const{size:a,centerContent:o=!0,...f}=t,u=o?{display:"flex",alignItems:"center",justifyContent:"center"}:{};return e.jsx(n,{ref:s,boxSize:a,__css:{...u,flexShrink:0,flexGrow:0},...f})});c.displayName="Square";var C=l(function(t,s){const{size:a,...o}=t;return e.jsx(c,{size:a,ref:s,borderRadius:"9999px",...o})});C.displayName="Circle";const R=9999999,j=h.lazy(()=>_(()=>import("./workflowChat-58YESQMK.js"),__vite__mapDeps([0,1])));function w(){const r=i.useRef(null),[t,s]=i.useState(!1);return e.jsx("div",{ref:r,className:"workspace_manager",children:e.jsx(d,{containerRef:r,children:e.jsxs(n,{style:{position:"absolute",top:0,right:0,left:0},zIndex:R,draggable:!1,children:[e.jsx(p,{onClick:()=>s(!0),children:"show chat"}),t&&e.jsx(j,{onClose:()=>s(!1)})]})})})}export{w as default};
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = ["workspace_web/workflowChat-58YESQMK.js","workspace_web/input.js"]
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}