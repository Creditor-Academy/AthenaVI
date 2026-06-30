/**
 * EditorToast — thin wrapper around the shared VS Code-style Toast.
 * Accepts the same { message, type } prop the Editor already passes.
 */
import { sanitizeUserFacingMessage } from '../../../../utils/userFacingMessage';
import Toast from '../../../ui/Toast/Toast';

const EditorToast = ({ toast, onDismiss }) => {
  const normalized = toast?.message
    ? { ...toast, message: sanitizeUserFacingMessage(toast.message) }
    : null;

  return <Toast toast={normalized} onDismiss={onDismiss} />;
};

export default EditorToast;
