import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from '../useChatStore';

describe('Saved Mockups Slice', () => {
  beforeEach(() => {
    // Reset state before each test
    useChatStore.getState().resetState();
    // Clear saved mockups manually since resetState doesn't touch them
    useChatStore.setState({ savedMockups: [] });
  });

  it('should start with an empty savedMockups array', () => {
    const { savedMockups } = useChatStore.getState();
    expect(savedMockups).toEqual([]);
  });

  it('saveMockup should create a snapshot with the correct fields', () => {
    const store = useChatStore.getState();
    store.updateContact({ name: 'Alice', status: 'Online', avatar: null });
    store.saveMockup('My Chat');

    const { savedMockups } = useChatStore.getState();
    expect(savedMockups).toHaveLength(1);

    const snap = savedMockups[0];
    expect(snap.name).toBe('My Chat');
    expect(snap.contact.name).toBe('Alice');
    expect(snap.platform).toBe('signal'); // default platform
    expect(typeof snap.id).toBe('string');
    expect(typeof snap.createdAt).toBe('number');
  });

  it('saveMockup called twice should produce two distinct entries (newest first)', () => {
    const store = useChatStore.getState();
    store.saveMockup('First');
    store.saveMockup('Second');

    const { savedMockups } = useChatStore.getState();
    expect(savedMockups).toHaveLength(2);
    // Newest is prepended
    expect(savedMockups[0].name).toBe('Second');
    expect(savedMockups[1].name).toBe('First');
  });

  it('loadMockup should restore platform and contact from snapshot', () => {
    const store = useChatStore.getState();
    // Set up initial state and save
    store.setPlatform('whatsapp');
    store.updateContact({ name: 'Bob' });
    store.saveMockup('Bob on WhatsApp');

    // Change state
    store.setPlatform('discord');
    store.updateContact({ name: 'Changed' });

    // Restore
    const savedId = useChatStore.getState().savedMockups[0].id;
    useChatStore.getState().loadMockup(savedId);

    const state = useChatStore.getState();
    expect(state.platform).toBe('whatsapp');
    expect(state.contact.name).toBe('Bob');
  });

  it('deleteMockup should remove the item from the array', () => {
    const store = useChatStore.getState();
    store.saveMockup('ToDelete');
    store.saveMockup('ToKeep');

    const idToDelete = useChatStore.getState().savedMockups.find(m => m.name === 'ToDelete')!.id;
    useChatStore.getState().deleteMockup(idToDelete);

    const { savedMockups } = useChatStore.getState();
    expect(savedMockups).toHaveLength(1);
    expect(savedMockups[0].name).toBe('ToKeep');
  });

  it('saveMockup with empty name should auto-generate a name', () => {
    useChatStore.getState().saveMockup('');
    const { savedMockups } = useChatStore.getState();
    expect(savedMockups[0].name.length).toBeGreaterThan(0);
  });
});
