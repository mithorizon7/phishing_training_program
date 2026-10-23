import assert from "node:assert/strict";
import { test } from "node:test";
import type { Scenario } from "../shared/schema";
import { scenariosSeed } from "../server/scenarios-seed";
import { planScenarioSeed } from "../server/scenario-seeding";

const legacy = scenariosSeed.map((scenario, index) => ({ ...scenario, id: `legacy-${index}`, i18nKey: null }) as Scenario);

test("legacy scenarios receive localization keys without duplication or ID changes", () => {
  const before = structuredClone(legacy);
  const plan = planScenarioSeed(legacy, scenariosSeed);
  assert.equal(plan.backfill.length, scenariosSeed.length);
  assert.equal(plan.create.length, 0);
  assert.deepEqual(legacy, before);
  const localized = legacy.map((scenario) => ({ ...scenario, i18nKey: plan.backfill.find((item) => item.id === scenario.id)!.i18nKey }));
  assert.deepEqual(planScenarioSeed(localized, scenariosSeed), { backfill: [], create: [] });
});

test("partial libraries add only genuinely missing authored scenarios", () => {
  const keyed = { ...legacy[0], i18nKey: scenariosSeed[0].i18nKey };
  const plan = planScenarioSeed([keyed, legacy[1]], scenariosSeed);
  assert.equal(plan.backfill.length, 1);
  assert.equal(plan.create.length, scenariosSeed.length - 2);
  assert.equal(plan.backfill[0].id, legacy[1].id);
});

test("custom content is preserved and repeated authored keys do not create duplicates", () => {
  const custom = { ...legacy[0], body: "Custom training content" };
  const seed = scenariosSeed[0];
  const plan = planScenarioSeed([custom], [seed, seed]);
  assert.equal(plan.backfill.length, 0);
  assert.equal(plan.create.length, 1);
  assert.equal(custom.body, "Custom training content");
});
