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
      case "bmc": return "ビジネスモデルキャンバス";
      case "lean": return "リーンキャンバス";
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
              <li>
                <button 
                  className={`w-full text-left px-4 py-2 flex items-center ${selectedTemplate === "bmc" ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedTemplate("bmc")}
                >
                  ビジネスモデルキャンバス
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
          
          <div className="bg-gray-50 p-3 rounded-md text-sm mb-4">
            <p className="font-medium mb-1">SWOT分析に基づく戦略立案：</p>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-1"></th>
                  <th className="text-left p-1">機会 (O)</th>
                  <th className="text-left p-1">脅威 (T)</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b">
                  <td className="p-1 font-medium">強み (S)</td>
                  <td className="p-1">積極的戦略<br/>強みを活かして機会を捉える</td>
                  <td className="p-1">差別化戦略<br/>強みを活かして脅威を回避・克服</td>
                </tr>
                <tr>
                  <td className="p-1 font-medium">弱み (W)</td>
                  <td className="p-1">改善戦略<br/>弱みを改善して機会を捉える</td>
                  <td className="p-1">防衛戦略<br/>弱みと脅威の最悪の組み合わせを回避</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="text-sm text-gray-600">
            効果的なSWOT分析では、単に要素を列挙するだけでなく、それらの相互関連性を考え、
            具体的な戦略につなげることが重要です。クロスSWOT分析を行うことで、より実行可能な戦略を導き出せます。
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
          
          <div className="bg-gray-50 p-3 rounded-md text-sm mb-4">
            <p className="font-medium mb-1">4Pの主要検討項目：</p>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-1">要素</th>
                  <th className="text-left p-1">検討すべき主な項目</th>
                  <th className="text-left p-1">重要な質問</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b">
                  <td className="p-1 font-medium">Product<br/>(製品)</td>
                  <td className="p-1">品質、機能、デザイン、パッケージ、ブランド、保証</td>
                  <td className="p-1">顧客の問題をどう解決するか？どんな価値を提供するか？</td>
                </tr>
                <tr className="border-b">
                  <td className="p-1 font-medium">Price<br/>(価格)</td>
                  <td className="p-1">定価、割引、支払条件、クレジット条件、価格戦略</td>
                  <td className="p-1">顧客がいくらなら支払うか？競合と比較して適切か？</td>
                </tr>
                <tr className="border-b">
                  <td className="p-1 font-medium">Place<br/>(流通)</td>
                  <td className="p-1">販売チャネル、流通経路、在庫、輸送、市場カバレッジ</td>
                  <td className="p-1">どこで顧客に届けるか？どのチャネルが最適か？</td>
                </tr>
                <tr>
                  <td className="p-1 font-medium">Promotion<br/>(販促)</td>
                  <td className="p-1">広告、PR、販売促進、ダイレクトマーケティング</td>
                  <td className="p-1">どうやって顧客に知ってもらうか？どんなメッセージが効果的か？</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="text-sm text-gray-600">
            4つの要素はそれぞれが独立しているのではなく、互いに影響し合う関係にあります。
            効果的なマーケティング戦略を立てるためには、これら4つの要素のバランスを考慮することが重要です。
            近年ではデジタル化に伴い、4CやSTPなど顧客視点を重視した派生フレームワークも活用されています。
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
          
          <div className="bg-gray-50 p-3 rounded-md text-sm mb-4">
            <p className="font-medium mb-1">3C分析の重要な視点：</p>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-1">3C要素</th>
                  <th className="text-left p-1">分析ポイント</th>
                  <th className="text-left p-1">重要な質問</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b">
                  <td className="p-1 font-medium">Customer<br/>(顧客)</td>
                  <td className="p-1">
                    • セグメンテーション<br/>
                    • ニーズと要望<br/>
                    • 購買行動と意思決定プロセス<br/>
                    • 顧客満足度と忠誠度
                  </td>
                  <td className="p-1">誰が顧客か？なぜ購入するか？いつどこで購入するか？何を重視するか？</td>
                </tr>
                <tr className="border-b">
                  <td className="p-1 font-medium">Company<br/>(自社)</td>
                  <td className="p-1">
                    • 製品・サービス<br/>
                    • 技術・研究開発力<br/>
                    • 財務状況<br/>
                    • 人的資源と組織文化
                  </td>
                  <td className="p-1">自社の強みと弱みは？核となる能力は？競争優位性の源泉は？</td>
                </tr>
                <tr>
                  <td className="p-1 font-medium">Competitor<br/>(競合)</td>
                  <td className="p-1">
                    • 主要競合の特定<br/>
                    • 競合の戦略と目標<br/>
                    • 競合の強みと弱み<br/>
                    • 市場シェアと位置づけ
                  </td>
                  <td className="p-1">競合は誰か？どのような戦略を取っているか？市場でどう差別化するか？</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="text-sm text-gray-600">
            3C分析は、SWOT分析やマーケティングミックス(4P)の前段階として行われることが多く、
            これら3つの視点を総合的に分析することで、市場での自社のポジショニングを明確にし、
            効果的な戦略を立案するための基盤となります。3つの要素の重なる部分に、ビジネスチャンスや差別化ポイントが潜んでいます。
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
          
          <div className="bg-gray-50 p-3 rounded-md text-sm mb-4">
            <p className="font-medium mb-1">PEST分析の主な検討項目例：</p>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-1">要因</th>
                  <th className="text-left p-1">考慮すべき要素（例）</th>
                  <th className="text-left p-1">潜在的なビジネスへの影響</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b">
                  <td className="p-1 font-medium">Political<br/>(政治的要因)</td>
                  <td className="p-1">
                    • 税制・関税政策<br/>
                    • 貿易規制・制裁<br/>
                    • 産業規制と法令<br/>
                    • 政治的安定性<br/>
                    • 労働法・雇用法
                  </td>
                  <td className="p-1">
                    • 規制コンプライアンスコスト<br/>
                    • 市場参入の障壁<br/>
                    • 事業運営の制約<br/>
                    • 税負担の変化
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-1 font-medium">Economic<br/>(経済的要因)</td>
                  <td className="p-1">
                    • GDP成長率<br/>
                    • 金利・インフレ率<br/>
                    • 為替レート<br/>
                    • 失業率<br/>
                    • 可処分所得
                  </td>
                  <td className="p-1">
                    • 消費者購買力<br/>
                    • 事業拡大/縮小の判断<br/>
                    • 生産コスト<br/>
                    • 投資判断
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-1 font-medium">Social<br/>(社会的要因)</td>
                  <td className="p-1">
                    • 人口統計と変化<br/>
                    • 消費者ライフスタイル<br/>
                    • 教育水準<br/>
                    • 健康意識<br/>
                    • 文化的価値観
                  </td>
                  <td className="p-1">
                    • 製品ニーズの変化<br/>
                    • 雇用・人材戦略<br/>
                    • マーケティング手法<br/>
                    • 企業の社会的責任
                  </td>
                </tr>
                <tr>
                  <td className="p-1 font-medium">Technological<br/>(技術的要因)</td>
                  <td className="p-1">
                    • イノベーション速度<br/>
                    • 自動化・AI技術<br/>
                    • R&D活動<br/>
                    • 情報技術の変化<br/>
                    • 技術インフラ
                  </td>
                  <td className="p-1">
                    • 生産方法の変革<br/>
                    • 新製品開発<br/>
                    • 競合優位性確保<br/>
                    • 事業モデルの破壊
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="text-sm text-gray-600">
            PEST分析は、SWOT分析の外部環境分析（機会と脅威）をより詳細に行うためのツールとしても活用されます。
            また、Legal(法的要因)とEnvironmental(環境的要因)を加えたPESTLE分析も広く使われています。
            マクロ環境の変化を定期的に分析することで、将来的な事業環境の変化に先手を打つことができます。
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
          
          <div className="bg-gray-50 p-3 rounded-md text-sm mb-4">
            <p className="font-medium mb-1">Five Forces分析の評価基準：</p>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-1">5つの力</th>
                  <th className="text-left p-1">強い場合の特徴</th>
                  <th className="text-left p-1">弱い場合の特徴</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b">
                  <td className="p-1 font-medium">業界内の競争</td>
                  <td className="p-1">
                    • 競合他社が多数<br/>
                    • 市場成長率が低い<br/>
                    • 製品差別化が少ない<br/>
                    • 固定費が高い
                  </td>
                  <td className="p-1">
                    • 寡占状態<br/>
                    • 高成長市場<br/>
                    • 強い製品差別化<br/>
                    • 低い撤退障壁
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-1 font-medium">新規参入の脅威</td>
                  <td className="p-1">
                    • 低い参入障壁<br/>
                    • 少ない初期投資<br/>
                    • 低いブランドロイヤルティ<br/>
                    • 容易な流通チャネルアクセス
                  </td>
                  <td className="p-1">
                    • 高い参入障壁<br/>
                    • 規模の経済が必要<br/>
                    • 厳しい規制<br/>
                    • 特許・技術障壁
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-1 font-medium">代替品の脅威</td>
                  <td className="p-1">
                    • 多数の代替品<br/>
                    • 低いスイッチングコスト<br/>
                    • 代替品の価格優位性<br/>
                    • 代替品の性能向上
                  </td>
                  <td className="p-1">
                    • 代替品が少ない<br/>
                    • 高いスイッチングコスト<br/>
                    • 代替品の品質劣位<br/>
                    • 独自の価値提案
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-1 font-medium">買い手の交渉力</td>
                  <td className="p-1">
                    • 少数の大口顧客<br/>
                    • 製品の標準化<br/>
                    • 低いスイッチングコスト<br/>
                    • 後方統合の可能性
                  </td>
                  <td className="p-1">
                    • 多数の分散した顧客<br/>
                    • 差別化された製品<br/>
                    • 高いスイッチングコスト<br/>
                    • ブランド価値
                  </td>
                </tr>
                <tr>
                  <td className="p-1 font-medium">売り手の交渉力</td>
                  <td className="p-1">
                    • サプライヤーの寡占<br/>
                    • 代替材料が少ない<br/>
                    • 高いスイッチングコスト<br/>
                    • 前方統合の可能性
                  </td>
                  <td className="p-1">
                    • 多数のサプライヤー<br/>
                    • 材料の標準化<br/>
                    • 低いスイッチングコスト<br/>
                    • 後方統合の可能性
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="text-sm text-gray-600">
            これら5つの力を分析することで、業界の競争環境と収益性を評価し、競争上の位置取りを戦略的に考えることができます。
            業界の魅力度は5つの力の総合的な強さによって決まり、これらの力に対応した戦略を立案することが重要です。
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
          
          <div className="bg-gray-50 p-3 rounded-md text-sm mb-4">
            <p className="font-medium mb-1">サプライチェーン改善の主要ポイント：</p>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-1">プロセス段階</th>
                  <th className="text-left p-1">主要課題</th>
                  <th className="text-left p-1">改善策</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b">
                  <td className="p-1 font-medium">サプライヤー管理</td>
                  <td className="p-1">
                    • 品質の不安定性<br/>
                    • 納期の遅延<br/>
                    • コスト高
                  </td>
                  <td className="p-1">
                    • 戦略的パートナーシップ<br/>
                    • サプライヤー評価システム<br/>
                    • 複数のソース確保
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-1 font-medium">在庫管理</td>
                  <td className="p-1">
                    • 過剰在庫<br/>
                    • 欠品リスク<br/>
                    • キャッシュフロー
                  </td>
                  <td className="p-1">
                    • JIT（ジャストインタイム）導入<br/>
                    • 需要予測の精度向上<br/>
                    • 安全在庫の最適化
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-1 font-medium">製造プロセス</td>
                  <td className="p-1">
                    • 製造リードタイム<br/>
                    • 品質管理<br/>
                    • 生産能力の変動
                  </td>
                  <td className="p-1">
                    • リーン生産方式<br/>
                    • 品質管理システムの強化<br/>
                    • 柔軟な生産ライン
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-1 font-medium">物流管理</td>
                  <td className="p-1">
                    • 輸送コスト<br/>
                    • 配送の遅延<br/>
                    • 追跡性の欠如
                  </td>
                  <td className="p-1">
                    • 輸送手段の最適化<br/>
                    • 倉庫ネットワークの再構築<br/>
                    • リアルタイム追跡システム
                  </td>
                </tr>
                <tr>
                  <td className="p-1 font-medium">情報連携</td>
                  <td className="p-1">
                    • データの分断<br/>
                    • 情報共有の遅れ<br/>
                    • 可視性の欠如
                  </td>
                  <td className="p-1">
                    • 統合SCMシステム導入<br/>
                    • データ連携の自動化<br/>
                    • 予測分析活用
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="text-sm text-gray-600">
            効率的なサプライチェーン管理は、コスト削減、品質向上、納期短縮などの競争優位性につながります。
            現代のサプライチェーンでは、持続可能性や環境への配慮も重要な要素となっています。
            デジタル技術の活用により、エンドツーエンドの可視性と俊敏性を実現するスマートサプライチェーンへの転換が進んでいます。
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
          
          <div className="bg-gray-50 p-3 rounded-md text-sm mb-4">
            <p className="font-medium mb-1">バリューチェーンにおける競争優位性の源泉：</p>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-1">活動カテゴリー</th>
                  <th className="text-left p-1">コスト優位性の源泉</th>
                  <th className="text-left p-1">差別化の源泉</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b bg-gray-100">
                  <td className="p-1 font-medium" colSpan={3}>主活動</td>
                </tr>
                <tr className="border-b">
                  <td className="p-1 font-medium">調達物流</td>
                  <td className="p-1">
                    • 効率的な在庫管理システム<br/>
                    • サプライヤーとの規模の経済<br/>
                    • 物流の最適化
                  </td>
                  <td className="p-1">
                    • 高品質材料の調達<br/>
                    • 信頼性の高い調達プロセス<br/>
                    • 持続可能な調達方針
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-1 font-medium">製造業務</td>
                  <td className="p-1">
                    • 生産規模の拡大<br/>
                    • 製造プロセスの自動化<br/>
                    • リーン生産方式
                  </td>
                  <td className="p-1">
                    • 高精度製造技術<br/>
                    • 柔軟なカスタマイズ能力<br/>
                    • 品質管理の徹底
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-1 font-medium">出荷物流</td>
                  <td className="p-1">
                    • 効率的なルート計画<br/>
                    • 物流センターの最適配置<br/>
                    • 配送の統合化
                  </td>
                  <td className="p-1">
                    • 迅速な配送時間<br/>
                    • 製品の無傷配送<br/>
                    • 配送状況の可視化
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-1 font-medium">マーケティング・販売</td>
                  <td className="p-1">
                    • デジタルマーケティングの活用<br/>
                    • 販売チャネルの効率化<br/>
                    • マーケティング活動の正確な測定
                  </td>
                  <td className="p-1">
                    • ブランドイメージの構築<br/>
                    • 個別化された顧客体験<br/>
                    • 革新的な販売手法
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-1 font-medium">サービス</td>
                  <td className="p-1">
                    • 効率的な顧客サポートシステム<br/>
                    • 自己解決型サポートリソース<br/>
                    • 保証コストの最適化
                  </td>
                  <td className="p-1">
                    • 卓越したアフターサービス<br/>
                    • 迅速な問題解決能力<br/>
                    • 付加価値サービスの提供
                  </td>
                </tr>
                <tr className="border-b bg-gray-100">
                  <td className="p-1 font-medium" colSpan={3}>支援活動</td>
                </tr>
                <tr className="border-b">
                  <td className="p-1 font-medium">企業インフラ</td>
                  <td className="p-1">
                    • 効率的な管理システム<br/>
                    • リスク管理の最適化<br/>
                    • コスト管理の徹底
                  </td>
                  <td className="p-1">
                    • 優れた企業文化<br/>
                    • 効果的なガバナンス<br/>
                    • 強固な財務基盤
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-1 font-medium">人的資源管理</td>
                  <td className="p-1">
                    • 効率的な採用プロセス<br/>
                    • 適切な人材配置<br/>
                    • 離職率の低減
                  </td>
                  <td className="p-1">
                    • 高スキル人材の確保<br/>
                    • 社員の能力開発<br/>
                    • 革新的な企業文化
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-1 font-medium">技術開発</td>
                  <td className="p-1">
                    • コスト効率の良いR&D<br/>
                    • プロセス技術の改良<br/>
                    • 既存技術の活用
                  </td>
                  <td className="p-1">
                    • 革新的な製品設計<br/>
                    • 知的財産権の保護<br/>
                    • 先進的な技術研究
                  </td>
                </tr>
                <tr>
                  <td className="p-1 font-medium">調達活動</td>
                  <td className="p-1">
                    • 大量購入による価格削減<br/>
                    • 調達プロセスの効率化<br/>
                    • 戦略的パートナーシップ
                  </td>
                  <td className="p-1">
                    • 高品質材料の獲得<br/>
                    • 持続可能な調達方針<br/>
                    • 先端技術調達能力
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="text-sm text-gray-600">
            バリューチェーン分析を通じて、各活動がどのように価値を生み出し、コストを発生させているかを理解し、
            競争優位性を確立するための戦略を立案することができます。
            企業は差別化戦略かコストリーダーシップ戦略、あるいはその組み合わせに焦点を当てることで、
            バリューチェーン全体を最適化し、競争力を強化することができます。
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
    
    case "bmc":
      return (
        <div>
          <h3 className="text-lg font-medium mb-2">ビジネスモデルキャンバス</h3>
          <p className="mb-4">
            ビジネスモデルキャンバスは、ビジネスモデルを9つの要素で構造化して可視化するためのフレームワークです。
            組織がどのように価値を創造し、提供し、獲得するかを包括的に理解するのに役立ちます。
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li><span className="font-medium">顧客セグメント (Customer Segments)</span> - サービスを提供する対象となる顧客グループ</li>
            <li><span className="font-medium">価値提案 (Value Propositions)</span> - 顧客の問題を解決し、ニーズを満たす製品やサービス</li>
            <li><span className="font-medium">チャネル (Channels)</span> - 顧客に価値提案を伝え、製品やサービスを届ける方法</li>
            <li><span className="font-medium">顧客との関係 (Customer Relationships)</span> - 各顧客セグメントとの関係性</li>
            <li><span className="font-medium">収益の流れ (Revenue Streams)</span> - 顧客から生み出される収益</li>
            <li><span className="font-medium">主要リソース (Key Resources)</span> - ビジネスモデルを機能させるために必要な資産</li>
            <li><span className="font-medium">主要活動 (Key Activities)</span> - ビジネスモデルを機能させるために行うべき最も重要な活動</li>
            <li><span className="font-medium">キーパートナー (Key Partners)</span> - ビジネスモデルを機能させるための外部協力者やサプライヤー</li>
            <li><span className="font-medium">コスト構造 (Cost Structure)</span> - ビジネスモデルの運営にかかるすべてのコスト</li>
          </ul>
          
          <div className="bg-gray-50 p-3 rounded-md text-sm mb-4">
            <p className="font-medium mb-1">ビジネスモデルキャンバスの特徴：</p>
            <ul className="list-disc pl-5 text-gray-700">
              <li>ビジネスモデル全体を一目で把握できる</li>
              <li>各要素の関連性を視覚的に理解できる</li>
              <li>新しいビジネスモデルの設計や既存モデルの改善に役立つ</li>
              <li>チーム内でビジネスの核となる概念を共有しやすくなる</li>
            </ul>
          </div>
          
          <p className="text-sm text-gray-600 mt-3">
            ビジネスモデルキャンバスは、スタートアップから大企業まで、あらゆる規模の組織に適用可能です。
            このフレームワークを使うことで、ビジネスモデルの強みと弱みを特定し、革新的な方向性を見出すことができます。
            各ブロックは相互に関連しており、一つの変更が他の要素にも影響することを理解することが重要です。
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