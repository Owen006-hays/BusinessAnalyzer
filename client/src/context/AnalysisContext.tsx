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
  updateTextBox: (id: number, data: Partial<TextBox>) => void;
  deleteTextBox: (id: number) => void;
  
  // Template related
  currentTemplate: string | null;
  setCurrentTemplate: (template: string | null) => void;
  setTextBoxesByZone: (template: string) => void;
  
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
    });
  }, [analysisId, createTextBoxMutation]);
  
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
    updateTextBox,
    deleteTextBox,
    currentTemplate,
    setCurrentTemplate,
    setTextBoxesByZone,
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
