# Shell Checkout

> Shell Checkout is a full-stack resource checkout platform built for Startup Shell, designed to replace manual coordination around shared physical and digital resources with a secure, approval-based workflow. Members can view real-time availability, submit checkout requests, and receive automated Discord updates, while board members can approve or deny requests, block out resources, manage inventory, and audit checkout history.


## Jump To

- [The Problem and Product Context](#the-problem--product-context)
- [Features](#features)
- [Member-Facing Functionality](#member-facing-functionality)
- [Board/Admin Controls](#boardadmin-controls)
- [Inventory Management](#inventory-management)
- [Scheduling and Availability](#scheduling-and-availability)
- [Notifications](#notifications)
- [Workflow Automation](#workflow-automation)
- [System Design and Architecture](#system-design-and-architecture)
- [Application Layer](#application-layer)
- [Authentication and Domain Identity](#authentication-and-domain-identity)
- [API and Authorization Boundary](#api-and-authorization-boundary)
- [Persistence and Data Integrity](#persistence-and-data-integrity)
- [Integration Boundaries](#integration-boundaries)
- [Key Engineering Decisions](#key-engineering-decisions)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Future Improvements](#future-improvements)

## The Problem & Product Context

Startup Shell manages a collection of shared physical and digital resources used by members across the organization. Before Shell Checkout, the checkout process relied on a Google Form, informal board approval, and scattered communication. Requests were easy to miss because the form was only reviewed periodically, and once an item was approved, there was no centralized way to track where it was, who had it, when it was expected back, or whether it had been blocked out for board use.

This created real operational problems: members had to ask board members in person to know whether something was available, board members had to manually piece together item status from separate lists and conversations, and resources could stay out longer than expected without a clear source of truth. Shell Checkout was built to turn that informal process into a structured & safe workflow.


## Features

### Member-Facing Functionality

- **Organization Authentication:** Google OAuth restricted to verified Startup Shell members.
- **Inventory Browsing:** Searchable catalog with item descriptions, quantities, availability, and checkout history.
- **Availability Calendars:** Item-level views combining approved reservations and board-created blockouts.
- **Checkout Requests:** Structured pickup and return scheduling with rental consent, optional notes, and private contract uploads.
- **Request Tracking:** Personal history across pending, approved, denied, returned, and confirmed-return states.

### Board/Admin Controls

- **Role-Based Access:** Database-backed board permissions enforced across protected dashboards and API routes.
- **Approval Queue:** Centralized review of pending, approved, denied, and completed requests.
- **Request Management:** Approval, denial, schedule editing, contract review, and return confirmation.
- **Role Management:** Authorized board members can promote or demote other verified members.
- **Decision Attribution:** Approval and return records identify the responsible board member.

### Inventory Management

- **Resource Administration:** Creation and editing of inventory records, quantities, descriptions, and availability.
- **Soft Deletion:** Retired resources are hidden without destroying historical checkout records.
- **Checkout History:** Each item retains its associated requester, reservation dates, status, and return history.
- **Availability States:** Active inventory, approved reservations, blockouts, and unavailable resources remain distinguishable.

### Scheduling and Availability

- **Scheduled Reservations:** Each checkout records structured pickup and expected-return dates and times.
- **Calendar Visualization:** Reservations and blockouts appear in item-level and organization-wide calendar views.
- **Board Blockouts:** Administrators can reserve periods when specific resources cannot be requested.
- **Availability Planning:** Members can see when resources are scheduled for use or expected to become available.

### Notifications

- **Board Alerts:** New checkout requests are posted to a board Discord channel.
- **Member Updates:** Approval and denial decisions are delivered through Discord direct messages.
- **Nonblocking Delivery:** Notification failures do not discard successfully persisted checkout requests.
- **OAuth Linking:** Members securely associate their Discord identity with their Shell Checkout profile.

### Workflow Automation

- **Request Lifecycle:** Checkouts progress through pending, approved, denied, returned, and confirmed-return states.
- **Integrated Operations:** Requests connect members, inventory, schedules, contracts, board decisions, and notifications.
- **Centralized Records:** PostgreSQL serves as the source of truth for resource status and checkout history.
- **Process Modernization:** Replaces Google Forms and manual follow-up with a structured, auditable workflow.

## System Design and Architecture

Shell Checkout is structured as a modular monolith: the frontend, server-rendered pages, and API routes live in one Next.js application, while authentication, persistence, storage, and external integrations remain separated by clear module boundaries.

### Application Layer

- **Next.js App Router:** Combines server components, interactive client components, and REST-style route handlers in one deployable application.
- **Stateless Deployment:** Vercel handles application execution while persistent state remains in PostgreSQL and Supabase Storage.
- **Shared Domain Types:** TypeScript interfaces define consistent shapes for users, items, checkouts, returns, and blockouts across frontend and backend code.

### Authentication and Domain Identity

- **Separated Identity Models:** Better Auth owns users, sessions, and OAuth accounts, while `shellers` stores organization-specific profile and permission data.
- **One-to-One Linking:** `shellers.auth_user_id` uniquely references `user.id`, preventing orphaned application profiles.
- **Lifecycle Synchronization:** Better Auth hooks create or update the corresponding sheller after auth-user changes, with `getCurrentSheller()` providing a server-side recovery path.
- **Migration Compatibility:** Existing profiles can be reconciled by normalized verified email before future requests use the foreign-key relationship.

### API and Authorization Boundary

- **Server-Owned Authorization:** Protected route handlers reload the current sheller and board role from PostgreSQL instead of trusting browser state.
- **Request Validation:** Zod schemas validate identifiers, required fields, allowed status values, and date relationships at API boundaries.
- **Layered Route Protection:** The request proxy provides an early session-cookie check, while API handlers perform full session and permission validation.
- **Privileged Data Access:** Server routes use a service-role Supabase client, making route-level authorization mandatory because that client bypasses RLS.

### Persistence and Data Integrity

- **Relational Storage:** PostgreSQL models users, shellers, inventory, reservations, returns, and blockouts with explicit foreign keys.
- **Database Constraints:** Unique identifiers, status checks, required fields, and delete behaviors enforce invariants independently of application code.
- **Migration-Based Changes:** Schema updates are versioned as SQL migrations and applied to development before production.
- **Private Object Storage:** Contracts are stored outside relational tables; PostgreSQL retains only their storage paths.

### Integration Boundaries

- **Time-Limited File Access:** Protected server routes generate signed contract URLs instead of exposing permanent public links.
- **Nonblocking Notifications:** Discord calls run after successful database writes so third-party outages do not invalidate persisted operations.
- **Server-Side Secrets:** Database credentials, OAuth secrets, service-role keys, and bot tokens remain in environment variables and are never exposed to browser code.

### Key Engineering Decisions

| Problem | Product / Engineering Decision | Tradeoff |
| --- | --- | --- |
| Checkout requests were easy to miss in a periodically reviewed Google Form. | Persisted requests as a database-backed workflow and dispatched Discord alerts after successful submission. | Discord improves response time but introduces a third-party dependency; delivery is currently nonblocking without durable retries. |
| Members could not determine when a resource was actually available. | Derived calendar views from approved reservations, expected return dates, and board-created blockouts. | Time-based availability is more accurate than a boolean flag but requires reasoning across multiple scheduling records. |
| Approved checkouts relied on informal pickup and return agreements. | Required structured pickup and return windows and modeled requests with explicit lifecycle states. | Additional required fields add form friction; server routes enforce transitions while PostgreSQL constrains valid status values. |
| Inventory, approvals, scheduling, and history were spread across separate tools. | Centralized the workflow in a Next.js modular monolith backed by PostgreSQL. | A single deployment is simpler at the current scale, but components cannot yet be deployed or scaled independently. |
| Historical ownership and decision responsibility were difficult to audit. | Used normalized relationships, approval and confirmation attribution, checkout history, and soft deletion for inventory. | Stronger history requires more relational constraints and carefully coordinated schema migrations. |
| Authentication records and organization-specific permissions have different responsibilities. | Kept Better Auth users separate from `shellers`, linked them one-to-one with a foreign key, and synchronized them through server-side lifecycle hooks. | Separation reduces coupling but introduces synchronization logic and migration complexity. |
| Client-side role checks could not safely protect privileged operations. | Revalidated the Better Auth session and database-backed board role in every protected route through `getCurrentSheller()`. | Server authorization adds database lookups but prevents modified browser state from granting access. |
| Contracts contain private member information and should not have permanent public URLs. | Stored files in a private Supabase bucket and generated short-lived signed URLs through board-authorized routes. | Private access improves confidentiality but requires server-mediated upload and retrieval flows. |

## Demo

coming soon

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, Base UI, FullCalendar
- **Backend:** Next.js Route Handlers, Node.js, Zod
- **Database:** PostgreSQL, Supabase, SQL migrations, Row Level Security
- **Authentication:** Better Auth, Google OAuth, `pg`
- **Storage:** Supabase Storage, signed URLs
- **Integrations:** Discord OAuth, Discord Bot API
- **Deployment:** Vercel, Supabase

## Future Improvements

- **Mobile Responsiveness:** Optimize member and board workflows for smaller screens and field use.
- **Text-Based Availability Bot:** Allow members to message a chatbot to check whether an item is available and when it is expected back.
- **Google Calendar Returns:** Create calendar events and reminders for scheduled item return dates.
