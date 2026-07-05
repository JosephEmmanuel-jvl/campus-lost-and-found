import { Link } from 'react-router-dom';
import { ArrowRight, Camera, PackageCheck } from 'lucide-react';
import { categories } from '../data/mockData';
import { FormField, PageHeader, SectionCard, inputClasses, selectClasses, textareaClasses } from '../components/ui';

export default function ReportFoundItem() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Found item intake"
        title="Report Found Item"
        description="Campus offices can record recovered items and place them into the review queue."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <SectionCard title="Found item record" subtitle="Intake details used by desk staff and campus offices">
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
              <FormField label="Date found">
                <input name="date_found" className={inputClasses} type="date" />
              </FormField>
              <FormField label="Condition">
                <select name="condition" className={selectClasses} defaultValue="">
                  <option value="" disabled>Select condition</option>
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Minor scuffs</option>
                  <option>Damaged</option>
                </select>
              </FormField>
              <FormField label="Found location">
                <input name="location_found" className={inputClasses} placeholder="Enter where the item was found" />
              </FormField>
              <FormField label="Holding office">
                <select name="holding_office" className={selectClasses} defaultValue="">
                  <option value="" disabled>Select holding office</option>
                  <option>Campus Safety Office</option>
                  <option>Library Circulation Desk</option>
                  <option>Student Affairs Desk</option>
                  <option>Athletics Front Desk</option>
                </select>
              </FormField>
              <FormField label="Keywords">
                <input name="keywords" className={inputClasses} placeholder="bottle, teal, sticker" />
              </FormField>
            </div>

            <FormField label="Public description">
              <textarea name="description" className={textareaClasses} placeholder="Describe public details. Keep private identifiers for staff verification." />
            </FormField>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
                <Camera className="h-6 w-6 text-campus-green" />
                <p className="mt-3 font-semibold text-campus-ink">Item photo</p>
                <p className="mt-1 text-sm text-slate-500">Photo or intake attachment</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-campus-mist p-5">
                <PackageCheck className="h-6 w-6 text-campus-green" />
                <p className="mt-3 font-semibold text-campus-ink">Storage label</p>
                <p className="mt-1 text-sm text-slate-600">LIB-2026-0628-B12</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
              <Link to="/search" className="inline-flex justify-center rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Cancel
              </Link>
              <Link to="/search" className="inline-flex items-center justify-center gap-2 rounded-md bg-campus-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
                Submit found item
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Recent intake offices" subtitle="Where items are currently held">
          <div className="space-y-3">
            {['Campus Safety Office', 'Library Circulation Desk', 'Student Affairs Desk', 'Athletics Front Desk'].map((office, index) => (
              <div key={office} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                <div>
                  <p className="font-semibold text-campus-ink">{office}</p>
                  <p className="text-sm text-slate-500">{index + 2} items held</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Desk</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
