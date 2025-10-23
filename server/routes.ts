import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { pncpService } from "./services/pncp-service";
import bcrypt from "bcrypt";
import {
  insertUserSchema,
  loginSchema,
  insertFilterSchema,
  searchTendersSchema,
  sendAlertSchema,
} from "@shared/schema";

// =========================================
// EXTENSÃO DE SESSÃO EXPRESS
// =========================================
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // =========================================
  // MIDDLEWARE DE SESSÃO
  // =========================================
  app.use(
    session({
      secret:
        process.env.SESSION_SECRET ||
        "radar-editais-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      },
    }),
  );

  // Middleware de autenticação
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Não autorizado" });
    }
    next();
  };

  // =========================================
  // ROTAS DE AUTENTICAÇÃO
  // =========================================
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email já cadastrado" });
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      req.session.userId = user.id;
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Erro ao criar conta" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(credentials.email);
      if (!user) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }

      const isValidPassword = await bcrypt.compare(
        credentials.password,
        user.password,
      );
      if (!isValidPassword) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }

      req.session.userId = user.id;
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Erro no login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.json({ message: "Logout realizado" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  // =========================================
  // NOVA ROTA: BUSCAR EDITAIS PNCP
  // =========================================
  app.get("/api/editais", async (req, res) => {
    try {
      const { uf, termo, status, startDate, endDate } = req.query;

      const result = await pncpService.fetchTenders({
        state: uf as string,
        keywords: termo as string,
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      return res.json(result);
    } catch (error) {
      console.error("Erro ao buscar editais PNCP:", error);
      return res
        .status(500)
        .json({ message: "Erro interno ao buscar editais PNCP" });
    }
  });

  // =========================================
  // ROTAS DE ALERTA, FILTRO, TENDERS, STATS
  // (mantidas conforme sua versão original)
  // =========================================
  // ... você pode manter as demais rotas sem alteração

  const httpServer = createServer(app);
  return httpServer;
}
