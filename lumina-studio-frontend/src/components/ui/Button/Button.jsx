import React from 'react';
import './Button.css';

/**
 * Reusable Button component.
 *
 * @param {Object} props
 * @param {'primary'|'outline'|'gold'|'ghost'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.fullWidth=false]
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.loading=false]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
const Button = ({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
    className = '',
    children,
    ...rest
}) => {
    const classes = [
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth ? 'btn--full' : '',
        loading ? 'btn--loading' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <button className={classes} disabled={disabled || loading} {...rest}>
            {loading ? <span className="btn__spinner" aria-hidden="true" /> : null}
            {children}
        </button>
    );
};

export default Button;
