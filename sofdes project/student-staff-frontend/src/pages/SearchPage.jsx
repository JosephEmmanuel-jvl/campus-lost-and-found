import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Filter, Search, SlidersHorizontal } from 'lucide-react';
import { categories, campusLocations, foundItems, lostReports } from '../data/mockData';
import { EmptyState, ItemThumbnail, PageHeader, SectionCard, StatusBadge, inputClasses, selectClasses } from '../components/ui';

function normalize(value) {
  return String(value || '').toLowerCase();
}

function buildRows() {
  const lostRows = lostReports.map((report) => ({
    id: report.id,
    type: 'Lost Report',
    title: report.title,
    category: report.category,
    status: report.status,
    date: report.lostDate,
    location: report.location,
    description: report.description,
    route: `/lost-reports/${report.id}`,
    actionLabel: 'View report',
    thumbnail: null,
  }));

  const foundRows = foundItems.map((item) => ({
    id: item.id,
    type: 'Found Item',
    title: item.title,
    category: item.category,
    status: item.status,
    date: item.foundDate,
    location: item.location,
    description: item.description,
    route: '/claim',
    actionLabel: 'Start claim',
    thumbnail: item.thumbnail,
  }));

  return [...lostRows, ...foundRows];
}

export default function SearchPage() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All categories');
  const [location, setLocation] = useState('All locations');
  const [type, setType] = useState('All reports');

  const rows = useMemo(() => buildRows(), []);
  const results = useMemo(() => {
    return rows.filter((row) => {
      const keywordMatch =
        !keyword ||
        [row.title, row.description, row.location, row.category, row.id].some((field) =>
          normalize(field).includes(normalize(keyword))
        );
      const categoryMatch = category === 'All categories' || row.category === category;
      const locationMatch = location === 'All locations' || row.location.includes(location);
      const typeMatch = type === 'All reports' || row.type === type;
      return keywordMatch && categoryMatch && locationMatch && typeMatch;
    });
  }, [category, keyword, location, rows, type]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Search"
        title="Search"
        description="Find lost reports and found items by item name, category, campus location, or report ID."
      />

      <SectionCard title="Filters" subtitle="Search by item, category, location, or report type">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              className={`${inputClasses} pl-9`}
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Search laptop, bottle, library, LST-1042"
            />
          </div>
          <select className={selectClasses} value={category} onChange={(event) => setCategory(event.target.value)}>
            <option>All categories</option>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select className={selectClasses} value={location} onChange={(event) => setLocation(event.target.value)}>
            <option>All locations</option>
            {campusLocations.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select className={selectClasses} value={type} onChange={(event) => setType(event.target.value)}>
            <option>All reports</option>
            <option>Lost Report</option>
            <option>Found Item</option>
          </select>
        </div>
      </SectionCard>

      <SectionCard
        title="Results"
        subtitle={`${results.length} matching record${results.length === 1 ? '' : 's'}`}
        action={
          <span className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600">
            <Filter className="h-4 w-4" />
            Local data
          </span>
        }
      >
        {results.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {results.map((row) => (
              <article key={`${row.type}-${row.id}`} className="rounded-lg border border-slate-200 p-4">
                <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
                  {row.thumbnail ? (
                    <ItemThumbnail type={row.thumbnail} className="min-h-32" />
                  ) : (
                    <div className="flex min-h-32 items-center justify-center rounded-lg bg-slate-100 text-campus-green">
                      <SlidersHorizontal className="h-8 w-8" />
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-campus-ink">{row.title}</p>
                          <StatusBadge value={row.type} />
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{row.id} - {row.category}</p>
                      </div>
                      <StatusBadge value={row.status} />
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{row.description}</p>
                    <div className="grid gap-1 text-sm text-slate-500">
                      <p><span className="font-semibold text-slate-700">Date:</span> {row.date}</p>
                      <p><span className="font-semibold text-slate-700">Location:</span> {row.location}</p>
                    </div>
                    <Link to={row.route} className="inline-flex items-center gap-2 rounded-md bg-campus-green px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800">
                      {row.actionLabel}
                      {row.type === 'Found Item' ? <ClipboardCheck className="h-4 w-4" /> : null}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No records found" message="Adjust the keyword, category, location, or report type filters." />
        )}
      </SectionCard>
    </div>
  );
}
