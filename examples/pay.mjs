// Pays for one API call with x402 (USDC on Base mainnet) and prints the JSON answer.
//
//   npm install
//   BUYER_PRIVATE_KEY=0x... node pay.mjs "https://x402-apis.pages.dev/v1/company?id=4261607&country=CA"
//
// Use a separate wallet that holds only a few cents of USDC on Base – never your main wallet.
import { decodePaymentResponseHeader, wrapFetchWithPaymentFromConfig } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

const url = process.argv[2] ?? "https://x402-apis.pages.dev/v1/company?id=4261607&country=CA";
const key = process.env.BUYER_PRIVATE_KEY;
if (!/^0x[0-9a-fA-F]{64}$/.test(key ?? "")) {
  console.error("Set BUYER_PRIVATE_KEY to the private key of a small test wallet (0x + 64 hex characters).");
  process.exit(1);
}

const fetchWithPayment = wrapFetchWithPaymentFromConfig(fetch, {
  schemes: [{ network: "eip155:8453", client: new ExactEvmScheme(privateKeyToAccount(key)) }],
});

const res = await fetchWithPayment(url);
console.log("HTTP", res.status);
const receipt = res.headers.get("PAYMENT-RESPONSE");
if (receipt) console.log("Paid:", decodePaymentResponseHeader(receipt));
else {
  // No payment happened: either the input was rejected before payment (400) or the wallet could not pay.
  const required = res.headers.get("PAYMENT-REQUIRED");
  if (required) console.log("Not paid:", JSON.parse(Buffer.from(required, "base64").toString("utf8")).error ?? "(no reason given)");
}
console.log(JSON.stringify(await res.json().catch(() => null), null, 2));
