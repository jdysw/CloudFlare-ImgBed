import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getDefaultUploadChannel } from '../functions/upload/defaultChannel.js';

test('未设置默认渠道时沿用 Telegram', () => {
    assert.equal(getDefaultUploadChannel({}, { cfr2: { channels: [{ name: 'R2_env' }] } }), 'TelegramNew');
});

test('设置默认 R2 且渠道可用时使用 R2', () => {
    assert.equal(getDefaultUploadChannel({ DEFAULT_UPLOAD_CHANNEL: 'cfr2' }, { cfr2: { channels: [{ name: 'R2_env' }] } }), 'CloudflareR2');
});

test('R2 不可用时回退 Telegram', () => {
    assert.equal(getDefaultUploadChannel({ DEFAULT_UPLOAD_CHANNEL: 'cfr2' }, { cfr2: { channels: [] } }), 'TelegramNew');
    assert.equal(getDefaultUploadChannel({ DEFAULT_UPLOAD_CHANNEL: 'cfr2' }, {}), 'TelegramNew');
});
