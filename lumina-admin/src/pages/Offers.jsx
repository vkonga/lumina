import React, { useState, useEffect } from 'react';
import client from '../api/client';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add Offer Form State
  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    discount_code: '',
    image_url: '',
    is_active: true
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState('');

  // Edit Offer Modal State
  const [editingOffer, setEditingOffer] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    discount_code: '',
    image_url: '',
    is_active: true
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  const fetchOffers = async () => {
    try {
      const response = await client.get('/admin/offers');
      if (response.success) {
        setOffers(response.data);
      } else {
        setError(response.message || 'Failed to load offers.');
      }
    } catch (err) {
      setError('An unexpected error occurred reading offers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOffer((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setNewOffer((prev) => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newOffer.title || !newOffer.description) {
      setError('Title and description are required.');
      return;
    }

    setAddLoading(true);
    setError('');
    setAddSuccess('');

    try {
      const response = await client.post('/admin/offers', newOffer);

      if (response.success) {
        setAddSuccess('Offer created successfully!');
        setNewOffer({
          title: '',
          description: '',
          discount_code: '',
          image_url: '',
          is_active: true
        });
        setOffers((prev) => [response.data.offer, ...prev]);
        setTimeout(() => setAddSuccess(''), 4000);
      } else {
        setError(response.message || 'Failed to create offer.');
      }
    } catch (err) {
      setError('An error occurred during creation.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleOpenEdit = (offer) => {
    setEditingOffer(offer);
    setEditForm({
      title: offer.title || '',
      description: offer.description || '',
      discount_code: offer.discount_code || '',
      image_url: offer.image_url || '',
      is_active: offer.is_active !== undefined ? offer.is_active : true
    });
    setSaveSuccess('');
  };

  const handleCloseEdit = () => {
    setEditingOffer(null);
    setSaveSuccess('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');
    setSaveSuccess('');

    try {
      const response = await client.patch(`/admin/offers/${editingOffer.id}`, editForm);

      if (response.success) {
        setSaveSuccess('Offer details updated successfully!');
        setOffers((prev) => prev.map((o) => (o.id === editingOffer.id ? response.data.offer : o)));
        setTimeout(() => {
          handleCloseEdit();
        }, 1200);
      } else {
        setError(response.message || 'Failed to update offer.');
      }
    } catch (err) {
      setError('An error occurred while saving.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer? It will be removed from all users.')) return;

    setError('');
    try {
      const response = await client.delete(`/admin/offers/${id}`);
      if (response.success) {
        setOffers((prev) => prev.filter((o) => o.id !== id));
      } else {
        setError(response.message || 'Failed to delete offer.');
      }
    } catch (err) {
      setError('An error occurred while deleting.');
    }
  };

  const handleToggleStatus = async (offer) => {
    try {
      const updatedStatus = !offer.is_active;
      const response = await client.patch(`/admin/offers/${offer.id}`, {
        title: offer.title,
        description: offer.description,
        image_url: offer.image_url,
        discount_code: offer.discount_code,
        is_active: updatedStatus
      });

      if (response.success) {
        setOffers((prev) => prev.map((o) => (o.id === offer.id ? response.data.offer : o)));
      } else {
        setError(response.message || 'Failed to update status.');
      }
    } catch (err) {
      setError('An error occurred while toggling status.');
    }
  };

  return (
    <div className="admin-page-container">
      <header className="admin-page-header">
        <div>
          <h1>Offers & Promotional Popups</h1>
          <p className="subtitle">Manage store discounts, visual banners, and promotional popups shown to clients on the home page.</p>
        </div>
      </header>

      {addSuccess && <div className="admin-success-banner">{addSuccess}</div>}
      {saveSuccess && <div className="admin-success-banner">{saveSuccess}</div>}
      {error && <div className="admin-error-banner">{error}</div>}

      <div className="order-detail-grid">
        {/* Left Side: Create Offer Form */}
        <div className="detail-col-sidebar" style={{ gap: '25px' }}>
          <div className="detail-card">
            <h3>Create New Offer</h3>
            <form onSubmit={handleAddSubmit} className="status-update-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group">
                <label>Offer Title *</label>
                <input
                  type="text"
                  name="title"
                  value={newOffer.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Monsoon Studio Fest"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={newOffer.description}
                  onChange={handleInputChange}
                  placeholder="e.g. Save 20% on all print formats..."
                  rows="4"
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label>Promo Code (Optional)</label>
                <input
                  type="text"
                  name="discount_code"
                  value={newOffer.discount_code}
                  onChange={handleInputChange}
                  placeholder="e.g. MONSOON20"
                />
              </div>

              <div className="form-group">
                <label>Banner Image URL (Optional)</label>
                <input
                  type="url"
                  name="image_url"
                  value={newOffer.image_url}
                  onChange={handleInputChange}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0' }}>
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={newOffer.is_active}
                  onChange={handleCheckboxChange}
                  style={{ width: 'auto', cursor: 'pointer' }}
                />
                <label htmlFor="is_active" style={{ cursor: 'pointer', marginBottom: 0 }}>Activate immediately</label>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={addLoading}>
                {addLoading ? 'Creating...' : 'Create Offer'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Offers Grid List */}
        <div className="detail-col-main">
          <div className="detail-card" style={{ height: '100%' }}>
            <h3>Active & Scheduled Offers ({offers.length})</h3>

            {loading ? (
              <div className="admin-page-loading" style={{ minHeight: '30vh' }}>
                <div className="admin-spinner"></div>
                <span>Loading promotional offers...</span>
              </div>
            ) : offers.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#666', fontStyle: 'italic' }}>
                No offers created yet. Use the panel on the left to add a promotion.
              </p>
            ) : (
              <div className="products-admin-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="product-admin-card"
                    style={{
                      border: '1px solid #1a1a1a',
                      background: '#090909',
                      opacity: offer.is_active ? 1 : 0.65,
                      transition: 'opacity 0.2s'
                    }}
                  >
                    {offer.image_url ? (
                      <div style={{ height: '150px', overflow: 'hidden', position: 'relative' }}>
                        <img
                          src={offer.image_url}
                          alt={offer.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {!offer.is_active && (
                          <div style={{
                            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#ff6b6b', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px'
                          }}>
                            INACTIVE
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{
                        height: '150px', background: '#111',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        borderBottom: '1px solid #1e1e1e', gap: '8px'
                      }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
                          <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="4"></line>
                          <line x1="8" y1="2" x2="8" y2="4"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span style={{ color: '#444', fontSize: '0.75rem', letterSpacing: '1px' }}>NO BANNER IMAGE</span>
                      </div>
                    )}

                    <div className="product-card-body" style={{ padding: '15px 20px 20px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: '600' }}>{offer.title}</h4>
                        <span
                          onClick={() => handleToggleStatus(offer)}
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 'bold',
                            padding: '3px 8px',
                            borderRadius: '3px',
                            background: offer.is_active ? 'rgba(46, 160, 67, 0.15)' : 'rgba(217, 83, 79, 0.15)',
                            color: offer.is_active ? '#2ea043' : '#d9534f',
                            border: `1px solid ${offer.is_active ? 'rgba(46, 160, 67, 0.3)' : 'rgba(217, 83, 79, 0.3)'}`,
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {offer.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <p style={{
                        color: '#aaa',
                        fontSize: '0.82rem',
                        lineHeight: '1.5',
                        margin: '0 0 15px 0',
                        height: '65px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {offer.description}
                      </p>

                      {offer.discount_code && (
                        <div style={{ marginBottom: '15px' }}>
                          <span style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>Promo Code</span>
                          <span style={{
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            color: '#c3a168',
                            background: 'rgba(195, 161, 104, 0.08)',
                            border: '1px dashed rgba(195, 161, 104, 0.3)',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            display: 'inline-block',
                            letterSpacing: '1px'
                          }}>
                            {offer.discount_code}
                          </span>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button
                          className="table-action-btn edit"
                          style={{ flex: '1', textAlign: 'center', background: 'rgba(195, 161, 104, 0.1)', color: '#c3a168', border: '1px solid rgba(195, 161, 104, 0.2)' }}
                          onClick={() => handleOpenEdit(offer)}
                        >
                          Edit
                        </button>
                        <button
                          className="table-action-btn danger"
                          style={{ flex: '1', textAlign: 'center' }}
                          onClick={() => handleDeleteOffer(offer.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Offer Overlay Modal */}
      {editingOffer && (
        <div className="checkout-modal-overlay">
          <div className="checkout-modal-container" style={{ maxWidth: '500px' }}>
            <div className="checkout-modal-header">
              <h2>Edit Promotional Offer</h2>
              <button className="checkout-close-btn" onClick={handleCloseEdit}>&times;</button>
            </div>

            <form onSubmit={handleEditSubmit} className="checkout-form" style={{ padding: '20px 25px' }}>
              <div className="checkout-form-grid" style={{ gap: '15px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label>Offer Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditInputChange}
                    rows="3"
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Promo Code</label>
                  <input
                    type="text"
                    name="discount_code"
                    value={editForm.discount_code}
                    onChange={handleEditInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Banner Image URL</label>
                  <input
                    type="url"
                    name="image_url"
                    value={editForm.image_url}
                    onChange={handleEditInputChange}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0' }}>
                  <input
                    type="checkbox"
                    id="edit_is_active"
                    name="is_active"
                    checked={editForm.is_active}
                    onChange={handleEditCheckboxChange}
                    style={{ width: 'auto', cursor: 'pointer' }}
                  />
                  <label htmlFor="edit_is_active" style={{ cursor: 'pointer', marginBottom: 0 }}>Active and showing to users</label>
                </div>
              </div>

              <div className="checkout-footer-buttons" style={{ paddingTop: '15px', marginTop: '15px' }}>
                <button type="button" className="btn-cancel" onClick={handleCloseEdit} disabled={saveLoading}>
                  Discard
                </button>
                <button type="submit" className="btn-primary" disabled={saveLoading}>
                  {saveLoading ? 'Saving...' : 'Save Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Offers;
