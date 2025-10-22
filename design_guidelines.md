# Design Guidelines: Radar de Editais Automatizado

## Design Approach
**Selected Approach**: Design System-Based (Material Design + Custom)  
**Rationale**: This is a utility-focused, information-dense monitoring dashboard requiring efficiency, clarity, and learnability. The design prioritizes data presentation, filtering capabilities, and user productivity over visual storytelling.

## Core Design Elements

### A. Color Palette

**Light Mode**:
- Primary: 221 83% 53% (Azul Royal - user specified)
- Primary Hover: 221 83% 45%
- Success/Accent: 158 64% 52% (Verde Esmeralda - user specified)
- Neutral: 215 20% 65% (Cinza Neutro - user specified)
- Background: 0 0% 100% (Branco Puro)
- Surface: 220 13% 97%
- Border: 220 13% 91%
- Text Primary: 220 26% 14%
- Text Secondary: 215 20% 45%

**Dark Mode**:
- Primary: 221 83% 53% (maintains vibrancy)
- Primary Hover: 221 83% 60%
- Success/Accent: 158 64% 52%
- Neutral: 215 20% 65%
- Background: 222 47% 11%
- Surface: 217 33% 17%
- Border: 217 33% 24%
- Text Primary: 210 40% 98%
- Text Secondary: 215 20% 65%

**Semantic Colors**:
- Warning: 38 92% 50%
- Error: 0 84% 60%
- Info: 199 89% 48%

### B. Typography

**Font Family**:
- Primary: 'Inter' from Google Fonts (clean, readable, excellent for data-heavy interfaces)
- Monospace: 'JetBrains Mono' for dates, IDs, and numeric values

**Scale**:
- Headings: text-3xl (30px) font-bold for page titles
- Subheadings: text-xl (20px) font-semibold for section headers
- Body: text-base (16px) font-normal for content
- Small: text-sm (14px) for secondary info, table cells
- Micro: text-xs (12px) for labels, badges, timestamps

### C. Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24  
- Tight spacing: p-2, gap-2 (for compact table rows, badges)
- Standard spacing: p-4, gap-4 (for cards, form fields)
- Section spacing: p-8, py-12 (for main content areas)
- Large spacing: p-16, py-20 (for page containers)

**Grid System**:
- Dashboard: Single column with max-w-7xl container
- Filter panel: Grid-cols-1 md:grid-cols-2 lg:grid-cols-4 for filter inputs
- Results table: Full-width responsive table with horizontal scroll on mobile
- Cards: Grid-cols-1 md:grid-cols-2 for stats/metrics when needed

### D. Component Library

**Navigation**:
- Top navbar with logo, user profile dropdown, notification bell
- Sidebar navigation (collapsible on mobile) with icons for: Dashboard, Filtros, Histórico, Configurações
- Background: surface color with border-b for top nav
- Active state: Primary color background with white text

**Data Display**:
- Tables: Striped rows, hover states, sortable column headers with arrow indicators
- Row height: py-3 for comfortable scanning
- Borders: border-b border-neutral on rows
- Header: bg-surface with font-semibold text-sm uppercase tracking-wide
- Empty states: Centered illustrations with text-neutral-secondary and action button

**Forms & Filters**:
- Input fields: border border-neutral rounded-lg px-4 py-2.5 with focus:ring-2 focus:ring-primary
- Select dropdowns: Custom styled with chevron icon
- Multi-select chips: Removable tags with x icon in primary/success colors
- Date pickers: Calendar popup with range selection
- Search bar: Prominent with magnifying glass icon, w-full md:max-w-md

**Cards**:
- White/surface background with rounded-xl shadow-sm
- Padding: p-6
- Hover: shadow-md transition on interactive cards
- Stats cards: Large numbers (text-4xl font-bold) with labels (text-sm text-secondary)

**Buttons**:
- Primary: bg-primary text-white rounded-lg px-6 py-2.5 font-medium
- Secondary: border-2 border-primary text-primary bg-transparent
- Success: bg-success text-white for "Enviar Alerta"
- Icon buttons: p-2 rounded-full hover:bg-surface
- Disabled: opacity-50 cursor-not-allowed

**Badges & Tags**:
- Status badges: Rounded-full px-3 py-1 text-xs font-medium
- Tender type tags: Different colors per modalidade (Pregão, Concorrência, Dispensa)
- UF tags: Subtle bg-surface with border

**Notifications & Alerts**:
- Toast notifications: Fixed top-right with slide-in animation
- Alert banners: Full-width with icon, message, and dismiss button
- Info, success, warning, error variants with appropriate colors

**Modals & Overlays**:
- Full-screen overlay with backdrop-blur-sm
- Centered modal: max-w-2xl rounded-2xl with shadow-2xl
- Close button in top-right corner
- Footer with action buttons aligned right

**Loading States**:
- Skeleton loaders for table rows (animated pulse)
- Spinner: Rotating circular icon in primary color
- Progress bar: For batch operations with percentage

### E. Animations

Use sparingly and only for functional feedback:
- Transitions: transition-colors duration-200 for hover states
- Page transitions: Fade in with 300ms duration
- Skeleton pulse: For loading states
- Modal: Scale and fade in (300ms ease-out)
- **Avoid**: Parallax, scroll-triggered animations, excessive micro-interactions

## Images

**No Hero Image Required** - This is a dashboard/utility application, not a marketing page.

**Icon Usage**:
- Use Heroicons via CDN for all interface icons
- Filter icons: funnel, calendar, map-pin, currency-dollar
- Action icons: envelope (alert), refresh, download, external-link
- Navigation icons: home, clock, cog, bell
- Status icons: check-circle, exclamation-triangle, information-circle

**Illustrations** (optional):
- Empty state illustration when no tenders found (minimal line art style)
- Authentication pages: Simple geometric pattern background

## Page-Specific Guidelines

**Login/Register Page**:
- Centered card (max-w-md) on neutral background
- Logo at top, form fields stacked vertically with gap-4
- Social proof text: "Monitorando editais de 5.000+ usuários" below form

**Dashboard**:
- Stats row at top: 4 cards showing total tenders D-1, value sum, active filters, alerts sent
- Filter panel: Collapsible accordion with all filter controls
- Results table: Primary content area with pagination at bottom
- Floating action button: "Enviar Alerta" fixed bottom-right on mobile

**Filter Configuration**:
- Form layout with sections: Palavras-chave, Estados (checkbox grid), Modalidades, Faixa de Valor
- Save button prominent at bottom-right
- "Limpar filtros" link in muted color

**Email Alert Preview**:
- HTML email template preview in modal
- Shows tender list with clickable links
- Footer with unsubscribe link styling

## Accessibility & Responsiveness

- All interactive elements: min-h-11 (44px touch target)
- Form labels: Always visible, not placeholder-only
- Color contrast: Minimum WCAG AA on all text
- Keyboard navigation: Focus rings on all interactive elements (ring-2 ring-primary ring-offset-2)
- Dark mode toggle: Persistent user preference stored in localStorage
- Mobile breakpoints: Stack filters, tables horizontal scroll, sidebar becomes drawer