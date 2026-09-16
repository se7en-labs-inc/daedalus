import { useLayoutEffect } from 'react';
import { observer } from 'mobx-react';
import { useDiscreetModeFeature } from '../../../source/renderer/app/features';
import { useStoryGlobals } from './storyGlobals';

/*
 * Applies the discreet-mode toolbar selection to the feature every story runs
 * inside.
 *
 * This was a knob, which meant the switch existed on every story StoryProvider
 * reaches and nowhere else. It is a Storybook global now, so it reaches the
 * whole corpus and survives a URL share, and it reads the selection from the
 * context StoryWrapper publishes rather than from a story context it does not
 * have.
 *
 * The feature owns the state and exposes a toggle rather than a setter, so this
 * compares and toggles rather than assigning.
 */
export const DiscreetModeSync = observer(() => {
  const feature = useDiscreetModeFeature();
  const { discreetMode } = useStoryGlobals();
  useLayoutEffect(() => {
    if (discreetMode !== feature.isDiscreetMode) {
      feature.toggleDiscreetMode();
    }
  }, [discreetMode, feature.isDiscreetMode]);
  return null;
});
