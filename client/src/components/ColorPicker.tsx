import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAnalysisContext } from "@/context/AnalysisContext";

interface ColorPickerProps {
  onSelectColor: (color: string, zone?: string) => void;
  onClose: () => void;
  selectedText: string;
  position?: { x: number, y: number };
}

const ColorPicker: React.FC<ColorPickerProps> = ({ 
  onSelectColor, 
  onClose, 
  selectedText,
  position 
}) => {
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const { currentTemplate, getZonesForTemplate } = useAnalysisContext();
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  
  // 色とゾーンのマッピング
  const colorZoneMap: Record<string, { template: string, zones: string[] }> = {
    // SWOT
    "blue": { template: "swot", zones: ["strengths"] },
    "red": { template: "swot", zones: ["weaknesses"] },
    "green": { template: "swot", zones: ["opportunities"] },
    "yellow": { template: "swot", zones: ["threats"] },
    
    // 3C
    "lightblue": { template: "3c", zones: ["company"] },
    "lightgreen": { template: "3c", zones: ["customer"] },
    "lightyellow": { template: "3c", zones: ["competitor"] },
    
    // 4P
    "purple": { template: "4p", zones: ["product", "price"] },
    "lightpurple": { template: "4p", zones: ["place", "promotion"] },
    
    // PEST
    "darkblue": { template: "pest", zones: ["political"] },
    "teal": { template: "pest", zones: ["economic"] },
    "lime": { template: "pest", zones: ["social"] },
    "cyan": { template: "pest", zones: ["technological"] },
  };
  
  // Colors available for selection with framework associations
  const colors = [
    { 
      name: "blue", 
      bg: "bg-blue-100 border-blue-300", 
      hover: "hover:bg-blue-200",
      tooltip: "強み (SWOT)",
      zone: "strengths"
    },
    { 
      name: "red", 
      bg: "bg-red-100 border-red-300", 
      hover: "hover:bg-red-200",
      tooltip: "弱み (SWOT)",
      zone: "weaknesses"
    },
    { 
      name: "green", 
      bg: "bg-green-100 border-green-300", 
      hover: "hover:bg-green-200",
      tooltip: "機会 (SWOT)",
      zone: "opportunities"
    },
    { 
      name: "yellow", 
      bg: "bg-yellow-100 border-yellow-300", 
      hover: "hover:bg-yellow-200",
      tooltip: "脅威 (SWOT)",
      zone: "threats"
    },
    { 
      name: "lightblue", 
      bg: "bg-sky-100 border-sky-300", 
      hover: "hover:bg-sky-200",
      tooltip: "自社 (3C)",
      zone: "company"
    },
    { 
      name: "lightgreen", 
      bg: "bg-emerald-100 border-emerald-300", 
      hover: "hover:bg-emerald-200",
      tooltip: "顧客 (3C)",
      zone: "customer"
    },
    { 
      name: "lightyellow", 
      bg: "bg-amber-100 border-amber-300", 
      hover: "hover:bg-amber-200",
      tooltip: "競合 (3C)",
      zone: "competitor"
    },
    { 
      name: "purple", 
      bg: "bg-purple-100 border-purple-300", 
      hover: "hover:bg-purple-200",
      tooltip: "製品/価格 (4P)",
      zone: "product"
    },
    { 
      name: "lightpurple", 
      bg: "bg-fuchsia-100 border-fuchsia-300", 
      hover: "hover:bg-fuchsia-200",
      tooltip: "流通/広告 (4P)",
      zone: "place"
    },
  ];
  
  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleColorSelect = (colorName: string, zone: string) => {
    onSelectColor(colorName, zone);
  };

  return (
    <Card 
      ref={colorPickerRef} 
      className="color-picker-card absolute z-50 p-3 shadow-lg bg-white border border-gray-200 rounded-lg"
      style={{
        top: position ? `${position.y - 40}px` : '-40px',
        left: position ? `${position.x - 100}px` : '0',
        maxWidth: '90vw',
      }}
    >
      <h3 className="text-sm font-medium mb-2">テキストの分類先を選択</h3>
      <div className="text-xs text-gray-500 mb-2 max-h-12 overflow-auto">
        <p className="truncate">{selectedText.length > 50 ? selectedText.substring(0, 50) + '...' : selectedText}</p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        <TooltipProvider>
          {colors.map((color) => (
            <Tooltip key={color.name}>
              <TooltipTrigger asChild>
                <button
                  className={`w-8 h-8 rounded-full border ${color.bg} ${color.hover} transition-all hover:scale-110 active:scale-95`}
                  onClick={() => handleColorSelect(color.name, color.zone)}
                  aria-label={color.tooltip}
                />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{color.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </Card>
  );
};

export default ColorPicker;
