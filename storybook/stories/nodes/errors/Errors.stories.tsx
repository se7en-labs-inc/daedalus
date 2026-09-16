import React from 'react';
// Assets and helpers
import StoryDecorator from '../../_support/StoryDecorator';
import {
  NoDiskSpaceErrorStory,
  noDiskSpaceErrorArgs,
} from './_support/NoDiskSpaceError';
import {
  SystemTimeErrorStory,
  systemTimeErrorArgs,
} from './_support/SystemTimeError';
import { localeOf } from '../../_support/globals';

export default {
  title: 'Nodes / Errors',
  decorators: [(story) => <StoryDecorator>{story()}</StoryDecorator>],
};

export const NoDiskSpaceError = {
  args: noDiskSpaceErrorArgs,
  render: (args) => <NoDiskSpaceErrorStory {...args} />,
};

export const SystemTimeError = {
  args: systemTimeErrorArgs,

  render: (args, context) => (
    <SystemTimeErrorStory {...args} locale={localeOf(context)} />
  ),
};
