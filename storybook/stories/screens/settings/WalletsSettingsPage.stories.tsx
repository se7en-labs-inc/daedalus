import React from 'react';
import WalletsSettingsPage from '../../../../source/renderer/app/containers/settings/categories/WalletsSettingsPage';
import currenciesList from '../../../../source/renderer/app/config/currenciesList.json';
import {
  getLocalizedCurrenciesList,
  getLocalizedCurrency,
} from '../../../../source/renderer/app/config/currencyConfig';
import { screenDecorator } from '../../_support/harness/ScreenStory';

/*
 * The currency list comes from the application's own table, localized by the
 * application's own helper, rather than from a hand-written fixture. The screen
 * reads `localizedCurrencyList` and `localizedCurrency` as finished values, so a
 * fixture would have had to reproduce the shape those two helpers produce and
 * would stop matching the moment either changed.
 */
const currentLocale = 'en-US';
const localizedCurrencyList = getLocalizedCurrenciesList(
  [currenciesList.usd, currenciesList.eur, currenciesList.jpy],
  currentLocale
);
const localizedCurrency = getLocalizedCurrency(
  currenciesList.usd,
  currentLocale
);

export default {
  title: 'Screens / Settings / Wallets Settings',
  decorators: [screenDecorator()],
};

export const Default = {
  render: () => <WalletsSettingsPage />,
  name: 'Conversion off',
};

/*
 * `isActive` gates the whole conversion panel, so with it off the screen is one
 * switch and nothing else. The second story is the one that exercises the
 * currency select, the rate and the disclaimer.
 */
export const ConversionActive = {
  decorators: [
    screenDecorator({
      currency: {
        isActive: true,
        localizedCurrencyList,
        localizedCurrency,
        rate: 0.4521,
      },
    }),
  ],
  render: () => <WalletsSettingsPage />,
  name: 'Conversion on',
};
