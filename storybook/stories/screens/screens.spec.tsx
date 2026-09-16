import React from 'react';
import { render } from '@testing-library/react';
import { composeStories } from '@storybook/react';
import { IntlProvider } from 'react-intl';
import enMessages from '../../../source/renderer/app/i18n/locales/en-US.json';

import * as displaySettings from './settings/DisplaySettingsPage.stories';
import * as generalSettings from './settings/GeneralSettingsPage.stories';
import * as termsOfUse from './settings/TermsOfUseSettingsPage.stories';
import * as support from './settings/SupportSettingsPage.stories';
import * as security from './settings/SecuritySettingsPage.stories';
import * as about from './static/AboutDialog.stories';
import * as splashNetwork from './splash/SplashNetworkPage.stories';
import * as assetSettings from './assets/AssetSettingsDialogContainer.stories';
import * as initialSettings from './profile/InitialSettingsPage.stories';
import * as termsOfUsePage from './profile/TermsOfUsePage.stories';
import * as analyticsConsent from './profile/AnalyticsConsentPage.stories';
import * as walletsSettings from './settings/WalletsSettingsPage.stories';
import * as noDiskSpace from './loading/NoDiskSpaceErrorPage.stories';
import * as systemTime from './loading/SystemTimeErrorPage.stories';
import * as toggleRTSFlags from './knownIssues/ToggleRTSFlagsDialogContainer.stories';
import * as rtsRecommendation from './knownIssues/RTSFlagsRecommendationOverlayContainer.stories';
import * as loadingPage from './loading/LoadingPage.stories';
import * as syncingConnecting from './loading/SyncingConnectingPage.stories';
import * as mithrilSync from './loading/MithrilSyncContainer.stories';
import * as chainStorage from './loading/ChainStorageContainer.stories';
import * as diagnostics from './status/DaedalusDiagnosticsDialog.stories';
import * as newsFeed from './news/NewsFeedContainer.stories';
import * as newsOverlay from './news/NewsOverlayContainer.stories';
import * as appUpdate from './appUpdate/AppUpdateContainer.stories';
import * as notifications from './notifications/NotificationsContainer.stories';
import * as mainLayout from './chrome/MainLayout.stories';
import * as topBar from './chrome/TopBarContainer.stories';
import * as settingsChrome from './chrome/Settings.stories';
import * as governance from './chrome/Governance.stories';
import * as walletSummary from './wallets/WalletSummaryPage.stories';
import * as walletShell from './wallets/Wallet.stories';
import * as walletAdd from './wallets/WalletAddPage.stories';
import * as walletSend from './wallets/WalletSendPage.stories';
import * as walletReceive from './wallets/WalletReceivePage.stories';
import * as walletTokens from './wallets/WalletTokensPage.stories';
import * as walletTransactions from './wallets/WalletTransactionsPage.stories';
import * as walletSettings from './wallets/WalletSettingsPage.stories';
import * as walletUtxo from './wallets/WalletUtxoPage.stories';
import * as stakingShell from './staking/Staking.stories';
import * as delegationCenter from './staking/DelegationCenterPage.stories';
import * as stakePoolsList from './staking/StakePoolsListPage.stories';
import * as stakingRewards from './staking/StakingRewardsPage.stories';
import * as stakePoolsSettings from './settings/StakePoolsSettingsPage.stories';
import * as redeemItn from './staking/RedeemItnRewardsContainer.stories';

/*
 * Every screen story, mounted.
 *
 * A story that builds and indexes is not a story that renders: phase 3 found
 * thirteen in this corpus that did the first two and not the third, and nothing
 * in the build could tell them apart. `composeStories` runs the real story with
 * its real decorators, so what is asserted here is the same thing the workbench
 * shows rather than a reconstruction of it.
 *
 * The bar is deliberately low and honest: the screen mounts without throwing and
 * puts something on the page. That it puts the *right* thing on the page is not
 * checked, and no automated check in this repository does.
 *
 * Asserted against `baseElement` rather than `container`, because several of
 * these screens are modals and render through a portal attached to the document
 * rather than into the tree the renderer returns. Asserting on `container` would
 * have called the about dialog empty while it was on screen.
 *
 * The locale frame is supplied here rather than by the story. In the workbench it
 * comes from preview.tsx, which `composeStories` does not apply: it runs a
 * story's own decorators, and the project's annotations are a separate
 * registration. Supplying it in the story instead would nest a second
 * IntlProvider inside the workbench's and take the locale toolbar away from every
 * screen, so the seam stays here and this is what it costs.
 */
