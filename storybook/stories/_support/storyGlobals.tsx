import React, { createContext, useContext, useMemo } from 'react';
import {
  DEFAULT_NUMBER_FORMAT,
  NUMBER_FORMATS,
} from '../../../source/common/types/number.types';
import { numberFormats, numberFormatNames } from './config';

/*
 * Two toolbar globals that components below a story need, rather than stories.
 *
 * Theme, locale and OS reach a story through its own context, and `globals.ts`
 * reads them there. These two cannot: the discreet-mode switch is applied by a
 * component `StoryProvider` renders, and the number format is applied by
 * `StoryLayout`, and neither is a story or a decorator, so neither has a story
 * context to read. Threading a prop to them would mean editing the twenty-one
 * files that render `StoryProvider` and the six wrappers that render
 * `StoryLayout`, for a value neither of those files has an opinion about.
 *
 * So `preview.tsx` publishes both on a context above every story and the two
 * components consume it. Changing either global re-renders the story, which
 * re-renders the consumer, which is what makes the switch take effect.
 */
export type StoryGlobals = {
  numberFormat: string;
  discreetMode: boolean;
};

export const DEFAULT_STORY_GLOBALS: StoryGlobals = {
  numberFormat: numberFormats[numberFormatNames[0]],
  discreetMode: false,
};

export const StoryGlobalsContext = createContext<StoryGlobals>(
  DEFAULT_STORY_GLOBALS
);

export function StoryGlobalsProvider({
  numberFormat,
  discreetMode,
  children,
}: StoryGlobals & { children: React.ReactNode }) {
  const value = useMemo(
    () => ({ numberFormat, discreetMode }),
    [numberFormat, discreetMode]
  );
  return (
    <StoryGlobalsContext.Provider value={value}>
      {children}
    </StoryGlobalsContext.Provider>
  );
}

export function useStoryGlobals(): StoryGlobals {
  return useContext(StoryGlobalsContext);
}

/*
 * `NUMBER_FORMATS` is keyed by the option's value. The knob this replaced passed
 * the whole option object where its value belongs, so the index was
 * `[object Object]` and the spread contributed nothing until a viewer picked
 * something: every story opened on the default format regardless of the control.
 */
export function numberFormatFor(numberFormat: string) {
  return {
    ...DEFAULT_NUMBER_FORMAT,
    ...(NUMBER_FORMATS[numberFormat] || {}),
  };
}
