import React, { useState, useEffect, useRef } from "react";
import { useAnalysisContext } from "@/context/AnalysisContext";
import { Button } from "@/components/ui/button";
import { FileUp, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Copy, ListFilter } from "lucide-react";
import ZoneSelector from "@/components/ZoneSelector";
import PasswordPromptDialog from "@/components/PasswordPromptDialog";
import * as pdfjsLib from "pdfjs-dist";

/**
 * シンプルなPDFビューワーコンポーネント
 * PDFファイルや画像ファイルをブラウザのネイティブAPIを使って表示します
 */
const BlobURLPDFViewer: React.FC = () => {
  const { 
    pdfFile, 
    setPdfFile, 
    imageFile, 
    setImageFile, 
    addTextBox,
    currentTemplate,
    setCurrentTemplate 
  } = useAnalysisContext();
  
  const [pdfURL, setPdfURL] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [showCopyButton, setShowCopyButton] = useState(false);
  const [showZoneSelector, setShowZoneSelector] = useState(false);
  const [copyPosition, setCopyPosition] = useState({ x: 0, y: 0 });
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [pdfPassword, setPdfPassword] = useState("");
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  
  // PDFのワーカーを初期化
  useEffect(() => {
    // PDF.jsのワーカーの場所を設定
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;
  }, []);

  // PDFが暗号化されているかチェックする関数
  const checkIfPdfIsEncrypted = async (file: File): Promise<boolean> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        password: '',
      });

      try {
        await loadingTask.promise;
        // パスワードなしで開けた場合は暗号化されていないか、空のパスワードで保護されている
        return false;
      } catch (error: any) {
        console.log("PDFのロード中にエラーが発生しました:", error);
        
        // PDF.jsのエラーコードでパスワード保護かどうかを判断
        if (error.name === 'PasswordException') {
          return true;
        }
        throw error;
      }
    } catch (error) {
      console.error("PDFの暗号化チェック中にエラーが発生しました:", error);
      throw error;
    }
  };

  // パスワード付きPDFを開く関数
  const openEncryptedPdf = async (password: string) => {
    if (!pdfFile) return;

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        password: password,
      });

      try {
        await loadingTask.promise;
        
        // パスワードが正しい場合は通常通りPDFを表示
        const url = URL.createObjectURL(pdfFile);
        setPdfURL(url);
        setShowPasswordPrompt(false);
        setErrorMessage(null);
        
        // 成功したパスワードを保存
        setPdfPassword(password);
      } catch (error: any) {
        console.error("PDFのロード中にエラーが発生しました:", error);
        
        if (error.name === 'PasswordException') {
          if (error.code === 2) {
            // 2: パスワードが間違っている
            return "パスワードが正しくありません。もう一度お試しください。";
          }
        }
        return "PDFファイルを開けませんでした。別のパスワードを試してください。";
      }
    } catch (error) {
      console.error("暗号化PDFの処理中にエラーが発生しました:", error);
      return "PDFファイルの処理中にエラーが発生しました。";
    }
    
    return null; // エラーなし
  };

  // PDFのURL生成
  useEffect(() => {
    if (pdfFile) {
      try {
        // 以前のURLをクリーンアップ
        if (pdfURL) URL.revokeObjectURL(pdfURL);
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        
        // PDFが暗号化されているかチェック
        checkIfPdfIsEncrypted(pdfFile)
          .then(isEncrypted => {
            if (isEncrypted) {
              console.log("PDFはパスワード保護されています");
              setIsEncrypted(true);
              setShowPasswordPrompt(true);
              // この段階ではURLを生成しない
            } else {
              // 暗号化されていない場合は通常通りURLを生成
              const url = URL.createObjectURL(pdfFile);
              setPdfURL(url);
              setImageUrl(null);
              setErrorMessage(null);
              setIsEncrypted(false);
              console.log("PDFのURLを生成しました:", url);
            }
          })
          .catch(error => {
            console.error("PDFの暗号化チェック中にエラーが発生しました:", error);
            setErrorMessage("PDFファイルの処理中にエラーが発生しました。別のファイルをお試しください。");
          });
        
        // コンポーネントのアンマウント時にURLをクリーンアップ
        return () => {
          if (pdfURL) URL.revokeObjectURL(pdfURL);
        };
      } catch (error) {
        console.error("PDFのURL生成中にエラーが発生しました:", error);
        setErrorMessage("PDFファイルの処理中にエラーが発生しました。別のファイルをお試しください。");
      }
    } else {
      setPdfURL(null);
    }
  }, [pdfFile]);
  
  // 画像のURL生成
  useEffect(() => {
    if (imageFile) {
      try {
        // 以前のURLをクリーンアップ
        if (pdfURL) URL.revokeObjectURL(pdfURL);
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        
        // 画像ファイルのバリデーション
        if (!imageFile.type.startsWith('image/')) {
          setErrorMessage("サポートされていない画像形式です。JPEG、PNG、GIFをお試しください。");
          return;
        }
        
        // 画像のBlobURLを生成
        const url = URL.createObjectURL(imageFile);
        setImageUrl(url);
        setPdfURL(null);
        setErrorMessage(null);
        console.log("画像のURLを生成しました:", url);
        
        // コンポーネントのアンマウント時にURLをクリーンアップ
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (error) {
        console.error("画像のURL生成中にエラーが発生しました:", error);
        setErrorMessage("画像ファイルの処理中にエラーが発生しました。別のファイルをお試しください。");
      }
    } else {
      setImageUrl(null);
    }
  }, [imageFile]);

  // ファイルアップロードハンドラー
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setErrorMessage(null);
    
    // ファイルタイプの確認
    if (file.type === 'application/pdf') {
      setPdfFile(file);
      setImageFile(null);
    } else if (file.type.startsWith('image/')) {
      setImageFile(file);
      setPdfFile(null);
    } else {
      setErrorMessage(`サポートされていないファイル形式です (${file.type || '不明'}). PDFまたは画像ファイル (JPEG, PNG, GIF) をアップロードしてください。`);
    }
  };
  
  // テキスト選択の検出
  useEffect(() => {
    const checkSelection = () => {
      // 既にゾーンセレクターが表示されている場合は処理をスキップ
      if (showZoneSelector) return;
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
        // ドロップダウンメニューがアクティブでない場合のみ選択状態をクリア
        const isMenuActive = document.querySelector('.zone-selector-wrapper');
        if (!isMenuActive) {
          setSelectedText(null);
          setShowCopyButton(false);
        }
        return;
      }
      
      // 選択範囲を取得
      const range = selection.getRangeAt(0);
      const text = selection.toString().trim();
      
      if (text) {
        // PDFビューア内での選択かを確認
        let isInsideViewer = false;
        if (viewerRef.current) {
          const viewerRect = viewerRef.current.getBoundingClientRect();
          const rangeRect = range.getBoundingClientRect();
          isInsideViewer = (
            rangeRect.top >= viewerRect.top &&
            rangeRect.bottom <= viewerRect.bottom &&
            rangeRect.left >= viewerRect.left &&
            rangeRect.right <= viewerRect.right
          );
        }
        
        if (isInsideViewer) {
          const rangeRect = range.getBoundingClientRect();
          if (viewerRef.current) {
            const viewerRect = viewerRef.current.getBoundingClientRect();
            
            // ボタン位置を計算（選択範囲の右上）
            setCopyPosition({
              x: rangeRect.right - viewerRect.left,
              y: rangeRect.top - viewerRect.top
            });
          }
          
          setSelectedText(text);
          setShowCopyButton(true);
        }
      } else {
        setSelectedText(null);
        setShowCopyButton(false);
      }
    };
    
    // イベントリスナーを設定
    document.addEventListener('selectionchange', checkSelection);
    document.addEventListener('mouseup', checkSelection);
    
    return () => {
      document.removeEventListener('selectionchange', checkSelection);
      document.removeEventListener('mouseup', checkSelection);
    };
  }, []);
  
  // 選択したテキストをキャンバスに追加
  const handleCopyToCanvas = () => {
    if (selectedText && addTextBox) {
      // キャンバスの中央付近にテキストを追加（座標はUI設計に応じて調整）
      addTextBox(selectedText, 50, 100);
      
      // ボタンを非表示に
      setShowCopyButton(false);
      setSelectedText(null);
      
      // 選択をクリア
      window.getSelection()?.removeAllRanges();
    }
  };
  
  // ゾーンセレクターを表示
  const handleShowZoneSelector = () => {
    if (selectedText) {
      // ゾーンセレクターを表示する前に、コピーボタンを非表示にする
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
    // 選択をクリア
    window.getSelection()?.removeAllRanges();
    setSelectedText(null);
  };

  // パスワード入力のハンドラー
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  const handlePasswordSubmit = async (password: string) => {
    const error = await openEncryptedPdf(password);
    if (error) {
      setPasswordError(error);
    } else {
      setPasswordError(null);
    }
  };

  const handlePasswordCancel = () => {
    // パスワード入力をキャンセルした場合、PDFを解放してnullに戻す
    setPdfFile(null);
    setShowPasswordPrompt(false);
    setIsEncrypted(false);
  };

  return (
    <section className="w-full h-full bg-white overflow-hidden flex flex-col" ref={viewerRef}>
      {/* パスワード入力ダイアログ */}
      <PasswordPromptDialog 
        isOpen={showPasswordPrompt}
        onSubmit={handlePasswordSubmit}
        onCancel={handlePasswordCancel}
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
      
      {/* ゾーンセレクター - テキスト選択されて「エリアを選択」がクリックされたときに表示 */}
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
      
      {/* Empty state */}
      {!pdfURL && !imageUrl && !errorMessage && (
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
            PDFファイルをアップロードして、テキストを抽出し、ビジネス分析に活用しましょう。
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
      
      {/* PDF viewer - iframeの代わりにオブジェクトタグを使用 */}
      {pdfURL && (
        <div className="flex-grow h-full w-full relative">
          <object 
            data={pdfURL} 
            type="application/pdf"
            className="w-full h-full border-0"
          >
            <div className="w-full h-full flex items-center justify-center flex-col p-4 bg-gray-100">
              <p className="mb-4 text-center">PDFを直接表示できませんでした。</p>
              <Button
                variant="default"
                onClick={() => window.open(pdfURL, '_blank')}
                className="bg-primary text-white"
              >
                PDFをダウンロード/別窓で開く
              </Button>
            </div>
          </object>
          <Button
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 bg-white text-gray-700 border border-gray-300"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp className="mr-2 h-4 w-4" />
            ファイルを変更
          </Button>
        </div>
      )}
      
      {/* Image viewer */}
      {imageUrl && (
        <div className="flex-grow h-full overflow-auto p-4 flex flex-col items-center justify-center">
          <div className="relative max-w-full">
            <img 
              src={imageUrl} 
              alt="アップロードされた画像" 
              className="max-w-full max-h-[calc(100vh-8rem)] rounded shadow-lg"
              // 画像からテキスト選択できるようにする
              style={{ userSelect: 'text' }}
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

export default BlobURLPDFViewer;
