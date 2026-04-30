import axios, { AxiosError, type AxiosInstance } from "axios";
import crypto from "node:crypto";
import {
  OxaPayAccountBalanceQuery,
  OxaPayAccountBalanceResponseData,
  OxaPayAcceptedCurrenciesResponseData,
  OxaPayApiEnvelope,
  OxaPayApiException,
  OxaPayCommonCurrenciesResponseData,
  OxaPayCommonFiatsResponseData,
  OxaPayCommonMonitorResponseData,
  OxaPayCommonNetworksResponseData,
  OxaPayCommonPricesResponseData,
  OxaPayGenerateInvoiceRequest,
  OxaPayGenerateInvoiceResponseData,
  OxaPayGeneratePayoutRequest,
  OxaPayGeneratePayoutResponseData,
  OxaPayGenerateStaticAddressRequest,
  OxaPayGenerateStaticAddressResponseData,
  OxaPayGenerateWhiteLabelRequest,
  OxaPayGenerateWhiteLabelResponseData,
  OxaPayPaymentHistoryQuery,
  OxaPayPaymentHistoryResponseData,
  OxaPayPaymentInfoResponseData,
  OxaPayPayoutHistoryQuery,
  OxaPayPayoutHistoryResponseData,
  OxaPayPayoutInfoResponseData,
  OxaPayRevokeStaticAddressRequest,
  OxaPayStaticAddressListQuery,
  OxaPayStaticAddressListResponseData,
  OxaPaySwapCalculateRequest,
  OxaPaySwapCalculateResponseData,
  OxaPaySwapHistoryQuery,
  OxaPaySwapHistoryResponseData,
  OxaPaySwapPairsResponseData,
  OxaPaySwapRateRequest,
  OxaPaySwapRateResponseData,
  OxaPaySwapRequest,
  OxaPaySwapRequestResponseData,
  OxaPayWebhookPayload,
  OxaPayWebhookSignatureException,
} from "./types";

const DEFAULT_BASE_URL = "https://api.oxapay.com/v1";

/** Configuration options for `OxaPayClient`. */
export interface OxaPayClientOptions {
  /** Backward-compatible alias for `merchantApiKey`. */
  apiKey?: string;
  /** Key used for Payment endpoints (`merchant_api_key` header). */
  merchantApiKey?: string;
  /** Key used for Payout endpoints (`payout_api_key` header). */
  payoutApiKey?: string;
  /** Key used for Swap/General endpoints (`general_api_key` header). */
  generalApiKey?: string;
  /** Override API base URL (default is OxaPay v1). */
  baseUrl?: string;
  /** Request timeout in milliseconds. */
  timeoutMs?: number;
  /** Optional centralized error callback. */
  onError?: (error: unknown, context: { path: string }) => void;
}

/**
 * Typed SDK client for OxaPay APIs.
 *
 * Includes Payment, Payout, Swap, Common endpoints plus webhook helpers.
 */
export class OxaPayClient {
  private readonly merchantApiKey?: string;
  private readonly payoutApiKey?: string;
  private readonly generalApiKey?: string;
  private readonly http: AxiosInstance;
  private readonly onError?: (error: unknown, context: { path: string }) => void;

  constructor(options: OxaPayClientOptions) {
    const {
      apiKey,
      merchantApiKey,
      payoutApiKey,
      generalApiKey,
      baseUrl = DEFAULT_BASE_URL,
      timeoutMs = 30_000,
      onError,
    } = options;
    this.merchantApiKey = merchantApiKey ?? apiKey;
    this.payoutApiKey = payoutApiKey;
    this.generalApiKey = generalApiKey;
    this.onError = onError;
    this.http = axios.create({
      baseURL: baseUrl.replace(/\/$/, ""),
      timeout: timeoutMs,
      headers: {
        "Content-Type": "application/json",
      },
      validateStatus: () => true,
    });
  }

  /** Create merchant invoice and receive hosted payment URL + track id. */
  async generateInvoice(
    body: OxaPayGenerateInvoiceRequest,
  ): Promise<OxaPayGenerateInvoiceResponseData> {
    return this.postJson<OxaPayGenerateInvoiceResponseData>("/payment/invoice", body, "merchant");
  }

  /** Create white-label payment session with address/amount/network details. */
  async generateWhiteLabel(
    body: OxaPayGenerateWhiteLabelRequest,
  ): Promise<OxaPayGenerateWhiteLabelResponseData> {
    return this.postJson<OxaPayGenerateWhiteLabelResponseData>("/payment/white-label", body, "merchant");
  }

