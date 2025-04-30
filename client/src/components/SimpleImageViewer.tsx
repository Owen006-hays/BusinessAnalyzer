import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";

interface SimpleImageViewerProps {
  file: File;
  onChangeFile: () => void;
}

/**
 * シンプルな画像表示コンポーネント
 * ブラウザの標準機能を使って画像を表示する
 */
const SimpleImageViewer: React.FC<SimpleImageViewerProps> = ({ file, onChangeFile }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ファイルからURLを生成
  useEffect(() => {
    if (!file) return;

    try {
      // 直接Blob URLを生成
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setError(null);

      // クリーンアップ関数
      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (e) {
      console.error('画像ファイルURLの生成エラー:', e);
      setError('画像ファイルの表示中にエラーが発生しました');
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

  // 画像が読み込まれるまで待機表示
  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 実際の画像表示（iframe内でレンダリング）
  return (
    <div className="relative w-full h-full">
      <iframe 
        src={imageUrl}
        className="w-full h-full border-0"
        title="画像ビューア"
      />
      <div className="absolute top-4 right-4 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-white text-gray-700 border border-gray-300"
          onClick={() => window.open(imageUrl, '_blank')}
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
          画像を変更
        </Button>
      </div>
    </div>
  );
};

export default SimpleImageViewer;