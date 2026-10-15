# Implementation Plan - Post-Login Redirection to Period Tracker

## User Goal
After a successful login or signup session, redirect the user directly to the Period Tracker tab (and show all the application features and tabs seamlessly).

## Proposed Changes

### 1. App.tsx
- When `onLoginSuccess` is triggered or session is verified, set `activeTab` to `'period'` (Period Tracker) so the user lands directly on the Period Tracker and full feature set.

## Verification Plan
- Compile and lint applet.
- Test login flow to verify landing on Period Tracker.
