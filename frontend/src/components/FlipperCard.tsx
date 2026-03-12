"use client";

import { useState, useEffect } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnection,
} from "wagmi";
import { decodeEventLog } from "viem";
import { FLIPPER_ABI, FLIPPER_ADDRESS } from "@/config/contract";

export function FlipperCard() {
  const { isConnected } = useConnection();
  const [events, setEvents] = useState<{ value: boolean; time: string }[]>([]);

  const {
    data: currentValue,
    refetch,
    isLoading: isReading,
  } = useReadContract({
    address: FLIPPER_ADDRESS,
    abi: FLIPPER_ABI,
    functionName: "get",
  });

  const flip = useWriteContract();

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({ hash: flip.data });

  useEffect(() => {
    if (isConfirmed) {
      refetch();
      if (receipt?.logs) {
        const newEvents = receipt.logs
          .map((log) => {
            try {
              const decoded = decodeEventLog({
                abi: FLIPPER_ABI,
                data: log.data,
                topics: log.topics,
              });
              if (decoded.eventName === "Flipped") {
                return {
                  value: (decoded.args as { new_value: boolean }).new_value,
                  time: new Date().toLocaleTimeString(),
                };
              }
            } catch {}
            return null;
          })
          .filter((e): e is { value: boolean; time: string } => e !== null);
        setEvents((prev) => [...newEvents, ...prev].slice(0, 20));
      }
      const timer = setTimeout(() => flip.reset(), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, receipt, refetch, flip]);

  const handleFlip = () => {
    flip.mutate({
      address: FLIPPER_ADDRESS,
      abi: FLIPPER_ABI,
      functionName: "flip",
      gas: BigInt(200_000),
    });
  };

  if (currentValue === undefined) {
    return;
  }

  return (
    <div className="flipper-card">
      <h2>Flipper</h2>

      <div className="value-display">
        <span className="label">Current Value</span>
        <span className="value">{isReading ? "Loading..." : currentValue ? "TRUE" : "FALSE"}</span>
      </div>

      {isConnected && (
        <button
          onClick={handleFlip}
          disabled={flip.isPending || isConfirming}
          className="flip-button"
        >
          {flip.isPending
            ? "Confirm in wallet..."
            : isConfirming
              ? "Confirming..."
              : isConfirmed
                ? "Flipped!"
                : "Flip"}
        </button>
      )}

      {flip.data && (
        <p className="tx-hash">
          Tx: {flip.data.slice(0, 10)}...{flip.data.slice(-8)}
        </p>
      )}

      {events.length > 0 && (
        <div className="event-log">
          <h3>Flipped Events</h3>
          <ul>
            {events.map((e, i) => (
              <li key={i}>
                {e.time} — flipped to <strong>{e.value ? "TRUE" : "FALSE"}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
