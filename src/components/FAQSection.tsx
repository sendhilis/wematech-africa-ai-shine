import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What banking technology solutions does Wematech Africa provide?",
    answer:
      "Wematech Africa provides a comprehensive suite of AI-first banking technology solutions: core banking transformation, AI credit scoring and digital lending, mobile money infrastructure, real-time fraud detection, open banking APIs, KYC/AML RegTech automation, and Banking-as-a-Service platforms. Our solutions serve commercial banks, microfinance institutions, neobanks, mobile money operators, and development finance institutions across all 54 African markets.",
  },
  {
    question: "Which African countries does Wematech Africa serve?",
    answer:
      "Wematech Africa serves financial institutions across all 54 African nations. We have deepest market configurations for Nigeria (CBN compliance), Kenya (CBK, M-Pesa interoperability), South Africa (FSCA, SARB), Ghana (Bank of Ghana), Egypt (CBE), Ethiopia (NBE), Uganda, Tanzania, Rwanda, and the WAEMU/BCEAO zone covering 8 West African francophone markets.",
  },
  {
    question: "How does Wematech Africa use artificial intelligence in banking?",
    answer:
      "Wematech Africa applies AI across the full banking value chain. Our AI Credit Engine uses 400+ alternative data signals for credit scoring. Our Fraud AI provides real-time transaction monitoring using deep learning models trained on African fraud patterns. Our KYC AI automates identity verification using biometrics. Our Compliance AI auto-generates regulatory reports for 30+ African central bank frameworks. And our Agentic Banking workflows deploy autonomous AI agents that handle entire banking processes end-to-end.",
  },
  {
    question: "What is the best core banking platform for African banks?",
    answer:
      "Wematech Africa provides Africa's most purpose-built core banking platform — cloud-native, AI-driven, and pre-configured for African regulatory requirements. Unlike global platforms that require extensive customization for African markets, Wematech Africa is built from the ground up for African currencies, central bank reporting standards, USSD/mobile-first access, and the operational realities of banking in Africa.",
  },
  {
    question: "Does Wematech Africa support open banking and CBDC?",
    answer:
      "Yes. Our Open Banking API platform enables African banks to expose account data, payment initiation, and financial products to authorized fintechs — aligned with Nigeria's Open Banking framework, South Africa's open finance initiatives, and Kenya's emerging data-sharing standards. For CBDC, we provide wallet infrastructure, programmable payment rails, and digital identity layers for central banks exploring retail and wholesale CBDC deployments.",
  },
  {
    question: "How quickly can Wematech Africa deploy its banking platform?",
    answer:
      "Our modular, cloud-native architecture enables rapid deployment. A greenfield neobank or digital lending product can go live in as little as 8–12 weeks. Core banking transformation projects for established banks typically follow a phased migration approach over 6–18 months, minimizing operational risk while modernizing infrastructure.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="py-20">
      <div className="section-container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 block">
            Common Questions
          </span>
          <h2 id="faq-heading" className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="glass-card px-6 border-border/40"
              >
                <AccordionTrigger className="text-sm font-semibold text-foreground text-left py-5 hover:no-underline hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
