import { TicketThread } from "./ticket-thread";

export default async function SupportTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TicketThread ticketId={id} isAdminView={false} />;
}
