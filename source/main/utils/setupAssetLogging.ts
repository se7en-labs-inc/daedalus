import fs from 'fs';
import path from 'path';
import log from 'electron-log-daedalus';
import ensureDirectoryExists from './ensureDirectoryExists';
import { pubLogsFolderPath } from '../config';
import { environment } from '../environment';
import { isAssetLogPayload } from '../../common/utils/assetLogging';

/**
 * TEMPORARY DIAGNOSTIC INSTRUMENTATION. Revert before this work leaves draft.
 *
 * A log file for the asset subsystem alone, beside `Daedalus.json` and
 * independent of it.
 *
 * `Daedalus.json` cannot hold this evidence. The API success handlers serialise
 * whole response bodies, so one `getTransactions` line runs to hundreds of
 * kilobytes; a real session wrote 20MB in nine seconds, rotating a 5MB file
 * three times and destroying everything logged before it. `setupLogging` also
 * deletes the main log at startup, which takes the previous run with it, and
 * the symptom under investigation changes between runs.
 *
 * Three properties follow from that and are the whole point of this module:
 *
 * The file is not deleted at startup. `setupLogging` removes `Daedalus.*`
 * (`setupLogging.ts:27`), and `Assets.json` does not match that glob, so runs
 * accumulate and can be compared. A banner line separates them.
 *
 * The file has its own rotation. The main log's transport archives by renaming
 * `Daedalus.json` and only ever considers files whose name begins with its own,
 * so nothing it does can reach this file, and nothing written here counts
 * toward its 5MB.
 *
 * The file cannot be flooded. Every line is capped, so a field that turns out
 * to carry more than was intended costs one truncated line rather than the
 * whole history.
 */
const ASSET_LOG_FILE_NAME = 'Assets.json';
const ASSET_LOG_PREVIOUS_FILE_NAME = 'Assets-previous.json';

/**
 * Small, because these lines are scalars. A line that approaches this has a
 * payload in it that should not be there, and truncating says so in the file.
 */
const MAX_LINE_BYTES = 4 * 1024;
const MAX_FILE_BYTES = 8 * 1024 * 1024;

let filePath: string | null = null;
let previousFilePath: string | null = null;
let writtenBytes = 0;

const rotateIfNeeded = (incoming: number): void => {
  if (filePath == null || previousFilePath == null) return;
  if (writtenBytes + incoming <= MAX_FILE_BYTES) return;
  try {
    if (fs.existsSync(previousFilePath)) fs.unlinkSync(previousFilePath);
    fs.renameSync(filePath, previousFilePath);
    writtenBytes = 0;
  } catch {
    // A rotation that cannot happen is not a reason to stop logging; the cap
    // above simply stops applying until the next successful rename.
  }
};

const append = (line: string): void => {
  if (filePath == null) return;
  const capped =
    line.length > MAX_LINE_BYTES
      ? `${line.slice(0, MAX_LINE_BYTES)}...[truncated]`
      : line;
  const text = `${capped}\n`;
  try {
    rotateIfNeeded(Buffer.byteLength(text));
    // Synchronous on purpose. What is being chased can leave the renderer
    // waiting forever, and a buffered stream would lose the tail of the
    // evidence on a kill.
    fs.appendFileSync(filePath, text);
    writtenBytes += Buffer.byteLength(text);
  } catch {
    // A diagnostic must never be able to break the path it is watching.
  }
};

/**
 * `msg.data` is the `[context, payload]` pair both loggers build. The context
 * string already carries the process and the level, so it is kept whole rather
 * than taken apart.
 */
const formatAssetLine = (message: Record<string, any>): string | null => {
  const data = message?.data;
  if (!Array.isArray(data) || data.length < 2) return null;
  const [context, payload] = data;
  if (!isAssetLogPayload(payload)) return null;
  try {
    return JSON.stringify({
      at:
        message.date instanceof Date
          ? message.date.toISOString()
          : new Date().toISOString(),
      sev: message.level,
      ctx: context,
      msg: payload.message,
      data: payload.data ?? {},
    });
  } catch {
    return null;
  }
};

/**
 * Registers the transport. `log` dispatches to every function-valued property
 * of `log.transports` (`electron-log-daedalus/lib/log.js:17-32`), and a
 * renderer line reaches that same object through `__ELECTRON_LOG__`
 * (`electron-log-daedalus/main.js:45-50`), so one transport here catches both
 * processes and no call site has to know which one it is running in.
 */
export const setupAssetLogging = (): void => {
  try {
    ensureDirectoryExists(pubLogsFolderPath);
    filePath = path.join(pubLogsFolderPath, ASSET_LOG_FILE_NAME);
    previousFilePath = path.join(
      pubLogsFolderPath,
      ASSET_LOG_PREVIOUS_FILE_NAME
    );
    try {
      writtenBytes = fs.statSync(filePath).size;
    } catch {
      writtenBytes = 0;
    }

    const assetFileTransport = (message: Record<string, any>): void => {
      const line = formatAssetLine(message);
      if (line == null) return;
      append(line);
    };
    // Everything, so a `debug` line is not dropped before it is written. The
    // level on this transport is independent of the main file transport's.
    assetFileTransport.level = 'debug';

    // `log.transports` is typed as a fixed set of transports, and the
    // dispatcher walks own properties rather than that set.
    const transports = log.transports as unknown as Record<string, unknown>;
    transports.assetFile = assetFileTransport;

    append(
      JSON.stringify({
        at: new Date().toISOString(),
        sev: 'info',
        ctx: '[daedalus:session]',
        msg: 'Asset log: session started',
        data: {
          pid: process.pid,
          version: environment.version,
          network: environment.network,
          os: environment.os,
        },
      })
    );
  } catch {
    filePath = null;
    previousFilePath = null;
  }
};
