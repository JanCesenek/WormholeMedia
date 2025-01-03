import { createClient } from "@supabase/supabase-js";

const supStorageURL = "https://jwylvnqdlbtbmxsencfu.supabase.co";

const supStorageKEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3eWx2bnFkbGJ0Ym14c2VuY2Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3Nzc1OTg5NSwiZXhwIjoxOTkzMzM1ODk1fQ.bYZxQ-4ElC3_PPNAbUIJV3VPpCCX9RQmpbx71O_JFrk";

const supabase = createClient(supStorageURL, supStorageKEY);

export default supabase;
