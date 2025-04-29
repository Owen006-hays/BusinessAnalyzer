import { useState, useEffect } from "react";
import Header from "@/components/Header";
import AnalysisCanvas from "@/components/AnalysisCanvas";
import PDFViewer from "@/components/PDFViewer";
import BlobURLPDFViewer from "@/components/BlobURLPDFViewer";
import InstructionsModal from "@/components/InstructionsModal";
import { useAnalysisContext } from "@/context/AnalysisContext";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const Home: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(true);
  const { pdfFile, setPdfFile, setImageFile, analysisId } = useAnalysisContext();
  
  useEffect(() => {
    // Check if this is the first visit
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
        
        <main className="flex flex-1 overflow-hidden md:flex-row flex-col">
          <AnalysisCanvas />
          <BlobURLPDFViewer />
        </main>

        {showInstructions && (
          <InstructionsModal onClose={() => setShowInstructions(false)} />
        )}
      </div>
    </DndProvider>
  );
};

export default Home;