  /** Create reusable static payment address for a specific network. */
  async generateStaticAddress(
    body: OxaPayGenerateStaticAddressRequest,
  ): Promise<OxaPayGenerateStaticAddressResponseData> {
    return this.postJson<OxaPayGenerateStaticAddressResponseData>("/payment/static-address", body, "merchant");
  }

  /** Revoke previously generated static address to stop receiving credits on it. */
  async revokeStaticAddress(body: OxaPayRevokeStaticAddressRequest): Promise<Record<string, never>> {
    return this.postJson<Record<string, never>>("/payment/static-address/revoke", body, "merchant");
  }

  /** Retrieve paginated static address list for your merchant account. */
  async staticAddressList(
    query?: OxaPayStaticAddressListQuery,
  ): Promise<OxaPayStaticAddressListResponseData> {
    return this.getJson<OxaPayStaticAddressListResponseData>("/payment/static-address-list", query, "merchant");
  }

  /** Get detailed payment information by OxaPay payment `track_id`. */
  async paymentInformation(trackId: string): Promise<OxaPayPaymentInfoResponseData> {
    return this.getJson<OxaPayPaymentInfoResponseData>(
      `/payment/${encodeURIComponent(trackId)}`,
      undefined,
      "merchant",
    );
  }

  /** Retrieve merchant payment history with optional filters and pagination. */
  async paymentHistory(query?: OxaPayPaymentHistoryQuery): Promise<OxaPayPaymentHistoryResponseData> {
    return this.getJson<OxaPayPaymentHistoryResponseData>("/payment/history", query, "merchant");
  }

  /** List currencies currently accepted by your merchant configuration. */
  async acceptedCurrencies(): Promise<OxaPayAcceptedCurrenciesResponseData> {
    return this.getJson<OxaPayAcceptedCurrenciesResponseData>(
      "/payment/accepted-currencies",
      undefined,
      "merchant",
    );
  }

  /** Generate payout request to transfer funds to destination address. */
  async generatePayout(body: OxaPayGeneratePayoutRequest): Promise<OxaPayGeneratePayoutResponseData> {
    return this.postJson<OxaPayGeneratePayoutResponseData>("/payout", body, "payout");
  }

  /** Get payout details by payout `track_id`. */
  async payoutInformation(trackId: string): Promise<OxaPayPayoutInfoResponseData> {
    return this.getJson<OxaPayPayoutInfoResponseData>(`/payout/${encodeURIComponent(trackId)}`, undefined, "payout");
  }

  /** Retrieve payout history list with filters and pagination. */
  async payoutHistory(query?: OxaPayPayoutHistoryQuery): Promise<OxaPayPayoutHistoryResponseData> {
    return this.getJson<OxaPayPayoutHistoryResponseData>("/payout", query, "payout");
  }

  /** Execute asset swap between two supported currencies. */
  async swapRequest(body: OxaPaySwapRequest): Promise<OxaPaySwapRequestResponseData> {
    return this.postJson<OxaPaySwapRequestResponseData>("/general/swap", body, "general");
  }

  /** Retrieve account swap history with filters and pagination. */
  async swapHistory(query?: OxaPaySwapHistoryQuery): Promise<OxaPaySwapHistoryResponseData> {
    return this.getJson<OxaPaySwapHistoryResponseData>("/general/swap", query, "general");
  }

  /** List all supported swap pairs and their minimum amounts. */
  async swapPairs(): Promise<OxaPaySwapPairsResponseData> {
    return this.getJson<OxaPaySwapPairsResponseData>("/general/swap/pairs", undefined, "general");
  }

  /** Calculate output amount for a swap pair and input amount. */
  async swapCalculate(body: OxaPaySwapCalculateRequest): Promise<OxaPaySwapCalculateResponseData> {
    return this.postJson<OxaPaySwapCalculateResponseData>("/general/swap/calculate", body, "general");
  }

  /** Get real-time rate for a swap pair. */
  async swapRate(body: OxaPaySwapRateRequest): Promise<OxaPaySwapRateResponseData> {
    return this.postJson<OxaPaySwapRateResponseData>("/general/swap/rate", body, "general");
  }

