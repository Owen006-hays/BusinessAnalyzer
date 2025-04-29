import { useState, useRef, useEffect } from "react";
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
  const dragRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: box.x, y: box.y });
  
  // Initialize with box dimensions and define explicit type
  type Dimensions = {
    width: number;
    height: number | 'auto';
  };
  
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: box.width || 200,
    height: box.height || 'auto',
  });

  // Handle color change
  const handleColorChange = (color: string) => {
    updateTextBox(box.id, { color });
    setShowColorPicker(false);
  };

  // Handle text content change
  const handleContentChange = () => {
    if (contentEditableRef.current) {
      // テキストが空でも最低限のスペースを保持して削除されないようにする
      let newContent = contentEditableRef.current.textContent || "";
      
      // 完全に空のテキストの場合は、代わりにスペースを入れる
      if (newContent.trim() === "") {
        newContent = " ";
        // UIに表示するローカルstateはスペースを設定
        setContent(newContent);
        // 編集可能要素に直接スペースを設定
        if (contentEditableRef.current) {
          contentEditableRef.current.textContent = newContent;
        }
      } else {
        setContent(newContent);
      }
      
      // テキストボックスの内容を更新
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
      // サイズ制限を削除
      const newWidth = startWidth + (moveEvent.clientX - startX);
      const newHeight = startHeight + (moveEvent.clientY - startY);
      
      // ステートを更新
      setDimensions({
        width: newWidth,
        height: newHeight,
      });
      
      // DOM要素のスタイルも直接更新
      if (element) {
        element.style.width = `${newWidth}px`;
        // 数値か文字列かをチェックして適切に扱う
        if (typeof newHeight === 'number') {
          element.style.height = `${newHeight}px`;
        } else {
          element.style.height = 'auto';
        }
      }
    };
    
    const handleMouseUp = () => {
      setResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (element) {
        // DOM要素から直接サイズを取得（より正確）
        const currentWidth = parseInt(element.style.width) || dimensions.width;
        // height値を適切に処理
        let finalHeight: number | null = null;
        
        if (element.style.height !== 'auto') {
          const parsedHeight = parseInt(element.style.height);
          finalHeight = !isNaN(parsedHeight) ? parsedHeight : 
            (typeof dimensions.height === 'number' ? dimensions.height : null);
        }
        
        console.log('リサイズ後のサイズ:', { width: currentWidth, height: finalHeight });
        
        // 新しいサイズをステートに反映
        setDimensions({
          width: currentWidth,
          height: finalHeight === null ? 'auto' : finalHeight,
        });
        
        // サイズを更新してサーバーに保存
        updateTextBox(box.id, { 
          width: currentWidth,
          height: finalHeight,
        });
      }
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
  
  // ゾーン名を日本語に変換
  const getZoneLabel = (zone: string): string => {
    switch (zone) {
      // SWOT
      case 'strengths': return 'S: 強み';
      case 'weaknesses': return 'W: 弱み';
      case 'opportunities': return 'O: 機会';
      case 'threats': return 'T: 脅威';
      
      // 4P
      case 'product': return '製品';
      case 'price': return '価格';
      case 'place': return '流通';
      case 'promotion': return '販促';
      
      // 3C
      case 'company': return '自社';
      case 'customer': return '顧客';
      case 'competitor': return '競合';
      
      // PEST
      case 'political': return '政治';
      case 'economic': return '経済';
      case 'social': return '社会';
      case 'technological': return '技術';
      
      default: return zone;
    }
  };

  // Custom drag handler implementation
  useEffect(() => {
    const element = dragRef.current;
    if (!element) return;
    
    const handleMouseDown = (e: MouseEvent) => {
      // Prevent drag when clicking on resize handle or dropdown menu
      const target = e.target as HTMLElement;
      if (
        target.closest(".resize-handle") || 
        target.closest(".menu-trigger") ||
        editing
      ) {
        return;
      }
      
      e.preventDefault();
      setIsDragging(true);
      
      const startX = e.clientX;
      const startY = e.clientY;
      const startPosX = position.x;
      const startPosY = position.y;
      
      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        
        const newX = startPosX + dx;
        const newY = startPosY + dy;
        
        setPosition({ x: newX, y: newY });
        // リアルタイムでスタイルを更新
        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;
      };
      
      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // 現在の位置を取得（DOM要素から直接取得してより正確に）
        const currentX = parseInt(element.style.left) || position.x;
        const currentY = parseInt(element.style.top) || position.y;
        
        // 位置を更新してサーバーに保存（直近の正確な値を使用）
        updateTextBox(box.id, { 
          x: currentX,
          y: currentY
        });
        
        // ローカルステートも同期
        setPosition({ x: currentX, y: currentY });
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
    
    // TouchEvent handlers for mobile
    const handleTouchStart = (e: TouchEvent) => {
      // Prevent drag when touching resize handle or dropdown menu
      const target = e.target as HTMLElement;
      if (
        target.closest(".resize-handle") || 
        target.closest(".menu-trigger") ||
        editing
      ) {
        return;
      }
      
      const touch = e.touches[0];
      const startX = touch.clientX;
      const startY = touch.clientY;
      const startPosX = position.x;
      const startPosY = position.y;
      
      setIsDragging(true);
      
      const handleTouchMove = (moveEvent: TouchEvent) => {
        moveEvent.preventDefault(); // Prevent scrolling while dragging
        const touch = moveEvent.touches[0];
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        
        const newX = startPosX + dx;
        const newY = startPosY + dy;
        
        setPosition({ x: newX, y: newY });
        // リアルタイムでスタイルを更新
        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;
      };
      
      const handleTouchEnd = () => {
        setIsDragging(false);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        
        // 現在の位置を取得（DOM要素から直接取得してより正確に）
        const currentX = parseInt(element.style.left) || position.x;
        const currentY = parseInt(element.style.top) || position.y;
        
        // 位置を更新してサーバーに保存（直近の正確な値を使用）
        updateTextBox(box.id, { 
          x: currentX,
          y: currentY
        });
        
        // ローカルステートも同期
        setPosition({ x: currentX, y: currentY });
      };
      
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    };
    
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('touchstart', handleTouchStart);
    
    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('touchstart', handleTouchStart);
    };
  }, [box.id, editing, position, updateTextBox]);
  
  // Update local state when box positions changes
  useEffect(() => {
    setPosition({ x: box.x, y: box.y });
  }, [box.x, box.y]);
  
  // Update local content when box.content changes
  useEffect(() => {
    setContent(box.content);
  }, [box.content]);

  // Handle keyboard events for delete actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 編集モード中は何もしない（通常のテキスト編集として扱う）
      if (editing) return;
      
      // Deleteキーが押された場合のみ処理（Backspaceキーは除外）
      if (e.key === 'Delete') {
        // テキストボックスが明示的に選択された状態でのみ削除を許可する
        // 実装方法: テキストボックス自体またはその子要素がフォーカスされているかチェック
        const active = document.activeElement;
        if (!active) return;
        
        const textBoxElement = document.querySelector(`[data-id="${box.id}"]`);
        if (textBoxElement && (textBoxElement === active || textBoxElement.contains(active))) {
          // 削除前に確認ダイアログを表示
          if (window.confirm('このテキストボックスを削除しますか？')) {
            handleDelete();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editing, box.id, deleteTextBox]);

  // Dynamically determine background color based on box.color or zone
  const getBgColorClass = () => {
    // ゾーンプロパティが存在する場合、それに基づいて色を決定
    if (box.zone) {
      switch (box.zone) {
        // SWOT
        case 'strengths': return 'bg-blue-100 border-blue-200';
        case 'weaknesses': return 'bg-red-100 border-red-200';
        case 'opportunities': return 'bg-green-100 border-green-200';
        case 'threats': return 'bg-yellow-100 border-yellow-200';
        
        // 4P
        case 'product': return 'bg-indigo-100 border-indigo-200';
        case 'price': return 'bg-purple-100 border-purple-200';
        case 'place': return 'bg-pink-100 border-pink-200';
        case 'promotion': return 'bg-teal-100 border-teal-200';
        
        // 3C
        case 'company': return 'bg-blue-100 border-blue-200';
        case 'customer': return 'bg-green-100 border-green-200';
        case 'competitor': return 'bg-yellow-100 border-yellow-200';
        
        // PEST
        case 'political': return 'bg-purple-100 border-purple-200';
        case 'economic': return 'bg-blue-100 border-blue-200';
        case 'social': return 'bg-green-100 border-green-200';
        case 'technological': return 'bg-teal-100 border-teal-200';
      }
    }
    
    // ゾーンがない場合、または一致しない場合はbox.colorを使用
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
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${dimensions.width}px`,
        height: dimensions.height === 'auto' ? 'auto' : `${dimensions.height}px`,
        zIndex: isDragging ? 1000 : 1
      }}
      onDoubleClick={handleDoubleClick}
    >
      <div className="relative">
        {box.zone && (
          <div className="absolute -top-2 -left-2 text-xs font-medium px-2 py-0.5 rounded-full bg-white shadow-sm border">
            {getZoneLabel(box.zone)}
          </div>
        )}
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
      </div>

      {/* Resize handle */}
      <div
        className="resize-handle absolute bottom-0 right-0 w-6 h-6 cursor-se-resize opacity-50 md:opacity-0 group-hover:opacity-100 hover:opacity-100 touch-manipulation"
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
            // タッチイベントでもサイズ制限を削除
            const newWidth = startWidth + (touch.clientX - startX);
            const newHeight = startHeight + (touch.clientY - startY);
            
            setDimensions({
              width: newWidth,
              height: newHeight,
            });
          };
          
          const handleTouchEnd = () => {
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
            
            // 最新のサイズを取得
            const currentWidth = dimensions.width;
            const currentHeight = dimensions.height === 'auto' ? null : dimensions.height as number;
            
            // サイズを更新してサーバーに保存
            updateTextBox(box.id, { 
              width: currentWidth,
              height: currentHeight,
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
      <div className="menu-trigger absolute top-1 right-1 opacity-50 md:opacity-0 hover:opacity-100 group-hover:opacity-100">
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
