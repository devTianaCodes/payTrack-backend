import { createHttpError } from '../utils/httpError.js';

const requestPartByKey = {
  body: 'body',
  params: 'params',
  query: 'query',
};

export function validateRequest(schemas) {
  return (request, _response, next) => {
    for (const [key, schema] of Object.entries(schemas)) {
      const requestPart = requestPartByKey[key];
      if (!requestPart || !schema) continue;

      const result = schema.safeParse(request[requestPart]);
      if (!result.success) {
        return next(
          createHttpError(400, 'Invalid request data', {
            fieldErrors: result.error.flatten().fieldErrors,
          }),
        );
      }

      request[requestPart] = result.data;
    }

    return next();
  };
}
