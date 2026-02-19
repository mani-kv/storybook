import React from 'react';

import { Button } from 'storybook/internal/components';
import { Addon_TypesEnum } from 'storybook/internal/types';

import { LayoutGridIcon } from '@storybook/icons';

import { Consumer, useStorybookApi } from 'storybook/manager-api';

export const compositionTool = {
  title: 'Composition',
  id: 'composition',
  type: Addon_TypesEnum.TOOL,
  match: ({ viewMode }: { viewMode?: string }) =>
    viewMode === 'story' || viewMode === 'docs',
  render: () => {
    const api = useStorybookApi();
    return (
      <Consumer filter={({ state }: { state: { storyId?: string; refId?: string } }) => state}>
        {({ storyId, refId }) => (
          <Button
            key="composition"
            padding="small"
            variant="ghost"
            onClick={() => {
              const path = storyId
                ? refId
                  ? `/composition/${refId}_${storyId}`
                  : `/composition/${storyId}`
                : '/composition/';
              api.navigate(path);
            }}
            ariaLabel="Switch to composition mode"
          >
            <LayoutGridIcon />
          </Button>
        )}
      </Consumer>
    );
  },
};

export const storyModeTool = {
  title: 'Story',
  id: 'story-mode',
  type: Addon_TypesEnum.TOOL,
  match: ({ viewMode }: { viewMode?: string }) => viewMode === 'composition',
  render: () => {
    const api = useStorybookApi();
    return (
      <Consumer filter={({ state }: { state: { storyId?: string; refId?: string } }) => state}>
        {({ storyId, refId }) => (
          <Button
            key="story-mode"
            padding="small"
            variant="ghost"
            onClick={() => {
              const path = storyId
                ? refId
                  ? `/story/${refId}_${storyId}`
                  : `/story/${storyId}`
                : '/story/';
              api.navigate(path);
            }}
            ariaLabel="Switch back to story mode"
          >
            Story
          </Button>
        )}
      </Consumer>
    );
  },
};
