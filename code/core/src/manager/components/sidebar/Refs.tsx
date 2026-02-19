import type { FC, MutableRefObject } from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { API_StoryEntry } from 'storybook/internal/types';
import { useStorybookApi, useStorybookState } from 'storybook/manager-api';
import { styled } from 'storybook/theming';

import { useCompositionOptional } from '../preview/composition/CompositionContext';
import { getStateType } from '../../utils/tree';
import { AuthBlock, EmptyBlock, ErrorBlock, LoaderBlock } from './RefBlocks';
import { RefIndicator } from './RefIndicator';
import { DEFAULT_REF_ID } from './Sidebar';
import { Tree } from './Tree';
import { CollapseIcon } from './components/CollapseIcon';
import type { Highlight, RefType } from './types';

export interface RefProps {
  isLoading: boolean;
  isBrowsing: boolean;
  hasEntries: boolean;
  selectedStoryId: string | null;
  highlightedRef: MutableRefObject<Highlight>;
  setHighlighted: (highlight: Highlight) => void;
  viewMode?: string;
}

const Wrapper = styled.div<{ isMain: boolean }>(({ isMain }) => ({
  position: 'relative',
  marginTop: isMain ? undefined : 0,
}));

const RefHead = styled.div(({ theme }) => ({
  fontWeight: theme.typography.weight.bold,
  fontSize: theme.typography.size.s2,

  // Similar to ListItem.tsx
  textDecoration: 'none',
  lineHeight: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: 'transparent',

  width: '100%',
  marginTop: 20,
  paddingTop: 16,
  paddingBottom: 12,
  borderTop: `1px solid ${theme.appBorderColor}`,

  color: theme.color.defaultText,
}));

const RefTitle = styled.div({
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
  overflow: 'hidden',
  marginLeft: 2,
});

const CollapseButton = styled.button(({ theme }) => ({
  all: 'unset',
  display: 'flex',
  padding: '0px 8px',
  gap: 6,
  alignItems: 'center',
  cursor: 'pointer',
  overflow: 'hidden',

  '&:focus': {
    borderColor: theme.color.secondary,
    'span:first-of-type': {
      borderLeftColor: theme.color.secondary,
    },
  },
}));

export const Ref: FC<RefType & RefProps> = React.memo(function Ref(props) {
  const { docsOptions } = useStorybookState();
  const api = useStorybookApi();
  const composition = useCompositionOptional();
  const {
    filteredIndex: index,
    id: refId,
    title = refId,
    isLoading: isLoadingMain,
    isBrowsing,
    hasEntries,
    selectedStoryId,
    highlightedRef,
    setHighlighted,
    loginUrl,
    type,
    expanded = true,
    indexError,
    previewInitialized,
    allStatuses,
    viewMode,
  } = props;

  const length = useMemo(() => (index ? Object.keys(index).length : 0), [index]);
  const indicatorRef = useRef(null);

  const isMain = refId === DEFAULT_REF_ID;
  const isLoadingInjected =
    (type === 'auto-inject' && !previewInitialized) || type === 'server-checked';
  const isLoading = isLoadingMain || isLoadingInjected || type === 'unknown';
  const isError = !!indexError;
  const isEmpty = !isLoading && length === 0;
  const isAuthRequired = !!loginUrl && length === 0;

  const state = getStateType(isLoading, isAuthRequired, isError, isEmpty);
  const [isExpanded, setExpanded] = useState<boolean>(expanded);

  useEffect(() => {
    if (index && selectedStoryId && index[selectedStoryId]) {
      setExpanded(true);
    }
  }, [setExpanded, index, selectedStoryId]);

  const handleClick = useCallback(() => setExpanded((value) => !value), [setExpanded]);

  const setHighlightedItemId = useCallback(
    (itemId: string) => setHighlighted({ itemId, refId }),
    [setHighlighted, refId]
  );

  const onSelectStoryId = useCallback(
    (itemId: string) => {
      if (viewMode === 'composition' && composition) {
        const entry = index?.[itemId];
        if (
          entry &&
          entry.type === 'story' &&
          'subtype' in entry &&
          entry.subtype === 'story'
        ) {
          const storyEntry = entry as API_StoryEntry;
          const componentId = storyEntry.title ?? storyEntry.parent ?? itemId;
          const props = (storyEntry.initialArgs ?? storyEntry.args ?? {}) as Record<string, unknown>;
          composition.addNode(itemId, componentId, storyEntry.name, props);
          return;
        }
      }
      api?.selectStory(itemId, undefined, { ref: isMain ? undefined : refId });
    },
    [viewMode, composition, index, api, isMain, refId]
  );

  return (
    <>
      {isMain || (
        <RefHead
          aria-label={`${isExpanded ? 'Hide' : 'Show'} ${title} stories`}
          aria-expanded={isExpanded}
        >
          <CollapseButton data-action="collapse-ref" onClick={handleClick}>
            <CollapseIcon isExpanded={isExpanded} />
            <RefTitle title={title}>{title}</RefTitle>
          </CollapseButton>
          <RefIndicator {...props} state={state} ref={indicatorRef} />
        </RefHead>
      )}
      {isExpanded && (
        <Wrapper data-title={title} isMain={isMain}>
          {/* @ts-expect-error (non strict) */}
          {state === 'auth' && <AuthBlock id={refId} loginUrl={loginUrl} />}
          {/* @ts-expect-error (non strict) */}
          {state === 'error' && <ErrorBlock error={indexError} />}
          {state === 'loading' && <LoaderBlock isMain={isMain} />}
          {state === 'empty' && <EmptyBlock isMain={isMain} hasEntries={hasEntries} />}
          {state === 'ready' && (
            <Tree
              allStatuses={allStatuses}
              isBrowsing={isBrowsing}
              isMain={isMain}
              refId={refId}
              // @ts-expect-error (non strict)
              data={index}
              // @ts-expect-error (non strict)
              docsMode={docsOptions.docsMode}
              selectedStoryId={selectedStoryId}
              onSelectStoryId={onSelectStoryId}
              highlightedRef={highlightedRef}
              setHighlightedItemId={setHighlightedItemId}
            />
          )}
        </Wrapper>
      )}
    </>
  );
});
