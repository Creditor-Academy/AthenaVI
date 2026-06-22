export function buildScriptParagraphs(displayName) {
  const name = displayName?.trim() || 'your name';
  return [
    {
      label: 'Opening — warm & welcoming',
      direction: 'Smile, relaxed shoulders, steady eye contact.',
      text: `Hi, my name is ${name}. I'm recording this footage to create my Digital Twin on Athena VI. I'll speak naturally so the avatar can capture how I look, move, and express myself on camera.`,
    },
    {
      label: 'Professional tone',
      direction: 'Neutral expression, clear articulation, moderate pace.',
      text: `In my work, clear communication matters. I focus on delivering information in a way that feels confident, approachable, and easy to follow. I take a breath between ideas, and I make sure every word is intentional.`,
    },
    {
      label: 'Varied delivery',
      direction: 'Slight emphasis on key words; one gentle nod is fine.',
      text: `Great presentations balance structure with personality. You can be professional without sounding robotic — and friendly without losing credibility. That's the tone I want my Digital Twin to reflect.`,
    },
    {
      label: 'Expressive range',
      direction: 'Brief smile, then return to neutral; stay facing the camera.',
      text: `I'm excited about what's ahead. Whether I'm welcoming a new team, walking through a product, or sharing an update, I aim to sound human, present, and engaged. This range helps the model learn my natural expressions.`,
    },
    {
      label: 'Closing',
      direction: 'Warm smile, hold for two seconds, then stop recording.',
      text: `Thanks for listening. This recording gives Athena VI everything needed to build a high-quality Digital Twin — my voice, my face, and the way I connect with an audience. I'm ready to bring this avatar to life.`,
    },
  ];
}

export function buildFullScriptText(displayName) {
  return buildScriptParagraphs(displayName)
    .map((part) => `${part.label}\n(${part.direction})\n\n${part.text}`)
    .join('\n\n---\n\n');
}
