import React from 'react';
import MithrilErrorView from '../../../../source/renderer/app/components/loading/mithril/MithrilErrorView';
import StoryDecorator from '../../_support/StoryDecorator';
import LoadingOverlayStoryFrame from '../_support/LoadingOverlayStoryFrame';
import { inCategory, optionsFrom } from '../../_support/argTypes';
import {
  bootstrapActions,
  errorStageOptions,
  getErrorPreset,
} from '../_support/mithrilFixtures';

export default {
  title: 'Loading / Mithril / Error',

  decorators: [
    (story) => (
      <StoryDecorator>
        <LoadingOverlayStoryFrame>{story()}</LoadingOverlayStoryFrame>
      </StoryDecorator>
    ),
  ],
};

// The three text controls took their defaults from the selected stage's preset.
// A knob keeps the value it was first registered with, so they stayed on the
// download preset's text however the stage moved. Left unset they follow the
// stage, which is what the code around them was written to do.
const interactiveArgs = {
  stage: 'download',
  code: undefined,
  message: undefined,
  logPath: undefined,
};

export const InteractiveErrorStage = {
  args: interactiveArgs,

  argTypes: inCategory('Loading', interactiveArgs, {
    stage: optionsFrom(errorStageOptions),
    code: { control: 'text' },
    message: { control: 'text' },
    logPath: { control: 'text' },
  }),

  render: ({ stage, code, message, logPath }) => {
    const preset = getErrorPreset(stage);
    return (
      <MithrilErrorView
        error={{
          ...preset,
          code: code ?? preset.code ?? '',
          message: message ?? preset.message,
          logPath: logPath ?? preset.logPath ?? '',
        }}
        onOpenExternalLink={(value) =>
          bootstrapActions.onOpenExternalLink(value)
        }
        onWipeRetry={() => bootstrapActions.onWipeRetry()}
        onDecline={() => bootstrapActions.onDecline()}
      />
    );
  },
};

export const GenericFailure = () => (
  <MithrilErrorView
    error={{
      code: 'MITHRIL_UNKNOWN_FAILURE',
      message:
        'The bootstrap process failed before a stage-specific error could be derived.',
    }}
    onOpenExternalLink={(value) => bootstrapActions.onOpenExternalLink(value)}
    onWipeRetry={() => bootstrapActions.onWipeRetry()}
    onDecline={() => bootstrapActions.onDecline()}
  />
);
