const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  mimetype: {
    type: String,
    required: true,
    enum: ['image/jpeg', 'image/png', 'image/svg+xml']
  },
  size: {
    type: Number,
    required: true,
    max: 5242880 // 5MB em bytes
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  url: {
    type: String,
    required: true
  },
  description: {
    type: String,
    maxlength: 200,
    default: ''
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  },
  // Metadados da imagem
  dimensions: {
    width: { type: Number },
    height: { type: Number }
  },
  // Para imagens processadas/otimizadas
  thumbnailUrl: {
    type: String,
    default: null
  },
  processedVersions: [{
    size: String, // 'small', 'medium', 'large'
    url: String,
    dimensions: {
      width: Number,
      height: Number
    }
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Método para incrementar contador de uso
uploadSchema.methods.incrementUsage = async function() {
  this.usageCount += 1;
  return this.save();
};

// Método para gerar URL completa
uploadSchema.methods.getFullUrl = function(baseUrl = '') {
  return `${baseUrl}${this.url}`;
};

// Middleware para limpar arquivos físicos quando deletado
uploadSchema.pre('deleteOne', { document: true, query: false }, async function() {
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    // Deletar arquivo principal
    const filePath = path.join(__dirname, '../../../uploads', this.filename);
    await fs.unlink(filePath);
    
    // Deletar versões processadas se existirem
    if (this.processedVersions && this.processedVersions.length > 0) {
      for (const version of this.processedVersions) {
        const versionPath = path.join(__dirname, '../../../uploads', version.url.replace('/uploads/', ''));
        try {
          await fs.unlink(versionPath);
        } catch (error) {
          console.warn(`Could not delete processed version: ${versionPath}`, error);
          // Continue with deletion of other files even if one fails
        }
      }
    }
  } catch (error) {
    console.error('Error deleting upload files:', error);
  }
});

// Índices para performance (removendo duplicatas)
uploadSchema.index({ uploadedBy: 1, createdAt: -1 });
uploadSchema.index({ mimetype: 1 });
uploadSchema.index({ isPublic: 1, createdAt: -1 });
uploadSchema.index({ tags: 1 });

module.exports = mongoose.model('Upload', uploadSchema);
