import React, { useState, useEffect } from 'react';
import client from '../api/client';

const emptyProduct = {
  title: '',
  price: '',
  category: 'Frames',
  description: '',
  image: '',
  sizes: []
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', price: '', category: '', description: '', sizes: [] });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ ...emptyProduct });
  const [addSizeInput, setAddSizeInput] = useState({ size: '', price_modifier: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState('');

  // Delete Confirm State
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await client.get('/admin/products');
      if (response.success) {
        setProducts(response.data);
      } else {
        setError(response.message || 'Failed to load products list.');
      }
    } catch (err) {
      setError('An unexpected error occurred reading products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ─── Edit Handlers ────────────────────────────────────────────────────────────
  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setEditForm({
      title: p.title || '',
      price: p.price || '',
      category: p.category || '',
      description: p.description || '',
      sizes: p.sizes ? p.sizes.map(s => ({ ...s })) : []
    });
    setSaveSuccess('');
  };

  const handleCloseEdit = () => {
    setEditingProduct(null);
    setSaveSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSizeModifierChange = (index, val) => {
    const updatedSizes = [...editForm.sizes];
    updatedSizes[index].price_modifier = parseFloat(val) || 0;
    setEditForm(prev => ({ ...prev, sizes: updatedSizes }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');
    setSaveSuccess('');
    try {
      const response = await client.patch(`/admin/products/${editingProduct.id}`, editForm);
      if (response.success) {
        setSaveSuccess('Product catalog details updated successfully!');
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? response.data.product : p));
        setTimeout(() => { handleCloseEdit(); }, 1500);
      } else {
        setError(response.message || 'Failed to update product details.');
      }
    } catch (err) {
      setError('An unexpected error occurred during save.');
    } finally {
      setSaveLoading(false);
    }
  };

  // ─── Add Handlers ─────────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setAddForm({ ...emptyProduct, sizes: [] });
    setAddSizeInput({ size: '', price_modifier: '' });
    setAddSuccess('');
    setError('');
    setShowAddModal(true);
  };

  const handleCloseAdd = () => {
    setShowAddModal(false);
    setAddSuccess('');
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSizeRow = () => {
    const { size, price_modifier } = addSizeInput;
    if (!size.trim()) return;
    setAddForm(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: size.trim(), price_modifier: parseFloat(price_modifier) || 0 }]
    }));
    setAddSizeInput({ size: '', price_modifier: '' });
  };

  const handleRemoveAddSize = (idx) => {
    setAddForm(prev => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== idx) }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setError('');
    setAddSuccess('');
    try {
      const response = await client.post('/admin/products', addForm);
      if (response.success) {
        setAddSuccess('New product added to the catalog!');
        setProducts(prev => [...prev, response.data.product]);
        setTimeout(() => { handleCloseAdd(); }, 1500);
      } else {
        setError(response.message || 'Failed to create product.');
      }
    } catch (err) {
      setError('An unexpected error occurred while creating product.');
    } finally {
      setAddLoading(false);
    }
  };

  // ─── Delete Handlers ──────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);
    setError('');
    try {
      const response = await client.delete(`/admin/products/${deletingProduct.id}`);
      if (response.success) {
        setProducts(prev => prev.filter(p => p.id !== deletingProduct.id));
        setDeletingProduct(null);
      } else {
        setError(response.message || 'Failed to delete product.');
        setDeletingProduct(null);
      }
    } catch (err) {
      setError('An unexpected error occurred during deletion.');
      setDeletingProduct(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <header className="admin-page-header">
        <div>
          <h1>Store Customizer &amp; Pricing</h1>
          <p className="subtitle">Edit boutique listings, configure base prices, and control size modifiers for frames, t-shirts, and mugs.</p>
        </div>
        <button className="btn-primary" onClick={handleOpenAdd} style={{ whiteSpace: 'nowrap', alignSelf: 'center' }}>
          + Add Product
        </button>
      </header>

      {saveSuccess && <div className="admin-success-banner">{saveSuccess}</div>}
      {error && <div className="admin-error-banner">{error}</div>}

      {loading ? (
        <div className="admin-page-loading">
          <div className="admin-spinner"></div>
          <span>Loading catalog...</span>
        </div>
      ) : (
        <div className="products-admin-grid">
          {products.map((p) => {
            const configCount = p.sizes?.length || 0;
            return (
              <div key={p.id} className="product-admin-card">
                <div className="product-img-frame">
                  <img src={p.image} alt={p.title} />
                  <span className="product-category-tag">{p.category}</span>
                </div>

                <div className="product-card-body">
                  <h3>{p.title}</h3>
                  <p className="description">{p.description || 'No description entered.'}</p>

                  <div className="price-details-row">
                    <div className="price-box">
                      <span className="lbl">Base Price</span>
                      <strong className="val">₹{Math.round(p.price)}</strong>
                    </div>
                    <div className="sizes-badge-box">
                      <span className="lbl">Modifiers</span>
                      <strong className="val">{configCount} sizes</strong>
                    </div>
                  </div>

                  {configCount > 0 && (
                    <div className="card-sizes-list">
                      {p.sizes.map((s, idx) => (
                        <span key={idx} className="size-price-tag">
                          {s.size}: <strong>₹{Math.round(parseFloat(p.price) + parseFloat(s.price_modifier))}</strong>
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button className="btn-primary edit-catalog-btn" style={{ flex: 1 }} onClick={() => handleOpenEdit(p)}>
                      Configure Price &amp; Info
                    </button>
                    <button
                      className="btn-cancel"
                      style={{ flex: '0 0 auto', padding: '10px 14px', color: '#ff6b6b', borderColor: 'rgba(255,107,107,0.3)', backgroundColor: 'rgba(255,107,107,0.08)' }}
                      onClick={() => setDeletingProduct(p)}
                      title="Delete Product"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Edit Product Modal ─────────────────────────────────────────────── */}
      {editingProduct && (
        <div className="checkout-modal-overlay">
          <div className="checkout-modal-container" style={{ maxWidth: '600px' }}>
            <div className="checkout-modal-header">
              <h2>Configure Store Listing</h2>
              <button className="checkout-close-btn" onClick={handleCloseEdit}>&times;</button>
            </div>

            <form onSubmit={handleFormSubmit} className="checkout-form" style={{ padding: '20px 25px' }}>
              <div className="checkout-form-grid" style={{ gap: '15px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label>Product Title</label>
                  <input type="text" name="title" value={editForm.title} onChange={handleInputChange} required />
                </div>

                <div className="form-group half-width">
                  <label>Base Price (₹)</label>
                  <input type="number" name="price" value={editForm.price} onChange={handleInputChange} required />
                </div>

                <div className="form-group half-width">
                  <label>Category Group</label>
                  <select name="category" value={editForm.category} onChange={handleInputChange}>
                    <option value="Frames">Photo Frames</option>
                    <option value="Apparel">Custom T-Shirts</option>
                    <option value="Gifts">Ceramic Cups / Gifts</option>
                    <option value="store">General Store</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" value={editForm.description} onChange={handleInputChange} rows="3"></textarea>
                </div>
              </div>

              {editForm.sizes.length > 0 && (
                <div className="form-sizes-modifiers-section">
                  <h4 style={{ color: '#c3a168', margin: '0 0 12px 0', fontSize: '0.95rem', letterSpacing: '0.5px' }}>Size Price Modifiers</h4>
                  <div className="modifiers-edit-grid">
                    {editForm.sizes.map((s, idx) => (
                      <div key={idx} className="modifier-edit-row">
                        <span className="modifier-name">{s.size}</span>
                        <div className="modifier-input-wrapper">
                          <span className="currency-symbol">₹ +</span>
                          <input
                            type="number"
                            value={s.price_modifier}
                            onChange={(e) => handleSizeModifierChange(idx, e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <span className="final-price-preview">
                          = ₹{Math.round((parseFloat(editForm.price) || 0) + (parseFloat(s.price_modifier) || 0))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

      {/* ── Add Product Modal ──────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="checkout-modal-overlay">
          <div className="checkout-modal-container" style={{ maxWidth: '620px' }}>
            <div className="checkout-modal-header">
              <h2>Add New Store Product</h2>
              <button className="checkout-close-btn" onClick={handleCloseAdd}>&times;</button>
            </div>

            {addSuccess && <div className="admin-success-banner" style={{ margin: '0 25px' }}>{addSuccess}</div>}

            <form onSubmit={handleAddSubmit} className="checkout-form" style={{ padding: '20px 25px' }}>
              <div className="checkout-form-grid" style={{ gap: '15px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label>Product Title *</label>
                  <input type="text" name="title" value={addForm.title} onChange={handleAddFormChange} required placeholder="e.g. Premium Black Frame" />
                </div>

                <div className="form-group half-width">
                  <label>Base Price (₹) *</label>
                  <input type="number" name="price" value={addForm.price} onChange={handleAddFormChange} required placeholder="e.g. 250" min="0" step="0.01" />
                </div>

                <div className="form-group half-width">
                  <label>Category *</label>
                  <select name="category" value={addForm.category} onChange={handleAddFormChange}>
                    <option value="Frames">Photo Frames</option>
                    <option value="Apparel">Custom T-Shirts</option>
                    <option value="Gifts">Ceramic Cups / Gifts</option>
                    <option value="store">General Store</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Image URL *</label>
                  <input type="text" name="image" value={addForm.image} onChange={handleAddFormChange} required placeholder="https://images.unsplash.com/... or /uploads/frame.png" />
                  {addForm.image && (
                    <div style={{ marginTop: '8px', width: '80px', height: '80px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #333' }}>
                      <img src={addForm.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" value={addForm.description} onChange={handleAddFormChange} rows="3" placeholder="Brief product description..." />
                </div>
              </div>

              {/* Sizes builder */}
              <div className="form-sizes-modifiers-section" style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#c3a168', margin: '0 0 12px 0', fontSize: '0.95rem', letterSpacing: '0.5px' }}>Size Variants (optional)</h4>

                {addForm.sizes.length > 0 && (
                  <div className="modifiers-edit-grid" style={{ marginBottom: '12px' }}>
                    {addForm.sizes.map((s, idx) => (
                      <div key={idx} className="modifier-edit-row">
                        <span className="modifier-name">{s.size}</span>
                        <span className="final-price-preview">₹ +{s.price_modifier} = ₹{Math.round((parseFloat(addForm.price) || 0) + s.price_modifier)}</span>
                        <button type="button" onClick={() => handleRemoveAddSize(idx)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '0.9rem' }}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label style={{ fontSize: '0.8rem', color: '#888' }}>Size Label</label>
                    <input
                      type="text"
                      value={addSizeInput.size}
                      onChange={e => setAddSizeInput(prev => ({ ...prev, size: e.target.value }))}
                      placeholder="e.g. 8X10 or XL"
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label style={{ fontSize: '0.8rem', color: '#888' }}>Price Modifier (₹+)</label>
                    <input
                      type="number"
                      value={addSizeInput.price_modifier}
                      onChange={e => setAddSizeInput(prev => ({ ...prev, price_modifier: e.target.value }))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ flex: '0 0 auto', padding: '10px 16px', marginBottom: '0', alignSelf: 'flex-end' }}
                    onClick={handleAddSizeRow}
                  >
                    + Add Size
                  </button>
                </div>
              </div>

              <div className="checkout-footer-buttons" style={{ paddingTop: '20px', marginTop: '0' }}>
                <button type="button" className="btn-cancel" onClick={handleCloseAdd} disabled={addLoading}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={addLoading}>
                  {addLoading ? 'Creating...' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ───────────────────────────────────────────── */}
      {deletingProduct && (
        <div className="checkout-modal-overlay">
          <div className="checkout-modal-container" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div className="checkout-modal-header">
              <h2>Delete Product</h2>
              <button className="checkout-close-btn" onClick={() => setDeletingProduct(null)}>&times;</button>
            </div>
            <div style={{ padding: '25px' }}>
              <p style={{ color: '#ccc', marginBottom: '8px' }}>Are you sure you want to permanently delete:</p>
              <p style={{ color: '#c3a168', fontWeight: '700', fontSize: '1.1rem', marginBottom: '24px' }}>"{deletingProduct.title}"</p>
              <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '24px' }}>This action cannot be undone. All size configurations will also be removed.</p>
              <div className="checkout-footer-buttons">
                <button type="button" className="btn-cancel" onClick={() => setDeletingProduct(null)} disabled={deleteLoading}>Cancel</button>
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

export default Products;
