import { useState, useEffect } from 'react';
import { Bell, IdCard, Mail, Phone, Save, ShieldCheck, UserRound } from 'lucide-react';
import { FormField, PageHeader, SectionCard, StatCard, StatusBadge, inputClasses, selectClasses } from '../components/ui';
import { apiClient } from '../api/client';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [reportCount, setReportCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    program: 'Computer Science',
    year: '3rd Year',
    preferredOffice: 'Campus Safety Office',
    emergencyContact: '0917-000-0000',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Load logged-in user from localStorage
    try {
      const sessionUser = JSON.parse(localStorage.getItem('user'));
      if (sessionUser) {
        setUser(sessionUser);
        setFormData(prev => ({
          ...prev,
          firstName: sessionUser.first_name || '',
          lastName: sessionUser.last_name || '',
          email: sessionUser.email || '',
          phone: sessionUser.contact_number || '',
          year: sessionUser.role === 'Student' ? '3rd Year' : 'Staff',
        }));
      }
    } catch (err) {
      console.error('Failed to load user profile from session:', err);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch Lost Reports to count user owned reports
        const lostJson = await apiClient.get('/api/v1/lost-items');
        if (lostJson && lostJson.data) {
          const rawLost = lostJson.data.reports || [];
          const userLost = rawLost.filter(r => r.university_id === user.university_id);
          setReportCount(userLost.length);
        }

        // Fetch Notifications to count unread notifications
        const notifJson = await apiClient.get('/api/v1/notifications');
        if (notifJson && notifJson.data) {
          const rawNotif = notifJson.data.notifications || [];
          const unread = rawNotif.filter(n => !n.is_read).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error('Error fetching statistics for profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.put('/api/v1/users/profile', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        contact_number: formData.phone,
      });
      if (res && res.data && res.data.user) {
        // Persist updated user details locally in session
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setSaveSuccess(true);
        window.dispatchEvent(new Event('userUpdated'));
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving profile changes:', err);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg font-semibold text-slate-600 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  const fullName = `${user.first_name} ${user.last_name}`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="User profile"
        title="Profile"
        description="Contact details and account information used for lost-item reports and claim reviews."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Role" value={user.role} icon={ShieldCheck} tone="green" detail="Current portal access" />
        <StatCard label="Open reports" value={reportCount} icon={IdCard} tone="blue" detail="Your registered reports" />
        <StatCard label="Unread notices" value={unreadCount} icon={Bell} tone="rose" detail="Needs attention" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <SectionCard title="Account details" subtitle="Contact and pickup details for campus records">
          <form onSubmit={handleSave} className="grid gap-5">
            {saveSuccess && (
              <div className="rounded bg-teal-50 p-4 border border-teal-200 text-teal-800 text-sm font-semibold">
                Profile updated successfully!
              </div>
            )}
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="First Name">
                <input 
                  className={inputClasses} 
                  value={formData.firstName} 
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} 
                  required
                />
              </FormField>
              <FormField label="Last Name">
                <input 
                  className={inputClasses} 
                  value={formData.lastName} 
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} 
                  required
                />
              </FormField>
              <FormField label="University ID">
                <input className={`${inputClasses} bg-slate-100 cursor-not-allowed`} readOnly value={user.university_id} />
              </FormField>
              <FormField label="University email">
                <input 
                  type="email"
                  className={inputClasses} 
                  value={formData.email} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                  required
                />
              </FormField>
              <FormField label="Contact number">
                <input 
                  className={inputClasses} 
                  value={formData.phone} 
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                />
              </FormField>
              
              {user.role === 'Student' && (
                <>
                  <FormField label="Program">
                    <input 
                      className={inputClasses} 
                      value={formData.program} 
                      onChange={(e) => setFormData({ ...formData, program: e.target.value })} 
                    />
                  </FormField>
                  <FormField label="Year level">
                    <select 
                      className={selectClasses} 
                      value={formData.year} 
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    >
                      <option>1st Year</option>
                      <option>2nd Year</option>
                      <option>3rd Year</option>
                      <option>4th Year</option>
                    </select>
                  </FormField>
                </>
              )}

              {user.role !== 'Student' && (
                <FormField label="Staff Department">
                  <input className={`${inputClasses} bg-slate-100 cursor-not-allowed`} readOnly value="Campus Administration / Safety" />
                </FormField>
              )}

              <FormField label="Preferred pickup office">
                <select 
                  className={selectClasses} 
                  value={formData.preferredOffice} 
                  onChange={(e) => setFormData({ ...formData, preferredOffice: e.target.value })}
                >
                  <option>Campus Safety Office</option>
                  <option>Library Circulation Desk</option>
                  <option>Student Affairs Desk</option>
                  <option>Athletics Front Desk</option>
                </select>
              </FormField>
              <FormField label="Emergency contact">
                <input 
                  className={inputClasses} 
                  value={formData.emergencyContact} 
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} 
                />
              </FormField>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-campus-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
                <Save className="h-4 w-4" />
                Save profile
              </button>
            </div>
          </form>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="User card">
            <div className="rounded-lg border border-slate-200 bg-campus-mist p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-md bg-campus-green text-white">
                  <UserRound className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-lg font-bold text-campus-ink">{fullName}</p>
                  <p className="text-sm text-slate-600">{user.university_id}</p>
                  <div className="mt-3">
                    <StatusBadge value={user.role} />
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Contact summary">
            <div className="space-y-4 text-sm">
              <div className="flex gap-3 rounded-md border border-slate-200 p-3">
                <Mail className="mt-0.5 h-4 w-4 text-campus-green" />
                <div>
                  <p className="font-semibold text-campus-ink">Email</p>
                  <p className="text-slate-500">{user.email}</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-md border border-slate-200 p-3">
                <Phone className="mt-0.5 h-4 w-4 text-campus-green" />
                <div>
                  <p className="font-semibold text-campus-ink">Phone</p>
                  <p className="text-slate-500">{formData.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="font-semibold text-campus-ink">Account created</p>
                <p className="text-slate-500">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
