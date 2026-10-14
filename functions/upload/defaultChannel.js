/**
 * 当客户端未明确指定渠道时，按部署配置选择上传渠道。
 * 默认保留 Telegram 兼容行为，只有明确指定且 R2 渠道可用才优先使用 R2。
 */
export function getDefaultUploadChannel(env, uploadConfig) {
    if (env?.DEFAULT_UPLOAD_CHANNEL === 'cfr2' && uploadConfig?.cfr2?.channels?.length > 0) {
        return 'CloudflareR2';
    }
    return 'TelegramNew';
}

/**
 * 统一解析上传渠道，避免在上传处理函数中引用未定义的局部变量。
 * 显式选择优先，未知渠道兼容回退 Telegram；未指定时使用部署默认值。
 */
export function resolveUploadChannel(requestedChannel, env, uploadConfig) {
    const explicitChannels = {
        telegram: 'TelegramNew',
        cfr2: 'CloudflareR2',
        s3: 'S3',
        discord: 'Discord',
        huggingface: 'HuggingFace',
        webdav: 'WebDAV',
        external: 'External',
    };
    if (requestedChannel) {
        return explicitChannels[requestedChannel] || 'TelegramNew';
    }
    return getDefaultUploadChannel(env, uploadConfig);
}
