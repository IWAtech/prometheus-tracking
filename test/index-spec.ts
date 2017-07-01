import index = require('../src/index');

describe('index', () => {
  it('should provide Tracker', () => {
    expect(index.Tracker).toBeDefined();
  });
});
