import React from 'react';
import { action } from '@storybook/addon-actions';
import { useArgs } from '@storybook/preview-api';
import StoryDecorator from '../_support/StoryDecorator';
import Notification from '../../../source/renderer/app/components/notifications/Notification';
import InlineNotification from '../../../source/renderer/app/components/notifications/InlineNotification';
import { NOTIFICATION_DEFAULT_DURATION } from '../../../source/renderer/app/config/timingConfig';

const triggerAreaStyle = {
  lineHeight: 1.38,
  margin: '20px 0 10px',
  paddingLeft: '20px',
  fontFamily: '"NotoSans-Regular, NotoSansCJKjp-Regular", sans-serif',
};

export default {
  title: 'Common / Notifications',
  decorators: [(story) => <StoryDecorator>{story()}</StoryDecorator>],
};

export const General = {
  args: {
    isVisible: false,
    keepVisible: false,
    durationSeconds: NOTIFICATION_DEFAULT_DURATION / 1000,
    clickToClose: true,
    hasCloseButton: true,
    content: 'Notification content',
  },

  render: () => {
    const [
      {
        isVisible,
        keepVisible,
        durationSeconds,
        clickToClose,
        hasCloseButton,
        content,
      },
      updateArgs,
    ] = useArgs();
    let timeout;

    // A button is an action rather than a value, so it has no arg. It stays as
    // the control it always was, in the story rather than in a panel, and it
    // only exists when the notification is on a timer.
    const showNotification = () => {
      clearTimeout(timeout);
      updateArgs({
        isVisible: true,
      });
      timeout = setTimeout(() => {
        updateArgs({
          isVisible: false,
        });
      }, durationSeconds * 1000);
    };

    return (
      <>
        <Notification
          isVisible={isVisible || keepVisible}
          onClose={
            keepVisible
              ? action('onClose')
              : () =>
                  updateArgs({
                    isVisible: false,
                  })
          }
          clickToClose={keepVisible ? undefined : clickToClose}
          hasCloseButton={hasCloseButton}
        >
          {content}
        </Notification>
        {!keepVisible && (
          <div style={triggerAreaStyle}>
            <button type="button" onClick={showNotification}>
              Trigger notification
            </button>
          </div>
        )}
      </>
    );
  },
};

export const WithActions = {
  args: {
    isVisible: false,
    keepVisible: true,
    durationSeconds: NOTIFICATION_DEFAULT_DURATION / 1000,
    clickToClose: true,
    hasCloseButton: true,
    secondaryLabel: 'Secondary',
    primaryLabel: 'Primary',
    content: 'Notification content',
  },

  render: () => {
    const [
      {
        isVisible,
        keepVisible,
        durationSeconds,
        clickToClose,
        hasCloseButton,
        secondaryLabel,
        primaryLabel,
        content,
      },
      updateArgs,
    ] = useArgs();
    let timeout;

    const showNotification = () => {
      clearTimeout(timeout);
      updateArgs({
        isVisible: true,
      });
      timeout = setTimeout(() => {
        updateArgs({
          isVisible: false,
        });
      }, durationSeconds * 1000);
    };

    const actions = [
      {
        label: secondaryLabel,
      },
      {
        label: primaryLabel,
        primary: true,
      },
    ];
    return (
      <>
        <Notification
          isVisible={isVisible || keepVisible}
          onClose={
            keepVisible
              ? action('onClose')
              : () =>
                  updateArgs({
                    isVisible: false,
                  })
          }
          clickToClose={keepVisible ? undefined : clickToClose}
          hasCloseButton={hasCloseButton}
          actions={actions}
        >
          {content}
        </Notification>
        {!keepVisible && (
          <div style={triggerAreaStyle}>
            <button type="button" onClick={showNotification}>
              Trigger notification
            </button>
          </div>
        )}
      </>
    );
  },

  name: 'With actions',
};

export const Inline = {
  args: { content: 'Inline notification content' },

  render: ({ content }) => (
    <div
      style={{
        position: 'relative',
        padding: 40,
      }}
    >
      <InlineNotification show>{content}</InlineNotification>
    </div>
  ),
};
