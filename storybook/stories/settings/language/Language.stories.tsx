import React from 'react';
import { action } from '@storybook/addon-actions';
import { useArgs } from '@storybook/preview-api';
import {
  LocaleStoryStore,
  mockedLocaleState,
  onLocaleValueChange,
} from '../utils/helpers';
import StoryDecorator from '../../_support/StoryDecorator';
import InitialSettings from '../../../../source/renderer/app/components/profile/initial-settings/InitialSettings';

export default {
  title: 'Settings / Language',
  decorators: [(story) => <StoryDecorator>{story()}</StoryDecorator>],
};

export const SelectLanguageInitial = {
  args: mockedLocaleState,

  render: () => {
    const [locale, updateArgs] = useArgs<LocaleStoryStore>();
    return (
      <div>
        <InitialSettings
          onSubmit={action('submit')}
          onChangeItem={(id, value) =>
            onLocaleValueChange(updateArgs, id, value)
          }
          {...locale}
        />
      </div>
    );
  },

  name: 'Select Language - initial',
};

export const SelectLanguageSubmitting = {
  args: mockedLocaleState,

  render: () => {
    const [locale, updateArgs] = useArgs<LocaleStoryStore>();
    return (
      <div>
        <InitialSettings
          onSubmit={action('submit')}
          onChangeItem={(id, value) =>
            onLocaleValueChange(updateArgs, id, value)
          }
          isSubmitting
          {...locale}
        />
      </div>
    );
  },

  name: 'Select Language - submitting',
};
