#!/usr/bin/env tsx
/**
 * i18n Validation Script
 * 
 * Validates locale files for:
 * - Missing keys in lv/ru compared to en (source)
 * - Placeholder mismatches between locales
 * - Invalid ICU syntax
 * - Empty translations
 * 
 * Key Convention: feature.screen.element.state
 * Examples: header.dashboard, training.actions.report, dashboard.stats.detectionRate
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '../client/src/locales');
const SOURCE_LOCALE = 'en';
const TARGET_LOCALES = ['lv', 'ru'];

interface ValidationResult {
  errors: string[];
  warnings: string[];
}

function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else if (typeof value === 'string') {
      result[newKey] = value;
    }
  }
  
  return result;
}

function extractPlaceholders(text: string): Set<string> {
  const placeholders = new Set<string>();
  
  const simpleRegex = /\{(\w+)(?:,\s*(?:number|date|time|plural|select|selectordinal))?[^}]*\}/g;
  let match;
  
  while ((match = simpleRegex.exec(text)) !== null) {
    const placeholder = match[1].trim();
    if (placeholder && placeholder !== '#') {
      placeholders.add(placeholder);
    }
  }
  
  return placeholders;
}

function validateICUSyntax(text: string, key: string): string | null {
  let braceCount = 0;
  
  for (const char of text) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    if (braceCount < 0) {
      return `Invalid ICU syntax in key "${key}": unmatched closing brace`;
    }
  }
  
  if (braceCount !== 0) {
    return `Invalid ICU syntax in key "${key}": unmatched opening brace`;
  }
  
  return null;
}

function loadLocale(locale: string): Record<string, unknown> {
  const filePath = path.join(LOCALES_DIR, `${locale}.json`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Locale file not found: ${filePath}`);
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function validateLocales(): ValidationResult {
  const result: ValidationResult = {
    errors: [],
    warnings: [],
  };

  let sourceData: Record<string, unknown>;
  try {
    sourceData = loadLocale(SOURCE_LOCALE);
  } catch (error) {
    result.errors.push(`Failed to load source locale (${SOURCE_LOCALE}): ${error}`);
    return result;
  }

  const sourceFlat = flattenObject(sourceData);
  const sourceKeys = new Set(Object.keys(sourceFlat));

  for (const key of sourceKeys) {
    const icuError = validateICUSyntax(sourceFlat[key], `${SOURCE_LOCALE}.${key}`);
    if (icuError) {
      result.errors.push(icuError);
    }
  }

  for (const locale of TARGET_LOCALES) {
    let targetData: Record<string, unknown>;
    
    try {
      targetData = loadLocale(locale);
    } catch (error) {
      result.errors.push(`Failed to load locale (${locale}): ${error}`);
      continue;
    }

    const targetFlat = flattenObject(targetData);
    const targetKeys = new Set(Object.keys(targetFlat));

    for (const key of sourceKeys) {
      if (!targetKeys.has(key)) {
        result.errors.push(`Missing key in ${locale}: ${key}`);
      }
    }

    for (const key of targetKeys) {
      if (!sourceKeys.has(key)) {
        result.warnings.push(`Extra key in ${locale} (not in source): ${key}`);
      }
    }

    for (const key of sourceKeys) {
      if (!targetKeys.has(key)) continue;
      
      const sourceValue = sourceFlat[key];
      const targetValue = targetFlat[key];

      if (!targetValue || targetValue.trim() === '') {
        result.errors.push(`Empty translation in ${locale}: ${key}`);
        continue;
      }

      const icuError = validateICUSyntax(targetValue, `${locale}.${key}`);
      if (icuError) {
        result.errors.push(icuError);
      }

      const sourcePlaceholders = extractPlaceholders(sourceValue);
      const targetPlaceholders = extractPlaceholders(targetValue);

      for (const placeholder of sourcePlaceholders) {
        if (!targetPlaceholders.has(placeholder)) {
          result.errors.push(
            `Placeholder mismatch in ${locale}.${key}: missing {${placeholder}} (exists in ${SOURCE_LOCALE})`
          );
        }
      }

      for (const placeholder of targetPlaceholders) {
        if (!sourcePlaceholders.has(placeholder)) {
          result.warnings.push(
            `Extra placeholder in ${locale}.${key}: {${placeholder}} (not in ${SOURCE_LOCALE})`
          );
        }
      }
    }
  }

  return result;
}

function main() {
  console.log('Validating i18n locale files...\n');
  
  const result = validateLocales();
  
  if (result.warnings.length > 0) {
    console.log('Warnings:');
    for (const warning of result.warnings) {
      console.log(`  - ${warning}`);
    }
    console.log();
  }
  
  if (result.errors.length > 0) {
    console.log('Errors:');
    for (const error of result.errors) {
      console.log(`  - ${error}`);
    }
    console.log();
    console.log(`Validation failed with ${result.errors.length} error(s).`);
    process.exit(1);
  }
  
  console.log('All locale files are valid!');
  process.exit(0);
}

main();
