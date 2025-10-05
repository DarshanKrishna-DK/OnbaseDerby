/**
 * Contract addresses for Onbase Derby
 * Update these after deployment
 */

import { baseSepolia } from "wagmi/chains";

export const RACE_FACTORY_ADDRESS = {
  [baseSepolia.id]: (process.env.NEXT_PUBLIC_RACE_FACTORY_ADDRESS as `0x${string}`) || "0x0000000000000000000000000000000000000000",
} as const;

export function getRaceFactoryAddress(chainId: number): `0x${string}` {
  return RACE_FACTORY_ADDRESS[chainId as keyof typeof RACE_FACTORY_ADDRESS] || "0x0000000000000000000000000000000000000000";
}

