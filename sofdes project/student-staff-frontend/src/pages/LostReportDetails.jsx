import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ClipboardCheck } from 'lucide-react';
import { AlertStrip, ItemThumbnail, MiniTimeline, PageHeader, PrimaryLink, SectionCard, StatusBadge } from '../components/ui';

export default function LostReportDetails() {
  const { id } = useParams(); // Raw database ID
  const [report, setReport] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load user role
  let role = '';
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    role = user?.role || '';
  } catch {
    role = '';
  }

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      try {
        // 1. Fetch Lost Report Details
        const detailsResponse = await fetch(`http://localhost:5000/api/v1/lost-items/${id}`, { headers });
        const detailsJson = await detailsResponse.json();

        if (!detailsResponse.ok) {
          throw new Error(detailsJson.message || 'Failed to load report details.');
        }

        const r = detailsJson.data.report;
        const mappedReport = {
          id: `LST-${String(r.lost_report_id).padStart(4, '0')}`,
          rawId: r.lost_report_id,
          title: r.item_name,
          description: r.description,
          category: r.category,
          owner: `${r.first_name} ${r.last_name}`,
          contact: r.email,
          lostDate: r.date_lost,
          reportedDate: new Date(r.created_at).toLocaleDateString(),
          location: r.last_known_location,
          lastSeen: r.description, // detailed description serves as area details
          priority: r.status === 'Matched' ? 'High' : 'Normal',
          status: r.status,
          created_at: r.created_at
        };
        setReport(mappedReport);

        // 2. Fetch Scored Matches from the Suggestive Matching Engine
        const matchesResponse = await fetch(`http://localhost:5000/api/v1/matches/${id}`, { headers });
        const matchesJson = await matchesResponse.json();

        if (matchesResponse.ok) {
          const suggestions = matchesJson.data.suggestions || [];
          const mappedMatches = suggestions.map(s => ({
            id: `FND-${String(s.found_report_id).padStart(4, '0')}`,
            rawId: s.found_report_id,
            title: s.item_name,
            category: s.category,
            location: s.location_found,
            foundDate: s.date_found,
            status: s.status === 'Unclaimed' ? 'Available' : s.status,
            thumbnail: s.category.toLowerCase() === 'electronics' ? 'laptop' : null,
            description: s.description,
            score: s.match_score
          }));
          setMatches(mappedMatches);
        }
      } catch (err) {
        setError(err.message || 'Error connecting to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleConfirmMatch = async (foundReportId) => {
    if (!window.confirm('Are you sure you want to confirm this match? This will lock both reports as Matched.')) return;

    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    try {
      const response = await fetch(`http://localhost:5000/api/v1/matches/${report.rawId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ found_report_id: foundReportId }),
      });

      const json = await response.json();
      if (response.ok) {
        alert('Match confirmed successfully!');
        window.location.reload();
      } else {
        throw new Error(json.message || 'Failed to confirm match.');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg font-semibold text-slate-600 animate-pulse">Loading report details...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="space-y-4">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-campus-green">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <div className="rounded bg-red-50 p-4 border border-red-200 text-red-700">
          <p className="font-bold">Error loading details</p>
          <p className="text-sm mt-1">{error || 'Report not found.'}</p>
        </div>
      </div>
    );
  }

  // Construct timeline events dynamically
  const timeline = [
    [report.reportedDate, 'Lost report submitted']
  ];
  if (report.status === 'Matched') {
    timeline.push(['System Matched', 'Suggested found item matches discovered']);
  } else if (report.status === 'Claimed') {
    timeline.push(['Closed', 'Item claimed and returned to owner']);
  }

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

      {report.status === 'Matched' ? (
        <AlertStrip>
          A found-item intake shares the same category, keywords, or campus location. Review candidates below and file a claim.
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
                ['Priority', report.priority],
                ['Contact', report.contact],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md bg-slate-50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</dt>
                  <dd className="mt-1 text-sm font-medium text-campus-ink">{value || 'N/A'}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>

          <SectionCard title="Suggested matches" subtitle="Scored found item candidates linked by matching engine">
            {matches.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {matches.map((item) => (
                  <article key={item.rawId} className="rounded-lg border border-slate-200 p-4 flex flex-col justify-between">
                    <div>
                      <ItemThumbnail type={item.thumbnail} className="min-h-36" />
                      <div className="mt-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-campus-ink">{item.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{item.location}</p>
                        </div>
                        <div className="text-right">
                          <StatusBadge value={item.status} />
                          <p className="text-xs text-slate-400 mt-1 font-semibold">Score: {item.score}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                    </div>
                    <div className="mt-4 pt-2 border-t border-slate-100 flex gap-2">
                      {role === 'Admin' && report.status === 'Pending' && item.status === 'Available' ? (
                        <button
                          onClick={() => handleConfirmMatch(item.rawId)}
                          className="w-full inline-flex items-center justify-center gap-2 rounded bg-campus-green py-2 text-sm font-semibold text-white hover:bg-teal-800"
                        >
                          Confirm Match
                        </button>
                      ) : (
                        <PrimaryLink to={`/claim?found_id=${item.rawId}`} icon={ClipboardCheck}>Start claim</PrimaryLink>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No possible matches are currently found for this report.</p>
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
              <MiniTimeline events={timeline} />
            </div>
          </SectionCard>

          <SectionCard title="Next action">
            <div className="space-y-3">
              {report.status !== 'Claimed' && (
                <PrimaryLink to={`/claim`}>Create claim request</PrimaryLink>
              )}
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
