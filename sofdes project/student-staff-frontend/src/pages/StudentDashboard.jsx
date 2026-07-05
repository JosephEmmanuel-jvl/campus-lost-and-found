import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ClipboardCheck, FilePlus2, PackageOpen, Search } from 'lucide-react';
import { PageHeader, PrimaryLink, SectionCard, StatCard, StatusBadge } from '../components/ui';

export default function StudentDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [lostReports, setLostReports] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load logged-in user from localStorage
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      setCurrentUser(user);
    } catch (err) {
      setError('Failed to load user profile.');
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      try {
        // 1. Fetch Lost Reports
        const lostResponse = await fetch('http://127.0.0.1:5000/api/v1/lost-items', { headers });
        const lostJson = await lostResponse.json();
        
        // 2. Fetch Found Reports
        const foundResponse = await fetch('http://127.0.0.1:5000/api/v1/found-items', { headers });
        const foundJson = await foundResponse.json();

        // 3. Fetch Notifications
        const notifResponse = await fetch('http://127.0.0.1:5000/api/v1/notifications', { headers });
        const notifJson = await notifResponse.json();

        if (lostResponse.ok && foundResponse.ok && notifResponse.ok) {
          // Map lost reports to UI format
          const rawLost = lostJson.data.reports || [];
          // Filter to only this user's lost reports
          const userLost = rawLost.filter(r => r.university_id === currentUser.university_id);
          const mappedLost = userLost.map(r => ({
            id: `LST-${String(r.lost_report_id).padStart(4, '0')}`,
            rawId: r.lost_report_id,
            title: r.item_name,
            category: r.category,
            location: r.last_known_location,
            lostDate: r.date_lost,
            status: r.status,
          }));
          setLostReports(mappedLost);

          // Map found items to UI format
          const rawFound = foundJson.data.reports || [];
          const mappedFound = rawFound.map(f => ({
            id: `FND-${String(f.found_report_id).padStart(4, '0')}`,
            rawId: f.found_report_id,
            title: f.item_name,
            category: f.category,
            location: f.location_found,
            foundDate: f.date_found,
            status: f.status === 'Unclaimed' ? 'Available' : f.status,
          }));
          setFoundItems(mappedFound);

          // Map notifications to UI format
          const rawNotif = notifJson.data.notifications || [];
          const mappedNotif = rawNotif.map(n => ({
            id: `NOT-${String(n.notification_id).padStart(4, '0')}`,
            rawId: n.notification_id,
            title: n.title,
            type: n.notification_type,
            message: n.message,
            time: new Date(n.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            status: n.is_read ? 'Read' : 'Unread',
            route: n.notification_type === 'Match' ? `/lost-reports/${n.related_report_id}` : '/notifications',
          }));
          setNotifications(mappedNotif);
        } else {
          throw new Error('Failed to retrieve some dashboard resources.');
        }
      } catch (err) {
        setError(err.message || 'Error connecting to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg font-semibold text-slate-600 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded bg-red-50 p-4 border border-red-200 text-red-700">
        <p className="font-bold">Error loading dashboard</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const activeLostReports = lostReports.filter((report) => report.status !== 'Claimed');
  const possibleMatches = lostReports.filter((report) => report.status === 'Matched');
  const availableFoundItems = foundItems.filter((item) => item.status === 'Available');
  const unreadNotices = notifications.filter((note) => note.status === 'Unread');

  const isStaff = currentUser?.role === 'Staff';

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={isStaff ? "Staff dashboard" : "Student dashboard"}
        title={`Welcome back, ${currentUser?.first_name || 'User'}`}
        description={isStaff ? "Track your registered reports, match alerts, and system notifications." : "Track reports, review possible matches, and start a claim when an item appears to be yours."}
        action={<PrimaryLink to="/report-lost" icon={FilePlus2}>Report lost item</PrimaryLink>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active lost reports" value={activeLostReports.length} icon={Search} tone="blue" detail={isStaff ? "Across staff-owned reports" : "Across student-owned reports"} />
        <StatCard label="Possible matches" value={possibleMatches.length} icon={ClipboardCheck} tone="green" detail="Awaiting claim review" />
        <StatCard label="Available found items" value={availableFoundItems.length} icon={PackageOpen} tone="amber" detail="Posted by campus offices" />
        <StatCard label="Unread notices" value={unreadNotices.length} icon={Bell} tone="rose" detail="Recent updates" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <SectionCard title={isStaff ? "My Registered Reports" : "My Lost Reports"} subtitle={isStaff ? "Recent items reported by the signed-in staff member" : "Recent items reported by the signed-in student"}>
          <div className="overflow-x-auto">
            {lostReports.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">You haven't reported any lost items yet.</p>
            ) : (
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.12em] text-slate-500">
                    <th className="pb-3 font-semibold">Report</th>
                    <th className="pb-3 font-semibold">Location</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lostReports.map((report) => (
                    <tr key={report.rawId}>
                      <td className="py-4">
                        <p className="font-semibold text-campus-ink">{report.title}</p>
                        <p className="text-xs text-slate-500">{report.id} - {report.category}</p>
                      </td>
                      <td className="py-4 text-slate-600">{report.location}</td>
                      <td className="py-4 text-slate-600">{report.lostDate}</td>
                      <td className="py-4"><StatusBadge value={report.status} /></td>
                      <td className="py-4">
                        <Link to={`/lost-reports/${report.rawId}`} className="font-semibold text-campus-green hover:text-teal-800">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Recent Notifications" subtitle="Latest claim and item activity" action={<Link to="/notifications" className="text-sm font-semibold text-campus-green">View all</Link>}>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">No notifications.</p>
            ) : (
              notifications.slice(0, 3).map((note) => (
                <Link key={note.rawId} to={note.route} className="block rounded-md border border-slate-200 p-4 hover:border-campus-green/40 hover:bg-campus-mist/50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-campus-ink">{note.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{note.message}</p>
                    </div>
                    <StatusBadge value={note.status} />
                  </div>
                  <p className="mt-3 text-xs font-medium text-slate-500">{note.time}</p>
                </Link>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Found Items Near Your Reports" subtitle="Suggestions based on item category and campus location">
        <div className="grid gap-4 md:grid-cols-3">
          {foundItems.length === 0 ? (
            <div className="col-span-3 text-center py-6 text-sm text-slate-500">No found items currently listed.</div>
          ) : (
            foundItems.slice(0, 3).map((item) => (
              <div key={item.rawId} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-campus-ink">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.location}</p>
                  </div>
                  <StatusBadge value={item.status} />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500">{item.foundDate}</span>
                  <Link to="/claim" className="text-sm font-semibold text-campus-green">Start claim</Link>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
}
