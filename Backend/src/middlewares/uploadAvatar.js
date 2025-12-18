import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads", "avatars");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); 
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${req.user.id}-${unique}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Arquivo precisa ser uma imagem."));
  }
  cb(null, true);
}

export const uploadAvatar = multer({ storage, fileFilter });
