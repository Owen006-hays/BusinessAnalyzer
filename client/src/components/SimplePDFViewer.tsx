import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";

interface SimplePDFViewerProps {
  file: File;
  onChangeFile: () => void;
}

/**
 * 簡素化したPDFビューア
 * ブラウザ標準のPDF表示機能を使用
 */
const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ file, onChangeFile }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ファイルからURLを生成
  useEffect(() => {
    if (!file) return;

    try {
      // 直接Blob URLを生成
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setError(null);

      // クリーンアップ関数
      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (e) {
      console.error('PDFファイルURLの生成エラー:', e);
      setError('PDFファイルの表示中にエラーが発生しました');
    }
  }, [file]);

  // エラー表示
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-red-500">
        <p className="mb-2">{error}</p>
        <Button variant="outline" onClick={onChangeFile}>
          別のファイルを選択
        </Button>
      </div>
    );
  }

  // PDFが読み込まれるまで待機表示
  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 実際のPDF表示
  return (
    <div className="relative w-full h-full">
      <iframe 
        src={pdfUrl}
        className="w-full h-full border-0"
        title="PDF ビューア"
      />
      <div className="absolute top-4 right-4 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-white text-gray-700 border border-gray-300"
          onClick={() => window.open(pdfUrl, '_blank')}
        >
          新しいタブで開く
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-white text-gray-700 border border-gray-300"
          onClick={onChangeFile}
        >
          <FileUp className="mr-2 h-4 w-4" />
          ファイルを変更
        </Button>
      </div>
    </div>
  );
};

export default SimplePDFViewer;