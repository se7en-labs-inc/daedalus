import React from 'react';
import StoryLayout from '../../_support/StoryLayout';
import StoryProvider from '../../_support/StoryProvider';
import StoryDecorator from '../../_support/StoryDecorator';
import WalletWithNavigationLayout from './WalletWithNavigationLayout';
import { currentThemeOf } from '../../_support/globals';

/*
 * The transfer-funds offer in the top bar is the one control this wrapper's
 * stories can show that is a domain precondition rather than a display setting,
 * so it stays an arg. Metas under this wrapper declare it by spreading
 * `walletsLayoutArgs`; a meta that does not gets StoryLayout's default.
 */
export const walletsLayoutArgs = { hasRewardsWallets: true };

export default function (story: () => React.ReactNode, context: any) {
  return (
    <StoryDecorator>
      <StoryProvider>
        <StoryLayout
          activeSidebarCategory="/wallets"
          {...context}
          currentTheme={currentThemeOf(context)}
          hasRewardsWallets={context.args?.hasRewardsWallets ?? true}
        >
          {context.story !== 'Empty' && context.story !== 'Wallet Add' ? (
            <WalletWithNavigationLayout context={context}>
              {story()}
            </WalletWithNavigationLayout>
          ) : (
            story()
          )}
        </StoryLayout>
      </StoryProvider>
    </StoryDecorator>
  );
}
