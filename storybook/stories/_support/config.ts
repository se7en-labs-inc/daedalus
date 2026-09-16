import { NUMBER_OPTIONS } from '../../../source/renderer/app/config/profileConfig';
import cardano from '../../../source/renderer/app/themes/daedalus/cardano';
import darkBlue from '../../../source/renderer/app/themes/daedalus/dark-blue';
import lightBlue from '../../../source/renderer/app/themes/daedalus/light-blue';
import darkCardano from '../../../source/renderer/app/themes/daedalus/dark-cardano';
import flightCandidate from '../../../source/renderer/app/themes/daedalus/flight-candidate';
import white from '../../../source/renderer/app/themes/daedalus/white';
import yellow from '../../../source/renderer/app/themes/daedalus/yellow';
import incentivizedTestnet from '../../../source/renderer/app/themes/daedalus/incentivized-testnet';
import shelleyTestnet from '../../../source/renderer/app/themes/daedalus/shelley-testnet';

export const themes = {
  Cardano: cardano,
  DarkBlue: darkBlue,
  LightBlue: lightBlue,
  DarkCardano: darkCardano,
  FlightCandidate: flightCandidate,
  Yellow: yellow,
  White: white,
  IncentivizedTestnet: incentivizedTestnet,
  ShelleyTestnet: shelleyTestnet,
};
export const themeNames: Array<any> = Object.keys(themes);
export const themesIds = {
  Cardano: 'cardano',
  DarkBlue: 'dark-blue',
  LightBlue: 'light-blue',
  DarkCardano: 'dark-cardano',
  FlightCandidate: 'flight-candidate',
  Yellow: 'yellow',
  White: 'white',
  IncentivizedTestnet: 'incentivized-testnet',
  ShelleyTestnet: 'shelley-testnet',
};
export const locales = {
  English: 'en-US',
  Japanese: 'ja-JP',
};
export const localeNames: Array<any> = Object.keys(locales);
export const operatingSystems = {
  Windows: 'windows',
  Linux: 'linux',
  Mac: 'mac',
};
export const osNames: Array<any> = Object.keys(operatingSystems);
// These differences are due to the different menu heights on each OS
export const osMinWindowHeights = {
  Windows: '641px',
  Linux: '660px',
  Mac: '700px',
};

/*
 * The number-format selections. `NUMBER_OPTIONS` labels each format with an
 * example of the number it produces, which is what the toolbar shows; the value
 * beside it is the key `NUMBER_FORMATS` is indexed by.
 */
export const numberFormats = NUMBER_OPTIONS.reduce<Record<string, string>>(
  (obj, option) => {
    obj[option.label] = option.value;
    return obj;
  },
  {}
);
export const numberFormatNames: Array<string> = Object.keys(numberFormats);
