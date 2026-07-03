import { useCallback, useEffect, useRef, useState } from 'react';
import commentService from '../../../../services/commentService.js';

const DEBOUNCE_MS = 250;

function getMentionContext(value, cursorPos) {
  const before = value.slice(0, cursorPos);
  const match = before.match(/@([\w\s.-]*)$/);
  if (!match) return null;
  return {
    query: match[1],
    start: cursorPos - match[0].length,
  };
}

export default function MentionAutocomplete({
  workspaceId,
  projectId,
  value,
  onChange,
  mentionedUserIds = [],
  onMentionedUserIdsChange,
  disabled = false,
  placeholder = 'Write a comment… Use @ to mention',
  rows = 3,
  className = '',
  inputRef: externalInputRef,
}) {
  const internalRef = useRef(null);
  const textareaRef = externalInputRef || internalRef;
  const debounceRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [mentionStart, setMentionStart] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [searching, setSearching] = useState(false);
  const suggestionsOpenRef = useRef(false);

  const canMention = Boolean(workspaceId && projectId);

  const closeSuggestions = useCallback(() => {
    if (!suggestionsOpenRef.current) return;
    suggestionsOpenRef.current = false;
    setSuggestionsOpen(false);
    setSuggestions([]);
    setMentionStart(null);
    setActiveIndex(0);
    setSearching(false);
  }, []);

  const searchUsers = useCallback(
    (query) => {
      if (!canMention) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        setSearching(true);
        try {
          const users = await commentService.searchMentionableUsers(
            workspaceId,
            projectId,
            query.trim()
          );
          const filtered = users.filter((user) => !mentionedUserIds.includes(user.id));
          setSuggestions(filtered);
          const open = filtered.length > 0;
          suggestionsOpenRef.current = open;
          setSuggestionsOpen(open);
          setActiveIndex(0);
        } catch {
          setSuggestions([]);
          suggestionsOpenRef.current = false;
          setSuggestionsOpen(false);
        } finally {
          setSearching(false);
        }
      }, DEBOUNCE_MS);
    },
    [canMention, workspaceId, projectId, mentionedUserIds]
  );

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  const handleChange = (event) => {
    event.stopPropagation();
    const nextValue = event.target.value;
    onChange?.(nextValue);

    const cursorPos = event.target.selectionStart ?? nextValue.length;
    const context = getMentionContext(nextValue, cursorPos);
    if (context && canMention) {
      setMentionStart(context.start);
      searchUsers(context.query);
    } else {
      closeSuggestions();
    }
  };

  const insertMention = (user) => {
    const textarea = textareaRef.current;
    if (!textarea || mentionStart == null) return;

    const cursorPos = textarea.selectionStart ?? value.length;
    const before = value.slice(0, mentionStart);
    const after = value.slice(cursorPos);
    const mentionText = `@${user.name} `;
    const nextValue = `${before}${mentionText}${after}`;
    const nextIds = mentionedUserIds.includes(user.id)
      ? mentionedUserIds
      : [...mentionedUserIds, user.id];

    onChange?.(nextValue);
    onMentionedUserIdsChange?.(nextIds);
    closeSuggestions();

    requestAnimationFrame(() => {
      const pos = before.length + mentionText.length;
      textarea.focus();
      textarea.setSelectionRange(pos, pos);
    });
  };

  const handleKeyDown = (event) => {
    event.stopPropagation();

    if (event.nativeEvent?.isComposing) return;

    if (!suggestionsOpen || suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((idx) => (idx + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((idx) => (idx - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === 'Enter' && !event.shiftKey && mentionStart != null) {
      event.preventDefault();
      insertMention(suggestions[activeIndex]);
    } else if (event.key === 'Escape') {
      closeSuggestions();
    }
  };

  const stopEditorPointer = (event) => {
    event.stopPropagation();
  };

  return (
    <div className={`mention-autocomplete ${className}`.trim()}>
      <textarea
        ref={textareaRef}
        className="mention-autocomplete__input"
        value={value ?? ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={stopEditorPointer}
        onPointerDown={stopEditorPointer}
        onMouseDown={stopEditorPointer}
        onClick={stopEditorPointer}
        onFocus={stopEditorPointer}
        onBlur={() => {
          window.setTimeout(closeSuggestions, 150);
        }}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        maxLength={4000}
      />
      {suggestionsOpen && (
        <ul className="mention-autocomplete__dropdown" role="listbox">
          {searching && suggestions.length === 0 ? (
            <li className="mention-autocomplete__empty">Searching…</li>
          ) : (
            suggestions.map((user, index) => (
              <li key={user.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`mention-autocomplete__option${
                    index === activeIndex ? ' is-active' : ''
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => insertMention(user)}
                >
                  <span className="mention-autocomplete__name">{user.name}</span>
                  {user.email ? (
                    <span className="mention-autocomplete__email">{user.email}</span>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
