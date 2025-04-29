import { useEffect, useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { useAnalysisContext } from "@/context/AnalysisContext";
import { Button } from "@/components/ui/button";
import { FileUp, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";

// Import PDF.js
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

// Set the PDF.js worker path - using a more reliable CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

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
  
  // Handle PDF loading
  useEffect(() => {
    if (!pdfFile) return;
    
    const loadPdf = async () => {
      try {
        // Load the PDF file
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        setPdfDocument(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        
        // Render the first page
        renderPage(1, pdf);
      } catch (error) {
        console.error("Error loading PDF:", error);
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
      setSelectedText(selection.toString());
      
      // Get the bounding rectangle of the selection
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Add selection to the list
        setTextSelections(prev => [
          ...prev,
          { text: selection.toString(), rect }
        ]);
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
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    }
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

      {/* PDF content - shown when PDF is loaded */}
      {pdfFile && (
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
