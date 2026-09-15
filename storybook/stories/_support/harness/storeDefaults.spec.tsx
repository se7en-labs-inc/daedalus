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
import { backendPhase } from './fixtures/backend';
import { screenDecorator } from './ScreenStory';
import { ROUTES } from '../../../../source/renderer/app/routes-config';
import {
  alertNewsFeed,
  incidentNewsFeed,
  populatedNewsFeed,
  updateAvailable,
} from './fixtures/news';
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

describe('backendPhase', () => {
  // The seven values of LoadingPhase (common/types/watchdog.types.ts:49-56).
  // Enumerated here so a value added to the type without a preset shows up as a
  // failure rather than as a screen state no story can reach.
  const LOADING_PHASES = [
    'starting',
    'chain-storage-setup',
    'bootstrap-decision',
    'mithril-syncing',
    'node-starting',
    'ready',
    'error',
  ];

  it('offers a preset for every loading phase', () => {
    const phases = Object.values(backendPhase).map(
      (preset) => preset().loadingPhase
    );
    expect(phases.sort()).toEqual([...LOADING_PHASES].sort());
  });

  it('carries the observables behind the phase, not only the phase', () => {
    // The sync container reads mithrilPhase directly while the loading page
    // branches on loadingPhase, so a preset that named only the phase would put
    // the two into a combination the store cannot produce.
    expect(backendPhase.mithrilSyncing().mithrilPhase).toBe('downloading');
    expect(backendPhase.bootstrapDecision().hasChain).toBe(false);
    expect(backendPhase.chainStorageSetup().chainPathConfirmed).toBe(false);
    expect(backendPhase.error().walletUnrecoverable).toBe(true);
    expect(backendPhase.ready().walletPort).not.toBeNull();
  });

  it('gives every preset the commands the loading screens send', () => {
    const commands = [
      'startMithril',
      'startMithrilForce',
      'startNode',
      'cancelMithril',
      'dismissMithrilPrompt',
      'confirmStorageLocation',
      'validateChainStorageDirectory',
      'setChainStorageDirectory',
      'resetChainStorageDirectory',
    ];
    Object.values(backendPhase).forEach((preset) => {
      const state = preset();
      commands.forEach((command) => {
        expect(typeof state[command]).toBe('function');
      });
    });
  });
});

describe('news fixtures', () => {
  /*
   * The assertion that matters is that the items survive.
   *
   * `NewsCollection` filters every item against the running platform and version
   * before anything can read it, and an item that fails either test is dropped
   * with no signal. These fixtures were producing empty collections for exactly
   * that reason, and a story showing an empty feed looks like a story about an
   * empty feed. Counting what comes out is the only thing that tells them apart.
   */
  it('produces items the collection keeps rather than discards', () => {
    expect(populatedNewsFeed().all.length).toBe(4);
    expect(incidentNewsFeed().all.length).toBe(2);
    expect(alertNewsFeed().all.length).toBe(1);
  });

  it('gives the containers the branches they read', () => {
    // Each container picks its view from one of these, so each has to be
    // reachable from some fixture.
    expect(incidentNewsFeed().incident).not.toBeNull();
    expect(populatedNewsFeed().incident).toBeNull();
    expect(alertNewsFeed().alerts.unread.length).toBe(1);
    // One of the two alerts is marked read, so unread is not just the list.
    expect(populatedNewsFeed().alerts.all.length).toBe(2);
    expect(populatedNewsFeed().alerts.unread.length).toBe(1);
  });

  it('offers an update the overlay will render', () => {
    // The container returns null without one, so this is the whole difference
    // between a story and an empty panel.
    expect(updateAvailable().availableUpdate).not.toBeNull();
    expect(createStoreDefaults().appUpdate.availableUpdate).toBeNull();
  });
});

describe('screenDecorator', () => {
  /*
   * The decorator is a function returning a function, and what it decides is a
   * store map. Rendering it would prove the frame mounts; reading what it built
   * proves the three route consumers were given the same answer, which is the
   * property that cannot be seen from a screenshot.
   */
  // The StoryProvider the decorator built is the only element in the frame
  // carrying storeOverrides, so walking down to it returns what the decorator
  // decided.
  const findProvider = (node) => {
    if (!node || typeof node !== 'object') return null;
    if (node.props && node.props.storeOverrides) return node;
    return findProvider(node.props && node.props.children);
  };

  const storesFromDecorator = (overrides = {}, options = {}) => {
    const frame = screenDecorator(overrides, options);
    const provider = findProvider(frame(() => null));
    expect(provider).not.toBeNull();
    return provider.props.storeOverrides;
  };

  it('gives the router and the app store the same path', () => {
    const overrides = storesFromDecorator(
      {},
      { path: ROUTES.SETTINGS.GENERAL }
    );
    expect(overrides.router.location.pathname).toBe(ROUTES.SETTINGS.GENERAL);
    expect(overrides.app.currentRoute).toBe(ROUTES.SETTINGS.GENERAL);
  });

  it('defaults to the root when a screen does not say where it is', () => {
    const overrides = storesFromDecorator();
    expect(overrides.router.location.pathname).toBe(ROUTES.ROOT);
    expect(overrides.app.currentRoute).toBe(ROUTES.ROOT);
  });

  it('leaves the other overrides a story made alone', () => {
    const overrides = storesFromDecorator(
      { profile: { currentTheme: 'cardano' }, app: { newsFeedIsOpen: true } },
      { path: ROUTES.WALLETS.ROOT }
    );
    expect(overrides.profile.currentTheme).toBe('cardano');
    expect(overrides.app.newsFeedIsOpen).toBe(true);
    expect(overrides.app.currentRoute).toBe(ROUTES.WALLETS.ROOT);
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
