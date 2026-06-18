import { createContext, useContext } from 'react';

const PreviewModeContext = createContext({ staticEntrance: false });

export function PreviewModeProvider({ staticEntrance = false, children }) {
  return (
    <PreviewModeContext.Provider value={{ staticEntrance: !!staticEntrance }}>
      {children}
    </PreviewModeContext.Provider>
  );
}

export function usePreviewMode() {
  return useContext(PreviewModeContext);
}

export default PreviewModeContext;
