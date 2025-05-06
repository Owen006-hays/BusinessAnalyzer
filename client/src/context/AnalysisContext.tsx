import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { TextBox, Analysis, Sheet } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface AnalysisContextType {
  // ファイル関連
  pdfFile: File | null;
  setPdfFile: (file: File | null) => void;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  
  // TextBox related
  textBoxes: TextBox[];
  addTextBox: (content: string, x: number, y: number) => void;
  addTextBoxToZone: (content: string, zone: string) => void; // 新機能: テンプレートゾーンに追加
  updateTextBox: (id: number, data: Partial<TextBox>) => void;
  deleteTextBox: (id: number) => void;
  
  // Sheet related
  sheets: Sheet[];
  currentSheetId: number;
  setCurrentSheetId: (sheetId: number) => void;
  addSheet: (name: string) => void;
  updateSheet: (id: number, data: Partial<Sheet>) => void;
  deleteSheet: (id: number) => void;
  
  // Template related
  currentTemplate: string | null;
  setCurrentTemplate: (template: string | null) => void;
  setTextBoxesByZone: (template: string) => void;
  getZonesForTemplate: (template: string | null) => string[]; // テンプレートごとのゾーン名を取得
  
  // Analysis related
  analysisId: number;
  analysisName: string;
  setAnalysisName: (name: string) => void;
  saveAnalysis: () => Promise<void>;
  loadAnalysis: (id: number) => Promise<void>;
  exportAsImage: () => Promise<void>;
  exportAsPDF: () => Promise<void>;
  
  // Refs
  canvasRef: React.RefObject<HTMLDivElement>;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  // State for file uploads
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // State for analysis
  const [analysisId, setAnalysisId] = useState<number>(1); // Default analysis ID
  const [analysisName, setAnalysisName] = useState<string>("New Analysis");
  
  // State for text boxes
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  // テキストボックスのキャッシュをシートごとに管理（シート間移動時に位置を維持するため）
  const [textBoxesCache, setTextBoxesCache] = useState<Map<number, TextBox[]>>(new Map());
  
  // State for sheets
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [currentSheetId, setCurrentSheetId] = useState<number>(1); // デフォルトシートID
  
  // テンプレートの状態はシートIDごとに管理
  const [templateMap, setTemplateMap] = useState<Map<number, string | null>>(new Map());
  
  // 現在のテンプレート（現在のシートに関連付けられたもの）
  const currentTemplate = templateMap.get(currentSheetId) || null;
  
  // テンプレートを設定するラッパー関数
  const setCurrentTemplate = useCallback((template: string | null) => {
    setTemplateMap(prev => {
      const newMap = new Map(prev);
      newMap.set(currentSheetId, template);
      return newMap;
    });
  }, [currentSheetId]);
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Fetch sheets for the current analysis
  useEffect(() => {
    const fetchSheets = async () => {
      try {
        const response = await fetch(`/api/sheets/analysis/${analysisId}`);
        if (response.ok) {
          const data = await response.json();
          setSheets(data);
          
          // シートが存在する場合は最初のシートを選択し、テンプレート情報も取得
          if (data.length > 0) {
            setCurrentSheetId(data[0].id);
            
            // 各シートのテンプレート情報をMapに登録
            const newTemplateMap = new Map<number, string | null>();
            data.forEach((sheet: Sheet) => {
              newTemplateMap.set(sheet.id, sheet.template);
            });
            setTemplateMap(newTemplateMap);
          }
        }
      } catch (error) {
        console.error("Error fetching sheets:", error);
      }
    };
    
    fetchSheets();
  }, [analysisId]);
  
  // Fetch text boxes for the current sheet and maintain cache
  useEffect(() => {
    const fetchTextBoxes = async () => {
      try {
        // まずキャッシュからテキストボックスを取得
        const cachedBoxes = textBoxesCache.get(currentSheetId);
        if (cachedBoxes) {
          console.log(`Using cached text boxes for sheet ${currentSheetId}`);
          setTextBoxes(cachedBoxes);
          return;
        }
        
        // キャッシュになければAPIから取得
        const response = await fetch(`/api/textboxes/${currentSheetId}`);
        if (response.ok) {
          const data = await response.json();
          setTextBoxes(data);
          
          // キャッシュに保存
          setTextBoxesCache(prev => {
            const newCache = new Map(prev);
            newCache.set(currentSheetId, data);
            return newCache;
          });
        }
      } catch (error) {
        console.error("Error fetching text boxes:", error);
      }
    };
    
    fetchTextBoxes();
  }, [currentSheetId, textBoxesCache]);
  
  // Mutations for sheets
  const createSheetMutation = useMutation({
    mutationFn: async (sheet: Omit<Sheet, "id">) => {
      const res = await apiRequest("POST", "/api/sheets", sheet);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sheets/analysis", analysisId] });
      // Re-fetch sheets
      fetch(`/api/sheets/analysis/${analysisId}`)
        .then(res => res.json())
        .then(data => {
          setSheets(data);
          
          // 新しいシートが作成された場合、それを選択
          if (data.length > 0) {
            const newSheetId = data[data.length - 1].id;
            setCurrentSheetId(newSheetId);
            
            // テンプレートマップを更新
            setTemplateMap(prev => {
              const newMap = new Map(prev);
              data.forEach((sheet: Sheet) => {
                newMap.set(sheet.id, sheet.template);
              });
              return newMap;
            });
          }
        })
        .catch(err => console.error("Error refetching sheets:", err));
    },
  });
  
  const updateSheetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Sheet> }) => {
      const res = await apiRequest("PATCH", `/api/sheets/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sheets/analysis", analysisId] });
      // Re-fetch sheets
      fetch(`/api/sheets/analysis/${analysisId}`)
        .then(res => res.json())
        .then(data => {
          setSheets(data);
          
          // テンプレートマップを更新
          setTemplateMap(prev => {
            const newMap = new Map(prev);
            data.forEach((sheet: Sheet) => {
              newMap.set(sheet.id, sheet.template);
            });
            return newMap;
          });
        })
        .catch(err => console.error("Error refetching sheets:", err));
    },
  });
  
  const deleteSheetMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/sheets/${id}`);
    },
    onSuccess: (_, deletedSheetId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sheets/analysis", analysisId] });
      // Re-fetch sheets
      fetch(`/api/sheets/analysis/${analysisId}`)
        .then(res => res.json())
        .then(data => {
          setSheets(data);
          
          // シートが削除された場合、最初のシートを選択
          if (data.length > 0) {
            setCurrentSheetId(data[0].id);
            
            // テンプレートマップを更新
            setTemplateMap(prev => {
              const newMap = new Map<number, string | null>();
              data.forEach((sheet: Sheet) => {
                newMap.set(sheet.id, sheet.template);
              });
              return newMap;
            });
            
            // 削除されたシートのテキストボックスキャッシュを削除
            setTextBoxesCache(prev => {
              const newCache = new Map(prev);
              newCache.delete(deletedSheetId);
              return newCache;
            });
          }
        })
        .catch(err => console.error("Error refetching sheets:", err));
    },
  });

  // Mutations for text boxes
  const createTextBoxMutation = useMutation({
    mutationFn: async (textBox: Omit<TextBox, "id">) => {
      const res = await apiRequest("POST", "/api/textboxes", textBox);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/textboxes", currentSheetId] });
      // Re-fetch text boxes
      fetch(`/api/textboxes/${currentSheetId}`)
        .then(res => res.json())
        .then(data => {
          setTextBoxes(data);
          // キャッシュも更新
          setTextBoxesCache(prev => {
            const newCache = new Map(prev);
            newCache.set(currentSheetId, data);
            return newCache;
          });
        })
        .catch(err => console.error("Error refetching text boxes:", err));
    },
  });
  
  const updateTextBoxMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TextBox> }) => {
      const res = await apiRequest("PATCH", `/api/textboxes/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/textboxes", currentSheetId] });
      // Re-fetch text boxes
      fetch(`/api/textboxes/${currentSheetId}`)
        .then(res => res.json())
        .then(data => {
          setTextBoxes(data);
          // キャッシュも更新
          setTextBoxesCache(prev => {
            const newCache = new Map(prev);
            newCache.set(currentSheetId, data);
            return newCache;
          });
        })
        .catch(err => console.error("Error refetching text boxes:", err));
    },
  });
  
  const deleteTextBoxMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/textboxes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/textboxes", currentSheetId] });
      // Re-fetch text boxes
      fetch(`/api/textboxes/${currentSheetId}`)
        .then(res => res.json())
        .then(data => {
          setTextBoxes(data);
          // キャッシュも更新
          setTextBoxesCache(prev => {
            const newCache = new Map(prev);
            newCache.set(currentSheetId, data);
            return newCache;
          });
        })
        .catch(err => console.error("Error refetching text boxes:", err));
    },
  });
  
  // Mutations for analysis
  const updateAnalysisMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Analysis> }) => {
      const res = await apiRequest("PATCH", `/api/analyses/${id}`, data);
      return res.json();
    },
  });
  
  // Add a new text box
  const addTextBox = useCallback((content: string, x: number, y: number) => {
    createTextBoxMutation.mutate({
      content,
      x,
      y,
      width: 200,
      height: null,
      color: "white",
      sheetId: currentSheetId,
      zone: null, // zoneプロパティを追加
    });
  }, [currentSheetId, createTextBoxMutation]);
  
  // 新機能: テンプレートの特定ゾーンにテキストボックスを追加
  const addTextBoxToZone = useCallback((content: string, zone: string) => {
    if (!currentTemplate) {
      // テンプレートが選択されていない場合は、通常のテキストボックスとして追加
      addTextBox(content, 100, 100);
      return;
    }
    
    // まずテンプレートを選択する（まだ選択されていない場合）
    if (currentTemplate !== 'swot' && currentTemplate !== '4p' && 
        currentTemplate !== '3c' && currentTemplate !== 'pest') {
      setCurrentTemplate('swot');
    }
    
    // 少し遅延を入れて、テンプレートが描画された後にゾーン検索を行う
    setTimeout(() => {
      if (!canvasRef.current) return;
      
      // ゾーン要素を検索
      const zoneElement = canvasRef.current.querySelector(`[data-zone="${zone}"]`) as HTMLElement;
      
      // ゾーンが見つからない場合はデフォルトの位置に配置
      let x = 100;
      let y = 100;
      let zoneWidth = 180;
      
      if (zoneElement) {
        // ゾーンの位置を取得
        const zoneRect = zoneElement.getBoundingClientRect();
        const canvasRect = canvasRef.current.getBoundingClientRect();
        
        // ゾーン内の相対位置を計算 (中央に配置)
        x = (zoneRect.left - canvasRect.left) + 20; // 左端から少し余白を取る
        y = (zoneRect.top - canvasRect.top) + 20;  // 上端から少し余白を取る
        zoneWidth = zoneRect.width;
      }
      
      // テンプレートに応じた色を設定
      let color = "white";
      switch (zone) {
        // SWOT分析のゾーン
        case "strengths": color = "blue"; break;
        case "weaknesses": color = "red"; break;
        case "opportunities": color = "green"; break;
        case "threats": color = "yellow"; break;
        
        // 3C分析のゾーン
        case "company": color = "blue"; break;
        case "customer": color = "green"; break;
        case "competitor": color = "yellow"; break;
        
        // 4P分析のゾーン
        case "product": color = "purple"; break;
        case "price": color = "purple"; break;
        case "place": color = "blue"; break;
        case "promotion": color = "green"; break;
        
        // PEST分析のゾーン
        case "political": color = "purple"; break;
        case "economic": color = "blue"; break;
        case "social": color = "green"; break;
        case "technological": color = "blue"; break;
        
        // 5Force分析のゾーン
        case "supplier_power": color = "amber"; break;
        case "buyer_power": color = "indigo"; break;
        case "new_entrants": color = "red"; break;
        case "substitutes": color = "green"; break;
        case "industry_rivalry": color = "blue"; break;
        
        // サプライチェーン分析のゾーン
        case "suppliers": color = "purple"; break;
        case "inbound_logistics": color = "blue"; break;
        case "manufacturing": color = "teal"; break;
        case "outbound_logistics": color = "cyan"; break;
        case "customers": color = "green"; break;
        case "challenges": color = "amber"; break;
        case "improvements": color = "rose"; break;
        
        // バリューチェーン分析のゾーン
        case "vc_inbound_logistics": color = "blue"; break;
        case "vc_operations": color = "teal"; break;
        case "vc_outbound_logistics": color = "cyan"; break;
        case "vc_marketing_sales": color = "indigo"; break;
        case "vc_service": color = "violet"; break;
        case "vc_infrastructure": color = "purple"; break;
        case "vc_hr_management": color = "pink"; break;
        case "vc_technology": color = "rose"; break;
        case "vc_procurement": color = "amber"; break;
        case "vc_strengths": color = "green"; break;
        case "vc_improvements": color = "red"; break;
      }
      
      // テキストボックスを追加
      createTextBoxMutation.mutate({
        content,
        x,
        y,
        width: Math.min(zoneWidth - 50, 200), // ゾーン幅に合わせる (余白を考慮)
        height: null,
        color,
        sheetId: currentSheetId,
        zone, // ゾーン情報を保存
      });
    }, 100); // 100ms遅延
  }, [currentSheetId, createTextBoxMutation, canvasRef, currentTemplate, setCurrentTemplate, addTextBox]);
  
  // テンプレートごとのゾーン名を取得
  const getZonesForTemplate = useCallback((template: string | null): string[] => {
    if (!template) return [];
    
    switch (template) {
      case "swot":
        return ["strengths", "weaknesses", "opportunities", "threats"];
      case "4p":
        return ["product", "price", "place", "promotion"];
      case "3c":
        return ["company", "customer", "competitor"];
      case "pest":
        return ["political", "economic", "social", "technological"];
      case "5force":
        return ["supplier_power", "buyer_power", "new_entrants", "substitutes", "industry_rivalry"];
      case "supply_chain":
        return ["suppliers", "inbound_logistics", "manufacturing", "outbound_logistics", "customers", "challenges", "improvements"];
      case "value_chain":
        return [
          "vc_inbound_logistics", "vc_operations", "vc_outbound_logistics", "vc_marketing_sales", "vc_service",
          "vc_infrastructure", "vc_hr_management", "vc_technology", "vc_procurement",
          "vc_strengths", "vc_improvements"
        ];
      default:
        return [];
    }
  }, []);
  
  // Update an existing text box
  const updateTextBox = useCallback((id: number, data: Partial<TextBox>) => {
    updateTextBoxMutation.mutate({ id, data });
  }, [updateTextBoxMutation]);
  
  // Delete a text box
  const deleteTextBox = useCallback((id: number) => {
    deleteTextBoxMutation.mutate(id);
  }, [deleteTextBoxMutation]);
  
  // Add a new sheet
  const addSheet = useCallback((name: string) => {
    createSheetMutation.mutate({
      name,
      analysisId,
      template: null, // 新規シートはテンプレートなし
      order: sheets.length, // 新しいシートは最後に追加
    });
  }, [analysisId, createSheetMutation, sheets.length]);
  
  // Update an existing sheet
  const updateSheet = useCallback((id: number, data: Partial<Sheet>) => {
    updateSheetMutation.mutate({ id, data });
  }, [updateSheetMutation]);
  
  // Delete a sheet
  const deleteSheet = useCallback((id: number) => {
    // シートが1つだけの場合は削除しない
    if (sheets.length <= 1) {
      console.warn("Cannot delete the last sheet");
      return;
    }
    deleteSheetMutation.mutate(id);
  }, [sheets.length, deleteSheetMutation]);
  
  // Organize text boxes into template zones
  const setTextBoxesByZone = useCallback((template: string) => {
    // テンプレートはシートごとに設定するように変更
    if (sheets.length > 0) {
      // 現在のシートのテンプレートを更新
      updateSheetMutation.mutate({
        id: currentSheetId,
        data: { template },
      });
    }
  }, [currentSheetId, updateSheetMutation, sheets.length]);
  
  // Save the current analysis
  const saveAnalysis = useCallback(async () => {
    // 分析自体の情報を保存
    await updateAnalysisMutation.mutateAsync({
      id: analysisId,
      data: {
        name: analysisName,
        pdfName: pdfFile?.name || null,
        // 画像ファイル情報があれば保存
        imageName: imageFile?.name || null,
      },
    });

    // テンプレート情報は現在のシートに保存
    if (sheets.length > 0) {
      await updateSheetMutation.mutateAsync({
        id: currentSheetId,
        data: { template: currentTemplate },
      });
    }
  }, [
    analysisId, 
    analysisName, 
    pdfFile, 
    imageFile, 
    updateAnalysisMutation, 
    sheets.length, 
    currentSheetId, 
    currentTemplate, 
    updateSheetMutation
  ]);
  
  // Load an analysis by ID
  const loadAnalysis = useCallback(async (id: number) => {
    try {
      // 分析の基本情報を取得
      const res = await fetch(`/api/analyses/${id}`);
      const analysis: Analysis = await res.json();
      
      setAnalysisId(analysis.id);
      setAnalysisName(analysis.name);
      
      // シート情報を取得
      const sheetsRes = await fetch(`/api/sheets/analysis/${id}`);
      if (sheetsRes.ok) {
        const sheetsData = await sheetsRes.json();
        setSheets(sheetsData);
        
        if (sheetsData.length > 0) {
          // 最初のシートを選択
          const firstSheet = sheetsData[0];
          setCurrentSheetId(firstSheet.id);
          
          // 各シートのテンプレート情報をMapに登録
          const newTemplateMap = new Map<number, string | null>();
          sheetsData.forEach((sheet: Sheet) => {
            newTemplateMap.set(sheet.id, sheet.template);
          });
          setTemplateMap(newTemplateMap);
          
          // シートに関連するテキストボックスを取得
          const textBoxesRes = await fetch(`/api/textboxes/${firstSheet.id}`);
          if (textBoxesRes.ok) {
            const textBoxesData = await textBoxesRes.json();
            setTextBoxes(textBoxesData);
          }
        }
      }
    } catch (error) {
      console.error("Error loading analysis:", error);
    }
  }, []);
  
  // Export analysis as image - シンプルな実装
  const exportAsImage = useCallback(async () => {
    if (!canvasRef.current) return;
    
    try {
      // 単純化した方法でキャプチャ
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: "white",
        scale: 2, // 高解像度で出力
        useCORS: true,
        allowTaint: true,
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${analysisName.replace(/\s+/g, '_')}_export.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error("画像エクスポートエラー:", error);
      throw error;
    }
  }, [analysisName]);
  
  // Export analysis as PDF - シンプルな実装
  const exportAsPDF = useCallback(async () => {
    if (!canvasRef.current) return;
    
    try {
      // 単純化した方法でキャプチャ
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: "white",
        scale: 2, // 高解像度で出力
        useCORS: true,
        allowTaint: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // 画像のアスペクト比に基づいてPDFの向きを選択
      const isLandscape = canvas.width > canvas.height;
      
      const pdf = new jsPDF({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "mm",
        format: "a4", // 標準のA4サイズを使用
      });
      
      // PDFのサイズを取得
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // キャンバスのアスペクト比を維持しながらPDFに合わせる
      const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;
      
      // 中央に配置するための余白を計算
      const marginX = (pdfWidth - imgWidth) / 2;
      const marginY = (pdfHeight - imgHeight) / 2;
      
      // 画像をPDFに追加
      pdf.addImage(imgData, 'PNG', marginX, marginY, imgWidth, imgHeight);
      
      // PDFを保存
      pdf.save(`${analysisName.replace(/\s+/g, '_')}_export.pdf`);
    } catch (error) {
      console.error("PDFエクスポートエラー:", error);
      throw error;
    }
  }, [analysisName]);

  const value = {
    // ファイル関連
    pdfFile,
    setPdfFile,
    imageFile,
    setImageFile,
    
    // TextBox関連
    textBoxes,
    addTextBox,
    addTextBoxToZone,
    updateTextBox,
    deleteTextBox,
    
    // Sheet関連
    sheets,
    currentSheetId,
    setCurrentSheetId,
    addSheet,
    updateSheet,
    deleteSheet,
    
    // Template関連
    currentTemplate,
    setCurrentTemplate,
    setTextBoxesByZone,
    getZonesForTemplate,
    
    // Analysis関連
    analysisId,
    analysisName,
    setAnalysisName,
    saveAnalysis,
    loadAnalysis,
    exportAsImage,
    exportAsPDF,
    
    // Refs
    canvasRef,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysisContext = () => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error("useAnalysisContext must be used within an AnalysisProvider");
  }
  return context;
};
