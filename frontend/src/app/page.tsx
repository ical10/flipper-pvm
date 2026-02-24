import { ConnectWallet } from "@/components/ConnectWallet";
import { FlipperCard } from "@/components/FlipperCard";

export default function Home() {
  return (
    <main>
      <header>
        <ConnectWallet />
      </header>
      <FlipperCard />
    </main>
  );
}
