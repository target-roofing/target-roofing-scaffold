# Website form routing

The server saves the submission before attempting the email notification. A saved
lead ID establishes storage success. `notified: true` means SMTP accepted every
notification recipient; it does not prove inbox delivery or a successful reply.

| Form | Default notification recipient | Reply-To | Saved table |
| --- | --- | --- | --- |
| Contact Us | service@targetroofers.com | Customer email; office if absent | leads |
| Free Estimate | projects@targetroofers.com | Customer email; office if absent | leads |
| Softwash | service@targetroofers.com | Customer email; office if absent | leads |
| Roof Cleaning Estimate | projects@targetroofers.com | Customer email; office if absent | leads |
| Chatbot | projects@targetroofers.com; Service category uses service@targetroofers.com | Customer email | leads |
| Prospect Intake | Assigned salesperson plus projects@targetroofers.com | admin@targetroofers.com | prospect_intakes |

Free Estimate links use `/contact?service=free-estimate`. Selecting Free Estimate
on Contact Us also selects the estimate route. Other Contact Us submissions use
the service route. Estimate forms embedded on other pages already use the
estimate route.

Explicit repair/emergency selections (`repairs`, `roof-repair`, and
`emergency-storm-repair`) notify Service even when submitted through an estimate
form. The original form identity and subject are retained. Chatbot lead markers
use `requestType: "service"` for repair/leak/emergency requests and `"estimate"`
otherwise. The server recognizes only `"service"`; missing or unknown values
retain the existing projects route. Routing recognizes a bounded structured
category, not email addresses or loose words in the customer's issue.

`/roof-cleaning-system` redirects to `/softwash?request=roof-cleaning`. Its Schedule
Today link stays on that page's quote form, retaining the query. Roof Cleaning and
Softwash retain their identities in the saved service/message and notification.
Both use the existing `softwash` database form type; no schema migration is needed.

Prospect Intake retains its creator as provenance and routes to the assigned
salesperson. The office copy defaults to projects@ based on the existing office
route. Confirm that mailbox with the office before production acceptance. The
Intake reply default preserves the office reply behavior described in the handoff;
public inquiry notifications reply to the customer. This change does not add a
customer acknowledgment email.

## Configuration

Existing SMTP settings remain in use: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
`SMTP_PASS`, and `NOTIFY_FROM`. Configure these in the deployment's secret/settings
interface; never commit credentials. A sending-provider change is not required
by this patch.

Recipient overrides remain available through `CONTACT_NOTIFY_TO`, `LEAD_NOTIFY_TO`,
and `SOFTWASH_NOTIFY_TO`. `INTAKE_NOTIFY_TO` overrides the office copy, and
`INTAKE_REPLY_TO` overrides Intake's reply address. Lists support comma-separated
addresses and remove duplicates. Check production overrides: an old nonempty
value takes precedence over the defaults above.

## Validation and release

Run `node --test form-tests/*.test.mjs security-tests/*.test.mjs seo-tests/*.test.mjs scripts/*.test.mjs`,
`npx tsc --noEmit --incremental false`, and `npm run build` on the feature branch.
The standalone type check is required because the existing build configuration
skips type errors. Local routing tests mock the model, database and mail provider.
Keep the production branch unchanged until review and acceptance.

On a reviewed preview or controlled production test, use a unique TEST label and
an authorized customer test inbox. For each of the six routes, including both
Service and estimate categories on embedded forms and the chatbot:

1. Submit through its actual page/link and record the returned saved ID.
2. Find that exact ID in the company Supabase project, including form identity.
3. Confirm the intended inbox received the notification, including both Intake
   recipients. Check spam/quarantine when appropriate.
4. Verify the sender and Reply-To in the received message. Test Reply from the
   recipient inbox and confirm the expected customer/office destination.
5. Check deployment logs for save or notification failures. A thank-you page
   alone does not establish email delivery.

Local tests use mocks/test recorders and do not complete those production checks.
If a notification fails, the saved lead is retained; this patch does not introduce
an automatic retry queue. Staff must follow up on failures found in logs/data.

ProLine broadcasting domain authentication is a separate SendGrid/DNS setup. It
is not changed by these website form fixes.
