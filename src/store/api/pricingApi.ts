import { baseSlice } from "./apiSlice";

export type PieceOption = "TWO_PIECE" | "THREE_PIECE";
export type FabricSoldBy = "PER_YARD" | "PACK_ONLY";
export type PriceRounding =
  | "NONE"
  | "NEAREST_DOLLAR"
  | "CEIL_DOLLAR"
  | "CHARM_99";
export type FabricPriceBasis = "LOW" | "MID" | "HIGH";

// Settings
export interface PricingConfig {
  fxBufferPercent: number;
  fxStaleHours: number;
  fxStaleExtraBufferPct: number;
  fxChangeGuardPercent: number;
  markupPercent: number;
  riskReservePercent: number;
  logisticsTwoPieceUsd: number;
  logisticsThreePieceUsd: number;
  paymentFeePercent: number;
  paymentFeeFixedUsd: number;
  marginFloorPercent: number;
  roundingMode: PriceRounding;
  fabricPriceBasis: FabricPriceBasis;
  quoteLockHours: number;
  fallbackYardsTwoPiece: number;
  fallbackYardsThreePiece: number;
  emergencyPriceUsd: number;
  tailorBasePosition: number;
  version: number;
  updatedAt?: string;
  updatedBy?: string;
  currentFxRate: number;
  fxSource?: string;
  fxUpdatedAt?: string;
  fxStale: boolean;
}

export type PricingConfigUpdate = Partial<
  Omit<
    PricingConfig,
    | "version"
    | "updatedAt"
    | "updatedBy"
    | "currentFxRate"
    | "fxSource"
    | "fxUpdatedAt"
    | "fxStale"
  >
> & { expectedVersion?: number };

export interface FxUpdate {
  ngnPerUsd: number;
  source?: string;
  confirmLargeChange?: boolean;
}

export interface FxHistoryEntry {
  id: number;
  ngnPerUsd: number;
  source?: string;
  createdBy?: string;
  createdAt: string;
}

// Tailor rules
export interface RuleTier {
  from: number;
  delta: number;
}

export interface PricingRule {
  ruleId: number;
  name: string;
  factor: "CUSTOMER_LONGEVITY" | "QUANTITY";
  metric: "ACCOUNT_AGE_MONTHS" | "COMPLETED_ORDERS";
  tiers: RuleTier[];
  enabled: boolean;
  priority: number;
}

export interface PricingRuleUpdate {
  name?: string;
  tiers?: RuleTier[];
  enabled?: boolean;
  priority?: number;
}

// Fabrics
export interface PricingFabric {
  fabricPriceId: number;
  fabricCode: string;
  inventoryId?: number | null;
  name: string;
  category?: string | null;
  priceCoversYards?: number | null;
  lowNgn?: number | null;
  highNgn?: number | null;
  confirmedNgn?: number | null;
  soldBy?: FabricSoldBy | null;
  packYards?: number | null;
  available: boolean;
  supplier?: string | null;
  lastVerified?: string | null;
  imageUrl?: string | null;
  notes?: string | null;
  issues: string[];
}

export interface FabricUpsert {
  fabricCode: string;
  name: string;
  category?: string;
  priceCoversYards?: number;
  lowNgn?: number;
  highNgn?: number;
  confirmedNgn?: number;
  soldBy?: FabricSoldBy;
  packYards?: number;
  available?: boolean;
  supplier?: string;
  lastVerified?: string;
  imageUrl?: string;
  notes?: string;
}

// Styles
export interface StyleBand {
  pieceOption: PieceOption;
  tailorMinNgn: number;
  tailorMaxNgn: number;
  yardsRequired?: number | null;
  logisticsUsd?: number | null;
}

export interface PricingStyle {
  profileId: number;
  productId?: number | null;
  styleCode: string;
  name: string;
  description?: string | null;
  gender?: string | null;
  category?: string | null;
  clothDesignOffered: boolean;
  clothDesignMinNgn?: number | null;
  clothDesignMaxNgn?: number | null;
  defaultFabricCode?: string | null;
  tailoringDays?: number | null;
  supplier?: string | null;
  imageUrl?: string | null;
  active: boolean;
  visible: boolean;
  startingPrice?: number | null;
  bands: StyleBand[];
  issues: string[];
}