  /** Get current market prices for supported assets (no auth required). */
  async prices(): Promise<OxaPayCommonPricesResponseData> {
    return this.getJson<OxaPayCommonPricesResponseData>("/common/prices");
  }

  /** Get wallet balances for all/specific currencies (requires general API key). */
  async accountBalance(query?: OxaPayAccountBalanceQuery): Promise<OxaPayAccountBalanceResponseData> {
    return this.getJson<OxaPayAccountBalanceResponseData>("/general/account/balance", query, "general");
  }

  /** Get supported crypto currencies with network metadata (no auth required). */
  async currencies(): Promise<OxaPayCommonCurrenciesResponseData> {
    return this.getJson<OxaPayCommonCurrenciesResponseData>("/common/currencies");
  }

  /** Alias for `currencies()` to align with docs naming ("Supported Currencies"). */
  async supportedCurrencies(): Promise<OxaPayCommonCurrenciesResponseData> {
    return this.currencies();
  }

  /** Get supported fiat currencies and precision info (no auth required). */
  async fiats(): Promise<OxaPayCommonFiatsResponseData> {
    return this.getJson<OxaPayCommonFiatsResponseData>("/common/fiats");
  }

  /** Alias for `fiats()` to align with docs naming ("Supported Fiat Currencies"). */
  async supportedFiatCurrencies(): Promise<OxaPayCommonFiatsResponseData> {
    return this.fiats();
  }

  /** Get supported blockchain network names (no auth required). */
  async networks(): Promise<OxaPayCommonNetworksResponseData> {
    return this.getJson<OxaPayCommonNetworksResponseData>("/common/networks");
  }

  /** Alias for `networks()` to align with docs naming ("Supported Networks"). */
  async supportedNetworks(): Promise<OxaPayCommonNetworksResponseData> {
    return this.networks();
  }

  /** Check OxaPay API operational status (no auth required). */
  async monitor(): Promise<OxaPayCommonMonitorResponseData> {
    return this.getJson<OxaPayCommonMonitorResponseData>("/common/monitor");
  }

  /** Alias for `monitor()` to align with docs naming ("System Status"). */
  async systemStatus(): Promise<OxaPayCommonMonitorResponseData> {
    return this.monitor();
  }

  /**
   * Verify webhook HMAC signature using OxaPay API key.
   *
   * OxaPay sends SHA-512 HMAC of raw body in `HMAC` header.
   */
  static verifyWebhookSignature(rawBody: string, hmacHeader: string | undefined, apiKey: string): boolean {
    if (!hmacHeader) {
      return false;
    }
    const digest = crypto.createHmac("sha512", apiKey).update(rawBody, "utf8").digest("hex");
    return digest.toLowerCase() === hmacHeader.trim().toLowerCase();
  }

  /**
   * Parse webhook payload and optionally verify signature.
   *
   * Pass merchant and/or payout key. If both are provided, either valid
   * signature is accepted.
   */
  static getWebhookData(
    rawBody: string,
    headers: Record<string, string | string[] | undefined>,
    options: {
      merchantApiKey?: string;
      payoutApiKey?: string;
      verify?: boolean;
    } = {},
  ): OxaPayWebhookPayload {
    const { merchantApiKey, payoutApiKey, verify = true } = options;
    const hmacHeader = OxaPayClient.getHeader(headers, "hmac");
    const payload = JSON.parse(rawBody) as OxaPayWebhookPayload;

    if (!verify) {
      return payload;
    }

    const merchantValid =
      !!merchantApiKey && OxaPayClient.verifyWebhookSignature(rawBody, hmacHeader, merchantApiKey);
    const payoutValid = !!payoutApiKey && OxaPayClient.verifyWebhookSignature(rawBody, hmacHeader, payoutApiKey);

    if (!merchantValid && !payoutValid) {
      throw new OxaPayWebhookSignatureException();
    }
    return payload;
  }

  private async postPaymentEnvelope<T>(
    path: string,
    body: object,
    authType?: "merchant" | "payout" | "general",
  ): Promise<OxaPayApiEnvelope<T>> {
    return this.sendEnvelope<T>("post", path, body, authType);
  }

