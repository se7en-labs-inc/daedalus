import React from 'react';
// Assets and helpers
import StoryDecorator from '../../_support/StoryDecorator';
// Stories
import { DataLayerMigrationStory } from './_support/DataLayerMigration';

export default {
  title: 'Nodes / Updates',

  decorators: [(story) => <StoryDecorator>{story()}</StoryDecorator>],
};

export const DataLayerMigration = DataLayerMigrationStory;
