import React from 'react';
import StoryLayout from '../../_support/StoryLayout';
import { currentThemeOf } from '../../_support/globals';
import StoryProvider from '../../_support/StoryProvider';
import StoryDecorator from '../../_support/StoryDecorator';

export default function (story: () => React.ReactNode, context: any) {
  return (
    <StoryDecorator>
      <StoryProvider>
        <StoryLayout
          activeSidebarCategory="/hardware-wallets"
          {...context}
          currentTheme={currentThemeOf(context)}
        >
          {story()}
        </StoryLayout>
      </StoryProvider>
    </StoryDecorator>
  );
}
