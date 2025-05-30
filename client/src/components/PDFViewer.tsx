import React, { useState, useEffect, useRef } from "react";
import { useDrag } from "react-dnd";
import { useAnalysisContext } from "@/context/AnalysisContext";
import { Button } from "@/components/ui/button";
import { FileUp, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";

// Import PDF.js correctly
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

// PDF.jsの設定 - HTMLで設定されたCDNワーカーを使用
(function verifyPdfJs() {
  try {
    console.log('PDF.js設定確認...');
    
    // PDFJSのバージョン確認
    if ((pdfjsLib as any).version) {
      console.log('PDF.jsバージョン:', (pdfjsLib as any).version);
    }
    
    // HTML側で設定されたワーカーの確認
    if ((window as any).pdfjsLib && (window as any).pdfjsLib.GlobalWorkerOptions) {
      const workerSrc = (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc;
      console.log('HTML側で設定されたワーカーパス:', workerSrc || 'なし');
      
      // HTML側で設定されていなければCDNを設定
      if (!workerSrc) {
        const pdfVersion = '3.11.174'; // 最新の安定バージョン
        const workerUrl = `https://unpkg.com/pdfjs-dist@${pdfVersion}/build/pdf.worker.min.js`;
        console.log('ワーカーパスを設定します:', workerUrl);
        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
      }
    }
    
    console.log('PDF.js設定確認完了');
  } catch (error) {
    console.error('PDF.js設定確認エラー:', error);
  }
})();

const PDFViewer: React.FC = () => {
  const { pdfFile, setPdfFile, imageFile, setImageFile } = useAnalysisContext();
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
  
  // 画像表示用state
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Handle image loading with better error handling
  useEffect(() => {
    if (!imageFile) {
      setImageUrl(null);
      return;
    }
    
    // エラー状態をリセット
    setLoadError(null);
    
    // 画像の読み込みとバリデーション
    const loadImage = async () => {
      try {
        // 画像ファイルのバリデーション
        if (!imageFile.type.startsWith('image/')) {
          console.warn("サポートされていない画像形式:", imageFile.type);
          setLoadError('サポートされていない画像フォーマットです。JPEG、PNG、GIFをお試しください。');
          return;
        }
        
        // サポートしている画像形式かチェック
        const supportedFormats = ['image/jpeg', 'image/png', 'image/gif'];
        if (!supportedFormats.includes(imageFile.type)) {
          console.warn("サポートされていない画像フォーマット:", imageFile.type);
          setLoadError(`サポートされていない画像フォーマットです (${imageFile.type}). JPEG、PNG、GIFをお試しください。`);
          return;
        }
        
        console.log("画像ファイルを処理中:", imageFile.name, imageFile.size, "bytes");
        
        // 大きすぎる画像の警告（10MB以上）
        if (imageFile.size > 10 * 1024 * 1024) {
          console.warn("大きな画像ファイル:", Math.round(imageFile.size / (1024 * 1024)), "MB");
        }
        
        // 画像URLを作成
        const url = URL.createObjectURL(imageFile);
        console.log("画像URLを作成しました:", url);
        
        // 画像の読み込みをテスト
        const img = new Image();
        
        // 画像の読み込みを確認するPromise
        const loadPromise = new Promise<boolean>((resolve, reject) => {
          img.onload = () => {
            console.log("画像の読み込みに成功しました", img.width, "x", img.height);
            resolve(true);
          };
          
          img.onerror = (err) => {
            console.error("画像の読み込みに失敗:", err);
            reject(new Error(`画像の読み込みに失敗しました: ${imageFile.name}`));
          };
          
          // タイムアウト処理を追加（5秒後）
          setTimeout(() => {
            reject(new Error("画像の読み込みがタイムアウトしました"));
          }, 5000);
          
          // 画像のソースを設定
          img.src = url;
        });
        
        // 画像のロードを待つ
        await loadPromise;
        console.log("画像の処理に成功:", imageFile.name);
        
        // URLをステートに設定
        setImageUrl(url);
        
        // クリーンアップ処理
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.error("画像ファイル処理エラー:", err);
        setLoadError('画像ファイルの処理に失敗しました。別の画像をお試しください。');
        
        // エラーが発生した場合、画像URLをクリア
        if (imageUrl) {
          URL.revokeObjectURL(imageUrl);
          setImageUrl(null);
        }
      }
    };
    
    loadImage();
  }, [imageFile]);
  
  // Handle PDF loading
  useEffect(() => {
    if (!pdfFile) return;
    
    // 画像URLをクリア
    setImageUrl(null);
    
    // エラー状態をリセット
    setLoadError(null);
    
    const loadPdf = async () => {
      try {
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
          console.log("PDF読み込みタスク開始");
          
          // 最もシンプルな方法でPDFドキュメントを読み込む
          // @ts-ignore - ArrayBufferを直接渡す方法（TypeScriptの制約を回避）
          const loadingTask = pdfjsLib.getDocument(arrayBuffer);
          
          console.log("PDFドキュメント読み込み中...");
          
          // タイムアウト処理を追加
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("PDF読み込みタイムアウト")), 10000);
          });
          
          // 読み込みタスクとタイムアウトを競合させる
          const pdf = await Promise.race([
            loadingTask.promise,
            timeoutPromise
          ]) as PDFDocumentProxy;
          
          console.log("PDFの解析に成功:", pdf.numPages, "ページ");
          
          setPdfDocument(pdf);
          setTotalPages(pdf.numPages);
          setCurrentPage(1);
          
          // 最初のページをレンダリング
          renderPage(1, pdf);
        } catch (err) {
          // エラーの詳細なログ
          console.error("PDFの解析エラー:", err);
          
          // エラーの詳細な診断
          let errorType = "不明なエラー";
          let errorMsg = '無効なPDFファイルです';
          
          if (err instanceof Error) {
            errorMsg = err.message || errorMsg;
            
            // エラーの種類を判定して適切なメッセージを表示
            if (errorMsg.includes("password")) {
              errorType = "パスワード保護されたPDF";
              errorMsg = "このPDFはパスワードで保護されています。パスワードなしのPDFをアップロードしてください。";
            } else if (errorMsg.includes("corrupt") || errorMsg.includes("invalid") || errorMsg.includes("unexpected")) {
              errorType = "破損したPDF";
              errorMsg = "PDFファイルが破損しているか、サポートされていない形式です。別のPDFをお試しください。";
            } else if (errorMsg.includes("not well-formed")) {
              errorType = "無効なフォーマット";
              errorMsg = "PDFの形式が正しくありません。標準的なPDFファイルをお試しください。";
            }
          } else if (typeof err === 'object' && err !== null) {
            try {
              errorMsg = err.toString ? err.toString() : JSON.stringify(err);
            } catch (jsonErr) {
              errorMsg = "エラー情報を取得できませんでした";
            }
          }
          
          console.warn(`PDF解析エラー(${errorType}): ${errorMsg}`);
          setLoadError(`PDFを読み込めませんでした: ${errorMsg}`);
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
  
  // シンプルなテキストレイヤーのレンダリング
  const renderTextLayer = async (page: PDFPageProxy, viewport: any) => {
    try {
      // テキストコンテンツを取得
      const textContent = await page.getTextContent();
      const container = containerRef.current;
      
      if (!container) return;
      
      // 既存のテキストレイヤーをクリア
      const existingLayer = container.querySelector('.textLayer');
      if (existingLayer) {
        existingLayer.remove();
      }
      
      // テキストの選択と表示のためのシンプルなラベルを作成
      const textSummary = document.createElement('div');
      textSummary.className = 'text-selection-help';
      textSummary.style.position = 'absolute';
      textSummary.style.top = '10px';
      textSummary.style.left = '10px';
      textSummary.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      textSummary.style.color = 'white';
      textSummary.style.padding = '8px 12px';
      textSummary.style.borderRadius = '4px';
      textSummary.style.fontSize = '14px';
      textSummary.style.zIndex = '20';
      textSummary.textContent = 'CanvasベースのPDF表示: テキスト選択機能はブラウザネイティブの選択を使用します';
      
      // 3秒後に非表示
      setTimeout(() => {
        if (textSummary.parentNode) {
          textSummary.parentNode.removeChild(textSummary);
        }
      }, 3000);
      
      container.appendChild(textSummary);
      
      // テキスト選択のためのイベントリスナーを追加
      container.addEventListener('mouseup', handleTextSelection);
    } catch (error) {
      console.error("Error with text content:", error);
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
    
    // ファイルサイズのチェック（20MB以上は警告）
    if (file.size > 20 * 1024 * 1024) {
      console.warn("大きなファイル（" + Math.round(file.size / (1024 * 1024)) + 
        "MB）がアップロードされました。処理に時間がかかる場合があります。");
    }
    
    // ファイルタイプのチェックと処理
    if (file.type === "application/pdf") {
      // PDFファイルの場合
      console.log("PDFファイルがアップロードされました:", file.name, file.size, "bytes");
      setPdfFile(file);
      setImageFile(null); // 画像をクリア
    } else if (file.type.startsWith("image/")) {
      // 画像ファイルの場合
      console.log("画像ファイルがアップロードされました:", file.name, file.size, "bytes");
      setImageFile(file);
      setPdfFile(null); // PDFをクリア
    } else {
      // サポートされていないファイルタイプ
      setLoadError("サポートされていないファイル形式です。PDFまたは画像ファイル(JPEG, PNG, GIF)をアップロードしてください。選択したファイルは " + 
        (file.type || "不明なタイプ") + " です。");
    }
  };

  return (
    <section className="md:w-1/2 w-full md:h-full h-screen bg-white overflow-hidden flex flex-col">
      {/* Empty state - shown when no file is loaded */}
      {!pdfFile && !imageFile && (
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
          <h2 className="text-lg font-medium text-gray-900 mb-3">PDFまたは画像をアップロード</h2>
          <p className="text-center text-secondary-dark mb-6 max-w-sm px-4">
            PDFや画像ファイルをアップロードして、テキストを抽出したりビジネス分析に利用できます。
          </p>
          <Button
            variant="default"
            size="sm"
            className="bg-primary hover:bg-primary-light text-white"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp className="mr-2 h-5 w-5" />
            ファイルをアップロード
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/gif"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      )}

      {/* Error state - shown when file loading fails */}
      {loadError && (
        <div className="error-container">
          <div className="error-icon">
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
          <h2 className="error-title">ファイルの読み込みエラー</h2>
          <p className="error-message">{loadError}</p>
          <div className="error-help">
            <p className="mb-2">以下をお試しください：</p>
            <ul className="list-disc pl-5">
              <li>別のPDFファイルや画像ファイルをアップロード</li>
              <li>PDFの場合、パスワード保護されていないものを使用</li>
              <li>画像はJPEG、PNG、GIF形式が利用可能です</li>
            </ul>
          </div>
          <Button
            className="bg-primary hover:bg-primary-light text-white"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp className="mr-2 h-5 w-5" />
            別のファイルを試す
          </Button>
        </div>
      )}

      {/* PDF viewer - shown when PDF is loaded */}
      {pdfFile && !loadError && (
        <div className="flex flex-col h-full">
          {/* PDF controls */}
          <div className="bg-secondary-light p-2 border-b border-secondary flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-secondary-dark">
                {currentPage} / {totalPages}
              </span>
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={prevPage}
                  disabled={currentPage <= 1}
                  className="h-8 w-8 p-0 text-secondary-dark"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={nextPage}
                  disabled={currentPage >= totalPages}
                  className="h-8 w-8 p-0 text-secondary-dark"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={zoomOut}
                className="h-8 w-8 p-0 text-secondary-dark"
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              <span className="text-xs text-secondary-dark w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={zoomIn}
                className="h-8 w-8 p-0 text-secondary-dark"
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* PDF content */}
          <div 
            ref={containerRef}
            className="relative flex-grow flex justify-center overflow-auto bg-[#f0f0f0]"
          >
            <canvas 
              ref={canvasRef}
              className="shadow-md my-4"
            />
            <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }} />
          </div>
        </div>
      )}

      {/* Image viewer - shown when image is loaded */}
      {imageFile && imageUrl && !loadError && (
        <div className="flex flex-col h-full">
          <div className="bg-secondary-light p-2 border-b border-secondary flex items-center justify-between">
            <span className="text-sm text-secondary-dark">
              {imageFile.name}
            </span>
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={zoomOut}
                className="h-8 w-8 p-0 text-secondary-dark"
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              <span className="text-xs text-secondary-dark w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={zoomIn}
                className="h-8 w-8 p-0 text-secondary-dark"
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="image-viewer flex-grow overflow-auto">
            <img 
              src={imageUrl} 
              alt={imageFile.name}
              style={{ transform: `scale(${zoom})` }}
              className="mx-auto my-4"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default PDFViewer;
