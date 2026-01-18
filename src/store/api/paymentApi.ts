import { baseSlice } from "./apiSlice";

// Payment Types
export interface PaymentDTO {
  paymentMethod: string;
  transactionId: string;
  amountPaid: number;
  paymentDate: string;
}

export interface PaymentInitiationRequestDTO {
  paymentMethod: string;
  successUrl?: string;
  cancelUrl?: string;
  returnUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentInitiationResponseDTO {
  paymentSessionId: string;
  paymentUrl?: string;
  clientSecret?: string;
  expiresAt: string;
  orderId: number;
  amount: number;
  currency: string;
}

export interface Order {
  orderId: number;
  [key: string]: any;
}

export const paymentApi = baseSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Capture Payment
    capturePayment: builder.mutation<
      Order,
      { orderId: number; data: PaymentDTO; idempotencyKey?: string }
    >({
      query: ({ orderId, data, idempotencyKey }) => ({
        url: `/payments/orders/${orderId}/capture`,
        method: "POST",
        body: data,
        headers: idempotencyKey
          ? { "Idempotency-Key": idempotencyKey }
          : undefined,
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Orders", id: orderId },
        "Payments",
      ],
    }),

    // Initiate Payment
    initiatePayment: builder.mutation<
      PaymentInitiationResponseDTO,
      { orderId: number; data: PaymentInitiationRequestDTO }
    >({
      query: ({ orderId, data }) => ({
        url: `/payments/orders/${orderId}/initiate`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Orders", id: orderId },
        "Payments",
      ],
    }),

    // Webhook (typically called by payment gateway, but included for completeness)
    processWebhook: builder.mutation<
      void,
      {
        payload: string;
        stripeSignature?: string;
        signature?: string;
        gateway?: string;
        idempotencyKey?: string;
      }
    >({
      query: ({ payload, stripeSignature, signature, gateway, idempotencyKey }) => ({
        url: "/payments/webhook",
        method: "POST",
        body: payload,
        headers: {
          ...(stripeSignature && { "Stripe-Signature": stripeSignature }),
          ...(signature && { "X-Signature": signature }),
          ...(gateway && { "X-Gateway": gateway }),
          ...(idempotencyKey && { "Idempotency-Key": idempotencyKey }),
        },
      }),
    }),
  }),
});

export const {
  useCapturePaymentMutation,
  useInitiatePaymentMutation,
  useProcessWebhookMutation,
} = paymentApi;
