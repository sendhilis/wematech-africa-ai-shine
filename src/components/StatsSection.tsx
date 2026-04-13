const stats = [
  { value: "12+", label: "African Markets", description: "Pan-continental coverage" },
  { value: "10M+", label: "End Users", description: "Across deployments" },
  { value: "50+", label: "AI Features", description: "Intelligent automation" },
  { value: "<0.3s", label: "Avg Latency", description: "Real-time processing" },
  { value: "99.99%", label: "Uptime SLA", description: "Enterprise reliability" },
  { value: "40+", label: "Integrations", description: "Bureau, MNO & banks" },
];

const StatsSection = () => {
  return (
    <section id="stats" className="py-20 relative">
      <div className="section-container">
        <div className="glass-card glow-border p-6 sm:p-12 md:p-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-3xl md:text-4xl font-bold glow-text mb-2">
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-foreground mb-1">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
