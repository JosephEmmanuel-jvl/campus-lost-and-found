import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BellRing, Megaphone } from 'lucide-react';
import { PageHeader, SectionCard, StatCard, StatusBadge } from '../components/ui';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/api/v1/notifications', { headers });
      const json = await response.json();

      if (response.ok) {
        const rawNotif = json.data.notifications || [];
        const mapped = rawNotif.map((n) => ({
          id: `NOT-${String(n.notification_id).padStart(4, '0')}`,
          rawId: n.notification_id,
          title: n.title,
          type: n.notification_type,
          message: n.message,
          time: new Date(n.created_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          status: n.is_read ? 'Read' : 'Unread',
          is_read: n.is_read,
          route: n.notification_type === 'Match' ? `/lost-reports/${n.related_report_id}` : '/notifications',
        }));
        setNotifications(mapped);
      } else {
        throw new Error(json.message || 'Failed to retrieve notifications.');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (rawId, isRead) => {
    if (isRead) return;

    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/v1/notifications/${rawId}`, {
        method: 'PATCH',
        headers,
      });

      if (response.ok) {
        // Optimistically update notifications in the local state
        setNotifications((prev) =>
          prev.map((n) => (n.rawId === rawId ? { ...n, status: 'Read', is_read: true } : n))
        );
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg font-semibold text-slate-600 animate-pulse">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded bg-red-50 p-4 border border-red-200 text-red-700">
        <p className="font-bold">Error loading notifications</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const unreadCount = notifications.filter((note) => !note.is_read).length;
  const claimUpdatesCount = notifications.filter((note) => note.type === 'Claim').length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Message center"
        title="Notifications"
        description="Campus lost-and-found updates, claim decisions, and office announcements."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Unread" value={unreadCount} icon={BellRing} tone="rose" />
        <StatCard label="Claim updates" value={claimUpdatesCount} icon={Megaphone} tone="blue" />
        <StatCard label="Total updates" value={notifications.length} icon={BellRing} tone="green" />
      </div>

      <SectionCard title="Recent notifications">
        <div className="divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">You don't have any notifications yet.</p>
          ) : (
            notifications.map((note) => (
              <Link
                key={note.rawId}
                to={note.route}
                onClick={() => handleMarkAsRead(note.rawId, note.is_read)}
                className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex gap-4">
                  <div className={`mt-1 h-3 w-3 rounded-full ${!note.is_read ? 'bg-campus-green' : 'bg-slate-300'}`} />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-campus-ink">{note.title}</h2>
                      <StatusBadge value={note.type} />
                    </div>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{note.message}</p>
                    <p className="mt-2 text-xs font-medium text-slate-500">{note.time}</p>
                  </div>
                </div>
                <StatusBadge value={note.status} />
              </Link>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
}
