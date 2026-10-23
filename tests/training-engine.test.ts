import assert from "node:assert/strict";
import { test } from "node:test";
import type { Scenario } from "../shared/schema";
import { scenariosSeed } from "../server/scenarios-seed";
import { applyDecision, calculateOutcome, createEmptyProgress, createShift } from "../client/src/lib/training-engine";

const library = scenariosSeed.map((scenario, index) => ({ ...scenario, id: `fixture-${index}` }) as Scenario);

test("every authored correct action produces safe feedback and positive points", () => {
  for (const scenario of library) {
    const result = calculateOutcome(scenario, scenario.correctAction, scenario.correctAction === "verify");
    assert.equal(result.outcome, "safe", scenario.i18nKey || scenario.id);
    assert(result.points > 0, scenario.i18nKey || scenario.id);
  }
});

test("correctly deleting an informational message keeps score, accuracy and feedback consistent", () => {
  const scenario = library.find((item) => item.legitimacy === "legitimate" && item.correctAction === "delete")!;
  assert(scenario);
  const shift = createShift({ scenarios: [scenario] });
  const result = applyDecision({ shift, progress: createEmptyProgress("test"), scenario, action: "delete", confidence: 75, scenarioLibrary: library });
  assert.equal(result.outcome, "safe");
  assert.equal(result.progress.correctDecisions, 1);
  assert.equal(result.progress.currentStreak, 1);
  assert(result.pointsEarned > 0);
  assert.throws(() => applyDecision({ shift: result.shift, progress: result.progress, scenario, action: "delete", confidence: 75, scenarioLibrary: library }), /already submitted/);
});

test("an incorrect but safe decision resets the consecutive-correct streak", () => {
  const scenario = library.find((item) => item.legitimacy === "malicious" && item.correctAction === "verify")!;
  const result = applyDecision({ shift: createShift({ scenarios: [scenario] }), progress: { ...createEmptyProgress("test"), currentStreak: 9, longestStreak: 9 }, scenario, action: "report", confidence: 75, scenarioLibrary: library });
  assert.equal(result.outcome, "safe");
  assert.equal(result.progress.currentStreak, 0);
  assert.equal(result.progress.longestStreak, 9);
});

test("verification budget is enforced before changing progress", () => {
  const scenario = library.find((item) => item.correctAction === "verify")!;
  assert.throws(() => applyDecision({ shift: createShift({ scenarios: [scenario], verificationBudget: 0 }), progress: createEmptyProgress("test"), scenario, action: "verify", confidence: 75, scenarioLibrary: library }), /No verifications/);
});
