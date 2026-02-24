"use client";

import { useState, useEffect } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useAccount,
} from "wagmi";
import { FLIPPER_ABI, FLIPPER_ADDRESS } from "@/config/contract";

export function FlipperCard() {
  const { isConnected } = useAccount();
  const [events, setEvents] = useState<{ value: boolean; time: string }[]>([]);

  const {
    data: currentValue,
    refetch,
    isLoading: isReading,
  } = useReadContract({
    address: FLIPPER_ADDRESS,
    abi: FLIPPER_ABI,
    functionName: "get",
    query: {
      refetchInterval: 10_000,
    },
  });

  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isConfirmed) {
      refetch();
      const timer = setTimeout(() => reset(), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, refetch, reset]);

  useWatchContractEvent({
    address: FLIPPER_ADDRESS,
    abi: FLIPPER_ABI,
    eventName: "Flipped",
    onLogs(logs) {
      const newEvents = logs.map((log) => ({
        value: log.args.new_value as boolean,
        time: new Date().toLocaleTimeString(),
      }));
      setEvents((prev) => [...newEvents, ...prev].slice(0, 20));
    },
  });

  const handleFlip = () => {
    writeContract({
      address: FLIPPER_ADDRESS,
      abi: FLIPPER_ABI,
      functionName: "flip",
    });
  };

  return (
    <div className="flipper-card">
      <h2>Flipper</h2>

      <div className="value-display">
        <span className="label">Current Value</span>
        <span className="value">
          {isReading ? "Loading..." : currentValue ? "TRUE" : "FALSE"}
        </span>
      </div>

      {isConnected && (
        <button
          onClick={handleFlip}
          disabled={isWritePending || isConfirming}
          className="flip-button"
        >
          {isWritePending
            ? "Confirm in wallet..."
            : isConfirming
              ? "Confirming..."
              : isConfirmed
                ? "Flipped!"
                : "Flip"}
        </button>
      )}

      {txHash && (
        <p className="tx-hash">
          Tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}
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
