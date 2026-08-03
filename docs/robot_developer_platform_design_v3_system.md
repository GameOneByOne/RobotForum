# Robot Developer Platform

# 04-system/database.md

Version: v1.0

------------------------------------------------------------------------

# Database Design

Database uses:

-   Supabase PostgreSQL
-   Row Level Security (RLS)
-   UUID primary keys

------------------------------------------------------------------------

# 1. Core Tables

## users

User profile extension.

``` sql
users
----
id uuid PK
username text
avatar_url text
bio text
created_at timestamp
updated_at timestamp
```

------------------------------------------------------------------------

## knowledge

Core knowledge asset.

``` sql
knowledge
----
id uuid PK
author_id uuid FK

title text
slug text
summary text

content jsonb

type text
difficulty text

status text

created_at timestamp
updated_at timestamp
```

Types:

    tutorial
    guide
    best_practice
    reference
    faq
    engineering_note

------------------------------------------------------------------------

## discussions

Community discussion.

``` sql
discussions
----
id uuid PK
author_id uuid FK

title text
content jsonb

type text

status text

created_at timestamp
updated_at timestamp
```

Types:

    question
    discussion
    bug_report
    experience

------------------------------------------------------------------------

## projects

MVP Project Card.

``` sql
projects
----
id uuid PK

owner_id uuid FK

title text
description text

cover_url text
github_url text

created_at timestamp
updated_at timestamp
```

------------------------------------------------------------------------

## resources

Resource directory.

``` sql
resources
----
id uuid PK

creator_id uuid FK

title text
url text

type text

description text

created_at timestamp
```

------------------------------------------------------------------------

## tags

Global tag system.

``` sql
tags
----
id uuid PK

name text UNIQUE

created_at timestamp
```

------------------------------------------------------------------------

# 2. Relation Tables

## knowledge_tags

``` sql
knowledge_id
tag_id
```

------------------------------------------------------------------------

## discussion_tags

``` sql
discussion_id
tag_id
```

------------------------------------------------------------------------

## project_tags

``` sql
project_id
tag_id
```

------------------------------------------------------------------------

# 3. Comments

Unified comment system.

``` sql
comments
----
id uuid PK

author_id uuid

target_type text

target_id uuid

content jsonb

created_at timestamp
```

target_type:

    knowledge
    discussion
    project

------------------------------------------------------------------------

# 4. User Actions

## bookmarks

``` sql
bookmarks
----
id uuid PK

user_id uuid

target_type text

target_id uuid

created_at timestamp
```

------------------------------------------------------------------------

## likes

``` sql
likes
----
id uuid PK

user_id uuid

target_type text

target_id uuid
```

------------------------------------------------------------------------

# 5. Permission Model

Using Supabase RLS.

Roles:

    anonymous

    user

    moderator

    admin

------------------------------------------------------------------------

# 04-system/auth.md

# Authentication Design

Uses:

Supabase Auth.

------------------------------------------------------------------------

# Login Methods

MVP:

    Email

    Password

    OAuth(optional)

Future:

    Github OAuth
    Google OAuth

------------------------------------------------------------------------

# User Flow

    Register

    ↓

    Create Profile

    ↓

    Explore Learning Path

    ↓

    Create Content

------------------------------------------------------------------------

# Permission Rules

Anonymous:

-   Read public content

User:

-   Create discussion
-   Create knowledge draft
-   Comment
-   Bookmark

Moderator:

-   Review content

Admin:

-   System management

------------------------------------------------------------------------

# 04-system/api.md

# API Design

Next.js App Router.

------------------------------------------------------------------------

# Architecture

    Component

    ↓

    Server Action

    ↓

    Supabase Client

    ↓

    PostgreSQL

------------------------------------------------------------------------

# Server Actions

Used for:

-   Create Knowledge
-   Update Profile
-   Create Discussion
-   Bookmark

------------------------------------------------------------------------

# Route Handlers

Used for:

-   Upload
-   External callbacks
-   Search API

Example:

    /api/search

    /api/upload

    /api/resource

------------------------------------------------------------------------

# Data Fetching

Default:

Server Components.

Client Components only for:

-   Editor
-   Interactive UI
-   Real-time updates

------------------------------------------------------------------------

# 04-system/storage.md

# Storage Design

Supabase Storage.

Buckets:

    avatars

    knowledge-images

    project-images

    attachments

------------------------------------------------------------------------

# Upload Rules

Images:

    jpg
    png
    webp
    gif

Documents:

    pdf
    md
    txt

------------------------------------------------------------------------

# 05-development/project-structure.md

# Next.js Project Structure

Recommended:

    src/

     app/

     components/

     features/

     lib/

     hooks/

     types/

     styles/

------------------------------------------------------------------------

# App Router

Example:

    app/

    (page)

    knowledge/

    projects/

    discuss/

    learn/

    api/

------------------------------------------------------------------------

# Feature Structure

Complex modules:

    features/

    knowledge/

     components/

     hooks/

     actions/

     types/

------------------------------------------------------------------------

# Components

Global components:

    Button

    Card

    Modal

    Editor

    CodeBlock

    Tag

Feature components stay inside feature folder.

------------------------------------------------------------------------

# Tailwind Rules

Do:

-   Utility classes
-   Design tokens
-   Component abstraction

Avoid:

-   Random CSS files
-   Inline style
-   Duplicate styles

------------------------------------------------------------------------

# Development Principles

1.  TypeScript strict mode

2.  Server Component first

3.  Database schema first

4.  Reusable components

5.  Mobile responsive

6.  Accessible UI
