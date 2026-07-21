import { createServerFn } from "@tanstack/react-start";

export type SiteSettings = {
  header_logo_url: string;
  footer_logo_url: string;
  home_promo_url: string;
};

export const getSiteSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteSettings> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("site_settings").select("key, value");
    const map: Record<string, string> = {};
    (data ?? []).forEach((r: { key: string; value: string | null }) => {
      map[r.key] = r.value ?? "";
    });
    return {
      header_logo_url: map["header_logo_url"] ?? "",
      footer_logo_url: map["footer_logo_url"] ?? "",
      home_promo_url: map["home_promo_url"] ?? "",
    };
  },
);