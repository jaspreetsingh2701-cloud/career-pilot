export type ContentScriptReadyMessage = {
  type: "CONTENT_SCRIPT_READY";
  url: string;
};

export type PingActiveTabMessage = {
  type: "PING_ACTIVE_TAB";
};

export type RuntimeMessage = ContentScriptReadyMessage | PingActiveTabMessage;

export type TabMessage = {
  type: "CAREERPILOT_CONTENT_PING";
};

export type RuntimeResponse =
  | {
      ok: true;
      message: string;
    }
  | {
      ok: false;
      error: string;
    };
