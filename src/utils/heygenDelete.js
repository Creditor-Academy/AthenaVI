export function isOwnedPrivateAvatar(section) {
  return section === 'private';
}

export function isDeletableClonedVoice(voice) {
  const source = String(voice?.source || voice?.raw?.source || '').toLowerCase();
  return source === 'clone';
}

export function resolvePairedVoiceId(avatarOrGroup) {
  return (
    avatarOrGroup?.defaultVoiceId ||
    avatarOrGroup?.default_voice_id ||
    avatarOrGroup?.raw?.default_voice_id ||
    avatarOrGroup?.raw?.defaultVoiceId ||
    null
  );
}

export function getAvatarDeleteMessage(avatar, { isLastLook = false } = {}) {
  if (isLastLook) {
    return 'This is the last look. Deleting it will remove the entire avatar.';
  }
  const name = avatar?.name || 'this avatar';
  return `Permanently delete ${name} and all its looks? Paired voice clones will also be removed.`;
}
