import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LogOut, Users, CalendarDays, Mail, Building2, BarChart3, RefreshCw } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type ContactSubmission = Tables<"contact_submissions">;
type DemoBooking = Tables<"demo_bookings">;

// Paste your Looker Studio embed URL here once created
const LOOKER_STUDIO_EMBED_URL = "";

const AdminDashboard = () => {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [demos, setDemos] = useState<DemoBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }
      setUser(session.user.email ?? null);
      fetchData();
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate("/admin/login");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-data");
      if (error) throw error;
      setContacts(data?.contacts ?? []);
      setDemos(data?.demos ?? []);
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground font-heading">Wematech Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">{user}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard icon={<Users className="h-5 w-5" />} title="Total Leads" value={contacts.length + demos.length} />
          <StatsCard icon={<Mail className="h-5 w-5" />} title="Contact Submissions" value={contacts.length} />
          <StatsCard icon={<CalendarDays className="h-5 w-5" />} title="Demo Bookings" value={demos.length} />
          <StatsCard icon={<Building2 className="h-5 w-5" />} title="Organizations" value={new Set([...contacts.map(c => c.organization), ...demos.map(d => d.organization)].filter(Boolean)).size} />
        </div>

        {/* Data Tables */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Lead Management</h2>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        <Tabs defaultValue="contacts" className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="contacts" className="flex-1 sm:flex-initial">
              Contact Submissions ({contacts.length})
            </TabsTrigger>
            <TabsTrigger value="demos" className="flex-1 sm:flex-initial">
              Demo Bookings ({demos.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>Contact Form Submissions</CardTitle>
                <CardDescription>All enquiries submitted through the contact form</CardDescription>
              </CardHeader>
              <CardContent>
                {contacts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No contact submissions yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Organization</TableHead>
                          <TableHead>Interest</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contacts.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium whitespace-nowrap">{c.first_name} {c.last_name}</TableCell>
                            <TableCell>
                              <a href={`mailto:${c.email}`} className="text-primary hover:underline">{c.email}</a>
                            </TableCell>
                            <TableCell>{c.organization || "—"}</TableCell>
                            <TableCell>
                              {c.solution_interest ? <Badge variant="secondary">{c.solution_interest}</Badge> : "—"}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{c.message || "—"}</TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground text-sm">{formatDate(c.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demos">
            <Card>
              <CardHeader>
                <CardTitle>Demo Booking Requests</CardTitle>
                <CardDescription>All demo sessions booked through the website</CardDescription>
              </CardHeader>
              <CardContent>
                {demos.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No demo bookings yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Organization</TableHead>
                          <TableHead>Demo Date</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Submitted</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {demos.map((d) => (
                          <TableRow key={d.id}>
                            <TableCell className="font-medium whitespace-nowrap">{d.name}</TableCell>
                            <TableCell>
                              <a href={`mailto:${d.email}`} className="text-primary hover:underline">{d.email}</a>
                            </TableCell>
                            <TableCell>{d.organization || "—"}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{new Date(d.demo_date).toLocaleDateString()}</Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{d.message || "—"}</TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground text-sm">{formatDate(d.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Google Analytics — Looker Studio Embed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Visitor Analytics & Demographics
            </CardTitle>
            <CardDescription>
              Live visitor statistics from Google Analytics via Looker Studio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Replace the src below with your Looker Studio embed URL */}
            {LOOKER_STUDIO_EMBED_URL ? (
              <div className="w-full rounded-lg overflow-hidden border border-border" style={{ aspectRatio: "16/9" }}>
                <iframe
                  src={LOOKER_STUDIO_EMBED_URL}
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                  sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                  title="Visitor Analytics"
                />
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/30 p-6 text-center space-y-3">
                <p className="text-muted-foreground font-medium">Set up your Looker Studio embed</p>
                <div className="text-sm text-muted-foreground space-y-1 text-left max-w-lg mx-auto">
                  <p>1. Open <a href="https://lookerstudio.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Looker Studio</a> and create a new report</p>
                  <p>2. Add <strong>Google Analytics</strong> as a data source → select property <code className="bg-muted px-1 rounded text-xs">G-0YTLQV3CYW</code></p>
                  <p>3. Add charts you want (sessions, users, demographics, traffic sources)</p>
                  <p>4. Click <strong>File → Embed report</strong> → copy the embed URL</p>
                  <p>5. Ask me to paste the embed URL into the admin dashboard</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">Open Google Analytics</Button>
                  </a>
                  <a href="https://lookerstudio.google.com" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">Open Looker Studio</Button>
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const StatsCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: number }) => (
  <Card>
    <CardContent className="flex items-center gap-4 p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </CardContent>
  </Card>
);

export default AdminDashboard;
