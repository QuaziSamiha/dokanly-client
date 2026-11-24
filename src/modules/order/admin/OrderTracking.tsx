// ! NOT USED ANYWHERE -- JUST A DEMO
"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function OrderTracking({
  orderSid,
  initialStatus,
}: {
  orderSid: string;
  initialStatus: string;
}) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    const socket = io("http://localhost:3001"); // Your NestJS URL

    socket.emit("joinOrderRoom", orderSid);

    socket.on("orderUpdated", (data) => {
      console.log("Real-time update:", data);
      setStatus(data.status);
      // Optional: Show a toast notification here
      alert(`Order Status Updated: ${data.status}`);
    });

    return () => {
      socket.disconnect();
    };
  }, [orderSid]);

  return (
    <div>
      <h2>Current Status: {status}</h2>
    </div>
  );
}
