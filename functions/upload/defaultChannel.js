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
