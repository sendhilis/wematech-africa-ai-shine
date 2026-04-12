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
    const [contactsRes, demosRes] = await Promise.all([
      supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("demo_bookings").select("*").order("created_at", { ascending: false }),
    ]);
    setContacts(contactsRes.data ?? []);
    setDemos(demosRes.data ?? []);
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

        {/* Google Analytics Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Visitor Analytics & Demographics
            </CardTitle>
            <CardDescription>
              Connect Google Analytics to see live visitor statistics, demographics, and traffic sources.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-6 text-center space-y-3">
              <p className="text-muted-foreground">
                To view live visitor stats and demographics here, add your Google Analytics Measurement ID.
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>1. Go to <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics</a> → Admin → Data Streams</p>
                <p>2. Copy your Measurement ID (e.g. G-XXXXXXXXXX)</p>
                <p>3. Ask me to add the GA tracking script to your site</p>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Meanwhile, visit <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics Dashboard</a> or <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Search Console</a> for real-time stats.
              </p>
            </div>
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
