# Robot Developer Platform

# 04-system/database-advanced.md

Version: v1.0

------------------------------------------------------------------------

# Database Advanced Design

## 1. Database Philosophy

Supabase PostgreSQL is the source of truth.

Design goals:

-   relational consistency
-   scalable queries
-   simple migration
-   RLS security

------------------------------------------------------------------------

# 2. Core Schema

## users

``` sql
users
id uuid primary key
username text unique
avatar_url text
bio text
created_at timestamptz
updated_at timestamptz
```

------------------------------------------------------------------------

## knowledge

``` sql
knowledge
id uuid primary key
author_id uuid

title text
slug text unique

summary text
content jsonb

type text
difficulty text
status text

created_at timestamptz
updated_at timestamptz
```

Indexes:

``` sql
title
slug
author_id
created_at
```

------------------------------------------------------------------------

## discussions

``` sql
discussions
id uuid primary key

author_id uuid

title text
content jsonb

type text
status text

created_at timestamptz
```

------------------------------------------------------------------------

## projects

``` sql
projects
id uuid primary key

owner_id uuid

title text
description text

cover_url text
github_url text

created_at timestamptz
```

------------------------------------------------------------------------

# 3. RLS Strategy

## Knowledge

Public:

read published content

User:

create own draft

Author:

update own content

Moderator:

review content

------------------------------------------------------------------------

# 04-system/api-spec.md

# API Specification

Architecture:

    Next.js

    ↓

    Server Actions

    ↓

    Supabase

    ↓

    PostgreSQL

------------------------------------------------------------------------

# Knowledge API

Create:

    createKnowledge()

Update:

    updateKnowledge()

Query:

    getKnowledge()

------------------------------------------------------------------------

# Discussion API

Operations:

    createDiscussion

    addComment

    markSolved

------------------------------------------------------------------------

# Project API

Operations:

    createProject

    updateProject

    getProjects

------------------------------------------------------------------------

# Upload API

Purpose:

-   image upload
-   GIF upload
-   attachment upload

Flow:

    Client

    ↓

    Server Action

    ↓

    Supabase Storage

    ↓

    Return URL

------------------------------------------------------------------------

# 04-system/editor-architecture.md

# Editor Architecture

The editor is a core product capability.

Goal:

> Best technical writing experience for robotics developers.

------------------------------------------------------------------------

# 1. Requirements

Support:

    Markdown

    Code Block

    Syntax Highlight

    GIF

    Image

    Mermaid

    KaTeX

    Table

    Quote

------------------------------------------------------------------------

# 2. Editor Architecture

Recommended:

    Editor

    ↓

    Document Model

    ↓

    Markdown Serializer

    ↓

    Database

    ↓

    Renderer

------------------------------------------------------------------------

# 3. Code Block

Technology:

Shiki

Features:

    Syntax Highlight

    Line Number

    Copy

    Line Highlight

    Theme Support

------------------------------------------------------------------------

# 4. Media

Upload:

    Paste Image

    Drag Image

    Upload GIF

    Attach File

Storage:

Supabase Storage.

------------------------------------------------------------------------

# 5. Rendering

Pipeline:

    Markdown

    ↓

    Parser

    ↓

    React Components

    ↓

    HTML

------------------------------------------------------------------------

# 04-system/search-design.md

# Search Design

------------------------------------------------------------------------

# MVP

Use PostgreSQL Full Text Search.

Search:

    Knowledge

    Discussion

    Project

    Resource

    Tag

------------------------------------------------------------------------

# Ranking

Priority:

    Title

    Tag

    Summary

    Content

    Popularity

------------------------------------------------------------------------

# Future

Upgrade:

    PostgreSQL

    ↓

    Meilisearch

    ↓

    Advanced Search

------------------------------------------------------------------------

# 04-system/deployment.md

# Deployment Design

------------------------------------------------------------------------

# Platform

Vercel.

------------------------------------------------------------------------

# Environment

    Development

    Preview

    Production

------------------------------------------------------------------------

# Environment Variables

    NEXT_PUBLIC_SUPABASE_URL

    NEXT_PUBLIC_SUPABASE_ANON_KEY

    SUPABASE_SERVICE_ROLE_KEY

------------------------------------------------------------------------

# Deployment Flow

    Git Push

    ↓

    Vercel Build

    ↓

    Preview Deploy

    ↓

    Production Deploy

------------------------------------------------------------------------

# Monitoring

Future:

-   Vercel Analytics
-   Error Tracking
-   Database Monitoring

------------------------------------------------------------------------

# Engineering Principle

The platform should remain:

-   simple
-   maintainable
-   scalable

while supporting future growth.
