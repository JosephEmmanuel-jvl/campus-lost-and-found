import { Link } from 'react-router-dom';
import { ArrowRight, FileCheck2 } from 'lucide-react';
import { currentStudent, foundItems } from '../data/mockData';
import { AlertStrip, FormField, ItemThumbnail, PageHeader, SectionCard, StatusBadge, inputClasses, textareaClasses } from '../components/ui';

export default function ClaimRequest() {
  const item = foundItems[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ownership verification"
        title="Claim Request"
        description="Submit identifying details for staff review before pickup approval."
      />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <SectionCard title="Selected found item">
          <ItemThumbnail type={item.thumbnail} />
          <div className="mt-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-campus-ink">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.id} - {item.category}</p>
              </div>
              <StatusBadge value={item.status} />
            </div>
            <p className="text-sm leading-6 text-slate-600">{item.description}</p>
            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              Held at <span className="font-semibold text-campus-ink">{item.intakeOffice}</span>
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <AlertStrip>
            Staff will compare these details against private report notes and withheld item characteristics before releasing property.
          </AlertStrip>

          <SectionCard title="Claimant information" subtitle="Details used by campus staff to verify ownership">
            <form className="grid gap-5">
              <div className="grid gap-5 md:grid-cols-2">
                <FormField label="Student name">
                  <input name="student_name" className={inputClasses} placeholder={currentStudent.name || 'Enter full name'} />
                </FormField>
                <FormField label="Student ID">
                  <input name="student_id" className={inputClasses} placeholder={currentStudent.studentId || 'Enter university ID'} />
                </FormField>
                <FormField label="University email">
                  <input name="email" className={inputClasses} placeholder={currentStudent.email || 'Enter university email'} />
                </FormField>
                <FormField label="Phone">
                  <input name="phone" className={inputClasses} placeholder="Enter contact number" />
                </FormField>
              </div>

              <FormField label="Ownership details">
                <textarea name="proof_of_ownership" className={textareaClasses} placeholder="Describe details only the owner would know." />
              </FormField>

              <FormField label="Preferred pickup office">
                <select name="pickup_office" className={inputClasses} defaultValue="">
                  <option value="" disabled>Select pickup office</option>
                  <option>Campus Safety Office</option>
                  <option>Library Circulation Desk</option>
                  <option>Student Affairs Desk</option>
                  <option>Athletics Front Desk</option>
                </select>
              </FormField>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <FileCheck2 className="h-5 w-5 text-campus-green" />
                  <div>
                    <p className="font-semibold text-campus-ink">Supporting evidence</p>
                    <p className="text-sm text-slate-500">Receipt, serial number, or photo proof</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <Link to="/search" className="inline-flex justify-center rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Back to items
                </Link>
                <Link to="/notifications" className="inline-flex items-center justify-center gap-2 rounded-md bg-campus-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
                  Submit claim
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </form>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
