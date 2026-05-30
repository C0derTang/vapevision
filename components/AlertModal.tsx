interface AlertModalProps {
  imageData: string;
  timestamp: string;
  cameraId: string;
  onClose: () => void;
  onConfirmVaping: () => void;
  onFalsePositive: () => void;
  verifying?: boolean;
}

export default function AlertModal({
  imageData,
  timestamp,
  cameraId,
  onClose,
  onConfirmVaping,
  onFalsePositive,
  verifying = false,
}: AlertModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0a0a0a] border border-gray-800 max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-900">
          <div className="flex items-center gap-6">
            <span className="font-mono text-xs text-blue-600 tracking-widest uppercase">{cameraId}</span>
            <span className="font-mono text-xs text-gray-400">{timestamp}</span>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-xs text-gray-300 hover:text-blue-600 uppercase tracking-widest transition-colors p-2"
          >
            Close
          </button>
        </div>

        {/* Image */}
        <div className="p-4 overflow-auto max-h-[calc(90vh-140px)]">
          <img
            src={imageData}
            alt="Alert capture"
            className="max-w-full h-auto mx-auto border border-gray-800 rounded"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 px-6 pb-6">
          <button
            onClick={onFalsePositive}
            disabled={verifying}
            className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-sm tracking-widest uppercase border border-gray-700 transition-all disabled:opacity-50"
          >
            {verifying ? "Verifying..." : "False Positive"}
          </button>
          <button
            onClick={onConfirmVaping}
            disabled={verifying}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-black font-mono text-sm tracking-widest uppercase font-bold transition-all disabled:opacity-50"
          >
            {verifying ? "Verifying..." : "Confirm Vaping"}
          </button>
        </div>
      </div>
    </div>
  );
}