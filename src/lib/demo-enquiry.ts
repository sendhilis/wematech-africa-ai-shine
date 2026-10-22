import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const demoEnquirySchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100),
  email: z.string().trim().email("Please enter a valid email address.").max(255),
  organization: z.string().trim().max(200),
  message: z.string().trim().max(1000),
});

export const DEMO_ACKNOWLEDGEMENT = "Thank you for your interest in Katimoja. Your request has been received, and our team will get back to you to discuss your requirements and arrange the next steps. We look forward to connecting with you.";

export async function submitDemoEnquiry(product: string, values: z.infer<typeof demoEnquirySchema>) {
  const details = demoEnquirySchema.parse(values);
  const { data, error } = await supabase.functions.invoke("send-contact-email", {
    body: {
      firstName: details.name,
      lastName: "",
      email: details.email,
      organization: details.organization,
      solutionInterest: `Demo enquiry: ${product}`,
      message: details.message || "Please contact me about this product.",
      storeSubmission: true,
    },
  });
  if (error || !data?.success) throw new Error("We couldn't send your request. Please try again or email info@katimoja.africa.");
}