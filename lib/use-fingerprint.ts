"use client";

import { useState, useEffect } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

type Agent = Awaited<ReturnType<typeof FingerprintJS.load>>;

let fpPromise: Promise<Agent> | null = null;

function getFingerprint(): Promise<Agent> {
  if (!fpPromise) {
    fpPromise = FingerprintJS.load();
  }
  return fpPromise;
}

export function useFingerprint() {
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  useEffect(() => {
    getFingerprint()
      .then((agent) => agent.get())
      .then((result) => {
        localStorage.setItem("cchair_fp", result.visitorId);
        setFingerprint(result.visitorId);
      })
      .catch(() => {
        // Fallback to random ID if fingerprint fails
        const fallback = localStorage.getItem("cchair_fp");
        if (fallback) {
          setFingerprint(fallback);
        } else {
          const newId = crypto.randomUUID();
          localStorage.setItem("cchair_fp", newId);
          setFingerprint(newId);
        }
      });
  }, []);

  return fingerprint;
}
