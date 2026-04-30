import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { PinoLoggerService } from 'src/common/logger';
import {
    OxaPayApiEnvelope,
    OxaPayApiException,
    OxaPayGenerateInvoiceRequest,
    OxaPayGenerateInvoiceResponseData,
    OxaPayGenerateStaticAddressRequest,
    OxaPayGenerateStaticAddressResponseData,
    OxaPayGenerateWhiteLabelRequest,
    OxaPayGenerateWhiteLabelResponseData,
} from './dto';

const DEFAULT_BASE_URL = 'https://api.oxapay.com/v1';

@Injectable()
export class OxaPayService {
    private logger: ReturnType<PinoLoggerService['getChildLogger']>;
    private readonly baseUrl: string;

    constructor(
        protected readonly pinoLogger: PinoLoggerService,
        private readonly config: ConfigService,
    ) {
        this.logger = pinoLogger.getChildLogger(OxaPayService.name);
        this.baseUrl = (this.config.get<string>('OXAPAY_API_BASE_URL') ?? DEFAULT_BASE_URL).replace(/\/$/, '');
    }

    /**
     * Merchant invoice: returns a track id and hosted payment URL.
     * @see https://docs.oxapay.com/api-reference/payment/generate-invoice
     */
    async generateInvoice(
        merchantApiKey: string,
        body: OxaPayGenerateInvoiceRequest,
    ): Promise<OxaPayGenerateInvoiceResponseData> {
        return this.postJson<OxaPayGenerateInvoiceResponseData>('/payment/invoice', merchantApiKey, body);
    }

    /**
     * White-label payment session with amount, pay currency, and on-chain details in the response.
     * @see https://docs.oxapay.com/api-reference/payment/generate-white-label
     */
    async generateWhiteLabel(
        merchantApiKey: string,
        body: OxaPayGenerateWhiteLabelRequest,
    ): Promise<OxaPayGenerateWhiteLabelResponseData> {
        return this.postJson<OxaPayGenerateWhiteLabelResponseData>('/payment/white-label', merchantApiKey, body);
    }

    /**
     * Static deposit address for a given network (and optional conversion / callbacks).
     * @see https://docs.oxapay.com/api-reference/payment/generate-static-address
     */
    async generateStaticAddress(
        merchantApiKey: string,
        body: OxaPayGenerateStaticAddressRequest,
    ): Promise<OxaPayGenerateStaticAddressResponseData> {
        return this.postJson<OxaPayGenerateStaticAddressResponseData>('/payment/static-address', merchantApiKey, body);
    }

    /**
     * Raw POST helper when you need the full envelope (e.g. debugging or custom parsing).
     */
    async postPaymentEnvelope<T>(path: string, merchantApiKey: string, body: object): Promise<OxaPayApiEnvelope<T>> {
        const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
        try {
            const res = await axios.post<OxaPayApiEnvelope<T>>(url, body, {
                headers: {
                    merchant_api_key: merchantApiKey,
                    'Content-Type': 'application/json',
                },
                validateStatus: () => true,
            });
            const { data, status: httpStatus } = res;
            if (data == null || typeof data !== 'object') {
                throw new OxaPayApiException(`OxaPay invalid response (HTTP ${httpStatus})`, {
                    data: data as unknown,
                } as OxaPayApiEnvelope<unknown>);
            }
            const envelope = data as OxaPayApiEnvelope<T>;
            if (httpStatus >= 400) {
                this.logger.warn('OxaPay HTTP error status', { path, httpStatus, envelope });
                throw new OxaPayApiException(
                    envelope.message ?? `OxaPay HTTP ${httpStatus}`,
                    envelope as OxaPayApiEnvelope<unknown>,
                );
            }
            return envelope;
        } catch (err) {
            if (err instanceof OxaPayApiException) {
                throw err;
            }
            this.logAxiosError(path, err);
            throw err;
        }
    }

    private async postJson<T>(path: string, merchantApiKey: string, body: object): Promise<T> {
        const envelope = await this.postPaymentEnvelope<T>(path, merchantApiKey, body);
        if (envelope.error) {
            const msg =
                envelope.error.message ??
                envelope.message ??
                `OxaPay API error${envelope.error.type ? ` (${envelope.error.type})` : ''}`;
            this.logger.warn('OxaPay API returned error object', { path, envelope });
            throw new OxaPayApiException(msg, envelope as OxaPayApiEnvelope<unknown>);
        }
        return envelope.data;
    }

    private logAxiosError(path: string, err: unknown) {
        if (axios.isAxiosError(err)) {
            const ax = err as AxiosError;
            this.logger.error('OxaPay HTTP request failed', ax, {
                path,
                code: ax.code,
                status: ax.response?.status,
                data: ax.response?.data,
            });
        } else {
            this.logger.error('OxaPay request failed', err instanceof Error ? err : String(err), { path });
        }
    }
}
