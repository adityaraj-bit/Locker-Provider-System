export default function Modal({ open, onClose, children }: any) {

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

            <div className="bg-white p-6 rounded-lg w-[400px]">
                {children}

                <button
                    onClick={onClose}
                    className="mt-4 text-sm text-gray-500"
                >
                    Close
                </button>

            </div>

        </div>
    )
}