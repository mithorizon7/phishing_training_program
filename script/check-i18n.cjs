#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

function loadJson(relativePath) {
  const fullPath = path.resolve(relativePath);
  const raw = fs.readFileSync(fullPath, "utf8");
  return JSON.parse(raw);
}

function collectKeys(obj, prefix = "") {
  const keys = new Set();
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    for (const [key, value] of Object.entries(obj)) {
      const next = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === "object" && !Array.isArray(value)) {
        for (const child of collectKeys(value, next)) {
          keys.add(child);
        }
      } else {
        keys.add(next);
      }
    }
  }
  return keys;
}

function compareKeySets(reference, target) {
  const missing = [];
  for (const key of reference) {
    if (!target.has(key)) missing.push(key);
  }
  return missing.sort();
}

function reportMissing(section, refLabel, targetLabel, missing) {
  if (missing.length === 0) return;
  console.log(`\\n[${section}] Missing in ${targetLabel} (vs ${refLabel}):`);
  for (const key of missing) console.log(`- ${key}`);
}

function checkPair(section, refLabel, refKeys, targetLabel, targetKeys) {
  const missing = compareKeySets(refKeys, targetKeys);
  reportMissing(section, refLabel, targetLabel, missing);
  return missing.length;
}

function run() {
  let failures = 0;

  const en = loadJson("client/src/locales/en.json");
  const lv = loadJson("client/src/locales/lv.json");
  const ru = loadJson("client/src/locales/ru.json");

  const enKeys = collectKeys(en);
  const lvKeys = collectKeys(lv);
  const ruKeys = collectKeys(ru);

  failures += checkPair("ui", "en", enKeys, "lv", lvKeys);
  failures += checkPair("ui", "en", enKeys, "ru", ruKeys);

  const enScenarios = loadJson("client/src/locales/en-scenarios.json");
  const lvScenarios = loadJson("client/src/locales/lv-scenarios.json");
  const ruScenarios = loadJson("client/src/locales/ru-scenarios.json");

  const enScenarioKeys = collectKeys(enScenarios);
  const lvScenarioKeys = collectKeys(lvScenarios);
  const ruScenarioKeys = collectKeys(ruScenarios);

  failures += checkPair("scenarios", "en", enScenarioKeys, "lv", lvScenarioKeys);
  failures += checkPair("scenarios", "en", enScenarioKeys, "ru", ruScenarioKeys);

  if (failures === 0) {
    console.log("i18n parity check: OK");
  } else {
    console.error(`\\ni18n parity check: ${failures} missing key(s).`);
    process.exit(1);
  }
}

run();
