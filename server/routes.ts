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

// Extend Express session with user
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "radar-editais-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Não autorizado" });
    }
    next();
  };

  // ========== Authentication Routes ==========

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email já cadastrado" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Set session
      req.session.userId = user.id;

      // Don't send password back
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

      // Find user
      const user = await storage.getUserByEmail(credentials.email);
      if (!user) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(
        credentials.password,
        user.password
      );
      if (!isValidPassword) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }

      // Set session
      req.session.userId = user.id;

      // Don't send password back
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

  // ========== Filter Routes ==========

  app.post("/api/filters", requireAuth, async (req, res) => {
    try {
      const filterData = insertFilterSchema.parse(req.body);
      const userId = req.session.userId!;

      const filter = await storage.createFilter({
        ...filterData,
        userId,
      });

      res.json(filter);
    } catch (error) {
      console.error("Create filter error:", error);
      res.status(400).json({ message: "Erro ao salvar filtro" });
    }
  });

  app.get("/api/filters/active", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const filter = await storage.getActiveFilterByUserId(userId);
      
      if (!filter) {
        return res.json(null);
      }

      res.json(filter);
    } catch (error) {
      console.error("Get active filter error:", error);
      res.status(500).json({ message: "Erro ao buscar filtro" });
    }
  });

  app.get("/api/filters", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const filters = await storage.getFiltersByUserId(userId);
      res.json(filters);
    } catch (error) {
      console.error("Get filters error:", error);
      res.status(500).json({ message: "Erro ao buscar filtros" });
    }
  });

  // ========== Tender Routes ==========

  app.get("/api/tenders", requireAuth, async (req, res) => {
    try {
      const params = searchTendersSchema.parse({
        keywords: req.query.keywords,
        states: req.query.states,
        tenderTypes: req.query.tenderTypes,
        minValue: req.query.minValue ? parseInt(req.query.minValue as string) : undefined,
        maxValue: req.query.maxValue ? parseInt(req.query.maxValue as string) : undefined,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      });

      const criteria: any = {};

      if (params.keywords) {
        criteria.keywords = params.keywords;
      }

      if (params.states) {
        criteria.states = params.states.split(",");
      }

      if (params.tenderTypes) {
        criteria.tenderTypes = params.tenderTypes.split(",");
      }

      if (params.minValue !== undefined) {
        criteria.minValue = params.minValue;
      }

      if (params.maxValue !== undefined) {
        criteria.maxValue = params.maxValue;
      }

      if (params.startDate) {
        criteria.startDate = new Date(params.startDate);
      }

      if (params.endDate) {
        criteria.endDate = new Date(params.endDate);
      }

      const tenders = await storage.searchTenders(criteria);
      res.json(tenders);
    } catch (error) {
      console.error("Search tenders error:", error);
      res.status(400).json({ message: "Erro ao buscar editais" });
    }
  });

  app.post("/api/tenders/refresh", requireAuth, async (req, res) => {
    try {
      // Try to fetch from PNCP API first
      let tenders = await pncpService.fetchTendersD1();

      // If API fails or returns empty, use mock data for demo
      if (tenders.length === 0) {
        console.log("PNCP API returned no results, using mock data for demo");
        tenders = pncpService.generateMockTenders(15);
      }

      // Save tenders to storage
      await storage.createTenders(tenders);

      res.json({
        message: "Editais atualizados com sucesso",
        count: tenders.length,
      });
    } catch (error) {
      console.error("Refresh tenders error:", error);
      res.status(500).json({ message: "Erro ao atualizar editais" });
    }
  });

  // ========== Alert Routes ==========

  app.post("/api/alerts/send", requireAuth, async (req, res) => {
    try {
      const { tenderIds } = sendAlertSchema.parse(req.body);
      const userId = req.session.userId!;

      // Get user info
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Get tender details
      const tenders = await Promise.all(
        tenderIds.map((id) => storage.getTenderById(id))
      );
      const validTenders = tenders.filter((t) => t !== undefined);

      if (validTenders.length === 0) {
        return res.status(400).json({ message: "Nenhum edital válido selecionado" });
      }

      // In a real app, send email here
      // For now, just create alert history
      console.log(`Would send email to ${user.email} with ${validTenders.length} tenders`);

      await storage.createAlertHistory({
        userId,
        tenderCount: validTenders.length,
        status: "success",
      });

      res.json({
        message: "Alerta enviado com sucesso",
        count: validTenders.length,
      });
    } catch (error) {
      console.error("Send alert error:", error);
      
      // Create failed alert history
      if (req.session.userId) {
        await storage.createAlertHistory({
          userId: req.session.userId,
          tenderCount: 0,
          status: "failed",
        });
      }

      res.status(500).json({ message: "Erro ao enviar alerta" });
    }
  });

  app.get("/api/alerts/history", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const history = await storage.getAlertHistoryByUserId(userId);
      res.json(history);
    } catch (error) {
      console.error("Get alert history error:", error);
      res.status(500).json({ message: "Erro ao buscar histórico" });
    }
  });

  // ========== Stats Route ==========

  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
