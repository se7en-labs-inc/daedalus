import {
  DATE_ENGLISH_OPTIONS,
  DATE_JAPANESE_OPTIONS,
  TIME_OPTIONS,
} from '../../../source/renderer/app/config/profileConfig';

export const timeOptions = TIME_OPTIONS.reduce((obj, { label, value }) => {
  obj[label] = value;
  return obj;
}, {});
export const dateOptions = [
  ...DATE_ENGLISH_OPTIONS,
  ...DATE_JAPANESE_OPTIONS,
].reduce((obj, { label, value }) => {
  obj[label] = value;
  return obj;
}, {});
