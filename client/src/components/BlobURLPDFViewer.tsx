import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, Copy, ListFilter } from "lucide-react";
import ZoneSelector from "./ZoneSelector";
import PasswordPromptDialog from "./PasswordPromptDialog";
import SimplePDFViewer from "./SimplePDFViewer";
import SimpleImageViewer from "./SimpleImageViewer";
import { useAnalysisContext } from "@/context/AnalysisContext";

interface BlobURLPDFViewerProps {
  pdfFile: File | null;
  setPdfFile: (file: File | null) => void;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  addTextBox?: (content: string, x: number, y: number) => void;
  currentTemplate: string | null;
  setCurrentTemplate: (template: string | null) => void;
}

const BlobURLPDFViewer: React.FC<BlobURLPDFViewerProps> = ({
  pdfFile,
  setPdfFile,
  imageFile,
  setImageFile,
  addTextBox,
  currentTemplate,
  setCurrentTemplate,
}) => {
  // 状態管理
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEncrypted, setIsEncrypted] = useState<boolean>(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  // テキスト選択関連
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [showCopyButton, setShowCopyButton] = useState<boolean>(false);
  const [showZoneSelector, setShowZoneSelector] = useState<boolean>(false);
  const [copyPosition, setCopyPosition] = useState({ x: 0, y: 0 });
  
  // refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  
  // ファイルアップロードハンドラー - シンプル実装
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      console.log("ファイルを処理します:", file.name, file.type);
      
      // 状態をリセット
      setErrorMessage(null);
      setIsEncrypted(false);
      setShowPasswordPrompt(false);
      
      // ファイルの拡張子を取得
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      
      // PDFファイルの場合
      if (fileExt === 'pdf' || file.type === 'application/pdf') {
        setPdfFile(file);
        setImageFile(null);
      } 
      // 画像ファイルの場合
      else if (
        file.type.startsWith('image/') || 
        ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'tiff'].includes(fileExt || '')
      ) {
        setImageFile(file);
        setPdfFile(null);
      }
      // 不明なファイル形式の場合
      else {
        setErrorMessage(`サポートされていないファイル形式です (${file.type || '不明'}, 拡張子: ${fileExt || '不明'}). PDFまたは画像ファイルをアップロードしてください。`);
      }
    } catch (error) {
      console.error("ファイル処理エラー:", error);
      setErrorMessage("ファイルの処理中にエラーが発生しました。別のファイルをお試しください。");
    }
    
    // input要素をリセット (同じファイルを再選択できるように)
    e.target.value = '';
  };
  
  // テキスト選択の検出
  useEffect(() => {
    const checkSelection = () => {
      if (showZoneSelector) return;
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
        const isMenuActive = document.querySelector('.zone-selector-wrapper');
        if (!isMenuActive) {
          setSelectedText(null);
          setShowCopyButton(false);
        }
        return;
      }
      
      const range = selection.getRangeAt(0);
      const text = selection.toString().trim();
      
      if (text && viewerRef.current) {
        const viewerRect = viewerRef.current.getBoundingClientRect();
        const rangeRect = range.getBoundingClientRect();
        
        // ビューア内での選択かを確認
        const isInsideViewer = (
          rangeRect.top >= viewerRect.top &&
          rangeRect.bottom <= viewerRect.bottom &&
          rangeRect.left >= viewerRect.left &&
          rangeRect.right <= viewerRect.right
        );
        
        if (isInsideViewer) {
          setCopyPosition({
            x: rangeRect.right - viewerRect.left,
            y: rangeRect.top - viewerRect.top
          });
          
          setSelectedText(text);
          setShowCopyButton(true);
        }
      }
    };
    
    document.addEventListener('selectionchange', checkSelection);
    document.addEventListener('mouseup', checkSelection);
    
    return () => {
      document.removeEventListener('selectionchange', checkSelection);
      document.removeEventListener('mouseup', checkSelection);
    };
  }, [showZoneSelector]);
  
  // 選択したテキストをキャンバスに追加
  const handleCopyToCanvas = () => {
    if (selectedText && addTextBox) {
      addTextBox(selectedText, 50, 100);
      setShowCopyButton(false);
      setSelectedText(null);
      window.getSelection()?.removeAllRanges();
    }
  };
  
  // ゾーンセレクターを表示
  const handleShowZoneSelector = () => {
    if (selectedText) {
      setShowCopyButton(false);
      setShowZoneSelector(true);
      
      // テンプレートが選択されていない場合は、デフォルトでSWOTを設定
      if (!currentTemplate) {
        setCurrentTemplate("swot");
      }
    }
  };
  
  // ゾーンセレクターを閉じる
  const handleCloseZoneSelector = () => {
    setShowZoneSelector(false);
    window.getSelection()?.removeAllRanges();
    setSelectedText(null);
  };

  return (
    <section className="w-full h-full bg-white overflow-hidden flex flex-col" ref={viewerRef}>
      {/* パスワード入力ダイアログ */}
      <PasswordPromptDialog 
        isOpen={showPasswordPrompt}
        onSubmit={(password) => {
          // 単純化: パスワード処理は現時点では実装せず、ダイアログを閉じるだけ
          setShowPasswordPrompt(false);
          setPasswordError(null);
        }}
        onCancel={() => {
          setPdfFile(null);
          setShowPasswordPrompt(false);
          setIsEncrypted(false);
        }}
        error={passwordError}
      />
      
      {/* コピーボタン - テキスト選択時のみ表示 */}
      {showCopyButton && selectedText && (
        <div
          className="absolute z-20 flex space-x-2"
          style={{
            top: `${Math.max(copyPosition.y - 40, 10)}px`,
            left: `${Math.min(copyPosition.x - 60, viewerRef.current?.clientWidth || window.innerWidth - 240)}px`,
          }}
        >
          <Button
            size="sm"
            className="bg-primary text-white hover:bg-primary-light"
            onClick={handleCopyToCanvas}
          >
            <Copy className="mr-1 h-4 w-4" />
            キャンバスに追加
          </Button>
          <Button
            size="sm"
            className="bg-green-600 text-white hover:bg-green-700"
            onClick={handleShowZoneSelector}
          >
            <ListFilter className="mr-1 h-4 w-4" />
            エリアを選択
          </Button>
        </div>
      )}
      
      {/* ゾーンセレクター */}
      {showZoneSelector && selectedText && (
        <div
          className="zone-selector-container absolute z-30"
          style={{
            top: `${Math.max(copyPosition.y, 10)}px`,
            left: `${Math.min(copyPosition.x - 150, viewerRef.current?.clientWidth || window.innerWidth - 320)}px`,
          }}
        >
          <ZoneSelector 
            text={selectedText} 
            onClose={handleCloseZoneSelector} 
          />
        </div>
      )}
      
      {/* 初期状態 - ファイル未選択時 */}
      {!pdfFile && !imageFile && !errorMessage && (
        <div className="h-full flex flex-col items-center justify-center text-secondary-dark">
          <div className="flex items-center justify-center bg-secondary-light rounded-full w-24 h-24 mb-6">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-12 h-12"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-3">PDFをアップロードして分析を始めましょう</h2>
          <p className="text-center text-secondary-dark mb-6 max-w-sm px-4">
            PDFファイルや画像をアップロードして、テキストを抽出し、分析に活用しましょう。
          </p>
          <Button
            variant="default"
            size="sm"
            className="bg-primary hover:bg-primary-light text-white"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp className="mr-2 h-5 w-5" />
            ファイルを選択
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      )}
      
      {/* エラー表示 */}
      {errorMessage && (
        <div className="h-full flex flex-col items-center justify-center text-red-500 p-6">
          <div className="bg-red-50 rounded-full w-24 h-24 flex items-center justify-center mb-6">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-12 w-12"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-3 text-red-700">ファイルの読み込みエラー</h2>
          <p className="text-center mb-6 text-gray-700">{errorMessage}</p>
          <Button
            variant="default"
            className="bg-primary hover:bg-primary-light text-white"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp className="mr-2 h-5 w-5" />
            別のファイルを試す
          </Button>
        </div>
      )}
      
      {/* PDFビューア (SimplePDFViewerコンポーネントを使用) */}
      {pdfFile && (
        <SimplePDFViewer 
          file={pdfFile} 
          onChangeFile={() => fileInputRef.current?.click()}
        />
      )}
      
      {/* 画像ビューア (SimpleImageViewerコンポーネントを使用) */}
      {imageFile && (
        <SimpleImageViewer
          file={imageFile}
          onChangeFile={() => fileInputRef.current?.click()}
        />
      )}
    </section>
  );
};

export default BlobURLPDFViewer;