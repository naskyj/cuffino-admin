import axios from "axios";

// Cloudinary configuration (override via env vars in your project)
const CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "UNLOKR-TEST-CLOUD";
const UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "unlokr-upload";

const CLOUDINARY_CONFIG = {
  cloudName: CLOUD_NAME,
  uploadPreset: UPLOAD_PRESET,
  uploadUrl: `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
  profilePictureUploadUrl: `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "",
};

// Upload result interface
export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  size: number;
  width?: number;
  height?: number;
}

// Upload error interface
export interface UploadError {
  message: string;
  code?: string;
  details?: unknown;
}

// Upload progress callback type
export type UploadProgressCallback = (_progress: number) => void;

// Add interface for upload fields
export interface UploadFields {
  timestamp: number;
  signature: string;
  public_id: string;
  folder: string;
  context: string;
}

// Add interface for upload options
export interface UploadOptions {
  uploadUrl?: string;
  /**
   * Optional Cloudinary API key to use for this upload.
   * For signed uploads, prefer the key provided by your backend.
   */
  apiKey?: string;
  fields?: UploadFields;
  onProgress?: UploadProgressCallback;
  isProfilePicture?: boolean;
}

/**
 * Upload a single file to Cloudinary
 * @param file - The file to upload
 * @param onProgress - Optional progress callback
 * @returns Promise with upload result
 */
export const uploadFile = async (
  file: File,
  options?: UploadOptions | UploadProgressCallback,
  uploadUrl?: string // Keep for backward compatibility
): Promise<UploadResult> => {
  try {
    // Handle backward compatibility - if second param is a function, it's onProgress
    let onProgress: UploadProgressCallback | undefined;
    let config: UploadOptions | undefined;

    if (typeof options === "function") {
      onProgress = options;
      config = uploadUrl ? { uploadUrl } : undefined;
    } else {
      config = options;
      onProgress = options?.onProgress;
    }

    const formData = new FormData();
    formData.append("file", file);

    // Determine which API key to use: per-upload override or default from env
    const { apiKey: defaultApiKey } = CLOUDINARY_CONFIG;
    const effectiveApiKey = config?.apiKey || defaultApiKey;

    // Use dynamic fields if provided (for signed uploads)
    if (config?.fields) {
      // For signed uploads, add exactly the fields provided by the backend
      // (they already include the correct signature)
      Object.entries(config.fields).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      // Cloudinary still expects api_key for signed uploads, but it is NOT part of the signature
      if (effectiveApiKey) {
        formData.append("api_key", effectiveApiKey);
      }
    } else {
      // Unsigned uploads: use preset + public API key from env
      formData.append(
        "upload_preset",
        config?.isProfilePicture
          ? "unlokr-upload"
          : CLOUDINARY_CONFIG.uploadPreset
      );
      if (effectiveApiKey) {
        formData.append("api_key", effectiveApiKey);
      }
    }

    // Use dynamic upload URL or fallback to default
    const targetUrl =
      config?.uploadUrl ||
      uploadUrl ||
      (config?.isProfilePicture
        ? CLOUDINARY_CONFIG.profilePictureUploadUrl
        : CLOUDINARY_CONFIG.uploadUrl);

    const response = await axios.post<{
      secure_url: string;
      public_id: string;
      format: string;
      bytes: number;
      width?: number;
      height?: number;
    }>(targetUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });

    const { data } = response;

    return {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      size: data.bytes,
      width: data.width,
      height: data.height,
    };
  } catch (error) {
    console.error("Upload error:", error);
    const uploadError = new Error("Failed to upload file") as Error &
      UploadError;
    uploadError.code = "UPLOAD_ERROR";
    uploadError.details = error;
    throw uploadError;
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param files - Array of files to upload
 * @param onProgress - Optional progress callback for overall progress
 * @returns Promise with array of upload results
 */
export const uploadFiles = async (
  files: File[],
  onProgress?: UploadProgressCallback
): Promise<UploadResult[]> => {
  try {
    const uploadPromises = files.map((file) => uploadFile(file));
    const results = await Promise.all(uploadPromises);

    // Calculate overall progress
    if (onProgress) {
      onProgress(100);
    }

    return results;
  } catch (error) {
    console.error("Multiple upload error:", error);
    const uploadError = new Error(
      "Failed to upload one or more files"
    ) as Error & UploadError;
    uploadError.code = "MULTIPLE_UPLOAD_ERROR";
    uploadError.details = error;
    throw uploadError;
  }
};

/**
 * Upload a file and return only the URL (for backward compatibility)
 * @param file - The file to upload
 * @param options - Upload options or uploadUrl string for backward compatibility
 * @returns Promise with the uploaded file URL
 */
export const uploadFileAndGetUrl = async (
  file: File,
  options?: UploadOptions
): Promise<string> => {
  let config: UploadOptions | undefined;

  // Handle backward compatibility - if options is a string, treat it as uploadUrl
  if (typeof options === "string") {
    config = { uploadUrl: options };
  } else {
    config = options;
  }

  const result = await uploadFile(file, config);
  return result.url;
};

/**
 * Upload multiple files and return only the URLs (for backward compatibility)
 * @param files - Array of files to upload
 * @returns Promise with array of uploaded file URLs
 */
export const uploadFilesAndGetUrls = async (
  files: File[]
): Promise<string[]> => {
  const results = await uploadFiles(files);
  return results.map((result) => result.url);
};

/**
 * Validate file before upload
 * @param file - The file to validate
 * @param maxSize - Maximum file size in bytes (default: 20MB)
 * @param allowedTypes - Array of allowed MIME types
 * @returns Validation result
 */
export const validateFileForUpload = (
  file: File,
  maxSize: number = 20 * 1024 * 1024, // 20MB
  allowedTypes?: string[]
): { isValid: boolean; error?: string } => {
  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit`,
    };
  }

  // Check file type if specified
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      isValid: false,
      error: "File appears to be empty",
    };
  }

  return { isValid: true };
};

/**
 * Get file type category from file
 * @param file - The file to categorize
 * @returns File type category
 */
export const getFileTypeCategory = (file: File): string => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("application/")) return "document";
  return "other";
};

/**
 * Format file size in human readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

/**
 * Get file extension from filename or URL
 * @param filename - The filename or URL
 * @returns File extension in uppercase
 */
export const getFileExtension = (filename: string): string => {
  const name = filename.split("/").pop() || filename;
  return name.split(".").pop()?.toUpperCase() || "";
};

/**
 * Check if a URL is an image based on extension
 * @param url - The URL to check
 * @returns True if the URL appears to be an image
 */
export const isImageUrl = (url: string): boolean =>
  /\.(jpg|jpeg|png|gif|svg|webp|bmp|tiff)$/i.test(url);

/**
 * Check if a URL is a video based on extension
 * @param url - The URL to check
 * @returns True if the URL appears to be a video
 */
export const isVideoUrl = (url: string): boolean =>
  /\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i.test(url);

/**
 * Check if a URL is an audio file based on extension
 * @param url - The URL to check
 * @returns True if the URL appears to be an audio file
 */
export const isAudioUrl = (url: string): boolean =>
  /\.(mp3|wav|flac|aac|ogg|wma)$/i.test(url);

// Export the Cloudinary config for external use
export { CLOUDINARY_CONFIG };
