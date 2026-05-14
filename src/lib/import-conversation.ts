import { Message, MessageStatus, Sender } from "@/store/useChatStore";

export interface ConversationImportResult {
  messages: Message[];
  warnings: string[];
}

interface ParseOptions {
  now?: Date;
  idFactory?: () => string;
}

type JsonMessage = {
  speaker?: unknown;
  sender?: unknown;
  text?: unknown;
  time?: unknown;
  status?: unknown;
};

const SPEAKER_PATTERN = /^([A-Za-z0-9_. -]{1,32}):\s*(.*)$/;

const defaultIdFactory = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const formatMessageTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const isValidStatus = (value: unknown): value is MessageStatus =>
  value === "sent" || value === "delivered" || value === "read";

const isValidSender = (value: unknown): value is Sender =>
  value === "me" || value === "them";

const senderFromSpeaker = (speaker: string): Sender =>
  speaker.trim().toUpperCase() === "A" ? "me" : "them";

const buildMessages = (
  entries: Array<{
    speaker?: string;
    sender?: Sender;
    text: string;
    time?: string;
    status?: MessageStatus;
  }>,
  options: ParseOptions = {}
): Message[] => {
  const idFactory = options.idFactory ?? defaultIdFactory;
  const baseTime = new Date(options.now ?? new Date());

  return entries.map((entry, index) => {
    const time = new Date(baseTime);
    time.setMinutes(time.getMinutes() + index);

    const sender = entry.sender ?? senderFromSpeaker(entry.speaker ?? "B");
    return {
      id: idFactory(),
      text: entry.text,
      sender,
      time: entry.time ?? formatMessageTime(time),
      status: entry.status ?? "read",
    };
  });
};

const ensureMessages = (messages: Message[], source: string): ConversationImportResult => {
  if (messages.length === 0) {
    throw new Error(`No valid messages found in ${source}.`);
  }

  return { messages, warnings: [] };
};

export const parseConversationText = (
  input: string,
  options: ParseOptions = {}
): ConversationImportResult => {
  const entries: Array<{ speaker: string; text: string }> = [];

  for (const rawLine of input.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const match = line.match(SPEAKER_PATTERN);
    if (match) {
      const [, speaker, text] = match;
      if (text.trim()) {
        entries.push({ speaker: speaker.trim(), text: text.trim() });
      }
      continue;
    }

    const last = entries[entries.length - 1];
    if (last) {
      last.text = `${last.text}\n${line}`;
    }
  }

  return ensureMessages(buildMessages(entries, options), "text import");
};

const normalizeJsonMessage = (message: JsonMessage) => {
  if (typeof message.text !== "string" || !message.text.trim()) {
    return null;
  }

  const speaker = typeof message.speaker === "string" ? message.speaker.trim() : undefined;
  const sender = isValidSender(message.sender) ? message.sender : undefined;
  const time = typeof message.time === "string" && message.time.trim() ? message.time : undefined;
  const status = isValidStatus(message.status) ? message.status : undefined;

  if (!speaker && !sender) {
    return null;
  }

  return {
    speaker,
    sender,
    text: message.text.trim(),
    time,
    status,
  };
};

export const parseConversationJson = (
  input: string,
  options: ParseOptions = {}
): ConversationImportResult => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(input);
  } catch {
    throw new Error("Invalid JSON conversation file.");
  }

  const rawMessages = Array.isArray(parsed)
    ? parsed
    : typeof parsed === "object" && parsed !== null && Array.isArray((parsed as { messages?: unknown }).messages)
      ? (parsed as { messages: unknown[] }).messages
      : null;

  if (!rawMessages) {
    throw new Error('JSON import must be an array or an object with a "messages" array.');
  }

  const entries = rawMessages
    .filter((item): item is JsonMessage => typeof item === "object" && item !== null)
    .map(normalizeJsonMessage)
    .filter((item): item is NonNullable<ReturnType<typeof normalizeJsonMessage>> => item !== null);

  return ensureMessages(buildMessages(entries, options), "JSON import");
};

export const parseConversationImport = (
  input: string,
  filename = "",
  options: ParseOptions = {}
): ConversationImportResult => {
  if (!input.trim()) {
    throw new Error("Import file is empty.");
  }

  const lowerFilename = filename.toLowerCase();
  if (lowerFilename.endsWith(".json")) {
    return parseConversationJson(input, options);
  }

  if (lowerFilename.endsWith(".txt")) {
    return parseConversationText(input, options);
  }

  const trimmed = input.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return parseConversationJson(input, options);
  }

  return parseConversationText(input, options);
};
