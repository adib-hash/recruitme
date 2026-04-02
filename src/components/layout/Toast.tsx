import { useEffect } from 'react';
import { CheckCircle, XCircle, X, Undo2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
  onUndo?: () => void;
}

export default function Toast({ message, type = 'success', onClose, onUndo }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, onUndo ? 5000 : 3000);
    return () => clearTimeout(timer);
  }, [onClose, onUndo]);

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed bottom-20 left-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
          type === 'success' ? 'bg-green-900/90 text-green-100' : 'bg-red-900/90 text-red-100'
        }`}
        initial={{ opacity: 0, y: 10, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: 10, x: '-50%' }}
        transition={{ duration: 0.15 }}
      >
        {type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
        <span className="text-sm">{message}</span>
        {onUndo && (
          <button
            onClick={() => { onUndo(); onClose(); }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors cursor-pointer"
          >
            <Undo2 size={12} />
            Undo
          </button>
        )}
        <button onClick={onClose} className="p-1 rounded hover:bg-white/10 cursor-pointer">
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
