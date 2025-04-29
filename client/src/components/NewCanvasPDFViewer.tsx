import React, { useState, useEffect, useRef } from "react";
import { useAnalysisContext } from "@/context/AnalysisContext";
import { Button } from "@/components/ui/button";
import { FileUp, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import * as pdfjs from 'pdfjs-dist';

// PDFJSのワーカーを設定
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

/**
 * キャンバスベースのPDFビューワー
 * ネイティブなテキスト選択を実装
 */
const NewCanvasPDFViewer: React.FC = () => {
  const { pdfFile, setPdfFile, imageFile, setImageFile, addTextBox } = useAnalysisContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedRangeText, setSelectedRangeText] = useState('');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 選択イベントを管理するための変数
  const selectionChangeListenerRef = useRef<() => void>(() => {});
  
  // PDFのレンダリング
  useEffect(() => {
    if (!pdfFile) return;
    
    // 以前の状態をクリア
    setImageUrl(null);
    setErrorMessage(null);
    
    const loadPdf = async () => {
      try {
        // ArrayBufferに変換
        const arrayBuffer = await pdfFile.arrayBuffer();
        
        // PDFドキュメントを読み込み（日本語フォントサポート付き）
        const loadingTask = pdfjs.getDocument({
          data: arrayBuffer,
          cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/'
        });
        
        // タイムアウト処理
        const timeoutPromise = new Promise<any>((_, reject) => {
          setTimeout(() => reject(new Error("PDF読み込みがタイムアウトしました")), 10000);
        });
        
        const pdf = await Promise.race([
          loadingTask.promise,
          timeoutPromise
        ]);
        
        // 基本情報を設定
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        
        // 参照に保存
        pdfDocumentRef.current = pdf;
        
        // 最初のページを描画
        renderPage(pdf, 1, zoom);
      } catch (error) {
        console.error("PDF読み込みエラー:", error);
        setErrorMessage(`PDFの読み込みに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
      }
    };
    
    loadPdf();
  }, [pdfFile, zoom]);
  
  // 現在のPDFドキュメントを保持する参照
  const pdfDocumentRef = useRef<any>(null);
  
  // ページ番号やズーム変更時の再レンダリング
  useEffect(() => {
    if (!pdfFile || !pdfDocumentRef.current) return;
    
    const renderCurrentPage = async () => {
      try {
        console.log(`ページ ${currentPage} をズーム ${zoom} でレンダリング`);
        renderPage(pdfDocumentRef.current, currentPage, zoom);
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
      
      // テキストレイヤーを生成
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
        (textLayerDiv.style as any).webkitUserSelect = 'text';
        
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
            
            // 単語ごとに処理する（より自然な選択のため）
            // 単語を形成する文字列
            const words = item.str.match(/\S+|\s+/g) || [];
            let charPosition = 0;
            
            for (const word of words) {
              // ワード全体の幅を計算
              const wordWidth = item.width ? (item.width / item.str.length) * word.length : fontSize * 0.6 * word.length;
            
              // 文字位置の計算
              const wordLeft = baseLeft + charPosition * (item.width ? item.width / item.str.length : fontSize * 0.6);
              charPosition += word.length;
              
              // 単語の位置キー
              const wordKey = `word-${Math.round(wordLeft)}-${Math.round(baseTop)}`;
              
              // 単語が空白だけの場合はスキップ（ただし空白として扱う）
              if (word.trim() === '') {
                continue;
              }
              
              // 単語要素を作成
              const wordElement = document.createElement('span');
              wordElement.textContent = word;
              wordElement.className = 'pdf-word';
              wordElement.style.position = 'absolute';
              wordElement.style.left = `${wordLeft}px`;
              wordElement.style.top = `${baseTop}px`;
              wordElement.style.fontSize = `${fontSize}px`;
              wordElement.style.fontFamily = 'sans-serif';
              wordElement.style.color = 'black';
              wordElement.style.width = `${wordWidth}px`;
              wordElement.style.height = `${fontSize * 1.2}px`;
              wordElement.style.lineHeight = `${fontSize * 1.2}px`;
              wordElement.style.whiteSpace = 'pre';
              
              // 選択可能に設定
              wordElement.style.userSelect = 'text';
              (wordElement.style as any).webkitUserSelect = 'text';
              wordElement.style.pointerEvents = 'auto';
              
              // 余白と境界を調整
              wordElement.style.margin = '0';
              wordElement.style.padding = '0';
              wordElement.style.boxSizing = 'border-box';
              
              // データ属性を設定（選択時に利用）
              wordElement.dataset.word = word;
              wordElement.dataset.position = String(charPosition);
              
              // カーソルスタイル
              wordElement.style.cursor = 'text';
              
              // テキストレイヤーに追加
              textLayerDiv.appendChild(wordElement);
              
              // マップに追加（重複チェック用）
              charPositionMap.set(wordKey, wordElement);
            }
          }
          
          // テキスト選択の変更を検出する関数
          const handleSelectionChange = () => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;
            
            const range = selection.getRangeAt(0);
            if (!range) return;
            
            // textLayerContainerがまだ有効かチェック
            const currentTextLayerContainer = document.querySelector('.text-layer-container') as HTMLElement;
            if (!currentTextLayerContainer) return;
            
            try {
              // 選択範囲内の要素を収集して、正確なテキストを構築する
              const nodes: Node[] = [];
              const nodeWalker = document.createTreeWalker(
                textLayerDiv,
                NodeFilter.SHOW_TEXT,
                {
                  acceptNode: function(node) {
                    if (selection.containsNode(node, true)) {
                      return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_REJECT;
                  }
                }
              );
              
              let node;
              while ((node = nodeWalker.nextNode())) {
                nodes.push(node);
              }
              
              // 選択されたノードからテキストを集める
              let textFromNodes = '';
              for (const node of nodes) {
                const parentElement = node.parentElement;
                if (parentElement && parentElement.classList.contains('pdf-word')) {
                  // 単語要素からデータを取得
                  textFromNodes += parentElement.dataset.word || node.textContent || '';
                  
                  // 単語間のスペースを追加 (最後の単語には追加しない)
                  if (node !== nodes[nodes.length - 1]) {
                    textFromNodes += ' ';
                  }
                }
              }
              
              // 選択されたテキストを取得（補助的な手段）
              let rawSelectedText = range.toString().trim();
              
              // 最終的な選択テキスト（優先度: 1. ノードから集めたテキスト 2. rangeから直接取得したテキスト）
              const newSelectedText = textFromNodes || rawSelectedText;
              
              // 選択範囲が空の場合は処理終了
              if (!newSelectedText) {
                return;
              }
              
              // 選択テキストのクリーンアップ（重複した文字を削除）
              // 同じ文字が連続して3文字以上繰り返される場合、2文字に制限
              const cleanedText = newSelectedText.replace(/(.)\1{2,}/g, '$1$1');
              
              // stateを更新
              setSelectedRangeText(cleanedText);
              
              // 選択テキストが変更されたことをログに出力
              console.log('選択されたテキスト:', cleanedText);
              
              // 既存のコピーボタンを削除
              const oldCopyButtons = document.querySelectorAll('.copy-button');
              oldCopyButtons.forEach(btn => btn.parentNode?.removeChild(btn));
              
              // 選択範囲の情報を取得
              const selectionRect = range.getBoundingClientRect();
              if (!selectionRect || selectionRect.width === 0 || selectionRect.height === 0) return;
              
              // コピーボタンの作成と追加
              const copyButton = document.createElement('button');
              copyButton.innerHTML = 'コピー';
              copyButton.className = 'copy-button';
              copyButton.style.position = 'absolute';
              
              // ボタンの位置を選択範囲の上部に配置
              const containerRect = currentTextLayerContainer.getBoundingClientRect();
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
              currentTextLayerContainer.appendChild(copyButton);
              
              // コピーボタンのクリックイベント
              copyButton.addEventListener('click', () => {
                // 選択テキストを最終確認
                const finalText = cleanedText.trim();
                
                // 現代的なClipboard APIを使用
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(finalText)
                    .then(() => {
                      // テキストボックスとしてキャンバスに追加
                      if (finalText.trim()) {
                        // ポジションを計算 - キャンバスの左上を基準に
                        const rect = canvas.getBoundingClientRect();
                        const positionX = (selectionRect.left - rect.left) / scale;
                        const positionY = (selectionRect.top - rect.top) / scale;
                        
                        // テキストをキャンバスに追加
                        addTextBox(finalText, positionX, positionY);
                      }
                      
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
                      copyButton.innerHTML = 'エラー';
                      copyButton.style.backgroundColor = '#e11d48';
                      
                      setTimeout(() => {
                        if (copyButton.parentNode) {
                          copyButton.parentNode.removeChild(copyButton);
                        }
                      }, 1500);
                    });
                } else {
                  // 旧式ブラウザ用フォールバック
                  const textarea = document.createElement('textarea');
                  textarea.value = finalText;
                  textarea.style.position = 'absolute';
                  textarea.style.left = '-9999px';
                  document.body.appendChild(textarea);
                  textarea.select();
                  document.execCommand('copy');
                  document.body.removeChild(textarea);
                  
                  // キャンバスに追加
                  if (finalText.trim()) {
                    const rect = canvas.getBoundingClientRect();
                    const positionX = (selectionRect.left - rect.left) / scale;
                    const positionY = (selectionRect.top - rect.top) / scale;
                    addTextBox(finalText, positionX, positionY);
                  }
                  
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
            } catch (error) {
              console.error('選択処理エラー:', error);
            }
          };
          
          // 選択変更イベントリスナーを追加してリファレンスを保存
          document.addEventListener('selectionchange', handleSelectionChange);
          selectionChangeListenerRef.current = handleSelectionChange;
          
          // テキストコンテナのクリックイベント
          const textLayerContainerEl = document.querySelector('.text-layer-container') as HTMLElement;
          if (textLayerContainerEl) {
            textLayerContainerEl.addEventListener('mousedown', (e: MouseEvent) => {
              // 左クリックのみ処理
              if (e.button !== 0) return;
              
              // 既存のコピーボタンをクリア
              const oldCopyButtons = document.querySelectorAll('.copy-button');
              oldCopyButtons.forEach(btn => btn.parentNode?.removeChild(btn));
            });
          }
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

export default NewCanvasPDFViewer;