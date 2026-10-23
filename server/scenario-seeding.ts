import { eq, sql } from "drizzle-orm";
import { scenarios, type Scenario } from "@shared/schema";
import { scenariosSeed } from "./scenarios-seed";

type ScenarioInsert = typeof scenarios.$inferInsert;

function fingerprint(scenario: ScenarioInsert) {
  return JSON.stringify([
    scenario.channel, scenario.senderName, scenario.senderEmail ?? null,
    scenario.senderPhone ?? null, scenario.subject ?? null, scenario.body,
    scenario.correctAction, scenario.chainId ?? null, scenario.chainOrder ?? null,
    scenario.previousAction ?? null,
  ]);
}

export function planScenarioSeed(existing: Scenario[], authored: ScenarioInsert[]) {
  const keys = new Set(existing.map((scenario) => scenario.i18nKey).filter(Boolean));
  const legacy = new Map<string, Scenario>();
  for (const scenario of existing) {
    if (!scenario.i18nKey) legacy.set(fingerprint(scenario), scenario);
  }

  const backfill: { id: string; i18nKey: string }[] = [];
  const create: ScenarioInsert[] = [];
  for (const scenario of authored) {
    if (!scenario.i18nKey) throw new Error("Authored scenario requires a localization key");
    if (keys.has(scenario.i18nKey)) continue;
    const match = legacy.get(fingerprint(scenario));
    if (match) {
      backfill.push({ id: match.id, i18nKey: scenario.i18nKey });
      legacy.delete(fingerprint(scenario));
    } else {
      create.push(scenario);
    }
    keys.add(scenario.i18nKey);
  }
  return { backfill, create };
}

export async function seedScenarioLibrary(database: typeof import("./db").db) {
  return database.transaction(async (transaction) => {
    // Serialize autoscaling startups; the lock releases on commit or rollback.
    await transaction.execute(sql`SELECT pg_advisory_xact_lock(724139501)`);
    const existing = await transaction.select().from(scenarios);
    const plan = planScenarioSeed(existing, scenariosSeed);
    for (const item of plan.backfill) {
      await transaction.update(scenarios).set({ i18nKey: item.i18nKey }).where(eq(scenarios.id, item.id));
    }
    if (plan.create.length) await transaction.insert(scenarios).values(plan.create);
    return { backfilled: plan.backfill.length, created: plan.create.length };
  });
}
