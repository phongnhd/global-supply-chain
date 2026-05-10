import { getFullnodeUrl } from "@mysten/sui/client";

export type SuiNetwork = "testnet" | "mainnet" | "devnet" | "localnet";

export function getSuiNetwork(): SuiNetwork {
  const n = process.env.NEXT_PUBLIC_SUI_NETWORK as SuiNetwork | undefined;
  if (n === "mainnet" || n === "devnet" || n === "localnet" || n === "testnet") {
    return n;
  }
  return "testnet";
}

export function getSuiRpcUrl() {
  return process.env.NEXT_PUBLIC_SUI_RPC_URL ?? getFullnodeUrl(getSuiNetwork());
}
