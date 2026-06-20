import { Fragment, useState } from 'react';
import { MdExpandMore, MdExpandLess } from 'react-icons/md';
import './PropertiesAccordion.css';

/**
 * Collapsible section groups for the right properties panel.
 */
const PropertiesAccordion = ({
  sections = [],
  className = '',
  defaultExpandedIds = [],
}) => {
  const [expanded, setExpanded] = useState(() => new Set(defaultExpandedIds));

  const toggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!sections.length) return null;

  let lastGroup = null;

  return (
    <div className={`scp-accordion ${className}`.trim()}>
      {sections.map(({ id, title, icon, content, group }) => {
        const showGroupLabel = group && group !== lastGroup;
        if (group) lastGroup = group;
        const isOpen = expanded.has(id);

        return (
          <Fragment key={id}>
            {showGroupLabel ? (
              <div className="scp-accordion__group-label">{group}</div>
            ) : null}
            <div className={`scp-accordion__item ${isOpen ? 'scp-accordion__item--open' : ''}`}>
              <button
                type="button"
                className="scp-accordion__trigger"
                onClick={() => toggle(id)}
                aria-expanded={isOpen}
              >
                <span className="scp-accordion__trigger-main">
                  {icon ? <span className="scp-accordion__icon">{icon}</span> : null}
                  <span className="scp-accordion__title">{title}</span>
                </span>
                {isOpen ? (
                  <MdExpandLess size={18} className="scp-accordion__chevron" />
                ) : (
                  <MdExpandMore size={18} className="scp-accordion__chevron" />
                )}
              </button>
              {isOpen ? <div className="scp-accordion__body">{content}</div> : null}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
};

export default PropertiesAccordion;
