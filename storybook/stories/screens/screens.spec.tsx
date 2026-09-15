import React from 'react';
import { render } from '@testing-library/react';
import { composeStories } from '@storybook/react';
import { IntlProvider } from 'react-intl';
import enMessages from '../../../source/renderer/app/i18n/locales/en-US.json';

import * as displaySettings from './settings/DisplaySettingsPage.stories';
import * as generalSettings from './settings/GeneralSettingsPage.stories';
import * as termsOfUse from './settings/TermsOfUseSettingsPage.stories';
import * as support from './settings/SupportSettingsPage.stories';
import * as security from './settings/SecuritySettingsPage.stories';
import * as about from './static/AboutDialog.stories';
import * as splashNetwork from './splash/SplashNetworkPage.stories';
import * as assetSettings from './assets/AssetSettingsDialogContainer.stories';
import * as initialSettings from './profile/InitialSettingsPage.stories';
import * as termsOfUsePage from './profile/TermsOfUsePage.stories';
import * as analyticsConsent from './profile/AnalyticsConsentPage.stories';
import * as walletsSettings from './settings/WalletsSettingsPage.stories';
import * as noDiskSpace from './loading/NoDiskSpaceErrorPage.stories';
import * as systemTime from './loading/SystemTimeErrorPage.stories';
import * as toggleRTSFlags from './knownIssues/ToggleRTSFlagsDialogContainer.stories';
import * as rtsRecommendation from './knownIssues/RTSFlagsRecommendationOverlayContainer.stories';

/*
 * Every screen story, mounted.
 *
 * A story that builds and indexes is not a story that renders: phase 3 found
 * thirteen in this corpus that did the first two and not the third, and nothing
 * in the build could tell them apart. `composeStories` runs the real story with
 * its real decorators, so what is asserted here is the same thing the workbench
 * shows rather than a reconstruction of it.
 *
 * The bar is deliberately low and honest: the screen mounts without throwing and
 * puts something on the page. That it puts the *right* thing on the page is not
 * checked, and no automated check in this repository does.
 *
 * Asserted against `baseElement` rather than `container`, because several of
 * these screens are modals and render through a portal attached to the document
 * rather than into the tree the renderer returns. Asserting on `container` would
 * have called the about dialog empty while it was on screen.
 *
 * The locale frame is supplied here rather than by the story. In the workbench it
 * comes from preview.tsx, which `composeStories` does not apply: it runs a
 * story's own decorators, and the project's annotations are a separate
 * registration. Supplying it in the story instead would nest a second
 * IntlProvider inside the workbench's and take the locale toolbar away from every
 * screen, so the seam stays here and this is what it costs.
 */
const modules = {
  DisplaySettingsPage: displaySettings,
  GeneralSettingsPage: generalSettings,
  TermsOfUseSettingsPage: termsOfUse,
  SupportSettingsPage: support,
  SecuritySettingsPage: security,
  AboutDialog: about,
  SplashNetworkPage: splashNetwork,
  AssetSettingsDialogContainer: assetSettings,
  InitialSettingsPage: initialSettings,
  TermsOfUsePage: termsOfUsePage,
  AnalyticsConsentPage: analyticsConsent,
  WalletsSettingsPage: walletsSettings,
  NoDiskSpaceErrorPage: noDiskSpace,
  SystemTimeErrorPage: systemTime,
  ToggleRTSFlagsDialogContainer: toggleRTSFlags,
  RTSFlagsRecommendationOverlayContainer: rtsRecommendation,
};

/*
 * Three containers return null by design, and each of those states is worth a
 * story: the dialog that is shut is what most routes see, the splash screen does
 * not exist outside a Flight build, and the RTS recommendation is gone for good
 * once it has been dismissed. They are listed rather than branched on inside an
 * assertion, so each case has its own expectation.
 */
const RENDERS_NOTHING = new Set([
  'AssetSettingsDialogContainer:Closed',
  'SplashNetworkPage:NotAFlightBuild',
  'RTSFlagsRecommendationOverlayContainer:Acknowledged',
]);

// reduce rather than flatMap: tsconfig declares target es2019 but lib ["dom"],
// so the ES2019 array methods are not in the effective library surface.
const allStories = Object.entries(modules).reduce<
  Array<{ id: string; Story: React.ComponentType }>
>(
  (acc, [screen, mod]) =>
    acc.concat(
      Object.entries(composeStories(mod)).map(([storyName, Story]) => ({
        id: `${screen}:${storyName}`,
        Story,
      }))
    ),
  []
);

const renderStory = (Story) =>
  render(
    <IntlProvider locale="en-US" messages={enMessages}>
      <Story />
    </IntlProvider>
  );

const showsSomething = allStories.filter((s) => !RENDERS_NOTHING.has(s.id));
const showsNothing = allStories.filter((s) => RENDERS_NOTHING.has(s.id));

describe('screen stories', () => {
  it('composes every screen story', () => {
    expect(allStories).toHaveLength(27);
    expect(showsNothing).toHaveLength(RENDERS_NOTHING.size);
  });

  it.each(showsSomething.map((s) => [s.id, s.Story]))(
    '%s mounts and puts content on the page',
    (_id, Story) => {
      const { baseElement } = renderStory(Story);
      expect(baseElement.textContent.length).toBeGreaterThan(0);
    }
  );

  it.each(showsNothing.map((s) => [s.id, s.Story]))(
    '%s mounts and renders nothing, which is the state it documents',
    (_id, Story) => {
      const { container } = renderStory(Story);
      expect(container.firstChild).toBeNull();
    }
  );
});
