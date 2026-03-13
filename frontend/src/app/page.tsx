import { ConnectWallet } from "@/components/ConnectWallet";
import { FlipperCard } from "@/components/FlipperCard";

export default function Home() {
  return (
    <main>
      <header>
        <ConnectWallet />
      </header>
      <FlipperCard />
      <footer className="site-footer">
        <p className="tech-stack">
          Rust &middot; PolkaVM &middot; pallet-revive &middot; Solidity ABI &middot; Next.js
          &middot; wagmi &middot; viem
        </p>
        <a
          href="https://github.com/ical10/flipper-pvm"
          target="_blank"
          rel="noopener noreferrer"
          className="github-link"
        >
          Source Code
        </a>
        <p className="footer-note">
          Made by pastaMan <br />
          Built with ❤️ for Polkadot Solidity Hackathon 2026
          <br /> Online Workshop
        </p>
      </footer>
    </main>
  );
}
