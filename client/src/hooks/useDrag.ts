import { useRef, useEffect, useState } from "react";

interface UseDragOptions {
  onDragStart?: (e: MouseEvent) => void;
  onDrag?: (e: MouseEvent, delta: { x: number; y: number }) => void;
  onDragEnd?: (e: MouseEvent, delta: { x: number; y: number }) => void;
}

interface UseDragResult {
  ref: React.RefObject<HTMLElement>;
  isDragging: boolean;
  position: { x: number; y: number };
}

export function useDrag<T extends HTMLElement = HTMLDivElement>(
  options: UseDragOptions = {}
): UseDragResult {
  const { onDragStart, onDrag, onDragEnd } = options;
  
  const ref = useRef<T>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // Store positions in a ref to avoid stale closures
  const positionRef = useRef({ x: 0, y: 0 });
  const startPositionRef = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    let startX = 0;
    let startY = 0;
    
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Only handle left clicks
      
      e.preventDefault();
      e.stopPropagation();
      
      startX = e.clientX;
      startY = e.clientY;
      
      startPositionRef.current = {
        x: positionRef.current.x,
        y: positionRef.current.y,
      };
      
      setIsDragging(true);
      
      if (onDragStart) {
        onDragStart(e);
      }
      
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      const newX = startPositionRef.current.x + dx;
      const newY = startPositionRef.current.y + dy;
      
      positionRef.current = { x: newX, y: newY };
      setPosition({ x: newX, y: newY });
      
      if (onDrag) {
        onDrag(e, { x: dx, y: dy });
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      
      if (onDragEnd) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        onDragEnd(e, { x: dx, y: dy });
      }
      
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    
    element.addEventListener("mousedown", handleMouseDown as EventListener);
    
    return () => {
      element.removeEventListener("mousedown", handleMouseDown as EventListener);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [onDrag, onDragEnd, onDragStart, isDragging]);
  
  return { ref, isDragging, position };
}
