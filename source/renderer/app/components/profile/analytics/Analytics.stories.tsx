import React from 'react';
import AnalyticsConsentForm from './AnalyticsConsentForm';
import StoryDecorator from '../../../../../../storybook/stories/_support/StoryDecorator';

export default {
  title: 'Analytics',
  decorators: [(story) => <StoryDecorator>{story()}</StoryDecorator>],
};

export const _AnalyticsConsentForm = () => <AnalyticsConsentForm />;
