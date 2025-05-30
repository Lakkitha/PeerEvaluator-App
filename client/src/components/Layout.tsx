import { Outlet } from "react-router-dom";
import TestNavbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <TestNavbar />
      <main className="flex-grow container mx-auto px-4 pt-24 pb-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;