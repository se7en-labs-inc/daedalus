import React from 'react';
import TermsOfUseSettingsPage from '../../../../source/renderer/app/containers/settings/categories/TermsOfUseSettingsPage';
import { screenDecorator } from '../../_support/harness/ScreenStory';

/*
 * Loaded with require rather than an import, which is how the rest of the corpus
 * reaches these files. A relative markdown import is not covered by the ambient
 * wildcard declaration: the .scss imports that look similar are served by
 * generated per-file declarations, and markdown has none.
 */
const termsOfUse = require('../../../../source/renderer/app/i18n/locales/terms-of-use/en-US.md');

export default {
  title: 'Screens / Settings / Terms of Use',
  decorators: [screenDecorator({ profile: { termsOfUse } })],
};

export const Default = {
  render: () => <TermsOfUseSettingsPage />,
};
