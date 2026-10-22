import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "@/assets/katimoja-logo.png";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Solutions", path: "/solutions" },
  { label: "Micro-SaaS", path: "/microsaas" },
  { label: "Blog", path: "/blog" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border/30 py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="section-container flex items-center justify-between">
        <Link to="/" aria-label="Katimoja home" className="flex flex-col gap-1 shrink-0">
            <img
              src={logo}
              alt="Katimoja"
              width={1374}
              height={326}
              className="h-auto w-36 sm:w-44 object-contain"
            />
            <span className="text-muted-foreground font-medium leading-tight hidden sm:block text-[10px]">
              Advanced AI. Accessible to All.
            </span>
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors duration-300 ${
                location.pathname === link.path
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/solutions#book-demo" className="btn-primary text-xs px-6 py-2.5">
            Get Started
          </Link>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden text-foreground"
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileOpen}
          aria-controls="mobile-navigation"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {isMobileOpen && (
        <div id="mobile-navigation" className="lg:hidden mt-2 mx-4 rounded-lg p-6 space-y-4 bg-background/95 backdrop-blur-xl border border-border/30">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block text-sm font-medium py-2 ${
                location.pathname === link.path
                  ? "text-accent"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/solutions#book-demo" className="btn-primary block text-center text-xs px-6 py-2.5 mt-4">
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
