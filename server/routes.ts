import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTextBoxSchema, insertAnalysisSchema, insertSheetSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes for our application
  
  // Sheet routes
  app.get("/api/sheets/analysis/:analysisId", async (req, res) => {
    const analysisId = parseInt(req.params.analysisId, 10);
    if (isNaN(analysisId)) {
      return res.status(400).json({ message: "Invalid analysis ID" });
    }
    
    const sheets = await storage.getSheetsByAnalysisId(analysisId);
    res.json(sheets);
  });
  
  app.get("/api/sheets/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid sheet ID" });
    }
    
    const sheet = await storage.getSheet(id);
    if (!sheet) {
      return res.status(404).json({ message: "Sheet not found" });
    }
    
    res.json(sheet);
  });
  
  app.post("/api/sheets", async (req, res) => {
    try {
      const sheetData = insertSheetSchema.parse(req.body);
      const sheet = await storage.createSheet(sheetData);
      res.status(201).json(sheet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sheet data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create sheet" });
    }
  });
  
  app.patch("/api/sheets/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid sheet ID" });
    }
    
    try {
      const updateData = insertSheetSchema.partial().parse(req.body);
      const updatedSheet = await storage.updateSheet(id, updateData);
      
      if (!updatedSheet) {
        return res.status(404).json({ message: "Sheet not found" });
      }
      
      res.json(updatedSheet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid update data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update sheet" });
    }
  });
  
  app.delete("/api/sheets/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid sheet ID" });
    }
    
    const deleted = await storage.deleteSheet(id);
    if (!deleted) {
      return res.status(404).json({ message: "Sheet not found" });
    }
    
    res.status(204).end();
  });
  
  // TextBox routes
  app.get("/api/textboxes/:sheetId", async (req, res) => {
    const sheetId = parseInt(req.params.sheetId, 10);
    if (isNaN(sheetId)) {
      return res.status(400).json({ message: "Invalid sheet ID" });
    }
    
    const textBoxes = await storage.getTextBoxesBySheetId(sheetId);
    res.json(textBoxes);
  });
  
  app.post("/api/textboxes", async (req, res) => {
    try {
      const textBoxData = insertTextBoxSchema.parse(req.body);
      const textBox = await storage.createTextBox(textBoxData);
      res.status(201).json(textBox);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid text box data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create text box" });
    }
  });
  
  app.patch("/api/textboxes/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid text box ID" });
    }
    
    try {
      const updateData = insertTextBoxSchema.partial().parse(req.body);
      const updatedTextBox = await storage.updateTextBox(id, updateData);
      
      if (!updatedTextBox) {
        return res.status(404).json({ message: "Text box not found" });
      }
      
      res.json(updatedTextBox);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid update data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update text box" });
    }
  });
  
  app.delete("/api/textboxes/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid text box ID" });
    }
    
    const deleted = await storage.deleteTextBox(id);
    if (!deleted) {
      return res.status(404).json({ message: "Text box not found" });
    }
    
    res.status(204).end();
  });
  
  // Analysis routes
  app.get("/api/analyses", async (req, res) => {
    const analyses = await storage.getAnalyses();
    res.json(analyses);
  });
  
  app.get("/api/analyses/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid analysis ID" });
    }
    
    const analysis = await storage.getAnalysis(id);
    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }
    
    res.json(analysis);
  });
  
  app.post("/api/analyses", async (req, res) => {
    try {
      const analysisData = insertAnalysisSchema.parse(req.body);
      const analysis = await storage.createAnalysis(analysisData);
      res.status(201).json(analysis);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid analysis data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create analysis" });
    }
  });
  
  app.patch("/api/analyses/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid analysis ID" });
    }
    
    try {
      const updateData = insertAnalysisSchema.partial().parse(req.body);
      const updatedAnalysis = await storage.updateAnalysis(id, updateData);
      
      if (!updatedAnalysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      
      res.json(updatedAnalysis);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid update data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update analysis" });
    }
  });
  
  app.delete("/api/analyses/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid analysis ID" });
    }
    
    const deleted = await storage.deleteAnalysis(id);
    if (!deleted) {
      return res.status(404).json({ message: "Analysis not found" });
    }
    
    res.status(204).end();
  });

  // 自動保存用のエンドポイント
  app.post("/api/autosave/:analysisId", async (req, res) => {
    const analysisId = parseInt(req.params.analysisId, 10);
    if (isNaN(analysisId)) {
      return res.status(400).json({ message: "Invalid analysis ID" });
    }
    
    try {
      const autosaveAnalysis = await storage.autoSaveAnalysis(analysisId);
      if (!autosaveAnalysis) {
        return res.status(404).json({ message: "Analysis not found or autosave failed" });
      }
      
      res.json(autosaveAnalysis);
    } catch (error) {
      console.error("Autosave error:", error);
      res.status(500).json({ message: "Failed to create autosave" });
    }
  });
  
  // 最新の自動保存を取得するエンドポイント
  app.get("/api/autosave/last", async (req, res) => {
    try {
      const lastAutosave = await storage.getLastAutosave();
      if (!lastAutosave) {
        return res.status(404).json({ message: "No autosave found" });
      }
      
      res.json(lastAutosave);
    } catch (error) {
      console.error("Error getting last autosave:", error);
      res.status(500).json({ message: "Failed to get last autosave" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
