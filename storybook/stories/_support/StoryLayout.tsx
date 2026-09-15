import React, { Component, Children } from 'react';
// @ts-ignore ts-migrate(2305) FIXME: Module '"react"' has no exported member 'Node'.
import type { Node } from 'react';
import { observable, runInAction } from 'mobx';
import BigNumber from 'bignumber.js';
import { observer, inject } from 'mobx-react';
import { get } from 'lodash';
import { action } from '@storybook/addon-actions';
import classNames from 'classnames';
import { isShelleyTestnetTheme } from './utils';
// Assets and helpers
import { CATEGORIES_BY_NAME } from '../../../source/renderer/app/config/sidebarConfig';
import {
  StoryGlobalsContext,
  numberFormatFor,
  type StoryGlobals,
} from './storyGlobals';
import { formattedWalletAmount } from '../../../source/renderer/app/utils/formatters';
import NodeSyncStatusIcon from '../../../source/renderer/app/components/widgets/NodeSyncStatusIcon';
import { DiscreetToggleTopBar } from '../../../source/renderer/app/features';
import Wallet, {
  WalletSyncStateStatuses,
} from '../../../source/renderer/app/domains/Wallet';
import NewsFeedIcon from '../../../source/renderer/app/components/widgets/NewsFeedIcon';
import type { SidebarMenus } from '../../../source/renderer/app/components/sidebar/types';
import type { SidebarWalletType } from '../../../source/renderer/app/types/sidebarTypes';
import {
  WalletSortBy,
  WalletSortOrder,
} from '../../../source/renderer/app/types/sidebarTypes';
// Empty screen elements
import TopBar from '../../../source/renderer/app/components/layout/TopBar';
import Sidebar from '../../../source/renderer/app/components/sidebar/Sidebar';
import SidebarLayout from '../../../source/renderer/app/components/layout/SidebarLayout';
// @ts-ignore ts-migrate(2307) FIXME: Cannot find module '../../../source/renderer/app/a... Remove this comment to see the full error message
import menuIconOpened from '../../../source/renderer/app/assets/images/menu-opened-ic.inline.svg';
// @ts-ignore ts-migrate(2307) FIXME: Cannot find module '../../../source/renderer/app/a... Remove this comment to see the full error message
import menuIconClosed from '../../../source/renderer/app/assets/images/menu-ic.inline.svg';
import topBarStyles from '../../../source/renderer/app/components/layout/TopBar.scss';

export type StoriesProps = {
  wallets: Array<Wallet>;
  activeWalletId: string;
  setActiveWalletId: (...args: Array<any>) => any;
};
type Props = {
  activeSidebarCategory: string;
  currentTheme: string;
  storiesProps: any | StoriesProps;
  story?: string;
  children?: any | Node;
  stores?: {} | null | undefined;
  /*
   * The precondition for the top bar's transfer-funds offer, which is a domain
   * flag rather than a display mode: TopBar reads it as
   * `(hasRewardsWallets && onTransferFunds) || onWalletAdd`. Only the wallets
   * wrapper reaches a story that can show that notification, so only it passes
   * this, and it passes the story's own arg. Everything else takes the default,
   * which is the value the knob defaulted to.
   */
  hasRewardsWallets?: boolean;
};
const CATEGORIES_COUNTDOWN = [
  CATEGORIES_BY_NAME.WALLETS,
  CATEGORIES_BY_NAME.STAKING_DELEGATION_COUNTDOWN,
  CATEGORIES_BY_NAME.SETTINGS,
];
const CATEGORIES = [
  CATEGORIES_BY_NAME.WALLETS,
  CATEGORIES_BY_NAME.STAKING,
  CATEGORIES_BY_NAME.SETTINGS,
];

@inject('stores', 'storiesProps')
@observer
class StoryLayout extends Component<Props> {
  static defaultProps = {
    stores: null,
    storiesProps: null,
    hasRewardsWallets: true,
  };

  // StoryLayout is neither a story nor a decorator, so it has no story context
  // to read the number format from. StoryWrapper publishes it above every story.
  static contextType = StoryGlobalsContext;

  context!: StoryGlobals;

