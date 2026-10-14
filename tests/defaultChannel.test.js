import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getDefaultUploadChannel, resolveUploadChannel } from '../functions/upload/defaultChannel.js';

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

test('上传入口未指定渠道时使用 context 已加载的 R2 渠道', () => {
    const env = { DEFAULT_UPLOAD_CHANNEL: 'cfr2' };
    const uploadConfig = { cfr2: { channels: [{ name: 'R2_env' }] } };
    assert.equal(resolveUploadChannel(null, env, uploadConfig), 'CloudflareR2');
    assert.equal(resolveUploadChannel('', env, uploadConfig), 'CloudflareR2');
});

test('显式渠道选择不会受到部署默认渠道覆盖', () => {
    const env = { DEFAULT_UPLOAD_CHANNEL: 'cfr2' };
    const uploadConfig = { cfr2: { channels: [{ name: 'R2_env' }] } };
    assert.equal(resolveUploadChannel('telegram', env, uploadConfig), 'TelegramNew');
    assert.equal(resolveUploadChannel('s3', env, uploadConfig), 'S3');
    assert.equal(resolveUploadChannel('external', env, uploadConfig), 'External');
    assert.equal(resolveUploadChannel('not-exist', env, uploadConfig), 'TelegramNew');
});