  private async getPaymentEnvelope<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
    authType?: "merchant" | "payout" | "general",
  ): Promise<OxaPayApiEnvelope<T>> {
    return this.sendEnvelope<T>("get", path, undefined, authType, params);
  }

  private async sendEnvelope<T>(
    method: "get" | "post",
    path: string,
    body?: object,
    authType?: "merchant" | "payout" | "general",
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<OxaPayApiEnvelope<T>> {
    try {
      const res = await this.http.request<OxaPayApiEnvelope<T>>({
        method,
        url: path,
        data: body,
        params,
        headers: {
          ...this.getAuthHeaders(authType),
        },
      });

      const { data, status: httpStatus } = res;
      if (data == null || typeof data !== "object") {
        throw new OxaPayApiException(`OxaPay invalid response (HTTP ${httpStatus})`, {
          data: data as unknown as T,
        } as OxaPayApiEnvelope<unknown>);
      }

      const envelope = data as OxaPayApiEnvelope<T>;
      if (httpStatus >= 400) {
        throw new OxaPayApiException(
          envelope.message ?? `OxaPay HTTP ${httpStatus}`,
          envelope as OxaPayApiEnvelope<unknown>,
        );
      }

      return envelope;
    } catch (error) {
      this.handleError(path, error);
      throw error;
    }
  }

  private async postJson<T>(
    path: string,
    body: object,
    authType?: "merchant" | "payout" | "general",
  ): Promise<T> {
    const envelope = await this.postPaymentEnvelope<T>(path, body, authType);
    if (this.hasEnvelopeError(envelope)) {
      const errorBody = envelope.error ?? {};
      const msg =
        errorBody.message ??
        envelope.message ??
        `OxaPay API error${errorBody.type ? ` (${errorBody.type})` : ""}`;
      throw new OxaPayApiException(msg, envelope as OxaPayApiEnvelope<unknown>);
    }
    return envelope.data;
  }

  private async getJson<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
    authType?: "merchant" | "payout" | "general",
  ): Promise<T> {
    const envelope = await this.getPaymentEnvelope<T>(path, params, authType);
    if (this.hasEnvelopeError(envelope)) {
      const errorBody = envelope.error ?? {};
      const msg =
        errorBody.message ??
        envelope.message ??
        `OxaPay API error${errorBody.type ? ` (${errorBody.type})` : ""}`;
      throw new OxaPayApiException(msg, envelope as OxaPayApiEnvelope<unknown>);
    }
    return envelope.data;
  }

  private getAuthHeaders(authType?: "merchant" | "payout" | "general"): Record<string, string> {
    if (!authType) {
      return {};
    }

    if (authType === "merchant") {
      if (!this.merchantApiKey) {
        throw new Error(
          "Missing merchant API key. Provide merchantApiKey (or apiKey) in OxaPayClient options.",
        );
      }
      return { merchant_api_key: this.merchantApiKey };
    }

    if (authType === "payout") {
      if (!this.payoutApiKey) {
        throw new Error("Missing payout API key. Provide payoutApiKey in OxaPayClient options.");
      }
      return { payout_api_key: this.payoutApiKey };
    }

    if (!this.generalApiKey) {
      throw new Error("Missing general API key. Provide generalApiKey in OxaPayClient options.");
    }
    return { general_api_key: this.generalApiKey };
  }

  private hasEnvelopeError(envelope: OxaPayApiEnvelope<unknown>): boolean {
    if (typeof envelope.status === "number" && envelope.status >= 400) {
      return true;
    }
    if (!envelope.error || typeof envelope.error !== "object") {
      return false;
    }
    return Object.keys(envelope.error).length > 0;
  }

  private static getHeader(
    headers: Record<string, string | string[] | undefined>,
    key: string,
  ): string | undefined {
    const direct = headers[key];
    if (typeof direct === "string") {
      return direct;
    }
    if (Array.isArray(direct)) {
      return direct[0];
    }
    const foundKey = Object.keys(headers).find((h) => h.toLowerCase() === key.toLowerCase());
    const value = foundKey ? headers[foundKey] : undefined;
    if (typeof value === "string") {
      return value;
    }
    if (Array.isArray(value)) {
      return value[0];
    }
    return undefined;
  }

  private handleError(path: string, error: unknown): void {
    if (this.onError) {
      this.onError(error, { path });
      return;
    }

    if (axios.isAxiosError(error)) {
      const ax = error as AxiosError;
      const details = {
        path,
        code: ax.code,
        status: ax.response?.status,
        data: ax.response?.data,
      };
      console.error("OxaPay HTTP request failed", details);
      return;
    }

    console.error("OxaPay request failed", { path, error });
  }
}
