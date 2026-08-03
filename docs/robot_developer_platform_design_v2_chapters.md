# Robot Developer Platform

# 01-product/information-architecture.md

Version: v1.0

------------------------------------------------------------------------

# 1. Information Architecture Overview

Robot Developer Platform 采用面向对象的信息架构。

核心思想：

> 页面不是产品核心，对象和对象之间的关系才是核心。

平台围绕机器人开发生命周期组织：

    Learn

    ↓

    Build

    ↓

    Discuss

    ↓

    Share

    ↓

    Knowledge

------------------------------------------------------------------------

# 2. Global Navigation

最终一级导航：

    Home

    Learn

    Projects

    Knowledge

    Discuss

    Resources

------------------------------------------------------------------------

# 3. Learn

目标：

帮助用户建立机器人开发成长路径。

主要内容：

    Learning Path

    Roadmap

    Tutorial

    Progress

示例：

    机器人开发入门

    Linux

    ↓

    C++

    ↓

    ROS2

    ↓

    Simulation

    ↓

    SLAM

    ↓

    Navigation

    ↓

    Real Robot

------------------------------------------------------------------------

# 4. Projects

MVP 阶段：

Project Card。

目的：

展示用户正在创造什么。

字段：

    Title

    Description

    Cover

    Tags

    Github URL

    Related Content

未来扩展：

    Timeline

    Milestone

    Version

    Contribution

------------------------------------------------------------------------

# 5. Knowledge

Knowledge 是核心资产。

类型：

    Tutorial

    Guide

    Best Practice

    Reference

    FAQ

    Engineering Note

特点：

-   可长期维护
-   支持版本更新
-   可关联项目和讨论

------------------------------------------------------------------------

# 6. Discuss

讨论模块用于解决实际开发问题。

类型：

    Question

    Discussion

    Bug Report

    Experience

生命周期：

    Create

    ↓

    Discuss

    ↓

    Solved

    ↓

    Knowledge Candidate

------------------------------------------------------------------------

# 7. Resources

资源目录：

    Github Repository

    Paper

    Book

    Dataset

    Hardware

    Tool

    Course

------------------------------------------------------------------------

# 8. Content Relationship

核心关系：

    User

     ├── Knowledge

     ├── Discussion

     ├── Project

     └── Resource


    Knowledge

     ├── Tag

     ├── Project

     └── Discussion


    Project

     ├── Knowledge

     └── Discussion

------------------------------------------------------------------------

# 02-ui/design-system.md

# UI Design System

## 1. Design Direction

风格：

Linear + Github + Developer Tool

关键词：

    Professional

    Clean

    Technical

    Minimal

------------------------------------------------------------------------

# 2. Design Principles

## Content First

内容优先。

减少视觉噪音。

------------------------------------------------------------------------

## Developer Friendly

优先优化：

-   Markdown阅读
-   代码阅读
-   文档浏览
-   技术讨论

------------------------------------------------------------------------

# 3. Theme

支持：

    System Theme

    Light

    Dark

默认：

Follow System。

------------------------------------------------------------------------

# 4. Color System

基础：

    Background

    Surface

    Border

    Primary

    Secondary

    Success

    Warning

    Error

颜色通过 Tailwind Token 管理。

------------------------------------------------------------------------

# 5. Typography

推荐：

    Inter

    JetBrains Mono

使用：

-   Inter：普通文本
-   JetBrains Mono：代码

------------------------------------------------------------------------

# 6. Component System

核心组件：

    Button

    Card

    Tag

    Badge

    Avatar

    Modal

    Dropdown

    Tabs

    Editor

    CodeBlock

全部基于 Tailwind CSS。

------------------------------------------------------------------------

# 7. Code Block Design

代码展示是核心体验。

要求：

支持：

    Syntax Highlight

    Line Number

    Copy

    Line Highlight

    Collapse

    Language Badge

技术方案：

Shiki。

------------------------------------------------------------------------

# 8. Markdown System

支持：

    Markdown

    Code

    Mermaid

    KaTeX

    Image

    GIF

    Table

    Quote

------------------------------------------------------------------------

# 03-pages/home.md

# Home Page Design

## 1. Design Goal

首页不是信息流。

目标：

> 帮助用户继续成长。

------------------------------------------------------------------------

# 2. Desktop Layout

    Header

    Hero

    Learning Section

    Project Section

    Knowledge Section

    Discussion Section

    Resource Section

------------------------------------------------------------------------

# 3. Header

包含：

    Logo

    Search

    Navigation

    User Menu

------------------------------------------------------------------------

# 4. Hero

展示：

    Build Your Own Iron Man

    机器人开发者的成长地图

按钮：

    Start Learning

    Explore Projects

------------------------------------------------------------------------

# 5. Learning Area

展示：

    Current Roadmap

    Progress

    Recommended Next Step

------------------------------------------------------------------------

# 6. Project Area

展示：

    Popular Projects

    Recently Updated

    Beginner Projects

------------------------------------------------------------------------

# 7. Knowledge Area

展示：

    Latest Tutorials

    Best Practices

    Engineering Notes

------------------------------------------------------------------------

# 8. Discussion Area

展示：

    Unsolved Questions

    Latest Discussions

------------------------------------------------------------------------

# 04-system/tech-stack.md

# Technical Architecture

## 1. Stack

    Frontend:

    Next.js

    TypeScript

    Tailwind CSS


    Backend:

    Supabase


    Deployment:

    Vercel

------------------------------------------------------------------------

# 2. Next.js Architecture

采用：

App Router。

目录：

    app/

    components/

    features/

    lib/

    hooks/

    types/

------------------------------------------------------------------------

# 3. Supabase Responsibilities

使用：

    PostgreSQL

    Auth

    Storage

    Realtime

------------------------------------------------------------------------

# 4. Database Strategy

采用：

关系型设计。

核心表：

    users

    knowledge

    discussion

    projects

    resources

    tags

    comments

    bookmarks

------------------------------------------------------------------------

# 5. Deployment

Vercel:

负责：

    Production

    Preview

    Environment Variables

    Logs

------------------------------------------------------------------------

# 6. Future Extension

未来可增加：

    Search Engine

    Background Jobs

    Object Storage CDN

    Analytics
