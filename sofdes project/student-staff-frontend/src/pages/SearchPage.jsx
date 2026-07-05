import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Filter, Search, SlidersHorizontal } from 'lucide-react';
import { categories, campusLocations } from '../data/mockData';
import { EmptyState, ItemThumbnail, PageHeader, SectionCard, StatusBadge, inputClasses, selectClasses } from '../components/ui';

export default function SearchPage() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All categories');
  const [location, setLocation] = useState('All locations');
  const [type, setType] = useState('All reports');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (category && category !== 'All categories') params.append('category', category);
      if (location && location !== 'All locations') params.append('location', location);

      try {
        const response = await fetch(`http://localhost:5000/api/v1/search?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const json = await response.json();

        if (response.ok) {
          const rawResults = json.data.results || [];
          const mapped = rawResults.map(r => ({
            id: r.report_type === 'lost' ? `LST-${String(r.report_id).padStart(4, '0')}` : `FND-${String(r.report_id).padStart(4, '0')}`,
            rawId: r.report_id,
            type: r.report_type === 'lost' ? 'Lost Report' : 'Found Item',
            title: r.item_name,
            category: r.category,
            status: r.status === 'Unclaimed' ? 'Available' : r.status,
            date: r.date,
            location: r.location,
            description: r.description,
            route: r.report_type === 'lost' ? `/lost-reports/${r.report_id}` : `/claim/${r.report_id}`,
            actionLabel: r.report_type === 'lost' ? 'View report' : 'Start claim',
            thumbnail: r.category.toLowerCase() === 'electronics' ? 'laptop' : null,
          }));
          setResults(mapped);
        } else {
          throw new Error(json.message || 'Failed to search records.');
        }
      } catch (err) {
        setError(err.message || 'Error connecting to search server.');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search slightly to avoid excessive API calls while typing
    const timeoutId = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [keyword, category, location]);

  const filteredResults = useMemo(() => {
    return results.filter((row) => type === 'All reports' || row.type === type);
  }, [results, type]);

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
        subtitle={loading ? 'Searching...' : `${filteredResults.length} matching record${filteredResults.length === 1 ? '' : 's'}`}
        action={
          <span className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600">
            <Filter className="h-4 w-4" />
            Database API
          </span>
        }
      >
        {error && (
          <div className="rounded bg-red-50 p-4 border border-red-200 text-red-700 mb-4">
            <p className="font-bold">Search error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {filteredResults.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredResults.map((row) => (
              <article key={`${row.type}-${row.rawId}`} className="rounded-lg border border-slate-200 p-4">
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
          !loading && <EmptyState title="No records found" message="Adjust the keyword, category, location, or report type filters." />
        )}
      </SectionCard>
    </div>
  );
}
