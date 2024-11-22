import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Box, Portal, useToast } from "@chakra-ui/react";
import {
  loadDBs,
  mediaTable,
} from "./db-tables/WorkspaceDB";
import { Topbar } from "./topbar/Topbar";
import React from "react";
const WorkflowChat = React.lazy(() => import("./workflowChat/workflowChat"));
import { DRAWER_Z_INDEX } from "./const";
import { api, app } from "./utils/comfyapp";

export default function App() {
  const [loadingDB, setLoadingDB] = useState(true);
  const workspaceContainerRef = useRef(null);
  const [showChat, setShowChat] = useState(false);


  const graphAppSetup = async () => {
    // localStorage.removeItem("workspace");
    // localStorage.removeItem("comfyspace");
    try {
      await loadDBs();
    } catch (error) {
      console.error("🦄Workspace Manager - Error loading db", error);
    }
    setLoadingDB(false);
  };


  useEffect(() => {
    /**
     * because we have turned on strict mode, useEffect will be executed twice in strict mode in the development environment.
     * and graphAppSetup contains DB related operations, repeated execution will bring some bad results.
     * so in development environment mode, the first execution is skipped.
     */
    graphAppSetup();
  }, []);

  if (loadingDB) {
    return null;
  }

  return (
      <div ref={workspaceContainerRef} className="workspace_manager">
        <Portal containerRef={workspaceContainerRef}>
          <Box
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              left: 0,
            }}
            zIndex={DRAWER_Z_INDEX}
            draggable={false}
          >
            <Topbar 
              onChatClick={() => setShowChat(true)}
              showChat={showChat}
            />
            {showChat && <WorkflowChat onClose={() => setShowChat(false)} />}
          </Box>
        </Portal>
      </div>
  );
}
