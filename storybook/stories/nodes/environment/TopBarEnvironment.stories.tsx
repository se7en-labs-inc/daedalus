import React from 'react';
import { action } from '@storybook/addon-actions';
import classNames from 'classnames';
import StoryDecorator from '../../_support/StoryDecorator';
import StoryProvider from '../../_support/StoryProvider';
import SidebarLayout from '../../../../source/renderer/app/components/layout/SidebarLayout';
import TopBar from '../../../../source/renderer/app/components/layout/TopBar';
import topBarStyles from '../../../../source/renderer/app/components/layout/TopBar.scss';
import NodeSyncStatusIcon from '../../../../source/renderer/app/components/widgets/NodeSyncStatusIcon';
import WalletTestEnvironmentLabel from '../../../../source/renderer/app/components/widgets/WalletTestEnvironmentLabel';
import { formattedWalletAmount } from '../../../../source/renderer/app/utils/formatters';
// @ts-ignore ts-migrate(2307) FIXME: Cannot find module '../../../../source/renderer/ap... Remove this comment to see the full error message
import menuIconClosed from '../../../../source/renderer/app/assets/images/menu-ic.inline.svg';
import NewsFeedIcon from '../../../../source/renderer/app/components/widgets/NewsFeedIcon';
import DiscreetToggleTopBar from '../../../../source/renderer/app/features/discreet-mode/ui/discreet-toggle-top-bar/DiscreetToggleTopBar';
import { isShelleyTestnetTheme } from '../../_support/utils';
import { currentThemeOf } from '../../_support/globals';

const topBarTestEnv = (currentTheme) => (
  <TopBar
    // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
    formattedWalletAmount={formattedWalletAmount}
    currentRoute=""
    showSubMenuToggle={false}
    leftIcon={menuIconClosed}
    isShelleyActivated={isShelleyTestnetTheme(currentTheme)}
  >
    <WalletTestEnvironmentLabel network="testnet" />
    <NodeSyncStatusIcon
      isSynced
      syncPercentage={100}
      // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
      isProduction={false}
      isMainnet={false}
    />
    <span className={classNames(topBarStyles.rectangle)} />
    <DiscreetToggleTopBar />
    <NewsFeedIcon
      onNewsFeedIconClick={action('onNewsFeedIconClick')}
      hasNotification={false}
      hasUpdate={false}
    />
  </TopBar>
);

const topBarStagingEnv = (currentTheme) => (
  <TopBar
    // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
    formattedWalletAmount={formattedWalletAmount}
    currentRoute=""
    showSubMenuToggle={false}
    leftIcon={menuIconClosed}
    isShelleyActivated={isShelleyTestnetTheme(currentTheme)}
  >
    <WalletTestEnvironmentLabel network="staging" />
    <NodeSyncStatusIcon
      isSynced
      syncPercentage={100}
      // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
      isProduction={false}
      isMainnet={false}
    />
    <span className={classNames(topBarStyles.rectangle)} />
    <DiscreetToggleTopBar />
    <NewsFeedIcon
      onNewsFeedIconClick={action('onNewsFeedIconClick')}
      hasNotification={false}
      hasUpdate={false}
    />
  </TopBar>
);

const topBarProductionEnv = (currentTheme) => (
  <TopBar
    // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
    formattedWalletAmount={formattedWalletAmount}
    currentRoute=""
    showSubMenuToggle={false}
    leftIcon={menuIconClosed}
    isShelleyActivated={isShelleyTestnetTheme(currentTheme)}
  >
    <NodeSyncStatusIcon
      isSynced
      syncPercentage={100}
      // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
      isProduction
      isMainnet
    />
    <span className={classNames(topBarStyles.rectangle)} />
    <DiscreetToggleTopBar />
    <NewsFeedIcon
      onNewsFeedIconClick={action('onNewsFeedIconClick')}
      hasNotification={false}
      hasUpdate={false}
    />
  </TopBar>
);

export default {
  title: 'Nodes / Environment',

  decorators: [
    (story) => (
      <StoryProvider>
        <StoryDecorator>{story()}</StoryDecorator>
      </StoryProvider>
    ),
  ],
};

export const Testnet = {
  render: (_args, context) => (
    <SidebarLayout
      topbar={topBarTestEnv(currentThemeOf(context))}
      sidebar={<noscript />}
    />
  ),
};

export const Staging = {
  render: (_args, context) => (
    <SidebarLayout
      topbar={topBarStagingEnv(currentThemeOf(context))}
      sidebar={<noscript />}
    />
  ),
};

export const Production = {
  render: (_args, context) => (
    <SidebarLayout
      topbar={topBarProductionEnv(currentThemeOf(context))}
      sidebar={<noscript />}
    />
  ),
};
