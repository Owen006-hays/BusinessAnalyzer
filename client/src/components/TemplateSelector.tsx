import { useEffect } from "react";
import { useAnalysisContext } from "@/context/AnalysisContext";

interface TemplateSelectorProps {
  template: string | null;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ template }) => {
  const { textBoxes, setTextBoxesByZone } = useAnalysisContext();

  useEffect(() => {
    // Organize text boxes into zones when template changes
    if (template) {
      setTextBoxesByZone(template);
    }
  }, [template]);

  if (!template) return null;

  // Render the appropriate template
  switch (template) {
    case "swot":
      return (
        <div className="template-grid h-full grid grid-cols-1 md:grid-cols-2 grid-rows-auto md:grid-rows-2 gap-4 pointer-events-none">
          <div className="bg-blue-50 border border-blue-200 rounded p-3 flex flex-col min-h-[100px]">
            <h3 className="text-blue-700 font-medium text-center border-b border-blue-200 pb-1 mb-2">
              強み (Strengths)
            </h3>
            <div className="flex-grow template-dropzone pointer-events-auto" data-zone="strengths"></div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded p-3 flex flex-col min-h-[100px]">
            <h3 className="text-red-700 font-medium text-center border-b border-red-200 pb-1 mb-2">
              弱み (Weaknesses)
            </h3>
            <div className="flex-grow template-dropzone pointer-events-auto" data-zone="weaknesses"></div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded p-3 flex flex-col min-h-[100px]">
            <h3 className="text-green-700 font-medium text-center border-b border-green-200 pb-1 mb-2">
              機会 (Opportunities)
            </h3>
            <div className="flex-grow template-dropzone pointer-events-auto" data-zone="opportunities"></div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 flex flex-col min-h-[100px]">
            <h3 className="text-yellow-700 font-medium text-center border-b border-yellow-200 pb-1 mb-2">
              脅威 (Threats)
            </h3>
            <div className="flex-grow template-dropzone pointer-events-auto" data-zone="threats"></div>
          </div>
        </div>
      );

    case "4p":
      return (
        <div className="template-grid h-full grid grid-cols-1 md:grid-cols-2 grid-rows-auto md:grid-rows-2 gap-4 pointer-events-none">
          <div className="bg-indigo-50 border border-indigo-200 rounded p-3 flex flex-col min-h-[100px]">
            <h3 className="text-indigo-700 font-medium text-center border-b border-indigo-200 pb-1 mb-2">
              製品 (Product)
            </h3>
            <div className="flex-grow template-dropzone pointer-events-auto" data-zone="product"></div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded p-3 flex flex-col min-h-[100px]">
            <h3 className="text-purple-700 font-medium text-center border-b border-purple-200 pb-1 mb-2">
              価格 (Price)
            </h3>
            <div className="flex-grow template-dropzone pointer-events-auto" data-zone="price"></div>
          </div>
          <div className="bg-pink-50 border border-pink-200 rounded p-3 flex flex-col min-h-[100px]">
            <h3 className="text-pink-700 font-medium text-center border-b border-pink-200 pb-1 mb-2">
              流通 (Place)
            </h3>
            <div className="flex-grow template-dropzone pointer-events-auto" data-zone="place"></div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded p-3 flex flex-col min-h-[100px]">
            <h3 className="text-teal-700 font-medium text-center border-b border-teal-200 pb-1 mb-2">
              販促 (Promotion)
            </h3>
            <div className="flex-grow template-dropzone pointer-events-auto" data-zone="promotion"></div>
          </div>
        </div>
      );

    case "3c":
      return (
        <div className="template-grid h-full grid grid-cols-1 md:grid-cols-3 grid-rows-auto md:grid-rows-1 gap-4 pointer-events-none">
          <div className="bg-blue-50 border border-blue-200 rounded p-3 flex flex-col min-h-[100px]">
            <h3 className="text-blue-700 font-medium text-center border-b border-blue-200 pb-1 mb-2">
              自社 (Company)
            </h3>
            <div className="flex-grow template-dropzone pointer-events-auto" data-zone="company"></div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded p-3 flex flex-col min-h-[100px]">
            <h3 className="text-green-700 font-medium text-center border-b border-green-200 pb-1 mb-2">
              顧客 (Customer)
            </h3>
            <div className="flex-grow template-dropzone pointer-events-auto" data-zone="customer"></div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 flex flex-col min-h-[100px]">
            <h3 className="text-yellow-700 font-medium text-center border-b border-yellow-200 pb-1 mb-2">
              競合 (Competitor)
            </h3>
            <div className="flex-grow template-dropzone pointer-events-auto" data-zone="competitor"></div>
          </div>
        </div>
      );

    case "pest":
      return (
        <div className="template-grid h-full grid grid-cols-1 md:grid-cols-2 grid-rows-auto md:grid-rows-2 gap-4 pointer-events-none">
          <div className="bg-purple-50 border border-purple-200 rounded p-3 flex flex-col min-h-[100px]">
            <h3 className="text-purple-700 font-medium text-center border-b border-purple-200 pb-1 mb-2">
              政治的要因 (Political)
            </h3>
            <div className="flex-grow template-dropzone pointer-events-auto" data-zone="political"></div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded p-3 flex flex-col min-h-[100px]">
            <h3 className="text-blue-700 font-medium text-center border-b border-blue-200 pb-1 mb-2">
              経済的要因 (Economic)
            </h3>
            <div className="flex-grow template-dropzone pointer-events-auto" data-zone="economic"></div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded p-3 flex flex-col min-h-[100px]">
            <h3 className="text-green-700 font-medium text-center border-b border-green-200 pb-1 mb-2">
              社会的要因 (Social)
            </h3>
            <div className="flex-grow template-dropzone pointer-events-auto" data-zone="social"></div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded p-3 flex flex-col min-h-[100px]">
            <h3 className="text-teal-700 font-medium text-center border-b border-teal-200 pb-1 mb-2">
              技術的要因 (Technological)
            </h3>
            <div className="flex-grow template-dropzone pointer-events-auto" data-zone="technological"></div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default TemplateSelector;
