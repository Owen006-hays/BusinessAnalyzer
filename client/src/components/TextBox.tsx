import { useState, useRef, useEffect } from "react";
import { useDrag } from "react-dnd";
import { TextBox as TextBoxType } from "@shared/schema";
import { useAnalysisContext } from "@/context/AnalysisContext";
import ColorPicker from "@/components/ColorPicker";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TextBoxProps {
  box: TextBoxType;
  templateZone?: string;
}

const TextBox: React.FC<TextBoxProps> = ({ box, templateZone }) => {
  const { updateTextBox, deleteTextBox } = useAnalysisContext();
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(box.content);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [resizing, setResizing] = useState(false);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  
  // Initialize with box dimensions
  const [dimensions, setDimensions] = useState({
    width: box.width || 200,
    height: box.height || 'auto',
  });

  // Set up the drag handler
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "TEXT_BOX",
    item: { id: box.id, x: box.x, y: box.y },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [box.id, box.x, box.y]);

  // Handle color change
  const handleColorChange = (color: string) => {
    updateTextBox(box.id, { color });
    setShowColorPicker(false);
  };

  // Handle text content change
  const handleContentChange = () => {
    if (contentEditableRef.current) {
      const newContent = contentEditableRef.current.textContent || "";
      setContent(newContent);
      updateTextBox(box.id, { content: newContent });
    }
  };

  // Handle mouse down for resizing
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = dimensions.width;
    const element = e.currentTarget.parentElement;
    const startHeight = dimensions.height === 'auto' ? 
      element?.offsetHeight || 0 : 
      dimensions.height as number;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(100, startWidth + (moveEvent.clientX - startX));
      const newHeight = Math.max(50, startHeight + (moveEvent.clientY - startY));
      
      setDimensions({
        width: newWidth,
        height: newHeight,
      });
    };
    
    const handleMouseUp = () => {
      setResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      updateTextBox(box.id, { 
        width: dimensions.width,
        height: dimensions.height === 'auto' ? null : dimensions.height as number,
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Double click to edit
  const handleDoubleClick = () => {
    if (!editing) {
      setEditing(true);
      // Focus after render
      setTimeout(() => {
        if (contentEditableRef.current) {
          contentEditableRef.current.focus();
          
          // Select all text
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(contentEditableRef.current);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }, 0);
    }
  };

  // Handle blur to exit editing mode
  const handleBlur = () => {
    setEditing(false);
    handleContentChange();
  };

  // Handle key press in edit mode
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setEditing(false);
      handleContentChange();
    }
  };

  // Handle delete text box
  const handleDelete = () => {
    deleteTextBox(box.id);
  };

  // Update local content when box.content changes
  useEffect(() => {
    setContent(box.content);
  }, [box.content]);

  // Handle keyboard events with a simpler approach
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && !editing) {
        // Check if the active element is within a child of our textbox
        const active = document.activeElement;
        const textBoxElements = document.querySelectorAll(`[data-id="${box.id}"]`);
        for (const el of Array.from(textBoxElements)) {
          if (el.contains(active)) {
            handleDelete();
            break;
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editing, box.id, deleteTextBox]);

  // Dynamically determine background color based on box.color
  const getBgColorClass = () => {
    switch (box.color) {
      case 'blue': return 'bg-blue-100 border-blue-200';
      case 'green': return 'bg-green-100 border-green-200';
      case 'yellow': return 'bg-yellow-100 border-yellow-200';
      case 'red': return 'bg-red-100 border-red-200';
      case 'purple': return 'bg-purple-100 border-purple-200';
      default: return 'bg-white border-gray-300';
    }
  };

  return (
    <div
      ref={dragRef}
      data-id={box.id}
      className={`absolute text-box group ${getBgColorClass()} border rounded-md p-3 shadow-sm cursor-move transition-shadow duration-200 hover:shadow-md ${
        isDragging ? 'opacity-50' : ''
      } ${resizing ? 'select-none' : ''}`}
      style={{
        left: `${box.x}px`,
        top: `${box.y}px`,
        width: `${dimensions.width}px`,
        height: dimensions.height === 'auto' ? 'auto' : `${dimensions.height}px`,
        zIndex: isDragging ? 1000 : 1
      }}
      onDoubleClick={handleDoubleClick}
    >
      <div
        ref={contentEditableRef}
        contentEditable={editing}
        suppressContentEditableWarning
        className={`text-sm text-gray-800 min-h-[40px] outline-none ${
          editing ? 'bg-white bg-opacity-50 p-1 rounded' : ''
        }`}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      >
        {content}
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize opacity-50 md:opacity-0 group-hover:opacity-100 hover:opacity-100 touch-manipulation"
        onMouseDown={handleResizeMouseDown}
        onTouchStart={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const startX = touch.clientX;
          const startY = touch.clientY;
          const startWidth = dimensions.width;
          const element = e.currentTarget.parentElement;
          const startHeight = dimensions.height === 'auto' ? 
            element?.offsetHeight || 0 : 
            dimensions.height as number;
          
          const handleTouchMove = (moveEvent: TouchEvent) => {
            const touch = moveEvent.touches[0];
            const newWidth = Math.max(100, startWidth + (touch.clientX - startX));
            const newHeight = Math.max(50, startHeight + (touch.clientY - startY));
            
            setDimensions({
              width: newWidth,
              height: newHeight,
            });
          };
          
          const handleTouchEnd = () => {
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
            
            updateTextBox(box.id, { 
              width: dimensions.width,
              height: dimensions.height === 'auto' ? null : dimensions.height as number,
            });
          };
          
          document.addEventListener('touchmove', handleTouchMove, { passive: false });
          document.addEventListener('touchend', handleTouchEnd);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-400"
        >
          <polyline points="16 16 22 16 22 22"></polyline>
          <polyline points="8 16 16 16 16 8"></polyline>
          <polyline points="4 16 8 16 8 4"></polyline>
          <line x1="16" y1="16" x2="22" y2="22"></line>
          <line x1="8" y1="16" x2="16" y2="8"></line>
          <line x1="4" y1="16" x2="8" y2="4"></line>
        </svg>
      </div>

      {/* Menu trigger */}
      <div className="absolute top-1 right-1 opacity-50 md:opacity-0 hover:opacity-100 group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-8 w-8 rounded-full bg-white bg-opacity-70 flex items-center justify-center hover:bg-opacity-100">
              <MoreHorizontal className="h-5 w-5 text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => setShowColorPicker(true)}>
              色を変更
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Color picker */}
      {showColorPicker && (
        <ColorPicker 
          onSelectColor={handleColorChange} 
          onClose={() => setShowColorPicker(false)} 
        />
      )}
    </div>
  );
};

export default TextBox;
