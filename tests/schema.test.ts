import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { insertScenarioSchema, insertShiftSchema } from "../shared/schema";
import { scenariosSeed } from "../server/scenarios-seed";

test("generated insert schemas accept the full authored scenario library", () => {
  for (const scenario of scenariosSeed) {
    const result = insertScenarioSchema.safeParse(scenario);
    assert(result.success, `${scenario.i18nKey}: ${result.error?.message}`);
  }
  assert(insertShiftSchema.safeParse({ userId: "test", scenarioIds: ["fixture"] }).success);
  assert.equal(insertShiftSchema.safeParse({ userId: "test", scenarioIds: [123] }).success, false);
});

test("oversized constrained collections reject before parsing their elements", () => {
  let parsedElements = 0;
  const bounded = z.array(z.string().transform((value) => {
    parsedElements += 1;
    return value;
  })).max(2);

  assert.equal(bounded.safeParse(["one", "two", "three"]).success, false);
  assert.equal(parsedElements, 0);
});
