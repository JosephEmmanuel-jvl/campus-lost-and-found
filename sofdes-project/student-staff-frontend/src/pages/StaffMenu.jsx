import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, PackageOpen, Search, ShieldCheck, Check, X, Loader2 } from 'lucide-react';
import { PageHeader, PrimaryLink, SectionCard, StatCard, StatusBadge, ItemThumbnail } from '../components/ui';
import { apiClient } from '../api/client';
import { API_BASE_URL } from '../config';

export default function StaffMenu() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_lost_reports: 0,
    total_found_reports: 0,
    pending_claims: 0,
    approved_claims: 0,
    matched_lost_reports: 0,
    recovery_rate_percent: 0,
  });

  const [foundItems, setFoundItems] = useState([]);
  const [lostReports, setLostReports] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  
  // State for rejection remarks prompt
  const [rejectId, setRejectId] = useState(null);
  const [remarks, setRemarks] = useState('');

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await apiClient.get('/api/v1/auth/me');
        if (response && response.data && response.data.user) {
          const freshUser = response.data.user;
          setCurrentUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        }
      } catch (err) {
        console.error('Failed to load user profile.', err);
      }
    };
    loadUser();
    window.addEventListener('userUpdated', loadUser);
    return () => window.removeEventListener('userUpdated', loadUser);
  }, []);

  const role = currentUser?.role || '';

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Fetch dashboard statistics
      const statsJson = await apiClient.get('/api/v1/admin/dashboard');
      if (statsJson && statsJson.data) {
        setStats(statsJson.data.statistics);
      }

      // 2. Fetch all reports for the intake list
      const reportsJson = await apiClient.get('/api/v1/admin/reports');
      if (reportsJson && reportsJson.data) {
        setFoundItems(reportsJson.data.found_reports || []);
        setLostReports(reportsJson.data.lost_reports || []);
      }

      // 3. Fetch all claim requests (pending or all)
      const claimsJson = await apiClient.get('/api/v1/admin/claims');
      if (claimsJson && claimsJson.data) {
        setClaims(claimsJson.data.claims || []);
      }
    } catch (err) {
      setError(err.message || 'Error connecting to admin APIs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (claimId) => {
    if (!window.confirm('Are you sure you want to approve this claim? This will resolve the item.')) return;
    setProcessingId(claimId);

    try {
      const result = await apiClient.patch(`/api/v1/claims/${claimId}/approve`, {
        admin_remarks: 'Verified ownership at campus safety desk.',
      });
      if (result) {
        alert('Claim approved successfully.');
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Approval failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!remarks.trim()) {
      alert('Remarks are required for rejecting a claim.');
      return;
    }

    setProcessingId(rejectId);

    try {
      const result = await apiClient.patch(`/api/v1/claims/${rejectId}/reject`, {
        admin_remarks: remarks,
      });
      if (result) {
        alert('Claim rejected.');
        setRejectId(null);
        setRemarks('');
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Rejection failed.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={role === 'Admin' ? 'Admin Control Center' : 'Staff Control Center'}
        title={currentUser?.first_name ? `Welcome back, ${currentUser.first_name}!` : 'Welcome!'}
        description="Verify ownership claims, view system stats, and confirm suggestive matches."
        action={<PrimaryLink to="/report-found" icon={PackageOpen}>Record found item</PrimaryLink>}
      />

      {error && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-campus-green" />
        </div>
      )}

      {!loading && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Found items" value={stats.total_found_reports} icon={PackageOpen} tone="green" detail="Registered in database" />
            <StatCard label="Lost reports" value={stats.total_lost_reports} icon={Search} tone="blue" detail="Active search filings" />
            <StatCard label="Pending claims" value={stats.pending_claims} icon={ClipboardCheck} tone="amber" detail="Awaiting document verification" />
            <StatCard label="Recovery rate" value={`${stats.recovery_rate_percent}%`} icon={ShieldCheck} tone="rose" detail="Items returned to owners" />
          </div>

          {rejectId && (
            <div className="rounded-lg border border-red-300 bg-red-50/50 p-5 mt-4">
              <h3 className="font-bold text-red-900">Provide Rejection Remarks</h3>
              <form onSubmit={handleRejectSubmit} className="mt-3 space-y-3">
                <textarea
                  className="w-full rounded-md border border-slate-300 p-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  placeholder="Reason for rejection (e.g. proof mismatch, wrong details)"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  required
                />
                <div className="flex gap-2">
                  <button type="submit" className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">
                    Confirm Reject
                  </button>
                  <button type="button" onClick={() => setRejectId(null)} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <SectionCard title="Pending Claim Approvals" subtitle="Verify claimants' proof of ownership before releasing item">
              <div className="space-y-4">
                {claims.filter(c => c.status === 'Pending').length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 text-center">No pending claim requests.</p>
                ) : (
                  claims.filter(c => c.status === 'Pending').map((claim) => (
                    <div key={claim.claim_id} className="rounded-lg border border-slate-200 p-4 space-y-3 bg-white">
                      <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                        <ItemThumbnail category={claim.found_item_category} photoUrl={claim.found_item_photo_url} className="min-h-24 sm:min-h-full" />
                        <div className="space-y-3 flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-campus-ink">
                                Claim for: {claim.found_item_name || `Found Item #${claim.found_report_id}`}
                              </p>
                              <p className="text-xs text-slate-500">
                                Claimant: {claim.claimant_first_name ? `${claim.claimant_first_name} ${claim.claimant_last_name}` : 'Student'} ({claim.claimant_university_id})
                              </p>
                            </div>
                            <StatusBadge value={claim.status} />
                          </div>
                          
                          {(() => {
                            let text = claim.proof_of_ownership || '';
                            let evidenceImg = '';
                            const match = text.match(/\[Evidence Image:\s*([^\]]+)\]/);
                            if (match) {
                              evidenceImg = match[1];
                              text = text.replace(/\[Evidence Image:\s*[^\]]+\]/, '').trim();
                            }
                            return (
                              <div className="space-y-3">
                                <div className="bg-slate-50 p-3 rounded text-sm text-slate-700 border border-slate-100">
                                  <span className="font-semibold block text-xs text-slate-500 mb-1">PROOF OF OWNERSHIP:</span>
                                  {text}
                                </div>
                                {evidenceImg && (
                                  <div className="mt-2">
                                    <span className="font-semibold block text-xs text-slate-500 mb-1">SUPPORTING EVIDENCE IMAGE:</span>
                                    <img
                                      src={evidenceImg.startsWith('/') && !evidenceImg.startsWith('//') ? `${API_BASE_URL}${evidenceImg}` : evidenceImg}
                                      alt="Evidence"
                                      className="max-h-48 rounded-md border border-slate-200 object-contain bg-slate-50 p-1"
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleApprove(claim.claim_id)}
                          disabled={processingId !== null}
                          className="inline-flex items-center gap-1 rounded bg-campus-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                        >
                          <Check className="h-3 w-3" /> Approve
                        </button>
                        <button
                          onClick={() => setRejectId(claim.claim_id)}
                          disabled={processingId !== null}
                          className="inline-flex items-center gap-1 rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          <X className="h-3 w-3" /> Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>

            <div className="space-y-6">
              <SectionCard title="Found Item Inventory Intake" subtitle="Showing recently logged items awaiting matchup">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[400px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.12em] text-slate-500">
                        <th className="pb-3 font-semibold">Item</th>
                        <th className="pb-3 font-semibold">Location</th>
                        <th className="pb-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {foundItems.slice(0, 5).map((item) => (
                        <tr key={item.found_report_id || item.id}>
                          <td className="py-4">
                            <p className="font-semibold text-campus-ink">{item.item_name}</p>
                            <p className="text-xs text-slate-500">
                              FND-{String(item.found_report_id || item.id).padStart(4, '0')} - {item.category}
                            </p>
                          </td>
                          <td className="py-4 text-slate-600">{item.location_found}</td>
                          <td className="py-4">
                            <StatusBadge value={item.status === 'Unclaimed' ? 'Available' : item.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              <SectionCard title="Active Lost Item Reports" subtitle="Student reports awaiting matching & confirmation">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[400px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.12em] text-slate-500">
                        <th className="pb-3 font-semibold">Item</th>
                        <th className="pb-3 font-semibold">Location</th>
                        <th className="pb-3 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lostReports.slice(0, 5).map((report) => (
                        <tr key={report.lost_report_id || report.id}>
                          <td className="py-4">
                            <p className="font-semibold text-campus-ink">{report.item_name}</p>
                            <p className="text-xs text-slate-500">
                              LST-{String(report.lost_report_id || report.id).padStart(4, '0')} - {report.category}
                            </p>
                          </td>
                          <td className="py-4 text-slate-600">{report.last_known_location}</td>
                          <td className="py-4">
                            <Link
                              to={`/lost-reports/${report.lost_report_id || report.id}`}
                              className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-campus-mist hover:text-campus-green transition-colors"
                            >
                              Match
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

