import {
  type User,
  type InsertUser,
  type Filter,
  type InsertFilter,
  type Tender,
  type InsertTender,
  type AlertHistory,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Filter methods
  getFiltersByUserId(userId: string): Promise<Filter[]>;
  getActiveFilterByUserId(userId: string): Promise<Filter | undefined>;
  createFilter(filter: InsertFilter & { userId: string }): Promise<Filter>;
  updateFilter(id: string, filter: Partial<InsertFilter>): Promise<Filter | undefined>;
  deleteFilter(id: string): Promise<boolean>;
  
  // Tender methods
  getAllTenders(): Promise<Tender[]>;
  getTenderById(id: string): Promise<Tender | undefined>;
  createTender(tender: InsertTender): Promise<Tender>;
  createTenders(tenders: InsertTender[]): Promise<Tender[]>;
  searchTenders(criteria: {
    keywords?: string;
    states?: string[];
    tenderTypes?: string[];
    minValue?: number;
    maxValue?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Tender[]>;
  
  // Alert history methods
  getAlertHistoryByUserId(userId: string): Promise<AlertHistory[]>;
  createAlertHistory(alert: {
    userId: string;
    tenderCount: number;
    status: string;
  }): Promise<AlertHistory>;
  
  // Stats
  getStats(): Promise<{
    totalTenders: number;
    totalValue: number;
    alertsSent: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private filters: Map<string, Filter>;
  private tenders: Map<string, Tender>;
  private alertHistory: Map<string, AlertHistory>;

  constructor() {
    this.users = new Map();
    this.filters = new Map();
    this.tenders = new Map();
    this.alertHistory = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Filter methods
  async getFiltersByUserId(userId: string): Promise<Filter[]> {
    return Array.from(this.filters.values()).filter((filter) => filter.userId === userId);
  }

  async getActiveFilterByUserId(userId: string): Promise<Filter | undefined> {
    return Array.from(this.filters.values()).find(
      (filter) => filter.userId === userId && filter.isActive
    );
  }

  async createFilter(filterData: InsertFilter & { userId: string }): Promise<Filter> {
    const id = randomUUID();
    const now = new Date();
    const filter: Filter = {
      id,
      userId: filterData.userId,
      keywords: filterData.keywords || null,
      states: filterData.states || null,
      tenderTypes: filterData.tenderTypes || null,
      minValue: filterData.minValue || null,
      maxValue: filterData.maxValue || null,
      isActive: filterData.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    
    // Deactivate other filters for this user
    Array.from(this.filters.values()).forEach((f) => {
      if (f.userId === filterData.userId && f.isActive) {
        f.isActive = false;
        f.updatedAt = now;
      }
    });
    
    this.filters.set(id, filter);
    return filter;
  }

  async updateFilter(
    id: string,
    filterData: Partial<InsertFilter>
  ): Promise<Filter | undefined> {
    const filter = this.filters.get(id);
    if (!filter) return undefined;

    const updated = {
      ...filter,
      ...filterData,
      updatedAt: new Date(),
    };
    this.filters.set(id, updated);
    return updated;
  }

  async deleteFilter(id: string): Promise<boolean> {
    return this.filters.delete(id);
  }

  // Tender methods
  async getAllTenders(): Promise<Tender[]> {
    return Array.from(this.tenders.values());
  }

  async getTenderById(id: string): Promise<Tender | undefined> {
    return this.tenders.get(id);
  }

  async createTender(tenderData: InsertTender): Promise<Tender> {
    const tender: Tender = {
      ...tenderData,
      fetchedAt: new Date(),
    };
    this.tenders.set(tender.id, tender);
    return tender;
  }

  async createTenders(tendersData: InsertTender[]): Promise<Tender[]> {
    const tenders: Tender[] = [];
    const now = new Date();
    
    for (const tenderData of tendersData) {
      const tender: Tender = {
        ...tenderData,
        fetchedAt: now,
      };
      this.tenders.set(tender.id, tender);
      tenders.push(tender);
    }
    
    return tenders;
  }

  async searchTenders(criteria: {
    keywords?: string;
    states?: string[];
    tenderTypes?: string[];
    minValue?: number;
    maxValue?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Tender[]> {
    let results = Array.from(this.tenders.values());

    // Filter by keywords
    if (criteria.keywords) {
      const keywords = criteria.keywords.toLowerCase().split(",").map((k) => k.trim());
      results = results.filter((tender) => {
        const searchText = `${tender.title} ${tender.description || ""} ${tender.agency}`.toLowerCase();
        return keywords.some((keyword) => searchText.includes(keyword));
      });
    }

    // Filter by states
    if (criteria.states && criteria.states.length > 0) {
      results = results.filter((tender) => criteria.states!.includes(tender.uf));
    }

    // Filter by tender types
    if (criteria.tenderTypes && criteria.tenderTypes.length > 0) {
      results = results.filter((tender) =>
        criteria.tenderTypes!.some((type) => tender.modality.includes(type))
      );
    }

    // Filter by value range
    if (criteria.minValue !== undefined) {
      results = results.filter(
        (tender) => tender.estimatedValue && tender.estimatedValue >= criteria.minValue!
      );
    }

    if (criteria.maxValue !== undefined) {
      results = results.filter(
        (tender) => tender.estimatedValue && tender.estimatedValue <= criteria.maxValue!
      );
    }

    // Filter by date range
    if (criteria.startDate) {
      results = results.filter(
        (tender) => new Date(tender.publicationDate) >= criteria.startDate!
      );
    }

    if (criteria.endDate) {
      results = results.filter(
        (tender) => new Date(tender.publicationDate) <= criteria.endDate!
      );
    }

    return results;
  }

  // Alert history methods
  async getAlertHistoryByUserId(userId: string): Promise<AlertHistory[]> {
    return Array.from(this.alertHistory.values())
      .filter((alert) => alert.userId === userId)
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  async createAlertHistory(alertData: {
    userId: string;
    tenderCount: number;
    status: string;
  }): Promise<AlertHistory> {
    const id = randomUUID();
    const alert: AlertHistory = {
      id,
      userId: alertData.userId,
      tenderCount: alertData.tenderCount,
      status: alertData.status,
      sentAt: new Date(),
    };
    this.alertHistory.set(id, alert);
    return alert;
  }

  // Stats
  async getStats(): Promise<{
    totalTenders: number;
    totalValue: number;
    alertsSent: number;
  }> {
    const tenders = Array.from(this.tenders.values());
    const totalValue = tenders.reduce(
      (sum, tender) => sum + (tender.estimatedValue || 0),
      0
    );
    const alertsSent = this.alertHistory.size;

    return {
      totalTenders: tenders.length,
      totalValue,
      alertsSent,
    };
  }
}

export const storage = new MemStorage();
