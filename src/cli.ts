import { AppContainer } from './container/app-container.js';

/**
 * ============================================================================
 * APPLICATION ENTRYPOINT: Interactive CLI
 * ============================================================================
 */

const STORAGE_TYPE = (process.env.STORAGE_TYPE as 'in-memory' | 'file') || 'file';

const container = new AppContainer({
  storageType: STORAGE_TYPE,
  filePath: './data/tasks.json',
  enableConsoleNotifications: false, // CLI already outputs results nicely
});

container.interactiveCLI.start().catch((err) => {
  console.error('CLI Error:', err);
  process.exit(1);
});
