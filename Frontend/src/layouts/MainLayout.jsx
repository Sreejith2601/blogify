import Navbar from '../components/Navbar';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col text-gray-600">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="py-8 text-center text-gray-400 text-sm border-t border-gray-100 bg-white">
        © 2026 Blogify. All rights reserved.
      </footer>
    </div>
  );
};

export default MainLayout;
