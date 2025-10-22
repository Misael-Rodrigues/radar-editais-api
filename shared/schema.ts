import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Filters table - stores user's filter preferences
export const filters = pgTable("filters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  keywords: text("keywords"), // comma-separated keywords
  states: text("states"), // comma-separated UF codes
  tenderTypes: text("tender_types"), // comma-separated types
  minValue: integer("min_value"), // minimum estimated value
  maxValue: integer("max_value"), // maximum estimated value
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tenders table - stores fetched tender data
export const tenders = pgTable("tenders", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  agency: text("agency").notNull(), // órgão
  uf: varchar("uf", { length: 2 }).notNull(), // state code
  modality: text("modality").notNull(), // modalidade (Pregão, Concorrência, etc)
  publicationDate: timestamp("publication_date").notNull(),
  estimatedValue: integer("estimated_value"), // valor estimado
  link: text("link").notNull(), // link to tender details
  description: text("description"),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
});

// Alert history table
export const alertHistory = pgTable("alert_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tenderCount: integer("tender_count").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  status: text("status").notNull(), // 'success' or 'failed'
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  password: true,
}).extend({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

export const insertFilterSchema = createInsertSchema(filters).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  keywords: z.string().optional(),
  states: z.string().optional(),
  tenderTypes: z.string().optional(),
  minValue: z.number().int().min(0).optional(),
  maxValue: z.number().int().min(0).optional(),
});

export const insertTenderSchema = createInsertSchema(tenders).omit({
  fetchedAt: true,
});

export const searchTendersSchema = z.object({
  keywords: z.string().optional(),
  states: z.string().optional(), // comma-separated UF codes
  tenderTypes: z.string().optional(), // comma-separated types
  minValue: z.number().int().min(0).optional(),
  maxValue: z.number().int().min(0).optional(),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(), // ISO date string
});

export const sendAlertSchema = z.object({
  tenderIds: z.array(z.string()).min(1, "Selecione pelo menos um edital"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type User = typeof users.$inferSelect;
export type InsertFilter = z.infer<typeof insertFilterSchema>;
export type Filter = typeof filters.$inferSelect;
export type InsertTender = z.infer<typeof insertTenderSchema>;
export type Tender = typeof tenders.$inferSelect;
export type SearchTendersParams = z.infer<typeof searchTendersSchema>;
export type SendAlertParams = z.infer<typeof sendAlertSchema>;
export type AlertHistory = typeof alertHistory.$inferSelect;

// Brazilian states (UF)
export const BRAZILIAN_STATES = [
  { code: "AC", name: "Acre" },
  { code: "AL", name: "Alagoas" },
  { code: "AP", name: "Amapá" },
  { code: "AM", name: "Amazonas" },
  { code: "BA", name: "Bahia" },
  { code: "CE", name: "Ceará" },
  { code: "DF", name: "Distrito Federal" },
  { code: "ES", name: "Espírito Santo" },
  { code: "GO", name: "Goiás" },
  { code: "MA", name: "Maranhão" },
  { code: "MT", name: "Mato Grosso" },
  { code: "MS", name: "Mato Grosso do Sul" },
  { code: "MG", name: "Minas Gerais" },
  { code: "PA", name: "Pará" },
  { code: "PB", name: "Paraíba" },
  { code: "PR", name: "Paraná" },
  { code: "PE", name: "Pernambuco" },
  { code: "PI", name: "Piauí" },
  { code: "RJ", name: "Rio de Janeiro" },
  { code: "RN", name: "Rio Grande do Norte" },
  { code: "RS", name: "Rio Grande do Sul" },
  { code: "RO", name: "Rondônia" },
  { code: "RR", name: "Roraima" },
  { code: "SC", name: "Santa Catarina" },
  { code: "SP", name: "São Paulo" },
  { code: "SE", name: "Sergipe" },
  { code: "TO", name: "Tocantins" },
] as const;

// Tender modalities
export const TENDER_MODALITIES = [
  "Pregão Eletrônico",
  "Pregão Presencial",
  "Concorrência",
  "Tomada de Preços",
  "Convite",
  "Dispensa de Licitação",
  "Inexigibilidade",
  "Concurso",
  "Leilão",
] as const;
