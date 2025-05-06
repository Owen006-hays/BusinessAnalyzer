import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Plus, Save, FileDown, LayoutTemplate, FileText, Image } from "lucide-react";
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
  onImageDisplay?: (file: File) => void; // 画像表示のためのオプションのプロパティ
}

const Header: React.FC<HeaderProps> = ({ onPdfUpload, onImageDisplay }) => {
  const { 
    addTextBox, 
    setCurrentTemplate, 
    setAnalysisName,
    saveAnalysis, 
    exportAsImage,
    exportAsPDF,
    analysisName
  } = useAnalysisContext();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // ファイルサイズチェック
    if (file.size > 50 * 1024 * 1024) { // 50MB以上
      toast({
        title: "ファイルサイズが大きすぎます",
        description: "50MB以下のファイルをアップロードしてください。",
        variant: "destructive",
      });
      return;
    }
    
    // PDFファイル処理
    if (file.type === "application/pdf") {
      console.log("ヘッダーからPDFファイルを処理:", file.name, file.size);
      onPdfUpload(file);
      return;
    }
    
    // 画像ファイル処理（JPEG、PNG、GIF）
    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
    if (validImageTypes.includes(file.type) && onImageDisplay) {
      console.log("ヘッダーから画像ファイルを処理:", file.name, file.size, file.type);
      onImageDisplay(file);
      return;
    }
    
    // サポートされていないファイル形式
    toast({
      title: "サポートされていないファイル形式",
      description: `PDFファイルまたは画像ファイル(JPEG, PNG, GIF)をアップロードしてください。選択されたファイル形式: ${file.type || "不明な形式"}`,
      variant: "destructive",
    });
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
      
      // 処理開始のトーストを表示
      toast({
        title: "エクスポート処理中...",
        description: "画像の生成中です。しばらくお待ちください。",
      });
      
      await exportAsImage();
      
      toast({
        title: "エクスポート成功",
        description: "分析を画像としてエクスポートしました",
      });
    } catch (error) {
      console.error("Error exporting as image:", error);
      toast({
        title: "エクスポート失敗",
        description: "画像としてエクスポートできませんでした",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      
      // 処理開始のトーストを表示
      toast({
        title: "エクスポート処理中...",
        description: "PDFの生成中です。しばらくお待ちください。",
      });
      
      await exportAsPDF();
      
      toast({
        title: "エクスポート成功",
        description: "分析をPDFとしてエクスポートしました",
      });
    } catch (error) {
      console.error("Error exporting as PDF:", error);
      toast({
        title: "エクスポート失敗",
        description: "PDFとしてエクスポートできませんでした",
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
              <span className="hidden md:inline">ファイルをアップロード</span>
              <span className="inline md:hidden">ファイル</span>
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/gif"
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
            <DropdownMenuItem onClick={() => setCurrentTemplate("5force")}>
              5Force分析
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCurrentTemplate("supply_chain")}>
              サプライチェーン分析
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCurrentTemplate("value_chain")}>
              バリューチェーン分析
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
              <Save className="h-4 w-4 mr-2" />
              分析を保存
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportImage} disabled={isExporting}>
              {isExporting ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  エクスポート処理中...
                </>
              ) : (
                <>
                  <Image className="h-4 w-4 mr-2" />
                  画像としてエクスポート
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting}>
              {isExporting ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  エクスポート処理中...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  PDFとしてエクスポート
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
