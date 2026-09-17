import log from 'electron-log-daedalus';
import { environment } from '../environment';
import { formatContext } from '../../common/utils/logging';
import { ASSET_LOG_FLAG } from '../../common/utils/assetLogging';
import type { Logger } from '../../common/types/logging.types';
import { toJS } from '../../common/utils/helper';

/**
 * TEMPORARY DIAGNOSTIC INSTRUMENTATION. Revert before this work leaves draft.
 *
 * The main-process asset logger. Identical to `logger` in `./logging` except
 * that it marks the payload, which is what routes the line to `Assets.json` in
 * addition to `Daedalus.json`.
 *
 * It is additive on purpose: nothing is diverted away from the main log, so
 * removing this instrumentation restores the previous logging exactly.
 */
const appName = 'daedalus';
const electronProcess = 'ipcMain';
const { network, os, platformVersion, version } = environment;
const environmentData = {
  network,
  os,
  platformVersion,
  version,
};

const logToLevel =
  (level: string) =>
  (message: string, data?: Record<string, any> | null | undefined) => {
    try {
      log[level](formatContext({ appName, electronProcess, network, level }), {
        message,
        data: toJS(data),
        environmentData,
        [ASSET_LOG_FLAG]: true,
      });
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
