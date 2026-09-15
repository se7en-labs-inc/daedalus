import React, { useEffect, useRef } from 'react';
import { action } from 'storybook/actions';
import StoryDecorator from '../../_support/StoryDecorator';
import { applyEnvironmentOs } from '../../_support/environment';
import { osNameOf } from '../../_support/globals';
import SyncingConnectingMithrilPrompt from '../../../../source/renderer/app/components/loading/syncing-connecting/SyncingConnectingMithrilPrompt';
import styles from '../../../../source/renderer/app/components/loading/syncing-connecting/SyncingConnectingMithrilPrompt.scss';
import { computeBehindByEpochs } from '../../../../source/renderer/app/utils/mithrilBehindness';
import { inCategory } from '../../_support/argTypes';

// onStart must return a Promise so the confirm-view "Start now" await resolves
// like the real store call; a rejection surfaces the inline confirm-view error.
const makePromptProps = (startFails: boolean) => ({
  onStart: async () => {
    action('onStart')();
    if (startFails) {
      throw new Error('Simulated start rejection from the startFails control');
    }
  },
  onDismiss: action('onDismiss'),
});

// startFails was one knob reached from every story through a shared factory, so
// it is one arg on the meta. behindByEpochs was not: two stories deliberately
// leave it unset, and an arg on the meta would give them a control that the
// component reads as a value it is meant not to have.
const metaArgs = { startFails: false };
const behindByEpochsArgs = { behindByEpochs: 120 };

// The OS selection reaches a story on the context, the second render argument,
// and this mirrors it onto global.environment so the prompt's platform-aware
// shortcut note ("Cmd + D" on macOS, "Ctrl + D" elsewhere) tracks the toolbar
// switch.
const applyStoryOs = (context: unknown) =>
  applyEnvironmentOs(osNameOf(context));

// Only the epoch is read by the behind-ness derivation.
const makeTip = (epoch: number) => ({
  epoch,
  slot: 0,
  absoluteSlotNumber: 0,
});

function ConfirmViewPrompt({
  behindByEpochs,
  startFails,
}: {
  behindByEpochs?: number;
  startFails: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Reach the confirm view through the real click path. Selecting by the
    // component's own .scss class stays truthful across copy edits and locale
    // switches; a missing button fails loudly instead of showing choice view.
    const actionButton = containerRef.current?.querySelector<HTMLButtonElement>(
      `button.${styles.primaryAction}`
    );
    if (!actionButton) {
      throw new Error('confirm-view story: primary action button not found');
    }
    actionButton.click();
  }, []);

  return (
    <div ref={containerRef}>
      <SyncingConnectingMithrilPrompt
        {...makePromptProps(startFails)}
        behindByEpochs={behindByEpochs}
      />
    </div>
  );
}

export default {
  title: 'Loading / Mithril / Mithril Partial Sync Dialogue',

  args: metaArgs,
  argTypes: inCategory('Loading', metaArgs),
  decorators: [(story) => <StoryDecorator>{story()}</StoryDecorator>],
};

export const KnownEpochsBehind = {
  args: behindByEpochsArgs,
  argTypes: inCategory('Loading', behindByEpochsArgs),

  render: ({ startFails, behindByEpochs }, context) => {
    applyStoryOs(context);
    return (
      <SyncingConnectingMithrilPrompt
        {...makePromptProps(startFails)}
        behindByEpochs={behindByEpochs}
      />
    );
  },
};

export const KnownEpochsBehindConfirmView = {
  args: behindByEpochsArgs,
  argTypes: inCategory('Loading', behindByEpochsArgs),

  render: ({ startFails, behindByEpochs }, context) => {
    applyStoryOs(context);
    return (
      <ConfirmViewPrompt
        behindByEpochs={behindByEpochs}
        startFails={startFails}
      />
    );
  },

  name: 'Known Epochs Behind / Confirm View',
};

const derivedArgs = {
  localTipEpoch: 412,
  mithrilSnapshotEpoch: 512,
  networkTipKnown: false,
  networkTipEpoch: 513,
};

export const SnapshotAheadOfLocalTipDerived = {
  args: derivedArgs,
  argTypes: inCategory('Loading', derivedArgs),

  render: (
    {
      startFails,
      localTipEpoch,
      mithrilSnapshotEpoch,
      networkTipKnown,
      networkTipEpoch,
    },
    context
  ) => {
    applyStoryOs(context);
    return (
      <SyncingConnectingMithrilPrompt
        {...makePromptProps(startFails)}
        behindByEpochs={computeBehindByEpochs(
          makeTip(localTipEpoch),
          networkTipKnown ? makeTip(networkTipEpoch) : null,
          mithrilSnapshotEpoch
        )}
      />
    );
  },

  name: 'Snapshot Ahead Of Local Tip (Derived)',
};

export const UnknownBehind = {
  render: ({ startFails }, context) => {
    applyStoryOs(context);
    return <SyncingConnectingMithrilPrompt {...makePromptProps(startFails)} />;
  },
};

export const UnknownBehindConfirmView = {
  render: ({ startFails }, context) => {
    applyStoryOs(context);
    return <ConfirmViewPrompt startFails={startFails} />;
  },

  name: 'Unknown Behind / Confirm View',
};
