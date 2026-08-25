import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Activity, AlertTriangle, BarChart3, Banknote, Building2, CalendarDays,
  CheckCircle2, ClipboardCheck, Clock3, Database, Download, ExternalLink,
  FileText, Inbox, LayoutDashboard, Loader2, LogOut, Mail, Phone, PlayCircle,
  Plus, RefreshCw, Search, Settings, ShieldCheck, Target, Upload, UserCog,
  Users, X, Zap,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { useAuth } from "@/lib/AuthContext";
import {
  calendarIcs, csvEscape, csvRows, downloadFile, googleCalendarUrl, pipelineApi,
} from "@/pipeline/api";
import "@/pipeline/pipeline.css";

const prettify = (value) => String(value || "").replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
const formatMoney = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value || 0));
const dateLabel = (value) => value ? new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: String(value).includes("T") ? "short" : undefined }) : "—";
const percent = (value, total) => total ? Math.min(100, Math.round((value / total) * 100)) : 0;
const merge = (text, values) => Object.entries(values).reduce(
  (output, [key, value]) => output.replaceAll("{{" + key + "}}", value || ""),
  String(text || ""),
);

const NAV = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["inbox", "Work inbox", Inbox],
  ["prospects", "MooreTech prospects", Target, "owner"],
  ["campaigns", "Campaigns", Zap],
  ["onboarding", "Client onboarding", ClipboardCheck],
  ["accounts", "Target accounts", Building2],
  ["outreach", "Outreach queue", Phone, "internal"],
  ["appointments", "Appointments", CalendarDays],
  ["reports", "Reports", BarChart3],
  ["billing", "Billing", Banknote, "billing"],
  ["demo", "Demo simulator", PlayCircle, "owner_or_demo"],
  ["settings", "Settings & setup", Settings, "owner"],
  ["users", "Users & access", UserCog, "owner"],
  ["audit", "Audit log", ShieldCheck, "owner"],
];

const VIEW_COPY = {
  dashboard: ["Pipeline dashboard", "See the work that moves research into qualified appointments."],
  inbox: ["Unified work inbox", "Every item has a clear next action."],
  prospects: ["MooreTech sales prospects", "Sell the free sample and founding-client pilot."],
  campaigns: ["Campaign control", "Keep each campaign narrow: one service, one territory, one outcome path."],
  onboarding: ["Client onboarding", "Nine short steps; progress saves whenever the user advances."],
  accounts: ["Target accounts", "Research manually, import CSV files, check duplicates, and obtain client approval."],
  outreach: ["Campaign work queue", "Human-reviewed email drafts, click-to-call, and manual activity logging only."],
  appointments: ["Qualified appointments", "Schedule, confirm, record outcomes, and create held-appointment fees once."],
  reports: ["Campaign reports", "Show the complete funnel and business outcomes—not vanity metrics alone."],
  billing: ["Manual billing", "Pilot and held-appointment invoices work before Stripe is connected."],
  demo: ["Safe demo simulator", "Fictional data only. External communication and payment actions stay disabled."],
  settings: ["Administrator setup", "Business details, pricing, compliance, templates, and manual fallbacks."],
  users: ["Users and tenant access", "Invite users and assign the correct organization-scoped role."],
  audit: ["Audit trail", "Review creations, edits, status changes, approvals, outcomes, billing, invites, and exports."],
};

function Status({ children, tone = "" }) {
  return <span className={"pipeline-status " + tone}>{prettify(children)}</span>;
}

