import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Plus, Save, FileDown, LayoutTemplate } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAnalysisContext } from "@/context/AnalysisContext";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  onPdfUpload: (file: File) => void;
}

const Header: React.FC<HeaderProps> = ({ onPdfUpload }) => {
  const { 
    addTextBox, 
    setCurrentTemplate, 
    setAnalysisName,
    saveAnalysis, 
    exportAsImage,
    analysisName
  } = useAnalysisContext();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      onPdfUpload(file);
    } else if (file) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
    }
  };

  const handleAddTextBox = () => {
    addTextBox("新しいテキスト", 100, 100);
  };

  const handleSaveAnalysis = async () => {
    try {
      await saveAnalysis();
      toast({
        title: "Analysis saved",
        description: "Your analysis has been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error saving analysis",
        description: "An error occurred while saving your analysis",
        variant: "destructive",
      });
    }
  };

  const handleExportImage = async () => {
    try {
      setIsExporting(true);
      await exportAsImage();
      toast({
        title: "Export successful",
        description: "Analysis has been exported as an image",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export analysis as image",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="bg-white border-b border-secondary px-4 py-2 flex flex-col md:flex-row items-center justify-between shadow-sm">
      <div className="flex flex-col md:flex-row items-center mb-2 md:mb-0 w-full md:w-auto">
        <h1 className="text-xl font-semibold text-gray-900 mr-4 mb-2 md:mb-0">ビジネス分析支援アプリ</h1>
        
        <div className="flex space-x-2 w-full md:w-auto justify-center">
          {/* File upload button */}
          <Button
            variant="default"
            size="sm"
            className="bg-primary hover:bg-primary-light"
            asChild
          >
            <label>
              <Upload className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">PDFをアップロード</span>
              <span className="inline md:hidden">PDF</span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </Button>
          
          {/* New text box button */}
          <Button
            variant="outline"
            size="sm"
            className="bg-secondary-light hover:bg-secondary text-secondary-dark"
            onClick={handleAddTextBox}
          >
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden md:inline">テキストボックスを追加</span>
            <span className="inline md:hidden">テキスト追加</span>
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 w-full md:w-auto justify-center">
        {/* Template dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="bg-secondary-light hover:bg-secondary text-secondary-dark">
              <LayoutTemplate className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">テンプレート</span>
              <span className="inline md:hidden">テンプレ</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setCurrentTemplate("swot")}>
              SWOT分析
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCurrentTemplate("4p")}>
              4P分析
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCurrentTemplate("3c")}>
              3C分析
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCurrentTemplate("pest")}>
              PEST分析
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCurrentTemplate(null)}>
              フリーキャンバス
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Save/Export dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="bg-secondary-light hover:bg-secondary text-secondary-dark">
              <Save className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">保存/エクスポート</span>
              <span className="inline md:hidden">保存</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleSaveAnalysis}>
              分析を保存
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportImage} disabled={isExporting}>
              画像としてエクスポート
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
