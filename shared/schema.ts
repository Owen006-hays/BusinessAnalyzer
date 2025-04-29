import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define our main schemas for the app

// TextBox represents a draggable text box in the analysis area
export const textBoxes = pgTable("textboxes", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  width: integer("width").notNull().default(200),
  height: integer("height"),
  color: text("color").default("white"),
  analysisId: integer("analysis_id").notNull(),
});

// Analysis represents a saved analysis project
export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  template: text("template"), // SWOT, 4P, 3C, PEST, etc.
  pdfName: text("pdf_name"),
  imageName: text("image_name"), // 追加：画像ファイル名
  createdAt: text("created_at").notNull(),
});

// Creating schemas for validation
export const insertTextBoxSchema = createInsertSchema(textBoxes).omit({
  id: true,
});

export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
});

// Types for TypeScript
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
