# IDEA marketplace remediation — 16 October 2026

## Scope implemented
- Removes public quick-demo admin/supplier/customer logins.
- Uses Supabase authentication for sign-in; local demo sign-in disabled outside Vite development mode.
- Server-issued Supabase app_metadata role only; frontend role switching disabled in production.
- Unapproved AbaElMozahem products remain in a staged count, not public product listings.
- Displays dynamic published vs staged catalogue totals.
- Indicates supplier-reported material classifications are **not certified**, prevents unrelated suggestions when family is absent.
- Disables local-payment sandbox checkout in production.
- Adds source-cache expiry and failure handling, and a basic GitHub Actions catalogue/build check.

## Outstanding / must be verified externally
1. Imported Art Ceramic catalogue: 475 supplier records are still marked approved for storefront listing, but material type, model, origin and specifications require review. Do not claim certified ceramics or porcelain from these records.
2. AbaElMozahem staged count depends on the live Shopify endpoint and may vary. Publishing requires editorial approval and verified categorization.
3. Images still point to supplier URLs; asset license/redistribution consent and image mirroring remain outstanding.
4. Production authorization must be enforced by Supabase RLS, policies, RPCs and/or server-side APIs for every privileged operation. Client-side route guards alone are not security.
5. Admin/RFQ/subscription functionality remains primarily local prototype state, not a verified multi-user production platform.
6. Checkout requires a real, verified payment provider and a backend handling webhooks.
7. No browser/mobile cross-device manual QA performed. GitHub Action build result must be checked before merging.
8. Original 40 source registry includes blocked/failed/unprocessed sites, and no claim of 40 fully imported vendors is made.

## Rollout
Merge after successful build, inspect production deployment, verify Auth + Supabase environment settings, verify RLS and test mobile on actual devices. Do not enable real payments or supplier transactions without server-side integration.
