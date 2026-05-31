/**
 * @file utility.js
 * @description Centralized string constants for all user-facing text in Lumina Studio.
 *
 * USAGE:
 *   import { BUTTON_LABELS, PAGE_HEADINGS, MENU_ITEMS } from '../utils/utility';
 *
 * NAMING: All constants use SCREAMING_SNAKE_CASE. No string is defined more
 * than once — if two components share a label, they both import from here.
 */

// ---------------------------------------------------------------------------
// MENU_ITEMS — Navigation / Sidebar Labels
// Each item has: key (unique id), label (display text), path (route or anchor)
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} MenuItem
 * @property {string} key   - Unique identifier for the menu item.
 * @property {string} label - Display label shown in the UI.
 * @property {string} path  - Route path or anchor href.
 */

/**
 * Application navigation menu items.
 * @type {MenuItem[]}
 */
export const MENU_ITEMS = [
    { key: 'portfolio', label: 'Portfolio', path: '#' },
    { key: 'services', label: 'Services', path: '#' },
    { key: 'store', label: 'Store', path: 'store' },
    { key: 'about', label: 'About', path: '#' },
    { key: 'contact', label: 'Contact', path: '#' },
    { key: 'journal', label: 'Journal', path: '#' },
];

/**
 * Footer navigation links.
 * @type {MenuItem[]}
 */
export const FOOTER_LINKS = [
    { key: 'locations', label: 'Locations', path: '#' },
    { key: 'careers', label: 'Careers', path: '#' },
    { key: 'terms', label: 'Terms', path: '#' },
    { key: 'privacy', label: 'Privacy', path: '#' },
];

// ---------------------------------------------------------------------------
// PAGE_HEADINGS — Main heading strings per page / section
// ---------------------------------------------------------------------------

/**
 * Primary heading text for each major page/section.
 * @type {Object.<string, string>}
 */
export const PAGE_HEADINGS = {
    HOME: 'SD PHOTOGRAPHY',
    STORE: 'The Boutique',
    LOGIN: 'Welcome Back',
    DASHBOARD: 'Dashboard',
    GALLERY: 'Our Gallery',
    SERVICES: 'Our Services',
    NEWSLETTER: 'Join the Circle',
};

// ---------------------------------------------------------------------------
// PAGE_SUBHEADINGS — Subheading strings per page / section
// ---------------------------------------------------------------------------

/**
 * Secondary / subheading text for each major page/section.
 * @type {Object.<string, string>}
 */
export const PAGE_SUBHEADINGS = {
    HOME: 'THE ART OF VISUAL STORYTELLING',
    STORE: 'Curated for Those Who Appreciate the Finest',
    LOGIN: 'EXCLUSIVE MEMBER ACCESS',
    GALLERY: 'A selection of our finest work',
    NEWSLETTER: 'Receive exclusive updates, early access, and curated inspirations.',
};

// ---------------------------------------------------------------------------
// PAGE_TITLES — HTML document <title> strings per route
// ---------------------------------------------------------------------------

/**
 * HTML document title strings for each route/page.
 * @type {Object.<string, string>}
 */
export const PAGE_TITLES = {
    HOME: 'SD Photography — The Art of Visual Storytelling',
    STORE: 'SD Photography — Boutique Collection',
    LOGIN: 'SD Photography — Sign In',
    DASHBOARD: 'SD Photography — Dashboard',
    GALLERY: 'SD Photography — Gallery',
    NOT_FOUND: 'SD Photography — Page Not Found',
};

// ---------------------------------------------------------------------------
// BUTTON_LABELS — All button text labels
// ---------------------------------------------------------------------------

/**
 * Text labels for every button in the application.
 * @type {Object.<string, string>}
 */
export const BUTTON_LABELS = {
    BOOK_US: 'Book Us',
    INQUIRE: 'Inquire',
    SIGN_IN: 'SIGN IN',
    CREATE_ACCOUNT: 'CREATE ACCOUNT',
    VIEW_FULL_PORTFOLIO: 'VIEW FULL PORTFOLIO',
    JOIN_THE_CIRCLE: 'Join the Circle',
    SAVE_CHANGES: 'Save Changes',
    CANCEL: 'Cancel',
    DELETE: 'Delete',
    SUBMIT: 'Submit',
};

// ---------------------------------------------------------------------------
// FORM_LABELS — Form field labels and placeholders
// ---------------------------------------------------------------------------

/**
 * Labels and placeholder text for all form inputs.
 * @type {Object.<string, string>}
 */
export const FORM_LABELS = {
    EMAIL_LABEL: 'Email Address',
    EMAIL_PLACEHOLDER: 'name@sd.photography',
    PASSWORD_LABEL: 'Password',
    PASSWORD_PLACEHOLDER: '••••••••',
    NEWSLETTER_PLACEHOLDER: 'Your email address',
    FORGOT_PASSWORD: 'Forgot Password?',
};

// ---------------------------------------------------------------------------
// ERROR_MESSAGES — User-facing error strings
// ---------------------------------------------------------------------------

/**
 * User-facing error messages shown across the application.
 * @type {Object.<string, string>}
 */
export const ERROR_MESSAGES = {
    LOAD_HOME_FAILED: 'Failed to load content. Please refresh the page.',
    LOAD_PRODUCTS_FAILED: 'Failed to load boutique collection. Please try again.',
    LOGIN_FAILED: 'Invalid email or password. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    GENERIC: 'Something went wrong. Please try again later.',
    SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
};

// ---------------------------------------------------------------------------
// SUCCESS_MESSAGES — User-facing success/confirmation strings
// ---------------------------------------------------------------------------

/**
 * User-facing success and confirmation messages.
 * @type {Object.<string, string>}
 */
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Welcome back to SD Photography.',
    NEWSLETTER_SUBSCRIBED: 'You have joined the circle. Welcome.',
    BOOKING_CONFIRMED: 'Your booking has been confirmed.',
    PROFILE_UPDATED: 'Your profile has been updated successfully.',
    PASSWORD_RESET_SENT: 'A password reset link has been sent to your email.',
};

// ---------------------------------------------------------------------------
// LOADING_MESSAGES — Loading state strings
// ---------------------------------------------------------------------------

/**
 * Text shown during loading states.
 * @type {Object.<string, string>}
 */
export const LOADING_MESSAGES = {
    HOME: 'Loading Elite Experience...',
    STORE: 'Loading Boutique Collection...',
    GENERIC: 'Loading Experience...',
};

// ---------------------------------------------------------------------------
// BRAND — Immutable brand identity strings
// ---------------------------------------------------------------------------

/**
 * Brand name and static identity strings.
 * @type {Object.<string, string>}
 */
export const BRAND = {
    NAME: 'SD PHOTOGRAPHY',
    SHORT: 'SD PHOTOGRAPHY',
    TAGLINE: 'THE ART OF VISUAL STORYTELLING',
    COPYRIGHT: '© 2026 SD PHOTOGRAPHY. THE ART OF VISUAL STORYTELLING.',
    DIVIDER_TEXT: 'OR JOIN THE STUDIO',
};

// ---------------------------------------------------------------------------
// STORE_CATEGORIES — Product filter categories
// ---------------------------------------------------------------------------

/**
 * Static product category filter labels for the Store page.
 * @type {string[]}
 */
export const STORE_CATEGORIES = [
    'All Collections',
    'Frames',
    'Gifts',
    'Apparel',
    'New Arrivals',
    'Kids',
];
