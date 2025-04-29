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
    const textBox: TextBox = { ...insertTextBox, id };
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
    const analysis: Analysis = { ...insertAnalysis, id };
    this.analyses.set(id, analysis);
    return analysis;
  }
  
  async updateAnalysis(id: number, updateData: Partial<InsertAnalysis>): Promise<Analysis | undefined> {
    const existingAnalysis = this.analyses.get(id);
    if (!existingAnalysis) return undefined;
    
    const updatedAnalysis: Analysis = { ...existingAnalysis, ...updateData };
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
