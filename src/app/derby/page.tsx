import { Metadata } from "next";
import OnbaseDerbyApp from "./app";
import { getFrameEmbedMetadata } from "~/lib/utils";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Onbase Derby - Racing Game",
    openGraph: {
      title: "Onbase Derby",
      description: "Tap-to-win racing game on Base",
      images: [`${process.env.NEXT_PUBLIC_URL}/icon.png`],
    },
    other: {
      "fc:frame": JSON.stringify(getFrameEmbedMetadata()),
    },
  };
}

export default function DerbyPage() {
  return <OnbaseDerbyApp />;
}

