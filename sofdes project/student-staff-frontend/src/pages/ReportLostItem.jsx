import { Link } from 'react-router-dom';
import { ArrowRight, Upload } from 'lucide-react';
import { campusLocations, categories, currentStudent } from '../data/mockData';
import { AlertStrip, FormField, PageHeader, SectionCard, inputClasses, selectClasses, textareaClasses } from '../components/ui';

export default function ReportLostItem() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student report"
        title="Report Lost Item"
        description="Capture the item, last known location, and identifying details for campus staff review."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <SectionCard title="Lost item details" subtitle="Item, location, and identifying information">
          <form className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Item name">
                <input name="item_name" className={inputClasses} placeholder="Enter item name" />
              </FormField>
              <FormField label="Category">
                <select name="category" className={selectClasses} defaultValue="">
                  <option value="" disabled>Select category</option>
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Date lost">
                <input name="date_lost" className={inputClasses} type="date" />
              </FormField>
              <FormField label="Approximate time">
                <input name="time_lost" className={inputClasses} placeholder="Enter approximate time" />
              </FormField>
              <FormField label="Last known building">
                <select name="building" className={selectClasses} defaultValue="">
                  <option value="" disabled>Select building</option>
                  {campusLocations.map((location) => (
                    <option key={location}>{location}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Room or area">
                <input name="area" className={inputClasses} placeholder="Enter room, desk, or area" />
              </FormField>
              <FormField label="Keywords">
                <input name="keywords" className={inputClasses} placeholder="wallet, black, leather" />
              </FormField>
            </div>

            <FormField label="Identifying details">
              <textarea name="description" className={textareaClasses} placeholder="Describe color, marks, stickers, serial clues, or other identifiers." />
            </FormField>

            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-campus-green">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-campus-ink">Reference photo</p>
                    <p className="text-sm text-slate-500">Optional photo for staff review</p>
                  </div>
                </div>
                <button type="button" className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                  Choose file
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
              <Link to="/dashboard" className="inline-flex justify-center rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Cancel
              </Link>
              <Link to="/lost-reports/LST-1042" className="inline-flex items-center justify-center gap-2 rounded-md bg-campus-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
                Submit report
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </form>
        </SectionCard>

        <div className="space-y-6">
          <AlertStrip>
            Staff can hide sensitive item details from public found-item listings while keeping them available for ownership verification.
          </AlertStrip>
          <SectionCard title="Contact on file">
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-slate-700">Student</p>
                <p className="text-slate-500">{currentStudent.name} - {currentStudent.studentId}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700">Email</p>
                <p className="text-slate-500">{currentStudent.email}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700">Pickup preference</p>
                <p className="text-slate-500">{currentStudent.preferredOffice}</p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
