import { 
  users, type User, type InsertUser,
  textBoxes, type TextBox, type InsertTextBox,
  analyses, type Analysis, type InsertAnalysis,
  sheets, type Sheet, type InsertSheet
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Storage interface for our application
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Sheet methods
  getSheetsByAnalysisId(analysisId: number): Promise<Sheet[]>;
  getSheet(id: number): Promise<Sheet | undefined>;
  createSheet(sheet: InsertSheet): Promise<Sheet>;
  updateSheet(id: number, sheet: Partial<InsertSheet>): Promise<Sheet | undefined>;
  deleteSheet(id: number): Promise<boolean>;
  
  // TextBox methods
  getTextBoxesBySheetId(sheetId: number): Promise<TextBox[]>;
  createTextBox(textBox: InsertTextBox): Promise<TextBox>;
  updateTextBox(id: number, textBox: Partial<InsertTextBox>): Promise<TextBox | undefined>;
  deleteTextBox(id: number): Promise<boolean>;
  
  // Analysis methods
  getAnalyses(): Promise<Analysis[]>;
  getAnalysis(id: number): Promise<Analysis | undefined>;
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  updateAnalysis(id: number, analysis: Partial<InsertAnalysis>): Promise<Analysis | undefined>;
  deleteAnalysis(id: number): Promise<boolean>;
  
  // Auto-save features
  autoSaveAnalysis(analysisId: number): Promise<Analysis | undefined>;
  getLastAutosave(): Promise<Analysis | undefined>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      // Check if there are any analyses in the database
      const existingAnalyses = await db.select().from(analyses);
      
      // If no analyses exist, create a default one
      if (existingAnalyses.length === 0) {
        const defaultAnalysis: InsertAnalysis = {
          name: "New Analysis",
          pdfName: null,
          imageName: null,
          createdAt: new Date().toISOString(),
        };
        
        const [analysis] = await db.insert(analyses).values(defaultAnalysis).returning();
        
        const defaultSheet: InsertSheet = {
          name: "Sheet 1",
          template: null,
          order: 1,
          analysisId: analysis.id,
        };
        
        await db.insert(sheets).values(defaultSheet).returning();
      }
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Sheet methods
  async getSheetsByAnalysisId(analysisId: number): Promise<Sheet[]> {
    return await db
      .select()
      .from(sheets)
      .where(eq(sheets.analysisId, analysisId))
      .orderBy(sheets.order);
  }

  async getSheet(id: number): Promise<Sheet | undefined> {
    const [sheet] = await db.select().from(sheets).where(eq(sheets.id, id));
    return sheet;
  }

  async createSheet(insertSheet: InsertSheet): Promise<Sheet> {
    const [sheet] = await db.insert(sheets).values(insertSheet).returning();
    return sheet;
  }

  async updateSheet(id: number, updateData: Partial<InsertSheet>): Promise<Sheet | undefined> {
    const [updatedSheet] = await db
      .update(sheets)
      .set(updateData)
      .where(eq(sheets.id, id))
      .returning();
    return updatedSheet;
  }

  async deleteSheet(id: number): Promise<boolean> {
    // First delete all text boxes associated with this sheet
    await db.delete(textBoxes).where(eq(textBoxes.sheetId, id));
    
    // Then delete the sheet
    const result = await db.delete(sheets).where(eq(sheets.id, id)).returning();
    return result.length > 0;
  }

  // TextBox methods
  async getTextBoxesBySheetId(sheetId: number): Promise<TextBox[]> {
    return await db.select().from(textBoxes).where(eq(textBoxes.sheetId, sheetId));
  }

  // 後方互換性のため、analysisIdに関連するすべてのシートのテキストボックスを取得するメソッド
  async getTextBoxesByAnalysisId(analysisId: number): Promise<TextBox[]> {
    // まず関連するシートをすべて取得
    const sheetsData = await this.getSheetsByAnalysisId(analysisId);
    const sheetIds = sheetsData.map(sheet => sheet.id);
    
    if (sheetIds.length === 0) return [];
    
    // 各シートに関連するテキストボックスを取得
    const allTextBoxes: TextBox[] = [];
    
    for (const sheetId of sheetIds) {
      const textBoxesData = await this.getTextBoxesBySheetId(sheetId);
      allTextBoxes.push(...textBoxesData);
    }
    
    return allTextBoxes;
  }

  async createTextBox(insertTextBox: InsertTextBox): Promise<TextBox> {
    const [textBox] = await db.insert(textBoxes).values(insertTextBox).returning();
    return textBox;
  }

  async updateTextBox(id: number, updateData: Partial<InsertTextBox>): Promise<TextBox | undefined> {
    const [updatedTextBox] = await db
      .update(textBoxes)
      .set(updateData)
      .where(eq(textBoxes.id, id))
      .returning();
    return updatedTextBox;
  }

  async deleteTextBox(id: number): Promise<boolean> {
    const result = await db.delete(textBoxes).where(eq(textBoxes.id, id)).returning();
    return result.length > 0;
  }

  // Analysis methods
  async getAnalyses(): Promise<Analysis[]> {
    return await db.select().from(analyses).orderBy(desc(analyses.id));
  }

  async getAnalysis(id: number): Promise<Analysis | undefined> {
    const [analysis] = await db.select().from(analyses).where(eq(analyses.id, id));
    return analysis;
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const [analysis] = await db.insert(analyses).values(insertAnalysis).returning();
    return analysis;
  }

  async updateAnalysis(id: number, updateData: Partial<InsertAnalysis>): Promise<Analysis | undefined> {
    const [updatedAnalysis] = await db
      .update(analyses)
      .set(updateData)
      .where(eq(analyses.id, id))
      .returning();
    return updatedAnalysis;
  }

  async deleteAnalysis(id: number): Promise<boolean> {
    // Get all sheets for this analysis
    const analysisSheets = await this.getSheetsByAnalysisId(id);
    
    // Delete all text boxes for each sheet
    for (const sheet of analysisSheets) {
      await db.delete(textBoxes).where(eq(textBoxes.sheetId, sheet.id));
    }
    
    // Delete all sheets for this analysis
    await db.delete(sheets).where(eq(sheets.analysisId, id));
    
    // Finally delete the analysis
    const result = await db.delete(analyses).where(eq(analyses.id, id)).returning();
    return result.length > 0;
  }

  // Auto-save features
  async getLastAutosave(): Promise<Analysis | undefined> {
    // Look for analyses with "Autosave" in the name
    const [autosave] = await db
      .select()
      .from(analyses)
      .where(eq(analyses.name, "Autosave"))
      .orderBy(desc(analyses.createdAt))
      .limit(1);
    
    return autosave;
  }

  async autoSaveAnalysis(analysisId: number): Promise<Analysis | undefined> {
    try {
      // Get the original analysis
      const originalAnalysis = await this.getAnalysis(analysisId);
      if (!originalAnalysis) return undefined;
      
      // Check if an autosave already exists, update it if so
      const existingAutosave = await db
        .select()
        .from(analyses)
        .where(eq(analyses.name, "Autosave"))
        .limit(1);
      
      let autosaveAnalysis: Analysis;
      
      if (existingAutosave.length > 0) {
        // Update the existing autosave
        const [updated] = await db
          .update(analyses)
          .set({ createdAt: new Date().toISOString() })
          .where(eq(analyses.id, existingAutosave[0].id))
          .returning();
        
        autosaveAnalysis = updated;
        
        // Delete the existing sheets and textboxes for this autosave
        const autosaveSheets = await this.getSheetsByAnalysisId(autosaveAnalysis.id);
        for (const sheet of autosaveSheets) {
          await db.delete(textBoxes).where(eq(textBoxes.sheetId, sheet.id));
        }
        await db.delete(sheets).where(eq(sheets.analysisId, autosaveAnalysis.id));
      } else {
        // Create a new autosave analysis
        const [newAutosave] = await db
          .insert(analyses)
          .values({
            name: "Autosave",
            pdfName: originalAnalysis.pdfName,
            imageName: originalAnalysis.imageName,
            createdAt: new Date().toISOString(),
          })
          .returning();
        
        autosaveAnalysis = newAutosave;
      }
      
      // Copy all sheets and textboxes from the original analysis to the autosave
      const originalSheets = await this.getSheetsByAnalysisId(analysisId);
      
      for (const originalSheet of originalSheets) {
        // Create a copy of the sheet for the autosave
        const [newSheet] = await db
          .insert(sheets)
          .values({
            name: originalSheet.name,
            template: originalSheet.template,
            order: originalSheet.order,
            analysisId: autosaveAnalysis.id,
          })
          .returning();
        
        // Copy all textboxes from the original sheet to the new sheet
        const originalTextBoxes = await this.getTextBoxesBySheetId(originalSheet.id);
        
        for (const textBox of originalTextBoxes) {
          await db.insert(textBoxes).values({
            content: textBox.content,
            x: textBox.x,
            y: textBox.y,
            width: textBox.width,
            height: textBox.height,
            color: textBox.color,
            zone: textBox.zone,
            sheetId: newSheet.id,
          });
        }
      }
      
      return autosaveAnalysis;
    } catch (error) {
      console.error("Error during autosave:", error);
      return undefined;
    }
  }
}

export const storage = new DatabaseStorage();
