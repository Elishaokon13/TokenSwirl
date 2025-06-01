import ConnectWallet from '@/components/ConnectWallet';
import TokenList from '@/components/TokenList';

export default function Home() {
  return (
    <main className="p-6">
      <ConnectWallet />
      <TokenList />
    </main>
  );
}
