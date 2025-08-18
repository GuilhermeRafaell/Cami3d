// Rotas para upload e gerenciamento de arquivos
// Inclui: upload de imagens, listagem, informações, exclusão

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');
const { Upload } = require('../models');

const router = express.Router();

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueName = `${uuidv4()}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Filtro de tipos de arquivo permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato não suportado. Use .png, .jpg ou .svg.'), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB default
    files: 1 // Only 1 file per upload
  }
});

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: Fazer upload de imagem
 *     description: Faz upload de arquivo de imagem para uso em designs de camiseta
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload realizado com sucesso
 *       400:
 *         description: Erro de validação do arquivo
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       413:
 *         description: Arquivo muito grande
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Upload de nova imagem
// POST /api/upload/image
router.post('/image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Nenhum arquivo enviado',
        message: 'Por favor, selecione um arquivo de imagem para enviar'
      });
    }

    // Create upload document in MongoDB
    const uploadDoc = new Upload({
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user.id,
      url: `/uploads/${req.file.filename}`
    });

    await uploadDoc.save();

    res.status(201).json({
      message: 'Arquivo enviado com sucesso',
      file: {
        id: uploadDoc._id,
        url: uploadDoc.url,
        originalName: uploadDoc.originalName,
        size: uploadDoc.size,
        mimetype: uploadDoc.mimetype
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Delete file if upload failed
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (deleteError) {
        console.error('Error deleting file:', deleteError);
      }
    }

    // Handle specific error types
    let errorMessage = error.message || 'Erro ao enviar arquivo';
    
    // Check if it's a file format error
    if (error.message?.includes('Formato não suportado')) {
      errorMessage = 'Formato não suportado. Use .png, .jpg ou .svg.';
    }

    res.status(500).json({
      error: 'Falha no envio',
      message: errorMessage
    });
  }
});

// Listar imagens do usuário
// GET /api/upload/user-images
router.get('/user-images', authenticateToken, async (req, res) => {
  try {
    const uploads = await Upload.find({ uploadedBy: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      uploads: uploads.map(upload => ({
        id: upload._id,
        url: upload.url,
        originalName: upload.originalName,
        size: upload.size,
        mimetype: upload.mimetype,
        uploadedAt: upload.createdAt
      }))
    });

  } catch (error) {
    console.error('Error fetching user images:', error);
    res.status(500).json({
      error: 'Erro do servidor',
      message: 'Erro ao buscar imagens do usuário'
    });
  }
});

// Deletar imagem específica
// DELETE /api/upload/:imageId
router.delete('/:imageId', authenticateToken, async (req, res) => {
  try {
    const { imageId } = req.params;
    
    const upload = await Upload.findOne({ 
      _id: imageId, 
      uploadedBy: req.user.id 
    });
    
    if (!upload) {
      return res.status(404).json({
        error: 'Imagem não encontrada',
        message: 'Imagem não encontrada ou você não tem permissão para excluí-la'
      });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../../uploads', upload.filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file from filesystem:', error);
    }

    // Delete from database
    await Upload.findByIdAndDelete(imageId);

    res.json({
      message: 'Imagem excluída com sucesso'
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      error: 'Erro do servidor',
      message: 'Erro ao excluir imagem'
    });
  }
});

// Obter informações de uma imagem
// GET /api/upload/info/:imageId
router.get('/info/:imageId', authenticateToken, async (req, res) => {
  try {
    const { imageId } = req.params;
    
    const upload = await Upload.findOne({ 
      _id: imageId, 
      uploadedBy: req.user.id 
    });
    
    if (!upload) {
      return res.status(404).json({
        error: 'Imagem não encontrada',
        message: 'Imagem não encontrada ou você não tem permissão para acessá-la'
      });
    }

    res.json({
      image: {
        id: upload._id,
        url: upload.url,
        originalName: upload.originalName,
        size: upload.size,
        mimetype: upload.mimetype,
        uploadedAt: upload.createdAt
      }
    });

  } catch (error) {
    console.error('Error fetching image info:', error);
    res.status(500).json({
      error: 'Erro do servidor',
      message: 'Erro ao buscar informações da imagem'
    });
  }
});

module.exports = router;
