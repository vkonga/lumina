import React, { useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addItemToCart } from '../store/cartSlice';
import { uploadProductImage } from '../api/upload.api';
import './ProductCustomizer.css';
import AuthPromptModal from './AuthPromptModal';

// ─── Color palettes per product type ───────────────────────────────────────
const COLOR_PALETTES = {
  frames: [
    { name: 'Obsidian',   hex: '#1a1a1a' },
    { name: 'Walnut',     hex: '#5c3d2e' },
    { name: 'Ivory',      hex: '#f5f0e8' },
    { name: 'Gold',       hex: '#c3a168' },
    { name: 'Silver',     hex: '#b0b8c1' },
    { name: 'Navy',       hex: '#1b2a4a' },
    { name: 'Charcoal',   hex: '#3a3a3a' },
    { name: 'Rose Gold',  hex: '#b76e79' },
  ],
  tshirts: [
    { name: 'White',       hex: '#f8f8f8' },
    { name: 'Black',       hex: '#111111' },
    { name: 'Navy',        hex: '#1b2a4a' },
    { name: 'Forest',      hex: '#2d5a27' },
    { name: 'Burgundy',    hex: '#722f37' },
    { name: 'Stone',       hex: '#d4c5b0' },
    { name: 'Sky Blue',    hex: '#6baed6' },
    { name: 'Coral',       hex: '#e07a5f' },
  ],
  cups: [
    { name: 'White',       hex: '#f8f8f8' },
    { name: 'Black',       hex: '#111111' },
    { name: 'Matte Black', hex: '#2a2a2a' },
    { name: 'Rose Gold',   hex: '#b76e79' },
    { name: 'Cobalt',      hex: '#1a3a6b' },
    { name: 'Forest',      hex: '#2d5a27' },
    { name: 'Cream',       hex: '#f0e6d0' },
    { name: 'Slate',       hex: '#4a5568' },
  ],
};

// Map product categories to palette keys + shape label
const getCategoryConfig = (category = '') => {
  const cat = category.toLowerCase();
  if (cat.includes('frame')) return { palette: COLOR_PALETTES.frames, shape: 'frame',   label: 'Frame' };
  if (cat.includes('apparel') || cat.includes('tee') || cat.includes('hoodie'))
    return { palette: COLOR_PALETTES.tshirts, shape: 'tshirt',  label: 'Apparel' };
  return { palette: COLOR_PALETTES.cups, shape: 'cup', label: 'Gift' };
};

// ─── Frame size map: exact inch dimensions ─────────────────────────────────
const FRAME_SIZE_MAP = {
  '6X9':   { w: 6,  h: 9  },
  '8X10':  { w: 8,  h: 10 },
  '8X12':  { w: 8,  h: 12 },
  '10X12': { w: 10, h: 12 },
  '10X15': { w: 10, h: 15 },
  '12X15': { w: 12, h: 15 },
  '12X18': { w: 12, h: 18 },
  '16X20': { w: 16, h: 20 },
  '16X24': { w: 16, h: 24 },
  '18X24': { w: 18, h: 24 },
  '20X24': { w: 20, h: 24 },
  '20X30': { w: 20, h: 30 },
  '24X30': { w: 24, h: 30 },
  '24X36': { w: 24, h: 36 },
  '24X40': { w: 24, h: 40 },
};

// Fixed canvas the frame must fit inside (pixels)
const CANVAS_W = 260;
const CANVAS_H = 280;

const getFrameDimensions = (sizeStr = '6X9') => {
  const ratio = FRAME_SIZE_MAP[sizeStr] || { w: 6, h: 9 };
  // fit-inside: shrink to fit the smallest constraint
  const scale = Math.min(CANVAS_W / ratio.w, CANVAS_H / ratio.h);
  return {
    w:   Math.round(ratio.w * scale),
    h:   Math.round(ratio.h * scale),
    inW: ratio.w,
    inH: ratio.h,
  };
};

