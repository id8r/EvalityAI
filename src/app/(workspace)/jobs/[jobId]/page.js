/* src/app/(workspace)/jobs/[jobId]/page.js | Job Workspace route scaffold | Sree | 2026-06-27 */

export default async function JobWorkspacePage({ params }) {
  const { jobId } = await params;

  return (
    <div className="px-6 py-8 md:px-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Workspace · Job</p>
      <h1 className="mt-2 text-[28px] font-semibold leading-[34px] tracking-[-0.01em] text-foreground">Job Workspace</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Route scaffold for <span className="font-mono text-foreground">{jobId}</span>. Stage tabs, the Applications
        table, and the candidate sheet build here.
      </p>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
