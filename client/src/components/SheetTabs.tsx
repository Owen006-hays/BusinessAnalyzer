import React, { useState } from "react";
import { useAnalysisContext } from "@/context/AnalysisContext";
import { Button } from "@/components/ui/button";
import { PlusCircle, X, Pencil, Check } from "lucide-react";
import { Sheet } from "@shared/schema";

const SheetTabs: React.FC = () => {
  const { 
    sheets, 
    currentSheetId, 
    setCurrentSheetId, 
    addSheet, 
    updateSheet, 
    deleteSheet 
  } = useAnalysisContext();
  
  const [editingSheetId, setEditingSheetId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  
  // シートタブをクリックしたときの処理
  const handleTabClick = (sheetId: number) => {
    setCurrentSheetId(sheetId);
  };
  
  // 新しいシートを追加
  const handleAddSheet = () => {
    const newName = `Sheet ${sheets.length + 1}`;
    addSheet(newName);
  };
  
  // シート名の編集を開始
  const handleEditStart = (sheet: Sheet) => {
    setEditingSheetId(sheet.id);
    setEditingName(sheet.name);
  };
  
  // シート名の編集を確定
  const handleEditComplete = (sheet: Sheet) => {
    if (editingName.trim() !== "") {
      updateSheet(sheet.id, { name: editingName });
    }
    setEditingSheetId(null);
  };
  
  // シート名の編集をキャンセル
  const handleEditCancel = () => {
    setEditingSheetId(null);
  };
  
  // シート名の入力処理
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
  };
  
  // シートの削除
  const handleDeleteSheet = (sheetId: number) => {
    if (window.confirm("シートを削除しますか？このシートのすべてのテキストボックスも削除されます。")) {
      deleteSheet(sheetId);
    }
  };
  
  // キーボード入力処理
  const handleKeyDown = (e: React.KeyboardEvent, sheet: Sheet) => {
    if (e.key === "Enter") {
      handleEditComplete(sheet);
    } else if (e.key === "Escape") {
      handleEditCancel();
    }
  };
  
  return (
    <div className="flex items-center border-b border-gray-200 overflow-x-auto bg-gray-100">
      {sheets.map((sheet) => (
        <div 
          key={sheet.id} 
          className={`flex items-center px-4 py-2 relative cursor-pointer border-r border-gray-200 
            ${currentSheetId === sheet.id 
              ? 'bg-gray-200 border-b-2 border-b-blue-500 font-medium shadow-sm' 
              : 'bg-white hover:bg-gray-50 border-b border-b-transparent'}`}
          onClick={() => handleTabClick(sheet.id)}
        >
          {editingSheetId === sheet.id ? (
            <div className="flex items-center">
              <input
                type="text"
                value={editingName}
                onChange={handleNameChange}
                onKeyDown={(e) => handleKeyDown(e, sheet)}
                className="px-1 py-0.5 border border-blue-400 rounded focus:outline-none"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditComplete(sheet);
                }}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <span className="mr-2">{sheet.name}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditStart(sheet);
                }}
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Pencil size={14} />
              </button>
              {sheets.length > 1 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSheet(sheet.id);
                  }}
                  className="ml-1 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      ))}
      
      <Button
        variant="ghost"
        size="sm"
        className="ml-2 text-gray-600 hover:text-blue-600 bg-white hover:bg-gray-50 shadow-sm"
        onClick={handleAddSheet}
      >
        <PlusCircle size={16} className="mr-1" />
        <span>新規シート</span>
      </Button>
    </div>
  );
};

export default SheetTabs;