const mongoose = require('mongoose');

const tshirtConfigSchema = new mongoose.Schema({
  color: {
    type: String,
    required: true,
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color must be a valid hex code']
  },
  logo: {
    type: String,
    default: null
  },
  logoPosition: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  logoScale: {
    type: Number,
    default: 1,
    min: 0.1,
    max: 3.0
  },
  text: {
    type: String,
    default: '',
    maxlength: 50
  },
  textPosition: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: -0.3 }
  },
  textColor: {
    type: String,
    default: '#000000',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Text color must be a valid hex code']
  },
  textSize: {
    type: Number,
    default: 0.1,
    min: 0.05,
    max: 0.5
  },
  style: {
    type: String,
    required: true,
    enum: ['crew-neck', 'v-neck', 'tank-top', 'long-sleeve']
  },
  modelType: {
    type: String,
    enum: ['procedural', 'external'],
    default: 'procedural'
  },
  externalModel: {
    type: String,
    default: null
  },
  renderQuality: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
});

const tshirtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  config: {
    type: tshirtConfigSchema,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  thumbnail: {
    type: String,
    default: null
  },
  category: {
    type: String,
    enum: ['casual', 'sports', 'formal', 'artistic', 'branded', 'custom'],
    default: 'custom'
  }
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

// Validação customizada para garantir que pelo menos um elemento existe
tshirtSchema.pre('save', function(next) {
  const hasText = this.config.text && this.config.text.trim().length > 0;
  const hasLogo = this.config.logo && this.config.logo.trim().length > 0;
  
  if (!hasText && !hasLogo) {
    const error = new Error('T-shirt must have at least one element (text or logo)');
    error.name = 'ValidationError';
    return next(error);
  }
  
  next();
});

// Método para incrementar visualizações
tshirtSchema.methods.incrementViews = async function() {
  this.views += 1;
  return this.save();
};

// Método para alternar visibilidade pública
tshirtSchema.methods.togglePublic = async function() {
  this.isPublic = !this.isPublic;
  return this.save();
};

// Índices para performance
tshirtSchema.index({ userId: 1, createdAt: -1 });
tshirtSchema.index({ isPublic: 1, createdAt: -1 });
tshirtSchema.index({ category: 1 });
tshirtSchema.index({ tags: 1 });
tshirtSchema.index({ 'config.style': 1 });

module.exports = mongoose.model('Tshirt', tshirtSchema);
