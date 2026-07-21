import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSiteSettings, type SiteSettings } from "@/lib/settings.functions";

const empty: SiteSettings = {
  header_logo_url: "",
  footer_logo_url: "",
  home_promo_url: "",
};

export function useSiteSettings(): SiteSettings {
  const fetcher = useServerFn(getSiteSettings);
  const { data } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => fetcher(),
    staleTime: 60_000,
  });
  return data ?? empty;
}