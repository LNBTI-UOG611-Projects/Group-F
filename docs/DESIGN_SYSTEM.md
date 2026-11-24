# PCI Colombo – Design System

Every screen in the web app (all four roles) and the Employee mobile app must use these colours,
fonts and patterns, so the system looks like **one product**.



---

## 1. Official colours

| Name | Hex | Use it for |
|---|---|---|
| **Primary – Deep Burgundy** | `#581C3D` | Sidebar, headings, main buttons, active states |
| **Accent – Muted Gold** | `#B49A55` | Icons, the selected menu item marker, special highlights |
| **Secondary – Dusty Rose** | `#C65B91` | Subtle highlights, secondary elements, chart segments |
| **Neutral – Soft Gray** | `#F5F3F5` | Page background, containers, input fields |
| **Text – Dark Charcoal** | `#24212A` | Main text, labels, descriptions |

### Readability rule (important)
Gold (`#B49A55`) and Rose (`#C65B91`) are **too light for normal-size text on white**: they don't
have enough contrast. Use them for icons, borders, chart parts, badges with a tinted background,
and large decorative text only. Body text is always Charcoal; headings are Charcoal or Burgundy.
White text is fine on Burgundy.

## 2. Design tokens (web)

These variables live in `web/src/styles/variables.css`. **Always use the variable, never type the
hex value** in your page CSS. Example: `color: var(--color-primary);`

```css
:root {
  /* Brand */
  --color-primary: #581C3D;
  --color-primary-dark: #43142E;      /* hover on primary buttons */
  --color-primary-light: #F3E8EE;     /* tinted backgrounds, icon circles */
  --color-accent: #B49A55;
  --color-accent-light: #F5EFE0;
  --color-secondary: #C65B91;
  --color-secondary-light: #F9E8F1;

  /* Neutrals */
  --color-background: #F5F3F5;
  --color-surface: #FFFFFF;           /* cards, tables, header */
  --color-text: #24212A;
  --color-text-muted: #6E6873;
  --color-border: #E6E1E6;
  --color-on-primary: #FFFFFF;        /* text on burgundy */

  /* Status (badges, alerts) – text colour + light background */
  --color-success: #276B43;   --color-success-bg: #E6F4EC;   /* Completed, Active, Paid */
  --color-info: #2F62C9;      --color-info-bg: #E7EEFB;      /* Scheduled */
  --color-warning: #8A5A0E;   --color-warning-bg: #FCF1DD;   /* Pending, Low stock */
  --color-danger: #B3261E;    --color-danger-bg: #FBE7E6;    /* Cancelled, Overdue, Errors */
  --color-neutral: #6E6873;   --color-neutral-bg: #EFECEF;   /* Archived, Draft */

  /* Typography */
  --font-body: "Inter", "Segoe UI", Arial, sans-serif;
  --font-display: "Playfair Display", Georgia, serif;   /* greeting headings only */
  --text-xs: 12px;  --text-sm: 14px;  --text-md: 16px;
  --text-lg: 20px;  --text-xl: 24px;  --text-2xl: 32px;

  /* Spacing */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-5: 24px; --space-6: 32px;

  /* Shape */
  --radius-sm: 6px;  --radius-md: 10px;  --radius-lg: 16px;  --radius-pill: 999px;
  --shadow-card: 0 2px 8px rgba(36, 33, 42, 0.06);

  /* Layout */
  --sidebar-width: 245px;
  --header-height: 64px;
}
```

Fonts are loaded once in `web/index.html` (Google Fonts: Inter 400/500/600/700 and Playfair Display italic 600).

## 3. Layout (from the reference dashboard)

- **Sidebar (left):** Burgundy background, white menu text, outline icons. The active item has a
  slightly lighter burgundy background and a **gold bar on its left edge**. The logo sits at the top
  and "Need help? Contact support" sits at the bottom.
- **Header (top):** White, with a rounded search box on the left, and a notification bell (rose
  count badge) plus the user's avatar circle, name and company on the right.
- **Page:** Soft Gray background. Content goes in white cards with `--radius-lg` and `--shadow-card`.
- **Welcome banner:** "Good Morning," in the display font, the user's name in large bold text, and a
  short tagline.
- **KPI cards:** A row of white cards, each with a round tinted icon (burgundy/gold/rose light
  background), a label, a big number and a small change indicator.
