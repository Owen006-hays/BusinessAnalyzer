import { useRef, useEffect } from "react";
import { useDrop } from "react-dnd";
import { useAnalysisContext } from "@/context/AnalysisContext";
import TextBox from "@/components/TextBox";
import { Button } from "@/components/ui/button";
import { FileUp, LayoutTemplate } from "lucide-react";
import TemplateSelector from "@/components/TemplateSelector";
import html2canvas from "html2canvas";

const AnalysisCanvas: React.FC = () => {
  const { 
    textBoxes, 
    addTextBox, 
    pdfFile, 
    currentTemplate,
    setCurrentTemplate,
    canvasRef,
    setPdfFile
  } = useAnalysisContext();
  
  const uploadRef = useRef<HTMLInputElement>(null);
  
  const [{ isOver }, drop] = useDrop({
    accept: "TEXT_SELECTION",
    drop: (item: { text: string; clientOffset: { x: number; y: number } }) => {
      const canvas = canvasRef.current;
      const canvasRect = canvas?.getBoundingClientRect();
      
      if (canvas && canvasRect) {
        // Calculate position and ensure it's within canvas bounds
        let x = item.clientOffset.x - canvasRect.left;
        let y = item.clientOffset.y - canvasRect.top;
        
        // Keep box within the canvas bounds with 10px margin
        x = Math.max(10, Math.min(x, canvasRect.width - 210));
        y = Math.max(10, Math.min(y, canvasRect.height - 110));
        
        addTextBox(item.text, x, y);
      }
      
      return undefined;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    }
  };
  
  const handleShowTemplates = () => {
    setCurrentTemplate("swot"); // Start with SWOT as default
  };
  
  const renderTextBoxes = () => {
    return textBoxes.map((box) => (
      <TextBox key={box.id} box={box} />
    ));
  };
  
  const renderTemplate = () => {
    if (!currentTemplate) {
      return null;
    }
    
    return <TemplateSelector template={currentTemplate} />;
  };

  return (
    <section 
      className={`md:w-1/2 w-full h-full bg-white overflow-auto relative p-4 border-r border-secondary ${
        isOver ? "bg-blue-50" : ""
      }`}
      ref={drop}
    >
      <div 
        ref={canvasRef} 
        className="h-full relative"
        id="analysis-canvas-content"
      >
        {/* Empty state - shown when no PDF is loaded */}
        {!pdfFile && (
          <div className="h-full flex flex-col items-center justify-center text-secondary-dark">
            <div className="flex flex-col items-center w-64 h-auto mb-6 rounded shadow-md">
              {/* Business analysis diagram icons/illustrations */}
              <svg className="w-64 h-48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="3" width="20" height="18" rx="2" stroke="#4285F4" strokeWidth="2"/>
                <line x1="7" y1="7" x2="17" y2="7" stroke="#4285F4" strokeWidth="2"/>
                <line x1="7" y1="12" x2="17" y2="12" stroke="#4285F4" strokeWidth="2"/>
                <line x1="7" y1="17" x2="17" y2="17" stroke="#4285F4" strokeWidth="2"/>
              </svg>
            </div>
            <h2 className="text-xl font-medium mb-2">分析を始めましょう</h2>
            <p className="text-center max-w-md mb-4">
              PDFをアップロードして、テキストを選択・ドラッグして分析エリアに配置してください。
            </p>
            <div className="flex space-x-4">
              <Button
                className="bg-primary hover:bg-primary-light text-white"
                onClick={() => uploadRef.current?.click()}
              >
                <FileUp className="mr-2 h-5 w-5" />
                PDFをアップロード
              </Button>
              <input
                ref={uploadRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
              
              <Button
                variant="outline"
                className="bg-secondary-light hover:bg-secondary text-secondary-dark"
                onClick={handleShowTemplates}
              >
                <LayoutTemplate className="mr-2 h-5 w-5" />
                テンプレートを使用
              </Button>
            </div>
          </div>
        )}

        {/* Analysis content - shown when working on analysis */}
        {(pdfFile || currentTemplate) && (
          <>
            {renderTemplate()}
            <div className="relative h-full" id="free-canvas">
              {renderTextBoxes()}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default AnalysisCanvas;
