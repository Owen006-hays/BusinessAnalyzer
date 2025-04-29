import { 
  users, type User, type InsertUser,
  textBoxes, type TextBox, type InsertTextBox,
  analyses, type Analysis, type InsertAnalysis,
  sheets, type Sheet, type InsertSheet
} from "@shared/schema";

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
}

// In-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sheets: Map<number, Sheet>;
  private textBoxes: Map<number, TextBox>;
  private analyses: Map<number, Analysis>;
  
  private userId: number;
  private sheetId: number;
  private textBoxId: number;
  private analysisId: number;
  
  constructor() {
    this.users = new Map();
    this.sheets = new Map();
    this.textBoxes = new Map();
    this.analyses = new Map();
    
    this.userId = 1;
    this.sheetId = 1;
    this.textBoxId = 1;
    this.analysisId = 1;
    
    // Create a default analysis for users to start with
    const defaultAnalysis: Analysis = {
      id: this.analysisId++,
      name: "New Analysis",
      pdfName: null,
      imageName: null,
      createdAt: new Date().toISOString(),
    };
    this.analyses.set(defaultAnalysis.id, defaultAnalysis);
    
    // Create a default sheet for the analysis
    const defaultSheet: Sheet = {
      id: this.sheetId++,
      name: "Sheet 1",
      template: null,
      order: 1,
      analysisId: defaultAnalysis.id,
    };
    this.sheets.set(defaultSheet.id, defaultSheet);
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Sheet methods
  async getSheetsByAnalysisId(analysisId: number): Promise<Sheet[]> {
    return Array.from(this.sheets.values())
      .filter(sheet => sheet.analysisId === analysisId)
      .sort((a, b) => a.order - b.order); // 順番に並べ替え
  }
  
  async getSheet(id: number): Promise<Sheet | undefined> {
    return this.sheets.get(id);
  }
  
  async createSheet(insertSheet: InsertSheet): Promise<Sheet> {
    const id = this.sheetId++;
    
    const sheet: Sheet = {
      id,
      name: insertSheet.name,
      template: insertSheet.template ?? null,
      order: insertSheet.order,
      analysisId: insertSheet.analysisId,
    };
    
    this.sheets.set(id, sheet);
    return sheet;
  }
  
  async updateSheet(id: number, updateData: Partial<InsertSheet>): Promise<Sheet | undefined> {
    const existingSheet = this.sheets.get(id);
    if (!existingSheet) return undefined;
    
    const updatedSheet: Sheet = { ...existingSheet, ...updateData };
    this.sheets.set(id, updatedSheet);
    return updatedSheet;
  }
  
  async deleteSheet(id: number): Promise<boolean> {
    // シートに関連付けられたテキストボックスを削除
    Array.from(this.textBoxes.values())
      .filter(textBox => textBox.sheetId === id)
      .forEach(textBox => this.textBoxes.delete(textBox.id));
    
    // シートを削除
    return this.sheets.delete(id);
  }
  
  // TextBox methods
  async getTextBoxesBySheetId(sheetId: number): Promise<TextBox[]> {
    return Array.from(this.textBoxes.values()).filter(
      (textBox) => textBox.sheetId === sheetId,
    );
  }
  
  // 後方互換性のため、analysisIdに関連するすべてのシートのテキストボックスを取得するメソッド
  async getTextBoxesByAnalysisId(analysisId: number): Promise<TextBox[]> {
    // まず関連するシートをすべて取得
    const sheets = await this.getSheetsByAnalysisId(analysisId);
    const sheetIds = sheets.map(sheet => sheet.id);
    
    // 各シートに関連するテキストボックスを取得
    return Array.from(this.textBoxes.values()).filter(
      (textBox) => sheetIds.includes(textBox.sheetId)
    );
  }
  
  async createTextBox(insertTextBox: InsertTextBox): Promise<TextBox> {
    const id = this.textBoxId++;
    
    // 明示的に必要なプロパティを設定して、undefinedを避ける
    const textBox: TextBox = {
      id,
      content: insertTextBox.content,
      x: insertTextBox.x,
      y: insertTextBox.y,
      width: insertTextBox.width ?? 200, // デフォルト値を設定
      height: insertTextBox.height ?? null,
      color: insertTextBox.color ?? null,
      zone: insertTextBox.zone ?? null,
      sheetId: insertTextBox.sheetId
    };
    
    this.textBoxes.set(id, textBox);
    return textBox;
  }
  
  async updateTextBox(id: number, updateData: Partial<InsertTextBox>): Promise<TextBox | undefined> {
    const existingTextBox = this.textBoxes.get(id);
    if (!existingTextBox) return undefined;
    
    const updatedTextBox: TextBox = { ...existingTextBox, ...updateData };
    this.textBoxes.set(id, updatedTextBox);
    return updatedTextBox;
  }
  
  async deleteTextBox(id: number): Promise<boolean> {
    return this.textBoxes.delete(id);
  }
  
  // Analysis methods
  async getAnalyses(): Promise<Analysis[]> {
    return Array.from(this.analyses.values());
  }
  
  async getAnalysis(id: number): Promise<Analysis | undefined> {
    return this.analyses.get(id);
  }
  
  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = this.analysisId++;
    
    // 明示的に必要なプロパティを設定して、undefinedを避ける
    const analysis: Analysis = {
      id,
      name: insertAnalysis.name,
      pdfName: insertAnalysis.pdfName ?? null,
      imageName: insertAnalysis.imageName ?? null,
      createdAt: insertAnalysis.createdAt
    };
    
    this.analyses.set(id, analysis);
    return analysis;
  }
  
  async updateAnalysis(id: number, updateData: Partial<InsertAnalysis>): Promise<Analysis | undefined> {
    const existingAnalysis = this.analyses.get(id);
    if (!existingAnalysis) return undefined;
    
    // 更新データを適切に処理
    const updatedAnalysis: Analysis = {
      ...existingAnalysis,
      name: updateData.name !== undefined ? updateData.name : existingAnalysis.name,
      pdfName: updateData.pdfName !== undefined ? updateData.pdfName : existingAnalysis.pdfName,
      imageName: updateData.imageName !== undefined ? updateData.imageName : existingAnalysis.imageName,
      createdAt: updateData.createdAt !== undefined ? updateData.createdAt : existingAnalysis.createdAt
    };
    
    this.analyses.set(id, updatedAnalysis);
    return updatedAnalysis;
  }
  
  async deleteAnalysis(id: number): Promise<boolean> {
    // まず、この分析に関連するすべてのシートを取得
    const sheets = await this.getSheetsByAnalysisId(id);
    
    // 各シートとそれに関連するテキストボックスを削除
    for (const sheet of sheets) {
      await this.deleteSheet(sheet.id);
    }
    
    // 分析を削除
    return this.analyses.delete(id);
  }
}

export const storage = new MemStorage();
