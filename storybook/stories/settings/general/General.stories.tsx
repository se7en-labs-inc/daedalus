import React from 'react';
import { action } from '@storybook/addon-actions';
import { useArgs, useGlobals } from '@storybook/preview-api';
import SettingsWrapper from '../utils/SettingsWrapper';
import { themesIds } from '../../_support/config';
import { localeOf } from '../../_support/globals';
import { rangeFrom } from '../../_support/argTypes';
// Screens
import ProfileSettingsForm from '../../../../source/renderer/app/components/widgets/forms/ProfileSettingsForm';
import StakePoolsSettings from '../../../../source/renderer/app/components/settings/categories/StakePoolsSettings';
import DisplaySettings from '../../../../source/renderer/app/components/settings/categories/DisplaySettings';
import SupportSettings from '../../../../source/renderer/app/components/settings/categories/SupportSettings';
import TermsOfUseSettings from '../../../../source/renderer/app/components/settings/categories/TermsOfUseSettings';
import WalletsSettings from '../../../../source/renderer/app/components/settings/categories/WalletsSettings';
import SecuritySettings from '../../../../source/renderer/app/components/settings/categories/SecuritySettings';
// Assets and helpers
import {
  LocaleStoryStore,
  mockedLocaleState,
  onLocaleValueChange,
} from '../utils/helpers';
import currenciesList from '../../../../source/renderer/app/config/currenciesList.json';
import { getLocalizedCurrenciesList } from '../../../../source/renderer/app/config/currencyConfig';

const mockedWalletsState = {
  currencyIsActive: true,
  currencySelected: {
    id: 'uniswap-state-dollar',
    code: 'usd',
    name: 'unified Stable Dollar',
  },
};

const mockedSecurityStore = {
  discreetMode: true,
  openDiscreetMode: false,
};

const getParamName = (obj, itemName): any =>
  Object.entries(obj).find((entry: [any, any]) => itemName === entry[1]);

export default {
  title: 'Settings / General',
  decorators: [SettingsWrapper],
};

export const General = {
  args: { ...mockedLocaleState, isSubmitting: false },

  render: () => {
    const [{ isSubmitting, ...locale }, updateArgs] = useArgs<
      LocaleStoryStore & { isSubmitting: boolean }
    >();
    return (
      <ProfileSettingsForm
        isSubmitting={isSubmitting}
        onSubmit={action('submit')}
        onChangeItem={(id, value) => onLocaleValueChange(updateArgs, id, value)}
        {...locale}
      />
    );
  },
};

export const Wallets = {
  args: mockedWalletsState,

  render: () => {
    const [{ currencyIsActive, currencySelected }, updateArgs] = useArgs();
    return (
      <WalletsSettings
        currencySelected={currencySelected}
        // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
        currencyRate={0.321}
        // @ts-ignore ts-migrate(2345) FIXME: Argument of type '{ aed: { code: string; decimalDi... Remove this comment to see the full error message
        currencyList={getLocalizedCurrenciesList(currenciesList, 'en-US')}
        onSelectCurrency={(code) =>
          updateArgs({
            currencySelected: currenciesList[code],
          })
        }
        onToggleCurrencyIsActive={(value) =>
          updateArgs({ currencyIsActive: value })
        }
        onOpenExternalLink={action('onOpenExternalLink')}
        currencyIsActive={currencyIsActive}
      />
    );
  },
};

export const StakePools = {
  args: { isSyncing: false, syncPercentage: 70, isLoading: false },
  argTypes: { syncPercentage: rangeFrom({ min: 0, max: 100, step: 1 }) },

  render: ({ isSyncing, syncPercentage, isLoading }) => (
    <StakePoolsSettings
      onSelectSmashServerUrl={action('onSelectSmashServerUrl')}
      onResetSmashServerError={action('onResetSmashServerError')}
      smashServerUrl="https://smash.cardano-mainnet.iohk.io"
      onOpenExternalLink={action('onOpenExternalLink')}
      isSyncing={isSyncing}
      syncPercentage={syncPercentage}
      isLoading={isLoading}
    />
  ),
};

export const Themes = () => {
  // The toolbar selection is a Storybook global now, so this writes back
  // through updateGlobals rather than over an addon channel.
  const [, updateGlobals] = useGlobals();
  return (
    <DisplaySettings
      theme="DarkBlue"
      selectTheme={({ theme }) => {
        updateGlobals({ themeName: getParamName(themesIds, theme)[0] });
      }}
    />
  );
};

export const TermsOfService = {
  render: (_args, context) => {
    const termsOfUseSource = require(
      `../../../../source/renderer/app/i18n/locales/terms-of-use/${localeOf(context)}.md`
    );

    return (
      <TermsOfUseSettings
        localizedTermsOfUse={termsOfUseSource}
        onOpenExternalLink={() => null}
      />
    );
  },

  name: 'Terms of Service',
};

export const Support = {
  args: { disableDownloadLogs: false, analyticsAccepted: false },

  render: ({ disableDownloadLogs, analyticsAccepted }) => (
    <SupportSettings
      onExternalLinkClick={action('onExternalLinkClick')}
      onSupportRequestClick={action('onSupportRequestClick')}
      onDownloadLogs={action('onDownloadLogs')}
      disableDownloadLogs={disableDownloadLogs}
      analyticsAccepted={analyticsAccepted}
    />
  ),
};

export const Security = {
  args: mockedSecurityStore,

  render: () => {
    const [{ discreetMode, openDiscreetMode }, updateArgs] = useArgs();
    return (
      <SecuritySettings
        onDiscreetModeToggle={(value) => updateArgs({ discreetMode: value })}
        onOpenDiscreetModeToggle={(value) =>
          updateArgs({ openDiscreetMode: value })
        }
        discreetMode={discreetMode}
        openDiscreetMode={openDiscreetMode}
      />
    );
  },
};
