import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
const env = Object.fromEntries(
  readFileSync(".env.local","utf8").split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(),l.slice(i+1).trim()];})
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});
const NEW = "https://ik.imagekit.io/9mrgsv2rp/ChatGPT%20Image%20Jun%2024,%202026,%2006_57_31%20PM.png";
const { error } = await sb.from("hammerex_guides").update({ hero_image_url: NEW }).eq("slug","k11-drywall-tool-station-buyers-guide");
if (error) throw error;
console.log("✓ K11 guide hero set to new ImageKit URL");
