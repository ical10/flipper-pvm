export const FLIPPER_ABI = [
  {
    type: "function",
    name: "flip",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "get",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "Flipped",
    inputs: [{ name: "new_value", type: "bool", indexed: false }],
  },
] as const;

const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
if (!address || !address.startsWith("0x")) {
  throw new Error("env is missing or invalid");
}
export const FLIPPER_ADDRESS = address as `0x${string}`;
