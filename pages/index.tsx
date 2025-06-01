import Navbar from '@/components/Navbar';
import TokenList from '@/components/TokenList';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="p-6">
        <TokenList />
      </main>
    </>
  );
}
