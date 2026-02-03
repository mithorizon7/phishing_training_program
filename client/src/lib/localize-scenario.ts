import type { Scenario } from "@shared/schema";
import type { TFunction } from "i18next";

export function localizeScenario(scenario: Scenario, t: TFunction): Scenario {
  const key = scenario.i18nKey || scenario.id;
  const baseKey = `scenarios.${key}`;

  return {
    ...scenario,
    senderName: t(`${baseKey}.senderName`),
    subject: scenario.subject ? t(`${baseKey}.subject`) : scenario.subject,
    body: t(`${baseKey}.body`),
    timestamp: t(`${baseKey}.timestamp`),
    explanation: t(`${baseKey}.explanation`),
    cues: scenario.cues?.map((_, index) => t(`${baseKey}.cues.${index}`)) ?? [],
    linkText: scenario.linkText ? t(`${baseKey}.linkText`) : scenario.linkText,
    attachmentName: scenario.attachmentName ? t(`${baseKey}.attachmentName`) : scenario.attachmentName,
  };
}
