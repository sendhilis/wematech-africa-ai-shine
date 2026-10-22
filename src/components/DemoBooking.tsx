import WhatsAppCta from "@/components/WhatsAppCta";
import DemoEnquiryForm from "@/components/DemoEnquiryForm";
import { WHATSAPP_LINK, WHATSAPP_NUMBER_DISPLAY } from "@/components/WhatsAppCta";

const DemoBooking = () => <section id="book-demo" className="py-24 relative">
  <div className="section-container">
    <div className="text-center mb-10">
      <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">Request a <span className="glow-text">Demo</span></h2>
      <p className="text-muted-foreground max-w-xl mx-auto">Connect with the Katimoja team about your requirements.</p>
      <p className="text-sm text-muted-foreground mt-3">
        Prefer WhatsApp?{" "}
        <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          Chat with us at {WHATSAPP_NUMBER_DISPLAY}
        </a>
      </p>
    </div>
    <div className="max-w-md mx-auto"><DemoEnquiryForm product="Katimoja banking solutions" /></div>
  </div>
</section>;
export default DemoBooking;
