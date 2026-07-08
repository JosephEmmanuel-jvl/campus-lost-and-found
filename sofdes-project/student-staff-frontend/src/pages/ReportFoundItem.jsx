import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Camera, PackageCheck } from 'lucide-react';
import { categories } from '../data/mockData';
import { FormField, PageHeader, SectionCard, inputClasses, selectClasses, textareaClasses } from '../components/ui';
import { apiClient } from '../api/client';

export default function ReportFoundItem() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    date_found: '',
    condition: '',
    location_found: '',
    holding_office: '',
    keywords: '',
    description: '',
    photo_url: '',
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormData(prev => ({ ...prev, photo_url: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Append condition and holding office to the description to save detailed information
      const detailedDescription = `[Condition: ${formData.condition}] [Holding Office: ${formData.holding_office}] ${formData.description}`;

      let photo_url = '';
      if (photoFile) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(photoFile);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (err) => reject(err);
        });
        const uploadRes = await apiClient.post('/api/v1/upload', { file: base64 });
        photo_url = uploadRes?.data?.data?.url || '';
      }

      const result = await apiClient.post('/api/v1/found-items', {
        item_name: formData.item_name,
        category: formData.category,
        date_found: formData.date_found,
        keywords: formData.keywords,
        location_found: formData.location_found,
        description: detailedDescription,
        photo_url: photo_url,
      });

      if (result) {
        // Navigate to search page to see results
        navigate('/search');
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
        eyebrow="Found item intake"
        title="Report Found Item"
        description="Campus offices can record recovered items and place them into the review queue."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <SectionCard title="Found item record" subtitle="Intake details used by desk staff and campus offices">
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
              <FormField label="Date found">
                <input
                  name="date_found"
                  type="date"
                  value={formData.date_found}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </FormField>
              <FormField label="Condition">
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className={selectClasses}
                  required
                >
                  <option value="" disabled>Select condition</option>
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Minor scuffs</option>
                  <option>Damaged</option>
                </select>
              </FormField>
              <FormField label="Found location">
                <input
                  name="location_found"
                  value={formData.location_found}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Enter where the item was found"
                  required
                />
              </FormField>
              <FormField label="Holding office">
                <select
                  name="holding_office"
                  value={formData.holding_office}
                  onChange={handleChange}
                  className={selectClasses}
                  required
                >
                  <option value="" disabled>Select holding office</option>
                  <option>Campus Safety Office</option>
                  <option>Library Circulation Desk</option>
                  <option>Student Affairs Desk</option>
                  <option>Athletics Front Desk</option>
                </select>
              </FormField>
              <FormField label="Keywords">
                <input
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="bottle, teal, sticker"
                  required
                />
              </FormField>
            </div>

            <FormField label="Public description">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={textareaClasses}
                placeholder="Describe public details. Keep private identifiers for staff verification."
                required
              />
            </FormField>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Photo">
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {photoFile ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="h-10 w-10 rounded object-cover border border-slate-200" />
                        ) : (
                          <Camera className="h-6 w-6 text-campus-green" />
                        )}
                        <div>
                          <p className="font-semibold text-campus-ink text-sm truncate max-w-[150px]">{photoFile.name}</p>
                          <p className="text-xs text-slate-500">{(photoFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleRemovePhoto}
                        className="text-xs font-semibold text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => document.getElementById('photo-upload').click()} className="flex items-center gap-2 text-campus-green hover:text-campus-ink">
                      <Camera className="h-6 w-6 animate-pulse" />
                      Attach photo
                    </button>
                  )}
                </div>
              </FormField>
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
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-campus-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit found item'}
                <ArrowRight className="h-4 w-4" />
              </button>
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
