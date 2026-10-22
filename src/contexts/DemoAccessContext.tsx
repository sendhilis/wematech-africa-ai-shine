import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import DemoEnquiryForm from "@/components/DemoEnquiryForm";

const DemoAccessContext = createContext<{ requestDemoAccess: (product: string) => void }>({ requestDemoAccess: () => {} });
export const useDemoAccess = () => useContext(DemoAccessContext);

export const DemoAccessProvider = ({ children }: { children: ReactNode }) => {
  const [product, setProduct] = useState<string | null>(null);
  const requestDemoAccess = useCallback((name: string) => setProduct(name), []);
  return <DemoAccessContext.Provider value={{ requestDemoAccess }}>
    {children}
    <Dialog open={product !== null} onOpenChange={open => { if (!open) setProduct(null); }}>
      <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto w-[calc(100%-2rem)]">
        <DialogHeader>
          <DialogTitle>Request a demo</DialogTitle>
          <DialogDescription>{product}</DialogDescription>
        </DialogHeader>
        {product && <DemoEnquiryForm key={product} product={product} />}
      </DialogContent>
    </Dialog>
  </DemoAccessContext.Provider>;
};
