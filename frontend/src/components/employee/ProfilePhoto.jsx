import { observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "react-toastify";
import { employeeStore } from "../../stores/employee.store";
import Loading from "../common/Loading";
import { ActionButton, CancelButton } from "../common/Button";
import AuthImage from "../common/AuthImage";

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|bmp)$/i;

const isImageFile = (file) => {
  if (!file) return false;
  const name = file.name || "";
  const type = file.type || "";
  const hasImageExt = IMAGE_EXTENSIONS.test(name);
  const hasImageMime = !type || type.startsWith("image/");
  return hasImageExt && hasImageMime;
};

const ProfilePhoto = observer(({ employee, canUpdate = false }) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const { updateProfileImage, updatingProfileImage } = employeeStore;
  const profileImage = employee?.userId?.profileImage;
  const hasPendingPhoto = Boolean(pendingFile);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const openFilePicker = () => {
    if (updatingProfileImage) return;
    fileInputRef.current?.click();
  };

  const clearPendingPhoto = () => {
    setPendingFile(null);
    setPreviewUrl(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!isImageFile(file)) {
      toast.error("Only image files are allowed!");
      return;
    }

    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpdate = async () => {
    if (!pendingFile) return;
    const success = await updateProfileImage(pendingFile);
    if (success) {
      clearPendingPhoto();
    }
  };

  const handleCancel = () => {
    if (updatingProfileImage) return;
    clearPendingPhoto();
  };

  return (
    <div className="flex flex-col items-center justify-self-center self-start w-full">
      <div className="relative w-40 sm:w-56 md:w-72 aspect-square shrink-0">
        <div className="absolute inset-0 rounded-full overflow-hidden border border-gray-600 shadow">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={employee?.userId?.name || employee?.name || "Profile"}
              className="w-full h-full object-cover"
            />
          ) : profileImage ? (
            <AuthImage
              filename={profileImage}
              alt={employee?.userId?.name || employee?.name || "Profile"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-700" />
          )}

          {canUpdate && (
            <button
              type="button"
              onClick={openFilePicker}
              disabled={updatingProfileImage}
              aria-label="Update profile photo"
              className="absolute inset-0 hidden md:flex items-center justify-center bg-black/0 hover:bg-black/45 text-white text-sm font-medium opacity-0 hover:opacity-100 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
            >
              Update photo
            </button>
          )}

          {updatingProfileImage && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loading size={28} color="#ffffff" />
            </div>
          )}
        </div>

        {canUpdate && (
          <>
            <button
              type="button"
              onClick={openFilePicker}
              disabled={updatingProfileImage}
              aria-label="Update profile photo"
              title="Update profile photo"
              className="absolute bottom-[8%] right-[8%] z-10 flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white border-4 border-gray-900 shadow-lg cursor-pointer transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Camera size={18} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </>
        )}
      </div>

      {canUpdate && hasPendingPhoto && (
        <div className="flex items-center justify-center gap-3 mt-5">
          <ActionButton
            name="Update"
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={handleUpdate}
            isLoading={updatingProfileImage}
          />
          <CancelButton
            onClick={handleCancel}
            disabled={updatingProfileImage}
          />
        </div>
      )}
    </div>
  );
});

export default ProfilePhoto;
