import { Link } from "react-router-dom";
import logo from "@/assets/wematech-logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 bg-background">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="WeMaTech Logo" className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Africa-focused AI-powered digital banking solutions. Transforming financial services across the continent.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Solutions</h4>
            <ul className="space-y-3">
              {["GlobalPay", "Digital Experience Platform", "AfricaOne", "AI Banking Core", "Smart Wallet"].map((item) => (
                <li key={item}>
                  <Link to="/solutions" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              {[
                { label: "About", path: "/about" },
                { label: "Contact", path: "/contact" },
                { label: "Solutions", path: "/solutions" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Connect</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>info@wematech.io</li>
              <li>Nairobi, Kenya</li>
              <li>Addis Ababa, Ethiopia</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/30 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Wematech. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Powering Africa's Digital Financial Future
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
