import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ClipboardCheck } from 'lucide-react';
import { foundItems, lostReports } from '../data/mockData';
import { AlertStrip, ItemThumbnail, MiniTimeline, PageHeader, PrimaryLink, SectionCard, StatusBadge } from '../components/ui';

export default function LostReportDetails() {
  const { id } = useParams();
  const report = lostReports.find((item) => item.id === id) || lostReports[0];
  const matches = foundItems.filter((item) => item.matchedLostReportId === report.id);

  return (
    <div className="space-y-6">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-campus-green">
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <PageHeader
        eyebrow={report.id}
        title={report.title}
        description={report.description}
        action={<StatusBadge value={report.status} />}
      />

      {report.status === 'Possible Match' ? (
        <AlertStrip>
          A found-item intake shares the same category, date range, and campus location. Student verification is still required before release.
        </AlertStrip>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <SectionCard title="Report information">
            <dl className="grid gap-4 md:grid-cols-2">
              {[
                ['Owner', report.owner],
                ['Category', report.category],
                ['Lost date', report.lostDate],
                ['Reported date', report.reportedDate],
                ['Last known location', report.location],
                ['Area details', report.lastSeen],
                ['Priority', report.priority],
                ['Contact', report.contact],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md bg-slate-50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</dt>
                  <dd className="mt-1 text-sm font-medium text-campus-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>

          <SectionCard title="Possible matches" subtitle="Found item candidates linked to this report">
            {matches.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {matches.map((item) => (
                  <article key={item.id} className="rounded-lg border border-slate-200 p-4">
                    <ItemThumbnail type={item.thumbnail} className="min-h-36" />
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-campus-ink">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.location}</p>
                      </div>
                      <StatusBadge value={item.status} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                    <div className="mt-4">
                      <PrimaryLink to="/claim" icon={ClipboardCheck}>Start claim</PrimaryLink>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No possible matches are currently linked to this report.</p>
            )}
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Report status">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-md border border-slate-200 p-4">
                <span className="text-sm font-semibold text-slate-700">Current status</span>
                <StatusBadge value={report.status} />
              </div>
              <MiniTimeline events={report.timeline} />
            </div>
          </SectionCard>

          <SectionCard title="Next action">
            <div className="space-y-3">
              <PrimaryLink to="/claim">Create claim request</PrimaryLink>
              <Link to="/notifications" className="block rounded-md border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">
                View notifications
              </Link>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