function PageHead({ view, actions }) {
  const copy = VIEW_COPY[view] || VIEW_COPY.dashboard;
  return (
    <div className="pipeline-page-head">
      <div>
        <p className="pipeline-kicker">MooreTech Commercial Pipeline</p>
        <h1>{copy[0]}</h1>
        <p>{copy[1]}</p>
      </div>
      {actions ? <div className="pipeline-actions">{actions}</div> : null}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="pipeline-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Field({ label, wide = false, children }) {
  return (
    <div className={"pipeline-field " + (wide ? "wide" : "")}>
      <label>{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="pipeline-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) onClose();
    }}>
      <section className="pipeline-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="pipeline-modal-head">
          <div>
            <p className="pipeline-kicker">Manual workflow</p>
            <h2>{title}</h2>
          </div>
          <button type="button" className="pipeline-icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function Empty({ children }) {
  return <div className="pipeline-empty">{children}</div>;
}

function SelectCampaign({ campaigns, value, onChange, includeSamples = true }) {
  const options = includeSamples ? campaigns : campaigns.filter((campaign) => campaign.campaign_type !== "sample");
  return (
    <select className="pipeline-filter" value={value || ""} onChange={(event) => onChange(event.target.value)}>
      <option value="">Select a campaign</option>
      {options.map((campaign) => (
        <option value={campaign.id} key={campaign.id}>
          {campaign.campaign_name}{campaign.is_demo ? " [FICTIONAL]" : ""}
        </option>
      ))}
    </select>
  );
}

function LoginRequired() {
  return (
    <div className="pipeline-root pipeline-auth">
      <div className="pipeline-auth-panel">
        <p className="pipeline-kicker">Restricted operations console</p>
        <h1>Sign in to MooreTech Commercial Pipeline</h1>
        <p>Owner, campaign staff, and client users enter through the same secure login. Data is filtered by role, assignment, and client organization.</p>
        <Link className="pipeline-login-link" to={"/login?returnTo=" + encodeURIComponent("/pipeline/dashboard")}>
          Sign in
        </Link>
      </div>
    </div>
  );
}

function DashboardView({ data, navigate, demoRole }) {
  const isClient = data.user.role === "client_admin" || data.user.role === "client_viewer" || demoRole === "client";
  const activeCampaigns = data.campaigns.filter((campaign) => !["completed", "cancelled"].includes(campaign.campaign_status));
  const openTasks = data.tasks.filter((task) => task.status === "open");
  const pendingAccounts = data.target_accounts.filter((account) => account.client_approval_status === "pending_review");
  const upcoming = data.appointments.filter((appointment) => ["scheduled", "confirmed"].includes(appointment.outcome));
  const unpaid = data.billing.filter((record) => ["unpaid", "overdue"].includes(record.payment_status));
  const held = data.appointments.filter((appointment) => appointment.outcome === "held").length;
  const wins = data.appointments.filter((appointment) => appointment.outcome === "won").length;
  const collected = data.billing.filter((record) => record.payment_status === "paid").reduce((sum, record) => sum + Number(record.amount || 0), 0);
  const funnel = [
    ["Accounts", data.target_accounts.length],
    ["Approved", data.target_accounts.filter((record) => record.client_approval_status === "approved").length],
    ["Contacts", data.contacts.length],
    ["Conversations", data.activities.filter((record) => ["call_connected", "email_received"].includes(record.activity_type)).length],
    ["Meetings", data.appointments.length],
    ["Held", held],
    ["Won", wins],
  ];
  const max = Math.max(1, ...funnel.map((row) => row[1]));

  return (
    <>
      <PageHead view="dashboard" />
      {demoRole ? (
        <div className="pipeline-banner">
          <span><strong>Demo role:</strong> {prettify(demoRole)}. Only fictional records are shown.</span>
          <button className="pipeline-button ghost" onClick={() => navigate("/pipeline/demo")}>Exit or switch demo</button>
        </div>
      ) : null}
      <div className="pipeline-grid metrics">
        {isClient ? (
          <>
            <Metric label="Campaigns" value={activeCampaigns.length} />
            <Metric label="Targets approved" value={data.target_accounts.filter((record) => record.client_approval_status === "approved").length} />
            <Metric label="Upcoming appointments" value={upcoming.length} />
            <Metric label="Reports available" value={data.reports.length} />
            <Metric label="Meetings held" value={held} />
            <Metric label="Proposals" value={data.appointments.filter((record) => record.outcome === "proposal_sent").length} />
            <Metric label="Wins reported" value={wins} />
            <Metric label="Open invoices" value={unpaid.length} />
          </>
        ) : (
          <>
            <Metric label="New sales prospects" value={data.prospects.filter((record) => record.sales_stage === "new").length} />
            <Metric label="Free samples requested" value={data.prospects.filter((record) => record.free_sample_status === "requested").length} />
            <Metric label="Active clients" value={data.organizations.filter((record) => record.organization_type === "client" && record.status === "active").length} />
            <Metric label="Active campaigns" value={activeCampaigns.length} />
            <Metric label="Accounts awaiting approval" value={pendingAccounts.length} />
            <Metric label="Tasks due/open" value={openTasks.length} />
            <Metric label="Appointments to confirm" value={upcoming.filter((record) => record.confirmation_status === "unconfirmed").length} />
            <Metric label="Revenue collected" value={formatMoney(collected)} />
          </>
        )}
      </div>

      <div className="pipeline-grid two" style={{ marginTop: 18 }}>
        <section className="pipeline-panel">
          <h2>Campaign conversion funnel</h2>
          <div className="pipeline-funnel">
            {funnel.map(([label, count]) => (
              <div className="pipeline-funnel-row" key={label}>
                <span>{label}</span>
                <div className="pipeline-funnel-bar"><span style={{ width: percent(count, max) + "%" }} /></div>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </section>
        <section className="pipeline-panel">
          <h2>Needs attention</h2>
          <ul className="pipeline-list">
            {pendingAccounts.length ? (
              <li className="pipeline-list-item">
                <div><strong>{pendingAccounts.length} target accounts need approval</strong><span>Only approved targets can enter outreach.</span></div>
                <button className="pipeline-button secondary" onClick={() => navigate("/pipeline/accounts")}>Review</button>
              </li>
            ) : null}
            {openTasks.slice(0, 4).map((task) => (
              <li className="pipeline-list-item" key={task.id}>
                <div><strong>{task.title || prettify(task.task_type)}</strong><span>{dateLabel(task.due_date)}</span></div>
                <button className="pipeline-button secondary" onClick={() => navigate(task.action_path || "/pipeline/inbox")}>{task.action_label || "Open"}</button>
              </li>
            ))}
            {!pendingAccounts.length && !openTasks.length ? <li><Empty>No urgent work is waiting.</Empty></li> : null}
          </ul>
        </section>
      </div>
    </>
  );
}

function buildInbox(data) {
  const items = data.tasks.filter((task) => task.status === "open").map((task) => ({
    id: "task-" + task.id,
    title: task.title || prettify(task.task_type),
    detail: task.notes || dateLabel(task.due_date),
    priority: task.priority,
    path: task.action_path || "/pipeline/inbox",
    action: task.action_label || "Open",
    task,
  }));
  const pending = data.target_accounts.filter((record) => record.client_approval_status === "pending_review");
  if (pending.length) items.push({
    id: "pending-accounts",
    title: pending.length + " target accounts need client review",
    detail: "Approve, reject, or mark exclusions before outreach.",
    priority: "high",
    path: "/pipeline/accounts",
    action: "Review targets",
  });
  const confirmations = data.appointments.filter((record) => ["scheduled", "confirmed"].includes(record.outcome) && record.confirmation_status === "unconfirmed");
  if (confirmations.length) items.push({
    id: "confirmations",
    title: confirmations.length + " appointments need confirmation",
    detail: "Open each meeting and prepare the confirmation draft.",
    priority: "high",
    path: "/pipeline/appointments",
    action: "Confirm",
  });
  const todayKey = new Date().toISOString().slice(0, 10);
  const missingOutcomes = data.appointments.filter((record) => record.date < todayKey && ["scheduled", "confirmed"].includes(record.outcome));
  if (missingOutcomes.length) items.push({
    id: "missing-outcomes",
    title: missingOutcomes.length + " appointment outcomes are missing",
    detail: "Record held, no-show, rescheduled, disqualified, proposal, won, or lost.",
    priority: "urgent",
    path: "/pipeline/appointments",
    action: "Record outcomes",
  });
  const readyReports = data.reports.filter((record) => record.client_visible_status === "ready_for_review");
  if (readyReports.length) items.push({
    id: "reports-ready",
    title: readyReports.length + " reports are ready for review",
    detail: "Publish when the totals and recommendations are correct.",
    priority: "medium",
    path: "/pipeline/reports",
    action: "Review reports",
  });
  const overdue = data.billing.filter((record) => ["unpaid", "overdue"].includes(record.payment_status) && record.due_date < todayKey);
  if (overdue.length) items.push({
    id: "invoices-overdue",
    title: overdue.length + " invoices are overdue",
    detail: "Manual payment recording remains available without Stripe.",
    priority: "urgent",
    path: "/pipeline/billing",
    action: "Open billing",
  });
  return items;
}

function InboxView({ data, run, navigate, busy }) {
  const items = buildInbox(data);
  return (
    <>
      <PageHead view="inbox" actions={
        <button className="pipeline-button secondary" onClick={() => window.location.reload()}><RefreshCw size={16} /> Refresh</button>
      } />
      <section className="pipeline-panel">
        {items.length ? (
          <ul className="pipeline-list">
            {items.map((item) => (
              <li className="pipeline-list-item" key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                  <Status tone={item.priority === "urgent" ? "bad" : item.priority === "high" ? "warn" : ""}>{item.priority}</Status>
                </div>
                <div className="pipeline-actions">
                  <button className="pipeline-button secondary" onClick={() => navigate(item.path)}>{item.action}</button>
                  {item.task ? (
                    <button className="pipeline-button ghost" disabled={busy} onClick={() => run("task_status", { task_id: item.task.id, status: "completed" }, "Task completed.")}>
                      <CheckCircle2 size={16} /> Complete
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : <Empty>The inbox is clear.</Empty>}
      </section>
    </>
  );
}

function samplePdf(prospect, campaign, accounts, onExport) {
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text("MooreTech Commercial Pipeline", 16, 20);
  doc.setFontSize(14);
  doc.text("Preliminary 10-Account Sample", 16, 31);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Prepared for: " + prospect.company, 16, 41);
  doc.text("Target territory: " + (campaign.territory || "As discussed"), 16, 47);
  doc.setTextColor(70);
  const disclaimer = "Preliminary research using publicly available business information. This sample does not include outreach and does not guarantee sales, contracts, proposals, revenue, or return on investment.";
  doc.text(doc.splitTextToSize(disclaimer, 178), 16, 57);
  let y = 73;
  accounts.slice(0, 10).forEach((account, index) => {
    if (y > 258) {
      doc.addPage();
      y = 20;
    }
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(String(index + 1) + ". " + account.company_name, 16, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60);
    doc.text("Type: " + (account.facility_type || account.industry || "Commercial business"), 21, y + 6);
    const fit = doc.splitTextToSize("Why it may fit: " + (account.reason_for_fit || "Matches the requested account profile."), 170);
    doc.text(fit, 21, y + 12);
    const contact = [account.public_email, account.phone, account.website].filter(Boolean).join(" | ");
    doc.text(doc.splitTextToSize("Public contact: " + (contact || "Not identified in preliminary research"), 170), 21, y + 18 + (fit.length - 1) * 5);
    y += 34 + (fit.length - 1) * 5;
  });
  doc.save("MooreTech-" + prospect.company.replace(/[^a-z0-9]+/gi, "-") + "-sample.pdf");
  onExport?.();
}

function ProspectsView({ data, run, busy }) {
  const [formOpen, setFormOpen] = useState(false);
  const [convert, setConvert] = useState(null);
  const [form, setForm] = useState({ company: "", industry: "Commercial cleaning and janitorial", sales_stage: "new", estimated_fit: "unknown", preferred_contact_method: "email" });
  const prospects = data.prospects;

  const save = async (event) => {
    event.preventDefault();
    const result = await run("save_prospect", { prospect: form }, "Prospect saved.");
    if (result) {
      setFormOpen(false);
      setForm({ company: "", industry: "Commercial cleaning and janitorial", sales_stage: "new", estimated_fit: "unknown", preferred_contact_method: "email" });
    }
  };

  return (
    <>
      <PageHead view="prospects" actions={
        <button className="pipeline-button" onClick={() => setFormOpen(true)}><Plus size={16} /> Add prospect</button>
      } />
      <section className="pipeline-panel">
        {prospects.length ? (
          <div className="pipeline-table-wrap">
            <table className="pipeline-table">
              <thead><tr><th>Company</th><th>Decision-maker</th><th>Fit</th><th>Stage</th><th>Next follow-up</th><th>Actions</th></tr></thead>
              <tbody>
                {prospects.map((prospect) => {
                  const sampleCampaign = data.campaigns.find((campaign) => campaign.sales_prospect_id === prospect.id && campaign.campaign_type === "sample");
                  const sampleAccounts = sampleCampaign ? data.target_accounts.filter((account) => account.campaign_id === sampleCampaign.id) : [];
                  return (
                    <tr key={prospect.id}>
                      <td><strong>{prospect.company}</strong><small>{prospect.city}{prospect.city && prospect.state ? ", " : ""}{prospect.state}</small></td>
                      <td>{prospect.owner_or_decision_maker || "Research needed"}<small>{prospect.email || prospect.phone}</small></td>
                      <td><Status tone={prospect.estimated_fit === "high" ? "good" : ""}>{prospect.estimated_fit}</Status></td>
                      <td><Status>{prospect.sales_stage}</Status></td>
                      <td>{dateLabel(prospect.next_follow_up)}</td>
                      <td>
                        <div className="pipeline-actions">
                          {!sampleCampaign ? (
                            <button className="pipeline-button secondary" disabled={busy} onClick={() => run("create_sample", { prospect_id: prospect.id }, "Sample project created.")}>Create sample</button>
                          ) : (
                            <button className="pipeline-button secondary" disabled={!sampleAccounts.length} onClick={() => samplePdf(prospect, sampleCampaign, sampleAccounts, () => run("export_log", {
                              entity_type: "Campaign", record_id: sampleCampaign.id, description: "Exported public-facing free sample PDF.",
                            }, "", false))}><Download size={15} /> Sample PDF ({sampleAccounts.length})</button>
                          )}
                          {!prospect.converted_organization_id ? (
                            <button className="pipeline-button ghost" onClick={() => setConvert(prospect)}>Convert</button>
                          ) : <Status tone="good">Client created</Status>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <Empty>No MooreTech sales prospects yet. Public lead-generation form submissions will appear here.</Empty>}
      </section>

      {formOpen ? (
        <Modal title="Add MooreTech sales prospect" onClose={() => setFormOpen(false)}>
          <form onSubmit={save}>
            <div className="pipeline-fields">
              <Field label="Company"><input required value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} /></Field>
              <Field label="Decision-maker"><input value={form.owner_or_decision_maker || ""} onChange={(event) => setForm({ ...form, owner_or_decision_maker: event.target.value })} /></Field>
              <Field label="Business email"><input type="email" value={form.email || ""} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
              <Field label="Phone"><input value={form.phone || ""} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
              <Field label="City"><input value={form.city || ""} onChange={(event) => setForm({ ...form, city: event.target.value })} /></Field>
              <Field label="State"><input value={form.state || ""} onChange={(event) => setForm({ ...form, state: event.target.value })} /></Field>
              <Field label="Website"><input value={form.website || ""} onChange={(event) => setForm({ ...form, website: event.target.value })} /></Field>
              <Field label="Estimated fit">
                <select value={form.estimated_fit} onChange={(event) => setForm({ ...form, estimated_fit: event.target.value })}>
                  {["unknown", "high", "medium", "low"].map((value) => <option value={value} key={value}>{prettify(value)}</option>)}
                </select>
              </Field>
              <Field label="Personalized observation" wide><textarea value={form.personalized_observation || ""} onChange={(event) => setForm({ ...form, personalized_observation: event.target.value })} /></Field>
              <Field label="Notes" wide><textarea value={form.notes || ""} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></Field>
            </div>
            <div className="pipeline-actions" style={{ marginTop: 18 }}>
              <button className="pipeline-button" disabled={busy}>Save prospect</button>
              <button type="button" className="pipeline-button secondary" onClick={() => setFormOpen(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      ) : null}

      {convert ? (
        <Modal title={"Convert " + convert.company + " to a client"} onClose={() => setConvert(null)}>
          <div className="pipeline-alert">
            This creates a client organization, onboarding profile, 14-day Founding Client Pilot, $300 pilot invoice, and two inbox tasks. Review before confirming.
          </div>
          <div className="pipeline-fields" style={{ marginTop: 16 }}>
            <Field label="Client administrator email" wide>
              <input type="email" value={convert.client_admin_email || convert.email || ""} onChange={(event) => setConvert({ ...convert, client_admin_email: event.target.value })} />
            </Field>
          </div>
          <div className="pipeline-actions" style={{ marginTop: 18 }}>
            <button className="pipeline-button" disabled={busy} onClick={async () => {
              const result = await run("convert_prospect", {
                prospect_id: convert.id,
                client_admin_email: convert.client_admin_email || convert.email,
                confirmed: true,
              }, "Client, campaign, onboarding, and invoice created.");
              if (result) setConvert(null);
            }}>Confirm conversion</button>
            <button className="pipeline-button secondary" onClick={() => setConvert(null)}>Cancel</button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

function CampaignsView({ data, run, busy, canOwner }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ campaign_status: "draft", campaign_type: "service", account_target: 50, price: 300, per_held_appointment_fee: 150 });
  const clients = data.organizations.filter((record) => record.organization_type === "client");

  return (
    <>
      <PageHead view="campaigns" actions={canOwner ? (
        <button className="pipeline-button" onClick={() => setOpen(true)}><Plus size={16} /> New campaign</button>
      ) : null} />
      <div className="pipeline-grid">
        {data.campaigns.map((campaign) => {
          const org = data.organizations.find((record) => record.id === campaign.client_organization_id);
          const targets = data.target_accounts.filter((record) => record.campaign_id === campaign.id);
          const appointments = data.appointments.filter((record) => record.campaign_id === campaign.id);
          return (
            <article className="pipeline-panel" key={campaign.id}>
              <div className="pipeline-page-head" style={{ marginBottom: 14 }}>
                <div>
                  <h2>{campaign.campaign_name}</h2>
                  <p>{org?.organization_name || "Internal sample"} · {campaign.territory || "Territory not set"}</p>
                </div>
                <div className="pipeline-actions">
                  {campaign.is_demo ? <Status tone="warn">Fictional demo</Status> : null}
                  <Status>{campaign.campaign_status}</Status>
                </div>
              </div>
              <div className="pipeline-grid metrics">
                <Metric label="Target goal" value={campaign.account_target || 0} />
                <Metric label="Researched" value={targets.length} />
                <Metric label="Approved" value={targets.filter((record) => record.client_approval_status === "approved").length} />
                <Metric label="Appointments" value={appointments.length} />
              </div>
              <div className="pipeline-actions" style={{ marginTop: 14 }}>
                <Status>{campaign.intake_status || "not_started"}</Status>
                <Status tone={campaign.payment_status === "paid" || campaign.payment_status === "not_required" ? "good" : "warn"}>{campaign.payment_status}</Status>
                <span className="pipeline-muted">{campaign.service_promoted}</span>
              </div>
            </article>
          );
        })}
        {!data.campaigns.length ? <Empty>No campaigns are assigned to this user.</Empty> : null}
      </div>

      {open ? (
        <Modal title="Create focused campaign" onClose={() => setOpen(false)}>
          <form onSubmit={async (event) => {
            event.preventDefault();
            const result = await run("save_campaign", { campaign: form }, "Campaign created.");
            if (result) setOpen(false);
          }}>
            <div className="pipeline-fields">
              <Field label="Client">
                <select required value={form.client_organization_id || ""} onChange={(event) => setForm({ ...form, client_organization_id: event.target.value })}>
                  <option value="">Select client</option>
                  {clients.map((client) => <option value={client.id} key={client.id}>{client.organization_name}</option>)}
                </select>
              </Field>
              <Field label="Campaign name"><input required value={form.campaign_name || ""} onChange={(event) => setForm({ ...form, campaign_name: event.target.value })} /></Field>
              <Field label="One service promoted"><input required value={form.service_promoted || ""} onChange={(event) => setForm({ ...form, service_promoted: event.target.value })} /></Field>
              <Field label="One geographic territory"><input required value={form.territory || ""} onChange={(event) => setForm({ ...form, territory: event.target.value })} /></Field>
              <Field label="Start date"><input type="date" value={form.start_date || ""} onChange={(event) => setForm({ ...form, start_date: event.target.value })} /></Field>
              <Field label="End date"><input type="date" value={form.end_date || ""} onChange={(event) => setForm({ ...form, end_date: event.target.value })} /></Field>
              <Field label="Account target"><input type="number" min="1" value={form.account_target} onChange={(event) => setForm({ ...form, account_target: Number(event.target.value) })} /></Field>
              <Field label="Campaign type">
                <select value={form.campaign_type} onChange={(event) => setForm({ ...form, campaign_type: event.target.value })}>
                  <option value="service">Service campaign</option>
                  <option value="founding_pilot">Founding Client Pilot</option>
                </select>
              </Field>
              <Field label="Qualification criteria" wide><textarea value={form.qualification_criteria || ""} onChange={(event) => setForm({ ...form, qualification_criteria: event.target.value })} /></Field>
            </div>
            <div className="pipeline-actions" style={{ marginTop: 18 }}>
              <button className="pipeline-button" disabled={busy}>Create campaign</button>
              <button type="button" className="pipeline-button secondary" onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </>
  );
}

const INTAKE_STEPS = [
  ["business_info", "Business information", ["sales_contact", "maximum_new_client_capacity"]],
  ["services", "Services to promote", ["services_offered", "most_profitable_service"]],
  ["ideal_customer", "Ideal customer profile", ["best_existing_customer_types", "poor_fit_customer_types", "preferred_industries", "target_facility_types", "preferred_decision_maker_titles"]],
  ["territory", "Territory", ["geographic_territory"]],
  ["min_requirements", "Minimum opportunity requirements", ["minimum_contract_value", "maximum_new_client_capacity"]],
  ["exclusions", "Existing customer and competitor exclusions", ["current_customer_exclusions", "competitor_exclusions"]],
  ["qualification", "Qualification criteria", ["qualification_questions", "disqualifying_criteria"]],
  ["calendar", "Calendar availability", ["calendar_availability"]],
  ["approval", "Campaign approval", ["notes"]],
];

const FIELD_LABELS = {
  sales_contact: "Sales contact",
  maximum_new_client_capacity: "Maximum new-client capacity",
  services_offered: "Services offered",
  most_profitable_service: "Most profitable service",
  best_existing_customer_types: "Best existing customer types",
  poor_fit_customer_types: "Poor-fit customer types",
  preferred_industries: "Preferred industries",
  target_facility_types: "Target facility types",
  preferred_decision_maker_titles: "Preferred decision-maker titles",
  geographic_territory: "Geographic territory",
  minimum_contract_value: "Minimum contract value",
  current_customer_exclusions: "Current customer exclusions",
  competitor_exclusions: "Competitor exclusions",
  qualification_questions: "Qualification questions",
  disqualifying_criteria: "Disqualifying criteria",
  calendar_availability: "Calendar availability",
  notes: "Final notes and approval",
};

function OnboardingView({ data, run, busy, canEdit }) {
  const firstProfile = data.intake_profiles[0];
  const [profileId, setProfileId] = useState(firstProfile?.id || "");
  const profile = data.intake_profiles.find((record) => record.id === profileId) || firstProfile;
  const stepIndex = Math.max(0, INTAKE_STEPS.findIndex(([key]) => key === (profile?.onboarding_step || "business_info")));
  const [index, setIndex] = useState(stepIndex);
  const [form, setForm] = useState(profile || {});

  useEffect(() => {
    if (profile) {
      setForm(profile);
      const next = INTAKE_STEPS.findIndex(([key]) => key === profile.onboarding_step);
      setIndex(next < 0 ? 0 : next);
    }
  }, [profile?.id, profile?.onboarding_step]);

  if (!profile) {
    return <><PageHead view="onboarding" /><Empty>No onboarding profile is available.</Empty></>;
  }

  const [key, title, fields] = INTAKE_STEPS[index];
  const saveAndMove = async (nextIndex) => {
    const final = nextIndex >= INTAKE_STEPS.length;
    const nextStep = final ? "complete" : INTAKE_STEPS[nextIndex][0];
    const result = await run("save_intake", {
      client_organization_id: profile.client_organization_id,
      profile: { ...form, onboarding_step: nextStep },
    }, final ? "Onboarding complete." : "Onboarding progress saved.");
    if (result && !final) setIndex(nextIndex);
  };

  return (
    <>
      <PageHead view="onboarding" />
      {data.intake_profiles.length > 1 ? (
        <div style={{ marginBottom: 16 }}>
          <select className="pipeline-filter" value={profileId} onChange={(event) => setProfileId(event.target.value)}>
            {data.intake_profiles.map((record) => {
              const org = data.organizations.find((item) => item.id === record.client_organization_id);
              return <option value={record.id} key={record.id}>{org?.organization_name || record.id}</option>;
            })}
          </select>
        </div>
      ) : null}
      <section className="pipeline-panel">
        <div className="pipeline-stepper" aria-label={"Step " + (index + 1) + " of 9"}>
          {INTAKE_STEPS.map((step, stepNumber) => <span className={"pipeline-step " + (stepNumber < index ? "done" : stepNumber === index ? "current" : "")} key={step[0]} />)}
        </div>
        <p className="pipeline-kicker">Step {index + 1} of 9</p>
        <h2>{title}</h2>
        <p className="pipeline-muted">Progress saves automatically when you move to the next step.</p>
        <div className="pipeline-fields" style={{ marginTop: 18 }}>
          {fields.map((field) => (
            <Field label={FIELD_LABELS[field]} wide key={field}>
              <textarea disabled={!canEdit} value={form[field] || ""} onChange={(event) => setForm({ ...form, [field]: event.target.value })} />
            </Field>
          ))}
        </div>
        <div className="pipeline-actions" style={{ marginTop: 18 }}>
          <button className="pipeline-button secondary" disabled={index === 0 || busy} onClick={() => setIndex(index - 1)}>Previous</button>
          {canEdit ? (
            <button className="pipeline-button" disabled={busy} onClick={() => saveAndMove(index + 1)}>
              {index === INTAKE_STEPS.length - 1 ? "Approve campaign & finish" : "Save & continue"}
            </button>
          ) : <Status>Read only</Status>}
        </div>
      </section>
    </>
  );
}

function AccountsView({ data, run, busy, canInternal, canReview }) {
  const [campaignId, setCampaignId] = useState(data.campaigns[0]?.id || "");
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState({ estimated_fit_score: "unrated" });
  const [contact, setContact] = useState({ role_in_decision: "unknown", verification_status: "unverified" });
  const [selected, setSelected] = useState(new Set());
  const [duplicateNote, setDuplicateNote] = useState("");
  const campaign = data.campaigns.find((record) => record.id === campaignId);
  const accounts = data.target_accounts.filter((record) => record.campaign_id === campaignId);

  useEffect(() => {
    if (!campaignId && data.campaigns[0]) setCampaignId(data.campaigns[0].id);
  }, [campaignId, data.campaigns]);

  const review = async (status) => {
    const items = [...selected].map((id) => ({ id, status, note: "" }));
    if (!items.length) return;
    const result = await run("review_accounts", { campaign_id: campaignId, items }, "Target review saved.");
    if (result) setSelected(new Set());
  };

  const importFile = async (file) => {
    if (!file || !campaignId) return;
    const rows = csvRows(await file.text());
    const result = await run("import_accounts", { campaign_id: campaignId, rows }, "CSV import completed.");
    if (result?.duplicates?.length) {
      setDuplicateNote(result.duplicates.length + " rows were not imported because they were duplicates, invalid, or exceeded the sample limit.");
    }
  };

  const csvTemplate = () => {
    const headers = ["Company name", "Website", "Phone", "City", "State", "Industry", "Facility type", "Reason for fit", "Decision-maker name", "Decision-maker title", "Business email", "Business phone", "Source"];
    downloadFile("mooretech-target-account-template.csv", headers.map(csvEscape).join(",") + "\n", "text/csv;charset=utf-8");
  };

  return (
    <>
      <PageHead view="accounts" actions={
        <>
          <button className="pipeline-button secondary" onClick={csvTemplate}><Download size={16} /> CSV template</button>
          {canInternal ? <button className="pipeline-button" onClick={() => setOpen(true)}><Plus size={16} /> Add account</button> : null}
        </>
      } />
      <div className="pipeline-grid two" style={{ marginBottom: 16 }}>
        <SelectCampaign campaigns={data.campaigns} value={campaignId} onChange={(value) => { setCampaignId(value); setSelected(new Set()); }} />
        {canInternal ? (
          <label className="pipeline-button secondary" style={{ cursor: campaignId ? "pointer" : "not-allowed" }}>
            <Upload size={16} /> Import CSV
            <input hidden type="file" accept=".csv,text/csv" disabled={!campaignId} onChange={(event) => importFile(event.target.files?.[0])} />
          </label>
        ) : <div className="pipeline-note">Client review mode: approve, reject, or identify exclusions.</div>}
      </div>
      {duplicateNote ? <div className="pipeline-alert" style={{ marginBottom: 16 }}>{duplicateNote}</div> : null}
      {campaign?.campaign_type === "sample" ? <div className="pipeline-note" style={{ marginBottom: 16 }}>Free sample limit: {accounts.length}/10. Private research notes are excluded from the shareable sample PDF.</div> : null}
      <section className="pipeline-panel">
        {accounts.length ? (
          <>
            {canReview ? (
              <div className="pipeline-actions" style={{ marginBottom: 14 }}>
                <button className="pipeline-button ghost" onClick={() => setSelected(new Set(accounts.map((record) => record.id)))}>Select all</button>
                <button className="pipeline-button" disabled={!selected.size || busy} onClick={() => review("approved")}>Approve selected</button>
                <button className="pipeline-button secondary" disabled={!selected.size || busy} onClick={() => review("rejected")}>Reject</button>
                <button className="pipeline-button secondary" disabled={!selected.size || busy} onClick={() => review("existing_customer")}>Existing customer</button>
                <button className="pipeline-button secondary" disabled={!selected.size || busy} onClick={() => review("known_opportunity")}>Existing opportunity</button>
                <button className="pipeline-button secondary" disabled={!selected.size || busy} onClick={() => review("competitor")}>Competitor</button>
              </div>
            ) : null}
            <div className="pipeline-table-wrap">
              <table className="pipeline-table">
                <thead><tr><th>Select</th><th>Company</th><th>Facility</th><th>Fit</th><th>Reason</th><th>Approval</th><th>Outreach</th></tr></thead>
                <tbody>
                  {accounts.map((record) => (
                    <tr key={record.id}>
                      <td><input type="checkbox" checked={selected.has(record.id)} onChange={(event) => {
                        const next = new Set(selected);
                        if (event.target.checked) next.add(record.id); else next.delete(record.id);
                        setSelected(next);
                      }} aria-label={"Select " + record.company_name} /></td>
                      <td><strong>{record.company_name}</strong><small>{record.city}{record.city && record.state ? ", " : ""}{record.state}</small></td>
                      <td>{record.facility_type || record.industry || "—"}</td>
                      <td><Status tone={record.estimated_fit_score === "high" ? "good" : ""}>{record.estimated_fit_score}</Status></td>
                      <td>{record.reason_for_fit || "—"}</td>
                      <td><Status tone={record.client_approval_status === "approved" ? "good" : record.client_approval_status === "pending_review" ? "warn" : "bad"}>{record.client_approval_status}</Status></td>
                      <td><Status>{record.outreach_status}</Status></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : <Empty>Select a campaign, then add accounts manually or import the CSV template.</Empty>}
      </section>

      {open ? (
        <Modal title="Add researched target account" onClose={() => setOpen(false)}>
          <form onSubmit={async (event) => {
            event.preventDefault();
            const result = await run("add_account", { campaign_id: campaignId, account, contact }, "Target account saved.");
            if (result?.duplicate) setDuplicateNote("Duplicate warning: that company/website, company/phone, contact email, or contact phone already exists.");
            if (result?.success) {
              setOpen(false);
              setAccount({ estimated_fit_score: "unrated" });
              setContact({ role_in_decision: "unknown", verification_status: "unverified" });
            }
          }}>
            <div className="pipeline-fields">
              <Field label="Company name"><input required value={account.company_name || ""} onChange={(event) => setAccount({ ...account, company_name: event.target.value })} /></Field>
              <Field label="Website"><input value={account.website || ""} onChange={(event) => setAccount({ ...account, website: event.target.value })} /></Field>
              <Field label="Phone"><input value={account.phone || ""} onChange={(event) => setAccount({ ...account, phone: event.target.value })} /></Field>
              <Field label="Public email"><input type="email" value={account.public_email || ""} onChange={(event) => setAccount({ ...account, public_email: event.target.value })} /></Field>
              <Field label="City"><input value={account.city || ""} onChange={(event) => setAccount({ ...account, city: event.target.value })} /></Field>
              <Field label="State"><input value={account.state || ""} onChange={(event) => setAccount({ ...account, state: event.target.value })} /></Field>
              <Field label="Industry"><input value={account.industry || ""} onChange={(event) => setAccount({ ...account, industry: event.target.value })} /></Field>
              <Field label="Facility type"><input value={account.facility_type || ""} onChange={(event) => setAccount({ ...account, facility_type: event.target.value })} /></Field>
              <Field label="Reason for fit" wide><textarea required value={account.reason_for_fit || ""} onChange={(event) => setAccount({ ...account, reason_for_fit: event.target.value })} /></Field>
              <Field label="Public research source" wide><input value={account.research_source || ""} onChange={(event) => setAccount({ ...account, research_source: event.target.value })} /></Field>
              <Field label="Decision-maker name"><input value={contact.first_name || ""} placeholder="First name" onChange={(event) => setContact({ ...contact, first_name: event.target.value })} /></Field>
              <Field label="Decision-maker title"><input value={contact.job_title || ""} onChange={(event) => setContact({ ...contact, job_title: event.target.value })} /></Field>
              <Field label="Business email"><input type="email" value={contact.business_email || ""} onChange={(event) => setContact({ ...contact, business_email: event.target.value })} /></Field>
              <Field label="Business phone"><input value={contact.business_phone || ""} onChange={(event) => setContact({ ...contact, business_phone: event.target.value })} /></Field>
            </div>
            <div className="pipeline-actions" style={{ marginTop: 18 }}>
              <button className="pipeline-button" disabled={busy || !campaignId}>Save researched account</button>
              <button type="button" className="pipeline-button secondary" onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </>
  );
}

function OutreachView({ data, run, busy, demoRole }) {
  const campaigns = data.campaigns.filter((record) => record.campaign_type !== "sample");
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id || "");
  const [logTarget, setLogTarget] = useState(null);
  const [qualifyTarget, setQualifyTarget] = useState(null);
  const [activity, setActivity] = useState({ activity_type: "call_attempted", disposition: "no_answer", direction: "outbound" });
  const [qualification, setQualification] = useState({ contract_status: "unknown", decision_authority: "unknown", stated_interest: "none", qualification_status: "pending" });
  const campaign = campaigns.find((record) => record.id === campaignId);
  const accounts = data.target_accounts.filter((record) => record.campaign_id === campaignId && record.client_approval_status === "approved");
  const cleaningTemplate = data.templates.find((record) => record.template_type === "cleaning_prospect_email");

  useEffect(() => {
    if (!campaignId && campaigns[0]) setCampaignId(campaigns[0].id);
  }, [campaignId, campaigns]);

  const suppressed = (account, contact) => {
    if (contact?.do_not_contact_status || contact?.do_not_call_status || contact?.do_not_email_status) return true;
    return data.suppressions.some((record) =>
      (!record.client_organization_id || record.client_organization_id === account.client_organization_id) &&
      ((record.email && record.email === contact?.business_email) ||
        (record.phone && record.phone.replace(/\D/g, "") === (contact?.business_phone || account.phone || "").replace(/\D/g, "")) ||
        (record.company && record.company.toLowerCase() === account.company_name.toLowerCase()))
    );
  };

  return (
    <>
      <PageHead view="outreach" />
      <div style={{ marginBottom: 16 }}><SelectCampaign campaigns={campaigns} value={campaignId} onChange={setCampaignId} includeSamples={false} /></div>
      <div className="pipeline-note" style={{ marginBottom: 16 }}>
        Email actions open a draft in the user's mail client. Phone actions use a standard click-to-call link. Nothing is sent or dialed automatically.
      </div>
      <div className="pipeline-grid">
        {accounts.map((account) => {
          const contact = data.contacts.find((record) => record.target_account_id === account.id);
          const last = data.activities.filter((record) => record.target_account_id === account.id).sort((a, b) => String(b.date_time).localeCompare(String(a.date_time)))[0];
          const blocked = suppressed(account, contact);
          const demo = Boolean(account.is_demo || campaign?.is_demo || demoRole);
          const emailBody = merge(cleaningTemplate?.body || "", {
            first_name: contact?.first_name,
            prospect_company: account.company_name,
            client_company: data.organizations.find((record) => record.id === account.client_organization_id)?.organization_name,
            territory: campaign?.territory,
            facility_type: account.facility_type,
            sender_name: data.user.name,
            business_mailing_address: data.settings.business_mailing_address || "[business mailing address]",
          });
          const mailto = contact?.business_email
            ? "mailto:" + encodeURIComponent(contact.business_email) + "?subject=" + encodeURIComponent(merge(cleaningTemplate?.subject || "Commercial cleaning service", { prospect_company: account.company_name })) + "&body=" + encodeURIComponent(emailBody)
            : "";
          return (
            <article className="pipeline-panel" key={account.id}>
              <div className="pipeline-page-head" style={{ marginBottom: 14 }}>
                <div>
                  <h2>{account.company_name}</h2>
                  <p>{contact ? (contact.first_name + " " + (contact.last_name || "") + " · " + (contact.job_title || "Role unknown")) : "Decision-maker not yet identified"}</p>
                </div>
                <div className="pipeline-actions">
                  {demo ? <Status tone="warn">Fictional</Status> : null}
                  {blocked ? <Status tone="bad">Suppressed</Status> : <Status tone="good">Approved</Status>}
                </div>
              </div>
              <p>{account.reason_for_fit}</p>
              <div className="pipeline-grid two">
                <div><span className="pipeline-muted">Last activity</span><strong style={{ display: "block" }}>{last ? prettify(last.activity_type) + " · " + dateLabel(last.date_time) : "None"}</strong></div>
                <div><span className="pipeline-muted">Suggested next action</span><strong style={{ display: "block" }}>{last?.follow_up_date ? "Follow up " + dateLabel(last.follow_up_date) : contact ? "Prepare manual outreach" : "Research decision-maker"}</strong></div>
              </div>
              <div className="pipeline-actions" style={{ marginTop: 16 }}>
                {account.website ? <a className="pipeline-button secondary" href={account.website} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Website</a> : null}
                {mailto && !demo && !blocked ? <a className="pipeline-button secondary" href={mailto}><Mail size={15} /> Compose email</a> : <button className="pipeline-button secondary" disabled><Mail size={15} /> Compose email</button>}
                {contact?.business_phone && !demo && !blocked ? <a className="pipeline-button secondary" href={"tel:" + contact.business_phone}><Phone size={15} /> Click to call</a> : <button className="pipeline-button secondary" disabled><Phone size={15} /> Click to call</button>}
                <button className="pipeline-button" disabled={blocked} onClick={() => { setLogTarget({ account, contact }); setActivity({ activity_type: "call_attempted", disposition: "no_answer", direction: "outbound" }); }}>Log activity</button>
                <button className="pipeline-button ghost" disabled={!contact || blocked} onClick={() => setQualifyTarget({ account, contact })}>Qualify</button>
              </div>
              {demo ? <div className="pipeline-alert" style={{ marginTop: 14 }}>Demo record: website, mail, phone, calendar, and payment actions are disabled.</div> : null}
              {blocked ? <div className="pipeline-error" style={{ marginTop: 14 }}>Suppression warning: new outreach is blocked until the MooreTech Owner removes the suppression with a documented reason.</div> : null}
            </article>
          );
        })}
        {!accounts.length ? <Empty>No approved target accounts are ready for outreach in this campaign.</Empty> : null}
      </div>

      {logTarget ? (
        <Modal title={"Log outreach — " + logTarget.account.company_name} onClose={() => setLogTarget(null)}>
          <form onSubmit={async (event) => {
            event.preventDefault();
            const result = await run("log_outreach", {
              campaign_id: campaignId,
              target_account_id: logTarget.account.id,
              contact_id: logTarget.contact?.id,
              ...activity,
            }, "Manual outreach activity logged.");
            if (result) setLogTarget(null);
          }}>
            <div className="pipeline-fields">
              <Field label="Activity type">
                <select value={activity.activity_type} onChange={(event) => setActivity({ ...activity, activity_type: event.target.value })}>
                  {["research", "email_drafted", "email_sent_manually", "email_received", "call_attempted", "call_connected", "voicemail", "meeting_scheduled", "follow_up", "do_not_contact_request", "other"].map((value) => <option value={value} key={value}>{prettify(value)}</option>)}
                </select>
              </Field>
              <Field label="Disposition">
                <select value={activity.disposition} onChange={(event) => setActivity({ ...activity, disposition: event.target.value })}>
                  {["no_answer", "voicemail", "gatekeeper", "wrong_number", "decision_maker_unavailable", "decision_maker_reached", "follow_up_requested", "information_requested", "interested", "not_interested", "existing_vendor", "contract_review_later", "appointment_scheduled", "do_not_call", "disqualified", "not_applicable"].map((value) => <option value={value} key={value}>{prettify(value)}</option>)}
                </select>
              </Field>
              <Field label="Summary" wide><textarea required value={activity.summary || ""} onChange={(event) => setActivity({ ...activity, summary: event.target.value })} /></Field>
              <Field label="Follow-up date"><input type="datetime-local" value={activity.follow_up_date || ""} onChange={(event) => setActivity({ ...activity, follow_up_date: event.target.value })} /></Field>
              <Field label="Client-visible note"><input value={activity.client_visible_notes || ""} onChange={(event) => setActivity({ ...activity, client_visible_notes: event.target.value })} /></Field>
              <Field label="Private MooreTech notes" wide><textarea value={activity.internal_notes || ""} onChange={(event) => setActivity({ ...activity, internal_notes: event.target.value })} /></Field>
            </div>
            <div className="pipeline-actions" style={{ marginTop: 18 }}>
              <button className="pipeline-button" disabled={busy}>Save log</button>
              <button type="button" className="pipeline-button secondary" onClick={() => setLogTarget(null)}>Cancel</button>
            </div>
          </form>
        </Modal>
      ) : null}

      {qualifyTarget ? (
        <Modal title={"Qualification — " + qualifyTarget.account.company_name} onClose={() => setQualifyTarget(null)}>
          <form onSubmit={async (event) => {
            event.preventDefault();
            const result = await run("qualify", {
              campaign_id: campaignId,
              target_account_id: qualifyTarget.account.id,
              contact_id: qualifyTarget.contact.id,
              record: qualification,
            }, "Qualification saved.");
            if (result) setQualifyTarget(null);
          }}>
            <div className="pipeline-fields">
              <Field label="Current provider"><input value={qualification.current_provider || ""} onChange={(event) => setQualification({ ...qualification, current_provider: event.target.value })} /></Field>
              <Field label="Contract status">
                <select value={qualification.contract_status} onChange={(event) => setQualification({ ...qualification, contract_status: event.target.value })}>
                  {["no_contract", "active", "upcoming_review", "expiring", "unknown"].map((value) => <option value={value} key={value}>{prettify(value)}</option>)}
                </select>
              </Field>
              <Field label="Contract review date"><input type="date" value={qualification.contract_review_date || ""} onChange={(event) => setQualification({ ...qualification, contract_review_date: event.target.value })} /></Field>
              <Field label="Decision authority">
                <select value={qualification.decision_authority} onChange={(event) => setQualification({ ...qualification, decision_authority: event.target.value })}>
                  {["decision_maker", "influencer", "gatekeeper", "user", "unknown"].map((value) => <option value={value} key={value}>{prettify(value)}</option>)}
                </select>
              </Field>
              <Field label="Service need or problem" wide><textarea value={qualification.service_problem || ""} onChange={(event) => setQualification({ ...qualification, service_problem: event.target.value })} /></Field>
              <Field label="Facility size"><input value={qualification.facility_size || ""} onChange={(event) => setQualification({ ...qualification, facility_size: event.target.value })} /></Field>
              <Field label="Number of locations"><input value={qualification.number_of_locations || ""} onChange={(event) => setQualification({ ...qualification, number_of_locations: event.target.value })} /></Field>
              <Field label="Expected frequency"><input value={qualification.expected_service_frequency || ""} onChange={(event) => setQualification({ ...qualification, expected_service_frequency: event.target.value })} /></Field>
              <Field label="Approximate opportunity value"><input value={qualification.approximate_opportunity_value || ""} onChange={(event) => setQualification({ ...qualification, approximate_opportunity_value: event.target.value })} /></Field>
              <Field label="Stated interest">
                <select value={qualification.stated_interest} onChange={(event) => setQualification({ ...qualification, stated_interest: event.target.value })}>
                  {["none", "low", "medium", "high"].map((value) => <option value={value} key={value}>{prettify(value)}</option>)}
                </select>
              </Field>
              <Field label="Agreed next step" wide><textarea value={qualification.agreed_next_step || ""} onChange={(event) => setQualification({ ...qualification, agreed_next_step: event.target.value })} /></Field>
              <Field label="Qualification status">
                <select value={qualification.qualification_status} onChange={(event) => setQualification({ ...qualification, qualification_status: event.target.value })}>
                  {["pending", "qualified", "disqualified"].map((value) => <option value={value} key={value}>{prettify(value)}</option>)}
                </select>
              </Field>
              <Field label="Manager override explanation"><input value={qualification.override_explanation || ""} onChange={(event) => setQualification({ ...qualification, override_explanation: event.target.value })} /></Field>
            </div>
            <div className="pipeline-alert" style={{ marginTop: 16 }}>Qualified status is rejected until all required criteria are recorded. Manager overrides require an explanation.</div>
            <div className="pipeline-actions" style={{ marginTop: 18 }}>
              <button className="pipeline-button" disabled={busy}>Save qualification</button>
              <button type="button" className="pipeline-button secondary" onClick={() => setQualifyTarget(null)}>Cancel</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </>
  );
}

function AppointmentsView({ data, run, busy, canInternal, demoRole }) {
  const qualified = data.qualifications.filter((record) => ["qualified", "override"].includes(record.qualification_status));
  const [schedule, setSchedule] = useState(null);
  const [form, setForm] = useState({ time_zone: "America/Chicago", meeting_type: "video" });
  const [outcomes, setOutcomes] = useState({});
  const appointments = [...data.appointments].sort((a, b) => String(a.date).localeCompare(String(b.date)));

  const downloadIcs = (appointment) => {
    downloadFile("appointment-" + appointment.id + ".ics", calendarIcs(appointment), "text/calendar;charset=utf-8");
    run("export_log", { entity_type: "Appointment", record_id: appointment.id, organization_id: appointment.client_organization_id, description: "Downloaded appointment calendar event." }, "", false);
  };

  return (
    <>
      <PageHead view="appointments" actions={canInternal && qualified.length ? (
        <button className="pipeline-button" onClick={() => setSchedule(qualified[0])}><Plus size={16} /> Schedule qualified contact</button>
      ) : null} />
      <div className="pipeline-grid">
        {appointments.map((appointment) => {
          const account = data.target_accounts.find((record) => record.id === appointment.target_account_id);
          const contact = data.contacts.find((record) => record.id === appointment.contact_id);
          const selectedOutcome = outcomes[appointment.id] || appointment.outcome;
          const demo = Boolean(appointment.is_demo || demoRole);
          return (
            <article className="pipeline-panel" key={appointment.id}>
              <div className="pipeline-page-head" style={{ marginBottom: 12 }}>
                <div>
                  <h2>{appointment.appointment_title}</h2>
                  <p>{account?.company_name} · {contact ? contact.first_name + " " + (contact.last_name || "") : "Contact"}</p>
                </div>
                <Status tone={appointment.outcome === "held" || appointment.outcome === "won" ? "good" : appointment.outcome === "no_show" || appointment.outcome === "lost" ? "bad" : ""}>{appointment.outcome}</Status>
              </div>
              <div className="pipeline-grid three">
                <div><span className="pipeline-muted">When</span><strong style={{ display: "block" }}>{appointment.date} · {appointment.start_time} {appointment.time_zone}</strong></div>
                <div><span className="pipeline-muted">Meeting</span><strong style={{ display: "block" }}>{prettify(appointment.meeting_type)} · {appointment.location_or_link || "Location pending"}</strong></div>
                <div><span className="pipeline-muted">Qualification</span><strong style={{ display: "block" }}>{appointment.qualification_summary || "See qualification record"}</strong></div>
              </div>
              <div className="pipeline-actions" style={{ marginTop: 16 }}>
                {!demo ? <a className="pipeline-button secondary" href={googleCalendarUrl(appointment)} target="_blank" rel="noreferrer"><CalendarDays size={15} /> Google Calendar</a> : <button className="pipeline-button secondary" disabled>Google Calendar</button>}
                {!demo ? <button className="pipeline-button secondary" onClick={() => downloadIcs(appointment)}><Download size={15} /> .ics event</button> : <button className="pipeline-button secondary" disabled>.ics event</button>}
                <select className="pipeline-filter" style={{ width: "auto", minWidth: 190 }} value={selectedOutcome} onChange={(event) => setOutcomes({ ...outcomes, [appointment.id]: event.target.value })}>
                  {["scheduled", "confirmed", "rescheduled", "cancelled", "no_show", "held", "disqualified_after_meeting", "proposal_sent", "won", "lost"].map((value) => <option value={value} key={value}>{prettify(value)}</option>)}
                </select>
                <button className="pipeline-button" disabled={busy || selectedOutcome === appointment.outcome} onClick={() => run("appointment_outcome", {
                  appointment_id: appointment.id,
                  outcome: selectedOutcome,
                  outcome_notes: outcomes[appointment.id + "-notes"] || "",
                  proposal_value: outcomes[appointment.id + "-proposal"] || appointment.proposal_value,
                  won_revenue: outcomes[appointment.id + "-won"] || appointment.won_revenue,
                  case_study_consent: Boolean(outcomes[appointment.id + "-consent"]),
                  ironline_handoff: Boolean(outcomes[appointment.id + "-handoff"]),
                }, selectedOutcome === "held" ? "Outcome saved; one held-appointment fee is ready." : "Appointment outcome saved.")}>Save outcome</button>
              </div>
              {selectedOutcome === "won" ? (
                <div className="pipeline-fields" style={{ marginTop: 14 }}>
                  <Field label="Won revenue"><input value={outcomes[appointment.id + "-won"] || appointment.won_revenue || ""} onChange={(event) => setOutcomes({ ...outcomes, [appointment.id + "-won"]: event.target.value })} /></Field>
                  <Field label="Proposal / contract value"><input value={outcomes[appointment.id + "-proposal"] || appointment.proposal_value || ""} onChange={(event) => setOutcomes({ ...outcomes, [appointment.id + "-proposal"]: event.target.value })} /></Field>
                  <label className="pipeline-checkbox"><input type="checkbox" checked={Boolean(outcomes[appointment.id + "-consent"])} onChange={(event) => setOutcomes({ ...outcomes, [appointment.id + "-consent"]: event.target.checked })} /> Permission for anonymized case study</label>
                  <label className="pipeline-checkbox"><input type="checkbox" checked={Boolean(outcomes[appointment.id + "-handoff"])} onChange={(event) => setOutcomes({ ...outcomes, [appointment.id + "-handoff"]: event.target.checked })} /> Show optional Ironline Office handoff</label>
                </div>
              ) : null}
              {appointment.performance_fee_billing_id ? <div className="pipeline-success" style={{ marginTop: 14 }}>Held fee record created once: {appointment.performance_fee_billing_id}</div> : null}
              {appointment.outcome === "won" || selectedOutcome === "won" ? <a className="pipeline-button ghost" style={{ marginTop: 14 }} href="https://ironlineoffice.com/" target="_blank" rel="noreferrer">Optional handoff to Ironline Office <ExternalLink size={15} /></a> : null}
              {demo ? <div className="pipeline-alert" style={{ marginTop: 14 }}>Fictional demo: no calendar event or external message can be initiated.</div> : null}
            </article>
          );
        })}
        {!appointments.length ? <Empty>No appointments have been scheduled.</Empty> : null}
      </div>

      {schedule ? (
        <Modal title="Schedule qualified appointment" onClose={() => setSchedule(null)}>
          <form onSubmit={async (event) => {
            event.preventDefault();
            const result = await run("schedule_appointment", {
              campaign_id: schedule.campaign_id,
              qualification_id: schedule.id,
              appointment: form,
            }, "Appointment scheduled with one-day and one-hour reminder tasks.");
            if (result) setSchedule(null);
          }}>
            <div className="pipeline-fields">
              <Field label="Qualified contact">
                <select value={schedule.id} onChange={(event) => setSchedule(qualified.find((record) => record.id === event.target.value))}>
                  {qualified.map((record) => {
                    const contact = data.contacts.find((item) => item.id === record.contact_id);
                    return <option value={record.id} key={record.id}>{contact?.first_name || "Contact"} · {prettify(record.qualification_status)}</option>;
                  })}
                </select>
              </Field>
              <Field label="Appointment title"><input required value={form.appointment_title || ""} onChange={(event) => setForm({ ...form, appointment_title: event.target.value })} /></Field>
              <Field label="Date"><input required type="date" value={form.date || ""} onChange={(event) => setForm({ ...form, date: event.target.value })} /></Field>
              <Field label="Time zone"><input required value={form.time_zone} onChange={(event) => setForm({ ...form, time_zone: event.target.value })} /></Field>
              <Field label="Start time"><input required type="time" value={form.start_time || ""} onChange={(event) => setForm({ ...form, start_time: event.target.value })} /></Field>
              <Field label="End time"><input required type="time" value={form.end_time || ""} onChange={(event) => setForm({ ...form, end_time: event.target.value })} /></Field>
              <Field label="Meeting type">
                <select value={form.meeting_type} onChange={(event) => setForm({ ...form, meeting_type: event.target.value })}>
                  <option value="video">Video</option><option value="phone">Phone</option><option value="in_person">In person</option>
                </select>
              </Field>
              <Field label="Link or location"><input value={form.location_or_link || ""} onChange={(event) => setForm({ ...form, location_or_link: event.target.value })} /></Field>
              <Field label="Qualification summary" wide><textarea value={form.qualification_summary || schedule.agreed_next_step || ""} onChange={(event) => setForm({ ...form, qualification_summary: event.target.value })} /></Field>
            </div>
            <div className="pipeline-note" style={{ marginTop: 14 }}>This creates records and manual reminder tasks only. No automated SMS reminder is sent.</div>
            <div className="pipeline-actions" style={{ marginTop: 18 }}>
              <button className="pipeline-button" disabled={busy}>Schedule appointment</button>
              <button type="button" className="pipeline-button secondary" onClick={() => setSchedule(null)}>Cancel</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </>
  );
}

function reportPdf(report, campaign, organization, onExport) {
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text("MooreTech Commercial Pipeline", 16, 20);
  doc.setFontSize(14);
  doc.text("Campaign Results Report", 16, 31);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Client: " + (organization?.organization_name || "Client"), 16, 41);
  doc.text("Campaign: " + (campaign?.campaign_name || report.campaign_id), 16, 47);
  doc.text("Period: " + report.reporting_period_start + " through " + report.reporting_period_end, 16, 53);
  const rows = [
    ["Accounts researched", report.accounts_researched],
    ["Accounts approved", report.accounts_approved],
    ["Contacts identified", report.contacts_identified],
    ["Emails sent manually", report.emails_sent],
    ["Calls attempted", report.calls_attempted],
    ["Decision-makers reached", report.decision_makers_reached],
    ["Conversations", report.conversations],
    ["Interested prospects", report.interested_prospects],
    ["Appointments scheduled", report.appointments_scheduled],
    ["Appointments held", report.appointments_held],
    ["No-shows", report.no_shows],
    ["Proposals", report.proposals],
    ["Wins", report.wins],
    ["Revenue reported", report.revenue_reported],
  ];
  let y = 67;
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 18, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value || 0), 130, y);
    y += 8;
  });
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 16, y + 5);
  doc.setFont("helvetica", "normal");
  doc.text(doc.splitTextToSize(report.summary || "No summary.", 178), 16, y + 12);
  y += 30;
  doc.setFont("helvetica", "bold");
  doc.text("Recommendations", 16, y);
  doc.setFont("helvetica", "normal");
  doc.text(doc.splitTextToSize(report.recommendations || "No recommendations.", 178), 16, y + 7);
  doc.setFontSize(8);
  doc.setTextColor(80);
  doc.text("MooreTech does not guarantee sales, contracts, proposals, revenue, or return on investment.", 16, 285);
  doc.save("MooreTech-campaign-report-" + report.id + ".pdf");
  onExport?.();
}

function ReportsView({ data, run, busy, canInternal }) {
  const campaigns = data.campaigns.filter((record) => record.campaign_type !== "sample");
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id || "");
  const [form, setForm] = useState({ start_date: new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10), end_date: new Date().toISOString().slice(0, 10), client_visible_status: "ready_for_review" });
  const reports = data.reports.filter((record) => !campaignId || record.campaign_id === campaignId);

  return (
    <>
      <PageHead view="reports" />
      <div className="pipeline-grid two" style={{ marginBottom: 16 }}>
        <SelectCampaign campaigns={campaigns} value={campaignId} onChange={setCampaignId} includeSamples={false} />
        {canInternal ? (
          <div className="pipeline-actions">
            <input className="pipeline-filter" type="date" value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} />
            <input className="pipeline-filter" type="date" value={form.end_date} onChange={(event) => setForm({ ...form, end_date: event.target.value })} />
            <button className="pipeline-button" disabled={!campaignId || busy} onClick={() => run("generate_report", { campaign_id: campaignId, ...form }, "Campaign report generated.")}>Generate</button>
          </div>
        ) : null}
      </div>
      <div className="pipeline-grid">
        {reports.map((report) => {
          const campaign = data.campaigns.find((record) => record.id === report.campaign_id);
          const org = data.organizations.find((record) => record.id === report.client_organization_id);
          const funnel = [
            ["Researched", report.accounts_researched],
            ["Approved", report.accounts_approved],
            ["Contacts", report.contacts_identified],
            ["Conversations", report.conversations],
            ["Scheduled", report.appointments_scheduled],
            ["Held", report.appointments_held],
            ["Wins", report.wins],
          ];
          const max = Math.max(1, ...funnel.map((row) => Number(row[1] || 0)));
          return (
            <article className="pipeline-panel" key={report.id}>
              <div className="pipeline-page-head" style={{ marginBottom: 14 }}>
                <div><h2>{campaign?.campaign_name || "Campaign report"}</h2><p>{report.reporting_period_start} through {report.reporting_period_end}</p></div>
                <div className="pipeline-actions"><Status>{report.client_visible_status}</Status><button className="pipeline-button secondary" onClick={() => reportPdf(report, campaign, org, () => run("export_log", {
                  entity_type: "Report", record_id: report.id, organization_id: report.client_organization_id, description: "Exported client-facing campaign report PDF.",
                }, "", false))}><Download size={15} /> PDF</button></div>
              </div>
              <div className="pipeline-funnel">
                {funnel.map(([label, count]) => <div className="pipeline-funnel-row" key={label}><span>{label}</span><div className="pipeline-funnel-bar"><span style={{ width: percent(Number(count || 0), max) + "%" }} /></div><strong>{count || 0}</strong></div>)}
              </div>
              <div className="pipeline-grid two" style={{ marginTop: 18 }}>
                <div className="pipeline-callout"><strong>Summary</strong><p>{report.summary}</p></div>
                <div className="pipeline-callout"><strong>Recommendations</strong><p>{report.recommendations || "No recommendation entered."}</p></div>
              </div>
            </article>
          );
        })}
        {!reports.length ? <Empty>No reports are available for this campaign.</Empty> : null}
      </div>
    </>
  );
}

function invoicePdf(record, org, campaign, onExport) {
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("INVOICE", 16, 22);
  doc.setFontSize(12);
  doc.text("MooreTech Solutions LLC", 16, 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("MooreTech Commercial Pipeline", 16, 41);
  doc.text("Call or text: 870-819-1018", 16, 47);
  doc.text("admin@ironlineoffice.com", 16, 53);
  doc.setFont("helvetica", "bold");
  doc.text("Bill to", 16, 70);
  doc.setFont("helvetica", "normal");
  doc.text(org?.organization_name || record.client_organization_id, 16, 77);
  doc.text("Invoice: " + (record.invoice_number || record.id), 120, 34);
  doc.text("Due: " + (record.due_date || "Upon receipt"), 120, 41);
  doc.text("Status: " + prettify(record.payment_status), 120, 48);
  doc.setDrawColor(80);
  doc.line(16, 90, 194, 90);
  doc.text(record.description || prettify(record.billing_type), 16, 103);
  doc.setFont("helvetica", "bold");
  doc.text(formatMoney(record.amount), 160, 103);
  doc.line(16, 112, 194, 112);
  doc.setFont("helvetica", "normal");
  doc.text("Campaign: " + (campaign?.campaign_name || "—"), 16, 124);
  doc.text("Payment may be recorded manually. Stripe is optional and not required for this invoice.", 16, 138);
  doc.setFontSize(8);
  doc.text("MooreTech does not guarantee sales, contracts, proposals, revenue, or return on investment.", 16, 285);
  doc.save("MooreTech-invoice-" + (record.invoice_number || record.id) + ".pdf");
  onExport?.();
}

function BillingView({ data, run, busy, canManageBilling, demoRole }) {
  const totalDue = data.billing.filter((record) => ["unpaid", "overdue"].includes(record.payment_status)).reduce((sum, record) => sum + Number(record.amount || 0), 0);
  const paid = data.billing.filter((record) => record.payment_status === "paid").reduce((sum, record) => sum + Number(record.amount || 0), 0);
  return (
    <>
      <PageHead view="billing" actions={<button className="pipeline-button secondary" onClick={() => window.print()}>Print view</button>} />
      <div className="pipeline-grid metrics" style={{ marginBottom: 18 }}>
        <Metric label="Open balance" value={formatMoney(totalDue)} />
        <Metric label="Collected" value={formatMoney(paid)} />
        <Metric label="Pilot invoices" value={data.billing.filter((record) => record.billing_type === "pilot_setup").length} />
        <Metric label="Held appointment fees" value={data.billing.filter((record) => record.billing_type === "held_appointment").length} />
      </div>
      <section className="pipeline-panel">
        {data.billing.length ? (
          <div className="pipeline-table-wrap">
            <table className="pipeline-table">
              <thead><tr><th>Invoice</th><th>Client</th><th>Type</th><th>Amount</th><th>Due</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {data.billing.map((record) => {
                  const org = data.organizations.find((item) => item.id === record.client_organization_id);
                  const campaign = data.campaigns.find((item) => item.id === record.campaign_id);
                  const demo = Boolean(record.is_demo || demoRole);
                  return (
                    <tr key={record.id}>
                      <td>{record.invoice_number || record.id.slice(-8)}</td>
                      <td>{org?.organization_name || "Client"}</td>
                      <td>{prettify(record.billing_type)}</td>
                      <td><strong>{formatMoney(record.amount)}</strong></td>
                      <td>{record.due_date || "—"}</td>
                      <td><Status tone={record.payment_status === "paid" ? "good" : record.payment_status === "overdue" ? "bad" : "warn"}>{record.payment_status}</Status></td>
                      <td><div className="pipeline-actions">
                        <button className="pipeline-button secondary" onClick={() => invoicePdf(record, org, campaign, () => run("export_log", {
                          entity_type: "BillingRecord", record_id: record.id, organization_id: record.client_organization_id, description: "Downloaded or printed invoice.",
                        }, "", false))}><Download size={15} /> Invoice</button>
                        {canManageBilling && record.payment_status !== "paid" ? <button className="pipeline-button" disabled={busy || demo} onClick={() => run("record_payment", { billing_id: record.id, payment_status: "paid", payment_method: "manual" }, "Manual payment recorded.")}>Mark paid</button> : null}
                      </div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <Empty>No billing records are visible.</Empty>}
      </section>
      <div className="pipeline-note" style={{ marginTop: 16 }}>Manual payment records, printable invoices, credits, and adjustments are the launch workflow. Stripe remains optional.</div>
    </>
  );
}

function DemoView({ data, run, busy, setDemoRole, navigate }) {
  const demoCampaigns = data.campaigns.filter((record) => record.is_demo);
  return (
    <>
      <PageHead view="demo" />
      <div className="pipeline-banner">
        <span>Every demo company, contact, activity, appointment, report, and invoice is explicitly fictional.</span>
        <Status tone="warn">No external actions</Status>
      </div>
      <div className="pipeline-grid two">
        <section className="pipeline-panel">
          <h2>Demo data</h2>
          <p className="pipeline-muted">Reset and reload a complete fictional DeltaSpark Commercial Cleaning campaign.</p>
          <div className="pipeline-actions">
            <button className="pipeline-button" disabled={busy} onClick={() => run("seed_demo", {}, "Fictional demo data loaded.")}><Database size={16} /> Load / reset demo</button>
            <button className="pipeline-button danger" disabled={busy || !demoCampaigns.length} onClick={() => run("reset_demo", {}, "Fictional demo data removed.")}>Remove demo data</button>
          </div>
        </section>
        <section className="pipeline-panel">
          <h2>Enter a role view</h2>
          <p className="pipeline-muted">Role simulation changes what the owner sees; it does not contact anyone or change a real user's permissions.</p>
          <div className="pipeline-actions">
            <button className="pipeline-button secondary" disabled={!demoCampaigns.length} onClick={() => { setDemoRole("client"); navigate("/pipeline/dashboard"); }}>Client-view demo</button>
            <button className="pipeline-button secondary" disabled={!demoCampaigns.length} onClick={() => { setDemoRole("manager"); navigate("/pipeline/dashboard"); }}>Campaign-manager demo</button>
            <button className="pipeline-button ghost" onClick={() => { setDemoRole(""); navigate("/pipeline/demo"); }}>Owner view</button>
          </div>
        </section>
      </div>
      <section className="pipeline-panel" style={{ marginTop: 18 }}>
        <h2>Complete workflow walkthrough</h2>
        <ol>
          <li>Open <button className="pipeline-button ghost" onClick={() => navigate("/pipeline/accounts")}>Target accounts</button> and review the pending fictional account.</li>
          <li>Open <button className="pipeline-button ghost" onClick={() => navigate("/pipeline/outreach")}>Outreach</button> to see approved work-queue items. External buttons remain disabled.</li>
          <li>Open <button className="pipeline-button ghost" onClick={() => navigate("/pipeline/appointments")}>Appointments</button> to inspect scheduled, held, and proposal outcomes.</li>
          <li>Open <button className="pipeline-button ghost" onClick={() => navigate("/pipeline/reports")}>Reports</button> to view the full fictional funnel.</li>
          <li>Open <button className="pipeline-button ghost" onClick={() => navigate("/pipeline/billing")}>Billing</button> to inspect the $300 pilot and $150 held fee.</li>
        </ol>
      </section>
    </>
  );
}

const SETUP_STEPS = [
  "business_details", "contact_info", "pricing", "mailing_address", "sender_identities",
  "qualification_defaults", "service_agreement", "payment_methods", "calendar_options",
  "demo_data", "publish_page", "complete",
];

function SettingsView({ data, run, busy }) {
  const [form, setForm] = useState(data.settings || {});
  const [template, setTemplate] = useState(null);
  useEffect(() => setForm(data.settings || {}), [data.settings?.id]);

  return (
    <>
      <PageHead view="settings" actions={<button className="pipeline-button" disabled={busy} onClick={() => run("save_settings", { settings: form }, "Settings saved.")}>Save settings</button>} />
      <div className="pipeline-grid two">
        <section className="pipeline-panel">
          <h2>Business and offer</h2>
          <div className="pipeline-fields">
            <Field label="Company name"><input value={form.company_name || ""} onChange={(event) => setForm({ ...form, company_name: event.target.value })} /></Field>
            <Field label="Service name"><input value={form.service_name || ""} onChange={(event) => setForm({ ...form, service_name: event.target.value })} /></Field>
            <Field label="Owner"><input value={form.owner_name || ""} onChange={(event) => setForm({ ...form, owner_name: event.target.value })} /></Field>
            <Field label="Email"><input type="email" value={form.contact_email || ""} onChange={(event) => setForm({ ...form, contact_email: event.target.value })} /></Field>
            <Field label="Phone"><input value={form.contact_phone || ""} onChange={(event) => setForm({ ...form, contact_phone: event.target.value })} /></Field>
            <Field label="Phone label"><input value={form.phone_label || ""} onChange={(event) => setForm({ ...form, phone_label: event.target.value })} /></Field>
            <Field label="Pilot price"><input type="number" value={form.pilot_price || 0} onChange={(event) => setForm({ ...form, pilot_price: Number(event.target.value) })} /></Field>
            <Field label="Held appointment fee"><input type="number" value={form.per_held_appointment_fee || 0} onChange={(event) => setForm({ ...form, per_held_appointment_fee: Number(event.target.value) })} /></Field>
            <Field label="Pilot account target"><input type="number" value={form.pilot_account_target || 0} onChange={(event) => setForm({ ...form, pilot_account_target: Number(event.target.value) })} /></Field>
            <Field label="Pilot duration (days)"><input type="number" value={form.pilot_duration_days || 0} onChange={(event) => setForm({ ...form, pilot_duration_days: Number(event.target.value) })} /></Field>
            <Field label="Business mailing address" wide><textarea value={form.business_mailing_address || ""} onChange={(event) => setForm({ ...form, business_mailing_address: event.target.value })} /></Field>
          </div>
        </section>
        <section className="pipeline-panel">
          <h2>Compliance and qualification</h2>
          <div className="pipeline-fields">
            <Field label="Sender name"><input value={form.sender_identity_name || ""} onChange={(event) => setForm({ ...form, sender_identity_name: event.target.value })} /></Field>
            <Field label="Sender email"><input type="email" value={form.sender_identity_email || ""} onChange={(event) => setForm({ ...form, sender_identity_email: event.target.value })} /></Field>
            <Field label="Default opt-out" wide><textarea value={form.default_opt_out_language || ""} onChange={(event) => setForm({ ...form, default_opt_out_language: event.target.value })} /></Field>
            <Field label="Qualification defaults" wide><textarea value={form.default_qualification_criteria || ""} onChange={(event) => setForm({ ...form, default_qualification_criteria: event.target.value })} /></Field>
            <Field label="Limited guarantee" wide><textarea value={form.limited_guarantee || ""} onChange={(event) => setForm({ ...form, limited_guarantee: event.target.value })} /></Field>
            <Field label="No-guarantee disclosure" wide><textarea value={form.no_guarantee_disclaimer || ""} onChange={(event) => setForm({ ...form, no_guarantee_disclaimer: event.target.value })} /></Field>
          </div>
        </section>
      </div>

      <div className="pipeline-grid two" style={{ marginTop: 18 }}>
        <section className="pipeline-panel">
          <h2>Setup wizard</h2>
          <div className="pipeline-fields">
            <Field label="Current setup step" wide>
              <select value={form.setup_step || "business_details"} onChange={(event) => setForm({ ...form, setup_step: event.target.value, setup_complete: event.target.value === "complete" })}>
                {SETUP_STEPS.map((step) => <option value={step} key={step}>{prettify(step)}</option>)}
              </select>
            </Field>
            <Field label="Service agreement URL" wide><input value={form.service_agreement_url || ""} onChange={(event) => setForm({ ...form, service_agreement_url: event.target.value })} /></Field>
            <Field label="Payment methods"><input value={form.payment_methods || "manual"} onChange={(event) => setForm({ ...form, payment_methods: event.target.value })} /></Field>
            <Field label="Calendar options"><input value={form.calendar_options || ""} onChange={(event) => setForm({ ...form, calendar_options: event.target.value })} /></Field>
          </div>
        </section>
        <section className="pipeline-panel">
          <h2>Integrations and advanced AI</h2>
          <ul className="pipeline-list">
            {["Gmail — manual compose link active", "Google Calendar — links and .ics active", "Google Meet — manual meeting-link field active", "Google Sheets — CSV fallback active", "Stripe — manual billing active", "Ironline Office — optional won-opportunity link active"].map((item) => <li className="pipeline-list-item" key={item}><strong>{item}</strong><Status>Manual fallback</Status></li>)}
          </ul>
          <div className="pipeline-alert" style={{ marginTop: 14 }}>Advanced AI is intentionally deferred. Any future generated copy must display “AI draft—review required” and must never send automatically.</div>
        </section>
      </div>

      <section className="pipeline-panel" style={{ marginTop: 18 }}>
        <h2>Editable templates</h2>
        <div className="pipeline-grid two">
          {data.templates.map((record) => (
            <article className="pipeline-card" key={record.id}>
              <h3>{record.name}</h3>
              <p className="pipeline-muted">{record.subject || prettify(record.template_type)}</p>
              <button className="pipeline-button secondary" onClick={() => setTemplate({ ...record })}>Edit template</button>
            </article>
          ))}
        </div>
      </section>

      {template ? (
        <Modal title="Edit human-reviewed template" onClose={() => setTemplate(null)}>
          <div className="pipeline-fields">
            <Field label="Name"><input value={template.name || ""} onChange={(event) => setTemplate({ ...template, name: event.target.value })} /></Field>
            <Field label="Subject"><input value={template.subject || ""} onChange={(event) => setTemplate({ ...template, subject: event.target.value })} /></Field>
            <Field label="Body" wide><textarea style={{ minHeight: 260 }} value={template.body || ""} onChange={(event) => setTemplate({ ...template, body: event.target.value })} /></Field>
            <Field label="Opt-out language" wide><textarea value={template.opt_out_language || ""} onChange={(event) => setTemplate({ ...template, opt_out_language: event.target.value })} /></Field>
          </div>
          <div className="pipeline-actions" style={{ marginTop: 18 }}>
            <button className="pipeline-button" disabled={busy} onClick={async () => {
              const result = await run("save_template", { id: template.id, template }, "Template saved.");
              if (result) setTemplate(null);
            }}>Save template</button>
            <button className="pipeline-button secondary" onClick={() => setTemplate(null)}>Cancel</button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

function UsersView({ data, run, busy }) {
  const [form, setForm] = useState({ role: "client_admin", organization_id: "" });
  return (
    <>
      <PageHead view="users" />
      <div className="pipeline-grid two">
        <section className="pipeline-panel">
          <h2>Invite user</h2>
          <div className="pipeline-fields">
            <Field label="Email" wide><input type="email" value={form.email || ""} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
            <Field label="Pipeline role">
              <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                <option value="mooretech_manager">MooreTech Campaign Manager</option>
                <option value="mooretech_staff">MooreTech Researcher / Caller</option>
                <option value="client_admin">Client Administrator</option>
                <option value="client_viewer">Client Viewer</option>
              </select>
            </Field>
            <Field label="Client organization">
              <select value={form.organization_id} onChange={(event) => setForm({ ...form, organization_id: event.target.value })}>
                <option value="">MooreTech internal / no client</option>
                {data.organizations.filter((record) => record.organization_type === "client").map((record) => <option value={record.id} key={record.id}>{record.organization_name}</option>)}
              </select>
            </Field>
          </div>
          <button className="pipeline-button" style={{ marginTop: 16 }} disabled={busy || !form.email} onClick={() => run("invite_user", form, "Invitation generated.")}>Send / generate invitation</button>
        </section>
        <section className="pipeline-panel">
          <h2>Role boundaries</h2>
          <ul>
            <li>Owner: full access.</li>
            <li>Campaign Manager: assigned clients and campaigns; billing allowed.</li>
            <li>Researcher / Caller: assigned campaign work; no billing.</li>
            <li>Client Administrator: own organization; approvals and outcomes.</li>
            <li>Client Viewer: own organization, read-only.</li>
          </ul>
        </section>
      </div>
      <section className="pipeline-panel" style={{ marginTop: 18 }}>
        <div className="pipeline-table-wrap">
          <table className="pipeline-table">
            <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Organization</th><th>Status</th></tr></thead>
            <tbody>
              {data.users.map((record) => (
                <tr key={record.id}>
                  <td>{record.full_name || record.name || "User"}</td>
                  <td>{record.email}</td>
                  <td><Status>{record.role}</Status></td>
                  <td>{data.organizations.find((org) => org.id === record.organization_id)?.organization_name || "MooreTech / none"}</td>
                  <td><Status tone={record.active === false ? "bad" : "good"}>{record.active === false ? "inactive" : "active"}</Status></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function AuditView({ data }) {
  return (
    <>
      <PageHead view="audit" />
      <section className="pipeline-panel">
        {data.audit_logs.length ? (
          <div className="pipeline-table-wrap">
            <table className="pipeline-table">
              <thead><tr><th>When</th><th>Action</th><th>Entity</th><th>User</th><th>Description</th></tr></thead>
              <tbody>
                {data.audit_logs.map((record) => (
                  <tr key={record.id}><td>{dateLabel(record.created_date)}</td><td><Status>{record.action}</Status></td><td>{record.entity_type}<small>{record.record_id}</small></td><td>{record.changed_by_email || record.changed_by}</td><td>{record.description}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>No audit entries are available.</Empty>}
      </section>
    </>
  );
}

export default function PipelineApp() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const view = location.pathname.split("/")[2] || "dashboard";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [demoRole, setDemoRoleState] = useState(() => sessionStorage.getItem("mooretech_demo_role") || "");

  const setDemoRole = (value) => {
    setDemoRoleState(value);
    if (value) sessionStorage.setItem("mooretech_demo_role", value);
    else sessionStorage.removeItem("mooretech_demo_role");
  };

  const load = useCallback(async () => {
    if (!auth.isAuthenticated) return;
    setLoading(true);
    setError("");
    try {
      const result = await pipelineApi("bootstrap", { demo_role: demoRole });
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [auth.isAuthenticated, demoRole]);

  useEffect(() => {
    if (auth.authChecked && auth.isAuthenticated) load();
    if (auth.authChecked && !auth.isAuthenticated) setLoading(false);
  }, [auth.authChecked, auth.isAuthenticated, load]);

  const run = async (action, payload, successMessage = "Saved.", shouldReload = true) => {
    setBusy(action);
    setError("");
    setMessage("");
    try {
      const result = await pipelineApi(action, payload);
      if (successMessage) setMessage(successMessage);
      if (shouldReload) await load();
      return result;
    } catch (err) {
      const detail = Array.isArray(err.details) ? " " + err.details.join("; ") : "";
      setError(err.message + detail);
      return null;
    } finally {
      setBusy("");
    }
  };

  if (auth.isLoadingAuth || !auth.authChecked || loading) {
    return <div className="pipeline-root pipeline-loading"><Loader2 className="animate-spin" size={34} /></div>;
  }
  if (!auth.isAuthenticated) return <LoginRequired />;
  if (!data) {
    return <div className="pipeline-root pipeline-auth"><div className="pipeline-auth-panel"><h1>Pipeline could not load</h1><div className="pipeline-error">{error || "Unknown error"}</div><button className="pipeline-button" onClick={load}>Retry</button></div></div>;
  }

  const simClient = demoRole === "client";
  const simManager = demoRole === "manager";
  const canOwner = data.capabilities.owner && !demoRole;
  const canInternal = data.capabilities.internal && !simClient;
  const canReview = canInternal || data.capabilities.client_admin || simClient;
  const canEditIntake = canInternal || data.capabilities.client_admin || simClient;
  const canManageBilling = canOwner || data.capabilities.manager || simManager;
  const visibleNav = NAV.filter(([, , , gate]) => {
    if (!gate) return true;
    if (gate === "owner") return canOwner;
    if (gate === "internal") return canInternal;
    if (gate === "billing") return !data.capabilities.staff || simManager;
    if (gate === "owner_or_demo") return data.capabilities.owner;
    return true;
  });

  let content;
  const props = { data, run, busy, navigate, demoRole };
  switch (view) {
    case "inbox": content = <InboxView {...props} />; break;
    case "prospects": content = canOwner ? <ProspectsView {...props} /> : <DashboardView {...props} />; break;
    case "campaigns": content = <CampaignsView {...props} canOwner={canOwner} />; break;
    case "onboarding": content = <OnboardingView {...props} canEdit={canEditIntake} />; break;
    case "accounts": content = <AccountsView {...props} canInternal={canInternal} canReview={canReview} />; break;
    case "outreach": content = canInternal ? <OutreachView {...props} /> : <DashboardView {...props} />; break;
    case "appointments": content = <AppointmentsView {...props} canInternal={canInternal} />; break;
    case "reports": content = <ReportsView {...props} canInternal={canInternal} />; break;
    case "billing": content = <BillingView {...props} canManageBilling={canManageBilling} />; break;
    case "demo": content = data.capabilities.owner ? <DemoView {...props} setDemoRole={setDemoRole} /> : <DashboardView {...props} />; break;
    case "settings": content = canOwner ? <SettingsView {...props} /> : <DashboardView {...props} />; break;
    case "users": content = canOwner ? <UsersView {...props} /> : <DashboardView {...props} />; break;
    case "audit": content = canOwner ? <AuditView {...props} /> : <DashboardView {...props} />; break;
    default: content = <DashboardView {...props} />;
  }

  return (
    <div className="pipeline-root">
      <div className="pipeline-app">
        <aside className="pipeline-sidebar">
          <div className="pipeline-brand">
            <strong>MooreTech</strong>
            <span>Commercial Pipeline</span>
          </div>
          <nav className="pipeline-nav" aria-label="Pipeline navigation">
            {visibleNav.map(([path, label, Icon]) => (
              <NavLink className={({ isActive }) => "pipeline-nav-link " + (isActive ? "active" : "")} to={"/pipeline/" + path} key={path}>
                <Icon size={17} /> {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="pipeline-main" id="main-content">
          <header className="pipeline-topbar">
            <div className="pipeline-topbar-title">
              <strong>{VIEW_COPY[view]?.[0] || VIEW_COPY.dashboard[0]}</strong>
              <span>{data.user.name} · {data.user.email}</span>
            </div>
            <span className="pipeline-role">{prettify(data.user.role)}</span>
            <button className="pipeline-icon-button" title="Refresh data" onClick={load}><RefreshCw size={17} /></button>
            <button className="pipeline-icon-button" title="Sign out" onClick={() => auth.logout()}><LogOut size={17} /></button>
          </header>
          <div className="pipeline-content">
            {message ? <div className="pipeline-success" style={{ marginBottom: 16 }}>{message}</div> : null}
            {error ? <div className="pipeline-error" style={{ marginBottom: 16 }}><AlertTriangle size={17} /> {error}</div> : null}
            {busy ? <div className="pipeline-note" style={{ marginBottom: 16 }}><Loader2 className="animate-spin" size={16} /> Saving securely…</div> : null}
            {content}
          </div>
        </main>
      </div>
    </div>
  );
}
