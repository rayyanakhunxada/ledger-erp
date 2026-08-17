export const STORAGE_PREFIX = 'erp:';

export const STORAGE_KEYS = [
  'erp:settings',
  'erp:auth',
  'erp:products',
  'erp:categories',
  'erp:warehouses',
  'erp:stock-movements',
  'erp:customers',
  'erp:orders',
  'erp:leads',
  'erp:suppliers',
  'erp:purchase-orders',
];

/** Export every ERP key from localStorage into a single downloadable JSON blob. */
export function exportAllData(): Record<string, unknown> {
  const dump: Record<string, unknown> = {};
  for (const key of STORAGE_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        dump[key] = JSON.parse(raw);
      } catch {
        dump[key] = raw;
      }
    }
  }
  return dump;
}

/** Restore ERP data from a previously exported JSON object, then reload the app. */
export function importAllData(data: Record<string, unknown>) {
  for (const key of STORAGE_KEYS) {
    if (key in data) {
      localStorage.setItem(key, JSON.stringify(data[key]));
    }
  }
  window.location.reload();
}

/** Wipe every ERP key and reload — used by "Reset demo data". */
export function clearAllData() {
  for (const key of STORAGE_KEYS) localStorage.removeItem(key);
  window.location.reload();
}
