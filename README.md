# oxapay-sdk

TypeScript SDK for OxaPay merchant payment APIs.

## Install

```bash
npm install oxapay-sdk
```

## Usage

```ts
import { OxaPayClient } from "oxapay-sdk";

const client = new OxaPayClient({
  merchantApiKey: process.env.OXAPAY_MERCHANT_API_KEY,
  payoutApiKey: process.env.OXAPAY_PAYOUT_API_KEY,
  generalApiKey: process.env.OXAPAY_GENERAL_API_KEY,
});

const invoice = await client.generateInvoice({
  amount: 25,
  currency: "USD",
  callback_url: "https://example.com/oxapay/callback",
  return_url: "https://example.com/payment/result",
  order_id: "order-1001",
});

console.log(invoice.track_id, invoice.payment_url);
```

## API

- Payment:
  - `generateInvoice(body)`
  - `generateWhiteLabel(body)`
  - `generateStaticAddress(body)`
  - `revokeStaticAddress(body)`
  - `staticAddressList(query?)`
  - `paymentInformation(trackId)`
  - `paymentHistory(query?)`
  - `acceptedCurrencies()`
- Payout:
  - `generatePayout(body)`
  - `payoutInformation(trackId)`
  - `payoutHistory(query?)`
- Swap:
  - `swapRequest(body)`
  - `swapHistory(query?)`
  - `swapPairs()`
  - `swapCalculate(body)`
  - `swapRate(body)`
- Common (no key required by OxaPay):
  - `prices()`
  - `currencies()`
  - `fiats()`
  - `networks()`
  - `monitor()`
- Webhook helpers:
  - `OxaPayClient.verifyWebhookSignature(rawBody, hmacHeader, apiKey)`
  - `OxaPayClient.getWebhookData(rawBody, headers, options)`

## Errors

OxaPay API and HTTP response failures throw `OxaPayApiException` with the full response envelope in `error.envelope`.

## License

MIT
