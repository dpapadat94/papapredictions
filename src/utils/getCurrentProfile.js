import { supabase } from "../services/supabaseClient";

export async function getCurrentProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("No logged-in user found.");

  console.log("Current auth user:", user);

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id);

  console.log("Profiles query result:", data);

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("No profile found for this user.");
  }
  if (data.length > 1) {
    throw new Error("More than one profile found for this user.");
  }

  return data[0];
}
