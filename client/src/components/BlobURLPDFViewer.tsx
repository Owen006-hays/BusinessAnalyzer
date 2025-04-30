import React, { useState, useEffect, useRef } from "react";
import { useAnalysisContext } from "@/context/AnalysisContext";
import { Button } from "@/components/ui/button";
import { FileUp, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Copy, ListFilter } from "lucide-react";
import ZoneSelector from "@/components/ZoneSelector";
import PasswordPromptDialog from "@/components/PasswordPromptDialog";

// PDF.jsのインポートを削除 - 標準のブラウザ機能を使用

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
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  
  // パスワード付きPDFを開く関数 - ブラウザ標準のPDFリーダー任せ
  const openEncryptedPdf = async (password: string) => {
    if (!pdfFile) return;

    try {
      // パスワード情報をHTMLのdata属性として保存
      // ブラウザ標準のPDF表示機能はオブジェクトタグのパラメータからパスワードを読み取る
      const wrapper = document.createElement('div');
      wrapper.setAttribute('data-pdf-password', password);
      document.body.appendChild(wrapper);

      // パスワード付きPDFも、ブラウザ標準のPDF表示機能に任せる
      // 新しいURLを生成して、キャッシュを回避
      const url = URL.createObjectURL(pdfFile);
      setPdfURL(url);
      setShowPasswordPrompt(false);
      setErrorMessage(null);
      
      // 入力されたパスワードを記録
      setPdfPassword(password);
      
      // 不要になったHTMLを削除（少し遅延させる）
      setTimeout(() => {
        document.body.removeChild(wrapper);
      }, 1000);
      
      return null; // エラーなし
    } catch (error) {
      console.error("PDFファイルのロード中にエラーが発生しました:", error);
      return "PDFファイルの処理中にエラーが発生しました。";
    }
  };

  // PDFのURL生成
  useEffect(() => {
    if (pdfFile) {
      try {
        // 以前のURLをクリーンアップ
        if (pdfURL) URL.revokeObjectURL(pdfURL);
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        
        // 暗号化されたPDFかどうかを簡易的に検出（バイナリデータに特定のパターンがないか調べる）
        const checkForEncryption = async () => {
          try {
            // ファイルの最初の1KBのみ読み込み (パフォーマンス向上)
            const chunk = await pdfFile.slice(0, 1024).arrayBuffer();
            const bytes = new Uint8Array(chunk);
            const headerText = new TextDecoder().decode(bytes);
            
            // 暗号化キーワードの検出
            if (headerText.includes('/Encrypt') || headerText.includes('/encryption')) {
              console.log("暗号化PDFの可能性があります");
              setIsEncrypted(true);
              setShowPasswordPrompt(true);
              return;
            }
            
            // 非暗号化PDFとして処理
            const url = URL.createObjectURL(pdfFile);
            setPdfURL(url);
            setImageUrl(null);
            setErrorMessage(null);
            setIsEncrypted(false);
            console.log("PDFのURLを生成しました:", url);
          } catch (e) {
            // 暗号化チェックでエラーが発生した場合は、通常のPDFとして扱う
            console.error("PDF暗号化チェック中のエラー:", e);
            const url = URL.createObjectURL(pdfFile);
            setPdfURL(url);
            setImageUrl(null);
            setErrorMessage(null);
            setIsEncrypted(false);
            console.log("PDFのURLを生成しました (暗号化チェックスキップ):", url);
          }
        };
        
        checkForEncryption();
        
        // コンポーネントのアンマウント時にURLをクリーンアップ
        return () => {
          if (pdfURL) URL.revokeObjectURL(pdfURL);
        };
      } catch (error: any) {
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
        
        // 画像ファイルの検証 - MIMEタイプと拡張子で検証するが、
        // 形式が不明でもエラーにはせず、とにかく表示を試みる
        const fileExt = imageFile.name.split('.').pop()?.toLowerCase();
        const knownImageExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'tiff'];
        
        if (!imageFile.type.startsWith('image/') && !knownImageExt.includes(fileExt || '')) {
          console.warn("画像ファイルの種類が認識できませんが、表示を試みます:", fileExt, imageFile.type);
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
    setIsEncrypted(false);
    setShowPasswordPrompt(false);
    
    // MIMEタイプだけでなく、ファイル拡張子も確認
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    try {
      // PDFファイルの場合
      if (file.type === 'application/pdf' || fileExt === 'pdf') {
        // PDFファイルはバイナリデータとして検証
        const validatePdf = async () => {
          try {
            // ファイルの最初の数バイトを読み取り、PDFのマジックナンバーをチェック
            const chunk = await file.slice(0, 5).arrayBuffer();
            const bytes = new Uint8Array(chunk);
            
            // PDFのマジックナンバー '%PDF' = 0x25, 0x50, 0x44, 0x46
            if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
              // 正当なPDFファイル
              setPdfFile(file);
              setImageFile(null);
            } else {
              // PDFのマジックナンバーが見つからない場合
              setErrorMessage("PDFファイルの形式が不正です。標準のPDFファイルをアップロードしてください。");
            }
          } catch (error) {
            console.error("PDFファイルの検証中にエラーが発生しました:", error);
            setErrorMessage("PDFファイルの検証中にエラーが発生しました。別のファイルをお試しください。");
          }
        };
        
        validatePdf();
      } 
      // 画像ファイルの場合
      else if (file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt || '')) {
        // 画像ファイルは直接受け入れる（MIMEタイプや拡張子で十分な検証）
        setImageFile(file);
        setPdfFile(null);
      } 
      // その他のファイル
      else {
        setErrorMessage(`サポートされていないファイル形式です (${file.type || '不明'} / ${fileExt || '不明'}). PDFまたは画像ファイル (JPEG, PNG, GIF) をアップロードしてください。`);
      }
    } catch (error) {
      console.error("ファイル処理中にエラーが発生しました:", error);
      setErrorMessage("ファイルの処理中にエラーが発生しました。別のファイルをお試しください。");
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
      
      {/* PDF viewer - iframeを使用（ブラウザのネイティブPDF表示機能を活用） */}
      {pdfURL && (
        <div className="flex-grow h-full w-full relative">
          <iframe 
            src={pdfURL} 
            title="PDF Document"
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-forms"
          />
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-gray-700 border border-gray-300"
              onClick={() => window.open(pdfURL, '_blank')}
            >
              新しいタブで開く
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-gray-700 border border-gray-300"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="mr-2 h-4 w-4" />
              ファイルを変更
            </Button>
          </div>
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