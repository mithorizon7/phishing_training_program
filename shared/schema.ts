import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

// Enums as TypeScript types
export type MessageChannel = "email" | "sms" | "call";
export type MessageLegitimacy = "legitimate" | "suspicious_legitimate" | "malicious";
export type AttackFamily = "phishing" | "bec" | "spoofing" | "smishing" | "vishing" | "wrong_number" | "qr_phishing" | "oauth_phishing" | "ai_phishing";
export type RiskType = "credential_theft" | "malware" | "payment_fraud" | "data_leakage" | "account_takeover" | "financial_theft" | "none";
export type ActionType = "report" | "delete" | "verify" | "proceed";
export type OutcomeType = "safe" | "compromised" | "delayed_work" | "false_alarm";

// Scenarios table - the message library
export const scenarios = pgTable("scenarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channel: varchar("channel", { length: 20 }).notNull().$type<MessageChannel>(),
  senderName: varchar("sender_name", { length: 255 }).notNull(),
  senderEmail: varchar("sender_email", { length: 255 }),
  senderPhone: varchar("sender_phone", { length: 50 }),
  replyTo: varchar("reply_to", { length: 255 }),
  subject: varchar("subject", { length: 500 }),
  body: text("body").notNull(),
  timestamp: varchar("timestamp", { length: 100 }).notNull(),
  legitimacy: varchar("legitimacy", { length: 30 }).notNull().$type<MessageLegitimacy>(),
  attackFamily: varchar("attack_family", { length: 30 }).$type<AttackFamily>(),
  riskType: varchar("risk_type", { length: 30 }).notNull().$type<RiskType>(),
  cues: text("cues").array().notNull(),
  correctAction: varchar("correct_action", { length: 20 }).notNull().$type<ActionType>(),
  explanation: text("explanation").notNull(),
  difficultyScore: integer("difficulty_score").notNull().default(1),
  userRole: varchar("user_role", { length: 50 }).default("staff"),
  hasAttachment: boolean("has_attachment").default(false),
  attachmentName: varchar("attachment_name", { length: 255 }),
  linkUrl: varchar("link_url", { length: 500 }),
  linkText: varchar("link_text", { length: 255 }),
  qrCodeUrl: varchar("qr_code_url", { length: 500 }),
  // Multi-turn scenario support
  chainId: varchar("chain_id", { length: 100 }),
  chainOrder: integer("chain_order"),
  chainName: varchar("chain_name", { length: 255 }),
  previousAction: varchar("previous_action", { length: 20 }).$type<ActionType>(),
});

// Shifts table - gameplay sessions
export const shifts = pgTable("shifts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  scenarioIds: text("scenario_ids").array().notNull(),
  verificationBudget: integer("verification_budget").notNull().default(3),
  verificationsUsed: integer("verifications_used").notNull().default(0),
  score: integer("score").notNull().default(0),
  correctDecisions: integer("correct_decisions").notNull().default(0),
  falsePositives: integer("false_positives").notNull().default(0),
  compromised: integer("compromised").notNull().default(0),
});

// Decisions table - individual message decisions
export const decisions = pgTable("decisions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shiftId: varchar("shift_id").notNull(),
  scenarioId: varchar("scenario_id").notNull(),
  userId: varchar("user_id").notNull(),
  action: varchar("action", { length: 20 }).notNull().$type<ActionType>(),
  confidence: integer("confidence").notNull(),
  outcome: varchar("outcome", { length: 30 }).notNull().$type<OutcomeType>(),
  pointsEarned: integer("points_earned").notNull(),
  usedVerification: boolean("used_verification").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User progress table - skill tracking
export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  totalShifts: integer("total_shifts").notNull().default(0),
  totalDecisions: integer("total_decisions").notNull().default(0),
  correctDecisions: integer("correct_decisions").notNull().default(0),
  falsePositives: integer("false_positives").notNull().default(0),
  compromised: integer("compromised").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  totalScore: integer("total_score").notNull().default(0),
  missedCues: jsonb("missed_cues").$type<Record<string, number>>().default({}),
  earnedBadges: text("earned_badges").array().default([]),
  lastPlayedAt: timestamp("last_played_at"),
});

// Assignments table - instructor-created training modules
export const assignments = pgTable("assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  createdBy: varchar("created_by").notNull(),
  scenarioIds: text("scenario_ids").array().notNull(),
  difficultyMin: integer("difficulty_min").default(1),
  difficultyMax: integer("difficulty_max").default(5),
  targetChannels: text("target_channels").array().default([]),
  targetAttackFamilies: text("target_attack_families").array().default([]),
  passingScore: integer("passing_score").default(70),
  verificationBudget: integer("verification_budget").default(3),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Assignment completions table - tracks learner completion
export const assignmentCompletions = pgTable("assignment_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assignmentId: varchar("assignment_id").notNull(),
  userId: varchar("user_id").notNull(),
  shiftId: varchar("shift_id"),
  score: integer("score"),
  passed: boolean("passed"),
  completedAt: timestamp("completed_at"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
});

// Relations
export const shiftsRelations = relations(shifts, ({ many }) => ({
  decisions: many(decisions),
}));

export const decisionsRelations = relations(decisions, ({ one }) => ({
  shift: one(shifts, {
    fields: [decisions.shiftId],
    references: [shifts.id],
  }),
  scenario: one(scenarios, {
    fields: [decisions.scenarioId],
    references: [scenarios.id],
  }),
}));

// Insert schemas
export const insertScenarioSchema = createInsertSchema(scenarios).omit({ id: true });
export const insertShiftSchema = createInsertSchema(shifts).omit({ id: true, startedAt: true });
export const insertDecisionSchema = createInsertSchema(decisions).omit({ id: true, createdAt: true });
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true });
export const insertAssignmentSchema = createInsertSchema(assignments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAssignmentCompletionSchema = createInsertSchema(assignmentCompletions).omit({ id: true, startedAt: true });

// Types
export type Scenario = typeof scenarios.$inferSelect;
export type InsertScenario = z.infer<typeof insertScenarioSchema>;
export type Shift = typeof shifts.$inferSelect;
export type InsertShift = z.infer<typeof insertShiftSchema>;
export type Decision = typeof decisions.$inferSelect;
export type InsertDecision = z.infer<typeof insertDecisionSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type AssignmentCompletion = typeof assignmentCompletions.$inferSelect;
export type InsertAssignmentCompletion = z.infer<typeof insertAssignmentCompletionSchema>;

// Badge definitions
export const BADGES = {
  domain_detective: { id: "domain_detective", name: "Domain Detective", description: "Spotted 10 domain mismatches", icon: "Search", requirement: 10 },
  verification_pro: { id: "verification_pro", name: "Verification Pro", description: "Used verification correctly 20 times", icon: "CheckCircle", requirement: 20 },
  bec_blocker: { id: "bec_blocker", name: "BEC Blocker", description: "Blocked 15 business email compromise attempts", icon: "Shield", requirement: 15 },
  urgency_immune: { id: "urgency_immune", name: "Urgency Immune", description: "Resisted 25 urgency-based attacks", icon: "Clock", requirement: 25 },
  streak_master: { id: "streak_master", name: "Streak Master", description: "Achieved a 20-decision safe streak", icon: "Flame", requirement: 20 },
  perfect_shift: { id: "perfect_shift", name: "Perfect Shift", description: "Completed a shift with 100% accuracy", icon: "Star", requirement: 1 },
} as const;

export type BadgeId = keyof typeof BADGES;
