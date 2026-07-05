import { Bell, IdCard, Mail, Phone, Save, ShieldCheck, UserRound } from 'lucide-react';
import { currentStudent, lostReports, notifications } from '../data/mockData';
import { FormField, PageHeader, SectionCard, StatCard, StatusBadge, inputClasses, selectClasses } from '../components/ui';

export default function Profile() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student profile"
        title="Profile"
        description="Contact details and account information used for lost-item reports and claim reviews."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Role" value={currentStudent.role} icon={ShieldCheck} tone="green" detail="Current portal access" />
        <StatCard label="Open reports" value={lostReports.length} icon={IdCard} tone="blue" detail="Student-owned records" />
        <StatCard label="Unread notices" value={notifications.filter((note) => note.status === 'Unread').length} icon={Bell} tone="rose" detail="Needs attention" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <SectionCard title="Account details" subtitle="Contact and pickup details for campus records">
          <form className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Full name">
                <input className={inputClasses} defaultValue={currentStudent.name} />
              </FormField>
              <FormField label="University ID">
                <input className={inputClasses} defaultValue={currentStudent.universityId} />
              </FormField>
              <FormField label="University email">
                <input className={inputClasses} defaultValue={currentStudent.email} />
              </FormField>
              <FormField label="Contact number">
                <input className={inputClasses} defaultValue={currentStudent.phone} />
              </FormField>
              <FormField label="Program">
                <input className={inputClasses} defaultValue={currentStudent.program} />
              </FormField>
              <FormField label="Year level">
                <select className={selectClasses} defaultValue={currentStudent.year}>
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                  <option>Staff</option>
                </select>
              </FormField>
              <FormField label="Preferred pickup office">
                <select className={selectClasses} defaultValue={currentStudent.preferredOffice}>
                  <option>Campus Safety Office</option>
                  <option>Library Circulation Desk</option>
                  <option>Student Affairs Desk</option>
                  <option>Athletics Front Desk</option>
                </select>
              </FormField>
              <FormField label="Emergency contact">
                <input className={inputClasses} defaultValue={currentStudent.emergencyContact} />
              </FormField>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
              <button type="button" className="inline-flex items-center justify-center gap-2 rounded-md bg-campus-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
                <Save className="h-4 w-4" />
                Save profile
              </button>
            </div>
          </form>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Student card">
            <div className="rounded-lg border border-slate-200 bg-campus-mist p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-md bg-campus-green text-white">
                  <UserRound className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-lg font-bold text-campus-ink">{currentStudent.name}</p>
                  <p className="text-sm text-slate-600">{currentStudent.studentId}</p>
                  <div className="mt-3">
                    <StatusBadge value={currentStudent.role} />
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
                  <p className="text-slate-500">{currentStudent.email}</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-md border border-slate-200 p-3">
                <Phone className="mt-0.5 h-4 w-4 text-campus-green" />
                <div>
                  <p className="font-semibold text-campus-ink">Phone</p>
                  <p className="text-slate-500">{currentStudent.phone}</p>
                </div>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="font-semibold text-campus-ink">Account created</p>
                <p className="text-slate-500">{currentStudent.createdAt}</p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