export interface StyleUpsert {
  styleCode: string;
  name: string;
  description?: string;
  gender?: string;
  category?: string;
  clothDesignOffered?: boolean;
  clothDesignMinNgn?: number;
  clothDesignMaxNgn?: number;
  defaultFabricCode?: string;
  tailoringDays?: number;
  supplier?: string;
  imageUrl?: string;
  active?: boolean;
  bands: StyleBand[];
}

// Import
export interface ImportRow {
  row: number;
  code?: string;
  status: "OK" | "WARNING" | "ERROR";
  messages: string[];
}

export interface ImportResult {
  dryRun: boolean;
  applied: boolean;
  created: number;
  updated: number;
  errors: number;
  warnings: number;
  rows: ImportRow[];
}

export type ImportKind = "fabrics" | "styles";

// Simulator and breakdowns
export interface SimulationRequest {
  productId: number;
  pieceOption?: PieceOption;
  fabricInventoryId?: number;
  clothDesign?: boolean;
  quantity?: number;
  accountAgeMonths?: number;
  completedOrders?: number;
}

export interface PriceBreakdown {
  position?: number;
  tailorNgn?: number;
  designNgn?: number;
  fabricNgn?: number;
  fabricUnitsCharged?: number;
  fabricPerYardNgn?: number;
  costNgn?: number;
  effectiveRate?: number;
  costUsd?: number;
  logisticsUsd?: number;
  subtotalUsd?: number;
  markupUsd?: number;
  reserveUsd?: number;
  paymentFeeUsd?: number;
  marginPercent?: number;
  marginFloorApplied?: boolean;
  unitPriceUsd?: number;
  flags?: string[];
}

export interface SimulationResult {
  unitPrice: number;
  pieceOption?: PieceOption;
  fabricInventoryId?: number | null;
  clothDesign: boolean;
  breakdown: PriceBreakdown | null;
  reviewReasons: string[];
  notes: string[];
  appliedRules: string[];
  pricingVersion: number;
}

// Readiness
export interface ReadinessItem {
  styleCode: string;
  productId?: number | null;
  name: string;
  ready: boolean;
  issues: string[];
}

export interface PricingReadiness {
  fxStale: boolean;
  fxRate: number;
  fxSource?: string;
  placeholderFx: boolean;
  globalIssues: string[];
  styles: ReadinessItem[];
  fabricsWithIssues: PricingFabric[];
}

export interface OrderItemBreakdown {
  orderItemId: number;
  unitPrice: number;
  pieceOption?: PieceOption | null;
  fabricInventoryId?: number | null;
  clothDesign: boolean;
  pricingVersion?: number | null;
  priceReviewRequired: boolean;
  priceReviewReason?: string | null;
  breakdown: PriceBreakdown | null;
}

