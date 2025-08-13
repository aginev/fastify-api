import 'dotenv/config';
import { context } from './context';
import app, { start } from './server';

/**
 * Graceful shutdown
 */
let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  app.log.info({ signal }, 'Starting graceful shutdown');

  // Force-exit safety net
  const forceExit = setTimeout(() => {
    app.log.error('Graceful shutdown timed out. Forcing exit.');

    process.exit(1);
  }, 10_000);

  forceExit.unref();

  try {
    // closes the server and waits for onClose hooks
    await app.close();

    app.log.info('HTTP server closed');
  } catch (err) {
    app.log.error({ err }, 'Error during shutdown');
  } finally {
    clearTimeout(forceExit);

    process.exit(0);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('uncaughtException', error => {
  const requestId = context.getStore()?.requestId;

  app.log.error({ error, requestId }, 'Uncaught exception');

  shutdown('uncaughtException');
});

process.on('unhandledRejection', reason => {
  const requestId = context.getStore()?.requestId;

  app.log.error({ error: reason, requestId }, 'Unhandled promise rejection');

  shutdown('unhandledRejection');
});

start();
