import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoIcon from "@/assets/wematech-icon.png";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Solutions", path: "/solutions" },
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-[hsl(228_50%_16%/0.95)] backdrop-blur-xl border-b border-[hsl(228_50%_30%/0.3)] py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="section-container flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group relative">
          <div className="relative flex-shrink-0">
            <div className={`absolute inset-0 rounded-full bg-accent/20 blur-xl animate-pulse-glow transition-all duration-500 ${isScrolled ? "scale-110" : "scale-125"}`} />
            <img
              src={logoIcon}
              alt="WeMaTech"
              className={`relative z-10 transition-all duration-500 drop-shadow-[0_0_20px_hsl(40_92%_56%/0.6)] group-hover:drop-shadow-[0_0_32px_hsl(40_92%_56%/0.8)] ${isScrolled ? "h-14 w-14" : "h-[4.5rem] w-[4.5rem]"}`}
            />
          </div>
          <div className="flex flex-col">
            <span className={`font-heading font-bold text-foreground leading-tight transition-all duration-500 ${isScrolled ? "text-xl" : "text-2xl"}`}>
              Wema<span className="text-accent">Tech</span>
            </span>
            <span className={`text-muted-foreground font-medium leading-tight transition-all duration-500 ${isScrolled ? "text-[10px]" : "text-xs"}`}>
              Advanced AI. Accessible to All.
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
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

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="md:hidden text-foreground"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMobileOpen && (
        <div className="md:hidden mt-2 mx-4 rounded-2xl p-6 space-y-4 bg-[hsl(228_50%_14%/0.95)] backdrop-blur-xl border border-[hsl(228_50%_30%/0.3)]">
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
