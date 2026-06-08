import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TicketCard from "./TicketCard.jsx";

export default function SortableTicketCard({
  ticket,
  statuses,
  isExpanded,
  onActivate,
  onCollapse,
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: ticket.id,
    data: {
      type: "ticket",
      ticketId: ticket.id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TicketCard
      ref={setNodeRef}
      ticket={ticket}
      statuses={statuses}
      isExpanded={isExpanded}
      isDragging={isDragging}
      onActivate={onActivate}
      onCollapse={onCollapse}
      style={style}
      dragHandleProps={
        isExpanded
          ? {
              attributes,
              listeners,
            }
          : undefined
      }
    />
  );
}
