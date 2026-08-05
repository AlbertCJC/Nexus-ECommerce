# QA Execution Log - 2026-08-04

## Environment
- Dev Server: http://localhost:3000
- Supabase: https://dlqjmtnwcekcndpchxgr.supabase.co
- Browser: Chrome/Firefox/Safari/Edge
- Viewports: 375px, 768px, 1280px+

## Agent Status Tracker
| Agent | Status | Start Time | End Time | Issues Found |
|-------|--------|------------|----------|--------------|
| QA Lead | In Progress | 2026-08-04 | - | - |
| Auth Agent | Complete | 2026-08-04 | 2026-08-04 | 4 |
| User Journey Agent | Complete | 2026-08-04 | 2026-08-04 | 8 |
| Shopping Cart Agent | Complete | 2026-08-04 | 2026-08-04 | 2 |
| Checkout & Payment Agent | Complete | 2026-08-05 | 2026-08-05 | 4 (CHK-001 to CHK-004) |
| Product Catalog Agent | Complete | 2026-08-05 | 2026-08-05 | 4 (CAT-001 to CAT-004) |
| Admin Panel Agent | Complete | 2026-08-05 | 2026-08-05 | 3 (ADM-001 to ADM-003 fixed) |
| UI/UX Agent | **Complete** | 2026-08-05 | 2026-08-05 | **10 (UI-001 to UI-010)** |
| Functional Testing Agent | **Complete** | 2026-08-05 | 2026-08-05 | **10 (FUNC-001 to FUNC-010)** |
| Performance Agent | Pending | - | - | - |
| Security Agent | Pending | - | - | - |
| API Verification Agent | Pending | - | - | - |
| Browser Compatibility Agent | Pending | - | - | - |
| Regression Agent | Pending | - | - | - |
| Edge Case Agent | Pending | - | - | - |

## Issue Registry
| ID | Agent | Severity | Title | Status |
|----|-------|----------|-------|--------|
| CHK-001 | Checkout & Payment | Medium | Form validation doesn't show "Select payment method" error - COD pre-selected by default | Open |
| CHK-002 | Checkout & Payment | High | Guest checkout redirects to non-existent `/auth` route (UJ-003) | Open |
| CHK-003 | Checkout & Payment | Medium | Test data exceeded free shipping threshold; shipping shows "Free" not ₱9.99 | Open |
| CHK-004 | Checkout & Payment | Info | Admin user profile has no name/phone metadata; only email prefilled | Open |
| ADM-001 | Admin Panel | High | Admin login race condition - isAdmin checked before profile loaded | Fixed |
| ADM-002 | Admin Panel | Medium | Product counts show 0 - useProducts status='all' filter bug | Fixed |
| ADM-003 | Admin Panel | Medium | Mobile sidebar not hidden by default on mobile | Fixed |
| AUTH-001 | Auth Agent | Critical | Admin RLS policies don't work (JWT role claim always 'authenticated') | Open |
| AUTH-002 | Auth Agent | Medium | Email confirmation required for signup (blocks immediate login) | Open |
| AUTH-003 | Auth Agent | Low | Password reset rate limited (429 on rapid requests) | Open |
| AUTH-004 | Auth Agent | Info | OAuth not configured (Google, GitHub all disabled) | Blocked |
| UJ-001 | User Journey | Critical | OrderHistory crashes - uses non-existent AppContext data | Open |
| UJ-002 | User Journey | High | Guest users cannot add products to cart | Open |
| UJ-003 | User Journey | High | Checkout redirects to non-existent `/auth` route for guests | Open |
| UJ-004 | User Journey | Medium | No guest cart merge on login | Open |
| UJ-005 | User Journey | Low | Newsletter signup form missing from Home page | Open |
| UJ-006 | User Journey | Low | Profile page lacks password change feature | Open |
| UJ-007 | User Journey | Low | OrderHistory missing "Buy Again" functionality | Open |
| UJ-008 | User Journey | Medium | ProductFilters component broken - reads categories/brands from wrong context | Fixed |
| CART-001 | Shopping Cart | Critical | Guest users cannot add to cart - forced to login | Open |
| CART-002 | Shopping Cart | High | No guest cart merge on login | Open |
| CAT-001 | Product Catalog | Medium | ProductCard brand displays "Unknown" - brand_id mapping issue | Open |
| CAT-002 | Product Catalog | Medium | Category/Brand filter timing issues in tests | Open |
| CAT-003 | Product Catalog | Medium | URL sync and clear filters timeout in tests | Open |
| CAT-004 | Product Catalog | High | Admin login flow timeout for authenticated add-to-cart tests | Open |
| FUNC-001 | Functional Testing | High | Guest checkout redirects to non-existent `/auth` route (UJ-003) | Open |
| FUNC-002 | Functional Testing | Low | Newsletter signup form missing from Home page (UJ-005) | Open |
| FUNC-003 | Functional Testing | Medium | Product detail tabs not implemented | Open |
| FUNC-004 | Functional Testing | Low | Quantity buttons lack explicit focus ring (UI-010) | Open |
| FUNC-005 | Functional Testing | Low | Escape key doesn't close mobile sidebar | Open |
| FUNC-006 | Functional Testing | Low | Product image gallery lacks keyboard navigation | Open |
| FUNC-007 | Functional Testing | Medium | Admin delete confirmation lacks focus trap | Open |
| FUNC-008 | Functional Testing | Medium | Search lacks ARIA live region for results announcement | Open |
| FUNC-009 | Functional Testing | Low | Cart badge missing pulse animation on add | Open |
| FUNC-010 | Functional Testing | Info | Footer social links open in same tab | Open |
