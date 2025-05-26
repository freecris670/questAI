import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);

// Пример использования:
// @Get('profile')
// @UseGuards(SupabaseAuthGuard)
// getProfile(@User('id') userId: string) {
//   return this.userService.findById(userId);
// }
