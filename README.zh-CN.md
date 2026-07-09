# Aegis Security CLI

[English](./README.md) · [한국어](./README.ko.md) · [日本語](./README.ja.md) · [中文](./README.zh-CN.md)

Aegis Security CLI 是一个仅在授权范围内运行的非破坏性安全验证 CLI。它会在
执行前验证 scope，从安全 catalog 中选择检查，脱敏敏感数据，并生成 JSON、
Markdown、HTML 和 SARIF 报告。

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
