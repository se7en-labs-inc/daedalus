import React from 'react';
import { Provider } from 'mobx-react';
import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { ThemeProvider } from 'react-polymorph/lib/components/ThemeProvider';
import { SimpleSkins } from 'react-polymorph/lib/skins/simple';
import { SimpleDefaults } from 'react-polymorph/lib/themes/simple';
import { daedalusTheme } from '../../../../source/renderer/app/themes/daedalus';
import { themeOverrides } from '../../../../source/renderer/app/themes/overrides';
import actions from '../../../../source/renderer/app/actions';
import DisplaySettingsPage from '../../../../source/renderer/app/containers/settings/categories/DisplaySettingsPage';
import GeneralSettingsPage from '../../../../source/renderer/app/containers/settings/categories/GeneralSettingsPage';
// The application's translations module bulk-loads through require.context,
// which is a webpack construct. The spec reads the one locale file it needs.
import enMessages from '../../../../source/renderer/app/i18n/locales/en-US.json';
import { createStoreDefaults, withStoreOverrides } from './storeDefaults';
import {
  REQUESTS_BY_STORE,
  requestDefault,
  requestsFor,
} from './requestDefaults';

/*
 * What this file is for.
 *
 * A screen story can build, index and render nothing with every check green, so
 * "the bundle built" is not evidence that a container mounted. Jest renders the
 * real container through the real Provider against the harness map, which is the
 * one place in this repository where that can be checked without a browser.
 */

const STORE_NAMES = [
  'addresses',
  'app',
  'backend',
  'appUpdate',
  'currency',
  'assets',
  'hardwareWallets',
  'governance',
  'networkStatus',
  'newsFeed',
  'profile',
  'router',
  'sidebar',
  'staking',
  'transactions',
  'uiDialogs',
  'uiNotifications',
  'voting',
  'wallets',
  'walletsLocal',
  'walletBackup',
  'walletMigration',
  'walletSettings',
  'window',
];

/*
 * The same frame a screen story renders inside: react-polymorph's ThemeProvider
 * supplies the skins its form components resolve through, and without it a
 * FormField renders an undefined element type rather than a control.
 */
const renderScreen = (Screen, overrides) =>
  render(
    <ThemeProvider
      theme={daedalusTheme}
      skins={SimpleSkins}
      variables={SimpleDefaults}
      themeOverrides={themeOverrides}
    >
      <IntlProvider locale="en-US" messages={enMessages}>
        <Provider stores={withStoreOverrides(overrides)} actions={actions}>
          <Screen />
        </Provider>
      </IntlProvider>
    </ThemeProvider>
  );

describe('createStoreDefaults', () => {
  it('resolves every name in StoresMap to an object', () => {
    const stores = createStoreDefaults();
    expect(Object.keys(stores).sort()).toEqual([...STORE_NAMES].sort());
    STORE_NAMES.forEach((name) => {
      expect(typeof stores[name]).toBe('object');
      expect(stores[name]).not.toBeNull();
    });
  });

  it('constructs no store instance and starts no reaction', () => {
    const stores = createStoreDefaults();
    Object.values(stores).forEach((store) => {
      // A real store carries these from the Store base class. A fixture that
      // acquired one would mean a real store had been constructed, which takes
      // a live Api and starts polling.
      expect(store).not.toHaveProperty('_reactions');
      expect(store).not.toHaveProperty('initialize');
      expect(store).not.toHaveProperty('api');
    });
  });
});

describe('request defaults', () => {
  // The fields the containers read, measured over source/renderer/app/containers.
  const READ_BY_CONTAINERS = [
    'isExecuting',
    'isExecutingFirstTime',
    'wasExecuted',
    'error',
    'result',
  ];

  it('carries every field a container reads through', () => {
    const request = requestDefault();
    READ_BY_CONTAINERS.forEach((field) => {
      expect(request).toHaveProperty(field);
    });
    // Handlers call these, and a handler that throws on click is a worse story
    // than one that does nothing.
    expect(typeof request.reset).toBe('function');
    expect(typeof request.execute).toBe('function');
    // A method, so a screen calling it on a plain object throws rather than
    // reading undefined.
    expect(typeof request.isExecutingWithArgs).toBe('function');
  });

  it('gives every request a screen reads a default on its own store', () => {
    const stores = createStoreDefaults();
    Object.entries(REQUESTS_BY_STORE).forEach(([storeName, requests]) => {
      requests.forEach((requestName) => {
        expect(stores[storeName]).toHaveProperty(requestName);
        READ_BY_CONTAINERS.forEach((field) => {
          expect(stores[storeName][requestName]).toHaveProperty(field);
        });
      });
    });
  });

  it('gives each store a fresh request rather than a shared one', () => {
    // Two stories running in one workbench must not see each other's edits.
    const first = requestsFor('wallets');
    const second = requestsFor('wallets');
    expect(first.createWalletRequest).not.toBe(second.createWalletRequest);
  });
});

describe('withStoreOverrides', () => {
  it('merges a named store one level deep and leaves the rest at their defaults', () => {
    const stores = withStoreOverrides({ profile: { currentTheme: 'yellow' } });
    expect(stores.profile.currentTheme).toBe('yellow');
    // The override replaces one field rather than the store.
    expect(stores.profile.currentLocale).toBe(
      createStoreDefaults().profile.currentLocale
    );
    expect(Object.keys(stores)).toHaveLength(STORE_NAMES.length);
  });

  it('leaves the defaults untouched between calls', () => {
    withStoreOverrides({ profile: { currentTheme: 'yellow' } });
    expect(createStoreDefaults().profile.currentTheme).toBe('dark-blue');
  });
});

describe('a screen container mounted through the harness', () => {
  it('renders with a one-key override', () => {
    const { container } = renderScreen(DisplaySettingsPage, {
      profile: { currentTheme: 'cardano' },
    });
    expect(container.firstChild).not.toBeNull();
    expect(container.textContent.length).toBeGreaterThan(0);
  });

  it('renders with a two-key override and nothing else', () => {
    const { container } = renderScreen(GeneralSettingsPage, {
      profile: { currentLocale: 'en-US' },
      app: { isDownloadNotificationVisible: false },
    });
    expect(container.firstChild).not.toBeNull();
    expect(container.textContent.length).toBeGreaterThan(0);
  });
});
