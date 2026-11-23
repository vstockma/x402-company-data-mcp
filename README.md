# x402 Company & Macro Data (MCP server + HTTP API)

Company verification for AI agents from **official national registers of 19 countries** plus GLEIF worldwide, a **KYB check** with EU, UN, OFAC and UK sanctions screening, and official **FX rates, central bank rates, US Treasury yields and inflation**.

Pay per call in USDC on Base with [x402](https://x402.org). No account, no API key, no subscription.

- MCP server (Streamable HTTP): `https://x402-apis.pages.dev/mcp`
- HTTP API: `https://x402-apis.pages.dev/v1/...`
- Docs for agents: [llms.txt](https://x402-apis.pages.dev/llms.txt) · [OpenAPI 3.1](https://x402-apis.pages.dev/openapi.json) · [x402 discovery](https://x402-apis.pages.dev/.well-known/x402)
- Official MCP Registry: `io.github.vstockma/x402-apis`

This repository holds the public documentation and a client example. The hosted service itself is proprietary.

## Tools and prices

| MCP tool | HTTP endpoint | Price | What it returns |
|---|---|---|---|
| `company` | `GET /v1/company` | $0.002 | Legal name, address, legal form, status (active, dissolved, in liquidation …), register number, LEI, VAT number where the register has it |
| `kyb` | `GET /v1/kyb` | $0.02 | Register data as above, plus screening against EU, UN, US OFAC SDN and UK sanctions lists (refreshed daily) and insolvency notices (FR, UK, CH). Hits are possible matches with a 0–100 score, never a verdict |
| `fx_rates` | `GET /v1/fx-rates` | $0.002 | ECB euro reference rates for ~30 currencies, any day since 1999, any base currency |
| `interest_rates` | `GET /v1/interest-rates` | $0.002 | ECB key rates, Fed funds target range, EFFR and SOFR (New York Fed) |
| `treasury_yields` | `GET /v1/treasury-yields` | $0.002 | US Treasury par yield curve 1M–30Y since 1990, with 10Y-2Y and 10Y-3M spreads |
| `inflation` | `GET /v1/inflation` | $0.002 | Eurostat HICP (euro area, EU, 36 European countries) and US CPI-U, up to 36 months |

You never pay for a mistake: bad input gets HTTP 400 **before** payment, and "not found" (404) or a source outage (503/504) is not charged.

## Countries

Search by `name` (+ `country`), by national `id`, by `lei`, or by `vat` (FR, NO, FI, LV, HR, CH, CZ, GR).

| Country | Register | `id` example |
|---|---|---|
| 🇫🇷 France | SIRENE (INSEE) | SIREN `303265045` |
| 🇳🇴 Norway | Brønnøysundregistrene | `923609016` |
| 🇫🇮 Finland | PRH / YTJ | `0112038-9` |
| 🇱🇻 Latvia | Uzņēmumu reģistrs | `40003245752` |
| 🇮🇪 Ireland | CRO Open Data | `104547` |
| 🇬🇧 United Kingdom | Companies House | `00445790` |
| 🇺🇸 USA | SEC EDGAR (SEC filers) | CIK `320193` |
| 🇪🇪 Estonia | e-Äriregister (RIK) | `12417834` |
| 🇹🇼 Taiwan | GCIS (Ministry of Economic Affairs) | `20828393` |
| 🇭🇰 Hong Kong | Companies Registry (existing companies) | `00015833` |
| 🇸🇬 Singapore | ACRA | `196800306E` |
| 🇦🇺 Australia | ASIC + ABN Lookup | ACN `102443916` |
| 🇭🇷 Croatia | Sudski registar | MBS `080722712` or OIB |
| 🇨🇭 Switzerland | Zefix | UID `CHE-105.909.036` |
| 🇱🇹 Lithuania | Registrų centras | `121215434` |
| 🇨🇿 Czechia | ARES | IČO `00177041` |
| 🇦🇹 Austria | Firmenbuch (HVD) | FN `33209m` |
| 🇬🇷 Greece | G.E.MI. | `1037501000` or AFM `094019245` |
| 🇨🇦 Canada | Corporations Canada (federal corporations only) | `4261607` or BN `847871746` |
| 🌍 all others | GLEIF (companies with an LEI) | `lei=` |

Every answer names its source and the licence text the register asks for. Countries without free, reusable register data (for example Germany, the Netherlands, Spain, Italy) are not included; there the API falls back to GLEIF.

## Try it

Without a wallet you see the price and the payment requirements (HTTP 402):

```bash
curl -i "https://x402-apis.pages.dev/v1/company?name=Erste%20Group%20Bank&country=AT"
```

List the MCP tools (free):

```bash
curl -s https://x402-apis.pages.dev/mcp -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Pay and get the answer with Node.js ([examples/pay.mjs](examples/pay.mjs)):

```bash
cd examples
npm install
BUYER_PRIVATE_KEY=0x... node pay.mjs "https://x402-apis.pages.dev/v1/company?id=4261607&country=CA"
```

Use a separate wallet that holds only a few cents of USDC on Base. Never put your main wallet's key into a script.

### Paying through MCP

Tool calls follow the x402 MCP transport (`@x402/mcp`): a call without payment returns `isError` with the payment requirements in `structuredContent`; send the signed payment in `_meta["x402/payment"]` and the settlement comes back in `_meta["x402/payment-response"]`.

## Example answer (shortened)

```json
{
  "query": { "type": "id", "value": "4261607", "country": "CA" },
  "company": {
    "name": "SHOPIFY INC.",
    "address": { "lines": ["151 O'Connor Street", "Ground Floor", "ON"], "postalCode": "K2P 2L8", "city": "OTTAWA", "country": "CA" },
    "legalForm": { "code": null, "name": "Canada Business Corporations Act" },
    "status": "ACTIVE",
    "lei": "549300HGQ43STJLLP808",
    "registeredAs": "4261607"
  },
  "sources": ["Corporations Canada", "GLEIF"],
  "attribution": ["Source: Corporations Canada, Innovation, Science and Economic Development Canada – federal corporations only. Contains information licensed under the Open Government Licence – Canada. …"]
}
```

## Related

Sister server for stock exchange trading days and public holidays: [vstockma/x402-trading-calendar-mcp](https://github.com/vstockma/x402-trading-calendar-mcp).

## Contact

Stockwerk Studio · stockwerkstudio@gmail.com · Missing a country your agent needs? Open an issue.

Documentation and the example in this repository: MIT licence. Register data: licences of the respective sources, named in every answer.
