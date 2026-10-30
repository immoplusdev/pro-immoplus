import React, { createContext, useContext, useMemo } from "react";
import { Button } from "antd";
import { HolderOutlined } from "@ant-design/icons";
import type { DraggableSyntheticListeners } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/** Glisser désactivé pour toutes les lignes (ex. pendant l'enregistrement de l'ordre). */
export const SortingDisabledContext = createContext(false);

interface RowContextValue {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: DraggableSyntheticListeners;
}

const RowContext = createContext<RowContextValue>({});

/** Poignée de glisser : seul élément qui déclenche le déplacement de la ligne. */
export const DragHandle: React.FC = () => {
  const disabled = useContext(SortingDisabledContext);
  const { setActivatorNodeRef, listeners } = useContext(RowContext);

  return (
    <Button
      type="text"
      size="small"
      icon={<HolderOutlined />}
      aria-label="Déplacer le motif"
      disabled={disabled}
      style={{ cursor: disabled ? "not-allowed" : "move" }}
      ref={setActivatorNodeRef}
      {...listeners}
    />
  );
};

interface SortableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  "data-row-key"?: string;
}

/** Ligne de `Table` triable (exemple AntD « Drag sorting with handle »). */
export const SortableRow: React.FC<SortableRowProps> = (props) => {
  const id = props["data-row-key"];

  // Ligne sans clé (placeholder « vide » de la Table) : rien à trier.
  if (!id) return <tr {...props} />;

  return <SortableRowInner {...props} id={id} />;
};

const SortableRowInner: React.FC<SortableRowProps & { id: string }> = ({ id, ...props }) => {
  const disabled = useContext(SortingDisabledContext);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: "relative", zIndex: 9999 } : {}),
  };

  const contextValue = useMemo(() => ({ setActivatorNodeRef, listeners }), [setActivatorNodeRef, listeners]);

  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
};
