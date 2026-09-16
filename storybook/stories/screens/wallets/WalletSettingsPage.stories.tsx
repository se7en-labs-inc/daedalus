import React from 'react';
import WalletSettingsPage from '../../../../source/renderer/app/containers/wallet/WalletSettingsPage';
import { screenDecorator } from '../../_support/harness/ScreenStory';
import {
  hardwareWallet,
  legacyWallet,
} from '../../_support/harness/fixtures/wallets';

/*
 * The densest screen in the tranche. It constructs eight nested containers as
 * elements on every render and mounts each one only behind its own dialog
 * predicate, so the bare screen is already paying for all eight being built
 * while showing none of them.
 *
 * Its branches come from the wallet rather than from the route: a hardware
 * wallet has no spending password to change and a Byron wallet has no delegation
 * to show, so each is a different screen rather than the same one with fields
 * disabled.
 */
const ON_THIS_WALLET = '/wallets/story-wallet-0/settings';

export default {
  title: 'Screens / Wallets / Wallet Settings',
  decorators: [screenDecorator({}, { path: ON_THIS_WALLET })],
};

export const Default = {
  render: () => <WalletSettingsPage />,
  name: 'Shelley wallet',
};

export const Legacy = {
  decorators: [
    screenDecorator(
      { wallets: { active: legacyWallet() } },
      { path: ON_THIS_WALLET }
    ),
  ],
  render: () => <WalletSettingsPage />,
  name: 'Byron wallet',
};

export const HardwareWallet = {
  decorators: [
    screenDecorator(
      { wallets: { active: hardwareWallet() } },
      { path: ON_THIS_WALLET }
    ),
  ],
  render: () => <WalletSettingsPage />,
  name: 'Hardware wallet',
};
