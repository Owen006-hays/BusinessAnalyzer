import React, { useState, useEffect, useRef } from "react";
import { useAnalysisContext } from "@/context/AnalysisContext";
import { Button } from "@/components/ui/button";
import { FileUp, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * キャンバスベースのPDFビューワー
 * ネイティブなテキスト選択を実装
 */
const CanvasPDFViewer: React.FC = () => {
  const { pdfFile, setPdfFile, imageFile, setImageFile } = useAnalysisContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // PDFのレンダリング
  useEffect(() => {
    if (!pdfFile) return;
    
    // 以前の状態をクリア
    setImageUrl(null);
    setErrorMessage(null);
    
    const loadPdf = async () => {
      try {
        // グローバルのPDF.jsを使用
        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          setErrorMessage("PDF.jsライブラリが見つかりませんでした。");
          return;
        }
        
        // ArrayBufferに変換
        const arrayBuffer = await pdfFile.arrayBuffer();
        
        // PDFドキュメントを読み込み（日本語フォントサポート付き）
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/'
        });
        
        // タイムアウト処理
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("PDF読み込みがタイムアウトしました")), 10000);
        });
        
        const pdf = await Promise.race([
          loadingTask.promise,
          timeoutPromise
        ]);
        
        // 基本情報を設定
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        
        // 最初のページを描画
        renderPage(pdf, 1, zoom);
      } catch (error) {
        console.error("PDF読み込みエラー:", error);
        setErrorMessage(`PDFの読み込みに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
      }
    };
    
    loadPdf();
  }, [pdfFile]);
  
  // 現在のPDFドキュメントを保持する参照
  const pdfDocumentRef = useRef<any>(null);
  
  // ページ番号やズーム変更時の再レンダリング
  useEffect(() => {
    if (!pdfFile) return;
    
    const renderCurrentPage = async () => {
      try {
        // PDFドキュメントがすでに読み込まれている場合は再利用
        if (pdfDocumentRef.current) {
          console.log(`ページ ${currentPage} をズーム ${zoom} でレンダリング`);
          renderPage(pdfDocumentRef.current, currentPage, zoom);
          return;
        }
        
        // まだPDFが読み込まれていない場合は新たに読み込む
        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) return;
        
        const arrayBuffer = await pdfFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/'
        });
        
        const pdf = await loadingTask.promise;
        pdfDocumentRef.current = pdf; // 参照に保存
        
        renderPage(pdf, currentPage, zoom);
      } catch (error) {
        console.error("ページレンダリングエラー:", error);
      }
    };
    
    renderCurrentPage();
  }, [currentPage, zoom, pdfFile]);
  
  // 画像処理
  useEffect(() => {
    if (!imageFile) {
      setImageUrl(null);
      return;
    }
    
    // PDFクリア
    setErrorMessage(null);
    
    const loadImage = async () => {
      try {
        // 画像形式チェック
        if (!imageFile.type.startsWith('image/')) {
          setErrorMessage("サポートされていない画像形式です。");
          return;
        }
        
        const url = URL.createObjectURL(imageFile);
        setImageUrl(url);
        
        // クリーンアップ
        return () => URL.revokeObjectURL(url);
      } catch (error) {
        console.error("画像読み込みエラー:", error);
        setErrorMessage(`画像の処理に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
      }
    };
    
    loadImage();
  }, [imageFile]);
  
  // 選択イベントを管理するための変数
  const selectionChangeListenerRef = useRef<() => void>(() => {});
  
  // ページのレンダリング関数
  const renderPage = async (pdf: any, pageNumber: number, scale: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      
      // キャンバスサイズ調整
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // レンダリング
      const renderContext = {
        canvasContext: canvas.getContext('2d')!,
        viewport
      };
      
      // キャンバスにPDFを描画
      await page.render(renderContext).promise;
      
      // テキストレイヤーを生成（コピー&ペースト機能用）
      try {
        // 既存のテキストレイヤーをクリア
        const existingTextLayer = container.querySelector('.text-layer');
        if (existingTextLayer) {
          existingTextLayer.remove();
        }
        
        // 以前の選択変更リスナーを削除
        if (selectionChangeListenerRef.current) {
          document.removeEventListener('selectionchange', selectionChangeListenerRef.current);
        }
        
        // テキストコンテンツを取得
        const textContent = await page.getTextContent();
        
        // テキストレイヤーコンテナを作成
        const textLayerDiv = document.createElement('div');
        textLayerDiv.className = 'text-layer';
        textLayerDiv.style.position = 'absolute';
        textLayerDiv.style.left = '0';
        textLayerDiv.style.top = '0';
        textLayerDiv.style.right = '0';
        textLayerDiv.style.bottom = '0';
        textLayerDiv.style.overflow = 'hidden';
        textLayerDiv.style.opacity = '1';
        textLayerDiv.style.lineHeight = '1.0';
        textLayerDiv.style.width = `${viewport.width}px`;
        textLayerDiv.style.height = `${viewport.height}px`;
        textLayerDiv.style.pointerEvents = 'auto';
        
        // 選択を有効化するためのスタイル設定
        textLayerDiv.style.userSelect = 'text';
        textLayerDiv.style.WebkitUserSelect = 'text';
        // TypeScript で認識できるプロパティ名を使用
        (textLayerDiv.style as any).MsUserSelect = 'text';
        
        // キャンバスの親要素に追加（同じ位置に配置）
        const canvasWrapper = canvas.parentNode as HTMLElement;
        if (canvasWrapper) {
          const canvasPosition = window.getComputedStyle(canvas).position;
          if (canvasPosition === 'static') {
            canvasWrapper.style.position = 'relative';
          }
          
          // テキストレイヤーを配置
          const textLayerContainer = document.createElement('div');
          textLayerContainer.className = 'text-layer-container';
          textLayerContainer.style.position = 'absolute';
          textLayerContainer.style.left = `${canvas.offsetLeft}px`;
          textLayerContainer.style.top = `${canvas.offsetTop}px`;
          textLayerContainer.style.width = `${canvas.width}px`;
          textLayerContainer.style.height = `${canvas.height}px`;
          textLayerContainer.appendChild(textLayerDiv);
          canvasWrapper.appendChild(textLayerContainer);
          
          // ネイティブなテキスト選択のためのセットアップ
          let selectedRangeText = '';
          let selectionTimeout: ReturnType<typeof setTimeout> | null = null;
          
          // テキスト要素の重複防止用マップ
          const charPositionMap = new Map();
          
          // テキストコンテンツのアイテムを処理
          for (const item of textContent.items) {
            if (!item.str) continue; // 空文字列はスキップ
            
            // 文字の位置情報を取得
            const [fontHeight, fontAscent] = item.transform.slice(3, 5);
            const baseLeft = Math.round(item.transform[4] * scale * 10) / 10; // 小数点1桁で丸める
            const baseTop = Math.round((item.transform[5] * scale - fontAscent * scale) * 10) / 10;
            const fontSize = fontHeight * scale;
            
            // このテキスト要素が持つすべての文字の幅情報（あれば）
            const charWidths = item.width ? new Array(item.str.length).fill(item.width / item.str.length) : null;
            
            // 1文字ずつ処理
            for (let i = 0; i < item.str.length; i++) {
              const char = item.str[i];
              
              // 文字の開始位置を計算（前の文字の累積幅に基づく）
              let charLeft = baseLeft;
              if (charWidths) {
                for (let j = 0; j < i; j++) {
                  charLeft += charWidths[j];
                }
              } else {
                // 幅情報がない場合は推定
                charLeft += i * (fontSize * 0.6); // 文字幅を推定
              }
              
              // 位置をキーにして、既に同じ場所に文字があるかチェック
              const posKey = `${Math.round(charLeft)}-${Math.round(baseTop)}`;
              
              // 既に同じ位置に文字がある場合はスキップ（重複防止）
              if (charPositionMap.has(posKey)) {
                const existingElement = charPositionMap.get(posKey);
                const existingChar = existingElement.textContent || '';
                
                // 特殊文字と通常文字の判定
                const isCurrentCharSpecial = char.trim() === '' || /[\s\x00-\x1F\x7F-\x9F]/.test(char);
                const isExistingCharSpecial = existingChar.trim() === '' || /[\s\x00-\x1F\x7F-\x9F]/.test(existingChar);
                
                // 既存が特殊文字で新しい方が通常文字の場合のみ置き換え
                if (isExistingCharSpecial && !isCurrentCharSpecial) {
                  if (existingElement.parentNode) {
                    existingElement.parentNode.removeChild(existingElement);
                  }
                  // 以下で新しい要素を作成して追加
                } else {
                  // それ以外の場合は既存を保持し、この文字をスキップ
                  continue;
                }
              }
              
              // 文字要素を作成
              const charElement = document.createElement('span');
              charElement.textContent = char;
              charElement.className = 'pdf-char';
              charElement.style.position = 'absolute';
              charElement.style.color = 'black'; // 実際に表示する
              charElement.style.whiteSpace = 'pre';
              charElement.style.cursor = 'text';
              
              // 選択可能に設定
              charElement.style.userSelect = 'text';
              charElement.style.WebkitUserSelect = 'text';
              // TypeScript で認識できるプロパティ名を使用
              (charElement.style as any).MsUserSelect = 'text';
              charElement.style.pointerEvents = 'auto';
              
              // 要素の位置とサイズを設定
              charElement.style.left = `${charLeft}px`;
              charElement.style.top = `${baseTop}px`;
              charElement.style.fontSize = `${fontSize}px`;
              charElement.style.fontFamily = 'sans-serif';
              charElement.style.width = charWidths ? `${charWidths[i]}px` : `${fontSize * 0.6}px`;
              charElement.style.height = `${fontSize * 1.2}px`;
              charElement.style.lineHeight = `${fontSize * 1.2}px`;
              
              // マップに追加
              charPositionMap.set(posKey, charElement);
              // DOM に追加
              textLayerDiv.appendChild(charElement);
            }
          }
          
          // テキスト選択の変更を検出する関数
          const handleSelectionChange = () => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;
            
            const range = selection.getRangeAt(0);
            if (!range) return;
            
            // 選択されたテキストを取得
            selectedRangeText = range.toString().trim();
            
            // 選択範囲が空の場合は処理終了
            if (!selectedRangeText) {
              return;
            }
            
            // 選択テキストが変更されたことをログに出力
            console.log('選択されたテキスト:', selectedRangeText);
            
            // 既存のコピーボタンを削除
            const oldCopyButtons = document.querySelectorAll('.copy-button');
            oldCopyButtons.forEach(btn => btn.parentNode?.removeChild(btn));
            
            // 選択範囲の情報を取得
            const selectionRect = range.getBoundingClientRect();
            if (!selectionRect || selectionRect.width === 0 || selectionRect.height === 0) return;
            
            // コピーボタンの追加をわずかに遅延させて、選択操作の完了を保証
            if (selectionTimeout) {
              clearTimeout(selectionTimeout);
            }
            
            selectionTimeout = setTimeout(() => {
              // 選択テキストが存在する場合のみ処理
              if (selectedRangeText) {
                // コピーボタンを作成
                const copyButton = document.createElement('button');
                copyButton.innerHTML = 'コピー';
                copyButton.className = 'copy-button';
                copyButton.style.position = 'absolute';
                
                // ボタンの位置を選択範囲の上部に配置
                const containerRect = textLayerContainer.getBoundingClientRect();
                copyButton.style.left = `${selectionRect.right - containerRect.left - 40}px`;
                copyButton.style.top = `${selectionRect.top - containerRect.top - 30}px`;
                
                // ボタンのスタイル
                copyButton.style.backgroundColor = 'rgba(66, 153, 225, 0.9)';
                copyButton.style.color = 'white';
                copyButton.style.border = 'none';
                copyButton.style.borderRadius = '4px';
                copyButton.style.padding = '4px 12px';
                copyButton.style.fontSize = '12px';
                copyButton.style.cursor = 'pointer';
                copyButton.style.zIndex = '200';
                copyButton.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
                textLayerContainer.appendChild(copyButton);
                
                // コピーボタンのクリックイベント
                copyButton.addEventListener('click', () => {
                  // 現代的なClipboard APIを使用
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(selectedRangeText)
                      .then(() => {
                        // コピー成功のフィードバック
                        copyButton.innerHTML = 'コピー完了!';
                        copyButton.style.backgroundColor = '#16a34a'; // green
                        
                        // 一定時間後にボタンを非表示
                        setTimeout(() => {
                          if (copyButton.parentNode) {
                            copyButton.parentNode.removeChild(copyButton);
                          }
                        }, 1500);
                      })
                      .catch(err => {
                        console.error('クリップボードへのコピーに失敗:', err);
                        // フォールバック: テキストエリアを使用
                        const textarea = document.createElement('textarea');
                        textarea.value = selectedRangeText;
                        textarea.style.position = 'absolute';
                        textarea.style.left = '-9999px';
                        document.body.appendChild(textarea);
                        textarea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textarea);
                        
                        copyButton.innerHTML = 'コピー完了!';
                        copyButton.style.backgroundColor = '#16a34a';
                        
                        setTimeout(() => {
                          if (copyButton.parentNode) {
                            copyButton.parentNode.removeChild(copyButton);
                          }
                        }, 1500);
                      });
                  } else {
                    // 旧式ブラウザ用フォールバック
                    const textarea = document.createElement('textarea');
                    textarea.value = selectedRangeText;
                    textarea.style.position = 'absolute';
                    textarea.style.left = '-9999px';
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    
                    copyButton.innerHTML = 'コピー完了!';
                    copyButton.style.backgroundColor = '#16a34a';
                    
                    setTimeout(() => {
                      if (copyButton.parentNode) {
                        copyButton.parentNode.removeChild(copyButton);
                      }
                    }, 1500);
                  }
                });
                
                // ボタンは一定時間後に自動的に非表示
                setTimeout(() => {
                  if (copyButton.parentNode) {
                    copyButton.parentNode.removeChild(copyButton);
                  }
                }, 5000);
              }
            }, 200); // 短い遅延で選択完了を待つ
          };
          
          // 選択変更イベントリスナーを追加してリファレンスを保存
          document.addEventListener('selectionchange', handleSelectionChange);
          selectionChangeListenerRef.current = handleSelectionChange;
          
          // テキストコンテナのクリックイベント
          textLayerContainer.addEventListener('mousedown', (e) => {
            // 左クリックのみ処理
            if (e.button !== 0) return;
            
            // 既存のコピーボタンをクリア
            const oldCopyButtons = document.querySelectorAll('.copy-button');
            oldCopyButtons.forEach(btn => btn.parentNode?.removeChild(btn));
          });
        }
        
        console.log('テキストレイヤーを生成しました（コピー&ペースト機能が利用可能）');
      } catch (textLayerError) {
        console.error('テキストレイヤーの生成に失敗:', textLayerError);
      }
    } catch (error) {
      console.error("ページレンダリングエラー:", error);
    }
  };
  
  // ファイルアップロードハンドラー
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setErrorMessage(null);
    
    // ファイルタイプチェック
    if (file.type === 'application/pdf') {
      setPdfFile(file);
      setImageFile(null);
    } else if (file.type.startsWith('image/')) {
      setImageFile(file);
      setPdfFile(null);
    } else {
      setErrorMessage(`サポートされていないファイル形式です: ${file.type || '不明'}`);
    }
  };
  
  // ナビゲーション関数
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  // ズーム関数
  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2.0));
  };
  
  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };
  
  // コンポーネントがアンマウントされるときにイベントリスナーを削除
  useEffect(() => {
    return () => {
      if (selectionChangeListenerRef.current) {
        document.removeEventListener('selectionchange', selectionChangeListenerRef.current);
      }
    };
  }, []);
  
  return (
    <section className="md:w-1/2 w-full md:h-full h-screen bg-white overflow-hidden flex flex-col">
      {/* Empty state */}
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
      
      {/* Error state */}
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
      
      {/* PDF Viewer */}
      {pdfFile && !errorMessage && (
        <div className="flex flex-col h-full">
          {/* Controls */}
          <div className="bg-gray-100 p-2 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={prevPage}
                  disabled={currentPage <= 1}
                  className="h-8 w-8 p-0 text-gray-600"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={nextPage}
                  disabled={currentPage >= totalPages}
                  className="h-8 w-8 p-0 text-gray-600"
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
                className="h-8 w-8 p-0 text-gray-600"
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              <span className="text-xs text-gray-600 w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={zoomIn}
                className="h-8 w-8 p-0 text-gray-600"
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 text-gray-600"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="h-4 w-4 mr-1" />
                <span className="text-xs">変更</span>
              </Button>
            </div>
          </div>
          
          {/* Canvas container */}
          <div 
            ref={containerRef}
            className="flex-grow overflow-auto flex justify-center bg-gray-50"
          >
            <div className="pdf-container relative my-4">
              <canvas 
                ref={canvasRef} 
                className="shadow-md"
              />
              <div className="pdf-viewer-controls">
                <div className="text-selectable-hint">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    テキストを選択してコピーできます
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2 mb-1 flex justify-center">
                  <span>選択可能なテキストが黒色で表示されます</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Image viewer */}
      {imageUrl && !errorMessage && (
        <div className="flex-grow h-full overflow-auto p-4 flex flex-col items-center justify-center">
          <div className="relative max-w-full">
            <img 
              src={imageUrl} 
              alt="アップロードされた画像" 
              className="max-w-full max-h-[calc(100vh-8rem)] rounded shadow-lg"
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 bg-white text-gray-700 border border-gray-300"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="mr-2 h-4 w-4" />
              画像を変更
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default CanvasPDFViewer;