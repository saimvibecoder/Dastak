import "server-only";
import { supabaseService } from "./supabase/admin";
// Sign-ups are closed. Accounts exist only for emails that an admin or an owner added.
export async function ensureAccount(email: string) {
  const { error } = await supabaseService().auth.admin.createUser({ email: email.trim().toLowerCase(), email_confirm: true });
  if (error && !/already|registered|exists/i.test(error.message)) throw new Error(error.message);
}
