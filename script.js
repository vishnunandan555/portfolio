/*
    script.js
    ---------
    Everything interactive on this site lives here (no framework).

    Features:
    1) Theme toggle (light/dark) stored in localStorage
    2) Live clock (24-hour HH:MM)
    3) Collapsible "Previous roles" section
    4) Hover card preview for projects (fixed-position)
*/

// Small DOM helpers (keeps the rest of the file readable)
// $(".x")  -> first match
// $$(".x") -> array of all matches
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ----------------------------
// Theme toggle
// ----------------------------

// Button you click to toggle theme
const themeToggle = $('#theme-toggle');
// The <svg id="theme-icon"> element we swap paths inside
const themeIcon = $('#theme-icon');

// SVG fragments for the icon (we swap these based on theme)
const ICON_SUN = `
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
`;

const ICON_MOON = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;

// Decide which theme to start with on page load:
// - If the user previously selected one, use localStorage.
// - Otherwise, fall back to the OS preference.
function getInitialTheme() {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Apply a theme by setting a data attribute on <html>.
// CSS reads this attribute and swaps variable values.
function setTheme(theme, { persist } = { persist: true }) {
    document.documentElement.setAttribute('data-theme', theme);
    if (persist) localStorage.setItem('theme', theme);
    if (themeIcon) themeIcon.innerHTML = theme === 'dark' ? ICON_MOON : ICON_SUN;
}

// Initialize theme once when the page loads.
// We do NOT persist here because getInitialTheme() already chooses correctly.
setTheme(getInitialTheme(), { persist: false });

// Attach click handler only if the button exists
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        setTheme(current === 'dark' ? 'light' : 'dark');
    });
}

// ----------------------------
// Collapsible: Previous roles
// ----------------------------

// Toggle label + collapsible panel
const rolesToggle = $('.prev-roles-toggle');
const rolesGrid = $('.prev-roles-grid');

// Clicking the label toggles the panel open/closed
if (rolesToggle && rolesGrid) {
    rolesToggle.addEventListener('click', () => {
        rolesGrid.classList.toggle('expanded');
        const isExpanded = rolesGrid.classList.contains('expanded');
        rolesToggle.textContent = isExpanded ? '↑ Hide previous roles' : '↳ Previous roles';
    });
}

// ----------------------------
// Hover card (fixed position)
// ----------------------------

// All project links that should trigger the hover card
const projectLinks = $$('.project-list a');

// Hover card elements (we fill these with the hovered project's data)
const hoverCard = $('#hover-card');
const hcImg = $('#hover-card-img');
const hcIcon = $('#hover-card-icon');
const hcName = $('#hover-card-name');
const hcDesc = $('#hover-card-desc');

// Hide the hover card with a short fade/scale.
function hideHoverCard() {
    if (!hoverCard) return;
    hoverCard.style.opacity = '0';
    hoverCard.style.transform = 'translateY(-50%) scale(0.95)';
    window.setTimeout(() => {
        hoverCard.style.display = 'none';
    }, 200);
}

// Show the hover card for a specific <a> element.
// Reads data-* attributes from the link:
// - data-image, data-title, data-icon, data-desc
function showHoverCardFor(link) {
    if (!hoverCard || !hcImg || !hcIcon || !hcName || !hcDesc) return;

    const imageUrl = link.getAttribute('data-image');
    if (!imageUrl) return;

    hcImg.src = imageUrl;
    hcName.textContent = link.getAttribute('data-title') || '';
    hcIcon.textContent = link.getAttribute('data-icon') || '';
    hcDesc.textContent = link.getAttribute('data-desc') || '';

    // Place card beside the main column; flip to the left if there isn't room.
    const container = $('.container');
    const rect = container ? container.getBoundingClientRect() : { left: 0, right: 0 };
    const cardWidth = 320;
    const gutter = 24;

    let left = rect.right + gutter;
    if (window.innerWidth - left < cardWidth + gutter) {
        left = Math.max(gutter, rect.left - cardWidth - gutter);
    }

    hoverCard.style.left = `${Math.round(left)}px`;
    hoverCard.style.top = '50%';
    hoverCard.style.display = 'block';

    // Next paint tick for transition (ensures CSS transition runs)
    requestAnimationFrame(() => {
        hoverCard.style.opacity = '1';
        hoverCard.style.transform = 'translateY(-50%) scale(1)';
    });
}

// Bind hover events if there are any project links
if (projectLinks.length) {
    for (const link of projectLinks) {
        link.addEventListener('mouseenter', () => showHoverCardFor(link));
        link.addEventListener('mouseleave', hideHoverCard);
    }
}

// If the user scrolls/resizes, hide the hover card (keeps it from floating in odd places)
window.addEventListener('scroll', hideHoverCard, { passive: true });
window.addEventListener('resize', hideHoverCard);

// ----------------------------
// Clock (24h HH:MM)
// ----------------------------

// The clock <span> in the header
const clockEl = $('#clock');

// Update the clock text (24-hour HH:MM)
function updateClock() {
    if (!clockEl) return;
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

// Run once immediately, then every second
updateClock();
window.setInterval(updateClock, 1000);
