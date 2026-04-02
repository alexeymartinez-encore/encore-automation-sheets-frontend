import { useCallback, useRef, useState } from "react";

function createInitialDialog() {
  return {
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    tone: "default",
  };
}

export default function useActionConfirmation() {
  const [dialog, setDialog] = useState(createInitialDialog);
  const resolverRef = useRef(null);

  const requestConfirmation = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({
        isOpen: true,
        title: options.title || "Are you sure?",
        message: options.message || "Please confirm this action.",
        confirmLabel: options.confirmLabel || "Confirm",
        cancelLabel: options.cancelLabel || "Cancel",
        tone: options.tone || "default",
      });
    });
  }, []);

  const closeDialog = useCallback((didConfirm) => {
    if (resolverRef.current) {
      resolverRef.current(didConfirm);
      resolverRef.current = null;
    }
    setDialog(createInitialDialog());
  }, []);

  const confirm = useCallback(() => {
    closeDialog(true);
  }, [closeDialog]);

  const cancel = useCallback(() => {
    closeDialog(false);
  }, [closeDialog]);

  return {
    confirmationDialog: dialog,
    requestConfirmation,
    confirmConfirmation: confirm,
    cancelConfirmation: cancel,
  };
}
