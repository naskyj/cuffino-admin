"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  useGetAllProductionQueuesQuery,
  useGetOrderByIdQuery,
} from "@/store/api";

const toLabel = (key: string) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();

const renderImageStrip = (
  title: string,
  images?: { imageUrl?: string; description?: string; imageType?: string }[]
) => {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {images.map((image, index) => (
          <div
            key={`${title}-${index}`}
            className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50"
          >
            {image.imageUrl ? (
              <a href={image.imageUrl} target="_blank" rel="noreferrer" className="group block">
                <img
                  src={image.imageUrl}
                  alt={image.description || image.imageType || `${title} ${index + 1}`}
                  className="h-32 w-full object-cover group-hover:scale-105 transition-transform"
                />
              </a>
            ) : (
              <div className="h-32 w-full flex items-center justify-center text-xs text-gray-400">
                No image URL
              </div>
            )}
            <div className="p-3 space-y-1 text-xs text-gray-600">
              <p className="font-medium text-gray-700">{image.imageType || "Image"}</p>
              <p className="break-words">{image.description || "No description provided"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const formatCurrency = (value?: number | null) => `$${Number(value || 0).toFixed(2)}`;

const formatAddress = (shippingAddress?: Record<string, unknown>) => {
  if (!shippingAddress) {
    return [];
  }

  const streetLine = [shippingAddress.streetAddress, shippingAddress.addressLine2]
    .filter(Boolean)
    .join(", ");
  const locationLine = [
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.postalCode,
    shippingAddress.country,
  ]
    .filter(Boolean)
    .join(", ");

  return [shippingAddress.label, streetLine, locationLine].filter(Boolean).map(String);
};

const renderFabricList = (
  title: string,
  fabrics?: { inventoryId: number; materialName: string; unit?: string }[]
) => {
  if (!fabrics || fabrics.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {fabrics.map((fabric) => (
          <span
            key={`${title}-${fabric.inventoryId}`}
            className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-700"
          >
            {fabric.materialName}
            {fabric.unit ? ` (${fabric.unit})` : ""}
          </span>
        ))}
      </div>
    </div>
  );
};

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params?.id);

  const {
    data: order,
    isLoading,
    isError,
  } = useGetOrderByIdQuery(orderId, { skip: Number.isNaN(orderId) });
  const { data: productionQueues = [] } = useGetAllProductionQueuesQuery();

  const productionQueue = productionQueues.find((queue) => queue.orderId === orderId);

  if (Number.isNaN(orderId)) {
    return (
      <div className="space-y-4">
        <Link href="/orders" className="text-primary hover:underline text-sm">
          Back to orders
        </Link>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-600">
          Invalid order ID.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Link href="/orders" className="text-primary hover:underline text-sm">
          Back to orders
        </Link>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-600">
          Loading order details...
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="space-y-4">
        <Link href="/orders" className="text-primary hover:underline text-sm">
          Back to orders
        </Link>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-600">
          Order not found.
        </div>
      </div>
    );
  }

  const measurementEntries = (measurement?: Record<string, unknown> | null) => {
    if (!measurement) {
      return [];
    }

    return Object.entries(measurement).filter(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        return false;
      }

      if (key === "customFields" && typeof value === "object") {
        return Object.keys(value as Record<string, unknown>).length > 0;
      }

      return true;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link href="/orders" className="text-primary hover:underline text-sm">
            Back to orders
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">Order #{order.orderId}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete order details including measurements, customizations, and uploaded assets
          </p>
        </div>
        <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 w-fit">
          {order.status}
        </span>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Customer:</span> {order.customerUsername || order.customerId}
          </div>
          <div>
            <span className="text-gray-500">Order date:</span>{" "}
            {order.orderDate ? new Date(order.orderDate).toLocaleString() : "N/A"}
          </div>
          <div>
            <span className="text-gray-500">Currency:</span> {order.currency}
          </div>
          <div>
            <span className="text-gray-500">Production status:</span>{" "}
            {productionQueue?.status || "Not queued"}
          </div>
          <div>
            <span className="text-gray-500">Assigned designer:</span>{" "}
            {productionQueue?.assignedDesignerName || "Unassigned"}
          </div>
          <div>
            <span className="text-gray-500">Priority:</span> {productionQueue?.priority ?? "N/A"}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Financials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Subtotal:</span> {formatCurrency(order.totalPrice)}
          </div>
          <div>
            <span className="text-gray-500">Tax:</span> {formatCurrency(order.tax)}
          </div>
          <div>
            <span className="text-gray-500">Shipping fee:</span> {formatCurrency(order.shippingFee)}
          </div>
          <div>
            <span className="text-gray-500">Discount:</span> -{formatCurrency(order.discountTotal)}
          </div>
          <div className="md:col-span-2 font-semibold text-gray-900">
            Grand total: {formatCurrency(order.finalizedTotal ?? order.totalPrice)}
          </div>
        </div>
      </div>

      {order.shippingAddress && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Shipping Address</h2>
          <div className="space-y-1 text-sm text-gray-700">
            {formatAddress(order.shippingAddress as Record<string, unknown>).map((line, index) => (
              <p key={`shipping-address-${index}`}>{line}</p>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Items ({order.items?.length || 0})</h2>
        {(order.items || []).map((item) => (
          <div key={item.orderItemId} className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {item.productName || `Product #${item.productId}`}
                </h3>
                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                Item total: {formatCurrency((item.unitPrice || 0) * item.quantity)}
              </div>
            </div>

            {item.customizations && item.customizations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Selected Product Customizations</h4>
                <div className="flex flex-wrap gap-2">
                  {item.customizations.map((customization, idx) => (
                    <span
                      key={`${item.orderItemId}-customization-${idx}`}
                      className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700"
                    >
                      {customization.name || `Customization ${idx + 1}`}: {customization.value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {measurementEntries(item.measurement).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Measurements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {measurementEntries(item.measurement).map(([key, value]) => {
                    if (key === "customFields" && typeof value === "object" && value !== null) {
                      return (
                        <div key={`${item.orderItemId}-${key}`} className="md:col-span-2">
                          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Custom fields</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(value as Record<string, unknown>).map(([fieldKey, fieldValue]) => (
                              <span
                                key={`${item.orderItemId}-custom-field-${fieldKey}`}
                                className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700"
                              >
                                {toLabel(fieldKey)}: {String(fieldValue)}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={`${item.orderItemId}-${key}`}>
                        <span className="text-gray-500">{toLabel(key)}:</span> {String(value)}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {renderFabricList("Default Fabrics", item.defaultFabrics)}
            {renderFabricList("Customer Selected Fabrics", item.customerSelectedFabrics)}
            {renderImageStrip("Product Images", item.productImages)}
            {renderImageStrip("Customer Customization Images", item.customizationImages)}

            {item.customerNotes && (
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-gray-700">Customer Notes</h4>
                <p className="text-sm text-gray-700">{item.customerNotes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
