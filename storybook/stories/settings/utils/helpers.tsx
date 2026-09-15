import {
  DATE_ENGLISH_OPTIONS,
  LANGUAGE_OPTIONS,
  NUMBER_OPTIONS,
  TIME_OPTIONS,
} from '../../../../source/renderer/app/config/profileConfig';

export interface LocaleStoryStore {
  currentDateFormat: string;
  currentNumberFormat: string;
  currentTimeFormat: string;
  currentLocale: string;
}

export const mockedLocaleState = {
  currentDateFormat: DATE_ENGLISH_OPTIONS[0].value,
  currentNumberFormat: NUMBER_OPTIONS[0].value,
  currentTimeFormat: TIME_OPTIONS[0].value,
  currentLocale: LANGUAGE_OPTIONS[0].value,
};

// One change produces one patch. The store this replaced was written to twice
// for a locale change, and two arg updates for one change repaint twice.
export const onLocaleValueChange = (
  updateArgs: (patch: Partial<LocaleStoryStore>) => void,
  id: string,
  value: string
): void => {
  const fieldIdToStoreKeyMap = {
    dateFormat: 'currentDateFormat',
    numberFormat: 'currentNumberFormat',
    timeFormat: 'currentTimeFormat',
    locale: 'currentLocale',
  };
  const patch: Partial<LocaleStoryStore> = {
    [fieldIdToStoreKeyMap[id]]: value,
  };

  if (id === 'locale') {
    patch.currentDateFormat =
      value === mockedLocaleState.currentLocale
        ? mockedLocaleState.currentDateFormat
        : 'YYYY年MM月DD日';
  }

  updateArgs(patch);
};
