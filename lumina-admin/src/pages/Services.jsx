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
    price: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

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
      price: s.price || '0.00'
    });
    setSaveSuccess('');
  };

  const handleCloseEdit = () => {
    setEditingService(null);
    setSaveSuccess('');
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
          <div className="checkout-modal-container" style={{ maxWidth: '500px' }}>
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
