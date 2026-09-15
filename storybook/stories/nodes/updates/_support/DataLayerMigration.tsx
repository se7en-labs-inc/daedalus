import React from 'react';
import { action } from 'storybook/actions';
import DataLayerMigrationForm from '../../../../../source/renderer/app/components/profile/data-layer-migration/DataLayerMigrationForm';

export function DataLayerMigrationStory() {
  return <DataLayerMigrationForm onSubmit={action('onSubmit')} />;
}
