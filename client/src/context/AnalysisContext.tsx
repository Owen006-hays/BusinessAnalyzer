import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { TextBox, Analysis } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import html2canvas from "html2canvas";

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
  
  // State for template
  const [currentTemplate, setCurrentTemplate] = useState<string | null>(null);
  
  // State for textboxes
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Fetch text boxes for the current analysis
  useEffect(() => {
    const fetchTextBoxes = async () => {
      try {
        const response = await fetch(`/api/textboxes/${analysisId}`);
        if (response.ok) {
          const data = await response.json();
          setTextBoxes(data);
        }
      } catch (error) {
        console.error("Error fetching text boxes:", error);
      }
    };
    
    fetchTextBoxes();
  }, [analysisId]);
  
  // Mutations for text boxes
  const createTextBoxMutation = useMutation({
    mutationFn: async (textBox: Omit<TextBox, "id">) => {
      const res = await apiRequest("POST", "/api/textboxes", textBox);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/textboxes", analysisId] });
      // Re-fetch text boxes
      fetch(`/api/textboxes/${analysisId}`)
        .then(res => res.json())
        .then(data => setTextBoxes(data))
        .catch(err => console.error("Error refetching text boxes:", err));
    },
  });
  
  const updateTextBoxMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TextBox> }) => {
      const res = await apiRequest("PATCH", `/api/textboxes/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/textboxes", analysisId] });
      // Re-fetch text boxes
      fetch(`/api/textboxes/${analysisId}`)
        .then(res => res.json())
        .then(data => setTextBoxes(data))
        .catch(err => console.error("Error refetching text boxes:", err));
    },
  });
  
  const deleteTextBoxMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/textboxes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/textboxes", analysisId] });
      // Re-fetch text boxes
      fetch(`/api/textboxes/${analysisId}`)
        .then(res => res.json())
        .then(data => setTextBoxes(data))
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
      analysisId,
      zone: null, // zoneプロパティを追加
    });
  }, [analysisId, createTextBoxMutation]);
  
  // 新機能: テンプレートの特定ゾーンにテキストボックスを追加
  const addTextBoxToZone = useCallback((content: string, zone: string) => {
    if (!canvasRef.current || !currentTemplate) return;
    
    // ゾーン要素を検索
    const zoneElement = canvasRef.current.querySelector(`[data-zone="${zone}"]`) as HTMLElement;
    if (!zoneElement) return;
    
    // ゾーンの位置を取得
    const zoneRect = zoneElement.getBoundingClientRect();
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    // ゾーン内の相対位置を計算 (中央に配置)
    const x = (zoneRect.left - canvasRect.left) + 20; // 左端から少し余白を取る
    const y = (zoneRect.top - canvasRect.top) + 20;  // 上端から少し余白を取る
    
    // テンプレートに応じた色を設定
    let color = "white";
    switch (zone) {
      case "strengths": color = "blue"; break;
      case "weaknesses": color = "red"; break;
      case "opportunities": color = "green"; break;
      case "threats": color = "yellow"; break;
      case "company": color = "blue"; break;
      case "customer": color = "green"; break;
      case "competitor": color = "yellow"; break;
      case "product": color = "purple"; break;
      case "price": color = "purple"; break;
      case "place": color = "blue"; break;
      case "promotion": color = "green"; break;
      case "political": color = "purple"; break;
      case "economic": color = "blue"; break;
      case "social": color = "green"; break;
      case "technological": color = "blue"; break;
    }
    
    // テキストボックスを追加
    createTextBoxMutation.mutate({
      content,
      x,
      y,
      width: Math.min(zoneRect.width - 50, 200), // ゾーン幅に合わせる (余白を考慮)
      height: null,
      color,
      analysisId,
      zone, // ゾーン情報を保存
    });
  }, [analysisId, createTextBoxMutation, canvasRef, currentTemplate]);
  
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
  
  // Organize text boxes into template zones
  const setTextBoxesByZone = useCallback((template: string) => {
    // This would position text boxes in their respective template zones
    // For now, we just update the template property of the analysis
    updateAnalysisMutation.mutate({
      id: analysisId,
      data: { template },
    });
  }, [analysisId, updateAnalysisMutation]);
  
  // Save the current analysis
  const saveAnalysis = useCallback(async () => {
    await updateAnalysisMutation.mutateAsync({
      id: analysisId,
      data: {
        name: analysisName,
        template: currentTemplate,
        pdfName: pdfFile?.name || null,
        // 画像ファイル情報があれば保存
        imageName: imageFile?.name || null,
      },
    });
  }, [analysisId, analysisName, currentTemplate, pdfFile, imageFile, updateAnalysisMutation]);
  
  // Load an analysis by ID
  const loadAnalysis = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/analyses/${id}`);
      const analysis: Analysis = await res.json();
      
      setAnalysisId(analysis.id);
      setAnalysisName(analysis.name);
      setCurrentTemplate(analysis.template);
      
      // Fetch text boxes for this analysis
      const textBoxesRes = await fetch(`/api/textboxes/${id}`);
      if (textBoxesRes.ok) {
        const textBoxesData = await textBoxesRes.json();
        setTextBoxes(textBoxesData);
      }
    } catch (error) {
      console.error("Error loading analysis:", error);
    }
  }, []);
  
  // Export analysis as image
  const exportAsImage = useCallback(async () => {
    if (!canvasRef.current) return;
    
    const canvas = await html2canvas(canvasRef.current, {
      backgroundColor: "white",
      scale: 2,
    });
    
    // Create download link
    const link = document.createElement('a');
    link.download = `${analysisName.replace(/\s+/g, '_')}_export.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [analysisName]);

  const value = {
    pdfFile,
    setPdfFile,
    imageFile,
    setImageFile,
    textBoxes,
    addTextBox,
    addTextBoxToZone, // 新機能を追加
    updateTextBox,
    deleteTextBox,
    currentTemplate,
    setCurrentTemplate,
    setTextBoxesByZone,
    getZonesForTemplate, // 新機能を追加
    analysisId,
    analysisName,
    setAnalysisName,
    saveAnalysis,
    loadAnalysis,
    exportAsImage,
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
