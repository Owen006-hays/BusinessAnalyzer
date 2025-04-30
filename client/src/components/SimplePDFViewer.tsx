import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, FileUp } from "lucide-react";

interface SimplePDFViewerProps {
  file: File;
  onChangeFile: () => void;
}

/**
 * 簡素化したPDFビューア
 * ブラウザ標準のPDF表示機能を使用
 */
const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ file, onChangeFile }) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // PDFファイルのURLを生成
  useEffect(() => {
    if (!file) return;
    
    try {
      // ファイルからURLを生成
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      setError(null);
      
      // クリーンアップ関数
      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (err) {
      console.error('PDF URL生成エラー:', err);
      setError('PDFファイルの表示準備中にエラーが発生しました');
    }
  }, [file]);
  
  // サーバー経由のファイルアップロード処理
  const handleServerUpload = async () => {
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`サーバーエラー: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'ファイルのアップロードに失敗しました');
      }
      
      // サーバー上のURLを使用
      setObjectUrl(data.file.url);
      setError(null);
    } catch (err) {
      console.error('サーバーアップロードエラー:', err);
      setError('ファイルのアップロード中にエラーが発生しました');
    }
  };
  
  useEffect(() => {
    // コンポーネントマウント時にサーバーアップロードを試みる
    if (file) {
      handleServerUpload();
    }
  }, []);
  
  // エラー状態の表示
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-500 p-6">
        <div className="bg-red-50 rounded-full w-24 h-24 flex items-center justify-center mb-6">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-12 w-12"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-3 text-red-700">PDFの表示エラー</h2>
        <p className="text-center mb-6 text-gray-700">{error}</p>
        <div className="flex space-x-4">
          <Button
            variant="default"
            className="bg-primary hover:bg-primary-light text-white"
            onClick={onChangeFile}
          >
            <FileUp className="mr-2 h-5 w-5" />
            別のファイルを選択
          </Button>
          <Button
            variant="outline"
            className="hover:bg-red-50"
            onClick={() => handleServerUpload()}
          >
            再試行
          </Button>
        </div>
      </div>
    );
  }
  
  // PDF表示
  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between bg-gray-100 p-3 border-b">
        <div className="font-medium text-gray-700 truncate max-w-[70%]">
          {file.name}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={onChangeFile}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            変更
          </Button>
        </div>
      </div>
      
      {/* PDFビューア - iframeを使用 */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        {objectUrl && (
          <iframe
            src={objectUrl}
            className="w-full h-full"
            title="PDF Viewer"
          />
        )}
      </div>
    </div>
  );
};

export default SimplePDFViewer;