  render() {
    const {
      activeSidebarCategory,
      currentTheme,
      story = '',
      storiesProps = {},
      stores,
      children,
    } = this.props;
    const { wallets, activeWalletId, setActiveWalletId } = storiesProps;
    const activeWallet: Wallet = wallets[parseInt(activeWalletId, 10)];
    const activeNavItem = story.split(' ')[0].toLowerCase();
    const sidebarMenus = this.getSidebarMenus(
      this.getSidebarWallets(wallets),
      activeWalletId,
      setActiveWalletId
    );
    BigNumber.config({
      FORMAT: numberFormatFor(this.context.numberFormat),
    });
    return (
      <div
        style={{
          minHeight: '100%',
          height: '100vh',
        }}
      >
        <SidebarLayout
          sidebar={this.getSidebar(
            story,
            activeSidebarCategory,
            sidebarMenus,
            currentTheme
          )}
          topbar={this.getTopbar(
            activeSidebarCategory,
            activeWallet,
            activeNavItem,
            currentTheme
          )}
        >
          {Children.map(children, (child) =>
            React.cloneElement(child, {
              stores,
              storiesProps,
            })
          )}
        </SidebarLayout>
      </div>
    );
  }

  @observable
  isShowingSubMenus =
    this.props.activeSidebarCategory === '/wallets' && !!this.props.children;
  getSidebarWallets = (wallets: Array<Wallet>): Array<SidebarWalletType> =>
    wallets.map((wallet: Wallet) => ({
      id: wallet.id,
      title: wallet.name,
      amount: wallet.amount,
      isConnected: true,
      hasPassword: wallet.hasPassword,
      isNotResponding:
        get(wallet, 'syncState.status', WalletSyncStateStatuses.READY) ===
        WalletSyncStateStatuses.NOT_RESPONDING,
      isRestoreActive:
        get(wallet, 'syncState.status', WalletSyncStateStatuses.READY) ===
        WalletSyncStateStatuses.RESTORING,
      restoreProgress: get(wallet, 'syncState.progress.quantity', 0),
      isLegacy: wallet.isLegacy,
      hasNotification: false,
    }));
  getSidebarMenus = (
    items: Array<SidebarWalletType>,
    activeWalletId: string,
    setActiveWalletId: (...args: Array<any>) => any
  ) => ({
    wallets: {
      items,
      activeWalletId,
      actions: {
        onAddWallet: action('toggleAddWallet'),
        onWalletItemClick: setActiveWalletId,
        onWalletSortBy: action('sortWallet'),
        onSearch: action('searchWallet'),
      },
      searchValue: '',
      walletSortConfig: {
        sortOrder: WalletSortOrder.Asc,
        sortBy: WalletSortBy.Date,
      },
    },
  });
  getSidebar = (
    story: string,
    activeSidebarCategory: string,
    sidebarMenus: SidebarMenus,
    currentTheme: string
  ) => {
    const sidebarCategories =
      story === 'Decentralization Start Info'
        ? CATEGORIES_COUNTDOWN
        : CATEGORIES;
    return (
      <Sidebar
        categories={sidebarCategories}
        activeSidebarCategory={activeSidebarCategory}
        menus={sidebarMenus}
        isShowingSubMenus={this.isShowingSubMenus}
        onActivateCategory={action('onActivateCategory')}
        // @ts-ignore ts-migrate(2322) FIXME: Type '{ categories: { name: string; icon: any; rou... Remove this comment to see the full error message
        isDialogOpen={() => false}
        onAddWallet={action('onAddWallet')}
        onOpenDialog={action('onOpenDialog')}
        onSubmitSupportRequest={() => {}}
        pathname="/"
        currentTheme={currentTheme}
        network="testnet"
        isShelleyActivated={isShelleyTestnetTheme(currentTheme)}
      />
    );
  };
  getTopbar = (
    activeSidebarCategory: string,
    activeWallet: Wallet,
    activeNavItem: string,
    currentTheme: string
  ) => (
    <TopBar
      // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
      onToggleSidebar={() => {
        runInAction(() => {
          this.isShowingSubMenus = !this.isShowingSubMenus;
        });
      }}
      formattedWalletAmount={formattedWalletAmount}
      currentRoute={`/wallets/${activeWallet.id}/${activeNavItem}`}
      activeWallet={
        activeSidebarCategory === '/wallets' && activeNavItem !== 'empty'
          ? activeWallet
          : null
      }
      showSubMenuToggle
      showSubMenus={this.isShowingSubMenus}
      leftIcon={this.isShowingSubMenus ? menuIconOpened : menuIconClosed}
      onTransferFunds={action('onTransferFunds')}
      onWalletAdd={action('onWalletAdd')}
      hasRewardsWallets={this.props.hasRewardsWallets}
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
}

export default StoryLayout;
