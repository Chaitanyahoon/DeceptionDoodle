import React, { useState, useCallback, createContext } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
    toasts: Toast[];
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast Provider Component - Manages toast notifications globally
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
    children
}) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback(
        (message: string, type: ToastType = 'info', duration: number = 3000) => {
            const id = `toast-${Date.now()}-${Math.random()}`;
            const toast: Toast = { id, message, type, duration };

            setToasts(prev => [...prev, toast]);

            if (duration > 0) {
                setTimeout(() => {
                    removeToast(id);
                }, duration);
            }
        },
        [removeToast]
    );

    return (
        <ToastContext.Provider value={{ showToast, removeToast, toasts }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

/**
 * Toast Container Component
 * @internal
 */
const ToastContainer: React.FC<{
    toasts: Toast[];
    onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
            <AnimatePresence>
                {toasts.map(toast => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onRemove={onRemove}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

/**
 * Individual Toast Item
 * @internal
 */
const ToastItem: React.FC<{
    toast: Toast;
    onRemove: (id: string) => void;
}> = ({ toast, onRemove }) => {
    const bgColor = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600',
        warning: 'bg-yellow-600'
    }[toast.type];

    const Icon = {
        success: CheckCircle,
        error: AlertCircle,
        info: Info,
        warning: AlertTriangle
    }[toast.type];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, x: 100 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 100 }}
            className={`${bgColor} text-white rounded-lg p-4 shadow-lg flex items-start gap-3 pointer-events-auto`}
        >
            <Icon size={20} className="flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                className="flex-shrink-0 hover:opacity-75 transition-opacity"
            >
                <X size={18} />
            </button>
        </motion.div>
    );
};
