import type { ColumnType } from '../types/xfeature';

/**
 * Format Utilities
 * Functions for formatting cell values in datatables
 */

export function formatCellValue(
  value: unknown,
  type: ColumnType,
  format?: string
): string {
  if (value === null || value === undefined) {
    return '-';
  }

  switch (type) {
    case 'Date':
      return formatDate(value, format);
    case 'DateTime':
      return formatDateTime(value, format);
    case 'Currency':
      return formatCurrency(value, format);
    case 'Percentage':
      return formatPercentage(value);
    case 'Boolean':
      return formatBoolean(value);
    case 'Link':
      return formatLink(value);
    case 'Image':
      return formatImage(value);
    case 'Badge':
      return formatBadge(value);
    case 'Email':
      return formatEmail(value);
    case 'Phone':
      return formatPhone(value);
    case 'URL':
      return formatURL(value);
    case 'Number':
      return formatNumber(value);
    default:
      return String(value);
  }
}

function formatDate(value: unknown, format?: string): string {
  try {
    const date = new Date(String(value));
    if (isNaN(date.getTime())) return String(value);

    if (format) {
      return date.toLocaleDateString('en-US', parseFormatString(format));
    }
    return date.toLocaleDateString();
  } catch {
    return String(value);
  }
}

function formatDateTime(value: unknown, format?: string): string {
  try {
    const date = new Date(String(value));
    if (isNaN(date.getTime())) return String(value);

    if (format) {
      return date.toLocaleString('en-US', parseFormatString(format));
    }
    return date.toLocaleString();
  } catch {
    return String(value);
  }
}

function formatCurrency(value: unknown, currency = 'USD'): string {
  try {
    const num = Number(value);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(num);
  } catch {
    return String(value);
  }
}

function formatPercentage(value: unknown): string {
  try {
    const num = Number(value);
    return `${num.toFixed(2)}%`;
  } catch {
    return String(value);
  }
}

function formatBoolean(value: unknown): string {
  const bool = Boolean(value);
  return bool ? 'Yes' : 'No';
}

function formatLink(value: unknown): string {
  const url = String(value);
  return url;
}

function formatImage(value: unknown): string {
  return String(value);
}

function formatBadge(value: unknown): string {
  return String(value);
}

function formatEmail(value: unknown): string {
  return String(value);
}

function formatPhone(value: unknown): string {
  try {
    const phone = String(value).replace(/\D/g, '');
    if (phone.length === 10) {
      return `(${phone.substring(0, 3)}) ${phone.substring(3, 6)}-${phone.substring(6)}`;
    }
    return String(value);
  } catch {
    return String(value);
  }
}

function formatURL(value: unknown): string {
  return String(value);
}

function formatNumber(value: unknown): string {
  try {
    const num = Number(value);
    return num.toLocaleString();
  } catch {
    return String(value);
  }
}

function parseFormatString(format: string): Intl.DateTimeFormatOptions {
  const options: Intl.DateTimeFormatOptions = {};

  if (format.includes('YYYY') || format.includes('yyyy')) {
    options.year = 'numeric';
  }
  if (format.includes('MM') || format.includes('mm')) {
    options.month = 'long';
  }
  if (format.includes('DD') || format.includes('dd')) {
    options.day = '2-digit';
  }
  if (format.includes('HH') || format.includes('hh')) {
    options.hour = '2-digit';
  }
  if (format.includes('mm') || format.includes('MM')) {
    options.minute = '2-digit';
  }
  if (format.includes('ss') || format.includes('SS')) {
    options.second = '2-digit';
  }

  return Object.keys(options).length > 0
    ? options
    : { year: 'numeric', month: 'short', day: 'numeric' };
}
