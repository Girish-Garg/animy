// Derives whether a chat currently has a video generating, straight from the
// backend's prompt records — the single source of truth. Used to reconcile the
// client "generating" state on load so a stale flag can't get stranded as true
// after a stop or reload.
export function findActiveGeneratingPrompt(chat) {
  if (!chat || !Array.isArray(chat.prompts)) return null;
  return chat.prompts.find((p) => !p.video && p.status === 'processing') || null;
}
