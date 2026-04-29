import Navbar from '../components/Navbar';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col text-brand-muted">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="py-8 text-center text-brand-muted/60 text-[10px] font-black uppercase tracking-widest border-t border-brand-border bg-brand-nav">
        © 2026 Blogify. All rights reserved.
      </footer>
    </div>
  );
};

export default MainLayout;
