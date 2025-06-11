import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OnboardingTooltipProps {
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  targetRef: React.RefObject<HTMLElement>;
  isVisible: boolean;
}

const positionClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export function OnboardingTooltip({
  content,
  position,
  targetRef,
  isVisible,
}: OnboardingTooltipProps) {
  if (!isVisible || !targetRef.current) return null;

  const rect = targetRef.current.getBoundingClientRect();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'fixed z-50 px-4 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg',
        positionClasses[position]
      )}
      style={{
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
      }}
    >
      {content}
      <div
        className={cn(
          'absolute w-2 h-2 bg-gray-900 transform rotate-45',
          position === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
          position === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
          position === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2',
          position === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2'
        )}
      />
    </motion.div>
  );
} 