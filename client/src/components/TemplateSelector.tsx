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
    
    case "5force":
      return (
        <div className="template-grid h-full flex flex-col pointer-events-none">
          <div className="flex-grow grid grid-cols-1 md:grid-cols-10 grid-rows-auto gap-4 mb-4">
            {/* 売り手の交渉力 - 左側縦長エリア */}
            <div className="md:col-span-2 flex flex-col">
              <div className="bg-amber-50 border border-amber-200 rounded p-3 flex flex-col w-full flex-grow min-h-[300px]">
                <h3 className="text-amber-700 font-medium text-center border-b border-amber-200 pb-1 mb-2">
                  売り手の交渉力
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="supplier_power"></div>
              </div>
            </div>
            
            {/* 中央エリア */}
            <div className="md:col-span-6">
              <div className="flex flex-col h-full">
                {/* 新規参入の脅威 - 上部横長エリア */}
                <div className="bg-red-50 border border-red-200 rounded p-3 flex flex-col mb-4 min-h-[120px]">
                  <h3 className="text-red-700 font-medium text-center border-b border-red-200 pb-1 mb-2">
                    新規参入の脅威
                  </h3>
                  <div className="flex-grow template-dropzone pointer-events-auto" data-zone="new_entrants"></div>
                </div>
                
                {/* 業界内の競争 - 中央エリア (スペースを拡大) */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3 flex flex-col flex-grow" style={{ minHeight: 'calc(100% - 280px)' }}>
                  <h3 className="text-blue-700 font-medium text-center border-b border-blue-200 pb-1 mb-2">
                    業界内の競争
                  </h3>
                  <div className="flex-grow template-dropzone pointer-events-auto" data-zone="industry_rivalry"></div>
                </div>
                
                {/* 代替品の脅威 - 下部横長エリア */}
                <div className="bg-green-50 border border-green-200 rounded p-3 flex flex-col mt-4 min-h-[120px]">
                  <h3 className="text-green-700 font-medium text-center border-b border-green-200 pb-1 mb-2">
                    代替品の脅威
                  </h3>
                  <div className="flex-grow template-dropzone pointer-events-auto" data-zone="substitutes"></div>
                </div>
              </div>
            </div>
            
            {/* 買い手の交渉力 - 右側縦長エリア */}
            <div className="md:col-span-2 flex flex-col">
              <div className="bg-indigo-50 border border-indigo-200 rounded p-3 flex flex-col w-full flex-grow min-h-[300px]">
                <h3 className="text-indigo-700 font-medium text-center border-b border-indigo-200 pb-1 mb-2">
                  買い手の交渉力
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="buyer_power"></div>
              </div>
            </div>
          </div>
        </div>
      );
      
    case "supply_chain":
      return (
        <div className="template-grid h-full flex flex-col pointer-events-none">
          <div className="flex flex-col h-full">
            <div className="flex-grow grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* サプライヤー */}
              <div className="bg-purple-50 border border-purple-200 rounded p-3 flex flex-col min-h-[180px]">
                <h3 className="text-purple-700 font-medium text-center border-b border-purple-200 pb-1 mb-2">
                  サプライヤー
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="suppliers"></div>
              </div>
              
              {/* 調達物流 */}
              <div className="bg-blue-50 border border-blue-200 rounded p-3 flex flex-col min-h-[180px]">
                <h3 className="text-blue-700 font-medium text-center border-b border-blue-200 pb-1 mb-2">
                  調達物流
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="inbound_logistics"></div>
              </div>
              
              {/* 製造 */}
              <div className="bg-teal-50 border border-teal-200 rounded p-3 flex flex-col min-h-[180px]">
                <h3 className="text-teal-700 font-medium text-center border-b border-teal-200 pb-1 mb-2">
                  製造
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="manufacturing"></div>
              </div>
              
              {/* 出荷物流 */}
              <div className="bg-cyan-50 border border-cyan-200 rounded p-3 flex flex-col min-h-[180px]">
                <h3 className="text-cyan-700 font-medium text-center border-b border-cyan-200 pb-1 mb-2">
                  出荷物流
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="outbound_logistics"></div>
              </div>
              
              {/* 顧客 */}
              <div className="bg-green-50 border border-green-200 rounded p-3 flex flex-col min-h-[180px]">
                <h3 className="text-green-700 font-medium text-center border-b border-green-200 pb-1 mb-2">
                  顧客
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="customers"></div>
              </div>
            </div>
            
            {/* 課題・改善点エリア */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-amber-50 border border-amber-200 rounded p-3 flex flex-col min-h-[120px]">
                <h3 className="text-amber-700 font-medium text-center border-b border-amber-200 pb-1 mb-2">
                  課題点
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="challenges"></div>
              </div>
              
              <div className="bg-rose-50 border border-rose-200 rounded p-3 flex flex-col min-h-[120px]">
                <h3 className="text-rose-700 font-medium text-center border-b border-rose-200 pb-1 mb-2">
                  改善案
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="improvements"></div>
              </div>
            </div>
          </div>
        </div>
      );
      
    case "value_chain":
      return (
        <div className="template-grid h-full flex flex-col pointer-events-none">
          {/* 主活動 */}
          <div>
            <h3 className="text-gray-700 font-medium text-center mb-2">主活動 (Primary Activities)</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded p-3 flex flex-col min-h-[140px]">
                <h3 className="text-blue-700 font-medium text-center border-b border-blue-200 pb-1 mb-2">
                  調達物流
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="vc_inbound_logistics"></div>
              </div>
              
              <div className="bg-teal-50 border border-teal-200 rounded p-3 flex flex-col min-h-[140px]">
                <h3 className="text-teal-700 font-medium text-center border-b border-teal-200 pb-1 mb-2">
                  製造業務
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="vc_operations"></div>
              </div>
              
              <div className="bg-cyan-50 border border-cyan-200 rounded p-3 flex flex-col min-h-[140px]">
                <h3 className="text-cyan-700 font-medium text-center border-b border-cyan-200 pb-1 mb-2">
                  出荷物流
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="vc_outbound_logistics"></div>
              </div>
              
              <div className="bg-indigo-50 border border-indigo-200 rounded p-3 flex flex-col min-h-[140px]">
                <h3 className="text-indigo-700 font-medium text-center border-b border-indigo-200 pb-1 mb-2">
                  マーケティング・販売
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="vc_marketing_sales"></div>
              </div>
              
              <div className="bg-violet-50 border border-violet-200 rounded p-3 flex flex-col min-h-[140px]">
                <h3 className="text-violet-700 font-medium text-center border-b border-violet-200 pb-1 mb-2">
                  サービス
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="vc_service"></div>
              </div>
            </div>
          </div>
          
          {/* 支援活動 */}
          <div>
            <h3 className="text-gray-700 font-medium text-center mb-2">支援活動 (Support Activities)</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-purple-50 border border-purple-200 rounded p-3 flex flex-col min-h-[140px]">
                <h3 className="text-purple-700 font-medium text-center border-b border-purple-200 pb-1 mb-2">
                  企業インフラ
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="vc_infrastructure"></div>
              </div>
              
              <div className="bg-pink-50 border border-pink-200 rounded p-3 flex flex-col min-h-[140px]">
                <h3 className="text-pink-700 font-medium text-center border-b border-pink-200 pb-1 mb-2">
                  人的資源管理
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="vc_hr_management"></div>
              </div>
              
              <div className="bg-rose-50 border border-rose-200 rounded p-3 flex flex-col min-h-[140px]">
                <h3 className="text-rose-700 font-medium text-center border-b border-rose-200 pb-1 mb-2">
                  技術開発
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="vc_technology"></div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded p-3 flex flex-col min-h-[140px]">
                <h3 className="text-amber-700 font-medium text-center border-b border-amber-200 pb-1 mb-2">
                  調達活動
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="vc_procurement"></div>
              </div>
            </div>
          </div>
          
          {/* 結論と改善点 */}
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded p-3 flex flex-col min-h-[120px]">
              <h3 className="text-green-700 font-medium text-center border-b border-green-200 pb-1 mb-2">
                強みとなる価値活動
              </h3>
              <div className="flex-grow template-dropzone pointer-events-auto" data-zone="vc_strengths"></div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded p-3 flex flex-col min-h-[120px]">
              <h3 className="text-red-700 font-medium text-center border-b border-red-200 pb-1 mb-2">
                改善すべき価値活動
              </h3>
              <div className="flex-grow template-dropzone pointer-events-auto" data-zone="vc_improvements"></div>
            </div>
          </div>
        </div>
      );
      
    case "vrio":
      return (
        <div className="template-grid h-full flex flex-col pointer-events-none">
          {/* リソース入力エリア */}
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded p-3 min-h-[120px]">
            <h3 className="text-blue-700 font-medium text-center border-b border-blue-200 pb-1 mb-2">
              分析対象リソース
            </h3>
            <div className="flex-grow template-dropzone pointer-events-auto" data-zone="vrio_resources"></div>
          </div>
          
          {/* VRIO評価マトリックス - 高さを調整 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <div className="flex flex-col h-full">
              <div className="bg-green-50 border border-green-200 rounded p-3 flex flex-col flex-1 mb-4">
                <h3 className="text-green-700 font-medium text-center border-b border-green-200 pb-1 mb-2">
                  価値 (Value)
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="vrio_value"></div>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded p-3 flex flex-col flex-1">
                <h3 className="text-purple-700 font-medium text-center border-b border-purple-200 pb-1 mb-2">
                  希少性 (Rarity)
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="vrio_rarity"></div>
              </div>
            </div>
            
            <div className="flex flex-col h-full">
              <div className="bg-amber-50 border border-amber-200 rounded p-3 flex flex-col flex-1 mb-4">
                <h3 className="text-amber-700 font-medium text-center border-b border-amber-200 pb-1 mb-2">
                  模倣困難性 (Imitability)
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="vrio_imitability"></div>
              </div>
              
              <div className="bg-indigo-50 border border-indigo-200 rounded p-3 flex flex-col flex-1">
                <h3 className="text-indigo-700 font-medium text-center border-b border-indigo-200 pb-1 mb-2">
                  組織 (Organization)
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="vrio_organization"></div>
              </div>
            </div>
          </div>
          
          {/* 結論エリア - マージンを調整 */}
          <div className="mt-4 bg-pink-50 border border-pink-200 rounded p-3 flex flex-col min-h-[100px]">
            <h3 className="text-pink-700 font-medium text-center border-b border-pink-200 pb-1 mb-2">
              結論 (持続的競争優位性の評価)
            </h3>
            <div className="flex-grow template-dropzone pointer-events-auto" data-zone="vrio_conclusion"></div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default TemplateSelector;
