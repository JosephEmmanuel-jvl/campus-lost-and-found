import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, FileCheck2, Loader2, Check, X } from 'lucide-react';
import { AlertStrip, FormField, ItemThumbnail, PageHeader, SectionCard, StatusBadge, inputClasses, selectClasses, textareaClasses } from '../components/ui';
import { apiClient } from '../api/client';
import { API_BASE_URL } from '../config';

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

  const userRole = currentUser?.role || currentUserFromStorage?.role || '';
  const isStaff = userRole === 'Staff';
  const isAdmin = userRole === 'Admin';
  const isViewOnly = queryParams.get('mode') !== 'claim' || isAdmin;

  const [proofOfOwnership, setProofOfOwnership] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Claimant info inputs state
  const [claimantFirstName, setClaimantFirstName] = useState('');
  const [claimantLastName, setClaimantLastName] = useState('');
  const [claimantEmail, setClaimantEmail] = useState('');
  const [claimantPhone, setClaimantPhone] = useState('');

  // Admin claims list state
  const [claimsList, setClaimsList] = useState([]);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [processingClaimId, setProcessingClaimId] = useState(null);
  const [rejectClaimId, setRejectClaimId] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');

  // Student claim status state
  const [userClaim, setUserClaim] = useState(null);
  const [loadingClaim, setLoadingClaim] = useState(false);

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

  const fetchClaimsList = async () => {
    if (!foundId) return;
    setLoadingClaims(true);
    try {
      const json = await apiClient.get('/api/v1/admin/claims');
      if (json && json.data && json.data.claims) {
        const filtered = json.data.claims.filter(
          (c) => c.found_report_id === Number(foundId)
        );
        setClaimsList(filtered);
      }
    } catch (err) {
      console.error('Error fetching admin claims:', err);
    } finally {
      setLoadingClaims(false);
    }
  };

  const fetchUserClaim = async () => {
    if (!foundId) return;
    setLoadingClaim(true);
    try {
      const json = await apiClient.get('/api/v1/claims/user');
      if (json && json.data && json.data.claims) {
        const claim = json.data.claims.find(
          (c) => c.found_report_id === Number(foundId)
        );
        setUserClaim(claim || null);
      }
    } catch (err) {
      console.error('Error fetching user claim:', err);
    } finally {
      setLoadingClaim(false);
    }
  };

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
          setItem(null);
        } finally {
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

  useEffect(() => {
    if (currentUser) {
      setClaimantFirstName(currentUser.first_name || '');
      setClaimantLastName(currentUser.last_name || '');
      setClaimantEmail(currentUser.email || '');
      setClaimantPhone(currentUser.contact_number || '');
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && foundId) {
      if (isAdmin) {
        fetchClaimsList();
      } else {
        fetchUserClaim();
      }
    }
  }, [currentUser, foundId, isAdmin]);

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
      setItem(null);
    } finally {
      setLoadingItem(false);
    }
  };

  const handleApprove = async (claimId) => {
    if (!window.confirm('Are you sure you want to approve this claim? This will resolve the item.')) return;
    setProcessingClaimId(claimId);
    setError('');
    try {
      const result = await apiClient.patch(`/api/v1/claims/${claimId}/approve`, {
        admin_remarks: 'Verified ownership at campus safety desk.',
      });
      if (result) {
        alert('Claim approved successfully.');
        fetchClaimsList();
        // Refresh item status
        if (foundId) {
          const json = await apiClient.get(`/api/v1/found-items/${foundId}`);
          if (json && json.data) {
            setItem(json.data.report || json.data.foundItem || json.data);
          }
        }
      }
    } catch (err) {
      alert(err.message || 'Approval failed.');
    } finally {
      setProcessingClaimId(null);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectRemarks.trim()) {
      alert('Remarks are required for rejecting a claim.');
      return;
    }
    setProcessingClaimId(rejectClaimId);
    setError('');
    try {
      const result = await apiClient.patch(`/api/v1/claims/${rejectClaimId}/reject`, {
        admin_remarks: rejectRemarks,
      });
      if (result) {
        alert('Claim rejected.');
        setRejectClaimId(null);
        setRejectRemarks('');
        fetchClaimsList();
      }
    } catch (err) {
      alert(err.message || 'Rejection failed.');
    } finally {
      setProcessingClaimId(null);
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
      // 1. Save updated claimant information first
      await apiClient.put('/api/v1/users/profile', {
        first_name: claimantFirstName,
        last_name: claimantLastName,
        email: claimantEmail,
        contact_number: claimantPhone,
      });
      window.dispatchEvent(new Event('userUpdated'));

      // 2. Upload supporting photo evidence if selected
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

      // 3. Submit claim request
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
        eyebrow={isViewOnly ? "Found Item" : "Ownership verification"}
        title={isViewOnly ? "Found Item Details" : "Claim Request"}
        description={isViewOnly ? "Detailed information about the found item reported on campus." : "Submit identifying details for staff review before pickup approval."}
      />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <SectionCard title={isViewOnly ? "Found Item Details" : "Selected found item"}>
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
                <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600 space-y-1">
                  <p>Found Location: <span className="font-semibold text-campus-ink">{item.location_found}</span></p>
                  {item.first_name && (
                    <p>Reported By: <span className="font-semibold text-campus-ink">{item.first_name} {item.last_name} ({item.email})</span></p>
                  )}
                  {item.date_found && (
                    <p>Date Found: <span className="font-semibold text-campus-ink">{new Date(item.date_found).toLocaleDateString()}</span></p>
                  )}
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
          {isAdmin ? (
            /* Admin View: Review all claims for this item */
            <SectionCard title="Verify Claim Requests" subtitle="Review proof of ownership submitted by claimants">
              {rejectClaimId && (
                <div className="rounded-lg border border-red-300 bg-red-50/50 p-5 mb-5">
                  <h3 className="font-bold text-red-900">Provide Rejection Remarks</h3>
                  <form onSubmit={handleRejectSubmit} className="mt-3 space-y-3">
                    <textarea
                      className="w-full rounded-md border border-slate-300 p-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      placeholder="Reason for rejection (e.g. proof mismatch, wrong details)"
                      value={rejectRemarks}
                      onChange={(e) => setRejectRemarks(e.target.value)}
                      required
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">
                        Confirm Reject
                      </button>
                      <button type="button" onClick={() => setRejectClaimId(null)} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {loadingClaims ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-campus-green" />
                </div>
              ) : claimsList.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">No claim requests have been filed for this item yet.</p>
              ) : (
                <div className="space-y-4">
                  {claimsList.map((claim) => (
                    <div key={claim.claim_id} className="rounded-lg border border-slate-200 p-4 space-y-3 bg-white shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-campus-ink text-sm">
                            Claimant: {claim.claimant_first_name} {claim.claimant_last_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            University ID: {claim.claimant_university_id}
                          </p>
                          <p className="text-xs text-slate-500">
                            Submitted: {new Date(claim.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <StatusBadge value={claim.status} />
                      </div>

                      {(() => {
                        let text = claim.proof_of_ownership || '';
                        let evidenceImg = '';
                        const match = text.match(/\[Evidence Image:\s*([^\]]+)\]/);
                        if (match) {
                          evidenceImg = match[1];
                          text = text.replace(/\[Evidence Image:\s*[^\]]+\]/, '').trim();
                        }
                        return (
                          <div className="space-y-2">
                            <div className="bg-slate-50 p-3 rounded text-sm text-slate-700 border border-slate-100">
                              <span className="font-semibold block text-xs text-slate-500 mb-1">PROOF OF OWNERSHIP:</span>
                              {text}
                            </div>
                            {evidenceImg && (
                              <div className="mt-2">
                                <span className="font-semibold block text-xs text-slate-500 mb-1">SUPPORTING EVIDENCE IMAGE:</span>
                                <img
                                  src={evidenceImg.startsWith('/') && !evidenceImg.startsWith('//') ? `${API_BASE_URL}${evidenceImg}` : evidenceImg}
                                  alt="Evidence"
                                  className="max-h-48 rounded-md border border-slate-200 object-contain bg-slate-50 p-1"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {claim.admin_remarks && (
                        <div className="text-xs bg-amber-50 p-2.5 rounded text-amber-800 border border-amber-100">
                          <span className="font-bold">Admin Remarks: </span> {claim.admin_remarks}
                        </div>
                      )}

                      {claim.status === 'Pending' && (
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => handleApprove(claim.claim_id)}
                            disabled={processingClaimId !== null}
                            className="inline-flex items-center gap-1 rounded bg-campus-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                          >
                            <Check className="h-3 w-3" /> Approve
                          </button>
                          <button
                            onClick={() => setRejectClaimId(claim.claim_id)}
                            disabled={processingClaimId !== null}
                            className="inline-flex items-center gap-1 rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            <X className="h-3 w-3" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end border-t border-slate-200 pt-5 mt-5">
                <Link to="/search" className="inline-flex justify-center rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Back to items
                </Link>
              </div>
            </SectionCard>
          ) : isViewOnly ? (
            /* Student View Only: Display the submitted claim or static view message */
            <SectionCard title="Claim details" subtitle="Viewing found report details">
              {loadingClaim ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-campus-green" />
                </div>
              ) : userClaim ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-md border border-slate-200 bg-slate-50">
                    <div>
                      <p className="font-bold text-campus-ink text-sm">Your Claim Request</p>
                      <p className="text-xs text-slate-500">Submitted: {new Date(userClaim.created_at).toLocaleDateString()}</p>
                    </div>
                    <StatusBadge value={userClaim.status} />
                  </div>

                  {(() => {
                    let text = userClaim.proof_of_ownership || '';
                    let evidenceImg = '';
                    const match = text.match(/\[Evidence Image:\s*([^\]]+)\]/);
                    if (match) {
                      evidenceImg = match[1];
                      text = text.replace(/\[Evidence Image:\s*[^\]]+\]/, '').trim();
                    }
                    return (
                      <div className="space-y-2">
                        <div className="bg-slate-50 p-3 rounded text-sm text-slate-700 border border-slate-100">
                          <span className="font-semibold block text-xs text-slate-500 mb-1">YOUR SUBMITTED PROOF:</span>
                          {text}
                        </div>
                        {evidenceImg && (
                          <div className="mt-2">
                            <span className="font-semibold block text-xs text-slate-500 mb-1">ATTACHED EVIDENCE IMAGE:</span>
                            <img
                              src={evidenceImg.startsWith('/') && !evidenceImg.startsWith('//') ? `${API_BASE_URL}${evidenceImg}` : evidenceImg}
                              alt="Evidence"
                              className="max-h-48 rounded-md border border-slate-200 object-contain bg-slate-50 p-1"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {userClaim.admin_remarks && (
                    <div className="text-sm bg-amber-50 p-3 rounded text-amber-800 border border-amber-100">
                      <span className="font-bold">Remarks from Staff: </span> {userClaim.admin_remarks}
                    </div>
                  )}

                  {userClaim.status === 'Approved' && (
                    <div className="rounded bg-teal-50 p-4 border border-teal-200 text-teal-800 text-sm">
                      Please proceed to the holding office to retrieve your item. Make sure to present your Student ID.
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
                    <p className="text-slate-600 font-medium">You are currently viewing this found report details.</p>
                    <p className="text-slate-500 text-sm mt-1">To submit a claim, start a claim from a lost item report matches page.</p>
                  </div>
                </div>
              )}
              <div className="flex justify-end border-t border-slate-200 pt-5 mt-5">
                <Link to="/search" className="inline-flex justify-center rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Back to items
                </Link>
              </div>
            </SectionCard>
          ) : (
            /* Student Input View: Form to submit a claim */
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
                  <FormField label="First Name">
                    <input
                      className={inputClasses}
                      value={claimantFirstName}
                      onChange={(e) => setClaimantFirstName(e.target.value)}
                      placeholder="Enter first name"
                      required
                    />
                  </FormField>
                  <FormField label="Last Name">
                    <input
                      className={inputClasses}
                      value={claimantLastName}
                      onChange={(e) => setClaimantLastName(e.target.value)}
                      placeholder="Enter last name"
                      required
                    />
                  </FormField>
                  <FormField label="Student ID">
                    <input
                      disabled
                      className={`${inputClasses} bg-slate-100 cursor-not-allowed`}
                      value={currentUser?.university_id || ''}
                      placeholder="Student ID"
                    />
                  </FormField>
                  <FormField label="University email">
                    <input
                      type="email"
                      className={inputClasses}
                      value={claimantEmail}
                      onChange={(e) => setClaimantEmail(e.target.value)}
                      placeholder="Enter email"
                      required
                    />
                  </FormField>
                  <FormField label="Phone">
                    <input
                      className={inputClasses}
                      value={claimantPhone}
                      onChange={(e) => setClaimantPhone(e.target.value)}
                      placeholder="Enter phone number"
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
