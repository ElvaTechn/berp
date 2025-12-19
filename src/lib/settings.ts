/**
 * Global Settings Management
 * In-memory storage with default values fallback
 */

export interface GlobalSettings {
  currency: string;
  dateFormat: string;
  lowStockThreshold: number;
  enableEmailNotifications: boolean;
  enableSmsNotifications: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  companyName: string;
  companyLogo: string;
}

const defaultSettings: GlobalSettings = {
  currency: 'MZN',
  dateFormat: 'dd/MM/yyyy',
  lowStockThreshold: 10,
  enableEmailNotifications: false,
  enableSmsNotifications: false,
  backupFrequency: 'weekly',
  companyName: '',
  companyLogo: '',
};

let inMemorySettings: GlobalSettings = { ...defaultSettings };

export function getSettings(): GlobalSettings {
  return { ...inMemorySettings };
}

export function updateSettings(updates: Partial<GlobalSettings>): GlobalSettings {
  inMemorySettings = {
    ...inMemorySettings,
    ...updates,
  };
  return { ...inMemorySettings };
}

export function resetSettings(): GlobalSettings {
  inMemorySettings = { ...defaultSettings };
  return { ...inMemorySettings };
}

export function getDefaultSettings(): GlobalSettings {
  return { ...defaultSettings };
}
