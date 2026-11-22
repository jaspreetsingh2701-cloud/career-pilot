export type RuntimeMessage = { type: 'PING_ACTIVE_TAB' };
export type TabMessage = { type: 'CAREERPILOT_CONTENT_PING' };
export type RuntimeResponse = { ok: true; message: string } | { ok: false; error: string };
