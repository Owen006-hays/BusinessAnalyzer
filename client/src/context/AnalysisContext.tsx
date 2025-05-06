import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { TextBox, Analysis, Sheet } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";

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
  autoSaveAnalysis: () => Promise<void>; // 自動保存機能
  checkForAutosave: () => Promise<Analysis | undefined>; // 自動保存の確認機能
  loadAutosave: () => Promise<void>; // 自動保存からの読み込み機能
  exportAsImage: () => Promise<void>;
  exportAsPDF: () => Promise<void>;
  
  // Analyses management
  availableAnalyses: Analysis[]; // 利用可能な分析一覧
  refreshAnalyses: () => void; // 分析一覧を更新
  
  // Refs
  canvasRef: React.RefObject<HTMLDivElement>;
  isSaving: boolean; // 保存中かどうかのフラグ
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
  
  // State for analyses list and saving status
  const [availableAnalyses, setAvailableAnalyses] = useState<Analysis[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // テンプレートの状態はシートIDごとに管理
  const [templateMap, setTemplateMap] = useState<Map<number, string | null>>(new Map());
  
  // 現在のテンプレート（現在のシートに関連付けられたもの）
  const currentTemplate = templateMap.get(currentSheetId) || null;
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Toast utility
  const { toast } = useToast();
  
  // 利用可能な分析一覧を取得
  const fetchAnalyses = useCallback(async () => {
    try {
      const response = await fetch('/api/analyses');
      if (response.ok) {
        const data = await response.json();
        setAvailableAnalyses(data);
      }
    } catch (error) {
      console.error("Error fetching analyses:", error);
    }
  }, []);
  
  // 初回読み込み時に分析一覧を取得
  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);
  
  const refreshAnalyses = useCallback(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);
  
  // テンプレートを設定するラッパー関数
  const setCurrentTemplate = useCallback((template: string | null) => {
    setTemplateMap(prev => {
      const newMap = new Map(prev);
      newMap.set(currentSheetId, template);
      return newMap;
    });
  }, [currentSheetId]);
  
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
  
  // Helper function to get zones for a given template
  const getZonesForTemplate = useCallback((template: string | null): string[] => {
    if (!template) return [];
    
    switch (template) {
      case "SWOT":
        return ["strengths", "weaknesses", "opportunities", "threats"];
      case "4P":
        return ["product", "price", "place", "promotion"];
      case "3C":
        return ["company", "competitor", "customer"];
      case "PEST":
        return ["political", "economic", "social", "technological"];
      case "Five Forces":
        return ["rivalry", "newEntrants", "supplierPower", "buyerPower", "substitutes"];
      case "Supply Chain":
        return ["supply", "inboundLogistics", "operations", "outboundLogistics", "marketing", "service"];
      case "Value Chain":
        return ["inboundLogistics", "operations", "outboundLogistics", "marketing", "service", "infrastructure", "humanResources", "technology", "procurement"];
      case "VRIO":
        return ["value", "rarity", "imitability", "organization"];
      default:
        return [];
    }
  }, []);
  
  // Function to add text boxes according to zones in template
  const setTextBoxesByZone = useCallback((template: string) => {
    setCurrentTemplate(template);
    
    // 既存のテキストボックスをすべて保持
    // （テンプレート切り替え時にユーザーのテキストボックスを消さない）
  }, [setCurrentTemplate]);
  
  // Add a text box
  const addTextBox = useCallback((content: string, x: number, y: number) => {
    const newTextBox: Omit<TextBox, "id"> = {
      content,
      x,
      y,
      width: 200,
      height: null,
      color: "white",
      zone: null,
      sheetId: currentSheetId,
    };
    
    createTextBoxMutation.mutate(newTextBox);
  }, [currentSheetId, createTextBoxMutation]);
  
  // Function to add text box to a specific zone
  const addTextBoxToZone = useCallback((content: string, zone: string) => {
    // ゾーンが存在しない場合は追加しない
    if (!zone || !getZonesForTemplate(currentTemplate).includes(zone)) {
      console.error("Invalid zone:", zone);
      return;
    }
    
    // Find a suitable position in the zone
    // This is a simplified example, actual positioning would depend on your UI
    let x = 50, y = 50;
    
    // Get all text boxes in this zone
    const zoneBoxes = textBoxes.filter(box => box.zone === zone);
    if (zoneBoxes.length > 0) {
      // If there are existing boxes in the zone, position below the last one
      const lastBox = zoneBoxes[zoneBoxes.length - 1];
      x = lastBox.x;
      y = lastBox.y + 100; // Position below the last box
    } else {
      // If no boxes in this zone, position according to the zone
      const zoneIndex = getZonesForTemplate(currentTemplate).indexOf(zone);
      x = 50 + (zoneIndex % 2) * 300; // Two columns
      y = 50 + Math.floor(zoneIndex / 2) * 200; // Rows
    }
    
    const newTextBox: Omit<TextBox, "id"> = {
      content,
      x,
      y,
      width: 200,
      height: null,
      color: "white",
      zone,
      sheetId: currentSheetId,
    };
    
    createTextBoxMutation.mutate(newTextBox);
  }, [currentSheetId, currentTemplate, getZonesForTemplate, textBoxes, createTextBoxMutation]);
  
  // Update a text box
  const updateTextBox = useCallback((id: number, data: Partial<TextBox>) => {
    updateTextBoxMutation.mutate({ id, data });
  }, [updateTextBoxMutation]);
  
  // Delete a text box
  const deleteTextBox = useCallback((id: number) => {
    deleteTextBoxMutation.mutate(id);
  }, [deleteTextBoxMutation]);
  
  // Add a sheet
  const addSheet = useCallback((name: string) => {
    const newSheet: Omit<Sheet, "id"> = {
      name,
      template: null,
      order: sheets.length + 1,
      analysisId,
    };
    
    createSheetMutation.mutate(newSheet);
  }, [sheets.length, analysisId, createSheetMutation]);
  
  // Update a sheet
  const updateSheet = useCallback((id: number, data: Partial<Sheet>) => {
    // If updating the template, also update the template map
    if ('template' in data) {
      setTemplateMap(prev => {
        const newMap = new Map(prev);
        newMap.set(id, data.template || null);
        return newMap;
      });
    }
    
    updateSheetMutation.mutate({ id, data });
  }, [updateSheetMutation]);
  
  // Delete a sheet
  const deleteSheet = useCallback((id: number) => {
    // 唯一のシートを削除しないようにする
    if (sheets.length <= 1) {
      console.error("Cannot delete the only sheet");
      return;
    }
    
    deleteSheetMutation.mutate(id);
  }, [sheets.length, deleteSheetMutation]);
  
  // Save the analysis to the server
  const saveAnalysis = useCallback(async () => {
    try {
      setIsSaving(true);
      // 分析情報を更新
      const response = await fetch(`/api/analyses/${analysisId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: analysisName,
          pdfName: pdfFile?.name || null,
          imageName: imageFile?.name || null,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save analysis");
      }
      
      toast({
        title: "保存完了",
        description: "分析が正常に保存されました",
        duration: 3000,
      });
      
      console.log("Analysis saved successfully");
    } catch (error) {
      console.error("Error saving analysis:", error);
      
      toast({
        title: "エラー",
        description: "保存中にエラーが発生しました",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  }, [analysisId, analysisName, pdfFile, imageFile, toast]);
  
  // Load an analysis from the server
  const loadAnalysis = useCallback(async (id: number) => {
    try {
      setIsSaving(true);
      // 分析情報を取得
      const response = await fetch(`/api/analyses/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analysis");
      }
      
      const analysis: Analysis = await response.json();
      
      // シート情報を直接取得して処理（テンプレート情報も含む）
      const sheetsResponse = await fetch(`/api/sheets/analysis/${id}`);
      if (!sheetsResponse.ok) {
        throw new Error("Failed to fetch sheets");
      }
      
      const sheets = await sheetsResponse.json();
      setSheets(sheets);
      
      // シートのテンプレート情報を復元
      if (sheets.length > 0) {
        // 最初のシートを選択
        setCurrentSheetId(sheets[0].id);
        
        // 各シートのテンプレート情報をMapに登録
        const newTemplateMap = new Map<number, string | null>();
        sheets.forEach((sheet: Sheet) => {
          console.log(`シート ${sheet.id} のテンプレート: ${sheet.template}`);
          newTemplateMap.set(sheet.id, sheet.template);
        });
        
        // テンプレートマップを更新
        setTemplateMap(newTemplateMap);
      }
      
      // テキストボックスのキャッシュをクリア（新しく読み込むため）
      setTextBoxesCache(new Map());
      
      // 状態を更新
      setAnalysisId(analysis.id);
      setAnalysisName(analysis.name);
      
      toast({
        title: "読み込み完了",
        description: `「${analysis.name}」を読み込みました`,
        duration: 3000,
      });
      
      console.log("Analysis loaded successfully");
    } catch (error) {
      console.error("Error loading analysis:", error);
      
      toast({
        title: "エラー",
        description: "読み込み中にエラーが発生しました",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  }, [toast]);
  
  // Autosave function
  const autoSaveAnalysis = useCallback(async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/autosave/${analysisId}`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Autosave failed");
      }
      
      const autosaveData = await response.json();
      
      toast({
        title: "自動保存完了",
        description: "分析が自動保存されました",
        duration: 3000,
      });
      
      console.log("Autosave successful:", autosaveData);
    } catch (error) {
      console.error("Error during autosave:", error);
      
      toast({
        title: "エラー",
        description: "自動保存中にエラーが発生しました",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  }, [analysisId, toast]);
  
  // 自動保存があるか確認する
  const checkForAutosave = useCallback(async (): Promise<Analysis | undefined> => {
    try {
      const response = await fetch('/api/autosave/last');
      
      if (!response.ok) {
        return undefined;
      }
      
      const autosave = await response.json();
      if (!autosave) {
        return undefined;
      }
      
      return autosave;
    } catch (error) {
      console.error("Error checking for autosave:", error);
      return undefined;
    }
  }, []);
  
  // 自動保存から復元する
  const loadAutosave = useCallback(async () => {
    try {
      setIsSaving(true);
      const autosave = await checkForAutosave();
      if (!autosave) {
        toast({
          title: "自動保存なし",
          description: "復元できる自動保存データが見つかりませんでした",
          duration: 3000,
        });
        return;
      }
      
      // 自動保存から読み込む
      await loadAnalysis(autosave.id);
      
      // テンプレート情報が正しく表示されるようUI更新を促す
      toast({
        title: "自動保存から復元",
        description: "最後の自動保存から分析を復元しました",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error loading autosave:", error);
      
      toast({
        title: "エラー",
        description: "自動保存の読み込み中にエラーが発生しました",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  }, [checkForAutosave, loadAnalysis, toast]);
  
  // Export the canvas to an image
  const exportAsImage = useCallback(async () => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: "#ffffff",
        scale: 2, // Higher scale for better quality
      });
      
      // Create a link element
      const link = document.createElement("a");
      link.download = `${analysisName || "analysis"}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "エクスポート完了",
        description: "画像としてエクスポートしました",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error exporting image:", error);
      
      toast({
        title: "エラー",
        description: "画像エクスポート中にエラーが発生しました",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [canvasRef, analysisName, toast]);
  
  // Export the canvas to a PDF
  const exportAsPDF = useCallback(async () => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: "#ffffff",
        scale: 2, // Higher scale for better quality
      });
      
      const imgData = canvas.toDataURL("image/png");
      
      // A4 size in mm: 210 x 297
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
      });
      
      // Calculate aspect ratio to fit the canvas into the PDF
      const imgWidth = 277; // A4 width (297) with 20mm margins
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`${analysisName || "analysis"}.pdf`);
      
      toast({
        title: "エクスポート完了",
        description: "PDFとしてエクスポートしました",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      
      toast({
        title: "エラー",
        description: "PDFエクスポート中にエラーが発生しました",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [canvasRef, analysisName, toast]);
  
  const value: AnalysisContextType = {
    pdfFile,
    setPdfFile,
    imageFile,
    setImageFile,
    textBoxes,
    addTextBox,
    addTextBoxToZone,
    updateTextBox,
    deleteTextBox,
    sheets,
    currentSheetId,
    setCurrentSheetId,
    addSheet,
    updateSheet,
    deleteSheet,
    currentTemplate,
    setCurrentTemplate,
    setTextBoxesByZone,
    getZonesForTemplate,
    analysisId,
    analysisName,
    setAnalysisName,
    saveAnalysis,
    loadAnalysis,
    autoSaveAnalysis,
    checkForAutosave,
    loadAutosave,
    exportAsImage,
    exportAsPDF,
    availableAnalyses,
    refreshAnalyses,
    canvasRef,
    isSaving,
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