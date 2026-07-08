import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, FileCheck2, Loader2 } from 'lucide-react';
import { AlertStrip, FormField, ItemThumbnail, PageHeader, SectionCard, StatusBadge, inputClasses, textareaClasses } from '../components/ui';
import { apiClient } from '../api/client';

export default function ClaimRequest() {
  const { foundId } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loadingItem, setLoadingItem] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const queryParams = new URLSearchParams(window.location.search);
  const currentUserFromStorage = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch { return null; }
  })();
  const isViewOnly = queryParams.get('mode') !== 'claim' || (currentUser?.role || currentUserFromStorage?.role) === 'Admin';
  const [proofOfOwnership, setProofOfOwnership] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

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
  };

  // Dropdown states if no ID in path
  const [unclaimedItems, setUnclaimedItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await apiClient.get('/api/v1/auth/me');
        if (response && response.data && response.data.user) {
          setCurrentUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      } catch (err) {
        console.error('Failed to load user profile from DB:', err);
      }
    };
    loadUser();

    // Fetch found item details if ID is present
    if (foundId) {
      const fetchFoundItem = async () => {
        setLoadingItem(true);
        setError('');
        try {
          const json = await apiClient.get(`/api/v1/found-items/${foundId}`);
          if (json && json.data) {
            setItem(json.data.report || json.data.foundItem || json.data);
          }
        } catch (err) {
          setError(err.message || 'Error loading selected item details.');
        } finally {
          setItem(null);
          setLoadingItem(false);
        }
      };
      fetchFoundItem();
    } else {
      // Fetch list of unclaimed found items to choose from
      const fetchUnclaimedList = async () => {
        setLoadingList(true);
        try {
          const json = await apiClient.get('/api/v1/found-items');
          if (json && json.data) {
            const list = json.data.reports || [];
            // Allow claiming both Unclaimed and Matched items (only fully Claimed items are excluded)
            setUnclaimedItems(list.filter(item => item.status !== 'Claimed'));
          }
        } catch (err) {
          console.error('Error fetching unclaimed found items', err);
        } finally {
          setLoadingList(false);
        }
      };
      fetchUnclaimedList();
    }
  }, [foundId]);

  const handleSelectChange = async (e) => {
    const id = e.target.value;
    setSelectedItemId(id);
    if (!id) {
      setItem(null);
      return;
    }

    setLoadingItem(true);
    setError('');
    try {
      const json = await apiClient.get(`/api/v1/found-items/${id}`);
      if (json && json.data) {
        setItem(json.data.report || json.data.foundItem || json.data);
      }
    } catch (err) {
      setError(err.message || 'Error loading selected item details.');
    } finally {
      setLoadingItem(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const activeId = foundId || selectedItemId;
    if (!activeId) {
      setError('No found item selected to claim.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      let finalProof = proofOfOwnership;
      if (photoFile) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(photoFile);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (err) => reject(err);
        });
        const uploadRes = await apiClient.post('/api/v1/upload', { file: base64 });
        const photo_url = uploadRes?.data?.url || '';
        if (photo_url) {
          finalProof = `${proofOfOwnership}\n\n[Evidence Image: ${photo_url}]`;
        }
      }

      const result = await apiClient.post('/api/v1/claims', {
        found_report_id: Number(activeId),
        proof_of_ownership: finalProof,
      });

      if (result) {
        setSuccessMsg('Your claim request was successfully submitted! Redirecting to notifications...');
        setTimeout(() => {
          navigate('/notifications');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong while submitting your claim.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ownership verification"
        title="Claim Request"
        description="Submit identifying details for staff review before pickup approval."
      />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <SectionCard title="Selected found item">
          {!foundId && (
            <div className="mb-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Select found item to claim</label>
              {loadingList ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin text-campus-green" /> Loading inventory...
                </div>
              ) : (
                <select
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-campus-ink outline-none focus:border-campus-green focus:ring-2 focus:ring-campus-green/20"
                  value={selectedItemId}
                  onChange={handleSelectChange}
                >
                  <option value="">Choose an item...</option>
                  {unclaimedItems.map((u) => (
                    <option key={u.found_report_id || u.id} value={u.found_report_id || u.id}>
                      {u.item_name} (FND-{String(u.found_report_id || u.id).padStart(4, '0')} - {u.location_found})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {loadingItem && (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-campus-green" />
            </div>
          )}
          
          {!loadingItem && item && (
            <>
              <ItemThumbnail category={item.category} photoUrl={item.photo_url} />
              <div className="mt-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-campus-ink">{item.item_name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      FND-{String(item.found_report_id || item.id).padStart(4, '0')} - {item.category}
                    </p>
                  </div>
                  <StatusBadge value={item.status === 'Unclaimed' ? 'Available' : item.status} />
                </div>
                <p className="text-sm leading-6 text-slate-600">{item.description}</p>
                <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                  Found Location: <span className="font-semibold text-campus-ink">{item.location_found}</span>
                </div>
              </div>
            </>
          )}

          {!loadingItem && !item && (
            <div className="text-sm text-slate-500 py-4 text-center">
              {foundId ? "No item selected. Please start a claim from the Search catalog page." : "Choose an item from the dropdown list above to proceed."}
            </div>
          )}
        </SectionCard>

        <div className="space-y-6">
          {isViewOnly ? (
            <SectionCard title="Claim details" subtitle="Viewing found report details">
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
                  <p className="text-slate-600 font-medium">You are currently viewing this found report details.</p>
                  {(currentUser?.role || currentUserFromStorage?.role) === 'Admin' ? (
                    <p className="text-slate-500 text-sm mt-1">Admin accounts only have view permissions for lost and found reports.</p>
                  ) : (
                    <p className="text-slate-500 text-sm mt-1">To submit a claim, start a claim from a lost item report matches page.</p>
                  )}
                </div>
                <div className="flex justify-end border-t border-slate-200 pt-5">
                  <Link to="/search" className="inline-flex justify-center rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Back to items
                  </Link>
                </div>
              </div>
            </SectionCard>
          ) : (
            <SectionCard title="Claimant information" subtitle="Details used by campus staff to verify ownership">
              <form onSubmit={handleSubmit} className="grid gap-5">
                {error && (
                  <div className="rounded bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                    {error}
                  </div>
                )}
                {successMsg && (
                  <div className="rounded bg-green-50 p-3 text-sm text-green-600 border border-green-200 font-medium">
                    {successMsg}
                  </div>
                )}
                
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField label="Student name">
                    <input
                      disabled
                      className={`${inputClasses} bg-slate-50 cursor-not-allowed`}
                      value={currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : ''}
                      placeholder="Student name"
                    />
                  </FormField>
                  <FormField label="Student ID">
                    <input
                      disabled
                      className={`${inputClasses} bg-slate-50 cursor-not-allowed`}
                      value={currentUser?.university_id || ''}
                      placeholder="Student ID"
                    />
                  </FormField>
                  <FormField label="University email">
                    <input
                      disabled
                      className={`${inputClasses} bg-slate-50 cursor-not-allowed`}
                      value={currentUser?.email || ''}
                      placeholder="University email"
                    />
                  </FormField>
                  <FormField label="Phone">
                    <input
                      disabled
                      className={`${inputClasses} bg-slate-50 cursor-not-allowed`}
                      value={currentUser?.contact_number || 'None provided'}
                      placeholder="Phone"
                    />
                  </FormField>
                </div>

                <FormField label="Ownership details">
                  <textarea
                    name="proof_of_ownership"
                    value={proofOfOwnership}
                    onChange={(e) => setProofOfOwnership(e.target.value)}
                    className={textareaClasses}
                    placeholder="Describe details only the owner would know (e.g. stickers, contents, passwords, purchase details)."
                    required
                  />
                </FormField>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <input
                    type="file"
                    id="claim-photo-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {photoFile ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {photoPreview && (
                          <img src={photoPreview} alt="Preview" className="h-10 w-10 rounded object-cover border border-slate-200" />
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
                    <button type="button" onClick={() => document.getElementById('claim-photo-upload').click()} className="flex items-center gap-2 text-campus-green hover:text-campus-ink">
                      <FileCheck2 className="h-5 w-5 text-campus-green" />
                      <div className="text-left">
                        <p className="font-semibold text-campus-ink">Attach supporting photo evidence (optional)</p>
                        <p className="text-xs text-slate-500">Upload a receipt, photo of the item, or other ownership proof</p>
                      </div>
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                  <Link to="/search" className="inline-flex justify-center rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Back to items
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting || !item || item.status === 'Claimed'}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-campus-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit claim'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

