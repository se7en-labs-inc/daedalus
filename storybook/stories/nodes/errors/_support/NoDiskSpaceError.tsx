import React from 'react';
import NoDiskSpaceError from '../../../../../source/renderer/app/components/loading/no-disk-space-error/NoDiskSpaceError';

// One control fed all three figures. The three knobs this replaced shared the
// label `diskSpaceRequired (GB)`, and addon-knobs returns the value already
// registered under a name, so the defaults written beside the second and third
// were never reached and all three read the first.
export const noDiskSpaceErrorArgs = {
  diskSpaceRequiredGb: 4,
};

export function NoDiskSpaceErrorStory({ diskSpaceRequiredGb }) {
  const gb = `${diskSpaceRequiredGb} GB`;
  return (
    <NoDiskSpaceError
      diskSpaceRequired={gb}
      diskSpaceMissing={gb}
      diskSpaceRecommended={gb}
    />
  );
}
