import { describe, it, expect, vi, beforeEach } from "vitest";
import { ownerEmailOptions } from "../../supabase/functions/send-contact-email/enquiry-policy";

const invoke = vi.hoisted(() => vi.fn());
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke } } }));
import { submitDemoEnquiry } from "@/lib/demo-enquiry";

const visitor = { name: "Demo Tester", email: "demo-test@example.com", organization: "Test", message: "Request follow-up" };
beforeEach(() => invoke.mockReset());
describe("demo enquiry rules", () => {
  it("sends only to info@katimoja.africa, not to the visitor", () => {
    expect(ownerEmailOptions(visitor.email)).toEqual({ to: ["info@katimoja.africa"], reply_to: "demo-test@example.com" });
  });
  it("submits a product enquiry without opening a live demo", async () => {
    const open = vi.spyOn(window, "open");
    invoke.mockResolvedValue({ data: { success: true }, error: null });
    await submitDemoEnquiry("BankBot", visitor);
    expect(invoke).toHaveBeenCalledWith("send-contact-email", { body: {
      firstName: "Demo Tester", lastName: "", email: "demo-test@example.com", organization: "Test",
      solutionInterest: "Demo enquiry: BankBot", message: "Request follow-up", storeSubmission: true,
    } });
    expect(open).not.toHaveBeenCalled();
    open.mockRestore();
  });
  it("does not acknowledge a failed send as success", async () => {
    invoke.mockResolvedValue({ data: null, error: new Error("Send failed") });
    await expect(submitDemoEnquiry("BankBot", visitor)).rejects.toThrow();
  });
});