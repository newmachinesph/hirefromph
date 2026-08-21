import type { Metadata } from "next";
import type { ReactNode } from "react";
import { HIDE_SITE_CHROME } from "@/components/kit/chrome";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function KitLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HIDE_SITE_CHROME }} />
      <div data-kit className="kit">
        {children}
      </div>
    </>
  );
}
