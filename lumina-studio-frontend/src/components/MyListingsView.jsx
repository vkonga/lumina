import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  getMyServices,
  addMyService,
  deleteMyService,
  getMyProducts,
  addMyProduct,
  deleteMyProduct,
} from '../api/listing.api';
import logoImg from '../assets/logo.png';
import './MyListingsView.css';

/* ─── Constants ──────────────────────────────────────────────────────────── */
const CATEGORIES = ['store', 'frame', 'album', 'print', 'accessory', 'other'];

const emptyServiceForm = { title: '', img: '', price: '', reference_images: '' };
const emptyProductForm = {
  title: '',
  price: '',
  description: '',
  category: 'store',
  image: '',
};

/* ─── Helper ─────────────────────────────────────────────────────────────── */
const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/* ══════════════════════════════════════════════════════════════════════════ */
const MyListingsView = ({ onNavigate, onOpenCart }) => {
  const { user } = useSelector((state) => state.auth);

  /* tab: 'services' | 'products' */
  const [activeTab, setActiveTab] = useState('services');

  /* ─── Services state ────────────────────────────────────────────────── */
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState('');

  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [serviceSubmitting, setServiceSubmitting] = useState(false);
  const [serviceFeedback, setServiceFeedback] = useState({ type: '', msg: '' });
  const [deletingServiceId, setDeletingServiceId] = useState(null);

  /* ─── Products state ────────────────────────────────────────────────── */
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');

  const [productForm, setProductForm] = useState(emptyProductForm);
  const [productSizes, setProductSizes] = useState([{ size: '', price_modifier: '' }]);
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [productFeedback, setProductFeedback] = useState({ type: '', msg: '' });
  const [deletingProductId, setDeletingProductId] = useState(null);

  /* ─── Load data ─────────────────────────────────────────────────────── */
  const loadServices = useCallback(async () => {
    setServicesLoading(true);
    setServicesError('');
    const res = await getMyServices();
    if (res.success) {
      setServices(res.data);
    } else {
      setServicesError(res.message || 'Failed to load your services.');
    }
    setServicesLoading(false);
  }, []);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError('');
    const res = await getMyProducts();
    if (res.success) {
      setProducts(res.data);
    } else {
      setProductsError(res.message || 'Failed to load your products.');
    }
    setProductsLoading(false);
  }, []);

  useEffect(() => {
    loadServices();
    loadProducts();
  }, [loadServices, loadProducts]);

  /* ─── Service handlers ──────────────────────────────────────────────── */
  const handleServiceFormChange = (e) => {
    const { name, value } = e.target;
    setServiceForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    setServiceFeedback({ type: '', msg: '' });

    if (!serviceForm.title.trim()) {
      setServiceFeedback({ type: 'error', msg: 'Service title is required.' });
      return;
    }

    setServiceSubmitting(true);
    const res = await addMyService({
      title: serviceForm.title.trim(),
      img: serviceForm.img.trim(),
      price: serviceForm.price ? parseFloat(serviceForm.price) : 0,
      reference_images: serviceForm.reference_images.trim(),
    });
    setServiceSubmitting(false);

    if (res.success) {
      setServiceFeedback({ type: 'success', msg: 'Service published successfully!' });
      setServiceForm(emptyServiceForm);
      loadServices();
      setTimeout(() => setServiceFeedback({ type: '', msg: '' }), 3000);
    } else {
      setServiceFeedback({ type: 'error', msg: res.message || 'Failed to add service.' });
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Remove this service from the platform?')) return;
    setDeletingServiceId(id);
    const res = await deleteMyService(id);
    setDeletingServiceId(null);
    if (res.success) {
      setServices((prev) => prev.filter((s) => s.id !== id));
    } else {
      alert(res.message || 'Failed to delete service.');
    }
  };

  /* ─── Product handlers ──────────────────────────────────────────────── */
  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSizeChange = (index, field, value) => {
    setProductSizes((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addSizeRow = () => {
    setProductSizes((prev) => [...prev, { size: '', price_modifier: '' }]);
  };

  const removeSizeRow = (index) => {
    setProductSizes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setProductFeedback({ type: '', msg: '' });

    if (!productForm.title.trim()) {
      setProductFeedback({ type: 'error', msg: 'Product title is required.' });
      return;
    }
    if (!productForm.price && productForm.price !== 0) {
      setProductFeedback({ type: 'error', msg: 'Product price is required.' });
      return;
    }

    // Build valid sizes (skip blank rows)
    const validSizes = productSizes
      .filter((s) => s.size.trim())
      .map((s) => ({ size: s.size.trim(), price_modifier: parseFloat(s.price_modifier) || 0 }));

    setProductSubmitting(true);
    const res = await addMyProduct({
      title: productForm.title.trim(),
      price: parseFloat(productForm.price),
      description: productForm.description.trim(),
      category: productForm.category,
      image: productForm.image.trim(),
      sizes: validSizes,
    });
    setProductSubmitting(false);

    if (res.success) {
      setProductFeedback({ type: 'success', msg: 'Product listed in store successfully!' });
      setProductForm(emptyProductForm);
      setProductSizes([{ size: '', price_modifier: '' }]);
      loadProducts();
      setTimeout(() => setProductFeedback({ type: '', msg: '' }), 3000);
    } else {
      setProductFeedback({ type: 'error', msg: res.message || 'Failed to add product.' });
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Remove this product from the store?')) return;
    setDeletingProductId(id);
    const res = await deleteMyProduct(id);
    setDeletingProductId(null);
    if (res.success) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert(res.message || 'Failed to delete product.');
    }
  };

  /* ══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="listings-page">
      {/* ─── Navbar ──────────────────────────────────────────────────── */}
      <nav className="listings-navbar">
        <div
          className="listings-navbar-brand"
          onClick={() => { onNavigate('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          <img src={logoImg} alt="SD Photography" />
          <span>SD PHOTOGRAPHY</span>
        </div>
        <div className="listings-navbar-actions">
          <button className="listings-back-btn" onClick={() => onNavigate('home')}>
            ← Back to Home
          </button>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────────── */}
      <div className="listings-hero">
        <span className="listings-hero-kicker">Creative Hub</span>
        <h1 className="listings-hero-title">My Listings</h1>
        <p className="listings-hero-subtitle">
          Publish your own photography <strong>services</strong> and{' '}
          <strong>store products</strong> — they go live on the platform immediately
          and are visible to all visitors.{' '}
          <span className="public-badge">● Live</span>
        </p>
      </div>

      {/* ─── Tabs ────────────────────────────────────────────────────── */}
      <div className="listings-tabs">
        <button
          className={`listings-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          ✦ Services
        </button>
        <button
          className={`listings-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          ◈ Store Products
        </button>
      </div>

      {/* ─── Content ─────────────────────────────────────────────────── */}
      <div className="listings-content">

        {/* ══════ SERVICES TAB ════════════════════════════════════════════ */}
        {activeTab === 'services' && (
          <>
            {/* Add Service Form */}
            <div className="listings-add-card">
              <h3>Add a New Service</h3>
              <p className="card-subtitle">
                Fill in the details below — your service will appear publicly in the Services section.
              </p>

              <form className="listings-form" onSubmit={handleAddService}>
                <div className="listings-form-row">
                  <div className="form-group">
                    <label>Service Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={serviceForm.title}
                      onChange={handleServiceFormChange}
                      placeholder="e.g. Portrait Session"
                      disabled={serviceSubmitting}
                    />
                  </div>
                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      value={serviceForm.price}
                      onChange={handleServiceFormChange}
                      placeholder="e.g. 5000"
                      min="0"
                      step="0.01"
                      disabled={serviceSubmitting}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Cover Image URL</label>
                  <input
                    type="url"
                    name="img"
                    value={serviceForm.img}
                    onChange={handleServiceFormChange}
                    placeholder="https://example.com/image.jpg"
                    disabled={serviceSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label>Reference Images (comma-separated URLs)</label>
                  <textarea
                    name="reference_images"
                    value={serviceForm.reference_images}
                    onChange={handleServiceFormChange}
                    placeholder="https://img1.com, https://img2.com"
                    rows={2}
                    disabled={serviceSubmitting}
                  />
                </div>

                <div className="listings-form-footer">
                  <button type="submit" className="listings-submit-btn" disabled={serviceSubmitting}>
                    {serviceSubmitting ? 'Publishing…' : 'PUBLISH SERVICE'}
                  </button>
                  {serviceFeedback.msg && (
                    <span className={`form-feedback ${serviceFeedback.type}`}>
                      {serviceFeedback.msg}
                    </span>
                  )}
                </div>
              </form>
            </div>

            <div className="listings-divider" />

            {/* Services Grid */}
            <div className="listings-section-header">
              <h2 className="listings-section-title">Your Published Services</h2>
              {!servicesLoading && (
                <span className="listings-count-badge">{services.length} listing{services.length !== 1 ? 's' : ''}</span>
              )}
            </div>

            {servicesLoading ? (
              <div className="listings-loading">
                <div className="listings-spinner" />
                <span>Loading your services…</span>
              </div>
            ) : servicesError ? (
              <div className="listings-page-error">{servicesError}</div>
            ) : services.length === 0 ? (
              <div className="listings-empty">
                <div className="listings-empty-icon">📷</div>
                <p>You haven't published any services yet.<br />Use the form above to get started.</p>
              </div>
            ) : (
              <div className="listings-grid">
                {services.map((svc) => (
                  <div key={svc.id} className="listing-card">
                    <div className="listing-card-img-wrap">
                      {svc.img ? (
                        <img src={svc.img} alt={svc.title} />
                      ) : (
                        <div className="listing-card-img-placeholder">📷</div>
                      )}
                    </div>
                    <div className="listing-card-body">
                      <div className="listing-card-title">{svc.title}</div>
                      <div className="listing-card-meta">
                        Service ID #{svc.id}
                        <span className="public-badge" style={{ fontSize: '0.58rem' }}>Live</span>
                      </div>
                      <div className="listing-card-price">
                        {svc.price > 0 ? `₹${parseFloat(svc.price).toLocaleString('en-IN')}` : 'Price on request'}
                      </div>
                      <div className="listing-card-footer">
                        <span className="listing-card-date">{formatDate(svc.created_at)}</span>
                        <button
                          className="listing-delete-btn"
                          onClick={() => handleDeleteService(svc.id)}
                          disabled={deletingServiceId === svc.id}
                        >
                          {deletingServiceId === svc.id ? 'Removing…' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══════ PRODUCTS TAB ════════════════════════════════════════════ */}
        {activeTab === 'products' && (
          <>
            {/* Add Product Form */}
            <div className="listings-add-card">
              <h3>Add a Store Product</h3>
              <p className="card-subtitle">
                Your product will appear in the public store immediately after submission.
              </p>

              <form className="listings-form" onSubmit={handleAddProduct}>
                <div className="listings-form-row">
                  <div className="form-group">
                    <label>Product Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={productForm.title}
                      onChange={handleProductFormChange}
                      placeholder="e.g. Premium Photo Frame"
                      disabled={productSubmitting}
                    />
                  </div>
                  <div className="form-group">
                    <label>Base Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      value={productForm.price}
                      onChange={handleProductFormChange}
                      placeholder="e.g. 999"
                      min="0"
                      step="0.01"
                      disabled={productSubmitting}
                    />
                  </div>
                </div>

                <div className="listings-form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      name="category"
                      value={productForm.category}
                      onChange={handleProductFormChange}
                      disabled={productSubmitting}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Product Image URL</label>
                    <input
                      type="url"
                      name="image"
                      value={productForm.image}
                      onChange={handleProductFormChange}
                      placeholder="https://example.com/product.jpg"
                      disabled={productSubmitting}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleProductFormChange}
                    placeholder="Describe the product…"
                    rows={3}
                    disabled={productSubmitting}
                  />
                </div>

                {/* Sizes */}
                <div className="sizes-section">
                  <span className="sizes-label">Sizes & Price Modifiers (optional)</span>
                  {productSizes.map((row, i) => (
                    <div key={i} className="size-row">
                      <input
                        type="text"
                        placeholder="Size (e.g. A4, 8×10)"
                        value={row.size}
                        onChange={(e) => handleSizeChange(i, 'size', e.target.value)}
                        disabled={productSubmitting}
                      />
                      <input
                        type="number"
                        placeholder="Price +/- (₹)"
                        value={row.price_modifier}
                        onChange={(e) => handleSizeChange(i, 'price_modifier', e.target.value)}
                        disabled={productSubmitting}
                        style={{ maxWidth: '130px' }}
                      />
                      {productSizes.length > 1 && (
                        <button
                          type="button"
                          className="size-remove-btn"
                          onClick={() => removeSizeRow(i)}
                          disabled={productSubmitting}
                          aria-label="Remove size"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="add-size-btn" onClick={addSizeRow} disabled={productSubmitting}>
                    + Add Size
                  </button>
                </div>

                <div className="listings-form-footer">
                  <button type="submit" className="listings-submit-btn" disabled={productSubmitting}>
                    {productSubmitting ? 'Listing…' : 'LIST IN STORE'}
                  </button>
                  {productFeedback.msg && (
                    <span className={`form-feedback ${productFeedback.type}`}>
                      {productFeedback.msg}
                    </span>
                  )}
                </div>
              </form>
            </div>

            <div className="listings-divider" />

            {/* Products Grid */}
            <div className="listings-section-header">
              <h2 className="listings-section-title">Your Store Listings</h2>
              {!productsLoading && (
                <span className="listings-count-badge">{products.length} product{products.length !== 1 ? 's' : ''}</span>
              )}
            </div>

            {productsLoading ? (
              <div className="listings-loading">
                <div className="listings-spinner" />
                <span>Loading your products…</span>
              </div>
            ) : productsError ? (
              <div className="listings-page-error">{productsError}</div>
            ) : products.length === 0 ? (
              <div className="listings-empty">
                <div className="listings-empty-icon">🛍️</div>
                <p>No products listed yet.<br />Use the form above to add your first product.</p>
              </div>
            ) : (
              <div className="listings-grid">
                {products.map((prd) => (
                  <div key={prd.id} className="listing-card">
                    <div className="listing-card-img-wrap">
                      {prd.image ? (
                        <img src={prd.image} alt={prd.title} />
                      ) : (
                        <div className="listing-card-img-placeholder">🛍️</div>
                      )}
                    </div>
                    <div className="listing-card-body">
                      <div className="listing-card-title">{prd.title}</div>
                      <div className="listing-card-meta">
                        {prd.category} · #{prd.id}
                        <span className="public-badge" style={{ fontSize: '0.58rem' }}>Live</span>
                      </div>
                      <div className="listing-card-price">
                        ₹{parseFloat(prd.price).toLocaleString('en-IN')}
                      </div>
                      {prd.sizes && prd.sizes.length > 0 && (
                        <div className="listing-card-sizes">
                          {prd.sizes.map((s, i) => (
                            <span key={i} className="size-pill">
                              {s.size}
                              {parseFloat(s.price_modifier) !== 0 && (
                                <> {parseFloat(s.price_modifier) > 0 ? '+' : ''}₹{parseFloat(s.price_modifier).toLocaleString('en-IN')}</>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="listing-card-footer">
                        <span className="listing-card-date">{formatDate(prd.created_at)}</span>
                        <button
                          className="listing-delete-btn"
                          onClick={() => handleDeleteProduct(prd.id)}
                          disabled={deletingProductId === prd.id}
                        >
                          {deletingProductId === prd.id ? 'Removing…' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyListingsView;
