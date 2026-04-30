/** Error object returned by OxaPay inside the API envelope. */
export interface OxaPayErrorBody {
  /** High-level error category. */
  type?: string;
  /** Error key/code from OxaPay. */
  key?: string;
  /** Human-readable error message. */
  message?: string;
}

/** Standard OxaPay response wrapper used across endpoints. */
export interface OxaPayApiEnvelope<T> {
  /** Endpoint-specific data payload. */
  data: T;
  /** Additional status message from the API. */
  message?: string;
  /** Error details when request is not successful. */
  error?: OxaPayErrorBody | null;
  /** API status code included in response body. */
  status?: number;
  /** OxaPay API version string. */
  version?: string;
}

/**
 * Currency symbols currently returned by `/payment/accepted-currencies`.
 * Useful for IDE autocomplete when setting payment-related currency fields.
 */
export type OxaPayAcceptedCurrency =
  | "BTC"
  | "ETH"
  | "USDT"
  | "USDC"
  | "BNB"
  | "DOGE"
  | "POL"
  | "LTC"
  | "SOL"
  | "TRX"
  | "SHIB"
  | "TON"
  | "XMR"
  | "DAI"
  | "BCH"
  | "NOT"
  | "DOGS"
  | "XRP";

/**
 * Currency code with IDE autocomplete for known symbols while still allowing custom strings.
 * The `(string & {})` trick preserves literal suggestions in editors.
 */
export type OxaPayCurrencyCode = OxaPayAcceptedCurrency | (string & {});

/** Request body for creating a hosted merchant invoice. */
export interface OxaPayGenerateInvoiceRequest {
  /** Invoice amount. */
  amount: number;
  /** Fiat/crypto currency code used for invoice amount. */
  currency?: OxaPayCurrencyCode;
  /** Invoice lifetime in minutes. */
  lifetime?: number;
  /** Whether payer pays network fees. */
  fee_paid_by_payer?: number;
  /** Underpaid coverage percentage. */
  under_paid_coverage?: number;
  /** Optional auto-conversion target currency. */
  to_currency?: OxaPayCurrencyCode;
  /** Whether to auto-withdraw received funds. */
  auto_withdrawal?: boolean;
  /** Allow paying from mixed assets. */
  mixed_payment?: boolean;
  /** Webhook endpoint for payment updates. */
  callback_url?: string;
  /** URL to redirect payer after checkout. */
  return_url?: string;
  /** Payer email for reports. */
  email?: string;
  /** Your internal order id. */
  order_id?: string;
  /** Message shown after successful payment. */
  thanks_message?: string;
  /** Extra order/payment description. */
  description?: string;
  /** Whether to run request in sandbox mode. */
  sandbox?: boolean;
}

/** Response data for generated invoice endpoint. */
export interface OxaPayGenerateInvoiceResponseData {
  /** Unique payment tracking id in OxaPay. */
  track_id: string;
  /** Hosted invoice URL for the payer. */
  payment_url: string;
  /** Expiration timestamp (unix). */
  expired_at?: number;
  /** Creation timestamp (unix). */
  date?: number;
}

/** Request body for white-label payment session creation. */
export interface OxaPayGenerateWhiteLabelRequest {
  /** Currency payer will send. */
  pay_currency: OxaPayCurrencyCode;
  /** Requested amount value. */
  amount: number;
  /** Amount currency code. */
  currency?: OxaPayCurrencyCode;
  /** Specific chain/network if required. */
  network?: string;
  lifetime?: number;
  fee_paid_by_payer?: number;
  under_paid_coverage?: number;
  to_currency?: OxaPayCurrencyCode;
  auto_withdrawal?: boolean;
  callback_url?: string;
  email?: string;
  order_id?: string;
  description?: string;
}

/** Response data for white-label session creation. */
export interface OxaPayGenerateWhiteLabelResponseData {
  track_id: string;
  amount?: number;
  currency?: OxaPayCurrencyCode;
  pay_amount?: number;
  pay_currency?: OxaPayCurrencyCode;
  network?: string;
  address?: string;
  callback_url?: string;
  description?: string;
  email?: string;
  fee_paid_by_payer?: number;
  lifetime?: number;
  order_id?: string;
  under_paid_coverage?: number;
  rate?: number;
  qr_code?: string;
  expired_at?: number;
  date?: number;
}

/** Request body for creating a static payment address. */
export interface OxaPayGenerateStaticAddressRequest {
  /** Target network to create static address on. */
  network: string;
  /** Optional auto-conversion target currency. */
  to_currency?: OxaPayCurrencyCode;
  /** 1 = withdraw to settings address, 0 = keep in balance. */
  auto_withdrawal?: number;
  /** Webhook endpoint for received payments. */
  callback_url?: string;
  email?: string;
  order_id?: string;
  description?: string;
}

