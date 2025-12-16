/**
 * Locale-aware formatting utilities
 * 
 * Uses Intl.* APIs for proper locale-aware date and number formatting.
 * These functions should be used instead of date-fns format() to ensure
 * dates display correctly in Latvian, Russian, and English.
 */

import i18n from './i18n';

type DateStyle = 'full' | 'long' | 'medium' | 'short';

function getLocale(): string {
  return i18n.language || 'lv';
}

/**
 * Format a date using locale-aware formatting
 * @param date - Date to format
 * @param style - 'full' | 'long' | 'medium' | 'short'
 */
export function formatDate(date: Date | string, style: DateStyle = 'medium'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(getLocale(), { dateStyle: style }).format(d);
}

/**
 * Format a date with time using locale-aware formatting
 * @param date - Date to format
 * @param dateStyle - 'full' | 'long' | 'medium' | 'short'
 * @param timeStyle - 'full' | 'long' | 'medium' | 'short'
 */
export function formatDateTime(
  date: Date | string, 
  dateStyle: DateStyle = 'medium',
  timeStyle: DateStyle = 'short'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(getLocale(), { 
    dateStyle, 
    timeStyle 
  }).format(d);
}

/**
 * Format just the weekday name
 * @param date - Date to format
 * @param format - 'long' | 'short' | 'narrow'
 */
export function formatWeekday(date: Date | string, format: 'long' | 'short' | 'narrow' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(getLocale(), { weekday: format }).format(d);
}

/**
 * Format a date as ISO string for filenames (locale-independent)
 * @param date - Date to format
 */
export function formatDateISO(date: Date | string = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Format a number using locale-aware formatting
 * @param value - Number to format
 * @param options - Intl.NumberFormatOptions
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(getLocale(), options).format(value);
}

/**
 * Format a percentage using locale-aware formatting
 * @param value - Number between 0 and 1 (or 0-100 if already percentage)
 * @param decimals - Number of decimal places
 */
export function formatPercent(value: number, decimals: number = 0): string {
  const normalized = value > 1 ? value / 100 : value;
  return new Intl.NumberFormat(getLocale(), {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(normalized);
}
