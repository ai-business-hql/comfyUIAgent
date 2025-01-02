import React, { useRef, useState, useEffect } from "react";
import { DRAWER_Z_INDEX } from "./const";
const WorkflowChat = React.lazy(() => import("./workflowChat/workflowChat"));

export default function App() {
  const workspaceContainerRef = useRef(null);
  const [showChat, setShowChat] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setPosition({
      x: window.innerWidth - 160,
      y: 20
    });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const buttonRect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - buttonRect.left,
      y: e.clientY - buttonRect.top
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.min(Math.max(0, e.clientX - dragOffset.x), window.innerWidth - 100);
        const newY = Math.min(Math.max(0, e.clientY - dragOffset.y), window.innerHeight - 40);
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!position) return null;

  return (
    <div ref={workspaceContainerRef}>
      <div 
        className="fixed" 
        style={{ 
          zIndex: DRAWER_Z_INDEX,
          left: position.x,
          top: position.y,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <button 
          onMouseDown={handleMouseDown}
          onClick={() => setShowChat(true)}
          className="px-4 py-2 border border-gray-300 rounded-md bg-white text-black hover:bg-green-600 transition-colors select-none"
        >
          show chat
        </button>
        <WorkflowChat onClose={() => setShowChat(false)} visible={showChat} />
      </div>
    </div>
  );
}
