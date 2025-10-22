# Radar de Editais Automatizado

## Overview
An automated public tender monitoring system for Brazilian government contracts. Users can configure custom filters, search tenders from the PNCP API, and receive email alerts for matching opportunities.

## Recent Changes (October 22, 2025)
- Initial project setup with complete schema and frontend implementation
- Implemented authentication system with login/register pages
- Built comprehensive dashboard with stats cards, filter panel, and tender table
- Created filter configuration, history, and settings pages
- Added dark mode support with theme toggle
- Configured design system with blue royal (#2563EB) and emerald green (#10B981) color palette

## Project Architecture

### Frontend (React + TypeScript)
- **Pages**: Login, Register, Dashboard, Filtros, Histórico, Configurações
- **Components**: Sidebar navigation, TenderTable, FilterPanel, StatsCards, ThemeToggle, Logo
- **Contexts**: AuthContext (user authentication), ThemeContext (dark mode)
- **Styling**: Tailwind CSS + Shadcn UI components

### Backend (Express + TypeScript)
- **Storage**: In-memory storage (MemStorage) for development
- **API Routes**: Authentication, tender search, filter management, alert sending
- **External API**: PNCP (Plataforma Nacional de Contratações Públicas)

### Database Schema
- **users**: User accounts with authentication
- **filters**: User filter preferences for automated alerts
- **tenders**: Cached tender data from PNCP API
- **alertHistory**: Record of email alerts sent

## Color Palette
- Primary (Blue Royal): 221 83% 53%
- Success (Emerald Green): 158 64% 52%
- Neutral Gray: 215 20% 65%
- Background: Light mode white, Dark mode 222 47% 11%

## User Workflow
1. User registers/logs in
2. Configures filters (keywords, states, tender types, value range)
3. Searches for tenders matching criteria
4. Selects tenders and sends email alerts
5. Views alert history

## Next Steps
- Implement backend API endpoints
- Integrate with PNCP API for real tender data
- Add email sending functionality
- Set up automated daily scheduling (8:00 AM Brasília time)
