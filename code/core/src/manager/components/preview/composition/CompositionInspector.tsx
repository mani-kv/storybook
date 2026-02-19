import React from 'react';

import { Button } from 'storybook/internal/components';
import { styled } from 'storybook/theming';

import { useComposition } from './CompositionContext';

const Panel = styled.div(({ theme }) => ({
  padding: 16,
  background: theme.background.content,
  borderTop: `1px solid ${theme.appBorderColor}`,
}));

const Title = styled.h3(({ theme }) => ({
  fontSize: theme.typography.size.s2,
  fontWeight: theme.typography.weight.bold,
  margin: '0 0 12px 0',
  color: theme.color.defaultText,
}));

const PropsList = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

const PropRow = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: theme.typography.size.s2,
}));

const PropKey = styled.span(({ theme }) => ({
  color: theme.textMutedColor,
  fontFamily: 'monospace',
}));

const PropValue = styled.span(({ theme }) => ({
  fontFamily: 'monospace',
  fontSize: theme.typography.size.s1,
}));

export function CompositionInspector() {
  const { nodes, selectedNodeId, removeNode } = useComposition();
  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;

  if (!selectedNode) {
    return (
      <Panel>
        <Title>Composition Inspector</Title>
        <p style={{ margin: 0, color: 'var(--sb-color-text-muted)', fontSize: 14 }}>
          Click a component in the canvas to view its props
        </p>
      </Panel>
    );
  }

  const propsEntries = Object.entries(selectedNode.props);

  return (
    <Panel>
      <Title>{selectedNode.name}</Title>
      <p style={{ margin: '0 0 12px 0', fontSize: 12, color: 'var(--sb-color-text-muted)' }}>
        {selectedNode.storyId}
      </p>
      {propsEntries.length > 0 ? (
        <PropsList>
          {propsEntries.map(([key, value]) => (
            <PropRow key={key}>
              <PropKey>{key}</PropKey>
              <PropValue>{JSON.stringify(value)}</PropValue>
            </PropRow>
          ))}
        </PropsList>
      ) : (
        <p style={{ margin: 0, fontSize: 14, color: 'var(--sb-color-text-muted)' }}>
          No props set
        </p>
      )}
      <div style={{ marginTop: 16 }}>
        <Button
          variant="outline"
          size="small"
          onClick={() => removeNode(selectedNode.id)}
        >
          Remove from canvas
        </Button>
      </div>
    </Panel>
  );
}
