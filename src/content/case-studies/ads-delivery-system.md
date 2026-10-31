---
title: Ads Delivery System
slug: ads-delivery-system
summary: A real-time ad delivery and tracking system handling the full lifecycle of every ad.
stack: [Python, FastAPI, Redis, PostgreSQL, Docker, AWS]
roles: [backend, ai, all]
order: 2
---

## Problem

Ads had to be chosen and served with very low latency, and every step of an ad's life had to be tracked reliably for analytics, reporting and audits, even under high traffic.

## My role

Designed and built the backend services: the decision engine, the event pipeline and the data model.

## Architecture

A low-latency ad decision engine on Redis makes sub-millisecond targeting decisions. An event-driven architecture tracks each ad through Assigned → Delivered → Rendered → Seen → Clicked. A queue-based logging system absorbs high-throughput impression and click events, and PostgreSQL stores structured events for analytics, reporting and audit trails.

## Stack

Python, FastAPI, Redis, PostgreSQL, Docker and AWS.

## Outcome

An end-to-end system optimised for horizontal scalability and high availability, with full lifecycle tracking for every ad.
