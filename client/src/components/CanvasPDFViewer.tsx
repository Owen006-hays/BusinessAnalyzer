import React, { useState, useEffect, useRef } from "react";
import { useAnalysisContext } from "@/context/AnalysisContext";
import { Button } from "@/components/ui/button";
import { FileUp, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Copy } from "lucide-react";

/**
 * キャンバスベースのPDFビューワー
 * CDNからのPDF.jsを使用してPDFをレンダリングします
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
          (canvasWrapper as HTMLElement).appendChild(textLayerContainer);
          
          // ネイティブなテキスト選択のためのセットアップ
          let selectedRangeText = '';
          let selectionTimeout: ReturnType<typeof setTimeout> | null = null;
          
          // テキスト選択を可能にするための共通スタイルを設定
          const enableTextSelection = () => {
            // テキストレイヤー全体を選択可能に
            textLayerDiv.style.userSelect = 'text';
            textLayerDiv.style.webkitUserSelect = 'text';
            textLayerDiv.style.msUserSelect = 'text';
            textLayerDiv.style.pointerEvents = 'auto';
            
            // すべての文字要素を選択可能に
            Array.from(textLayerDiv.children).forEach((child) => {
              const el = child as HTMLElement;
              el.style.color = 'black';  // テキストを黒色にして見えるように
              el.style.userSelect = 'text';
              el.style.webkitUserSelect = 'text';
              el.style.msUserSelect = 'text';
              el.style.pointerEvents = 'auto';
              el.style.cursor = 'text';
            });
          };
          
          // マウスドラッグ選択のイベントリスナー
          textLayerContainer.addEventListener('mousedown', (e) => {
            // 左クリックのみを処理
            if (e.button !== 0) return;
            
            // 既存の選択をクリア
            if (selectionRect && selectionRect.parentNode) {
              selectionRect.parentNode.removeChild(selectionRect);
            }
            
            // 前回の選択テキスト要素をリセット
            selectedElements.forEach(el => {
              el.style.backgroundColor = '';
              el.style.opacity = '0';
            });
            selectedElements = [];
            
            // コピーボタンや選択ツールチップが残っていれば削除
            const oldCopyButtons = document.querySelectorAll('.copy-button');
            oldCopyButtons.forEach(btn => btn.parentNode?.removeChild(btn));
            
            const oldTooltips = document.querySelectorAll('.selection-tooltip');
            oldTooltips.forEach(tip => tip.parentNode?.removeChild(tip));
            
            isSelecting = true;
            // 正確な位置を計算
            const containerRect = textLayerContainer.getBoundingClientRect();
            selectionStart = {
              x: e.clientX - window.scrollX,
              y: e.clientY - window.scrollY
            };
            
            // 新しい選択範囲を作成
            selectionRect = createSelectionRect();
            selectionRect.style.left = `${e.clientX - containerRect.left}px`;
            selectionRect.style.top = `${e.clientY - containerRect.top}px`;
            selectionRect.style.width = '0px';
            selectionRect.style.height = '0px';
            textLayerContainer.appendChild(selectionRect);
            
            e.preventDefault();
          });
          
          textLayerContainer.addEventListener('mousemove', (e) => {
            if (!isSelecting || !selectionStart || !selectionRect) return;
            
            const currentX = e.clientX;
            const currentY = e.clientY;
            const containerRect = textLayerContainer.getBoundingClientRect();
            
            // 選択範囲の位置とサイズを計算
            const left = Math.min(selectionStart.x, currentX) - containerRect.left;
            const top = Math.min(selectionStart.y, currentY) - containerRect.top;
            const width = Math.abs(currentX - selectionStart.x);
            const height = Math.abs(currentY - selectionStart.y);
            
            // 選択範囲を更新
            selectionRect.style.left = `${left}px`;
            selectionRect.style.top = `${top}px`;
            selectionRect.style.width = `${width}px`;
            selectionRect.style.height = `${height}px`;
            
            // 選択範囲内のテキスト要素をハイライト
            const selectionBounds = {
              left,
              top,
              right: left + width,
              bottom: top + height
            };
            
            // すべての選択をリセット
            selectedElements.forEach(el => {
              el.style.backgroundColor = '';
              el.style.opacity = '0';
            });
            selectedElements = [];
            
            // 選択範囲内のテキスト要素を検出して選択する
            Array.from(textLayerDiv.children).forEach((child) => {
              const el = child as HTMLElement;
              const elLeft = parseFloat(el.style.left);
              const elTop = parseFloat(el.style.top);
              const elWidth = el.getBoundingClientRect().width;
              const elHeight = el.getBoundingClientRect().height;
              const elRight = elLeft + elWidth;
              const elBottom = elTop + elHeight;
              
              // テキスト要素が選択範囲と十分に重なるかチェック
              // より正確なオーバーラップロジック
              const overlaps = !(
                elRight < selectionBounds.left ||
                elLeft > selectionBounds.right ||
                elBottom < selectionBounds.top ||
                elTop > selectionBounds.bottom
              );
              
              const minIntersectionRatio = 0.35; // 35%以上の重なりを要求（より厳密に）
              
              // 重なっている面積の比率を計算
              if (overlaps) {
                const intersectionLeft = Math.max(elLeft, selectionBounds.left);
                const intersectionTop = Math.max(elTop, selectionBounds.top);
                const intersectionRight = Math.min(elRight, selectionBounds.right);
                const intersectionBottom = Math.min(elBottom, selectionBounds.bottom);
                
                const intersectionWidth = Math.max(0, intersectionRight - intersectionLeft);
                const intersectionHeight = Math.max(0, intersectionBottom - intersectionTop);
                const intersectionArea = intersectionWidth * intersectionHeight;
                
                const elementArea = elWidth * elHeight;
                const intersectionRatio = elementArea > 0 ? intersectionArea / elementArea : 0;
                
                if (intersectionRatio >= minIntersectionRatio) {
                  el.style.backgroundColor = 'rgba(66, 153, 225, 0.2)';
                  el.style.opacity = '0.8';
                  if (!selectedElements.includes(el)) {
                    selectedElements.push(el);
                  }
                }
              }
            });
          });
          
          textLayerContainer.addEventListener('mouseup', (e) => {
            if (!isSelecting) return;
            
            isSelecting = false;
            
            // 選択したテキストを処理
            if (selectedElements.length > 0) {
              // 選択テキストをコピー可能にする
              const selectedTexts = selectedElements.map(el => el.textContent).join(' ');
              
              // 選択されたテキストをクリップボードにコピーするための非表示の要素を作成
              const tempTextarea = document.createElement('textarea');
              tempTextarea.value = selectedTexts;
              tempTextarea.style.position = 'absolute';
              tempTextarea.style.left = '-9999px';
              document.body.appendChild(tempTextarea);
              
              // コピーボタンを作成
              const copyButton = document.createElement('button');
              copyButton.innerHTML = 'コピー';
              copyButton.className = 'copy-button';
              copyButton.style.position = 'absolute';
              copyButton.style.left = `${e.clientX - textLayerContainer.getBoundingClientRect().left + 10}px`;
              copyButton.style.top = `${e.clientY - textLayerContainer.getBoundingClientRect().top - 40}px`;
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
                // 新しいClipboard APIを試みる
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(selectedTexts)
                    .then(() => {
                      // コピー成功のフィードバック
                      copyButton.innerHTML = 'コピー完了!';
                      copyButton.style.backgroundColor = '#16a34a'; // green
                    })
                    .catch(() => {
                      // フォールバック: 旧式のexecCommandを使用
                      tempTextarea.select();
                      document.execCommand('copy');
                      copyButton.innerHTML = 'コピー完了!';
                      copyButton.style.backgroundColor = '#16a34a'; // green
                    })
                    .finally(() => {
                      // リソースをクリーンアップ
                      document.body.removeChild(tempTextarea);
                      // 少し待ってから消す
                      setTimeout(() => {
                        if (copyButton.parentNode) {
                          copyButton.parentNode.removeChild(copyButton);
                        }
                      }, 1500);
                    });
                } else {
                  // 旧式のexecCommandを使用
                  tempTextarea.select();
                  document.execCommand('copy');
                  document.body.removeChild(tempTextarea);
                  
                  // コピー成功のフィードバック
                  copyButton.innerHTML = 'コピー完了!';
                  copyButton.style.backgroundColor = '#16a34a'; // green
                  
                  // 少し待ってから消す
                  setTimeout(() => {
                    if (copyButton.parentNode) {
                      copyButton.parentNode.removeChild(copyButton);
                    }
                  }, 1500);
                }
              });
              
              // 選択されたテキストを通知
              const tooltip = document.createElement('div');
              tooltip.className = 'selection-tooltip';
              tooltip.textContent = `${selectedElements.length}文字を選択しました`;
              tooltip.style.position = 'absolute';
              tooltip.style.left = `${e.clientX - textLayerContainer.getBoundingClientRect().left}px`;
              tooltip.style.top = `${e.clientY - textLayerContainer.getBoundingClientRect().top - 70}px`;
              tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
              tooltip.style.color = 'white';
              tooltip.style.padding = '5px 10px';
              tooltip.style.borderRadius = '4px';
              tooltip.style.fontSize = '12px';
              tooltip.style.zIndex = '100';
              tooltip.style.pointerEvents = 'none';
              textLayerContainer.appendChild(tooltip);
              
              // 選択のフィードバックを表示
              console.log('選択されたテキスト:', selectedTexts);
              
              // 選択済みテキストのスタイル維持
              selectedElements.forEach(el => {
                el.style.backgroundColor = 'rgba(66, 153, 225, 0.2)';
                el.style.opacity = '0.8';
                // コピーをサポートするために操作可能にする
                el.style.pointerEvents = 'auto';
                el.style.userSelect = 'text';
              });
              
              // タイマーを設定して、ツールチップと選択状態を管理
              setTimeout(() => {
                if (tooltip.parentNode) {
                  tooltip.parentNode.removeChild(tooltip);
                }
                
                // 5秒後にコピーボタンが残っていたら消す
                setTimeout(() => {
                  if (copyButton.parentNode) {
                    copyButton.parentNode.removeChild(copyButton);
                  }
                  document.body.removeChild(tempTextarea);
                }, 3000);
              }, 2000);
            }
            
            // 選択モードを終了
            selectionStart = null;
            
            // 選択範囲の表示を削除
            if (selectionRect && selectionRect.parentNode) {
              selectionRect.parentNode.removeChild(selectionRect);
              selectionRect = null;
            }
          });
          
          // テキストアイテムを配置
          const fontScale = 1.0;
          
          // テキスト要素の重複防止用マップ（位置をキーとして使用）
          const charPositionMap = new Map();
          
          // テキストコンテンツのアイテムを処理
          // 文字単位で細かく分割して処理する
          for (const item of textContent.items) {
            if (!item.str) continue; // 空文字列はスキップ
            
            // より精確な文字単位の処理のために文字を分割
            const [fontHeight, fontAscent] = item.transform.slice(3, 5);
            const baseLeft = Math.round(item.transform[4] * scale * 10) / 10; // 小数点1桁で丸める
            const baseTop = Math.round((item.transform[5] * scale - fontAscent * scale) * 10) / 10;
            const fontSize = fontHeight * scale;
            
            // このテキスト要素が持つすべての文字の幅情報（あれば）
            const charWidths = item.width ? new Array(item.str.length).fill(item.width / item.str.length) : null;
            
            // 1文字ずつ処理して正確な位置に配置
            for (let i = 0; i < item.str.length; i++) {
              const char = item.str[i];
              
              // 各文字の開始位置を計算（前の文字の累積幅に基づく）
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
              
              // 1文字のテキスト要素を作成
              const charElement = document.createElement('span');
              charElement.textContent = char;
              charElement.className = 'pdf-char';
              charElement.style.position = 'absolute';
              charElement.style.whiteSpace = 'pre';
              charElement.style.cursor = 'text';
              charElement.style.userSelect = 'text';
              charElement.style.pointerEvents = 'auto';
              charElement.style.opacity = '0';
              charElement.style.color = '#000';
              charElement.dataset.char = char;
              
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
              
              // 文字の正確な位置情報を保存（イベントハンドラで使用）
              const charPosition = {
                left: charLeft,
                top: baseTop,
                width: charWidths ? charWidths[i] : fontSize * 0.6,
                height: fontSize * 1.2
              };
              
              // ホバー効果（カーソル位置が実際に要素の上にある場合のみハイライト）
              charElement.addEventListener('mouseenter', (e) => {
                if (!isSelecting) {
                  // 要素内のカーソル位置を正確に判定
                  const rect = charElement.getBoundingClientRect();
                  const mouseX = e.clientX;
                  const mouseY = e.clientY;
                  
                  // カーソルが実際に文字の領域内にあるかチェック
                  if (
                    mouseX >= rect.left && 
                    mouseX <= rect.right && 
                    mouseY >= rect.top && 
                    mouseY <= rect.bottom
                  ) {
                    // この要素を最前面に出す
                    charElement.classList.add('active');
                    charElement.style.backgroundColor = 'rgba(66, 153, 225, 0.2)';
                    charElement.style.opacity = '0.8';
                    
                    // 他のハイライトを消す（重なりの問題解決）
                    const otherElements = Array.from(textLayerDiv.children) as HTMLElement[];
                    otherElements.forEach(el => {
                      if (el !== charElement && !selectedElements.includes(el)) {
                        // 選択されていない要素の場合だけ非表示に
                        el.classList.remove('active');
                        el.style.backgroundColor = 'transparent';
                        el.style.opacity = '0';
                      }
                    });
                  }
                }
              });
              
              charElement.addEventListener('mouseleave', (e) => {
                if (!isSelecting && !selectedElements.includes(charElement)) {
                  // ページ全体の要素の中で特定の座標のどれが最前面かを判断する
                  const rect = charElement.getBoundingClientRect();
                  const mouseX = e.clientX;
                  const mouseY = e.clientY;
                  
                  // 本当に要素から離れたらアクティブを解除
                  if (
                    mouseX < rect.left || 
                    mouseX > rect.right || 
                    mouseY < rect.top || 
                    mouseY > rect.bottom
                  ) {
                    charElement.classList.remove('active');
                    charElement.style.backgroundColor = 'transparent';
                    charElement.style.opacity = '0';
                    
                    // 既存の選択は維持
                    if (selectedElements.includes(charElement)) {
                      charElement.style.backgroundColor = 'rgba(66, 153, 225, 0.2)';
                      charElement.style.opacity = '0.8';
                    }
                  }
                }
              });
              
              // クリック選択時の情報を保持
              charElement.dataset.positionX = `${charLeft}`;
              charElement.dataset.positionY = `${baseTop}`;
              charElement.dataset.width = charWidths ? `${charWidths[i]}` : `${fontSize * 0.6}`;
              charElement.dataset.height = `${fontSize * 1.2}`;
            }
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
                    テキストをドラッグ選択してコピーできます
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2 mb-1 flex justify-center">
                  <span>選択可能な文字は青色でハイライトされます</span>
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
