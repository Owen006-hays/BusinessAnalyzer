import React, { useState, useEffect } from "react";
import { X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalysisContext } from "@/context/AnalysisContext";

interface FrameworkInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

const FrameworkInfo: React.FC<FrameworkInfoProps> = ({ isOpen, onClose }) => {
  const { currentTemplate } = useAnalysisContext();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // 現在のテンプレートに初期化
  useEffect(() => {
    if (isOpen) {
      setSelectedTemplate(currentTemplate);
    }
  }, [isOpen, currentTemplate]);
  
  if (!isOpen) return null;

  // 日本語のテンプレート名を取得
  const getTemplateJapaneseName = (template: string | null) => {
    switch (template) {
      case "swot": return "SWOT分析";
      case "4p": return "4P分析";
      case "3c": return "3C分析";
      case "pest": return "PEST分析";
      case "5force": return "Five Forces分析";
      case "supply_chain": return "サプライチェーン分析";
      case "value_chain": return "バリューチェーン分析";
      case "vrio": return "VRIO分析";
      default: return "フレームワーク一覧";
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-medium">
            分析フレームワーク ガイド：{getTemplateJapaneseName(selectedTemplate)}
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* サイドバーナビゲーション */}
          <div className="w-56 border-r border-gray-200 bg-gray-50 py-4 overflow-y-auto">
            <ul className="space-y-1">
              <li>
                <button 
                  className={`w-full text-left px-4 py-2 flex items-center ${selectedTemplate === null ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedTemplate(null)}
                >
                  フレームワーク一覧
                  <ChevronRight className="ml-auto h-4 w-4" />
                </button>
              </li>
              <li>
                <button 
                  className={`w-full text-left px-4 py-2 flex items-center ${selectedTemplate === "swot" ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedTemplate("swot")}
                >
                  SWOT分析
                  <ChevronRight className="ml-auto h-4 w-4" />
                </button>
              </li>
              <li>
                <button 
                  className={`w-full text-left px-4 py-2 flex items-center ${selectedTemplate === "4p" ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedTemplate("4p")}
                >
                  4P分析
                  <ChevronRight className="ml-auto h-4 w-4" />
                </button>
              </li>
              <li>
                <button 
                  className={`w-full text-left px-4 py-2 flex items-center ${selectedTemplate === "3c" ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedTemplate("3c")}
                >
                  3C分析
                  <ChevronRight className="ml-auto h-4 w-4" />
                </button>
              </li>
              <li>
                <button 
                  className={`w-full text-left px-4 py-2 flex items-center ${selectedTemplate === "pest" ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedTemplate("pest")}
                >
                  PEST分析
                  <ChevronRight className="ml-auto h-4 w-4" />
                </button>
              </li>
              <li>
                <button 
                  className={`w-full text-left px-4 py-2 flex items-center ${selectedTemplate === "5force" ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedTemplate("5force")}
                >
                  Five Forces分析
                  <ChevronRight className="ml-auto h-4 w-4" />
                </button>
              </li>
              <li>
                <button 
                  className={`w-full text-left px-4 py-2 flex items-center ${selectedTemplate === "supply_chain" ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedTemplate("supply_chain")}
                >
                  サプライチェーン分析
                  <ChevronRight className="ml-auto h-4 w-4" />
                </button>
              </li>
              <li>
                <button 
                  className={`w-full text-left px-4 py-2 flex items-center ${selectedTemplate === "value_chain" ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedTemplate("value_chain")}
                >
                  バリューチェーン分析
                  <ChevronRight className="ml-auto h-4 w-4" />
                </button>
              </li>
              <li>
                <button 
                  className={`w-full text-left px-4 py-2 flex items-center ${selectedTemplate === "vrio" ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedTemplate("vrio")}
                >
                  VRIO分析
                  <ChevronRight className="ml-auto h-4 w-4" />
                </button>
              </li>
            </ul>
          </div>
          
          {/* コンテンツエリア */}
          <div className="flex-1 p-6 overflow-y-auto">
            {getFrameworkContent(selectedTemplate)}
          </div>
        </div>
      </div>
    </div>
  );
};

function getFrameworkContent(templateName: string | null) {
  switch (templateName) {
    case "swot":
      return (
        <div>
          <h3 className="text-lg font-medium mb-2">SWOT分析</h3>
          <p className="mb-4">
            組織内部の強み・弱みと外部環境の機会・脅威を分析し、戦略策定に役立てるフレームワークです。
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li><span className="font-medium">S：強み (Strengths)</span> - 組織の内部的な強みや競争優位性</li>
            <li><span className="font-medium">W：弱み (Weaknesses)</span> - 組織の内部的な弱みや改善点</li>
            <li><span className="font-medium">O：機会 (Opportunities)</span> - 外部環境からもたらされる好機</li>
            <li><span className="font-medium">T：脅威 (Threats)</span> - 外部環境からの課題や脅威</li>
          </ul>
          <p className="text-sm text-gray-600">
            効果的なSWOT分析では、単に要素を列挙するだけでなく、それらの相互関連性を考え、
            「強みを活かして機会を捉える」「弱みを克服して脅威を回避する」など、具体的な戦略につなげることが重要です。
          </p>
        </div>
      );
      
    case "4p":
      return (
        <div>
          <h3 className="text-lg font-medium mb-2">4P分析</h3>
          <p className="mb-4">
            マーケティングミックスとも呼ばれ、製品戦略を検討する際の4つの重要な要素を分析するフレームワークです。
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li><span className="font-medium">Product (製品)</span> - 顧客に提供する製品やサービスの特性、品質、デザイン、ブランド</li>
            <li><span className="font-medium">Price (価格)</span> - 価格設定、割引戦略、支払い条件</li>
            <li><span className="font-medium">Place (流通)</span> - 販売チャネル、物流、在庫管理、市場カバレッジ</li>
            <li><span className="font-medium">Promotion (販促)</span> - 広告、PR、販売促進、パーソナルセリング</li>
          </ul>
          <p className="text-sm text-gray-600">
            4つの要素はそれぞれが独立しているのではなく、互いに影響し合う関係にあります。
            効果的なマーケティング戦略を立てるためには、これら4つの要素のバランスを考慮することが重要です。
          </p>
        </div>
      );
      
    case "3c":
      return (
        <div>
          <h3 className="text-lg font-medium mb-2">3C分析</h3>
          <p className="mb-4">
            マーケティング戦略立案の基礎となる、3つの要素（顧客・自社・競合）を分析するフレームワークです。
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li><span className="font-medium">Customer (顧客)</span> - 顧客ニーズ、購買行動、セグメンテーション</li>
            <li><span className="font-medium">Company (自社)</span> - 自社の強み、弱み、リソース、能力</li>
            <li><span className="font-medium">Competitor (競合)</span> - 競合他社の戦略、強み、市場ポジション</li>
          </ul>
          <p className="text-sm text-gray-600">
            3C分析は、SWOT分析やマーケティングミックス(4P)の前段階として行われることが多く、
            これら3つの視点を総合的に分析することで、市場での自社のポジショニングを明確にし、
            効果的な戦略を立案するための基盤となります。
          </p>
        </div>
      );
      
    case "pest":
      return (
        <div>
          <h3 className="text-lg font-medium mb-2">PEST分析</h3>
          <p className="mb-4">
            マクロ環境を分析するためのフレームワークで、事業や戦略に影響を与える外部要因を特定するのに役立ちます。
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li><span className="font-medium">Political (政治的要因)</span> - 政府の政策、政治的安定性、規制、税制</li>
            <li><span className="font-medium">Economic (経済的要因)</span> - 経済成長率、金利、インフレ、為替レート、所得水準</li>
            <li><span className="font-medium">Social (社会的要因)</span> - 人口動態、ライフスタイル、文化的傾向、消費者の態度</li>
            <li><span className="font-medium">Technological (技術的要因)</span> - 技術革新、R&D活動、自動化、技術移転速度</li>
          </ul>
          <p className="text-sm text-gray-600">
            PEST分析は、SWOT分析の外部環境分析（機会と脅威）をより詳細に行うためのツールとしても活用されます。
            また、Legal(法的要因)とEnvironmental(環境的要因)を加えたPESTLE分析も広く使われています。
          </p>
        </div>
      );
      
    case "5force":
      return (
        <div>
          <h3 className="text-lg font-medium mb-2">Five Forces分析（ファイブフォース分析）</h3>
          <p className="mb-4">
            マイケル・ポーターによって開発された、業界の競争環境を分析するためのフレームワークです。
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li><span className="font-medium">業界内の競争</span> - 既存競合他社との競争の激しさ</li>
            <li><span className="font-medium">新規参入の脅威</span> - 新しい競合が市場に参入する可能性とその障壁</li>
            <li><span className="font-medium">代替品の脅威</span> - 顧客ニーズを満たす代替製品・サービスの存在</li>
            <li><span className="font-medium">買い手の交渉力</span> - 顧客が価格やサービス条件に影響を与える力</li>
            <li><span className="font-medium">売り手の交渉力</span> - サプライヤーが価格や品質に影響を与える力</li>
          </ul>
          <p className="text-sm text-gray-600">
            これら5つの力を分析することで、業界の収益性や魅力度を評価し、競争上の位置取りを戦略的に考えることができます。
            また、これらの力のバランスは業界によって大きく異なり、時間とともに変化することもあります。
          </p>
        </div>
      );
      
    case "supply_chain":
      return (
        <div>
          <h3 className="text-lg font-medium mb-2">サプライチェーン分析</h3>
          <p className="mb-4">
            製品やサービスが原材料から最終顧客に届くまでの一連のプロセスを分析するフレームワークです。
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li><span className="font-medium">サプライヤー</span> - 原材料や部品の供給者、その関係性と管理</li>
            <li><span className="font-medium">調達物流</span> - 原材料や部品の調達と輸送プロセス</li>
            <li><span className="font-medium">製造</span> - 製品の生産プロセス、品質管理</li>
            <li><span className="font-medium">出荷物流</span> - 完成品の保管、配送、輸送</li>
            <li><span className="font-medium">顧客</span> - 最終消費者、販売チャネル、アフターサービス</li>
          </ul>
          <p className="text-sm text-gray-600">
            効率的なサプライチェーン管理は、コスト削減、品質向上、納期短縮などの競争優位性につながります。
            現代のサプライチェーンでは、持続可能性や環境への配慮も重要な要素となっています。
          </p>
        </div>
      );
      
    case "value_chain":
      return (
        <div>
          <h3 className="text-lg font-medium mb-2">バリューチェーン分析</h3>
          <p className="mb-4">
            マイケル・ポーターによって開発された、企業の活動を分析し価値創造プロセスを把握するためのフレームワークです。
          </p>
          <h4 className="font-medium mt-3 mb-2">主活動：</h4>
          <ul className="list-disc pl-5 space-y-1 mb-3">
            <li><span className="font-medium">調達物流</span> - 原材料や部品の受け入れ、保管、配分</li>
            <li><span className="font-medium">製造業務</span> - 原材料を最終製品に変換するプロセス</li>
            <li><span className="font-medium">出荷物流</span> - 製品の保管、配送計画、輸送</li>
            <li><span className="font-medium">マーケティング・販売</span> - 市場開拓、広告、販売促進</li>
            <li><span className="font-medium">サービス</span> - 製品価値を維持・向上させる活動</li>
          </ul>
          <h4 className="font-medium mt-3 mb-2">支援活動：</h4>
          <ul className="list-disc pl-5 space-y-1 mb-3">
            <li><span className="font-medium">企業インフラ</span> - 経営管理、計画、財務、品質管理</li>
            <li><span className="font-medium">人的資源管理</span> - 採用、教育、報酬制度</li>
            <li><span className="font-medium">技術開発</span> - R&D、製品・プロセス改善</li>
            <li><span className="font-medium">調達活動</span> - 原材料、設備、サービスの購入</li>
          </ul>
          <p className="text-sm text-gray-600">
            バリューチェーン分析を通じて、各活動がどのように価値を生み出し、コストを発生させているかを理解し、
            競争優位性を確立するための戦略を立案することができます。
          </p>
        </div>
      );
      
    case "vrio":
      return (
        <div>
          <h3 className="text-lg font-medium mb-2">VRIO分析</h3>
          <p className="mb-4">
            企業の内部リソースや能力を評価し、持続的競争優位性の源泉を特定するためのフレームワークです。
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li><span className="font-medium">Value (価値)</span> - そのリソースは顧客に価値を提供し、外部の脅威を中和または機会を活用できるか</li>
            <li><span className="font-medium">Rarity (希少性)</span> - そのリソースは現在および潜在的な競合他社の中で希少か</li>
            <li><span className="font-medium">Imitability (模倣困難性)</span> - そのリソースを持たない企業が獲得または開発するのに大きなコストがかかるか</li>
            <li><span className="font-medium">Organization (組織)</span> - 企業の方針や手順はリソースの価値を活用するために整備されているか</li>
          </ul>
          <div className="bg-gray-50 p-3 rounded-md text-sm">
            <p className="font-medium mb-1">VRIO分析による評価：</p>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-1">V</th>
                  <th className="text-left p-1">R</th>
                  <th className="text-left p-1">I</th>
                  <th className="text-left p-1">O</th>
                  <th className="text-left p-1">競争的意味合い</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b">
                  <td className="p-1">No</td>
                  <td className="p-1">-</td>
                  <td className="p-1">-</td>
                  <td className="p-1">-</td>
                  <td className="p-1">競争劣位</td>
                </tr>
                <tr className="border-b">
                  <td className="p-1">Yes</td>
                  <td className="p-1">No</td>
                  <td className="p-1">-</td>
                  <td className="p-1">-</td>
                  <td className="p-1">競争均衡</td>
                </tr>
                <tr className="border-b">
                  <td className="p-1">Yes</td>
                  <td className="p-1">Yes</td>
                  <td className="p-1">No</td>
                  <td className="p-1">-</td>
                  <td className="p-1">一時的競争優位</td>
                </tr>
                <tr>
                  <td className="p-1">Yes</td>
                  <td className="p-1">Yes</td>
                  <td className="p-1">Yes</td>
                  <td className="p-1">Yes</td>
                  <td className="p-1">持続的競争優位</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            VRIO分析は、リソースベースドビューの考え方に基づいており、企業の競争優位性は独自の内部リソースと能力から生じるという理論です。
            このフレームワークを使うことで、企業は最も価値のあるリソースに投資し、持続可能な競争優位性を構築することができます。
          </p>
        </div>
      );
      
    default:
      return (
        <div className="text-center">
          <p>テンプレートを選択すると、そのフレームワークの詳細情報が表示されます。</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-700 mb-2">基本分析フレームワーク</h3>
              <ul className="list-disc pl-5 text-left">
                <li>SWOT分析</li>
                <li>3C分析</li>
                <li>4P分析</li>
                <li>PEST分析</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-md">
              <h3 className="font-medium text-green-700 mb-2">高度分析フレームワーク</h3>
              <ul className="list-disc pl-5 text-left">
                <li>Five Forces分析</li>
                <li>バリューチェーン分析</li>
                <li>サプライチェーン分析</li>
                <li>VRIO分析</li>
              </ul>
            </div>
          </div>
        </div>
      );
  }
}

export default FrameworkInfo;