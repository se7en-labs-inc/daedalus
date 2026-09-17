/**
 * TEMPORARY DIAGNOSTIC INSTRUMENTATION. Revert before this work leaves draft.
 *
 * The marker that separates asset-subsystem lines from every other line passing
 * through electron-log, so a transport can pick them out and write them to a
 * file of their own.
 *
 * A marker rather than a prefix match on the message text. The transport sees
 * every line the application logs, and deciding by string prefix would make the
 * contents of `Assets.json` depend on wording that nothing enforces.
 */
export const ASSET_LOG_FLAG = 'assetLog';

export type AssetLogPayload = {
  message: string;
  data?: Record<string, any> | null;
  environmentData?: Record<string, any>;
  [ASSET_LOG_FLAG]?: true;
};

/**
 * Both processes send `[context, payload]` as the electron-log arguments: the
 * main logger at `source/main/utils/logging.ts` and the renderer logger at
 * `source/renderer/app/utils/logging.ts` build the same pair, and a renderer
 * line arrives in main through `__ELECTRON_LOG__` with that pair intact. So one
 * predicate answers for both.
 */
export const isAssetLogPayload = (value: unknown): boolean =>
  !!value &&
  typeof value === 'object' &&
  (value as Record<string, unknown>)[ASSET_LOG_FLAG] === true;
