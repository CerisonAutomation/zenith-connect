/**
 * Supabase MCP Server stub for Zenith Connect.
 * Provides typed tool definitions for database operations via MCP.
 * Reference: https://supabase.com/docs/guides/getting-started/mcp
 *
 * Tools follow least-privilege:
 * - Read ops: no confirmation
 * - Write ops: require Action→Confirm→Execute
 * - Delete ops: require explicit human approval
 */

export const supabaseMcpTools = [
  {
    name: 'get_user_profile',
    description: 'Fetch a user profile by ID. Read-only.',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string', format: 'uuid' },
      },
      required: ['userId'],
    },
  },
  {
    name: 'search_profiles',
    description: 'Search nearby profiles using PostGIS. Returns fuzzed coordinates. Read-only.',
    inputSchema: {
      type: 'object',
      properties: {
        lat: { type: 'number' },
        lng: { type: 'number' },
        radiusKm: { type: 'number', default: 50 },
        limit: { type: 'number', default: 20 },
      },
      required: ['lat', 'lng'],
    },
  },
  {
    name: 'update_profile',
    description: 'Update profile fields. REQUIRES user confirmation before execution.',
    confirmation_required: true,
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string', format: 'uuid' },
        fields: { type: 'object' },
      },
      required: ['userId', 'fields'],
    },
  },
] as const