// ─── Realistic Frame Preview ───────────────────────────────────────────────
const FramePreview = ({ color, imageUrl, selectedSize }) => {
  const { w, h, inW, inH } = getFrameDimensions(selectedSize);

  // Molding thickness: bigger frames → slightly thicker border (12–22px)
  const maxIn = Math.max(inW, inH);
  const mold  = Math.max(12, Math.min(22, Math.round(maxIn * 0.75)));
  const mat   = Math.max(6,  Math.round(mold * 0.4));

  const isLight = ['#f5f0e8','#f8f8f8','#f0e6d0','#d4c5b0','#b0b8c1'].includes(color);

  return (
    <div className="pc-frame-canvas">
      {/* ── Left vertical ruler ─────────────────── */}
      <div className="pc-ruler-v" style={{ height: `${h}px` }}>
        {Array.from({ length: inH + 1 }).map((_, i) => (
          <div key={i} className="pc-tick-v">
            <span className="pc-tick-label-v">
              {(i === 0 || i === inH || (inH <= 12 ? true : i % 4 === 0)) ? `${i}"` : ''}
            </span>
          </div>
        ))}
      </div>

      <div className="pc-frame-and-ruler-h">
        {/* ── The actual photo frame ───────────────── */}
        <div
          className="pc-real-frame"
          style={{
            width:  `${w}px`,
            height: `${h}px`,
            backgroundColor: color,
            padding: `${mold}px`,
            // Multi-layer shadow for 3D depth
            boxShadow: [
              '0 20px 60px rgba(0,0,0,0.7)',
              '0 6px 16px rgba(0,0,0,0.4)',
              `inset 0 ${mold * 0.6}px ${mold}px rgba(0,0,0,${isLight ? 0.18 : 0.35})`,
              `inset 0 -${mold * 0.6}px ${mold}px rgba(255,255,255,${isLight ? 0.3 : 0.07})`,
              `inset ${mold * 0.6}px 0 ${mold}px rgba(0,0,0,${isLight ? 0.1 : 0.2})`,
              `inset -${mold * 0.6}px 0 ${mold}px rgba(255,255,255,${isLight ? 0.2 : 0.05})`,
            ].join(', '),
            transition: 'width 0.5s cubic-bezier(0.34,1.3,0.64,1), height 0.5s cubic-bezier(0.34,1.3,0.64,1)',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {/* Wood-grain highlight overlay */}
          <div
            className="pc-frame-grain"
            style={{
              backgroundImage: `linear-gradient(
                155deg,
                rgba(255,255,255,${isLight ? 0.28 : 0.1}) 0%,
                transparent 35%,
                rgba(0,0,0,${isLight ? 0.08 : 0.2}) 100%
              )`,
            }}
          />

          {/* Cream mat board with bevel shadow */}
          <div
            className="pc-mat-board"
            style={{ padding: `${mat}px` }}
          >
            {/* Photo aperture */}
            <div className="pc-photo-aperture">
              {/* Glass glare */}
              <div className="pc-glass-shimmer" />
              {imageUrl ? (
                <img src={imageUrl} alt="Custom print" className="pc-preview-img" />
              ) : (
                <div className="pc-aperture-placeholder">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(100,80,50,0.35)" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span>Your Photo Here</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom horizontal ruler ──────────────── */}
        <div className="pc-ruler-h" style={{ width: `${w}px` }}>
          {Array.from({ length: inW + 1 }).map((_, i) => (
            <div key={i} className="pc-tick-h">
              <span className="pc-tick-label-h">
                {(i === 0 || i === inW || (inW <= 12 ? true : i % 4 === 0)) ? `${i}"` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Size badge */}
      <div className="pc-frame-size-badge" style={{ gridColumn: '2' }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="1"/>
        </svg>
        {selectedSize || '6X9'}
        <span className="pc-size-badge-unit">inches</span>
        <span className="pc-size-badge-sep">·</span>
        <span className="pc-size-badge-px">{inW} × {inH}</span>
      </div>
    </div>
  );
};

const TshirtPreview = ({ color, imageUrl }) => (
  <div className="pc-silhouette-wrap">
    <svg viewBox="0 0 220 240" className="pc-tshirt-svg" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M70,10 L30,45 L10,120 L55,130 L55,230 L165,230 L165,130 L210,120 L190,45 L150,10 C145,25 130,38 110,38 C90,38 75,25 70,10 Z"
        fill={color} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"
      />
      {imageUrl && (
        <foreignObject x="70" y="65" width="80" height="80" clipPath="url(#tshirt-clip)">
          <img src={imageUrl} alt="Custom" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        </foreignObject>
      )}
      {!imageUrl && (
        <text x="110" y="115" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="sans-serif">
          Your Photo Here
        </text>
      )}
      <defs>
        <clipPath id="tshirt-clip">
          <rect x="70" y="65" width="80" height="80" rx="4" />
        </clipPath>
      </defs>
    </svg>
  </div>
);

const CupPreview = ({ color, imageUrl }) => (
  <div className="pc-silhouette-wrap">
    <div className="pc-cup-outer">
      <div className="pc-cup-body" style={{ background: `linear-gradient(145deg, ${color}cc, ${color})` }}>
        <div className="pc-cup-image-area">
          {imageUrl
            ? <img src={imageUrl} alt="Custom" className="pc-preview-img" style={{ borderRadius:'4px' }} />
            : <div className="pc-placeholder-text">Your Photo Here</div>}
        </div>
      </div>
      <div className="pc-cup-handle" style={{ borderColor: color }} />
      <div className="pc-cup-base" style={{ background: color }} />
    </div>
  </div>
);

const ProductPreview = ({ shape, color, imageUrl, selectedSize }) => {
  if (shape === 'frame')  return <FramePreview  color={color} imageUrl={imageUrl} selectedSize={selectedSize} />;
  if (shape === 'tshirt') return <TshirtPreview color={color} imageUrl={imageUrl} />;
  return <CupPreview color={color} imageUrl={imageUrl} />;
};

// ─── Main Component ────────────────────────────────────────────────────────
const ProductCustomizer = ({ product, onClose, onOpenCart, onNavigate }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);

  const { palette, shape } = getCategoryConfig(product.category);

  const [uploadedFile,   setUploadedFile]   = useState(null);
  const [previewUrl,     setPreviewUrl]     = useState(null);
  const [selectedColor,  setSelectedColor]  = useState(palette[0].hex);
  const [colorName,      setColorName]      = useState(palette[0].name);
  const [selectedSize,   setSelectedSize]   = useState(product.sizes?.[0]?.size || '');
  const [isDragging,     setIsDragging]     = useState(false);
  const [uploading,      setUploading]      = useState(false);
  const [addingToCart,   setAddingToCart]   = useState(false);
  const [addSuccess,     setAddSuccess]     = useState(false);
  const [error,          setError]          = useState('');
  const [showAuthModal,  setShowAuthModal]  = useState(false);

  const fileInputRef = useRef(null);

  // Compute display price
  const sizeObj = product.sizes?.find((s) => s.size === selectedSize);
  const priceModifier = sizeObj ? parseFloat(sizeObj.price_modifier) : 0;
  const displayPrice = Math.round(parseFloat(product.price) + priceModifier);

  // ── File handling ──────────────────────────────────────────────────────
  const processFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, GIF, or WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be smaller than 10 MB.');
      return;
    }
    setError('');
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  }, [processFile]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleFileChange = (e) => processFile(e.target.files?.[0]);

  // ── Add to bag ─────────────────────────────────────────────────────────
  const handleAddToBag = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (!uploadedFile) {
      setError('Please upload your photo first.');
      return;
    }

    setAddingToCart(true);
    setError('');

    try {
      // 1. Upload image to backend
      setUploading(true);
      const uploadResult = await uploadProductImage(uploadedFile);
      setUploading(false);

      if (!uploadResult.success) throw new Error('Image upload failed.');

      const customImageUrl = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${uploadResult.imageUrl}`;

      // 2. Add to cart with custom fields
      await dispatch(addItemToCart({
        productId:   product.id,
        quantity:    1,
        selectedSize,
        customImage: customImageUrl,
        customColor: `${colorName}|${selectedColor}`,
      })).unwrap();

      setAddSuccess(true);
      setTimeout(() => {
        onClose();
        onOpenCart();
      }, 900);
    } catch (err) {
      setUploading(false);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="pc-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pc-modal">
        {/* Header */}
        <div className="pc-header">
          <div>
            <span className="pc-kicker">Personalize Your Order</span>
            <h2 className="pc-title">{product.title}</h2>
          </div>
          <button className="pc-close-btn" onClick={onClose} aria-label="Close">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="pc-body">
          {/* LEFT — Live Preview */}
          <div className="pc-preview-col">
            <div className="pc-preview-label">Live Preview</div>
            <ProductPreview shape={shape} color={selectedColor} imageUrl={previewUrl} selectedSize={selectedSize} />
            <div className="pc-preview-color-tag" style={{ background: selectedColor }}>
              <span style={{ color: selectedColor === '#f8f8f8' || selectedColor === '#f5f0e8' || selectedColor === '#f0e6d0' || selectedColor === '#d4c5b0' ? '#333' : '#fff' }}>
                {colorName}
              </span>
            </div>
          </div>

          {/* RIGHT — Controls */}
          <div className="pc-controls-col">

            {/* Upload Zone */}
            <div className="pc-section">
              <div className="pc-section-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Upload Your Photo
              </div>
              <div
                className={`pc-dropzone ${isDragging ? 'dragging' : ''} ${uploadedFile ? 'has-file' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                {uploadedFile ? (
                  <div className="pc-dropzone-success">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c3a168" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span className="pc-filename">{uploadedFile.name}</span>
                    <span className="pc-change-link">Change Photo</span>
                  </div>
                ) : (
                  <div className="pc-dropzone-idle">
                    <div className="pc-upload-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                    <p className="pc-drop-text">Drag & drop your photo</p>
                    <p className="pc-drop-sub">or click to browse · JPG, PNG, WebP · max 10 MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Color Selector */}
            <div className="pc-section">
              <div className="pc-section-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
                </svg>
                Color — <span className="pc-selected-color-name">{colorName}</span>
              </div>
              <div className="pc-color-swatches">
                {palette.map((c) => (
                  <button
                    key={c.hex}
                    className={`pc-swatch ${selectedColor === c.hex ? 'selected' : ''}`}
                    style={{ background: c.hex }}
                    title={c.name}
                    onClick={() => { setSelectedColor(c.hex); setColorName(c.name); }}
                    aria-label={c.name}
                  >
                    {selectedColor === c.hex && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c.hex === '#f8f8f8' || c.hex === '#f5f0e8' || c.hex === '#f0e6d0' || c.hex === '#d4c5b0' ? '#333' : '#fff'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="pc-section">
                <div className="pc-section-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                  Size
                </div>
                <div className="pc-size-pills">
                  {product.sizes.map((s) => {
                    const sPrice = Math.round(parseFloat(product.price) + parseFloat(s.price_modifier));
                    return (
                      <button
                        key={s.size}
                        className={`pc-size-pill ${selectedSize === s.size ? 'selected' : ''}`}
                        onClick={() => setSelectedSize(s.size)}
                      >
                        <span className="pc-size-label">{s.size}</span>
                        <span className="pc-size-price">₹{sPrice}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="pc-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* CTA */}
            <button
              className={`pc-add-btn ${addSuccess ? 'success' : ''} ${addingToCart ? 'loading' : ''}`}
              onClick={handleAddToBag}
              disabled={addingToCart || addSuccess}
            >
              {addSuccess ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Added to Bag!
                </>
              ) : uploading ? (
                <span className="pc-spinner" />
              ) : addingToCart ? (
                <span className="pc-spinner" />
              ) : (
                <>
                  Add to Bag — ₹{displayPrice}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </>
              )}
            </button>

            <p className="pc-note">Each piece is handcrafted. Delivery in 5–7 business days.</p>
          </div>
        </div>
      </div>
      <AuthPromptModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onNavigate={onNavigate} />
    </div>
  );
};

export default ProductCustomizer;