const modules = {
  DisplaySettingsPage: displaySettings,
  GeneralSettingsPage: generalSettings,
  TermsOfUseSettingsPage: termsOfUse,
  SupportSettingsPage: support,
  SecuritySettingsPage: security,
  AboutDialog: about,
  SplashNetworkPage: splashNetwork,
  AssetSettingsDialogContainer: assetSettings,
  InitialSettingsPage: initialSettings,
  TermsOfUsePage: termsOfUsePage,
  AnalyticsConsentPage: analyticsConsent,
  WalletsSettingsPage: walletsSettings,
  NoDiskSpaceErrorPage: noDiskSpace,
  SystemTimeErrorPage: systemTime,
  ToggleRTSFlagsDialogContainer: toggleRTSFlags,
  RTSFlagsRecommendationOverlayContainer: rtsRecommendation,
  LoadingPage: loadingPage,
  SyncingConnectingPage: syncingConnecting,
  MithrilSyncContainer: mithrilSync,
  ChainStorageContainer: chainStorage,
  DaedalusDiagnosticsDialog: diagnostics,
  NewsFeedContainer: newsFeed,
  NewsOverlayContainer: newsOverlay,
  AppUpdateContainer: appUpdate,
  NotificationsContainer: notifications,
  MainLayout: mainLayout,
  TopBarContainer: topBar,
  Settings: settingsChrome,
  Governance: governance,
  WalletSummaryPage: walletSummary,
  Wallet: walletShell,
  WalletAddPage: walletAdd,
  WalletSendPage: walletSend,
  WalletReceivePage: walletReceive,
  WalletTokensPage: walletTokens,
  WalletTransactionsPage: walletTransactions,
  WalletSettingsPage: walletSettings,
  WalletUtxoPage: walletUtxo,
  Staking: stakingShell,
  DelegationCenterPage: delegationCenter,
  StakePoolsListPage: stakePoolsList,
  StakingRewardsPage: stakingRewards,
  StakePoolsSettingsPage: stakePoolsSettings,
  RedeemItnRewardsContainer: redeemItn,
};

/*
 * Five containers return null by design, and each of those states is worth a
 * story: the dialog that is shut is what most routes see, the splash screen does
 * not exist outside a Flight build, the RTS recommendation is gone for good once
 * it has been dismissed, there is usually no incident to announce, and there is
 * usually no update waiting. They are listed rather than branched on inside an
 * assertion, so each case has its own expectation.
 */
const RENDERS_NOTHING = new Set([
  'AssetSettingsDialogContainer:Closed',
  'SplashNetworkPage:NotAFlightBuild',
  'RTSFlagsRecommendationOverlayContainer:Acknowledged',
  'NewsOverlayContainer:Nothing',
  'AppUpdateContainer:NoUpdate',
  'RedeemItnRewardsContainer:NotStarted',
]);

/*
 * `composeStories` is generic over the shape of one story module, and the map
 * above holds eighteen different ones. Past a dozen the inferred element type
 * collapses to `unknown` rather than to the component it is, so the result is
 * named for what the function documents it to return: one component per story.
 *
 * reduce rather than flatMap: tsconfig declares target es2019 but lib ["dom"],
 * so the ES2019 array methods are not in the effective library surface.
 */
const composedFrom = (mod): Record<string, React.ComponentType> =>
  composeStories(mod) as Record<string, React.ComponentType>;

const allStories = Object.entries(modules).reduce<
  Array<{ id: string; Story: React.ComponentType }>
>(
  (acc, [screen, mod]) =>
    acc.concat(
      Object.entries(composedFrom(mod)).map(([storyName, Story]) => ({
        id: `${screen}:${storyName}`,
        Story,
      }))
    ),
  []
);

const renderStory = (Story) =>
  render(
    <IntlProvider locale="en-US" messages={enMessages}>
      <Story />
    </IntlProvider>
  );

