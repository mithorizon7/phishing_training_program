import type { Scenario } from "@shared/schema";
import type { TFunction } from "i18next";

export function localizeScenario(scenario: Scenario, t: TFunction): Scenario {
  // If no i18nKey is set, return the scenario as-is (content is in the database)
  if (!scenario.i18nKey) {
    return scenario;
  }

  const baseKey = `scenarios.${scenario.i18nKey}`;

  // Helper to get translation with fallback to original value
  const getTranslation = (key: string, fallback: string | null | undefined): string | null => {
    if (fallback === null || fallback === undefined) return fallback as null;
    const translated = t(key, { defaultValue: fallback });
    return translated || fallback;
  };

  const localizeCues = (): string[] => scenario.cues.map((cue, index) => (
    getTranslation(`${baseKey}.cues.${index}`, cue) ?? cue
  ));

  return {
    ...scenario,
    senderName: getTranslation(`${baseKey}.senderName`, scenario.senderName) ?? scenario.senderName,
    subject: getTranslation(`${baseKey}.subject`, scenario.subject),
    body: getTranslation(`${baseKey}.body`, scenario.body) ?? scenario.body,
    timestamp: getTranslation(`${baseKey}.timestamp`, scenario.timestamp) ?? scenario.timestamp,
    explanation: getTranslation(`${baseKey}.explanation`, scenario.explanation) ?? scenario.explanation,
    cues: localizeCues(),
    linkText: getTranslation(`${baseKey}.linkText`, scenario.linkText),
    attachmentName: getTranslation(`${baseKey}.attachmentName`, scenario.attachmentName),
  };
}
