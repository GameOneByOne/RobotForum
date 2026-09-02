import { NextResponse } from "next/server";

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: {
    message?: string;
  };
};

const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const cloudinaryUploadPreset =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

function isImageFile(file: File) {
  return (
    file.type.startsWith("image/") ||
    /\.(apng|avif|bmp|gif|heic|heif|ico|jpe?g|png|svg|tiff?|webp)$/i.test(
      file.name,
    )
  );
}

function optimizeCloudinaryImageUrl(url: string) {
  return url.replace(
    "/image/upload/",
    "/image/upload/f_auto,q_auto,w_1600,c_limit/",
  );
}

export async function POST(request: Request) {
  if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
    return NextResponse.json({ error: "Cloudinary 图床未配置" }, { status: 503 });
  }

  try {
    const requestFormData = await request.formData();
    const file = requestFormData.get("file");

    if (!(file instanceof File) || !isImageFile(file)) {
      return NextResponse.json({ error: "请选择有效图片文件" }, { status: 400 });
    }

    const uploadFormData = new FormData();
    uploadFormData.append("file", file, file.name);
    uploadFormData.append("upload_preset", cloudinaryUploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
      {
        method: "POST",
        body: uploadFormData,
      },
    );
    const result = (await response.json()) as CloudinaryUploadResponse;

    if (!response.ok || !result.secure_url) {
      return NextResponse.json(
        { error: result.error?.message || "图片上传失败" },
        { status: response.status || 502 },
      );
    }

    return NextResponse.json({ url: optimizeCloudinaryImageUrl(result.secure_url) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "图片上传失败" },
      { status: 502 },
    );
  }
}
