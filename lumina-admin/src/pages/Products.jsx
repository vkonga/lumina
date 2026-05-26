import React, { useState, useEffect } from 'react';
import client from '../api/client';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    price: '',
    category: '',
    description: '',
    sizes: []
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

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
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSizeModifierChange = (index, val) => {
    const updatedSizes = [...editForm.sizes];
    updatedSizes[index].price_modifier = parseFloat(val) || 0;
    setEditForm(prev => ({
      ...prev,
      sizes: updatedSizes
    }));
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
        
        // Refresh products list
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? response.data.product : p));
        
        setTimeout(() => {
          handleCloseEdit();
        }, 1500);
      } else {
        setError(response.message || 'Failed to update product details.');
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
          <h1>Store Customizer & Pricing</h1>
          <p className="subtitle">Edit boutique listings, configure base prices, and control size modifiers for frames, t-shirts, and mugs.</p>
        </div>
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
            // Count configurations
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

                  <button className="btn-primary edit-catalog-btn" onClick={() => handleOpenEdit(p)}>
                    Configure Price & Info
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Product Overlay Modal */}
      {editingProduct && (
        <div className="checkout-modal-overlay">
          <div className="checkout-modal-container" style={{ maxWidth: '600px' }}>
            <div className="checkout-modal-header">
              <h2>Configure Store Listing</h2>
              <button className="checkout-close-btn" onClick={handleCloseEdit}>&times;</button>
            </div>

            <form onSubmit={handleFormSubmit} className="checkout-form" style={{ padding: '20px 25px' }}>
              <div className="checkout-form-grid" style={{ gap: '15px', marginBottom: '20px' }}>
                <div className="form-group full-width">
                  <label>Product Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 3' }}>
                  <label>Base Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={editForm.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 3' }}>
                  <label>Category Group</label>
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleInputChange}
                    style={{ background: '#151515', color: '#fff', border: '1px solid #222', padding: '12px 16px', borderRadius: '6px', fontSize: '0.95rem' }}
                  >
                    <option value="frames">Photo Frames</option>
                    <option value="tshirts">Custom T-Shirts</option>
                    <option value="cups">Ceramic Cups</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleInputChange}
                    rows="3"
                  ></textarea>
                </div>
              </div>

              {/* Sizes Modifiers Editing */}
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

export default Products;
