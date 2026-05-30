interface AlertModalProps {
  imageData: string;
  timestamp: string;
  cameraId: string;
  onClose: () => void;
}

export default function AlertModal({
  imageData,
  timestamp,
  cameraId,
  onClose,
}: AlertModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0a0a0a] border border-gray-800 max-w-4xl w-full mx-4 max-h-[90vh]overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-900">
          <div className="flex items-center gap-6">
            <span className="font-mono text-xs text-blue-600 tracking-widest uppercase">{cameraId}</span>
            <span className="font-mono text-xs text-gray-600">{timestamp}</span>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-xs text-gray-500 hover:text-blue-600 uppercase tracking-widest transition-colors p-2"
          >
            Close
          </button>
        </div>

        {/* Image */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
          <img
            src={imageData}
            alt="Alert capture"
            className="w-full h-auto border border-gray-800"
          />
        </div>
      </div>
    </div>
  );
}