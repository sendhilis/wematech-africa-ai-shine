import { MessageCircle } from "lucide-react";

export const WHATSAPP_NUMBER = "254722154827";
export const WHATSAPP_NUMBER_DISPLAY = "+254 722 154 827";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

interface WhatsAppCtaProps {
  className?: string;
  label?: string;
}

const WhatsAppCta = ({ className = "", label = "WhatsApp Us" }: WhatsAppCtaProps) => (
  <a
    href={WHATSAPP_LINK}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`Chat with Katimoja on WhatsApp at ${WHATSAPP_NUMBER_DISPLAY}`}
    className={className}
  >
    <MessageCircle size={16} />
    <span>{label}</span>
  </a>
);

export default WhatsAppCta;
