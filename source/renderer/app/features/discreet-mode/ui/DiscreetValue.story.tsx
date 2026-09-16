import React, { useLayoutEffect } from 'react';
import { observer } from 'mobx-react';
import StoryDecorator from '../../../../../../storybook/stories/_support/StoryDecorator';
import StoryProvider from '../../../../../../storybook/stories/_support/StoryProvider';
import {
  DiscreetModeFeatureProvider,
  useDiscreetModeFeature,
} from '../context';
import DiscreetValue from './DiscreetValue';

const Toggle = observer(({ enabled }: { enabled: boolean }) => {
  const feature = useDiscreetModeFeature();
  useLayoutEffect(() => {
    if (enabled !== feature.isDiscreetMode) {
      feature.toggleDiscreetMode();
    }
  }, [enabled, feature.isDiscreetMode]);
  return null;
});

export default {
  title: 'Discreet Mode / Discreet Asset Amount',

  decorators: [
    (story) => (
      <StoryDecorator>
        <StoryProvider>
          <DiscreetModeFeatureProvider>{story()}</DiscreetModeFeatureProvider>
        </StoryProvider>
      </StoryDecorator>
    ),
  ],
};

export const DiscreetModeDisabled = {
  args: { toggleDiscreetMode: false },

  render: ({ toggleDiscreetMode }) => (
    <>
      {/* @ts-ignore ts-migrate(2741) FIXME: Property 'replacer' is missing in type '{ children... Remove this comment to see the full error message */}
      <DiscreetValue>123</DiscreetValue>
      <Toggle enabled={toggleDiscreetMode} />
    </>
  ),

  name: 'Discreet mode disabled',
};

export const DiscreetModeEnabled = {
  args: { toggleDiscreetMode: true },

  render: ({ toggleDiscreetMode }) => (
    <>
      {/* @ts-ignore ts-migrate(2741) FIXME: Property 'replacer' is missing in type '{ children... Remove this comment to see the full error message */}
      <DiscreetValue>123</DiscreetValue>
      <Toggle enabled={toggleDiscreetMode} />
    </>
  ),

  name: 'Discreet mode enabled',
};
