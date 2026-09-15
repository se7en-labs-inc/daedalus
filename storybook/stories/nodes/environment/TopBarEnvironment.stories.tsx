import React from 'react';
import { action } from '@storybook/addon-actions';
import classNames from 'classnames';
import StoryDecorator from '../../_support/StoryDecorator';
import StoryProvider from '../../_support/StoryProvider';
import SidebarLayout from '../../../../source/renderer/app/components/layout/SidebarLayout';
import TopBar from '../../../../source/renderer/app/components/layout/TopBar';
import topBarStyles from '../../../../source/renderer/app/components/layout/TopBar.scss';
import NodeSyncStatusIcon from '../../../../source/renderer/app/components/widgets/NodeSyncStatusIcon';
import TadaButton from '../../../../source/renderer/app/components/widgets/TadaButton';
import WalletTestEnvironmentLabel from '../../../../source/renderer/app/components/widgets/WalletTestEnvironmentLabel';
import { formattedWalletAmount } from '../../../../source/renderer/app/utils/formatters';
// @ts-ignore ts-migrate(2307) FIXME: Cannot find module '../../../../source/renderer/ap... Remove this comment to see the full error message
import menuIconClosed from '../../../../source/renderer/app/assets/images/menu-ic.inline.svg';
import NewsFeedIcon from '../../../../source/renderer/app/components/widgets/NewsFeedIcon';
import DiscreetToggleTopBar from '../../../../source/renderer/app/features/discreet-mode/ui/discreet-toggle-top-bar/DiscreetToggleTopBar';
import { isShelleyTestnetTheme } from '../../_support/utils';
import { currentThemeOf } from '../../_support/globals';

const topBarTestEnv = (currentTheme, isAlonzoActivated) => (
  <TopBar
    // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
    formattedWalletAmount={formattedWalletAmount}
    currentRoute=""
    showSubMenuToggle={false}
    leftIcon={menuIconClosed}
    isShelleyActivated={isShelleyTestnetTheme(currentTheme)}
    isAlonzoActivated={isAlonzoActivated}
  >
    <WalletTestEnvironmentLabel network="testnet" />
    <NodeSyncStatusIcon
      isSynced
      syncPercentage={100}
      // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
      isProduction={false}
      isMainnet={false}
      hasTadaIcon
    />
    <span
      className={classNames(topBarStyles.rectangle, topBarStyles.hasTadaIcon)}
    />
    <DiscreetToggleTopBar hasTadaIcon />
    <TadaButton onClick={action('onClickTadaButton')} shouldAnimate />
    <NewsFeedIcon
      onNewsFeedIconClick={action('onNewsFeedIconClick')}
      hasNotification={false}
      hasUpdate={false}
    />
  </TopBar>
);

const topBarStagingEnv = (currentTheme, isAlonzoActivated) => (
  <TopBar
    // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
    formattedWalletAmount={formattedWalletAmount}
    currentRoute=""
    showSubMenuToggle={false}
    leftIcon={menuIconClosed}
    isShelleyActivated={isShelleyTestnetTheme(currentTheme)}
    isAlonzoActivated={isAlonzoActivated}
  >
    <WalletTestEnvironmentLabel network="staging" />
    <NodeSyncStatusIcon
      isSynced
      syncPercentage={100}
      // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
      isProduction={false}
      isMainnet={false}
      hasTadaIcon
    />
    <span
      className={classNames(topBarStyles.rectangle, topBarStyles.hasTadaIcon)}
    />
    <DiscreetToggleTopBar hasTadaIcon />
    <TadaButton onClick={action('onClickTadaButton')} shouldAnimate />
    <NewsFeedIcon
      onNewsFeedIconClick={action('onNewsFeedIconClick')}
      hasNotification={false}
      hasUpdate={false}
    />
  </TopBar>
);

const topBarProductionEnv = (currentTheme, isAlonzoActivated) => (
  <TopBar
    // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
    formattedWalletAmount={formattedWalletAmount}
    currentRoute=""
    showSubMenuToggle={false}
    leftIcon={menuIconClosed}
    isShelleyActivated={isShelleyTestnetTheme(currentTheme)}
    isAlonzoActivated={isAlonzoActivated}
  >
    <NodeSyncStatusIcon
      isSynced
      syncPercentage={100}
      // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
      isProduction
      isMainnet
      hasTadaIcon
    />
    <span
      className={classNames(topBarStyles.rectangle, topBarStyles.hasTadaIcon)}
    />
    <DiscreetToggleTopBar hasTadaIcon />
    <TadaButton onClick={action('onClickTadaButton')} shouldAnimate />
    <NewsFeedIcon
      onNewsFeedIconClick={action('onNewsFeedIconClick')}
      hasNotification={false}
      hasUpdate={false}
    />
  </TopBar>
);

export default {
  title: 'Nodes / Environment',

  // One knob under one label served all three stories, so one arg on the meta
  // does too.
  args: { isAlonzoActivated: false },

  decorators: [
    (story) => (
      <StoryProvider>
        <StoryDecorator>{story()}</StoryDecorator>
      </StoryProvider>
    ),
  ],
};

export const Testnet = {
  render: ({ isAlonzoActivated }, context) => (
    <SidebarLayout
      topbar={topBarTestEnv(currentThemeOf(context), isAlonzoActivated)}
      sidebar={<noscript />}
    />
  ),
};

export const Staging = {
  render: ({ isAlonzoActivated }, context) => (
    <SidebarLayout
      topbar={topBarStagingEnv(currentThemeOf(context), isAlonzoActivated)}
      sidebar={<noscript />}
    />
  ),
};

export const Production = {
  render: ({ isAlonzoActivated }, context) => (
    <SidebarLayout
      topbar={topBarProductionEnv(currentThemeOf(context), isAlonzoActivated)}
      sidebar={<noscript />}
    />
  ),
};
