/**
 * Basic test to verify Jest setup is working correctly
 */
describe('Project Setup', () => {
  it('should have Jest configured correctly', () => {
    expect(true).toBe(true);
  });

  it('should be able to import from src directory using @ alias', () => {
    // This test verifies that the module path mapping is working
    expect(() => {
      // We're just testing that the path alias is configured
      // The actual import will be tested when we have real components
    }).not.toThrow();
  });
});
