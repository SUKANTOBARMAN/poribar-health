import os
import uuid

from fastapi import HTTPException, UploadFile

from app.config import settings

ALLOWED_CONTENT_TYPES = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
}


async def validate_and_save_upload(file: UploadFile, subfolder: str) -> str:
    """
    doc Security Notes: "File upload: শুধু pdf/jpg/png, max 2MB"
    রিটার্ন করে DB-তে সেভ করার জন্য relative path।
    """
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(400, "শুধু PDF, JPG, PNG ফাইল আপলোড করা যাবে")

    content = await file.read()
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(400, f"ফাইলের সর্বোচ্চ আকার {settings.MAX_UPLOAD_MB}MB")

    ext = ALLOWED_CONTENT_TYPES[file.content_type]
    filename = f"{uuid.uuid4().hex}{ext}"
    folder = os.path.join(settings.UPLOAD_DIR, subfolder)
    os.makedirs(folder, exist_ok=True)

    full_path = os.path.join(folder, filename)
    with open(full_path, "wb") as f:
        f.write(content)

    return os.path.join(subfolder, filename)