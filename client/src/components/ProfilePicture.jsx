import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

const ProfilePicture = ({ userInfo, onUpload }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);

    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'image/*': [] },
        onDrop: (acceptedFiles) => {
            const file = acceptedFiles[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        },
    });

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true); 
        await onUpload(selectedFile);
        setUploading(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsModalOpen(false);
    };

    return (
        <div className="flex flex-col items-center">
            {/* Profile Picture */}
            {userInfo.profilePic ? (
                <img
                    src={userInfo.profilePic}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-gray-300"
                />
            ) : (
                <div className="bg-blue-500 text-white w-16 h-16 flex items-center justify-center rounded-full text-2xl font-bold mb-2">
                    {userInfo.username[0].toUpperCase()}
                </div>
            )}

            {/* Edit Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="mt-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-400 dark:hover:bg-gray-600"
            >
                Edit
            </button>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96 relative">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                            Update Profile Picture
                        </h2>

                        {/* Dropzone */}
                        <div
                            {...getRootProps()}
                            className="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500"
                        >
                            <input {...getInputProps()} />
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-24 h-24 mx-auto rounded-full object-cover mb-2"
                                />
                            ) : (
                                <p className="text-gray-500">Drag & drop an image here, or click to select</p>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedFile(null);
                                    setPreviewUrl(null);
                                }}
                                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePicture;