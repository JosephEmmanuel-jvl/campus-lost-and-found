import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Upload } from 'lucide-react';
import { campusLocations, categories } from '../data/mockData';
import { AlertStrip, FormField, PageHeader, SectionCard, inputClasses, selectClasses, textareaClasses } from '../components/ui';

export default function ReportLostItem() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    date_lost: '',
    time_lost: '',
    building: '',
    area: '',
    keywords: '',
    description: '',
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      setCurrentUser(user);
    } catch (e) {
      console.error('Error parsing user from localStorage', e);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be signed in to submit a report.');
      setLoading(false);
      return;
    }

    // Prepare last known location by combining building and area details
    const last_known_location = `${formData.building}${formData.area ? ` - ${formData.area}` : ''}`;

    try {
      const response = await fetch('http://localhost:5000/api/v1/lost-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_name: formData.item_name,
          category: formData.category,
          date_lost: formData.date_lost,
          keywords: formData.keywords,
          last_known_location: last_known_location,
          description: formData.description,
          photo_url: '', // Default placeholder for reference photo
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit the lost item report.');
      }

      // Navigate to the newly created report's details page
      const reportId = result.data?.lost_report_id || result.data?.id;
      if (reportId) {
        navigate(`/lost-reports/${reportId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student report"
        title="Report Lost Item"
        description="Capture the item, last known location, and identifying details for campus staff review."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <SectionCard title="Lost item details" subtitle="Item, location, and identifying information">
          <form onSubmit={handleSubmit} className="grid gap-5">
            {error && (
              <div className="rounded bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                {error}
              </div>
            )}
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Item name">
                <input
                  name="item_name"
                  value={formData.item_name}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Enter item name"
                  required
                />
              </FormField>
              <FormField label="Category">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={selectClasses}
                  required
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Date lost">
                <input
                  name="date_lost"
                  type="date"
                  value={formData.date_lost}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </FormField>
              <FormField label="Approximate time">
                <input
                  name="time_lost"
                  value={formData.time_lost}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Enter approximate time"
                />
              </FormField>
              <FormField label="Last known building">
                <select
                  name="building"
                  value={formData.building}
                  onChange={handleChange}
                  className={selectClasses}
                  required
                >
                  <option value="" disabled>Select building</option>
                  {campusLocations.map((location) => (
                    <option key={location}>{location}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Room or area">
                <input
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Enter room, desk, or area"
                />
              </FormField>
              <FormField label="Keywords">
                <input
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="wallet, black, leather"
                  required
                />
              </FormField>
            </div>

            <FormField label="Identifying details">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={textareaClasses}
                placeholder="Describe color, marks, stickers, serial clues, or other identifiers."
                required
              />
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
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-campus-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit report'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </SectionCard>

        <div className="space-y-6">
          <AlertStrip>
            Staff can hide sensitive item details from public found-item listings while keeping them available for ownership verification.
          </AlertStrip>
          {currentUser && (
            <SectionCard title="Contact on file">
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-700">Student</p>
                  <p className="text-slate-500">{currentUser.first_name} {currentUser.last_name} - {currentUser.university_id}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Email</p>
                  <p className="text-slate-500">{currentUser.email}</p>
                </div>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

