import React from 'react';
import Wallet from '../../../../source/renderer/app/containers/wallet/Wallet';
import { screenDecorator } from '../../_support/harness/ScreenStory';
import {
  hardwareWallet,
  legacyWallet,
  restoringWallet,
} from '../../_support/harness/fixtures/wallets';

/*
 * The shell every wallet screen renders inside. It selects a navigation set from
 * the wallet's own kind rather than from the route, so a Byron wallet and a
 * hardware wallet get different tabs from the same container.
 *
 * Its first branch is the one worth having: with no active wallet it renders a
 * spinner inside the main layout, which is what a user sees between selecting a
 * wallet and the store catching up.
 */
const ON_THIS_WALLET = '/wallets/story-wallet-0/summary';

const Placeholder = () => (
  <div style={{ padding: '20px' }}>The wallet page that would render here.</div>
);

export default {
  title: 'Screens / Wallets / Wallet Shell',
  decorators: [screenDecorator({}, { path: ON_THIS_WALLET })],
};

export const Default = {
  render: () => (
    <Wallet>
      <Placeholder />
    </Wallet>
  ),
  name: 'Wallet open',
};

export const NoActiveWallet = {
  decorators: [
    screenDecorator({ wallets: { active: null } }, { path: ON_THIS_WALLET }),
  ],
  render: () => (
    <Wallet>
      <Placeholder />
    </Wallet>
  ),
  name: 'Waiting for the wallet',
};

export const Restoring = {
  // The restore notification sits above the navigation rather than replacing it,
  // so this is the shell plus a banner.
  decorators: [
    screenDecorator(
      { wallets: { active: restoringWallet() } },
      { path: ON_THIS_WALLET }
    ),
  ],
  render: () => (
    <Wallet>
      <Placeholder />
    </Wallet>
  ),
  name: 'Wallet restoring',
};

export const Legacy = {
  decorators: [
    screenDecorator(
      { wallets: { active: legacyWallet() } },
      { path: ON_THIS_WALLET }
    ),
  ],
  render: () => (
    <Wallet>
      <Placeholder />
    </Wallet>
  ),
  name: 'Byron wallet',
};

export const Hardware = {
  decorators: [
    screenDecorator(
      { wallets: { active: hardwareWallet() } },
      { path: ON_THIS_WALLET }
    ),
  ],
  render: () => (
    <Wallet>
      <Placeholder />
    </Wallet>
  ),
  name: 'Hardware wallet',
};
