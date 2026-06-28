/* src/app/(workspace)/settings/sections.js | Settings section catalog (shared by nav + banner + content) | Sree | 2026-06-28 */

import { BriefcaseBusiness, Building2, CalendarDays, CreditCard, Globe, ListChecks, Mail, User } from "lucide-react";
/* - - - - - - - - - - - - - - - - */

// Single source for the settings IA — the nav, the setup banner, and (later) the section content all read this.
export const SETTINGS_SECTIONS = [
  { id: "profile", label: "Profile", description: "Your personal account details", icon: User },
  { id: "organization", label: "Organization", description: "Company identity and branding", icon: Building2 },
  { id: "career-page", label: "Career Page", description: "Public application and branding", icon: Globe },
  { id: "recruiting-status", label: "Recruiting Status", description: "Who you hire for by default", icon: BriefcaseBusiness },
  { id: "screening", label: "Screening Mode", description: "Default screening path for new roles", icon: ListChecks },
  { id: "email", label: "Email", description: "Connected mailboxes and defaults", icon: Mail },
  { id: "calendar", label: "Calendar", description: "Scheduling and availability", icon: CalendarDays },
  { id: "billing", label: "Billing & Credits", description: "Plan, usage, and invoices", icon: CreditCard },
];
/* - - - - - - - - - - - - - - - - */
