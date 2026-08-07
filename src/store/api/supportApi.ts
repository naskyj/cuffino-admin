import { baseSlice } from "./apiSlice";

// Must match the backend support/model enums exactly.
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketTier = "TIER_1" | "TIER_2" | "TIER_3";
export type TicketCategory =
  | "ORDER_STATUS"
  | "PRODUCT_FABRIC_QUESTION"
  | "ACCOUNT_LOGIN"
  | "FIT_QUALITY_CONCERN"
  | "PRODUCTION_DELAY"
  | "TAILOR_ISSUE"
  | "PAYMENT_REFUND"
  | "DISPUTE_CHARGEBACK"
  | "DATA_PRIVACY_LEGAL"
  | "OTHER";

export interface Ticket {
  ticketId: number;
  customerId: number;
  customerUsername: string;
  subject: string;
  issueDescription: string;
  status: TicketStatus;
  tier: TicketTier;
  category: TicketCategory;
  orderId?: number;
  assignedAgentId?: number;
  assignedAgentName?: string;
  slaDueAt?: string;
  slaBreached: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export const supportApi = baseSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllTickets: builder.query<Ticket[], void>({
      query: () => "/support/tickets/all",
      providesTags: ["Tickets"],
    }),

    getMyTickets: builder.query<Ticket[], number>({
      query: (customerId) => `/support/tickets/mine?customerId=${customerId}`,
      providesTags: ["Tickets"],
    }),

    createTicket: builder.mutation<
      Ticket,
      { subject: string; issueDescription: string; category: TicketCategory; orderId?: number }
    >({
      query: (data) => ({
        url: "/support/tickets",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Tickets"],
    }),

    updateTicket: builder.mutation<
      Ticket,
      { ticketId: number; status?: TicketStatus; tier?: TicketTier; assignedAgentId?: number }
    >({
      query: ({ ticketId, ...body }) => ({
        url: `/support/tickets/${ticketId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Tickets"],
    }),
  }),
});

export const {
  useGetAllTicketsQuery,
  useGetMyTicketsQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
} = supportApi;
