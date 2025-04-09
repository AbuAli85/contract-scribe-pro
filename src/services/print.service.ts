
/**
 * Print Service
 * Centralized service for printing functionality
 * 
 * @deprecated Use the modular services from src/services/print/ instead
 */

// Re-export everything from the modular print service
export * from './print/index';
export { printService } from './print/index';
