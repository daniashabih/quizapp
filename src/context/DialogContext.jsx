import React, { createContext, useContext } from 'react';
import { dialog } from '../services/dialogService';
import { HangbugDialogViewport } from '../components/GlobalDialog';

const DialogContext = createContext(dialog);

/**
 * Global Dialog Provider wrapping the application and mounting the single
 * HangbugDialogViewport portal for all alert, confirmation, delete, and prompt dialogs.
 */
export const DialogProvider = ({ children }) => {
    return (
        <DialogContext.Provider value={dialog}>
            {children}
            <HangbugDialogViewport />
        </DialogContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDialog = () => useContext(DialogContext);

export default DialogContext;
