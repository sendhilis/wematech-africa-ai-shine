import { useState, type FormEvent } from "react";
import { CheckCircle, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMO_ACKNOWLEDGEMENT, demoEnquirySchema, submitDemoEnquiry } from "@/lib/demo-enquiry";

export default function DemoEnquiryForm({ product }: { product: string }) {
  const [values, setValues] = useState({ name: "", email: "", organization: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = demoEnquirySchema.safeParse(values);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message || "Please check your details."); return; }
    setLoading(true);
    setError("");
    try { await submitDemoEnquiry(product, parsed.data); setSent(true); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Please try again."); }
    finally { setLoading(false); }
  }
  if (sent) return <div role="status" className="py-8 text-center space-y-4">
    <CheckCircle className="mx-auto h-10 w-10 text-accent" />
    <h3 className="font-heading text-xl font-semibold text-foreground">Thank you for reaching out</h3>
    <p className="text-muted-foreground leading-relaxed">{DEMO_ACKNOWLEDGEMENT}</p>
  </div>;
  return <form onSubmit={submit} className="space-y-4">
    {([['name', 'Full name', 'text', 100], ['email', 'Work email', 'email', 255], ['organization', 'Organisation', 'text', 200]] as const).map(([key, label, type, maxLength]) => <label key={key} className="block text-sm text-foreground space-y-1.5">
      <span>{label}{key !== 'organization' ? ' *' : ''}</span>
      <input name={key} type={type} required={key !== 'organization'} maxLength={maxLength} value={values[key]} onChange={e => setValues({ ...values, [key]: e.target.value })} className="w-full rounded-md bg-secondary border border-border px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
    </label>)}
    <label className="block text-sm text-foreground space-y-1.5"><span>Message</span>
      <textarea name="message" rows={3} maxLength={1000} value={values.message} onChange={e => setValues({ ...values, message: e.target.value })} className="w-full rounded-md bg-secondary border border-border px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
    </label>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Button type="submit" disabled={loading} className="w-full">{loading ? <Loader2 className="animate-spin" /> : <Send />} {loading ? 'Sending request…' : 'Send demo enquiry'}</Button>
  </form>;
}