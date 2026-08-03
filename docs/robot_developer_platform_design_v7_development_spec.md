# Robot Developer Platform

# 05-development Engineering Specification

Version: v1.0

------------------------------------------------------------------------

# 1. Project Structure

## Recommended Next.js Structure

    src/

    app/

    components/

    features/

    lib/

    hooks/

    types/

    styles/

    config/

------------------------------------------------------------------------

# app

负责：

-   routing
-   layouts
-   pages
-   route handlers

Example:

    app/

    knowledge/

    projects/

    discuss/

    learn/

    api/

------------------------------------------------------------------------

# components

全局 UI 组件。

例如：

    Button

    Card

    Modal

    Tag

    Avatar

    CodeBlock

------------------------------------------------------------------------

# features

业务模块。

推荐：

    features/

    knowledge/

    discussion/

    project/

    learning/

    search/

每个 feature:

    components/

    actions/

    queries/

    schemas/

    types/

------------------------------------------------------------------------

# lib

基础能力。

例如：

    supabase/

    markdown/

    storage/

    auth/

    utils/

------------------------------------------------------------------------

# 2. Component Library

Design System 基于 Tailwind CSS。

------------------------------------------------------------------------

# Component Principles

组件必须：

-   单一职责
-   可组合
-   可复用
-   类型安全

------------------------------------------------------------------------

# Core Components

## Button

Variants:

    primary

    secondary

    ghost

    danger

------------------------------------------------------------------------

## Card

用途：

    Knowledge Card

    Project Card

    Discussion Card

------------------------------------------------------------------------

## CodeBlock

核心组件。

要求：

    Syntax Highlight

    Copy

    Line Number

    Language Label

------------------------------------------------------------------------

## MarkdownRenderer

负责：

    Markdown

    Code

    Image

    GIF

    Mermaid

    KaTeX

------------------------------------------------------------------------

# 3. Coding Standard

## TypeScript

启用：

    strict mode

要求：

-   禁止 any
-   明确类型
-   公共函数必须声明返回类型

------------------------------------------------------------------------

# Naming

Components:

    PascalCase

Functions:

    camelCase

Database:

    snake_case

------------------------------------------------------------------------

# React Rules

优先：

Server Component。

只有以下使用 Client Component：

-   Editor
-   Interactive Form
-   Animation
-   Browser API

------------------------------------------------------------------------

# Data Access

禁止：

Component 直接访问数据库。

推荐：

    Component

    ↓

    Server Action

    ↓

    Query Layer

    ↓

    Supabase

------------------------------------------------------------------------

# 4. State Management

原则：

尽量减少客户端状态。

------------------------------------------------------------------------

# Server State

使用：

    Next.js Server Component

    Supabase Query

------------------------------------------------------------------------

# Client State

只有必要时：

    React Context

    Zustand

适用于：

-   Editor State
-   UI State
-   Modal

------------------------------------------------------------------------

# 不使用

默认不引入：

    Redux

原因：

增加复杂度。

------------------------------------------------------------------------

# 5. Testing Strategy

## Unit Test

工具：

    Vitest

测试：

-   utils
-   parser
-   validation

------------------------------------------------------------------------

## Component Test

工具：

    React Testing Library

测试：

-   UI
-   interaction

------------------------------------------------------------------------

## E2E

工具：

    Playwright

测试：

    Register

    Create Knowledge

    Create Discussion

    Search

------------------------------------------------------------------------

# 6. Development Workflow

## Git Strategy

分支：

    main

    develop

    feature/*
    fix/*

------------------------------------------------------------------------

# Commit Convention

采用：

    feat:

    fix:

    docs:

    refactor:

    test:

------------------------------------------------------------------------

# Deployment Flow

    Push

    ↓

    GitHub

    ↓

    Vercel Preview

    ↓

    Review

    ↓

    Production

------------------------------------------------------------------------

# Database Migration

Supabase Migration:

    migration file

    ↓

    review

    ↓

    deploy

------------------------------------------------------------------------

# 7. Final Architecture Summary

Complete Stack:

    Frontend

    Next.js
    TypeScript
    Tailwind CSS


    Backend

    Supabase


    Database

    PostgreSQL


    Storage

    Supabase Storage


    Deployment

    Vercel

------------------------------------------------------------------------

# 8. Future Roadmap

## Phase 1

Core Community:

    Knowledge

    Discussion

    Learning

    Search

------------------------------------------------------------------------

## Phase 2

Developer Growth:

    Project Enhancement

    Knowledge Versioning

    Advanced Roadmap

------------------------------------------------------------------------

## Phase 3

Developer Platform:

    Collaboration

    Advanced Search

    Realtime Features

    Open Source Integration

------------------------------------------------------------------------

# Product Final Goal

> 每个人都能通过这个网站成为自己的钢铁侠。
