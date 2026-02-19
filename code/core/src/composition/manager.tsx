import React from 'react';

import { addons, types } from 'storybook/manager-api';

import { CompositionInspector } from '../manager/components/preview/composition/CompositionInspector';

const ADDON_ID = 'composition-inspector';

export default addons.register(ADDON_ID, () => {
  addons.add(ADDON_ID, {
    title: 'Composition',
    type: types.PANEL,
    match: ({ viewMode }: { viewMode?: string }) => viewMode === 'composition',
    render: ({ active }) => (active ? <CompositionInspector /> : null),
  });
});
