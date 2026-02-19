import React, { createContext, useCallback, useContext, useState } from 'react';

export interface CompositionNode {
  id: string;
  storyId: string;
  componentId: string;
  name: string;
  props: Record<string, unknown>;
  parentId: string | null;
}

interface CompositionContextValue {
  nodes: CompositionNode[];
  selectedNodeId: string | null;
  addNode: (storyId: string, componentId: string, name: string, props?: Record<string, unknown>) => void;
  selectNode: (nodeId: string | null) => void;
  updateNodeProps: (nodeId: string, props: Record<string, unknown>) => void;
  removeNode: (nodeId: string) => void;
  moveNode: (nodeId: string, targetIndex: number) => void;
}

const CompositionContext = createContext<CompositionContextValue | null>(null);

let nodeIdCounter = 0;
function generateNodeId(): string {
  return `comp-node-${++nodeIdCounter}`;
}

export function CompositionProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<CompositionNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const addNode = useCallback(
    (storyId: string, componentId: string, name: string, props: Record<string, unknown> = {}) => {
      const id = generateNodeId();
      setNodes((prev) => [
        ...prev,
        {
          id,
          storyId,
          componentId,
          name,
          props,
          parentId: null,
        },
      ]);
    },
    []
  );

  const selectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  const updateNodeProps = useCallback((nodeId: string, props: Record<string, unknown>) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, props } : n))
    );
  }, []);

  const removeNode = useCallback((nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setSelectedNodeId((current) => (current === nodeId ? null : current));
  }, []);

  const moveNode = useCallback((nodeId: string, targetIndex: number) => {
    setNodes((prev) => {
      const idx = prev.findIndex((n) => n.id === nodeId);
      if (idx === -1 || idx === targetIndex) return prev;
      const next = [...prev];
      const [removed] = next.splice(idx, 1);
      const insertAt = targetIndex > idx ? targetIndex - 1 : targetIndex;
      next.splice(insertAt, 0, removed!);
      return next;
    });
  }, []);

  const value: CompositionContextValue = {
    nodes,
    selectedNodeId,
    addNode,
    selectNode,
    updateNodeProps,
    removeNode,
    moveNode,
  };

  return (
    <CompositionContext.Provider value={value}>
      {children}
    </CompositionContext.Provider>
  );
}

export function useComposition() {
  const ctx = useContext(CompositionContext);
  if (!ctx) {
    throw new Error('useComposition must be used within CompositionProvider');
  }
  return ctx;
}

export function useCompositionOptional() {
  return useContext(CompositionContext);
}