export const pricingApi = baseSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Settings (ADMIN)
    getPricingConfig: builder.query<PricingConfig, void>({
      query: () => "/pricing/admin/config",
      providesTags: ["PricingConfig"],
    }),

    updatePricingConfig: builder.mutation<PricingConfig, PricingConfigUpdate>({
      query: (body) => ({
        url: "/pricing/admin/config",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["PricingConfig", "PricingReadiness"],
    }),

    setFxRate: builder.mutation<PricingConfig, FxUpdate>({
      query: (body) => ({
        url: "/pricing/admin/fx",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PricingConfig", "PricingReadiness"],
    }),

    getFxHistory: builder.query<FxHistoryEntry[], void>({
      query: () => "/pricing/admin/fx/history",
      providesTags: ["PricingConfig"],
    }),

    // Tailor rules (ADMIN)
    getPricingRules: builder.query<PricingRule[], void>({
      query: () => "/pricing/admin/rules",
      providesTags: ["PricingRules"],
    }),

    updatePricingRule: builder.mutation<
      PricingRule,
      { ruleId: number; data: PricingRuleUpdate }
    >({
      query: ({ ruleId, data }) => ({
        url: `/pricing/admin/rules/${ruleId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["PricingRules"],
    }),

    // Fabrics
    getPricingFabrics: builder.query<PricingFabric[], void>({
      query: () => "/pricing/admin/fabrics",
      providesTags: ["PricingFabrics"],
    }),

    upsertPricingFabric: builder.mutation<PricingFabric, FabricUpsert>({
      query: (body) => ({
        url: "/pricing/admin/fabrics",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["PricingFabrics", "PricingStyles", "PricingReadiness"],
    }),

    // Styles
    getPricingStyles: builder.query<PricingStyle[], void>({
      query: () => "/pricing/admin/styles",
      providesTags: ["PricingStyles"],
    }),

    upsertPricingStyle: builder.mutation<PricingStyle, StyleUpsert>({
      query: (body) => ({
        url: "/pricing/admin/styles",
        method: "PUT",
        body,
      }),
      // Styles feed the customer catalogue, so product lists must refresh too.
      invalidatesTags: ["PricingStyles", "PricingReadiness", "Products"],
    }),

    setPricingStyleActive: builder.mutation<
      PricingStyle,
      { styleCode: string; active: boolean }
    >({
      query: ({ styleCode, active }) => ({
        url: `/pricing/admin/styles/${encodeURIComponent(styleCode)}/active`,
        method: "PATCH",
        params: { active },
      }),
      invalidatesTags: ["PricingStyles", "PricingReadiness", "Products"],
    }),

    // Spreadsheet import: always send the file as multipart field "file".
    importPricingSheet: builder.mutation<
      ImportResult,
      { kind: ImportKind; file: File; dryRun: boolean }
    >({
      query: ({ kind, file, dryRun }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `/pricing/admin/import/${kind}`,
          method: "POST",
          params: { dryRun },
          body: formData,
        };
      },
      // A dry run changes nothing, so only a real apply refreshes the caches.
      invalidatesTags: (result, error, { dryRun }) =>
        dryRun
          ? []
          : ["PricingStyles", "PricingFabrics", "PricingReadiness", "Products"],
    }),

    // Template download needs the auth header, so a plain <a href> will not work: fetch the blob
    // through the authed base query and hand it to the browser from inside queryFn.
    downloadPricingTemplate: builder.mutation<null, ImportKind>({
      queryFn: async (kind, _api, _extra, baseQuery) => {
        const result = await baseQuery({
          url: `/pricing/admin/templates/${kind}`,
          responseHandler: (response) => response.blob(),
        });
        if (result.error) {
          return { error: result.error };
        }
        const url = window.URL.createObjectURL(result.data as Blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `cuffino_${kind}_template.xlsx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return { data: null };
      },
    }),

    // Tools
    simulatePrice: builder.mutation<SimulationResult, SimulationRequest>({
      query: (body) => ({
        url: "/pricing/admin/simulate",
        method: "POST",
        body,
      }),
    }),

    getPricingReadiness: builder.query<PricingReadiness, void>({
      query: () => "/pricing/admin/readiness",
      providesTags: ["PricingReadiness"],
    }),

    // Orders
    getOrderItemBreakdown: builder.query<OrderItemBreakdown, number>({
      query: (orderItemId) => `/pricing/admin/order-items/${orderItemId}`,
      providesTags: (result, error, id) => [{ type: "PricingOrderItem", id }],
    }),

    clearPriceReview: builder.mutation<
      { orderItemId: number; productionHoldReleased: boolean },
      number
    >({
      query: (orderItemId) => ({
        url: `/pricing/admin/order-items/${orderItemId}/clear-review`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "PricingOrderItem", id },
        "Orders",
        "Production",
      ],
    }),
  }),
});

export const {
  useGetPricingConfigQuery,
  useUpdatePricingConfigMutation,
  useSetFxRateMutation,
  useGetFxHistoryQuery,
  useGetPricingRulesQuery,
  useUpdatePricingRuleMutation,
  useGetPricingFabricsQuery,
  useUpsertPricingFabricMutation,
  useGetPricingStylesQuery,
  useUpsertPricingStyleMutation,
  useSetPricingStyleActiveMutation,
  useImportPricingSheetMutation,
  useDownloadPricingTemplateMutation,
  useSimulatePriceMutation,
  useGetPricingReadinessQuery,
  useGetOrderItemBreakdownQuery,
  useClearPriceReviewMutation,
} = pricingApi;