/*
 * Seven stories across two containers cannot be mounted here, and the reason is a
 * defect in a shipped component rather than a limit of the test environment.
 *
 * `LogosDisplay.componentDidMount` searches the whole document for
 * `.LogosDisplay_daedalusLogo svg` and dereferences the result without checking
 * it. The class name is one css-loader is configured to generate, and the `svg`
 * is one `lottie-web` produces, so in a browser both hold and the line works. In
 * jsdom lottie produces no `svg`, the selector misses, and the screen throws
 * during mount.
 *
 * These are asserted to throw rather than skipped. The application has no error
 * boundary, so this is the launch screen going blank if the selector ever misses
 * in a real build, and an assertion that it throws is an assertion that will fail
 * the day a guard is added, at which point these stories join the mounted set.
 * Written up in .agent/findings/09-launch-screen-depends-on-a-generated-class-name.md.
 */
const THROWS_AT_THE_LOGO = new Set([
  'SyncingConnectingPage:Default',
  'SyncingConnectingPage:Connecting',
  'SyncingConnectingPage:MithrilOffer',
  'SyncingConnectingPage:LongReplay',
  'LoadingPage:Default',
  'LoadingPage:NoDiskSpace',
  'LoadingPage:SystemTimeError',
]);

/*
 * Two screens render a tree with no text in it, and that is the state they
 * document rather than a failure. The notification bar draws one element per
 * configured notification whatever the store says and shows a label only for the
 * active ones, so with none active it is a stack of empty wrappers. The top bar
 * with no wallet open, on mainnet, with nothing unread is a row of icons: every
 * piece of text it can show is behind one of those conditions.
 *
 * Asserted as elements present and text absent, which is a stronger statement
 * than either of the two groups above would make about them.
 */
const RENDERS_WITHOUT_TEXT = new Set([
  'NotificationsContainer:Default',
  'TopBarContainer:Default',
  'TopBarContainer:WithUnreadNews',
]);

const showsSomething = allStories.filter(
  (s) =>
    !RENDERS_NOTHING.has(s.id) &&
    !THROWS_AT_THE_LOGO.has(s.id) &&
    !RENDERS_WITHOUT_TEXT.has(s.id)
);
const showsNothing = allStories.filter((s) => RENDERS_NOTHING.has(s.id));
const throwsAtTheLogo = allStories.filter((s) => THROWS_AT_THE_LOGO.has(s.id));
const showsNoText = allStories.filter((s) => RENDERS_WITHOUT_TEXT.has(s.id));

describe('screen stories', () => {
  it('composes every screen story', () => {
    expect(allStories).toHaveLength(116);
    expect(showsNothing).toHaveLength(RENDERS_NOTHING.size);
    expect(throwsAtTheLogo).toHaveLength(THROWS_AT_THE_LOGO.size);
    expect(showsNoText).toHaveLength(RENDERS_WITHOUT_TEXT.size);
  });

  it.each(showsSomething.map((s) => [s.id, s.Story]))(
    '%s mounts and puts content on the page',
    (_id, Story) => {
      const { baseElement } = renderStory(Story);
      expect(baseElement.textContent.length).toBeGreaterThan(0);
    }
  );

  it.each(showsNothing.map((s) => [s.id, s.Story]))(
    '%s mounts and renders nothing, which is the state it documents',
    (_id, Story) => {
      const { container } = renderStory(Story);
      expect(container.firstChild).toBeNull();
    }
  );

  it.each(showsNoText.map((s) => [s.id, s.Story]))(
    '%s mounts, renders its frame and shows no text, which is the quiet state',
    (_id, Story) => {
      const { baseElement } = renderStory(Story);
      expect(baseElement.querySelectorAll('div').length).toBeGreaterThan(1);
      expect(baseElement.textContent).toBe('');
    }
  );

  it.each(throwsAtTheLogo.map((s) => [s.id, s.Story]))(
    '%s throws at the unguarded logo lookup, which is the defect it records',
    (_id, Story) => {
      // The message is asserted rather than the fact of throwing, so this cannot
      // pass on some other failure introduced later.
      expect(() => renderStory(Story)).toThrow(/setAttribute/);
    }
  );
});
