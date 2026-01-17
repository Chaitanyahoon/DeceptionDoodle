import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

interface ConnectionStatusIndicatorProps {
    status: ConnectionStatus;
    retryCount?: number;
    onRetry?: () => void;
}

/**
 * Connection Status Indicator Component
 * Shows current connection state with appropriate styling and actions
 */
export const ConnectionStatusIndicator: React.FC<
    ConnectionStatusIndicatorProps
> = ({ status, retryCount = 0, onRetry }) => {
    const statusConfig = {
        connected: {
            color: 'text-green-400',
            bgColor: 'bg-green-500/20',
            icon: Wifi,
            label: 'Connected',
            dot: 'bg-green-500'
        },
        connecting: {
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/20',
            icon: Wifi,
            label: 'Connecting...',
            dot: 'bg-blue-500'
        },
        disconnected: {
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/20',
            icon: WifiOff,
            label: 'Reconnecting...',
            dot: 'bg-yellow-500'
        },
        error: {
            color: 'text-red-400',
            bgColor: 'bg-red-500/20',
            icon: AlertCircle,
            label: 'Connection Error',
            dot: 'bg-red-500'
        }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${config.bgColor} border border-opacity-30 rounded-lg px-4 py-2 flex items-center gap-2`}
        >
            <motion.div
                animate={{
                    scale: status === 'connecting' ? [1, 1.2, 1] : 1,
                    opacity: status === 'connecting' ? [1, 0.6, 1] : 1
                }}
                transition={{
                    duration: 1.5,
                    repeat: status === 'connecting' ? Infinity : 0
                }}
                className={`w-2 h-2 rounded-full ${config.dot}`}
            />
            <Icon size={16} className={config.color} />
            <span className={`text-sm font-medium ${config.color}`}>
                {config.label}
            </span>

            {status === 'error' && onRetry && (
                <button
                    onClick={onRetry}
                    className="ml-2 text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded transition-colors"
                >
                    Retry
                </button>
            )}

            {retryCount > 0 && (
                <span className="ml-2 text-xs text-gray-400">
                    (Retry {retryCount})
                </span>
            )}
        </motion.div>
    );
};
