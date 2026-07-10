# Aegis Security CLI

[English](./README.md) · [한국어](./README.ko.md) · [日本語](./README.ja.md) · [中文](./README.zh-CN.md)

Aegis Security CLI 是 Privit Aegis 的可复用 CLI 引擎。它仅在授权范围内运行，
执行前验证 scope，从安全 catalog 中选择检查，脱敏敏感数据，并生成 JSON、
Markdown、HTML 和 SARIF 报告。

Web 控制台、GitHub Pages、AI 设置和 Privit 专用报告流程保存在 workspace
仓库中:
<https://github.com/LeeHueeng/privit-aegis-workspace>

## 仓库角色

| 仓库 | 角色 |
| --- | --- |
| `privit-project` | 可复用的 Aegis CLI 引擎 |
| `privit-aegis-workspace` | Web 控制台、报告、Pages、AIGate CI 展示仓库 |

## 快速开始

```bash
npm install
npm run catalog:generate
npm run aegis -- init
npm run aegis -- scope verify
npm run aegis -- plan --mode passive --target frontend
npm run aegis -- run --target frontend --mode passive --dry-run
npm run aegis -- report --format html
```

公开后可直接从 GitHub 安装：

```bash
npm install -g github:LeeHueeng/privit-project
aegis help --lang zh-CN
```

npm 包名已准备为 `aegis-security-cli`，但尚未发布到 npm registry。

## 常用命令

```bash
aegis init
aegis scope verify
aegis catalog generate
aegis docs generate --lang all
aegis plan --mode passive --target frontend
aegis run --mode passive --target frontend --dry-run
aegis report --format html
aegis report --format sarif
```

Workspace 集成说明见 [`docs/WORKSPACE_INTEGRATION.md`](./docs/WORKSPACE_INTEGRATION.md)。
