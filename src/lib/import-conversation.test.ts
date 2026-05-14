import { describe, expect, it } from "vitest";
import {
  parseConversationImport,
  parseConversationJson,
  parseConversationText,
} from "./import-conversation";

const createTestOptions = () => ({
  now: new Date("2026-05-14T10:00:00"),
  idFactory: (() => {
    let id = 0;
    return () => `message-${++id}`;
  })(),
});

describe("conversation import", () => {
  it("parses A/B text conversations with A as me", () => {
    const result = parseConversationText("A: Whats up\nB: Im good", createTestOptions());

    expect(result.messages).toEqual([
      {
        id: "message-1",
        text: "Whats up",
        sender: "me",
        time: expect.any(String),
        status: "read",
      },
      {
        id: "message-2",
        text: "Im good",
        sender: "them",
        time: expect.any(String),
        status: "read",
      },
    ]);
  });

  it("uses speaker labels for sender mapping without keeping labels in text", () => {
    const result = parseConversationText("A: I can do it\nB: Same\nC: Me too", {
      ...createTestOptions(),
      idFactory: () => "id",
    });

    expect(result.messages.map((message) => message.sender)).toEqual(["me", "them", "them"]);
    expect(result.messages.map((message) => message.text)).toEqual([
      "I can do it",
      "Same",
      "Me too",
    ]);
  });

  it("treats non-prefixed text lines as continuations", () => {
    const result = parseConversationText("A: First line\nsecond line\nB: Reply", {
      ...createTestOptions(),
      idFactory: () => "id",
    });

    expect(result.messages[0].text).toBe("First line\nsecond line");
  });

  it("rejects empty or malformed text imports", () => {
    expect(() => parseConversationImport("")).toThrow("Import file is empty.");
    expect(() => parseConversationText("no speaker here")).toThrow(
      "No valid messages found in text import."
    );
  });

  it("parses JSON arrays with speaker fields", () => {
    const result = parseConversationJson(
      JSON.stringify([
        { speaker: "A", text: "Hello" },
        { speaker: "B", text: "Hi" },
      ]),
      {
        ...createTestOptions(),
        idFactory: () => "id",
      }
    );

    expect(result.messages.map((message) => [message.sender, message.text])).toEqual([
      ["me", "Hello"],
      ["them", "Hi"],
    ]);
  });

  it("parses JSON objects with app-like message fields", () => {
    const result = parseConversationJson(
      JSON.stringify({
        messages: [
          { sender: "me", text: "Sent", time: "9:15", status: "delivered" },
          { sender: "them", text: "Read", status: "invalid" },
        ],
      }),
      {
        ...createTestOptions(),
        idFactory: () => "id",
      }
    );

    expect(result.messages[0]).toMatchObject({
      sender: "me",
      text: "Sent",
      time: "9:15",
      status: "delivered",
    });
    expect(result.messages[1]).toMatchObject({
      sender: "them",
      text: "Read",
      time: expect.any(String),
      status: "read",
    });
  });

  it("chooses parser from the filename", () => {
    const result = parseConversationImport(
      JSON.stringify({ messages: [{ speaker: "A", text: "From JSON" }] }),
      "conversation.json",
      {
        ...createTestOptions(),
        idFactory: () => "id",
      }
    );

    expect(result.messages[0].text).toBe("From JSON");
  });
});
