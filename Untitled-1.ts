/** Types aligned with OxaPay merchant payment API (v1). @see https://docs.oxapay.com/api-reference/payment */

export interface OxaPayErrorBody {
    type?: string;
    key?: string;
    message?: string;
}

export interface OxaPayApiEnvelope<T> {
    data: T;
    message?: string;
    error?: OxaPayErrorBody | null;
    status?: number;
    version?: string;
}

/** POST /payment/invoice */
export interface OxaPayGenerateInvoiceRequest {
    amount: number;
    currency?: string;
    lifetime?: number;
    fee_paid_by_payer?: number;
    under_paid_coverage?: number;
    to_currency?: string;
    auto_withdrawal?: boolean;
    mixed_payment?: boolean;
    callback_url?: string;
    return_url?: string;
    email?: string;
    order_id?: string;
    thanks_message?: string;
    description?: string;
    sandbox?: boolean;
}

export interface OxaPayGenerateInvoiceResponseData {
    track_id: string;
    payment_url: string;
    expired_at?: number;
    date?: number;
}

/** POST /payment/white-label */
export interface OxaPayGenerateWhiteLabelRequest {
    pay_currency: string;
    amount: number;
    currency?: string;
    network?: string;
    lifetime?: number;
    fee_paid_by_payer?: number;
    under_paid_coverage?: number;
    to_currency?: string;
    auto_withdrawal?: boolean;
    callback_url?: string;
    email?: string;
    order_id?: string;
    description?: string;
}

export interface OxaPayGenerateWhiteLabelResponseData {
    track_id: string;
    amount?: number;
    currency?: string;
    pay_amount?: number;
    pay_currency?: string;
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

/** POST /payment/static-address */
export interface OxaPayGenerateStaticAddressRequest {
    network: string;
    to_currency?: string;
    auto_withdrawal?: number;
    callback_url?: string;
    email?: string;
    order_id?: string;
    description?: string;
}

export interface OxaPayGenerateStaticAddressResponseData {
    track_id: string;
    network?: string;
    address?: string;
    memo?: string;
    qr_code?: string;
    date?: number;
}

export class OxaPayApiException extends Error {
    constructor(
        message: string,
        readonly envelope: OxaPayApiEnvelope<unknown>,
    ) {
        super(message);
        this.name = 'OxaPayApiException';
    }
}
