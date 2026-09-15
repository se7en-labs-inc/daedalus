import React from 'react';
import { action } from '@storybook/addon-actions';
import { DiscreetModeToggleComponent } from './DiscreetModeToggle';

export default {
  title: 'Discreet Mode / Discreet Mode Toggle',
};

export const Main = () => (
  <div
    style={{
      padding: 20,
    }}
  >
    <div
      style={{
        marginBottom: 20,
      }}
    >
      <DiscreetModeToggleComponent
        onToggle={action('onChange')}
        isDiscreetMode
      />
    </div>
    <div>
      <DiscreetModeToggleComponent
        onToggle={action('onChange')}
        isDiscreetMode={false}
      />
    </div>
  </div>
);
