export const ENQUIRY_RECIPIENTS = ["info@katimoja.africa"];
export function ownerEmailOptions(replyTo: string) {
  return { to: [...ENQUIRY_RECIPIENTS], reply_to: replyTo };
}