# Target Roofing website maintenance

Verified source/hosting observation: October 21, 2026.

## Current location

- User entry: https://targetroofers.com
- Hosting: Vercel project `targetroofing` in the Target Roofing team.
- Recovered Vercel deployment: `dpl_4TNoqLatb6HBpeUAb29hQiqgkvLN`.
- Repository: `target-roofing/target-roofing-scaffold`.

## Operating boundaries

The public website is an independent application. It routes Office, Radar, Marketing and the older Commissions port to other deployments. Office routes `/office/administration` back into this application's `/admin` console. The complete internal Office source does not belong in this public repository.

The website's configured origins are `target-roofing-office-google.vercel.app`, `roof-radar-google.vercel.app`, `target-marketing-google.vercel.app` and `target-commissions-google.vercel.app`. Credentials remain in hosted environment settings. Inspect `config/company-tool-routes.mjs` when tracing routes.

This repository has a Vercel Git connection. A default-branch merge may deploy production, so the source reconciliation is supplied as a separate review branch/PR. Existing PRs #20/#21 represent pending work and were not merged as part of the snapshot.

For changes, use a branch and preview, run the existing routing/form/security checks, and confirm lead persistence and actual recipient delivery separately. A source update does not establish delivery. Preserve the existing lead-save-before-notification order.

Recover the matching application version through Vercel deployment history. Database records, mailbox delivery state and hosted secrets require their own recovery procedures; GitHub source is not their backup.

## Source reconciliation

The synchronized application files were matched byte-for-byte to Vercel's deployed source-file hashes. Existing GitHub files that were absent from the deployment were preserved. No application deployment, account permission, database migration, integration activation, message or financial action was performed.

Generated files, private datasets, hosted environment values and credential files are excluded. The source manifest records included application-file hashes; it is not a customer-data export or a complete runtime backup. Historical plans and pending branches remain separate from deployed behavior.

The QuickBooks Windows companion is an intentional supported dependency of the separate QuickBooks integration. This source maintenance task does not replace it or change that setup.
