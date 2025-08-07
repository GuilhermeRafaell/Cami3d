const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
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
    // Generate unique filename
    const uniqueName = `${uuidv4()}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
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
 *                 description: Arquivo de imagem (.png, .jpg, .jpeg, .svg) - máximo 5MB
 *     responses:
 *       200:
 *         description: Upload realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Upload realizado com sucesso
 *                 file:
 *                   $ref: '#/components/schemas/Upload'
 *       400:
 *         description: Erro de validação do arquivo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   enum:
 *                     - Nenhum arquivo foi enviado
 *                     - Formato não suportado. Use .png, .jpg ou .svg.
 *                     - Arquivo muito grande. Tamanho máximo é 5MB
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       413:
 *         description: Arquivo muito grande
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Arquivo muito grande. Tamanho máximo é 5MB
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// POST /api/upload/image
router.post('/image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Nenhum arquivo enviado',
        message: 'Por favor, selecione um arquivo de imagem para enviar'
      });
    }

    // Generate file info
    const fileInfo = {
      id: uuidv4(),
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user.id,
      uploadedAt: new Date().toISOString(),
      url: `/uploads/${req.file.filename}`
    };

    // Save file info to JSON (you could use a database here)
    const uploadsFile = path.join(__dirname, '../../data/uploads.json');
    let uploads = [];
    
    try {
      const data = await fs.readFile(uploadsFile, 'utf8');
      uploads = JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet, start with empty array
    }

    uploads.push(fileInfo);
    await fs.writeFile(uploadsFile, JSON.stringify(uploads, null, 2));

    res.status(201).json({
      message: 'Arquivo enviado com sucesso',
      file: {
        id: fileInfo.id,
        url: fileInfo.url,
        originalName: fileInfo.originalName,
        size: fileInfo.size,
        mimetype: fileInfo.mimetype
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
    if (error.message && error.message.includes('Formato não suportado')) {
      errorMessage = 'Formato não suportado. Use .png, .jpg ou .svg.';
    }

    res.status(500).json({
      error: 'Falha no envio',
      message: errorMessage
    });
  }
});

// GET /api/upload/user-images
router.get('/user-images', authenticateToken, async (req, res) => {
  try {
    const uploadsFile = path.join(__dirname, '../../data/uploads.json');
    
    try {
      const data = await fs.readFile(uploadsFile, 'utf8');
      const uploads = JSON.parse(data);
      
      // Filter uploads by user
      const userUploads = uploads
        .filter(upload => upload.uploadedBy === req.user.id)
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

      res.json({
        uploads: userUploads.map(upload => ({
          id: upload.id,
          url: upload.url,
          originalName: upload.originalName,
          size: upload.size,
          mimetype: upload.mimetype,
          uploadedAt: upload.uploadedAt
        }))
      });
    } catch (error) {
      // No uploads file exists yet
      res.json({ uploads: [] });
    }

  } catch (error) {
    console.error('Error fetching user images:', error);
    res.status(500).json({
      error: 'Erro do servidor',
      message: 'Erro ao buscar imagens do usuário'
    });
  }
});

// DELETE /api/upload/:imageId
router.delete('/:imageId', authenticateToken, async (req, res) => {
  try {
    const { imageId } = req.params;
    const uploadsFile = path.join(__dirname, '../../data/uploads.json');
    
    const data = await fs.readFile(uploadsFile, 'utf8');
    const uploads = JSON.parse(data);
    
    // Find the upload
    const uploadIndex = uploads.findIndex(upload => 
      upload.id === imageId && upload.uploadedBy === req.user.id
    );
    
    if (uploadIndex === -1) {
      return res.status(404).json({
        error: 'Imagem não encontrada',
        message: 'Imagem não encontrada ou você não tem permissão para excluí-la'
      });
    }

    const upload = uploads[uploadIndex];
    
    // Delete file from filesystem
    const filePath = path.join(__dirname, '../../uploads', upload.filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file from filesystem:', error);
    }

    // Remove from uploads array
    uploads.splice(uploadIndex, 1);
    await fs.writeFile(uploadsFile, JSON.stringify(uploads, null, 2));

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

// GET /api/upload/info/:imageId
router.get('/info/:imageId', authenticateToken, async (req, res) => {
  try {
    const { imageId } = req.params;
    const uploadsFile = path.join(__dirname, '../../data/uploads.json');
    
    const data = await fs.readFile(uploadsFile, 'utf8');
    const uploads = JSON.parse(data);
    
    const upload = uploads.find(upload => 
      upload.id === imageId && upload.uploadedBy === req.user.id
    );
    
    if (!upload) {
      return res.status(404).json({
        error: 'Imagem não encontrada',
        message: 'Imagem não encontrada ou você não tem permissão para acessá-la'
      });
    }

    res.json({
      image: {
        id: upload.id,
        url: upload.url,
        originalName: upload.originalName,
        size: upload.size,
        mimetype: upload.mimetype,
        uploadedAt: upload.uploadedAt
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
