import React, { Component, Fragment } from 'react';
import { IntlProvider, addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import ja from 'react-intl/locale-data/ja';
import {
  themes,
  locales,
  osMinWindowHeights,
  themeNames,
  localeNames,
  osNames,
} from './config';
import { DEFAULT_STORY_GLOBALS, StoryGlobalsProvider } from './storyGlobals';
import translations from '../../../source/renderer/app/i18n/translations';
import ThemeManager from '../../../source/renderer/app/ThemeManager';
import WindowSizeManager from '../../../source/renderer/app/WindowSizeManager';
// // https://github.com/yahoo/react-intl/wiki#loading-locale-data
addLocaleData([...en, ...ja]);

type Props = {
  children: any;
  themeName?: string;
  localeName?: string;
  osName?: string;
  numberFormat?: string;
  discreetMode?: boolean;
};

/*
 * The theme, locale and OS selections are Storybook globals, declared in
 * preview.tsx and chosen from the toolbar Storybook renders itself. This
 * component reads them and builds the frame each story renders inside:
 * ThemeManager for the theme variables, WindowSizeManager for the minimum
 * window height, and IntlProvider for the locale. A story that needs one of the
 * three by value reads it from its own story context through
 * _support/globals.ts, rather than being handed it here.
 *
 * The number format and the discreet-mode switch are published on a context
 * instead, because the components that apply them are neither stories nor
 * decorators and so have no story context of their own. See
 * _support/storyGlobals.tsx.
 */
export default class StoryWrapper extends Component<Props> {
  static defaultProps = {
    themeName: themeNames[0],
    localeName: localeNames[0],
    osName: osNames[0],
    numberFormat: DEFAULT_STORY_GLOBALS.numberFormat,
    discreetMode: DEFAULT_STORY_GLOBALS.discreetMode,
  };

  render() {
    const {
      children: Story,
      themeName,
      localeName,
      osName,
      numberFormat,
      discreetMode,
    } = this.props;
    const theme = themes[themeName];
    const locale = locales[localeName];
    const minScreenHeight = osMinWindowHeights[osName];
    return (
      <Fragment>
        {/* @ts-ignore ts-migrate(2769) FIXME: No overload matches this call. */}
        <ThemeManager variables={theme} />
        {/* @ts-ignore ts-migrate(2769) FIXME: No overload matches this call. */}
        <WindowSizeManager minScreenHeight={minScreenHeight} />
        <IntlProvider
          {...{
            locale,
            key: locale,
            messages: translations[locale],
          }}
        >
          <StoryGlobalsProvider
            numberFormat={numberFormat}
            discreetMode={discreetMode}
          >
            <Story />
          </StoryGlobalsProvider>
        </IntlProvider>
      </Fragment>
    );
  }
}
