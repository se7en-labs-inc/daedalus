import { version as packageVersion } from '../../../package.json';
import type { Environment } from '../../../source/common/types/environment.types';

const environment: Environment = {
  network: 'mainnet',
  apiVersion: 'storybook',
  nodeVersion: 'storybook',
  current: 'development',
  isDev: true,
  isTest: false,
  isProduction: false,
  isMainnet: true,
  isStaging: false,
  isTestnet: false,
  isAlonzoPurple: false,
  isVasilDev: false,
  isPreprod: false,
  isPreview: false,
  isShelleyQA: false,
  isSelfnode: false,
  isDevelopment: true,
  build: 'storybook',
  buildNumber: 'storybook',
  platform: 'darwin',
  platformVersion: 'storybook',
  mainProcessID: '-',
  rendererProcessID: '-',
  os: 'macOS',
  system: 'macOS',
  cpu: [
    {
      model: 'Storybook CPU',
      speed: 0,
      times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 },
    },
  ],
  ram: 16 * 1024 * 1024 * 1024,
  hasMetHardwareRequirements: true,
  installerVersion: 'storybook',
  /*
   * A real semver, not a label. The application's own version is read from
   * package.json, and the newsfeed filters items by matching a target range
   * against it with semver.satisfies (domains/News.ts:104). A placeholder here
   * parses as nothing, so every news item carrying a version target was silently
   * dropped and the news stories rendered an empty feed.
   */
  version: packageVersion,
  isWindows: false,
  isMacOS: true,
  isLinux: false,
  isAppleSilicon: false,
  isBlankScreenFixActive: false,
  keepLocalClusterRunning: false,
  analyticsFeatureEnabled: true,
  catalystApiUrlOverride: undefined,
  votingVisibleOverride: false,
};

// The toolbar OS switch only reaches stories as their `osName` prop while this
// fixture stays static. Stories whose components read the OS from
// global.environment call this to keep both in step.
export const applyEnvironmentOs = (osName: string) => {
  environment.isWindows = osName === 'Windows';
  environment.isLinux = osName === 'Linux';
  environment.isMacOS = osName === 'Mac';
};

global.environment = environment;

/*
 * The same object the module installs on `global.environment`, exported so the
 * store harness can hand it to a screen rather than reaching for the ambient
 * global. A screen printing a version string then prints the same one in the
 * workbench and in a spec.
 */
export default environment;
