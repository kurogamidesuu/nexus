import { apiClient } from "./client";

export interface PresignedUrlResponse {
  upload_url: string;
  public_url: string;
}

export const uploadService = {
  getPresignedUrl: async (
    fileName: string,
    contentType: string,
  ): Promise<PresignedUrlResponse> => {
    const res = await apiClient.post("/uploads/presigned-url", {
      file_name: fileName,
      content_type: contentType,
    });
    return res.data;
  },

  uploadFileToCloud: async (uploadUrl: string, file: File) => {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to upload file to storage bucket");
    }
  },
};
