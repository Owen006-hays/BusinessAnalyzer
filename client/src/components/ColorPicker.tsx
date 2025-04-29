import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface ColorPickerProps {
  onSelectColor: (color: string) => void;
  onClose: () => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ onSelectColor, onClose }) => {
  const colorPickerRef = useRef<HTMLDivElement>(null);
  
  // Colors available for selection
  const colors = [
    { name: "white", bg: "bg-white border-gray-300", hover: "hover:bg-gray-100" },
    { name: "blue", bg: "bg-blue-100 border-blue-200", hover: "hover:bg-blue-200" },
    { name: "green", bg: "bg-green-100 border-green-200", hover: "hover:bg-green-200" },
    { name: "yellow", bg: "bg-yellow-100 border-yellow-200", hover: "hover:bg-yellow-200" },
    { name: "red", bg: "bg-red-100 border-red-200", hover: "hover:bg-red-200" },
    { name: "purple", bg: "bg-purple-100 border-purple-200", hover: "hover:bg-purple-200" },
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

  return (
    <Card 
      ref={colorPickerRef} 
      className="absolute -top-2 -right-2 z-50 p-2 shadow-lg transform translate-y-[-100%]"
    >
      <div className="flex space-x-1">
        {colors.map((color) => (
          <button
            key={color.name}
            className={`w-6 h-6 rounded-full border ${color.bg} ${color.hover} transition-colors`}
            onClick={() => onSelectColor(color.name)}
            aria-label={`Select ${color.name} color`}
          />
        ))}
      </div>
    </Card>
  );
};

export default ColorPicker;
