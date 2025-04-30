import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ファイルアップロード用のディレクトリを確認・作成
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'temp');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// multerの設定
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 一意のファイル名を生成（timestamp + オリジナルのファイル名）
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// アップロードの制限
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: function (req, file, cb: multer.FileFilterCallback) {
    // 許可するMIMEタイプ
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp'
    ];
    
    // 拡張子からMIMEタイプを推測する場合の対応
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' && file.mimetype !== 'application/pdf') {
      file.mimetype = 'application/pdf';
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext) && !file.mimetype.startsWith('image/')) {
      file.mimetype = `image/${ext.substring(1)}`;
    }
    
    if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
      return new Error('サポートされていないファイル形式です');
    }
  }
});

// ルーター作成
const router = Router();

// ファイルアップロードエンドポイント
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'ファイルがアップロードされていません' });
    }
    
    // ファイル情報を返す
    const fileUrl = `/uploads/temp/${req.file.filename}`;
    
    res.json({
      success: true,
      file: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('ファイルアップロードエラー:', error);
    res.status(500).json({ error: 'ファイルのアップロード中にエラーが発生しました' });
  }
});

// 一時ファイルのクリーンアップ用のエンドポイント（必要に応じて）
router.delete('/upload/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    
    // ファイルの存在確認
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'ファイルが削除されました' });
    } else {
      res.status(404).json({ error: 'ファイルが見つかりません' });
    }
  } catch (error) {
    console.error('ファイル削除エラー:', error);
    res.status(500).json({ error: 'ファイルの削除中にエラーが発生しました' });
  }
});

export default router;