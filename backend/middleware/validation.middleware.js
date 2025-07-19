import { validateRequest } from '../utils/zod.validation.js';

// Re-export validation middleware for easier imports
export { validateRequest };

// Additional validation helpers
export const validateQueryParams = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          type: 'error',
          error: 'Invalid query parameters',
          details: errors,
        });
      }

      req.validatedQuery = result.data;
      next();
    } catch (error) {
      console.error('Query validation error:', error);
      return res.status(500).json({
        type: 'error',
        error: 'Internal validation error',
      });
    }
  };
};

// Error handling middleware for validation errors
export const handleValidationErrors = (error, req, res, next) => {
  if (error.name === 'ZodError') {
    const errors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return res.status(400).json({
      type: 'error',
      error: 'Validation failed',
      details: errors,
    });
  }

  next(error);
};
