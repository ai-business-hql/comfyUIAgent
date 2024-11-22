import { Button, HStack, Tooltip } from "@chakra-ui/react";
import Draggable from "../components/Draggable";
import {
  IconMessage,
} from "@tabler/icons-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { PanelPosition } from "../types/dbTypes";
import "./Topbar.css";
import { userSettingsTable } from "../db-tables/WorkspaceDB";

interface Props {
  onChatClick: () => void;
  showChat: boolean;
}
export function Topbar({ onChatClick, showChat }: Props) {
  const [positionStyle, setPositionStyle] = useState<PanelPosition>();
  const updatePanelPosition: (
    position?: PanelPosition,
    needUpdateDB?: boolean,
  ) => void = useCallback(
    (position?: PanelPosition, needUpdateDB: boolean = false) => {
      const { top: curTop = 0, left: curLeft = 0 } = positionStyle || {};
      let { top = 0, left = 0 } = position ?? {};
      top += curTop;
      left += curLeft;
      const clientWidth = document.documentElement.clientWidth;
      const clientHeight = document.documentElement.clientHeight;
      const panelElement = document.getElementById("workspaceManagerPanel");
      const offsetWidth = panelElement?.offsetWidth || 392;

      if (top + 36 > clientHeight) top = clientHeight - 36;
      if (left + offsetWidth >= clientWidth) left = clientWidth - offsetWidth;

      setPositionStyle({ top: Math.max(0, top), left: Math.max(0, left) });

      needUpdateDB &&
        userSettingsTable?.upsert({
          topBarStyle: { top, left },
        });
    },
    [positionStyle],
  );
  useEffect(() => {
    userSettingsTable?.getSetting("topBarStyle").then((res) => {
      updatePanelPosition(res, false);
    });
  }, []);
  if (!positionStyle) {
    return null;
  }
  return (
    <Draggable
      onDragEnd={(position: { x: number; y: number }) => {
        updatePanelPosition({ top: position.y, left: position.x }, true);
      }}
      dragIconId="dragPanelIcon"
    >
      <HStack
        style={{
          padding: 2,
          position: "fixed",
          ...positionStyle,
        }}
        justifyContent={"space-between"}
        alignItems={"center"}
        gap={2}
        draggable={false}
        id="workspaceManagerPanel"
        className="workspaceManagerPanel"
      >

        <Tooltip label="Chat with AI about this workflow">
          <Button
            size="sm"
            variant="ghost"
            onClick={onChatClick}
            isActive={showChat}
            aria-label="Chat"
          >
            <IconMessage size={20} />
          </Button>
        </Tooltip>
      </HStack>
    </Draggable>
  );
}
