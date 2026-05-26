import React from 'react';
import './EmptyState.css';

/**
 * Empty state placeholder for collection views.
 * @param {Object} props
 * @param {string} [props.title='Nothing here yet']
 * @param {string} [props.message]
 * @param {React.ReactNode} [props.action]
 */
const EmptyState = ({
    title = 'Nothing here yet',
    message = '',
    action = null,
}) => (
    <div className="empty-state" role="status">
        <div className="empty-state__icon" aria-hidden="true">◇</div>
        <h3 className="empty-state__title">{title}</h3>
        {message && <p className="empty-state__message">{message}</p>}
        {action && <div className="empty-state__action">{action}</div>}
    </div>
);

export default EmptyState;
