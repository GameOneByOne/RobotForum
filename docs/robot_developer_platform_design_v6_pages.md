# Robot Developer Platform

# 03-pages Page Design

Version: v1.0

------------------------------------------------------------------------

# 03-pages/home.md

# Home Page Design

## Goal

首页不是内容瀑布流。

核心目标：

> 帮助用户继续自己的机器人开发成长路线。

------------------------------------------------------------------------

# Layout

Desktop:

    Header

    Hero

    Learning Dashboard

    Recommended Learning

    Projects

    Knowledge

    Discussion

    Resources

------------------------------------------------------------------------

# Header

Components:

    Logo

    Navigation

    Search

    User Menu

Navigation:

    Learn

    Projects

    Knowledge

    Discuss

    Resources

------------------------------------------------------------------------

# Hero

内容：

    Build Your Own Iron Man

    机器人开发者的成长地图

Actions:

    Start Learning

    Explore Projects

------------------------------------------------------------------------

# Learning Dashboard

展示：

    Current Path

    Progress

    Next Step

Example:

    ROS2 Beginner

    65%

    Continue:

    ROS2 Navigation

------------------------------------------------------------------------

# Project Section

展示：

    Featured Projects

    Recently Updated Projects

    Beginner Friendly Projects

Card:

    Cover

    Title

    Description

    Tags

    Author

------------------------------------------------------------------------

# Knowledge Section

展示：

    Latest Knowledge

    Popular Tutorials

    Engineering Notes

------------------------------------------------------------------------

# Discussion Section

展示：

    Unsolved Questions

    Latest Discussions

重点：

帮助用户解决真实工程问题。

------------------------------------------------------------------------

# 03-pages/learn.md

# Learn Page Design

## Purpose

成长地图。

不是课程列表。

------------------------------------------------------------------------

# Structure

    Learning Paths

    ↓

    Stages

    ↓

    Topics

    ↓

    Tutorials

------------------------------------------------------------------------

# Learning Path Example

    Robot Developer

    ├── Linux

    ├── C++

    ├── ROS2

    ├── Simulation

    ├── SLAM

    ├── Navigation

    └── Real Robot

------------------------------------------------------------------------

# Learning Node

包含：

    Title

    Description

    Difficulty

    Required Knowledge

    Related Tutorials

    Projects

------------------------------------------------------------------------

# Progress

用户状态：

    Not Started

    Learning

    Completed

------------------------------------------------------------------------

# 03-pages/knowledge.md

# Knowledge Page Design

------------------------------------------------------------------------

# Knowledge List

Filter:

    Category

    Difficulty

    Tag

    Author

------------------------------------------------------------------------

# Knowledge Detail

Layout:

    Title

    Summary

    Author

    Tags

    Content

    Related

    Discussion

    Project

------------------------------------------------------------------------

# Content Features

Support:

    Markdown

    Code

    Image

    GIF

    Mermaid

    KaTeX

------------------------------------------------------------------------

# Related Section

Bottom:

    Related Knowledge

    Related Discussions

    Related Projects

------------------------------------------------------------------------

# 03-pages/discussion.md

# Discussion Page Design

------------------------------------------------------------------------

# Discussion Types

    Question

    Discussion

    Bug Report

    Experience

------------------------------------------------------------------------

# Question Layout

    Title

    Description

    Environment

    Code

    Tags

    Comments

    Answer

------------------------------------------------------------------------

# Bug Report

Additional fields:

    OS

    Hardware

    Framework

    Version

    Error Log

------------------------------------------------------------------------

# Answer System

Features:

    Reply

    Code Block

    Markdown

    Accepted Answer

------------------------------------------------------------------------

# 03-pages/editor.md

# Editor Design

## Goal

提供机器人开发者最佳写作体验。

------------------------------------------------------------------------

# Editor Features

    Markdown

    Code Block

    Image Upload

    GIF Upload

    Mermaid

    KaTeX

------------------------------------------------------------------------

# Code Block

Features:

    Syntax Highlight

    Copy

    Line Number

    Highlight Lines

    Language Badge

------------------------------------------------------------------------

# Upload

Support:

    Drag Drop

    Paste Image

    GIF

    Attachment

------------------------------------------------------------------------

# 03-pages/project.md

# Project Page Design

MVP:

Project Card.

------------------------------------------------------------------------

# Project Detail

Structure:

    Cover

    Title

    Description

    Technology Tags

    Github

    Related Knowledge

    Related Discussion

------------------------------------------------------------------------

# Future Extension

    Timeline

    Milestone

    Version

    Contribution

------------------------------------------------------------------------

# 03-pages/search.md

# Search Page Design

------------------------------------------------------------------------

# Search Everything

Search:

    Knowledge

    Discussion

    Project

    Resource

    Tag

------------------------------------------------------------------------

# Result Card

Display:

    Title

    Type

    Summary

    Tags

    Author

------------------------------------------------------------------------

# Search Experience

Features:

    Instant Search

    Filter

    Tag Search

    Category Search

------------------------------------------------------------------------

# UI Implementation Notes

Technology:

    Next.js App Router

    Tailwind CSS

    Server Components

Interactive components:

    Editor

    Search Input

    Filters

    Comments

------------------------------------------------------------------------

# Component Mapping

    Page

    ↓

    Feature Components

    ↓

    Shared UI Components
