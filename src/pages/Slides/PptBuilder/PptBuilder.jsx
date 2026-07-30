import React, { useState } from 'react';
import TemplateSelector from './components/TemplateSelector';
import AIPptEditor from '../AIPptComponents/AIPptEditor';
import './PptBuilder.css';

export default function PptBuilder({ onBack }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  if (!selectedTemplate) {
    return <TemplateSelector onSelect={setSelectedTemplate} onBack={onBack} />;
  }

  // Create a default outline with one blank slide to start
  const defaultOutline = [
    {
      id: 'slide-1',
      title: 'Double click to edit title',
      description: 'Double click to add content.'
    }
  ];

  // Map the selected template to the config format AIPptEditor expects
  const config = {
    theme: selectedTemplate.id === 'blank' ? 'petrol' : selectedTemplate.id, // fallback to petrol if blank for now
    title: selectedTemplate.name === 'Blank Presentation' ? 'Untitled Presentation' : `${selectedTemplate.name} Deck`
  };

  return (
    <AIPptEditor 
      outline={defaultOutline}
      config={config} 
      onBack={() => setSelectedTemplate(null)} 
    />
  );
}
