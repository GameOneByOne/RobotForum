# Robot Developer Platform

# 04-system/technical-architecture-advanced.md

Version: v1.0

------------------------------------------------------------------------

# 1. Overall Architecture

Technology stack:

    Frontend

    Next.js + TypeScript + Tailwind CSS


    Backend Platform

    Supabase


    Deployment

    Vercel

Architecture style:

    Modern Full Stack Serverless Architecture

------------------------------------------------------------------------

# 2. High Level Architecture

    User Browser

    ↓

    Vercel Edge Network

    ↓

    Next.js Application

    ↓

    Supabase

    ├── PostgreSQL

    ├── Auth

    ├── Storage

    └── Realtime

------------------------------------------------------------------------

# 3. Next.js Architecture

Use App Router.

Recommended:

    src/

    app/

    components/

    features/

    lib/

    hooks/

    types/

------------------------------------------------------------------------

# 4. Rendering Strategy

## Server Components

Default.

Used for:

-   Knowledge pages
-   Project pages
-   Discussion pages
-   Search results

Advantages:

-   Better SEO
-   Faster loading
-   Less client JS

------------------------------------------------------------------------

## Client Components

Only for interaction:

-   Markdown Editor
-   Comments
-   Like button
-   Bookmark
-   Search interaction

------------------------------------------------------------------------

# 5. Feature Architecture

Each business domain is isolated.

Example:

    features/

    knowledge/

     components/

     actions/

     queries/

     schemas/


    discussion/

     components/

     actions/

     queries/


    project/

     components/

     actions/

------------------------------------------------------------------------

# 6. Supabase Architecture

Supabase provides:

## Database

PostgreSQL:

-   relational data
-   full text search
-   constraints

## Auth

Authentication:

-   user identity
-   session management

## Storage

Files:

-   images
-   GIF
-   attachments

## Realtime

Future:

-   notifications
-   live discussion

------------------------------------------------------------------------

# 7. Security Architecture

## Row Level Security

Every user table enables RLS.

Example:

Knowledge:

Public:

read published content

User:

create own draft

Author:

update own content

Moderator:

review content

------------------------------------------------------------------------

# 8. Search Architecture

MVP:

PostgreSQL Full Text Search.

Search targets:

    Knowledge

    Discussion

    Project

    Resource

    Tag

------------------------------------------------------------------------

Future:

Upgrade:

    Next.js

    ↓

    Search Service

    ↓

    Meilisearch / Elasticsearch

------------------------------------------------------------------------

# 9. Markdown System Architecture

Content format:

    Markdown

    +

    Metadata

    +

    Relations

Storage:

PostgreSQL jsonb/text.

Rendering:

    Markdown

    ↓

    Parser

    ↓

    React Components

    ↓

    HTML

------------------------------------------------------------------------

# 10. Code Highlight System

Requirement:

Extreme developer experience.

Technology:

Shiki.

Features:

    Syntax Highlight

    Line Number

    Copy Button

    Line Highlight

    Language Detection

    Theme Switching

Supported:

    Python

    C++

    Rust

    JavaScript

    TypeScript

    Bash

    CUDA

    C

------------------------------------------------------------------------

# 11. Image and GIF Pipeline

Flow:

    Upload

    ↓

    Supabase Storage

    ↓

    Database Save URL

    ↓

    Markdown Reference

    ↓

    Render

Supported:

    PNG

    JPEG

    WEBP

    GIF

------------------------------------------------------------------------

# 12. Deployment

Vercel:

Environment:

    Production

    Preview

    Development

Environment variables:

    NEXT_PUBLIC_SUPABASE_URL

    NEXT_PUBLIC_SUPABASE_ANON_KEY

    SUPABASE_SERVICE_ROLE_KEY

------------------------------------------------------------------------

# 13. Performance Strategy

## Frontend

Use:

-   Server Components
-   Image Optimization
-   Dynamic Import

## Database

Use:

-   Index
-   Pagination
-   Query Optimization

## Cache

Use:

Next.js Cache

Future:

Redis

------------------------------------------------------------------------

# 14. Future Extension

Possible evolution:

    Current:

    Next.js + Supabase


    Future:

    +

    Background Worker

    +

    Search Engine

    +

    Analytics

    +

    Object Storage CDN

    +

    Realtime Collaboration

------------------------------------------------------------------------

# 15. Engineering Rules

1.  Database schema before API.

2.  Server Component first.

3.  Client state only when necessary.

4.  Keep business logic in feature modules.

5.  All content must be searchable.

6.  All UI must use Tailwind design tokens.