/** Response data for static address generation. */
export interface OxaPayGenerateStaticAddressResponseData {
  track_id: string;
  network?: string;
  address?: string;
  memo?: string;
  qr_code?: string;
  date?: number;
}

/** Request body for revoking an existing static address. */
export interface OxaPayRevokeStaticAddressRequest {
  /** Static wallet address to revoke. */
  address: string;
}

/** Response payload for accepted currencies endpoint. */
export interface OxaPayAcceptedCurrenciesResponseData {
  /** List of currencies enabled on your merchant service. */
  list: OxaPayAcceptedCurrency[];
}

/** Static address row from static address list endpoint. */
export interface OxaPayStaticAddressListItem {
  track_id?: string;
  network?: string;
  address?: string;
  memo?: string;
  email?: string;
  order_id?: string;
  description?: string;
  date?: number;
  [key: string]: unknown;
}

/** Query filters for static address list endpoint. */
export interface OxaPayStaticAddressListQuery {
  page?: number;
  size?: number;
  track_id?: string;
  address?: string;
  network?: string;
  email?: string;
  order_id?: string;
  [key: string]: string | number | boolean | undefined;
}

/** Paginated static address list response data. */
export interface OxaPayStaticAddressListResponseData {
  list: OxaPayStaticAddressListItem[];
  page?: number;
  size?: number;
  total?: number;
  [key: string]: unknown;
}

/** Payment information object returned for a specific track id. */
export interface OxaPayPaymentInfoResponseData {
  track_id?: string;
  /** Payment status, e.g. waiting/paid/expired. */
  status?: string;
  amount?: number;
  pay_amount?: number;
  currency?: string;
  pay_currency?: string;
  network?: string;
  tx_hash?: string;
  address?: string;
  email?: string;
  order_id?: string;
  description?: string;
  date?: number;
  [key: string]: unknown;
}

/** Query filters for merchant payment history. */
export interface OxaPayPaymentHistoryQuery {
  page?: number;
  size?: number;
  from_date?: number;
  to_date?: number;
  status?: string;
  type?: string;
  currency?: string;
  network?: string;
  amount_min?: number;
  amount_max?: number;
  [key: string]: string | number | boolean | undefined;
}

/** Single payment history list item. */
export interface OxaPayPaymentHistoryItem extends OxaPayPaymentInfoResponseData {}

/** Paginated merchant payment history response. */
export interface OxaPayPaymentHistoryResponseData {
  list: OxaPayPaymentHistoryItem[];
  page?: number;
  size?: number;
  total?: number;
  [key: string]: unknown;
}

/** Request body for generating a payout transfer. */
export interface OxaPayGeneratePayoutRequest {
  /** Recipient wallet address. */
  address: string;
  /** Currency symbol to send. */
  currency: string;
  /** Amount to transfer. */
  amount: number;
  /** Specific blockchain network if currency has multiple networks. */
  network?: string;
  /** Webhook endpoint for payout status updates. */
  callback_url?: string;
  /** Memo/tag when required by network. */
  memo?: string;
  /** Optional description for reconciliation/reporting. */
  description?: string;
}

/** Response data for payout generation endpoint. */
export interface OxaPayGeneratePayoutResponseData {
  track_id: string;
  status?: string;
}

/** Payout information object for a given payout track id. */
export interface OxaPayPayoutInfoResponseData {
  track_id?: string;
  address?: string;
  currency?: string;
  network?: string;
  amount?: number;
  fee?: number;
  status?: string;
  tx_hash?: string;
  description?: string;
  internal?: boolean;
  memo?: string;
  date?: number;
  [key: string]: unknown;
}

/** Query filters for payout history endpoint. */
export interface OxaPayPayoutHistoryQuery {
  page?: number;
  size?: number;
  from_date?: number;
  to_date?: number;
  status?: string;
  currency?: string;
  network?: string;
  type?: "internal" | "external" | string;
  amount_min?: number;
  amount_max?: number;
  [key: string]: string | number | boolean | undefined;
}

/** Single payout history list item. */
export interface OxaPayPayoutHistoryItem extends OxaPayPayoutInfoResponseData {}

/** Paginated payout history response. */
export interface OxaPayPayoutHistoryResponseData {
  list: OxaPayPayoutHistoryItem[];
  page?: number;
  size?: number;
  total?: number;
  [key: string]: unknown;
}

/** Request body for initiating an account asset swap. */
export interface OxaPaySwapRequest {
  /** Asset symbol to swap from. */
  from_currency: string;
  /** Asset symbol to swap to. */
  to_currency: string;
  /** Amount to swap. */
  amount: number;
}

