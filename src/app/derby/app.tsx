"use client";

import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with Frame SDK
const OnbaseDerby = dynamic(() => import("~/components/OnbaseDerby"), {
  ssr: false,
});

export default function OnbaseDerbyApp() {
  return <OnbaseDerby />;
}

