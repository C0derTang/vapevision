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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 font-mono">{cameraId}</span>
            <span className="text-sm text-gray-400">{timestamp}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Image */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
          <img
            src={imageData}
            alt="Alert capture"
            className="w-full h-auto rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