/** Response data returned by swap request endpoint. */
export interface OxaPaySwapRequestResponseData {
  track_id: string;
  from_currency?: string;
  to_currency?: string;
  from_amount?: number;
  to_amount?: number;
  rate?: number;
  date?: number;
}

/** Request body for retrieving real-time swap rate. */
export interface OxaPaySwapRateRequest {
  from_currency: string;
  to_currency: string;
}

/** Response data for swap rate endpoint. */
export interface OxaPaySwapRateResponseData {
  /** Current exchange rate from source to target asset. */
  rate: number;
}

/** Request body for calculating swap output for an amount. */
export interface OxaPaySwapCalculateRequest extends OxaPaySwapRateRequest {
  amount: number;
}

/** Response data for swap calculate endpoint. */
export interface OxaPaySwapCalculateResponseData {
  to_amount?: number;
  rate?: number;
  amount?: number;
}

/** Supported swap pair row with minimum input amount. */
export interface OxaPaySwapPairItem {
  from_currency: string;
  to_currency: string;
  min_amount: number;
}

/** Response data for swap pairs endpoint. */
export interface OxaPaySwapPairsResponseData {
  list: OxaPaySwapPairItem[];
}

/** Query filters for swap history endpoint. */
export interface OxaPaySwapHistoryQuery {
  page?: number;
  size?: number;
  from_date?: number;
  to_date?: number;
  from_currency?: string;
  to_currency?: string;
  type?: "auto_convert" | "manual_swap" | "swap_by_api" | string;
  [key: string]: string | number | boolean | undefined;
}

/** Single swap history row. */
export interface OxaPaySwapHistoryItem extends OxaPaySwapRequestResponseData {
  type?: string;
  [key: string]: unknown;
}

/** Paginated swap history response data. */
export interface OxaPaySwapHistoryResponseData {
  list: OxaPaySwapHistoryItem[];
  page?: number;
  size?: number;
  total?: number;
  [key: string]: unknown;
}

/** Dynamic mapping of currency symbol to latest price. */
export interface OxaPayCommonPricesResponseData {
  [currency: string]: number;
}

/** Fiat currency metadata from common fiats endpoint. */
export interface OxaPayCommonFiatInfo {
  symbol?: string;
  name?: string;
  price?: number;
  display_precision?: number;
  [key: string]: unknown;
}

/** Dynamic mapping of fiat code to fiat metadata. */
export interface OxaPayCommonFiatsResponseData {
  [fiat: string]: OxaPayCommonFiatInfo;
}

/** Network-specific metadata inside common currencies response. */
export interface OxaPayCommonNetworkInfo {
  network?: string;
  name?: string;
  keys?: string[];
  required_confirmations?: number;
  withdraw_fee?: number;
  withdraw_min?: number;
  deposit_min?: number;
  static_fixed_fee?: number;
  [key: string]: unknown;
}

/** Cryptocurrency metadata from common currencies endpoint. */
export interface OxaPayCommonCurrencyInfo {
  symbol?: string;
  name?: string;
  status?: boolean;
  networks?: Record<string, OxaPayCommonNetworkInfo>;
  [key: string]: unknown;
}

/** Dynamic mapping of currency symbol to currency metadata. */
export interface OxaPayCommonCurrenciesResponseData {
  [currency: string]: OxaPayCommonCurrencyInfo;
}

/** Response data for common networks endpoint. */
export interface OxaPayCommonNetworksResponseData {
  list: string[];
}

/** Response data for monitor endpoint. */
export interface OxaPayCommonMonitorResponseData {
  /** True when OxaPay reports operational status. */
  status: boolean;
}

/** Webhook payload fields sent by OxaPay payment/payout callbacks. */
export interface OxaPayWebhookPayload {
  track_id?: string;
  status?: string;
  type?: string;
  tx_hash?: string;
  address?: string;
  amount?: number | string;
  value?: number | string;
  currency?: string;
  network?: string;
  description?: string;
  date?: number | string;
  [key: string]: unknown;
}

/** Thrown when webhook HMAC signature validation fails. */
export class OxaPayWebhookSignatureException extends Error {
  constructor(message = "Invalid OxaPay webhook signature.") {
    super(message);
    this.name = "OxaPayWebhookSignatureException";
  }
}

/** Thrown for non-success OxaPay envelope or HTTP responses. */
export class OxaPayApiException extends Error {
  constructor(
    message: string,
    /** Full API envelope for debugging and custom handling. */
    readonly envelope: OxaPayApiEnvelope<unknown>,
  ) {
    super(message);
    this.name = "OxaPayApiException";
  }
}
