import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    // determine the context type
    const type = context.getType();

    let request;
    if (type === 'http') {
      const httpContext = context.switchToHttp();
      request = httpContext.getRequest();
    }

    const user = request?.user;

    return data ? user?.[data as string] : user;
  },
);
