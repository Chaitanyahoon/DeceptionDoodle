import { useContext } from 'react';
import { ToastContext } from '../components/ToastContext';

/**
 * Hook to use toast notifications
 * @throws Error if used outside of ToastProvider
 */
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};
