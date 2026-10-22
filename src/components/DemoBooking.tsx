import DemoEnquiryForm from "@/components/DemoEnquiryForm";

const DemoBooking = () => <section id="book-demo" className="py-24 relative">
  <div className="section-container">
    <div className="text-center mb-10">
      <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">Request a <span className="glow-text">Demo</span></h2>
      <p className="text-muted-foreground max-w-xl mx-auto">Connect with the Katimoja team about your requirements.</p>
    </div>
    <div className="max-w-md mx-auto"><DemoEnquiryForm product="Katimoja banking solutions" /></div>
  </div>
</section>;
export default DemoBooking;
