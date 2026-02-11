import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from './Navbar';

export default function Layout() {
  const { isParent } = useAuth();

  return (
    <div className={`min-h-screen ${isParent ? 'bg-gray-50' : 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900'}`}>
      <Navbar />
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isParent ? 'py-8' : 'py-0'}`}>
        <Outlet />
      </main>
    </div>
  );
}
