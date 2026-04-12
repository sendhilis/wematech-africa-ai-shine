const SEOContentBlock = () => {
  return (
    <section aria-labelledby="seo-about-heading" className="py-20">
      <div className="section-container">
        <div className="glass-card glow-border p-8 sm:p-12 max-w-4xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 block">
            About Wematech Africa
          </span>
          <h2
            id="seo-about-heading"
            className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-6"
          >
            Africa's Leading AI Banking Technology Company
          </h2>

          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <p>
              Wematech Africa is an AI-first banking technology company purpose-built for the African
              financial services market. We provide the technology infrastructure that powers banks,
              fintechs, microfinance institutions, neobanks, and mobile money operators across the
              African continent to deliver modern, inclusive, and intelligent financial services at
              scale.
            </p>

            <h3 className="font-heading text-lg font-bold text-foreground !mt-8">
              What Is AI Banking Technology?
            </h3>
            <p>
              AI banking technology refers to the application of artificial intelligence, machine
              learning, and advanced data analytics across the full spectrum of banking operations —
              from credit decisioning and fraud detection to customer onboarding, regulatory
              compliance, and agentic financial workflows. In the African context, AI banking
              technology unlocks entirely new possibilities: credit scoring for the unbanked using
              alternative data, real-time fraud prevention on mobile money networks, multilingual AI
              customer service, and automated compliance with diverse regulatory regimes.
            </p>

            <h3 className="font-heading text-lg font-bold text-foreground !mt-8">
              Why African Banks Need Purpose-Built AI Technology
            </h3>
            <p>
              Global banking technology platforms were designed for Western financial markets —
              mature credit infrastructure, stable currencies, and uniform regulatory environments.
              Africa's banking sector operates in a fundamentally different context: 54 sovereign
              regulatory frameworks, 40+ currencies, mobile-first consumer behavior, high informal
              economy participation, and a massive unbanked population that requires alternative
              approaches to credit, identity, and payments.
            </p>

            <h3 className="font-heading text-lg font-bold text-foreground !mt-8">
              Key Banking Technology Trends Shaping Africa in 2026
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">Agentic AI in banking</strong> — Autonomous AI
                agents replacing manual banking workflows, from loan processing to compliance
                reporting
              </li>
              <li>
                <strong className="text-foreground">Embedded finance and Banking-as-a-Service</strong>{" "}
                — Banks as infrastructure providers powering fintech applications
              </li>
              <li>
                <strong className="text-foreground">CBDC readiness</strong> — African central banks
                piloting digital currencies for financial inclusion and cross-border settlement
              </li>
              <li>
                <strong className="text-foreground">Open banking expansion</strong> — API-driven
                ecosystems connecting banks, fintechs, and super-apps across African markets
              </li>
              <li>
                <strong className="text-foreground">AI fraud detection</strong> — Machine learning
                models combating mobile money fraud, account takeover, and synthetic identity attacks
              </li>
              <li>
                <strong className="text-foreground">Alternative data credit scoring</strong> — ML
                models unlocking credit access for Africa's 1 billion individuals with no formal
                credit history
              </li>
              <li>
                <strong className="text-foreground">Cloud-native core banking</strong> — Replacing
                legacy systems with composable, microservices-based architectures deployable in weeks
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SEOContentBlock;
