"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getStoredConsent, updateConsent } from "@/lib/analytics/gtm.consent";

const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getStoredConsent() === null);
  }, []);

  if (!visible) return null;

  const respond = (granted: boolean) => {
    updateConsent(granted ? "granted" : "denied");
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center justify-between gap-3 border-t bg-background p-4 shadow-lg sm:flex-row">
      <p className="text-sm text-muted-foreground">
        We use cookies to analyze site traffic and improve your experience.
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => respond(false)}>
          Decline
        </Button>
        <Button size="sm" onClick={() => respond(true)}>
          Accept
        </Button>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
