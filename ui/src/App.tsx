import { Box, Portal, Button } from "@chakra-ui/react";
import React, { useRef, useState } from "react";
import { DRAWER_Z_INDEX } from "./const";
const WorkflowChat = React.lazy(() => import("./workflowChat/workflowChat"));

export default function App() {
  const workspaceContainerRef = useRef(null);
  const [showChat, setShowChat] = useState(true);

  return (
    <div ref={workspaceContainerRef} className="workspace_manager">

      {/*<Portal containerRef={workspaceContainerRef}>*/}
      {/*  <Box*/}
      {/*    style={{*/}
      {/*      position: "absolute",*/}
      {/*      top: 0,*/}
      {/*      right: 0,*/}
      {/*      left: 0,*/}
      {/*    }}*/}
      {/*    zIndex={DRAWER_Z_INDEX}*/}
      {/*    draggable={false}*/}
      {/*  >*/}
          <Button onClick={() => setShowChat(true)}>show chat</Button>
          {showChat && <WorkflowChat onClose={() => setShowChat(false)} />}
        {/*</Box>*/}
      {/*</Portal>*/}
    </div>
  );
}
