import { AppContainer } from './container/app-container.js';

/**
 * ============================================================================
 * APPLICATION ENTRYPOINT: Express HTTP Server
 * ============================================================================
 */

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const STORAGE_TYPE = (process.env.STORAGE_TYPE as 'in-memory' | 'file') || 'file';

console.log('🚀 Initializing Hexagonal Architecture App Container...');

// Initialize the composition root container
const container = new AppContainer({
  storageType: STORAGE_TYPE,
  filePath: './data/tasks.json',
});

const app = container.expressApp;

app.listen(PORT, () => {
  console.log('\n======================================================');
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`📦 Storage Adapter:    ${STORAGE_TYPE}`);
  console.log('======================================================');
  console.log('\nTry these sample REST endpoints:');
  console.log(`  GET  http://localhost:${PORT}/api/tasks`);
  console.log(`  POST http://localhost:${PORT}/api/tasks`);
  console.log(`       Body: { "title": "Review AI Architecture", "prompt": "Explain ports and adapters" }`);
  console.log(`  POST http://localhost:${PORT}/api/tasks/:id/execute`);
  console.log('======================================================\n');
});
