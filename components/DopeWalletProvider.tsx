import React, { useEffect, useState } from "react";
import ApproveSignModal from "./ApproveSignModal";
import { useWallet } from "./WalletProvider";

export default function DopeWalletProvider() {
  const { address, keypair } = useWallet() as any;
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState("");
  const [pendingEvent, setPendingEvent] = useState<MessageEvent|null>(null);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.source !== window.frames[0]) return;
      const { type, payload } = event.data || {};
      if (type === "dope:connect") {
        window.frames[0].postMessage({ type: "dope:connected", address }, "*");
      }
      if (type === "dope:sign" && keypair) {
        setPendingMessage(payload?.message || "");
        setPendingEvent(event);
        setModalOpen(true);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [address, keypair]);

  const handleApprove = () => {
    if (pendingEvent && keypair) {
      // Simulate signing
      const signature = "signed-by-dope-wallet";
      window.frames[0].postMessage({ type: "dope:signed", signature }, "*");
    }
    setModalOpen(false);
    setPendingMessage("");
    setPendingEvent(null);
  };
  const handleReject = () => {
    if (pendingEvent) {
      window.frames[0].postMessage({ type: "dope:rejected" }, "*");
    }
    setModalOpen(false);
    setPendingMessage("");
    setPendingEvent(null);
  };

  return (
    <>
      {modalOpen && (
        <ApproveSignModal
          open={modalOpen}
          message={pendingMessage}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </>
  );
}
