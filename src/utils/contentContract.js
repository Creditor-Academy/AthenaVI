/**
 * Derives a content contract from a layout schema and normalizes AI content to fit it.
 */

function countSlotPattern(slots, regex) {
  const ids = slots.map((s) => String(s.id || '').toUpperCase());
  let maxIndex = 0;
  for (const id of ids) {
    const match = id.match(regex);
    if (match && match[1]) {
      const idx = parseInt(match[1], 10);
      if (idx > maxIndex) {
        maxIndex = idx;
      }
    }
  }
  return maxIndex;
}

export function deriveContentContract(schema) {
  const slots = Array.isArray(schema?.slots) ? schema.slots : [];
  
  return {
    columns: countSlotPattern(slots, /^(?:CARD|COL|ROW|FEATURE)_(\d+)_/i),
    stats: countSlotPattern(slots, /^STAT_(\d+)_/i),
    members: countSlotPattern(slots, /^MEMBER_(\d+)_/i),
    timeline: countSlotPattern(slots, /^MILESTONE_(\d+)_/i),
    steps: countSlotPattern(slots, /^STEP_(\d+)_/i),
    quadrants: countSlotPattern(slots, /^Q(\d+)_/i),
    funnel: countSlotPattern(slots, /^FUNNEL_(\d+)_/i),
    bullets: countSlotPattern(slots, /^BULLET_(\d+)/i),
    quotes: countSlotPattern(slots, /^QUOTE_(\d+)/i),
    items: countSlotPattern(slots, /^ITEM_(\d+)/i),
    images: countSlotPattern(slots, /^IMAGE_(\d+)/i),
  };
}

function truncateWords(text, maxWords) {
  if (!text || typeof text !== 'string') return text;
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

function truncateChars(text, maxChars) {
  if (!text || typeof text !== 'string') return text;
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars - 3) + '...';
}

export function normalizeContentForLayout(content, schema) {
  if (!content || typeof content !== 'object') return {};
  
  const contract = deriveContentContract(schema);
  const normalized = JSON.parse(JSON.stringify(content));

  // Truncate global text fields
  if (normalized.title) normalized.title = truncateWords(normalized.title, 15);
  if (normalized.subtitle) normalized.subtitle = truncateWords(normalized.subtitle, 25);
  if (normalized.body) normalized.body = truncateWords(normalized.body, 120);

  // Normalize arrays to fit contract limits
  if (Array.isArray(normalized.columns) && contract.columns > 0) {
    normalized.columns = normalized.columns.slice(0, contract.columns);
    normalized.columns.forEach(col => {
      if (col.title) col.title = truncateWords(col.title, 10);
      if (col.body) col.body = truncateWords(col.body, 30);
    });
  }

  if (Array.isArray(normalized.stats) && contract.stats > 0) {
    normalized.stats = normalized.stats.slice(0, contract.stats);
    normalized.stats.forEach(stat => {
      if (stat.value) stat.value = truncateChars(stat.value, 15);
      if (stat.label) stat.label = truncateWords(stat.label, 8);
    });
  }

  const membersArray = normalized.members || normalized.team || normalized.people;
  if (Array.isArray(membersArray) && contract.members > 0) {
    const limitedMembers = membersArray.slice(0, contract.members);
    limitedMembers.forEach(member => {
      if (typeof member === 'object') {
        if (member.name) member.name = truncateWords(member.name, 5);
        if (member.role) member.role = truncateWords(member.role, 8);
        if (member.bio) member.bio = truncateWords(member.bio, 25);
      }
    });
    normalized.members = limitedMembers;
  }

  const timelineArray = normalized.timeline || normalized.milestones || normalized.events;
  if (Array.isArray(timelineArray) && contract.timeline > 0) {
    const limitedTimeline = timelineArray.slice(0, contract.timeline);
    limitedTimeline.forEach(item => {
      if (typeof item === 'object') {
        if (item.label) item.label = truncateWords(item.label, 8);
        if (item.detail) item.detail = truncateWords(item.detail, 25);
      }
    });
    normalized.timeline = limitedTimeline;
  }

  const diagramCells = normalized.diagram?.cells || normalized.cells || normalized.steps || normalized.quadrants || normalized.funnel;
  if (Array.isArray(diagramCells)) {
    let limit = Math.max(contract.steps, contract.quadrants, contract.funnel);
    if (limit > 0) {
      const limitedCells = diagramCells.slice(0, limit);
      limitedCells.forEach(cell => {
        if (typeof cell === 'object') {
          if (cell.title) cell.title = truncateWords(cell.title, 8);
          if (cell.body) cell.body = truncateWords(cell.body, 25);
        }
      });
      if (contract.steps > 0) normalized.steps = limitedCells;
      if (contract.quadrants > 0) normalized.quadrants = limitedCells;
      if (contract.funnel > 0) normalized.funnel = limitedCells;
    }
  }

  if (Array.isArray(normalized.bullets) && contract.bullets > 0) {
    normalized.bullets = normalized.bullets.slice(0, contract.bullets);
  }

  const items = normalized.items;
  if (Array.isArray(items) && contract.items > 0) {
    normalized.items = items.slice(0, contract.items);
  }

  const quotesList = normalized.quotes || normalized.testimonials;
  if (Array.isArray(quotesList) && contract.quotes > 0) {
    const limitedQuotes = quotesList.slice(0, contract.quotes);
    limitedQuotes.forEach(q => {
      if (typeof q === 'object') {
        if (q.text) q.text = truncateWords(q.text, 40);
      }
    });
    normalized.quotes = limitedQuotes;
  }

  return normalized;
}

export function validateContentForLayout(content, schema) {
  // Can be expanded to return specific validation errors
  return { valid: true, errors: [] };
}

export function repairContentForLayout(content, schema) {
  return normalizeContentForLayout(content, schema);
}
