import { useState, useEffect } from "react";
import Header from "@/components/Header";
import AnalysisCanvas from "@/components/AnalysisCanvas";
import BlobURLPDFViewer from "@/components/BlobURLPDFViewer";
import InstructionsModal from "@/components/InstructionsModal";
import { useAnalysisContext } from "@/context/AnalysisContext";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const Home: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(true);
  const { pdfFile, setPdfFile, setImageFile } = useAnalysisContext();
  
  // 初期分割比率と現在の分割比率の状態
  const [panelSizes, setPanelSizes] = useState({
    canvas: 50, // キャンバス側の初期サイズ（50%）
    viewer: 50, // ビューワー側の初期サイズ（50%）
  });
  
  // パネルサイズが変更されたときのハンドラー
  const handleResizeEnd = (sizes: number[]) => {
    setPanelSizes({
      canvas: sizes[0],
      viewer: sizes[1],
    });
    
    // LocalStorageに保存して次回も同じ比率で表示
    localStorage.setItem('panelSizes', JSON.stringify({
      canvas: sizes[0],
      viewer: sizes[1],
    }));
  };
  
  useEffect(() => {
    // 保存された分割比率を読み込む
    const savedSizes = localStorage.getItem('panelSizes');
    if (savedSizes) {
      try {
        const sizes = JSON.parse(savedSizes);
        setPanelSizes(sizes);
      } catch (error) {
        console.error('Failed to parse saved panel sizes:', error);
      }
    }
    
    // 初回訪問チェック
    const hasVisited = localStorage.getItem("hasVisitedBefore");
    if (hasVisited) {
      setShowInstructions(false);
    } else {
      localStorage.setItem("hasVisitedBefore", "true");
    }
  }, []);

  const handlePdfUpload = (file: File) => {
    setPdfFile(file);
  };

  const handleImageDisplay = (file: File) => {
    // 画像ファイルをセット
    setImageFile(file);
    // PDFファイルをクリア（画像とPDFは同時に表示しない）
    setPdfFile(null);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen bg-gray-100">
        <Header onPdfUpload={handlePdfUpload} onImageDisplay={handleImageDisplay} />
        
        <main className="flex-1 overflow-hidden">
          {/* モバイル表示時は縦に積み重ねる */}
          <div className="md:hidden flex flex-col h-full">
            <div className="h-1/2 overflow-auto border-b border-gray-200">
              <AnalysisCanvas />
            </div>
            <div className="h-1/2 overflow-auto">
              <BlobURLPDFViewer />
            </div>
          </div>
          
          {/* デスクトップ表示時はリサイズ可能なパネルを使用 */}
          <div className="hidden md:block h-full">
            <ResizablePanelGroup
              direction="horizontal"
              className="h-full"
              onLayout={handleResizeEnd}
            >
              <ResizablePanel 
                defaultSize={panelSizes.canvas}
                minSize={20} // 最小20%
                className="bg-white"
              >
                <AnalysisCanvas />
              </ResizablePanel>
              
              <ResizableHandle className="w-2 bg-gray-200 hover:bg-primary hover:w-2 transition-all group">
                <div className="absolute h-12 w-4 top-1/2 -translate-y-1/2 cursor-col-resize bg-gray-300 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:shadow-md group-hover:scale-110 transition-all">
                  <div className="h-6 w-0.5 bg-white rounded-full mx-0.5"></div>
                  <div className="h-6 w-0.5 bg-white rounded-full mx-0.5"></div>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 left-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-70 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                  ドラッグして画面比率を変更
                </div>
              </ResizableHandle>
              
              <ResizablePanel 
                defaultSize={panelSizes.viewer} 
                minSize={20} // 最小20%
              >
                <BlobURLPDFViewer />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </main>

        {showInstructions && (
          <InstructionsModal onClose={() => setShowInstructions(false)} />
        )}
      </div>
    </DndProvider>
  );
};

export default Home;
