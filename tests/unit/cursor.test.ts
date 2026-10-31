import { expect, test } from 'vitest';
import { cursorMode } from '../../src/scripts/cursor';

test('cursorMode', () => {
  document.body.innerHTML = '<a data-view id=v><span id=vs></span></a><button id=b></button><p id=p></p>';
  expect(cursorMode(document.getElementById('vs'))).toBe('view');
  expect(cursorMode(document.getElementById('b'))).toBe('link');
  expect(cursorMode(document.getElementById('p'))).toBe('dot');
  expect(cursorMode(null)).toBe('dot');
});
