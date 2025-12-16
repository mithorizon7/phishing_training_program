import { 
  scenarios, shifts, decisions, userProgress,
  type Scenario, type InsertScenario,
  type Shift, type InsertShift,
  type Decision, type InsertDecision,
  type UserProgress, type InsertUserProgress
} from "@shared/schema";
import { db } from "./db";
import { eq, inArray, sql } from "drizzle-orm";

export interface IStorage {
  // Scenarios
  getScenarios(): Promise<Scenario[]>;
  getScenarioById(id: string): Promise<Scenario | undefined>;
  getScenariosByIds(ids: string[]): Promise<Scenario[]>;
  getRandomScenarios(count: number, maxDifficulty?: number): Promise<Scenario[]>;
  createScenario(scenario: InsertScenario): Promise<Scenario>;
  getScenariosCount(): Promise<number>;

  // Shifts
  getShiftById(id: string): Promise<Shift | undefined>;
  getShiftsByUserId(userId: string): Promise<Shift[]>;
  createShift(shift: InsertShift): Promise<Shift>;
  updateShift(id: string, updates: Partial<Shift>): Promise<Shift | undefined>;

  // Decisions
  getDecisionsByShiftId(shiftId: string): Promise<Decision[]>;
  createDecision(decision: InsertDecision): Promise<Decision>;

  // User Progress
  getProgressByUserId(userId: string): Promise<UserProgress | undefined>;
  upsertProgress(userId: string, updates: Partial<InsertUserProgress>): Promise<UserProgress>;
}

export class DatabaseStorage implements IStorage {
  // Scenarios
  async getScenarios(): Promise<Scenario[]> {
    return db.select().from(scenarios);
  }

  async getScenarioById(id: string): Promise<Scenario | undefined> {
    const [scenario] = await db.select().from(scenarios).where(eq(scenarios.id, id));
    return scenario;
  }

  async getScenariosByIds(ids: string[]): Promise<Scenario[]> {
    if (ids.length === 0) return [];
    return db.select().from(scenarios).where(inArray(scenarios.id, ids));
  }

  async getRandomScenarios(count: number, maxDifficulty: number = 5): Promise<Scenario[]> {
    return db.select()
      .from(scenarios)
      .orderBy(sql`RANDOM()`)
      .limit(count);
  }

  async createScenario(scenario: InsertScenario): Promise<Scenario> {
    const [created] = await db.insert(scenarios).values(scenario).returning();
    return created;
  }

  async getScenariosCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(scenarios);
    return Number(result[0]?.count || 0);
  }

  // Shifts
  async getShiftById(id: string): Promise<Shift | undefined> {
    const [shift] = await db.select().from(shifts).where(eq(shifts.id, id));
    return shift;
  }

  async getShiftsByUserId(userId: string): Promise<Shift[]> {
    return db.select().from(shifts).where(eq(shifts.userId, userId));
  }

  async createShift(shift: InsertShift): Promise<Shift> {
    const [created] = await db.insert(shifts).values(shift).returning();
    return created;
  }

  async updateShift(id: string, updates: Partial<Shift>): Promise<Shift | undefined> {
    const [updated] = await db.update(shifts)
      .set(updates)
      .where(eq(shifts.id, id))
      .returning();
    return updated;
  }

  // Decisions
  async getDecisionsByShiftId(shiftId: string): Promise<Decision[]> {
    return db.select().from(decisions).where(eq(decisions.shiftId, shiftId));
  }

  async createDecision(decision: InsertDecision): Promise<Decision> {
    const [created] = await db.insert(decisions).values(decision).returning();
    return created;
  }

  // User Progress
  async getProgressByUserId(userId: string): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
    return progress;
  }

  async upsertProgress(userId: string, updates: Partial<InsertUserProgress>): Promise<UserProgress> {
    const existing = await this.getProgressByUserId(userId);
    
    if (existing) {
      const [updated] = await db.update(userProgress)
        .set({ ...updates, lastPlayedAt: new Date() })
        .where(eq(userProgress.userId, userId))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(userProgress)
      .values({ userId, ...updates, lastPlayedAt: new Date() })
      .returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
