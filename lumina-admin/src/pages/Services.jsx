import React, { useState, useEffect } from 'react';
import client from '../api/client';

const emptyService = {
  title: '',
  img: '',
  price: '',
  reference_images: ''
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit Dialog Modal State
  const [editingService, setEditingService] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', img: '', price: '', reference_images: '' });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ ...emptyService });
  const [addManualUrl, setAddManualUrl] = useState('');
  const [addUploading, setAddUploading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState('');

  // Delete Confirm State
  const [deletingService, setDeletingService] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchServices = async () => {
    try {
      const response = await client.get('/admin/services');
      if (response.success) {
        setServices(response.data);
      } else {
        setError(response.message || 'Failed to load services list.');
      }
    } catch (err) {
      setError('An unexpected error occurred reading services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // ─── Edit Handlers ────────────────────────────────────────────────────────────
  const handleOpenEdit = (s) => {
    setEditingService(s);
    setEditForm({
      title: s.title || '',
      img: s.img || '',
      price: s.price || '0.00',
      reference_images: s.reference_images || ''
    });
    setSaveSuccess('');
    setManualUrl('');
  };

  const handleCloseEdit = () => {
    setEditingService(null);
    setSaveSuccess('');
    setManualUrl('');
  };

  const handleUploadReference = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await client.post('/uploads/product-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.success) {
        const newUrl = response.data.imageUrl;
        const currentRefs = editForm.reference_images ? editForm.reference_images.split(',').map(x => x.trim()).filter(Boolean) : [];
        currentRefs.push(newUrl);
        setEditForm(prev => ({ ...prev, reference_images: currentRefs.join(',') }));
      } else {
        setError(response.message || 'Image upload failed.');
      }
    } catch (err) {
      setError('Error uploading image.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveReference = (urlToRemove) => {
    const currentRefs = editForm.reference_images ? editForm.reference_images.split(',').map(x => x.trim()).filter(Boolean) : [];
    setEditForm(prev => ({ ...prev, reference_images: currentRefs.filter(url => url !== urlToRemove).join(',') }));
  };

  const handleAddManualUrl = (e) => {
    e.preventDefault();
    if (!manualUrl) return;
    const currentRefs = editForm.reference_images ? editForm.reference_images.split(',').map(x => x.trim()).filter(Boolean) : [];
    currentRefs.push(manualUrl.trim());
    setEditForm(prev => ({ ...prev, reference_images: currentRefs.join(',') }));
    setManualUrl('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');
    setSaveSuccess('');
    try {
      const response = await client.patch(`/admin/services/${editingService.id}`, editForm);
      if (response.success) {
        setSaveSuccess('Service catalog pricing updated successfully!');
        setServices(prev => prev.map(s => s.id === editingService.id ? response.data.service : s));
        setTimeout(() => { handleCloseEdit(); }, 1500);
      } else {
        setError(response.message || 'Failed to update service details.');
      }
    } catch (err) {
      setError('An unexpected error occurred during save.');
    } finally {
      setSaveLoading(false);
    }
  };

  // ─── Add Handlers ─────────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setAddForm({ ...emptyService });
    setAddManualUrl('');
    setAddSuccess('');
    setError('');
    setShowAddModal(true);
  };

  const handleCloseAdd = () => {
    setShowAddModal(false);
    setAddSuccess('');
    setAddManualUrl('');
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUploadReference = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAddUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await client.post('/uploads/product-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.success) {
        const newUrl = response.data.imageUrl;
        const currentRefs = addForm.reference_images ? addForm.reference_images.split(',').map(x => x.trim()).filter(Boolean) : [];
        currentRefs.push(newUrl);
        setAddForm(prev => ({ ...prev, reference_images: currentRefs.join(',') }));
      } else {
        setError(response.message || 'Image upload failed.');
      }
    } catch (err) {
      setError('Error uploading image.');
    } finally {
      setAddUploading(false);
      e.target.value = '';
    }
  };

  const handleAddRemoveReference = (urlToRemove) => {
    const currentRefs = addForm.reference_images ? addForm.reference_images.split(',').map(x => x.trim()).filter(Boolean) : [];
    setAddForm(prev => ({ ...prev, reference_images: currentRefs.filter(url => url !== urlToRemove).join(',') }));
  };

  const handleAddManualUrlSubmit = (e) => {
    e.preventDefault();
    if (!addManualUrl) return;
    const currentRefs = addForm.reference_images ? addForm.reference_images.split(',').map(x => x.trim()).filter(Boolean) : [];
    currentRefs.push(addManualUrl.trim());
    setAddForm(prev => ({ ...prev, reference_images: currentRefs.join(',') }));
    setAddManualUrl('');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setError('');
    setAddSuccess('');
    try {
      const response = await client.post('/admin/services', addForm);
      if (response.success) {
        setAddSuccess('New service added to the catalog!');
        setServices(prev => [...prev, response.data.service]);
        setTimeout(() => { handleCloseAdd(); }, 1500);
      } else {
        setError(response.message || 'Failed to create service.');
      }
    } catch (err) {
      setError('An unexpected error occurred while creating service.');
    } finally {
      setAddLoading(false);
    }
  };

  // ─── Delete Handlers ──────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deletingService) return;
    setDeleteLoading(true);
    setError('');
    try {
      const response = await client.delete(`/admin/services/${deletingService.id}`);
      if (response.success) {
        setServices(prev => prev.filter(s => s.id !== deletingService.id));
        setDeletingService(null);
      } else {
        setError(response.message || 'Failed to delete service.');
        setDeletingService(null);
      }
    } catch (err) {
      setError('An unexpected error occurred during deletion.');
      setDeletingService(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─── Reference Image Panel (reusable render helper) ───────────────────────────
  const ReferencePanel = ({ refs, onRemove, onUpload, uploading, manualUrl, setManualUrl, onAddUrl }) => {
    const parsed = refs ? refs.split(',').map(x => x.trim()).filter(Boolean) : [];
    return (
      <div className="form-group full-width" style={{ marginTop: '10px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#c3a168', fontWeight: '600', fontSize: '0.9rem' }}>Reference Images Showcase</label>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px', minHeight: '70px', padding: '10px', backgroundColor: '#111', borderRadius: '6px', border: '1px solid #222' }}>
          {parsed.length > 0 ? parsed.map((url, idx) => (
            <div key={idx} style={{ position: 'relative', width: '65px', height: '65px', border: '1px solid #333', borderRadius: '4px', overflow: 'hidden' }}>
              <img src={url} alt="Reference Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => onRemove(url)}
                style={{ position: 'absolute', top: '2px', right: '2px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.75)', color: '#ff6b6b', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', padding: 0 }}
                title="Remove"
              >&times;</button>
            </div>
          )) : (
            <div style={{ color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', fontStyle: 'italic' }}>
              No reference images uploaded. Add some below!
            </div>
          )}
        </div>

        <div className="ref-upload-row">
          <label style={{ backgroundColor: '#161616', border: '1px dashed rgba(195,161,104,0.4)', borderRadius: '6px', padding: '10px 12px', color: '#c3a168', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', textAlign: 'center', flex: '1', display: 'inline-block', transition: 'all 0.2s' }}>
            {uploading ? 'Uploading...' : '↑ Upload Image'}
            <input type="file" accept="image/*" onChange={onUpload} style={{ display: 'none' }} disabled={uploading} />
          </label>
          <div className="ref-url-wrapper">
            <input type="url" placeholder="Or paste image URL..." value={manualUrl} onChange={(e) => setManualUrl(e.target.value)} className="ref-url-input" />
            <button type="button" onClick={onAddUrl} className="btn-primary ref-url-btn">Add URL</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-page-container">
      <header className="admin-page-header">
        <div>
          <h1>Photography Services &amp; Pricing</h1>
          <p className="subtitle">Configure details and set core package pricing for photography, videography, and streaming services.</p>
        </div>
        <button className="btn-primary" onClick={handleOpenAdd} style={{ whiteSpace: 'nowrap', alignSelf: 'center' }}>
          + Add Service
        </button>
      </header>

      {saveSuccess && <div className="admin-success-banner">{saveSuccess}</div>}
      {error && <div className="admin-error-banner">{error}</div>}

      {loading ? (
        <div className="admin-page-loading">
          <div className="admin-spinner"></div>
          <span>Loading photography services...</span>
        </div>
      ) : (
        <div className="products-admin-grid">
          {services.map((s) => (
            <div key={s.id} className="product-admin-card service-admin-card">
              <div className="product-img-frame">
                <img src={s.img} alt={s.title} />
                <span className="product-category-tag service-tag">Service {s.id}</span>
              </div>

              <div className="product-card-body">
                <h3>{s.title}</h3>

                <div className="price-details-row" style={{ marginTop: '15px', marginBottom: '20px' }}>
                  <div className="price-box" style={{ flex: '1' }}>
                    <span className="lbl">Base Package Price</span>
                    <strong className="val" style={{ color: '#c3a168', fontSize: '1.4rem' }}>
                      ₹{parseFloat(s.price) === 0 ? 'Custom / Contact' : Math.round(s.price).toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary edit-catalog-btn" style={{ flex: 1 }} onClick={() => handleOpenEdit(s)}>
                    Adjust Package Price
                  </button>
                  <button
                    className="btn-cancel"
                    style={{ flex: '0 0 auto', padding: '10px 14px', color: '#ff6b6b', borderColor: 'rgba(255,107,107,0.3)', backgroundColor: 'rgba(255,107,107,0.08)' }}
                    onClick={() => setDeletingService(s)}
                    title="Delete Service"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Edit Service Modal ─────────────────────────────────────────────── */}
      {editingService && (
        <div className="checkout-modal-overlay">
          <div className="checkout-modal-container" style={{ maxWidth: '550px' }}>
            <div className="checkout-modal-header">
              <h2>Adjust Service Package</h2>
              <button className="checkout-close-btn" onClick={handleCloseEdit}>&times;</button>
            </div>

            <form onSubmit={handleFormSubmit} className="checkout-form" style={{ padding: '20px 25px' }}>
              <div className="checkout-form-grid" style={{ gap: '15px', marginBottom: '20px' }}>
                <div className="form-group half-width">
                  <label>Service Title</label>
                  <input type="text" name="title" value={editForm.title} onChange={handleInputChange} required />
                </div>
                <div className="form-group half-width">
                  <label>Base Package Price (₹)</label>
                  <input type="number" name="price" value={editForm.price} onChange={handleInputChange} placeholder="Enter price or 0 for Quote" required />
                </div>
                <div className="form-group full-width">
                  <label>Display Cover Image URL</label>
                  <input type="url" name="img" value={editForm.img} onChange={handleInputChange} placeholder="https://images.unsplash.com/..." />
                </div>
                <ReferencePanel
                  refs={editForm.reference_images}
                  onRemove={handleRemoveReference}
                  onUpload={handleUploadReference}
                  uploading={uploading}
                  manualUrl={manualUrl}
                  setManualUrl={setManualUrl}
                  onAddUrl={handleAddManualUrl}
                />
              </div>

              <div className="checkout-footer-buttons" style={{ paddingTop: '20px', marginTop: '20px' }}>
                <button type="button" className="btn-cancel" onClick={handleCloseEdit} disabled={saveLoading}>Discard</button>
                <button type="submit" className="btn-primary" disabled={saveLoading}>
                  {saveLoading ? 'Saving changes...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Service Modal ──────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="checkout-modal-overlay">
          <div className="checkout-modal-container" style={{ maxWidth: '580px' }}>
            <div className="checkout-modal-header">
              <h2>Add New Photography Service</h2>
              <button className="checkout-close-btn" onClick={handleCloseAdd}>&times;</button>
            </div>

            {addSuccess && <div className="admin-success-banner" style={{ margin: '0 25px' }}>{addSuccess}</div>}

            <form onSubmit={handleAddSubmit} className="checkout-form" style={{ padding: '20px 25px' }}>
              <div className="checkout-form-grid" style={{ gap: '15px', marginBottom: '20px' }}>
                <div className="form-group half-width">
                  <label>Service Title *</label>
                  <input type="text" name="title" value={addForm.title} onChange={handleAddFormChange} required placeholder="e.g. Drone Aerial Photography" />
                </div>
                <div className="form-group half-width">
                  <label>Base Package Price (₹) *</label>
                  <input type="number" name="price" value={addForm.price} onChange={handleAddFormChange} placeholder="Enter price or 0 for Quote" required min="0" step="0.01" />
                </div>
                <div className="form-group full-width">
                  <label>Display Cover Image URL</label>
                  <input type="url" name="img" value={addForm.img} onChange={handleAddFormChange} placeholder="https://images.unsplash.com/..." />
                  {addForm.img && (
                    <div style={{ marginTop: '8px', width: '80px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #333' }}>
                      <img src={addForm.img} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                    </div>
                  )}
                </div>
                <ReferencePanel
                  refs={addForm.reference_images}
                  onRemove={handleAddRemoveReference}
                  onUpload={handleAddUploadReference}
                  uploading={addUploading}
                  manualUrl={addManualUrl}
                  setManualUrl={setAddManualUrl}
                  onAddUrl={handleAddManualUrlSubmit}
                />
              </div>

              <div className="checkout-footer-buttons" style={{ paddingTop: '20px', marginTop: '0' }}>
                <button type="button" className="btn-cancel" onClick={handleCloseAdd} disabled={addLoading}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={addLoading}>
                  {addLoading ? 'Creating...' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ───────────────────────────────────────────── */}
      {deletingService && (
        <div className="checkout-modal-overlay">
          <div className="checkout-modal-container" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div className="checkout-modal-header">
              <h2>Delete Service</h2>
              <button className="checkout-close-btn" onClick={() => setDeletingService(null)}>&times;</button>
            </div>
            <div style={{ padding: '25px' }}>
              <p style={{ color: '#ccc', marginBottom: '8px' }}>Are you sure you want to permanently delete:</p>
              <p style={{ color: '#c3a168', fontWeight: '700', fontSize: '1.1rem', marginBottom: '24px' }}>"{deletingService.title}"</p>
              <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '24px' }}>This action cannot be undone. The service will no longer appear on the storefront.</p>
              <div className="checkout-footer-buttons">
                <button type="button" className="btn-cancel" onClick={() => setDeletingService(null)} disabled={deleteLoading}>Cancel</button>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ backgroundColor: '#c0392b', borderColor: '#c0392b' }}
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
