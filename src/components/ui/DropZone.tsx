import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  uploading: boolean;
  accept?: string;
  maxSizeMB?: number;
}

export default function DropZone({
  onFilesSelected,
  uploading,
  accept = 'image/*,.pdf,.doc,.docx,.txt',
  maxSizeMB = 5,
}: DropZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<{ name: string; type: string; url?: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingFiles = useRef<File[]>([]);

  const validateAndProcess = useCallback((files: FileList | File[]) => {
    setError(null);
    const valid: File[] = [];
    const previewItems: { name: string; type: string; url?: string }[] = [];

    for (const file of Array.from(files)) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`${file.name} exceeds ${maxSizeMB}MB limit`);
        continue;
      }
      valid.push(file);

      if (file.type.startsWith('image/')) {
        previewItems.push({ name: file.name, type: file.type, url: URL.createObjectURL(file) });
      } else {
        previewItems.push({ name: file.name, type: file.type });
      }
    }

    if (valid.length > 0) {
      setPreviews(previewItems);
      pendingFiles.current = valid;
      onFilesSelected(valid);
    }
  }, [maxSizeMB, onFilesSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      validateAndProcess(e.dataTransfer.files);
    }
  }, [validateAndProcess]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcess(e.target.files);
    }
  };

  const removePreview = (index: number) => {
    setPreviews((prev) => {
      const item = prev[index];
      if (item.url) URL.revokeObjectURL(item.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-accent bg-accent/5'
            : 'border-border-dark hover:border-accent/40'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
        <Upload size={24} className={`mx-auto mb-3 ${dragOver ? 'text-accent' : 'text-text-secondary-dark opacity-40'}`} />
        {uploading ? (
          <p className="text-sm text-accent">Uploading...</p>
        ) : (
          <>
            <p className="text-sm text-text-secondary-dark">
              Drag files here or click to upload
            </p>
            <p className="text-xs text-text-secondary-dark/60 mt-1">
              Images, PDFs, or documents. Max {maxSizeMB}MB each.
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {/* Upload previews */}
      <AnimatePresence>
        {previews.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {previews.map((preview, i) => (
              <motion.div
                key={`${preview.name}-${i}`}
                className="relative bg-surface-card-dark border border-border-dark rounded-lg p-2 flex items-center gap-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {preview.url ? (
                  <img src={preview.url} alt={preview.name} className="w-10 h-10 object-cover rounded" />
                ) : (
                  <div className="w-10 h-10 bg-white/5 rounded flex items-center justify-center">
                    {preview.type.includes('pdf') ? (
                      <FileText size={16} className="text-text-secondary-dark" />
                    ) : (
                      <Image size={16} className="text-text-secondary-dark" />
                    )}
                  </div>
                )}
                <span className="text-xs text-text-secondary-dark max-w-[120px] truncate">{preview.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); removePreview(i); }}
                  className="p-1 rounded hover:bg-white/10 text-text-secondary-dark cursor-pointer"
                >
                  <X size={12} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
