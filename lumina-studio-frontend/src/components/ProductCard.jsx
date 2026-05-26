import React, { useState } from 'react';

// Categories that support photo customization
const CUSTOMIZABLE_CATEGORIES = ['frames', 'apparel', 'gifts'];

const isCustomizable = (category = '') =>
  CUSTOMIZABLE_CATEGORIES.includes(category.toLowerCase());

const ProductCard = ({ id, image, category, title, price, description, sizes = [], onAddToBag, onCustomize }) => {
  const [selectedSize, setSelectedSize] = useState(sizes.length > 0 ? sizes[0].size : '');

  const sizeObj = sizes.find(s => s.size === selectedSize);
  const priceModifier = sizeObj ? parseFloat(sizeObj.price_modifier) : 0;
  const displayPrice = Math.round(parseFloat(price) + priceModifier);

  const canCustomize = isCustomizable(category);

  return (
    <div className="product-card">
      <div className="product-image-container">
        <span className="category-badge">{category}</span>
        <img src={image} alt={title} className="product-image" />
        <div className="product-card-overlay">
          {canCustomize ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
              <button
                className="product-card-btn product-card-btn--customize"
                onClick={(e) => {
                  e.stopPropagation();
                  onCustomize && onCustomize({ id, image, category, title, price, description, sizes });
                }}
              >
                ✦ Customize
              </button>
              <button
                className="product-card-btn product-card-btn--secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToBag(id, selectedSize);
                }}
              >
                Add to Bag
              </button>
            </div>
          ) : (
            <button
              className="product-card-btn"
              onClick={(e) => {
                e.stopPropagation();
                onAddToBag(id, selectedSize);
              }}
            >
              ADD TO BAG
            </button>
          )}
        </div>
      </div>
      <div className="product-info">
        <div style={{ flex: 1, paddingRight: '12px' }}>
          <h3 className="product-title">{title}</h3>
          <p className="product-desc">{description}</p>
          {sizes && sizes.length > 0 && (
            <div className="size-selector-container" style={{ marginTop: '10px' }}>
              <select
                className="size-select-dropdown"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(195,161,104,0.3)',
                  color: '#fff',
                  padding: '6px 10px',
                  fontSize: '0.75rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  outline: 'none',
                  cursor: 'pointer',
                  borderRadius: '2px',
                  fontFamily: 'inherit'
                }}
              >
                {sizes.map(s => (
                  <option key={s.size} value={s.size} style={{ background: '#121212', color: '#fff' }}>
                    {s.size} — ₹{Math.round(parseFloat(price) + parseFloat(s.price_modifier))}
                  </option>
                ))}
              </select>
            </div>
          )}
          {canCustomize && (
            <div style={{ marginTop: '8px' }}>
              <span style={{
                fontSize: '0.6rem',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                ✦ Photo Customizable
              </span>
            </div>
          )}
        </div>
        <span className="product-price">₹{displayPrice}</span>
      </div>
    </div>
  );
};

export default ProductCard;
