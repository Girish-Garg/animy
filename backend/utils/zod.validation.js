import { z } from 'zod';

// Common validation schemas
const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID');

// Video generation validation
export const generateVideoSchema = z.object({
  body: z.object({
    prompt: z.string()
      .min(1, 'Prompt is required')
      .max(1000, 'Prompt must be less than 1000 characters')
      .trim(),
  }),
  params: z.object({
    chatId: mongoIdSchema,
  }),
});

export const getVideoStatusSchema = z.object({
  params: z.object({
    chatId: mongoIdSchema,
    promptId: mongoIdSchema.optional(),
  }),
});

// Chat validation
export const createChatSchema = z.object({
  body: z.object({
    title: z.string()
      .min(1, 'Title is required')
      .max(100, 'Title must be less than 100 characters')
      .trim()
      .optional(),
  }).optional(),
});

export const updateChatTitleSchema = z.object({
  body: z.object({
    title: z.string()
      .min(1, 'Title is required')
      .max(100, 'Title must be less than 100 characters')
      .trim(),
  }),
  params: z.object({
    chatId: mongoIdSchema,
  }),
});

export const chatParamsSchema = z.object({
  params: z.object({
    chatId: mongoIdSchema,
  }),
});

// Album validation
export const createAlbumSchema = z.object({
  body: z.object({
    albumName: z.string()
      .min(1, 'Album name is required')
      .max(100, 'Album name must be less than 100 characters')
      .trim()
  }),
});

export const addToAlbumSchema = z.object({
  body: z.object({
    video: z.object({
      videoPath: z.string().url('Invalid video URL'),
      thumbnailPath: z.string().url('Invalid thumbnail URL'),
      name: z.string()
        .min(1, 'Video name is required')
        .max(100, 'Video name must be less than 100 characters')
        .trim()
        .optional(),
    }),
    chatId: mongoIdSchema,
    name: z.string()
      .min(1, 'Name is required')
      .max(100, 'Name must be less than 100 characters')
      .trim()
      .optional(),
  }),
  params: z.object({
    albumId: mongoIdSchema,
  }),
});

export const updateAlbumNameSchema = z.object({
  body: z.object({
    newAlbumName: z.string()
      .min(1, 'Album name is required')
      .max(100, 'Album name must be less than 100 characters')
      .trim(),
  }),
  params: z.object({
    albumId: mongoIdSchema,
  }),
});

export const updateVideoNameSchema = z.object({
  body: z.object({
    newVideoName: z.string()
      .min(1, 'Video name is required')
      .max(100, 'Video name must be less than 100 characters')
      .trim(),
  }),
  params: z.object({
    albumId: mongoIdSchema,
    videoId: mongoIdSchema,
  }),
});

export const albumParamsSchema = z.object({
  params: z.object({
    albumId: mongoIdSchema,
  }),
});

export const albumVideoParamsSchema = z.object({
  params: z.object({
    albumId: mongoIdSchema,
    videoId: mongoIdSchema,
  }),
});

// Validation middleware
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          type: 'error',
          error: 'Validation failed',
          details: errors,
        });
      }

      // Attach validated data to request
      req.validatedData = result.data;
      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        type: 'error',
        error: 'Internal validation error',
      });
    }
  };
};

// Helper function to validate MongoDB ObjectId
export const isValidObjectId = (id) => {
  return mongoIdSchema.safeParse(id).success;
};
