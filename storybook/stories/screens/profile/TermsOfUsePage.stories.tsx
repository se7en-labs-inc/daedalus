import React from 'react';
import TermsOfUsePage from '../../../../source/renderer/app/containers/profile/TermsOfUsePage';
import { screenDecorator } from '../../_support/harness/ScreenStory';
import { requestDefault } from '../../_support/harness/storeDefaults';

/*
 * The real terms text rather than a placeholder, loaded the way the rest of the
 * corpus reaches these files. ProfileStore builds the same string with a require
 * keyed on the current locale (ProfileStore.ts:304), so what the story renders is
 * the document a user actually has to scroll through, at its real length.
 */
const termsOfUse = require('../../../../source/renderer/app/i18n/locales/terms-of-use/en-US.md');

export default {
  title: 'Screens / Profile / Terms of Use',
  decorators: [screenDecorator({ profile: { termsOfUse } })],
};

export const Default = {
  render: () => <TermsOfUsePage />,
};

export const Submitting = {
  decorators: [
    screenDecorator({
      profile: {
        termsOfUse,
        setTermsOfUseAcceptanceRequest: requestDefault({ isExecuting: true }),
      },
    }),
  ],
  render: () => <TermsOfUsePage />,
  name: 'Recording the acceptance',
};
