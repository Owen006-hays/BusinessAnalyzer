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
    
    case "bmc":
      return (
        <div className="template-grid h-full flex flex-col pointer-events-none">
          <div className="flex flex-col h-full">
            {/* Canvanizerのレイアウトに合わせた標準的なビジネスモデルキャンバス */}
            <div className="h-full grid grid-cols-1 md:grid-cols-10 md:grid-rows-10 gap-3">
              {/* 上段：キーパートナー、主要活動、価値提案、顧客との関係、顧客セグメント */}
              <div className="md:col-span-2 md:row-span-6 bg-purple-50 border border-purple-200 rounded p-3 flex flex-col">
                <h3 className="text-purple-700 font-medium text-center border-b border-purple-200 pb-1 mb-2">
                  キーパートナー
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="key_partners"></div>
              </div>
              
              <div className="md:col-span-2 md:row-span-3 bg-blue-50 border border-blue-200 rounded p-3 flex flex-col">
                <h3 className="text-blue-700 font-medium text-center border-b border-blue-200 pb-1 mb-2">
                  主要活動
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="key_activities"></div>
              </div>
              
              <div className="md:col-span-4 md:row-span-6 bg-teal-50 border border-teal-200 rounded p-3 flex flex-col">
                <h3 className="text-teal-700 font-medium text-center border-b border-teal-200 pb-1 mb-2">
                  価値提案
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="value_propositions"></div>
              </div>
              
              <div className="md:col-span-2 md:row-span-3 bg-indigo-50 border border-indigo-200 rounded p-3 flex flex-col">
                <h3 className="text-indigo-700 font-medium text-center border-b border-indigo-200 pb-1 mb-2">
                  顧客との関係
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="customer_relationships"></div>
              </div>
              
              <div className="md:col-span-2 md:row-span-6 bg-green-50 border border-green-200 rounded p-3 flex flex-col">
                <h3 className="text-green-700 font-medium text-center border-b border-green-200 pb-1 mb-2">
                  顧客セグメント
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="customer_segments"></div>
              </div>
              
              {/* 中段：経営資源、チャネル */}
              <div className="md:col-span-2 md:row-span-3 bg-cyan-50 border border-cyan-200 rounded p-3 flex flex-col">
                <h3 className="text-cyan-700 font-medium text-center border-b border-cyan-200 pb-1 mb-2">
                  経営資源
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="key_resources"></div>
              </div>
              
              <div className="md:col-span-2 md:row-span-3 bg-pink-50 border border-pink-200 rounded p-3 flex flex-col">
                <h3 className="text-pink-700 font-medium text-center border-b border-pink-200 pb-1 mb-2">
                  チャネル
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="channels"></div>
              </div>
              
              {/* 下段：コスト構造と収益の流れ */}
              <div className="md:col-span-5 md:row-span-4 bg-amber-50 border border-amber-200 rounded p-3 flex flex-col">
                <h3 className="text-amber-700 font-medium text-center border-b border-amber-200 pb-1 mb-2">
                  コスト構造
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="cost_structure"></div>
              </div>
              
              <div className="md:col-span-5 md:row-span-4 bg-rose-50 border border-rose-200 rounded p-3 flex flex-col">
                <h3 className="text-rose-700 font-medium text-center border-b border-rose-200 pb-1 mb-2">
                  収益の流れ
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="revenue_streams"></div>
              </div>
            </div>
          </div>
        </div>
      );
      
    case "lean":
      return (
        <div className="template-grid h-full flex flex-col pointer-events-none">
          <div className="flex flex-col h-full">
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 grid-rows-auto md:grid-rows-3 gap-3">
              {/* 左上: 問題と解決策 */}
              <div className="md:row-span-1 bg-red-50 border border-red-200 rounded p-3 flex flex-col min-h-[120px]">
                <h3 className="text-red-700 font-medium text-center border-b border-red-200 pb-1 mb-2">
                  解決すべき問題
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="problem"></div>
              </div>
              
              <div className="md:row-span-1 bg-green-50 border border-green-200 rounded p-3 flex flex-col min-h-[120px]">
                <h3 className="text-green-700 font-medium text-center border-b border-green-200 pb-1 mb-2">
                  解決策
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="solution"></div>
              </div>
              
              {/* 左中: 主要指標とユニークバリュー */}
              <div className="md:row-span-1 bg-blue-50 border border-blue-200 rounded p-3 flex flex-col min-h-[120px]">
                <h3 className="text-blue-700 font-medium text-center border-b border-blue-200 pb-1 mb-2">
                  主要指標
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="key_metrics"></div>
              </div>
              
              <div className="md:row-span-1 bg-purple-50 border border-purple-200 rounded p-3 flex flex-col min-h-[120px]">
                <h3 className="text-purple-700 font-medium text-center border-b border-purple-200 pb-1 mb-2">
                  独自の価値提案
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="unique_value"></div>
              </div>
              
              {/* 左下: アンフェアアドバンテージ、右下: チャネル */}
              <div className="md:row-span-1 bg-amber-50 border border-amber-200 rounded p-3 flex flex-col min-h-[120px]">
                <h3 className="text-amber-700 font-medium text-center border-b border-amber-200 pb-1 mb-2">
                  圧倒的な優位性
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="unfair_advantage"></div>
              </div>
              
              <div className="md:row-span-1 bg-indigo-50 border border-indigo-200 rounded p-3 flex flex-col min-h-[120px]">
                <h3 className="text-indigo-700 font-medium text-center border-b border-indigo-200 pb-1 mb-2">
                  チャネル
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="channels"></div>
              </div>
            </div>
            
            {/* 下段: 顧客セグメント、コスト構造、収益の流れ */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="md:col-span-1 bg-cyan-50 border border-cyan-200 rounded p-3 flex flex-col min-h-[120px]">
                <h3 className="text-cyan-700 font-medium text-center border-b border-cyan-200 pb-1 mb-2">
                  顧客セグメント
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="customer_segments"></div>
              </div>
              
              <div className="md:col-span-2 bg-pink-50 border border-pink-200 rounded p-3 flex flex-col min-h-[120px]">
                <h3 className="text-pink-700 font-medium text-center border-b border-pink-200 pb-1 mb-2">
                  コスト構造
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="cost_structure"></div>
              </div>
              
              <div className="md:col-span-2 bg-rose-50 border border-rose-200 rounded p-3 flex flex-col min-h-[120px]">
                <h3 className="text-rose-700 font-medium text-center border-b border-rose-200 pb-1 mb-2">
                  収益の流れ
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="revenue_streams"></div>
              </div>
            </div>
          </div>
        </div>
      );
    
    case "customer_journey":
      return (
        <div className="template-grid h-full flex flex-col pointer-events-none">
          <div className="flex flex-col h-full">
            {/* ステージ（フェーズ）のヘッダー行 */}
            <div className="grid grid-cols-5 gap-2 mb-3">
              <div className="bg-blue-100 rounded p-2 text-center text-blue-800 font-medium">
                認知
              </div>
              <div className="bg-indigo-100 rounded p-2 text-center text-indigo-800 font-medium">
                検討
              </div>
              <div className="bg-purple-100 rounded p-2 text-center text-purple-800 font-medium">
                購入
              </div>
              <div className="bg-pink-100 rounded p-2 text-center text-pink-800 font-medium">
                サービス利用
              </div>
              <div className="bg-rose-100 rounded p-2 text-center text-rose-800 font-medium">
                ロイヤル化
              </div>
            </div>
            
            {/* 顧客の行動 */}
            <div className="grid grid-cols-5 gap-2 mb-3">
              <div className="bg-gray-50 border border-gray-200 rounded p-3 flex flex-col min-h-[100px]">
                <h3 className="text-gray-700 font-medium text-center border-b border-gray-200 pb-1 mb-2">
                  行動
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="awareness_doing"></div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded p-3 flex flex-col min-h-[100px]">
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="consideration_doing"></div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded p-3 flex flex-col min-h-[100px]">
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="purchase_doing"></div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded p-3 flex flex-col min-h-[100px]">
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="service_doing"></div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded p-3 flex flex-col min-h-[100px]">
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="loyalty_doing"></div>
              </div>
            </div>
            
            {/* 顧客の思考 */}
            <div className="grid grid-cols-5 gap-2 mb-3">
              <div className="bg-blue-50 border border-blue-200 rounded p-3 flex flex-col min-h-[100px]">
                <h3 className="text-blue-700 font-medium text-center border-b border-blue-200 pb-1 mb-2">
                  思考
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="awareness_thinking"></div>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded p-3 flex flex-col min-h-[100px]">
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="consideration_thinking"></div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded p-3 flex flex-col min-h-[100px]">
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="purchase_thinking"></div>
              </div>
              <div className="bg-pink-50 border border-pink-200 rounded p-3 flex flex-col min-h-[100px]">
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="service_thinking"></div>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded p-3 flex flex-col min-h-[100px]">
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="loyalty_thinking"></div>
              </div>
            </div>
            
            {/* 顧客の感情 */}
            <div className="grid grid-cols-5 gap-2 mb-3">
              <div className="bg-green-50 border border-green-200 rounded p-3 flex flex-col min-h-[100px]">
                <h3 className="text-green-700 font-medium text-center border-b border-green-200 pb-1 mb-2">
                  感情
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="awareness_feeling"></div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-3 flex flex-col min-h-[100px]">
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="consideration_feeling"></div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-3 flex flex-col min-h-[100px]">
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="purchase_feeling"></div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-3 flex flex-col min-h-[100px]">
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="service_feeling"></div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-3 flex flex-col min-h-[100px]">
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="loyalty_feeling"></div>
              </div>
            </div>
            
            {/* タッチポイント */}
            <div className="grid grid-cols-5 gap-2 mb-3">
              <div className="bg-amber-50 border border-amber-200 rounded p-3 flex flex-col min-h-[100px]">
                <h3 className="text-amber-700 font-medium text-center border-b border-amber-200 pb-1 mb-2">
                  タッチポイント
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="awareness_touchpoints"></div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded p-3 flex flex-col min-h-[100px]">
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="consideration_touchpoints"></div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded p-3 flex flex-col min-h-[100px]">
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="purchase_touchpoints"></div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded p-3 flex flex-col min-h-[100px]">
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="service_touchpoints"></div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded p-3 flex flex-col min-h-[100px]">
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="loyalty_touchpoints"></div>
              </div>
            </div>
            
            {/* 課題と機会 */}
            <div className="grid grid-cols-5 gap-2">
              <div className="bg-red-50 border border-red-200 rounded p-3 flex flex-col min-h-[100px]">
                <h3 className="text-red-700 font-medium text-center border-b border-red-200 pb-1 mb-2">
                  課題と機会
                </h3>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="awareness_opportunities"></div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded p-3 flex flex-col min-h-[100px]">
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="consideration_opportunities"></div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded p-3 flex flex-col min-h-[100px]">
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="purchase_opportunities"></div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded p-3 flex flex-col min-h-[100px]">
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="service_opportunities"></div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded p-3 flex flex-col min-h-[100px]">
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="loyalty_opportunities"></div>
              </div>
            </div>
          </div>
        </div>
      );
      
    case "design_thinking":
      return (
        <div className="template-grid h-full flex flex-col pointer-events-none">
          <div className="flex flex-col h-full">
            <div className="h-full grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* デザイン思考の5つのステージを均等に配置（余白を増やし、高さを最大化） */}
              <div className="md:col-span-1 bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col h-full">
                <h3 className="text-blue-700 font-medium text-center border-b border-blue-200 pb-2 mb-3">
                  共感
                </h3>
                <p className="text-sm text-gray-600 mb-3 text-center">Empathize</p>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="empathize"></div>
              </div>
              
              <div className="md:col-span-1 bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex flex-col h-full">
                <h3 className="text-indigo-700 font-medium text-center border-b border-indigo-200 pb-2 mb-3">
                  問題定義
                </h3>
                <p className="text-sm text-gray-600 mb-3 text-center">Define</p>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="define"></div>
              </div>
              
              <div className="md:col-span-1 bg-purple-50 border border-purple-200 rounded-lg p-4 flex flex-col h-full">
                <h3 className="text-purple-700 font-medium text-center border-b border-purple-200 pb-2 mb-3">
                  創造
                </h3>
                <p className="text-sm text-gray-600 mb-3 text-center">Ideate</p>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="ideate"></div>
              </div>
              
              <div className="md:col-span-1 bg-pink-50 border border-pink-200 rounded-lg p-4 flex flex-col h-full">
                <h3 className="text-pink-700 font-medium text-center border-b border-pink-200 pb-2 mb-3">
                  プロトタイプ
                </h3>
                <p className="text-sm text-gray-600 mb-3 text-center">Prototype</p>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="prototype"></div>
              </div>
              
              <div className="md:col-span-1 bg-rose-50 border border-rose-200 rounded-lg p-4 flex flex-col h-full">
                <h3 className="text-rose-700 font-medium text-center border-b border-rose-200 pb-2 mb-3">
                  テスト
                </h3>
                <p className="text-sm text-gray-600 mb-3 text-center">Test</p>
                <div className="flex-grow template-dropzone pointer-events-auto" data-zone="test"></div>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default TemplateSelector;
