/* src/app/(workspace)/dashboard/page.js | Legacy /dashboard → /home redirect | Sree | 2026-06-27 */

import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/FxConstants";
/* - - - - - - - - - - - - - - - - */

// /dashboard is not a product route — send it to the recruiter home/workbench.
export default function DashboardRedirect() {
  redirect(ROUTES.workbench);
}
/* - - - - - - - - - - - - - - - - */
