import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InstructionsModalProps {
  onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">使い方ガイド</DialogTitle>
        </DialogHeader>
        
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-2">基本操作</h3>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700">
            <li>右側のPDFビューアにPDFファイルをアップロードします。</li>
            <li>PDFからテキストを選択し、左側の分析エリアにドラッグ&ドロップします。</li>
            <li>テキストボックスは自由に移動、サイズ変更、編集ができます。</li>
            <li>ダブルクリックでテキストを編集できます。</li>
            <li>不要なテキストボックスは削除キーで削除できます。</li>
          </ol>
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-2">テンプレート機能</h3>
          <p className="text-gray-700 mb-2">様々なビジネスフレームワークのテンプレートを利用できます：</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>SWOT分析（強み、弱み、機会、脅威）</li>
            <li>4P分析（製品、価格、流通、販促）</li>
            <li>3C分析（自社、顧客、競合）</li>
            <li>PEST分析（政治、経済、社会、技術）</li>
          </ul>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>
            始める
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InstructionsModal;
