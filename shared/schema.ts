import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define our main schemas for the app

// Sheets represents a tab within an analysis (like Excel worksheets)
export const sheets = pgTable("sheets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  template: text("template"), // SWOT, 4P, 3C, PEST, etc.
  order: integer("order").notNull(), // 表示順（Excelのタブの並び順と同様）
  analysisId: integer("analysis_id").notNull(), // どの分析に所属するか
});

// TextBox represents a draggable text box in the analysis area
export const textBoxes = pgTable("textboxes", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  width: integer("width").notNull().default(200),
  height: integer("height"),
  color: text("color").default("white"),
  zone: text("zone"), // テンプレートのゾーン（strengths, weaknesses など）
  sheetId: integer("sheet_id").notNull(), // テキストボックスはシートに所属する
});

// Analysis represents a saved analysis project
export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  pdfName: text("pdf_name"),
  imageName: text("image_name"), // 追加：画像ファイル名
  createdAt: text("created_at").notNull(),
  // template フィールドを削除（各シートに移動）
});

// Creating schemas for validation
export const insertSheetSchema = createInsertSchema(sheets).omit({
  id: true,
});

export const insertTextBoxSchema = createInsertSchema(textBoxes).omit({
  id: true,
});

export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
});

// Types for TypeScript
export type InsertSheet = z.infer<typeof insertSheetSchema>;
export type Sheet = typeof sheets.$inferSelect;

export type InsertTextBox = z.infer<typeof insertTextBoxSchema>;
export type TextBox = typeof textBoxes.$inferSelect;

export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analyses.$inferSelect;

// For the users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
