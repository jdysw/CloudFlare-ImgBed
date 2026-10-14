# 图床生产部署记录（Cloudflare Pages）

> 更新：2026-10-14。仅记录部署步骤及可公开的资源名称，不保存任何密钥。

## 资源清单

| 资源 | 名称 / 绑定 | 用途 |
| --- | --- | --- |
| Pages 项目 | `cloudflare-imgbed` | 前端与 Pages Functions |
| 生产域名 | `https://cloudflare-imgbed-14k.pages.dev` | 图床入口 |
| GitHub | `jdysw/CloudFlare-ImgBed`, `main` | GitHub 自动部署 |
| D1 | `img_d1` | 文件元数据及系统配置 |
| R2 | `zhixia-imgbed-media`，绑定 `img_r2` | 图床文件存储 |
| 构建命令 | `npm install` | 与官方文档一致 |
| 构建目录 | `/frontend-dist` | 与官方文档一致 |

不要将备份桶 `hermes-memory-backup` 用作图床文件存储。

## 必须完成的认证配置

本项目将管理端与上传端改为 **未配置凭据时拒绝访问**。在 Cloudflare Pages → Settings → Variables and Secrets，分别为生产环境设置：

- `BASIC_USER`：管理员用户名（可设为 `admin`）。
- `BASIC_PASS`：管理员强密码，必须以 **Secret** 形式存储。
- `AUTH_CODE`：上传端认证码，与管理员密码不同，必须以 **Secret** 形式存储。

如需预览环境可以登录，必须在预览环境单独配置对应凭据，并配套绑定可用于预览的测试数据库，避免预览部署修改生产数据。否则让预览环境保持无凭据的拒绝访问状态。

配置后重新部署生产分支，确认：
1. `GET /api/auth/sessionCheck` 返回 `adminRequired: true`、`userRequired: true`。
2. 未登录访问 `GET /api/manage/sysConfig/upload` 返回 401。
3. 不含凭据上传返回 401，且没有创建文件记录。
4. 正确凭据的管理员登录可以创建 Session Cookie。
5. 管理员与用户验证码相互独立。

**注意**：旧版无密码初始化可直接进入管理后台，公开实例有被接管的风险。升级前如有旧会话，先清理 `manage@session@` 会话记录；不要执行破坏性清库 SQL。

## R2 绑定及渠道初始化

1. 进入 Pages 项目 `cloudflare-imgbed` → Settings → Bindings。
2. 添加 R2 Bucket Binding：变量名必须是 `img_r2`，桶名为 `zhixia-imgbed-media`。
3. **不要开放 R2 `r2.dev` 公共 URL**，图片统一通过本站 `/file/:id` 读取。
4. 绑定完成后重新部署生产环境（仅修改绑定不保证当前部署即时更新）。
5. 登录 `/dashboard` → 系统设置 → 上传设置，确认自动出现 R2 渠道 `R2_env`，并将上传默认渠道设为 Cloudflare R2。
6. 从浏览器上传小尺寸测试图片，记录生成的文件链接；检查数据库 `files` 表新增记录、R2 对象存在、公开读取可用，随后删除测试图并确认对象及元数据都被清理。

## 验证与回滚

- Pages 最近部署应显示 `deploy: success`，生产提交应等于 GitHub main。
- 确认管理端未认证请求 401，未配置认证的登录请求返回 503（而不是自动授权）。
- 凭据不可写入 GitHub 仓库、明文配置文档或 Actions 日志。
- 如果部署异常，可用 Pages 中上一版部署回滚代码；**但上一版存在无密码默认放行**，回滚前必须先设置管理员/上传凭据，避免重新暴露。
- 数据库和 R2 文件分别备份，回滚仅更换代码不删除数据。

官方参考：
- https://cfbed.sanyue.de/deployment/pages.html
- https://cfbed.sanyue.de/deployment/configuration.html
