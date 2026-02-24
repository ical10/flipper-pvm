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

export const FLIPPER_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
