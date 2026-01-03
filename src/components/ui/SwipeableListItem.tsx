/**
 * ================================================================
 * SwipeableListItem - BIZCONTROL 360 ERP
 * ================================================================
 * Touch-enabled list item with swipe gestures.
 * Supports swipe-to-delete and swipe-to-reveal actions.
 * ================================================================
 */

"use client";

import { useState, useRef, ReactNode } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Trash2, Edit, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeAction {
    icon: ReactNode;
    label: string;
    color: string;
    onClick: () => void;
}

interface SwipeableListItemProps {
    children: ReactNode;
    /** Action revealed when swiping left */
    leftAction?: SwipeAction;
    /** Action revealed when swiping right */
    rightAction?: SwipeAction;
    /** Callback when item is deleted via swipe */
    onDelete?: () => void;
    /** Callback when item is edited via swipe */
    onEdit?: () => void;
    /** Whether swipe is enabled */
    enabled?: boolean;
    /** Additional className */
    className?: string;
}

const SWIPE_THRESHOLD = 80;
const MAX_SWIPE = 100;

export function SwipeableListItem({
    children,
    leftAction,
    rightAction,
    onDelete,
    onEdit,
    enabled = true,
    className,
}: SwipeableListItemProps) {
    const [offset, setOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Default actions if not provided
    const defaultLeftAction: SwipeAction = leftAction || {
        icon: <Edit className="w-5 h-5" />,
        label: 'Editar',
        color: 'bg-blue-500',
        onClick: onEdit || (() => { }),
    };

    const defaultRightAction: SwipeAction = rightAction || {
        icon: <Trash2 className="w-5 h-5" />,
        label: 'Eliminar',
        color: 'bg-red-500',
        onClick: onDelete || (() => { }),
    };

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        setIsDragging(false);
        const swipeX = info.offset.x;

        if (Math.abs(swipeX) > SWIPE_THRESHOLD) {
            if (swipeX > 0 && defaultLeftAction) {
                // Swiped right - trigger left action
                defaultLeftAction.onClick();
            } else if (swipeX < 0 && defaultRightAction) {
                // Swiped left - trigger right action
                defaultRightAction.onClick();
            }
        }

        setOffset(0);
    };

    if (!enabled) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div
            ref={containerRef}
            className={cn("relative overflow-hidden touch-pan-y", className)}
        >
            {/* Left action (revealed on swipe right) */}
            <div
                className={cn(
                    "absolute inset-y-0 left-0 flex items-center justify-center w-24",
                    defaultLeftAction.color,
                    "text-white"
                )}
            >
                <div className="flex flex-col items-center gap-1">
                    {defaultLeftAction.icon}
                    <span className="text-xs font-medium">{defaultLeftAction.label}</span>
                </div>
            </div>

            {/* Right action (revealed on swipe left) */}
            <div
                className={cn(
                    "absolute inset-y-0 right-0 flex items-center justify-center w-24",
                    defaultRightAction.color,
                    "text-white"
                )}
            >
                <div className="flex flex-col items-center gap-1">
                    {defaultRightAction.icon}
                    <span className="text-xs font-medium">{defaultRightAction.label}</span>
                </div>
            </div>

            {/* Swipeable content */}
            <motion.div
                drag="x"
                dragConstraints={{ left: -MAX_SWIPE, right: MAX_SWIPE }}
                dragElastic={0.1}
                onDragStart={() => setIsDragging(true)}
                onDrag={(e, info) => setOffset(info.offset.x)}
                onDragEnd={handleDragEnd}
                animate={{ x: isDragging ? offset : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={cn(
                    "relative bg-white dark:bg-slate-900",
                    "touch-pan-y cursor-grab active:cursor-grabbing"
                )}
            >
                {children}
            </motion.div>
        </div>
    );
}

/**
 * Example usage:
 * 
 * <SwipeableListItem
 *   onDelete={() => handleDelete(item.id)}
 *   onEdit={() => handleEdit(item)}
 * >
 *   <div className="p-4 flex items-center gap-3">
 *     <Avatar>{item.name[0]}</Avatar>
 *     <div>{item.name}</div>
 *   </div>
 * </SwipeableListItem>
 */
