# ADR-003: Use Leaflet + OpenStreetMap (No MapTiler/Google Maps)

**Date:** 2026-03-20  
**Status:** Accepted

## Context

Original implementation used MapLibre + MapTiler (paid API, large bundle, SSR crashes).

## Decision

Replace with Leaflet + OSM tiles. `NearbyMap` component uses dynamic import (SSR-safe), CSS `divIcon` for custom markers, geohash-ring placement for privacy.

## Consequences

- Zero API key required
- Bundle: ~42KB gzipped vs ~380KB for MapLibre
- No `NEXT_PUBLIC_MAPTILER_KEY` ever needed
- OSM community tiles — no proprietary ToS

## Rejected Alternatives

- MapTiler: paid after quota, proprietary
- Google Maps: expensive, privacy concerns, large bundle
- MapLibre: SSR crashes, large bundle, still needs tile provider
