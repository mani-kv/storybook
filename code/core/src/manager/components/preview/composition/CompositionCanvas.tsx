import React from 'react';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { styled } from 'storybook/theming';

import { useComposition } from './CompositionContext';

const CanvasRoot = styled.div(({ theme }) => ({
  flex: 1,
  minHeight: 200,
  padding: 24,
  background: theme.background.content,
  overflow: 'auto',
}));

const DropZone = styled.div(({ theme }) => ({
  minHeight: 120,
  borderRadius: 8,
  border: `2px dashed ${theme.appBorderColor}`,
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  alignItems: 'stretch',
}));

const NodeBlock = styled.div<{ $selected?: boolean }>(({ theme, $selected }) => ({
  padding: '12px 16px',
  borderRadius: 6,
  background: $selected ? theme.color.secondary : theme.background.app,
  color: $selected ? theme.color.lightest : theme.color.defaultText,
  border: `1px solid ${$selected ? theme.color.secondary : theme.appBorderColor}`,
  cursor: 'pointer',
  fontSize: theme.typography.size.s2,
  fontWeight: theme.typography.weight.medium,
  '&:hover': {
    borderColor: theme.color.secondary,
    background: $selected ? theme.color.secondary : theme.background.hoverable,
  },
}));

function SortableNode({
  node,
  isSelected,
  onSelect,
}: {
  node: { id: string; name: string };
  isSelected: boolean;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <NodeBlock
      ref={setNodeRef}
      style={style}
      $selected={isSelected}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      {...attributes}
      {...listeners}
    >
      {node.name}
    </NodeBlock>
  );
}

export function CompositionCanvas() {
  const { nodes, selectedNodeId, selectNode, moveNode } = useComposition();
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      const oldIndex = nodes.findIndex((n) => n.id === active.id);
      const newIndex = nodes.findIndex((n) => n.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(nodes, oldIndex, newIndex);
        moveNode(active.id as string, newIndex);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CanvasRoot onClick={() => selectNode(null)}>
        <DropZone>
          <SortableContext items={nodes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
            {nodes.map((node) => (
              <SortableNode
                key={node.id}
                node={node}
                isSelected={selectedNodeId === node.id}
                onSelect={() => selectNode(node.id)}
              />
            ))}
          </SortableContext>
          {nodes.length === 0 && (
            <div
              style={{
                color: 'var(--sb-color-text-muted)',
                fontSize: 14,
                textAlign: 'center',
                padding: 24,
              }}
            >
              Click a component in the sidebar to add it to the canvas
            </div>
          )}
        </DropZone>
      </CanvasRoot>

      <DragOverlay>
        {activeId ? (
          <NodeBlock
            $selected={false}
            style={{ cursor: 'grabbing', minWidth: 120 }}
          >
            {nodes.find((n) => n.id === activeId)?.name ?? activeId}
          </NodeBlock>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
