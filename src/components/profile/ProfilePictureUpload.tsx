import React, { useState, useRef } from 'react';
import { Camera, Upload, User, X, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

const ProfilePictureUpload: React.FC = () => {
  const { user, updateUserProfile, uploadProfilePicture } = useApp();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !previewUrl) return;

    setIsUploading(true);
    setError(null);

    try {
      // Upload to Supabase storage
      const publicUrl = await uploadProfilePicture(file);
      
      // Update user profile with the public URL
      await updateUserProfile({ avatarUrl: publicUrl });
      
      setShowUploadModal(false);
      setPreviewUrl(null);
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      setError(error.message || 'Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setIsUploading(true);
      await updateUserProfile({ avatarUrl: undefined });
    } catch (error: any) {
      console.error('Error removing profile picture:', error);
      setError(error.message || 'Failed to remove profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const closeModal = () => {
    setShowUploadModal(false);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="flex items-center space-x-4">
        <div className="relative">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-xl border-4 border-white shadow-lg">
              {user?.name.charAt(0)}
            </div>
          )}
          
          <button
            onClick={() => setShowUploadModal(true)}
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </button>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-neutral-800">{user?.name}</h3>
          <p className="text-neutral-600">{user?.email}</p>
          <Button
            variant="text"
            size="sm"
            onClick={() => setShowUploadModal(true)}
            disabled={isUploading}
            className="mt-1 p-0"
          >
            Change Photo
          </Button>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Update Profile Picture</h3>
              <button
                onClick={closeModal}
                disabled={isUploading}
                className="text-neutral-500 hover:text-neutral-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Current/Preview Image */}
              <div className="flex justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-32 w-32 rounded-full object-cover border-4 border-neutral-200"
                  />
                ) : user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-32 w-32 rounded-full object-cover border-4 border-neutral-200"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-2xl border-4 border-neutral-200">
                    {user?.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={triggerFileInput}
                  variant="outline"
                  className="w-full"
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose New Photo
                </Button>

                {previewUrl && (
                  <Button
                    onClick={handleUpload}
                    isLoading={isUploading}
                    className="w-full"
                  >
                    Upload Photo
                  </Button>
                )}

                {user?.avatarUrl && !previewUrl && (
                  <Button
                    onClick={handleRemovePhoto}
                    variant="outline"
                    className="w-full text-error-600 border-error-300 hover:bg-error-50"
                    disabled={isUploading}
                  >
                    Remove Current Photo
                  </Button>
                )}
              </div>

              <p className="text-xs text-neutral-500 text-center">
                Supported formats: JPG, PNG, GIF. Max size: 5MB
              </p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default ProfilePictureUpload;