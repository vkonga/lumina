import React from 'react';
import './Loader.css';

/**
 * Full-page or inline loading indicator.
 * @param {Object} props
 * @param {string} [props.message] - Optional message shown below the spinner.
 * @param {boolean} [props.fullPage=false] - Fill the full viewport.
 */
const Loader = ({ message = '', fullPage = false }) => (
    <div className={`loader ${fullPage ? 'loader--full-page' : ''}`} role="status" aria-live="polite">
        <div className="loader__ring">
            <div /><div /><div /><div />
        </div>
        {message && <p className="loader__message title-serif gold-text">{message}</p>}
    </div>
);

export default Loader;
