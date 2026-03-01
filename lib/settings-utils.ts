import { DBSettings, AppSettings } from '../types/inventory.types';

export function convertDbSettingsToAppSettings(dbSettings: DBSettings): AppSettings {
  return {
    lowStockThreshold: dbSettings.low_stock_threshold,
    defaultLoanDays: dbSettings.default_loan_days,
    autoBackup: dbSettings.auto_backup,
    notifications: dbSettings.notifications,
    currency: dbSettings.currency,
    language: dbSettings.language,
    categories: dbSettings.categories,
    sources: dbSettings.sources,
    teachers: dbSettings.teachers,
    locations: dbSettings.locations,
  };
}

export function convertAppSettingsToDbSettings(appSettings: AppSettings): Omit<DBSettings, 'id' | 'created_at' | 'updated_at'> {
  return {
    low_stock_threshold: appSettings.lowStockThreshold,
    default_loan_days: appSettings.defaultLoanDays,
    auto_backup: appSettings.autoBackup,
    notifications: appSettings.notifications,
    currency: appSettings.currency,
    language: appSettings.language,
    categories: appSettings.categories,
    sources: appSettings.sources,
    teachers: appSettings.teachers,
    locations: appSettings.locations,
  };
}
