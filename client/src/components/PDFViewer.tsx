import { useEffect, useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { useAnalysisContext } from "@/context/AnalysisContext";
import { Button } from "@/components/ui/button";
import { FileUp, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";

// Import PDF.js
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

// PDF.jsの設定 - フェイクワーカーを明示的に使うことで、
// ワーカー読み込み失敗エラーを回避する
try {
  // この設定により、ワーカーなしでもPDFを表示できるようになる
  (pdfjsLib as any).GlobalWorkerOptions.disableWorker = true;
} catch (err) {
  console.warn('PDF.js worker config error:', err);
}

const PDFViewer: React.FC = () => {
  const { pdfFile, setPdfFile } = useAnalysisContext();
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [selectedText, setSelectedText] = useState("");
  const [textSelections, setTextSelections] = useState<Array<{ text: string, rect: DOMRect }>>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // エラー状態追加
  const [loadError, setLoadError] = useState<string | null>(null);

  // Handle PDF loading
  useEffect(() => {
    if (!pdfFile) return;
    
    // エラー状態をリセット
    setLoadError(null);
    
    const loadPdf = async () => {
      try {
        // 明示的にワーカーなしモード設定
        try {
          (pdfjsLib as any).GlobalWorkerOptions.disableWorker = true;
        } catch (e) {
          console.warn('PDF.js worker config error:', e);
        }
        
        // ファイルの読み込み試行
        console.log("PDFファイルの読み込みを開始:", pdfFile.name);
        
        // ファイルをArrayBufferに変換
        let arrayBuffer;
        try {
          arrayBuffer = await pdfFile.arrayBuffer();
          console.log("PDFファイルをArrayBufferに変換しました:", arrayBuffer.byteLength, "bytes");
        } catch (err) {
          const error = err as Error;
          console.error("ファイルの読み込みエラー:", error);
          setLoadError(`ファイルの読み込み中にエラーが発生しました: ${error.message || 'ファイルが壊れているか、アクセスできません'}`);
          return;
        }
        
        // PDFとして解析を試行
        try {
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          console.log("PDFの解析に成功:", pdf.numPages, "ページ");
          
          setPdfDocument(pdf);
          setTotalPages(pdf.numPages);
          setCurrentPage(1);
          
          // 最初のページをレンダリング
          renderPage(1, pdf);
        } catch (err) {
          const error = err as Error;
          console.error("PDFの解析エラー:", error);
          setLoadError(`PDFとして解析できませんでした: ${error.message || '無効なPDFファイルです'}`);
          return;
        }
      } catch (err) {
        const error = err as Error;
        console.error("PDF処理中の予期しないエラー:", error);
        setLoadError(`予期しないエラーが発生しました: ${error.message || 'PDFの読み込みに失敗しました'}`);
      }
    };
    
    loadPdf();
  }, [pdfFile]);
  
  // Render PDF page
  const renderPage = async (pageNumber: number, doc: PDFDocumentProxy = pdfDocument!) => {
    if (!doc) return;
    
    try {
      const page = await doc.getPage(pageNumber);
      const canvas = canvasRef.current;
      
      if (canvas) {
        const viewport = page.getViewport({ scale: zoom });
        
        // Adjust canvas size to match the page size
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render the page content on the canvas
        const renderContext = {
          canvasContext: canvas.getContext('2d')!,
          viewport,
        };
        
        await page.render(renderContext).promise;
        
        // Enable text layer for selection
        renderTextLayer(page, viewport);
      }
    } catch (error) {
      console.error("Error rendering page:", error);
    }
  };
  
  // Render text layer for text selection
  const renderTextLayer = async (page: PDFPageProxy, viewport: any) => {
    try {
      const textContent = await page.getTextContent();
      const container = containerRef.current;
      
      if (!container) return;
      
      // Clear existing text layer
      const textLayer = container.querySelector('.textLayer');
      if (textLayer) {
        textLayer.remove();
      }
      
      // Create new text layer
      const newTextLayer = document.createElement('div');
      newTextLayer.className = 'textLayer';
      newTextLayer.style.width = `${viewport.width}px`;
      newTextLayer.style.height = `${viewport.height}px`;
      container.appendChild(newTextLayer);
      
      // Position the text items
      textContent.items.forEach((item: any) => {
        const tx = pdfjsLib.Util.transform(
          viewport.transform,
          item.transform
        );
        
        const style = {
          left: `${tx[4]}px`,
          top: `${tx[5]}px`,
          fontSize: `${tx[0]}px`,
          transform: `scaleX(${item.width / (item.str.length * tx[0])})`
        };
        
        const textSpan = document.createElement('span');
        textSpan.textContent = item.str;
        textSpan.style.left = style.left;
        textSpan.style.top = style.top;
        textSpan.style.fontSize = style.fontSize;
        textSpan.style.transform = style.transform;
        textSpan.className = 'pdf-text';
        textSpan.dataset.text = item.str;
        
        newTextLayer.appendChild(textSpan);
      });
      
      // Add event listener for text selection
      newTextLayer.addEventListener('mouseup', handleTextSelection);
    } catch (error) {
      console.error("Error rendering text layer:", error);
    }
  };
  
  // Handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== '') {
      const selectionText = selection.toString();
      setSelectedText(selectionText);
      
      // Get the bounding rectangle of the selection
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Add selection to the list
        setTextSelections(prev => [
          ...prev,
          { text: selectionText, rect }
        ]);
        
        // Provide visual indication of selection
        if (containerRef.current) {
          const container = containerRef.current;
          
          // 既存のインジケーターをクリア
          const existingIndicators = container.querySelectorAll('.text-selection-indicator');
          existingIndicators.forEach(indicator => {
            if (indicator.parentNode) {
              indicator.parentNode.removeChild(indicator);
            }
          });
          
          // 新しいインジケーターを作成
          const indicator = document.createElement('div');
          indicator.className = 'text-selection-indicator';
          indicator.dataset.text = selectionText;
          
          // コンテナ内の相対位置を計算
          const containerRect = container.getBoundingClientRect();
          indicator.style.position = 'absolute';
          indicator.style.left = `${rect.left - containerRect.left}px`;
          indicator.style.top = `${rect.top - containerRect.top}px`;
          indicator.style.width = `${rect.width}px`;
          indicator.style.height = `${rect.height}px`;
          
          // インジケーターを追加
          container.appendChild(indicator);
          
          // ドラッグ操作のフィードバックを表示
          const feedback = document.createElement('div');
          feedback.textContent = '👆 ドラッグして分析エリアに追加';
          feedback.className = 'drag-feedback';
          feedback.style.position = 'absolute';
          feedback.style.left = `${rect.left - containerRect.left}px`;
          feedback.style.top = `${rect.top - containerRect.top - 30}px`;
          feedback.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
          feedback.style.color = 'white';
          feedback.style.padding = '4px 8px';
          feedback.style.borderRadius = '4px';
          feedback.style.fontSize = '12px';
          feedback.style.pointerEvents = 'none';
          feedback.style.zIndex = '10';
          container.appendChild(feedback);
          
          // 一定時間後に自動的に削除
          setTimeout(() => {
            if (indicator.parentNode) {
              indicator.parentNode.removeChild(indicator);
            }
            if (feedback.parentNode) {
              feedback.parentNode.removeChild(feedback);
            }
          }, 3000);
        }
      }
    }
  };
  
  // Text drag functionality
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TEXT_SELECTION',
    item: () => ({
      text: selectedText,
      clientOffset: { x: 0, y: 0 }
    }),
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (clientOffset && item) {
        item.clientOffset = clientOffset;
      }
    }
  }), [selectedText]);
  
  // Navigation functions
  const prevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      renderPage(newPage);
    }
  };
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      renderPage(newPage);
    }
  };
  
  // Zoom functions
  const zoomIn = () => {
    const newZoom = Math.min(zoom + 0.1, 2.0);
    setZoom(newZoom);
    renderPage(currentPage);
  };
  
  const zoomOut = () => {
    const newZoom = Math.max(zoom - 0.1, 0.5);
    setZoom(newZoom);
    renderPage(currentPage);
  };
  
  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    // エラーをリセット
    setLoadError(null);
    
    if (!file) {
      return;
    }
    
    // ファイルタイプのチェック
    if (file.type !== "application/pdf") {
      setLoadError("PDFファイルのみアップロードできます。選択したファイルは " + 
        (file.type || "不明なタイプ") + " です。");
      return;
    }
    
    // ファイルサイズのチェック（20MB以上は警告）
    if (file.size > 20 * 1024 * 1024) {
      console.warn("大きなPDFファイル（" + Math.round(file.size / (1024 * 1024)) + 
        "MB）がアップロードされました。処理に時間がかかる場合があります。");
    }
    
    // 有効なPDFファイルがアップロードされた場合
    console.log("PDFファイルがアップロードされました:", file.name, file.size, "bytes");
    setPdfFile(file);
  };

  return (
    <section className="md:w-1/2 w-full md:h-full h-screen bg-white overflow-hidden flex flex-col">
      {/* PDF empty state - shown when no PDF is loaded */}
      {!pdfFile && (
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
              className="h-12 w-12 text-secondary-dark"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h2 className="text-xl font-medium mb-2">PDFが読み込まれていません</h2>
          <p className="text-center max-w-md mb-4">PDFをアップロードして、テキストを分析エリアに追加してください。</p>
          <Button
            className="bg-primary hover:bg-primary-light text-white"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp className="mr-2 h-5 w-5" />
            PDFをアップロード
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      )}

      {/* Error state - shown when PDF loading fails */}
      {pdfFile && loadError && (
        <div className="h-full flex flex-col items-center justify-center text-secondary-dark">
          <div className="flex items-center justify-center bg-red-100 rounded-full w-24 h-24 mb-6">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-12 w-12 text-red-500"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h2 className="text-xl font-medium mb-2">PDFの読み込みエラー</h2>
          <p className="text-center max-w-md mb-4">{loadError}</p>
          <Button
            className="bg-primary hover:bg-primary-light text-white"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp className="mr-2 h-5 w-5" />
            別のPDFを試す
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      )}

      {/* PDF content - shown when PDF is loaded successfully */}
      {pdfFile && !loadError && (
        <div className="flex-grow flex flex-col">
          {/* PDF toolbar */}
          <div className="flex items-center justify-between bg-secondary-light border-b border-secondary p-2">
            <div className="flex items-center space-x-2">
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={prevPage}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <span>{currentPage}</span> / <span>{totalPages}</span>
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={nextPage}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="icon" variant="ghost" onClick={zoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span>{Math.round(zoom * 100)}%</span>
              <Button size="icon" variant="ghost" onClick={zoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* PDF document container */}
          <div 
            ref={containerRef}
            className="flex-grow overflow-auto bg-secondary-light p-4 flex justify-center relative"
          >
            <canvas 
              ref={canvasRef} 
              className="shadow-md"
            />
            
            {/* Selection overlay for dragging */}
            {selectedText && (
              <div 
                ref={drag} 
                className={`absolute cursor-move bg-primary bg-opacity-20 ${
                  isDragging ? 'opacity-50' : ''
                }`}
                style={{
                  position: 'absolute',
                  pointerEvents: 'none',
                  opacity: 0, // Hide from view but still draggable
                }}
              >
                {selectedText}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default PDFViewer;
