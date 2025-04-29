import { 
  users, type User, type InsertUser,
  textBoxes, type TextBox, type InsertTextBox,
  analyses, type Analysis, type InsertAnalysis 
} from "@shared/schema";

// Storage interface for our application
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // TextBox methods
  getTextBoxesByAnalysisId(analysisId: number): Promise<TextBox[]>;
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
  private textBoxes: Map<number, TextBox>;
  private analyses: Map<number, Analysis>;
  
  private userId: number;
  private textBoxId: number;
  private analysisId: number;
  
  constructor() {
    this.users = new Map();
    this.textBoxes = new Map();
    this.analyses = new Map();
    
    this.userId = 1;
    this.textBoxId = 1;
    this.analysisId = 1;
    
    // Create a default analysis for users to start with
    const defaultAnalysis: Analysis = {
      id: this.analysisId++,
      name: "New Analysis",
      template: null,
      pdfName: null,
      imageName: null,
      createdAt: new Date().toISOString(),
    };
    this.analyses.set(defaultAnalysis.id, defaultAnalysis);
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
  
  // TextBox methods
  async getTextBoxesByAnalysisId(analysisId: number): Promise<TextBox[]> {
    return Array.from(this.textBoxes.values()).filter(
      (textBox) => textBox.analysisId === analysisId,
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
      analysisId: insertTextBox.analysisId
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
      template: insertAnalysis.template ?? null,
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
      template: updateData.template !== undefined ? updateData.template : existingAnalysis.template,
      pdfName: updateData.pdfName !== undefined ? updateData.pdfName : existingAnalysis.pdfName,
      imageName: updateData.imageName !== undefined ? updateData.imageName : existingAnalysis.imageName,
      createdAt: updateData.createdAt !== undefined ? updateData.createdAt : existingAnalysis.createdAt
    };
    
    this.analyses.set(id, updatedAnalysis);
    return updatedAnalysis;
  }
  
  async deleteAnalysis(id: number): Promise<boolean> {
    // Delete all textboxes associated with this analysis
    Array.from(this.textBoxes.values())
      .filter(textBox => textBox.analysisId === id)
      .forEach(textBox => this.textBoxes.delete(textBox.id));
    
    // Delete the analysis
    return this.analyses.delete(id);
  }
}

export const storage = new MemStorage();
