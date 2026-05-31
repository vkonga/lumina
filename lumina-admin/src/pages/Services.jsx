import React, { useState, useEffect } from 'react';
import client from '../api/client';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit Dialog Modal State
  const [editingService, setEditingService] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    img: '',
    price: '',
    reference_images: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [uploading, setUploading] = useState(false);

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
        setEditForm(prev => ({
          ...prev,
          reference_images: currentRefs.join(',')
        }));
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
    const updatedRefs = currentRefs.filter(url => url !== urlToRemove);
    setEditForm(prev => ({
      ...prev,
      reference_images: updatedRefs.join(',')
    }));
  };

  const handleAddManualUrl = (e) => {
    e.preventDefault();
    if (!manualUrl) return;
    const currentRefs = editForm.reference_images ? editForm.reference_images.split(',').map(x => x.trim()).filter(Boolean) : [];
    currentRefs.push(manualUrl.trim());
    setEditForm(prev => ({
      ...prev,
      reference_images: currentRefs.join(',')
    }));
    setManualUrl('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
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
        
        // Refresh local list
        setServices(prev => prev.map(s => s.id === editingService.id ? response.data.service : s));
        
        setTimeout(() => {
          handleCloseEdit();
        }, 1500);
      } else {
        setError(response.message || 'Failed to update service details.');
      }
    } catch (err) {
      setError('An unexpected error occurred during save.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <header className="admin-page-header">
        <div>
          <h1>Photography Services & Pricing</h1>
          <p className="subtitle">Configure details and set core package pricing for photography, videography, and streaming services.</p>
        </div>
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

                <button className="btn-primary edit-catalog-btn" onClick={() => handleOpenEdit(s)}>
                  Adjust Package Price
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <div className="checkout-modal-overlay">
          <div className="checkout-modal-container" style={{ maxWidth: '550px' }}>
            <div className="checkout-modal-header">
              <h2>Adjust Service Package</h2>
              <button className="checkout-close-btn" onClick={handleCloseEdit}>&times;</button>
            </div>

            <form onSubmit={handleFormSubmit} className="checkout-form" style={{ padding: '20px 25px' }}>
              <div className="checkout-form-grid" style={{ gap: '15px', marginBottom: '20px' }}>
                <div className="form-group full-width">
                  <label>Service Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Base Package Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={editForm.price}
                    onChange={handleInputChange}
                    placeholder="Enter price or 0 for Quote"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Display Cover Image URL</label>
                  <input
                    type="url"
                    name="img"
                    value={editForm.img}
                    onChange={handleInputChange}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="form-group full-width" style={{ marginTop: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#c3a168', fontWeight: '600', fontSize: '0.9rem' }}>Reference Images Showcase</label>
                  
                  {/* Thumbnails Showcase */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px', minHeight: '70px', padding: '10px', backgroundColor: '#111', borderRadius: '6px', border: '1px solid #222' }}>
                    {editForm.reference_images ? editForm.reference_images.split(',').map(x => x.trim()).filter(Boolean).map((url, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '65px', height: '65px', border: '1px solid #333', borderRadius: '4px', overflow: 'hidden' }}>
                        <img src={url} alt="Reference Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => handleRemoveReference(url)}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(0, 0, 0, 0.75)',
                            color: '#ff6b6b',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            padding: 0
                          }}
                          title="Remove Reference Image"
                        >
                          &times;
                        </button>
                      </div>
                    )) : (
                      <div style={{ color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', fontStyle: 'italic' }}>
                        No reference images uploaded. Add some below!
                      </div>
                    )}
                  </div>

                  {/* Upload File and Manual Link inputs */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{
                      backgroundColor: '#161616',
                      border: '1px dashed rgba(195, 161, 104, 0.4)',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      color: '#c3a168',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textAlign: 'center',
                      flex: '1',
                      display: 'inline-block',
                      transition: 'all 0.2s'
                    }}>
                      {uploading ? 'Uploading...' : '↑ Upload Image'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadReference}
                        style={{ display: 'none' }}
                        disabled={uploading}
                      />
                    </label>

                    <div style={{ display: 'flex', flex: '2', gap: '6px' }}>
                      <input
                        type="url"
                        placeholder="Or paste image URL..."
                        value={manualUrl}
                        onChange={(e) => setManualUrl(e.target.value)}
                        style={{ flex: '1', fontSize: '0.85rem', padding: '10px', background: '#121212', border: '1px solid #222', color: '#fff', borderRadius: '6px' }}
                      />
                      <button
                        type="button"
                        onClick={handleAddManualUrl}
                        className="btn-primary"
                        style={{ padding: '0 12px', fontSize: '0.85rem', height: '38px', whiteSpace: 'nowrap' }}
                      >
                        Add URL
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="checkout-footer-buttons" style={{ paddingTop: '20px', marginTop: '20px' }}>
                <button type="button" className="btn-cancel" onClick={handleCloseEdit} disabled={saveLoading}>
                  Discard
                </button>
                <button type="submit" className="btn-primary" disabled={saveLoading}>
                  {saveLoading ? 'Saving changes...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