- **Tables:** Header row in small muted text, light borders between rows, a **status pill** in a
  column, an avatar circle with initials for people, and "View All →" links in Burgundy.
- **Charts:** Use Burgundy, Gold, Rose and Gray as the series colours, in that order.

Each role uses the **same sidebar and header**; only the menu items change:

| Role | Example menu |
|---|---|
| Main Admin | Dashboard, Users, Categories, Inventory, Safety Documents, Leave Approvals, Reports, Settings |
| Sub Admin | Dashboard, Service Requests, Inspections, Quotations, Jobs, Schedule, Assignments, Resources |
| Customer | Dashboard, My Locations, Service Requests, Quotations, Payments, Feedback, Safety Info, Profile |
| Employee | Dashboard, My Assignments, Inspections, Service Reports, Safety Checklists, Leave, Profile |

## 4. Shared components (web)

Build a component once in `web/src/components/` and reuse it. Check the folder **before** you
create a new one; never make a second button or table component.

```
web/src/
├── styles/            variables.css, global.css, responsive.css
├── components/
│   ├── common/        Button, Input, Select, Card, StatusBadge, DataTable, Modal,
│   │                  ConfirmDialog, LoadingSpinner, EmptyState, StatCard
│   └── layout/        DashboardLayout, Sidebar, Header, MobileNav
├── pages/
│   ├── auth/          Login
│   ├── main-admin/
│   ├── sub-admin/
│   ├── customer/
│   └── employee/
└── services/          api.js (one place that calls the backend with the token)
```

Button styles: `primary` (burgundy background, white text), `secondary` (white background, burgundy
border and text), `danger` (danger colour), and `ghost` (no border). Height 40px (44px on touch
screens), radius `--radius-md`.

Status badge: a pill with the status background colour and the status text colour, for example
Pending = warning, Completed = success.

Forms: a label above each input, inputs with a white background and `--color-border`, a burgundy
focus outline, and the error message in danger colour under the field.

Every page needs a **loading state**, an **empty state** ("No locations yet – add your first
location"), and an **error state**.

Page-specific CSS goes next to the page (`pages/customer/ServiceLocations.css`) and only styles
that page. Do not put page styles in `global.css`.

## 5. Responsive rules (web)

| Screen | Width | Behaviour |
|---|---|---|
| Phone | under 640px | Sidebar hidden; a hamburger button opens it as a drawer. Cards stack in one column. Forms are full width. |
| Tablet | 640–1023px | Sidebar hidden (drawer). Cards in 2 columns. |
| Desktop | 1024px and up | Sidebar always visible. |

- KPI cards: `grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));`
- Tables: wrap them in a container with `overflow-x: auto` so they scroll sideways on phones.
- Touch targets are at least 44px tall. Nothing may overflow horizontally at 360px width.
- Test every page in the browser DevTools device toolbar (iPhone SE and iPad) before a PR.

## 6. Mobile app (Employee, React Native + Expo)

React Native does not use CSS files. Use the same colours from `mobile/src/theme/colors.js`:

```js
export const colors = {
  primary: "#581C3D",
  primaryDark: "#43142E",
  primaryLight: "#F3E8EE",
  accent: "#B49A55",
  secondary: "#C65B91",
  background: "#F5F3F5",
  surface: "#FFFFFF",
  text: "#24212A",
  textMuted: "#6E6873",
  border: "#E6E1E6",
  onPrimary: "#FFFFFF",
  success: "#276B43", successBg: "#E6F4EC",
  info: "#2F62C9",    infoBg: "#E7EEFB",
  warning: "#8A5A0E", warningBg: "#FCF1DD",
  danger: "#B3261E",  dangerBg: "#FBE7E6",
};
```

The mobile app is designed for field work, so it is **not** a copy of the desktop screen. It uses
large buttons, one task per screen, a burgundy top bar, and bottom tabs (Today, Assignments,
Reports, Profile).

## 7. Checklist before you open a UI Pull Request

- [ ] I used only `var(--...)` colours (web) or `colors.*` (mobile) – no new hex values
- [ ] I reused the shared components instead of making new buttons, inputs or tables
- [ ] The page works at 360px, 768px and 1280px widths
- [ ] Loading, empty and error states exist
- [ ] Headings and body text are Charcoal or Burgundy (not gold or rose)
