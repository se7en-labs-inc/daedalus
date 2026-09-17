import { formatContext } from '../../../common/utils/logging';
import { ASSET_LOG_FLAG } from '../../../common/utils/assetLogging';
import type { Logger, LoggingLevel } from '../../../common/types/logging.types';

/**
 * TEMPORARY DIAGNOSTIC INSTRUMENTATION. Revert before this work leaves draft.
 *
 * The renderer-side asset logger. It marks the payload exactly as the main-side
 * one does, and the line reaches the same transport: the preload bridge hands
 * it to electron-log, which forwards it to the main process over
 * `__ELECTRON_LOG__`, where it is dispatched through the same `transports`
 * object. So there is one file and one format for both sides, and no call site
 * has to route anything.
 *
 * Nothing is read at module scope. `logging.ts` next to this destructures
 * `global.environment` as it loads, which throws wherever that global is not
 * installed, and a component that imports this must not become a component that
 * cannot be rendered in a spec.
 */
const appName = 'daedalus';
const electronProcess = 'ipcRenderer';

const logToLevel =
  (level: LoggingLevel) =>
  (message: string, data?: Record<string, any> | null | undefined) => {
    try {
      const { electronLog, environment } = global as Record<string, any>;
      if (!electronLog || typeof electronLog[level] !== 'function') return;
      const { network, os, platformVersion, version } = environment ?? {};
      electronLog[level](
        formatContext({ appName, electronProcess, network, level }),
        {
          message,
          data,
          environmentData: { network, os, platformVersion, version },
          [ASSET_LOG_FLAG]: true,
        }
      );
    } catch {
      // A diagnostic must never be able to break the path it is watching.
    }
  };

export const assetLogger: Logger = {
  debug: logToLevel('debug'),
  info: logToLevel('info'),
  error: logToLevel('error'),
  warn: logToLevel('warn'),
};
