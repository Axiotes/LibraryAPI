import { JwtRoleGuard } from './role.guard';

describe('JwtRoleGuard', () => {
  it('should be defined', () => {
    expect(new JwtRoleGuard()).toBeDefined();
  });
});
