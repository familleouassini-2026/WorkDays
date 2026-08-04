import { createClient } from "@/lib/supabase/client";

export interface OrganisationInfo {
  name: string;
  logo_base64: string | null;
}

export async function getOrganisation(): Promise<OrganisationInfo | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("organisations")
    .select("name, logo_base64")
    .limit(1)
    .single();
  return data;
}
