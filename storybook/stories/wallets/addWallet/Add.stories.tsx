import React from 'react';
// Screens
import WalletAdd from '../../../../source/renderer/app/components/wallet/WalletAdd';

const wrapperStyles = {
  alignItems: 'center',
  backgroundColor: 'var(--theme-main-body-background-color)',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'center',
};

export default {
  title: 'Wallets / Add Wallet',
};

export const Add = {
  args: {
    isMainnet: true,
    isTestnet: false,
    isMaxNumberOfWalletsReached: false,
  },

  render: ({ isMainnet, isTestnet, isMaxNumberOfWalletsReached }) => (
    // @ts-ignore ts-migrate(2322) FIXME: Type '{ alignItems: string; backgroundColor: strin... Remove this comment to see the full error message
    <div style={wrapperStyles}>
      <WalletAdd
        onCreate={() => {}}
        onRestore={() => {}}
        onImport={() => {}}
        onConnect={() => {}}
        isMainnet={isMainnet}
        isTestnet={isTestnet}
        isProduction
        isMaxNumberOfWalletsReached={isMaxNumberOfWalletsReached}
      />
    </div>
  ),
};
