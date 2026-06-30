export const coursePurchaseStatuses = [
  "payment_started",
  "pending_review",
  "approved",
  "rejected",
] as const;

export type CoursePurchaseStatus = (typeof coursePurchaseStatuses)[number];
export type CoursePurchaseTone = "neutral" | "warning" | "success" | "danger";
export type MasterClassPurchaseAction =
  | "start_purchase"
  | "upload_slip"
  | "wait_for_review"
  | "start_learning";

export type MasterClassCheckoutStage =
  | "learning"
  | "payment_upload"
  | "receipt_received"
  | "resubmission"
  | "start_purchase";

export type MasterClassPurchaseCta = {
  action: MasterClassPurchaseAction;
  disabled: boolean;
  label: string;
};

export type PurchaseStatusView = {
  description: string;
  label: string;
  tone: CoursePurchaseTone;
};

export type MasterClassPurchase = {
  amountThb: number;
  archivedAt: string | null;
  createdAt: string;
  expiresAt: string | null;
  id: string;
  referenceCode: string;
  reviewReason: string | null;
  slipFileName: string | null;
  slipStoragePath: string | null;
  status: CoursePurchaseStatus;
  submittedAt: string | null;
  updatedAt: string;
};

const purchaseStatusViewByStatus: Record<CoursePurchaseStatus, PurchaseStatusView> = {
  approved: {
    description: "Your Master Class access has been approved.",
    label: "Unlocked",
    tone: "success",
  },
  payment_started: {
    description: "Bank-transfer instructions are ready. Upload your transfer slip after payment.",
    label: "Payment Started",
    tone: "warning",
  },
  pending_review: {
    description: "Your transfer slip has been submitted and is waiting for team review.",
    label: "Pending Review",
    tone: "warning",
  },
  rejected: {
    description: "The submitted slip needs correction. Review the reason and upload a new slip.",
    label: "Rejected",
    tone: "danger",
  },
};

const lockedStatusView: PurchaseStatusView = {
  description: "Buy Master Class to unlock the course after bank-transfer approval.",
  label: "Locked",
  tone: "neutral",
};

export function isCoursePurchaseStatus(value: unknown): value is CoursePurchaseStatus {
  return typeof value === "string" && coursePurchaseStatuses.includes(value as CoursePurchaseStatus);
}

export function getPurchaseStatusView(status: CoursePurchaseStatus | null): PurchaseStatusView {
  return status ? purchaseStatusViewByStatus[status] : lockedStatusView;
}

export function getMasterClassPurchaseCta(status: CoursePurchaseStatus | null): MasterClassPurchaseCta {
  if (status === "approved") {
    return {
      action: "start_learning",
      disabled: false,
      label: "Start Learning",
    };
  }

  if (status === "pending_review") {
    return {
      action: "wait_for_review",
      disabled: true,
      label: "Waiting for approval",
    };
  }

  if (status === "payment_started" || status === "rejected") {
    return {
      action: "upload_slip",
      disabled: false,
      label: status === "rejected" ? "Upload New Slip" : "Upload Slip",
    };
  }

  return {
    action: "start_purchase",
    disabled: false,
    label: "Buy Master Class",
  };
}

export function getMasterClassCheckoutStage(status: CoursePurchaseStatus | null): MasterClassCheckoutStage {
  if (status === "approved") {
    return "learning";
  }

  if (status === "pending_review") {
    return "receipt_received";
  }

  if (status === "payment_started") {
    return "payment_upload";
  }

  if (status === "rejected") {
    return "resubmission";
  }

  return "start_purchase";
}

export function getCoursePurchaseExpiry(status: CoursePurchaseStatus, from = new Date()) {
  const daysByStatus: Partial<Record<CoursePurchaseStatus, number>> = {
    approved: 90,
    payment_started: 2,
    rejected: 14,
  };
  const days = daysByStatus[status];

  if (!days) {
    return null;
  }

  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
}

export function formatMasterClassReference(sequence: number) {
  return `EG-MC-${Math.max(0, Math.trunc(sequence)).toString().padStart(6, "0")}`;
}

export function formatThaiBaht(amount: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "THB",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount).replace("THB", "฿");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getNullableString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function parseMasterClassPurchase(row: unknown): MasterClassPurchase | null {
  if (!isRecord(row) || !isCoursePurchaseStatus(row.status)) {
    return null;
  }

  return {
    amountThb: getNumber(row.amount_thb),
    archivedAt: getNullableString(row.archived_at),
    createdAt: getString(row.created_at),
    expiresAt: getNullableString(row.expires_at),
    id: getString(row.id),
    referenceCode: getString(row.reference_code),
    reviewReason: getNullableString(row.review_reason),
    slipFileName: getNullableString(row.slip_file_name),
    slipStoragePath: getNullableString(row.slip_storage_path),
    status: row.status,
    submittedAt: getNullableString(row.submitted_at),
    updatedAt: getString(row.updated_at),
  };
}
