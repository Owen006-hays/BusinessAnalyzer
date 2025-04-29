import React from "react";
import { useAnalysisContext } from "@/context/AnalysisContext";
import { Button } from "@/components/ui/button";
import { CopyCheck, X } from "lucide-react";

interface ZoneSelectorProps {
  text: string;
  onClose: () => void;
}

const ZoneSelector: React.FC<ZoneSelectorProps> = ({ text, onClose }) => {
  const { 
    currentTemplate, 
    setCurrentTemplate, 
    getZonesForTemplate,
    addTextBoxToZone
  } = useAnalysisContext();
  
  // テンプレートが選択されていなければ、デフォルトでSWOTを設定
  React.useEffect(() => {
    if (!currentTemplate) {
      setCurrentTemplate("swot");
    }
  }, [currentTemplate, setCurrentTemplate]);
  
  // テンプレート選択の処理
  const handleTemplateChange = (template: string) => {
    setCurrentTemplate(template);
  };
  
  // ゾーンにテキストを追加
  const handleAddToZone = (zone: string) => {
    addTextBoxToZone(text, zone);
    onClose();
  };
  
  // 現在のテンプレートで利用可能なゾーンを取得
  const availableZones = getZonesForTemplate(currentTemplate);
  
  // テンプレート名を日本語に変換
  const getTemplateLabel = (template: string): string => {
    switch (template) {
      case "swot": return "SWOT分析";
      case "4p": return "4P分析";
      case "3c": return "3C分析";
      case "pest": return "PEST分析";
      default: return template;
    }
  };
  
  // ゾーン名を日本語に変換
  const getZoneLabel = (zone: string): string => {
    switch (zone) {
      // SWOT
      case "strengths": return "強み (Strengths)";
      case "weaknesses": return "弱み (Weaknesses)";
      case "opportunities": return "機会 (Opportunities)";
      case "threats": return "脅威 (Threats)";
      
      // 4P
      case "product": return "製品 (Product)";
      case "price": return "価格 (Price)";
      case "place": return "流通 (Place)";
      case "promotion": return "販促 (Promotion)";
      
      // 3C
      case "company": return "自社 (Company)";
      case "customer": return "顧客 (Customer)";
      case "competitor": return "競合 (Competitor)";
      
      // PEST
      case "political": return "政治的要因 (Political)";
      case "economic": return "経済的要因 (Economic)";
      case "social": return "社会的要因 (Social)";
      case "technological": return "技術的要因 (Technological)";
      
      default: return zone;
    }
  };
  
  // ゾーンに対応する背景色を取得
  const getZoneColorClass = (zone: string): string => {
    switch (zone) {
      // SWOT
      case "strengths": return "bg-blue-100 border-blue-300";
      case "weaknesses": return "bg-red-100 border-red-300";
      case "opportunities": return "bg-green-100 border-green-300";
      case "threats": return "bg-yellow-100 border-yellow-300";
      
      // 4P
      case "product": return "bg-indigo-100 border-indigo-300";
      case "price": return "bg-purple-100 border-purple-300";
      case "place": return "bg-pink-100 border-pink-300";
      case "promotion": return "bg-teal-100 border-teal-300";
      
      // 3C
      case "company": return "bg-blue-100 border-blue-300";
      case "customer": return "bg-green-100 border-green-300";
      case "competitor": return "bg-yellow-100 border-yellow-300";
      
      // PEST
      case "political": return "bg-purple-100 border-purple-300";
      case "economic": return "bg-blue-100 border-blue-300";
      case "social": return "bg-green-100 border-green-300";
      case "technological": return "bg-teal-100 border-teal-300";
      
      default: return "bg-gray-100 border-gray-300";
    }
  };
  
  return (
    <div className="zone-selector-wrapper absolute z-50 bg-white shadow-xl rounded-lg p-4 w-80 border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">テキストを追加</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">選択したテキスト:</p>
        <div className="bg-gray-50 p-2 rounded border border-gray-200 text-sm max-h-20 overflow-auto">
          {text}
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">フレームワークを選択:</p>
        <div className="grid grid-cols-2 gap-2">
          {["swot", "4p", "3c", "pest"].map((template) => (
            <Button
              key={template}
              variant={currentTemplate === template ? "default" : "outline"}
              size="sm"
              className={`${currentTemplate === template ? "bg-primary text-white font-medium shadow-md" : "border-gray-300 hover:bg-gray-50"} transition-all duration-200`}
              onClick={() => handleTemplateChange(template)}
            >
              {getTemplateLabel(template)}
            </Button>
          ))}
        </div>
      </div>
      
      <div>
        <p className="text-sm text-gray-600 mb-2">追加先を選択:</p>
        <div className="space-y-2">
          {availableZones.map((zone) => (
            <Button
              key={zone}
              variant="outline"
              className={`w-full justify-start hover:bg-opacity-90 hover:shadow-sm hover:transform hover:scale-[1.01] transition-all duration-150 ${getZoneColorClass(zone)}`}
              onClick={() => handleAddToZone(zone)}
            >
              <CopyCheck className="mr-2 h-4 w-4" />
              {getZoneLabel(zone)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ZoneSelector;