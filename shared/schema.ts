import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const drugs = pgTable("drugs", {
  id: serial("id").primaryKey(),
  drugName: text("drug_name").notNull(),
  setId: text("set_id").notNull().unique(),
  slug: text("slug").notNull().unique(),
  labeler: text("labeler").notNull(),
  label: jsonb("label").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDrugSchema = createInsertSchema(drugs).pick({
  drugName: true,
  setId: true,
  slug: true,
  labeler: true,
  label: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDrug = z.infer<typeof insertDrugSchema>;
export type Drug = typeof drugs.$inferSelect;
