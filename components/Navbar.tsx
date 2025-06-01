import WalletDropdown from './WalletDropdown';

export default function Navbar() {
  return (
    <nav className="w-full bg-white dark:bg-gray-900 shadow px-4 sm:px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white text-center sm:text-left">
          🌀 Token Swirl
        </h1>
        <div className="flex justify-center sm:justify-end">
          <WalletDropdown />
        </div>
      </div>
    </nav>
  );
}
