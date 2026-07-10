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
npm run aegis -- profiles list
npm run aegis -- attacks list
npm run aegis -- init --profile baseline_web --attack-pack initial_access_hardening
npm run aegis -- scope verify
npm run aegis -- plan --mode passive --target frontend --profile baseline_web --attack-pack initial_access_hardening
npm run aegis -- run --target frontend --mode passive --dry-run
npm run aegis -- report --format html
```

公开后可直接从 GitHub 安装：

```bash
npm install -g github:LeeHueeng/privit-project
aegis help --lang zh-CN
```

npm 包名已准备为 `aegis-security-cli`，但尚未发布到 npm registry。

## 安全攻击仿真包

Aegis 参考了
[`mukul975/Anthropic-Cybersecurity-Skills`](https://github.com/mukul975/Anthropic-Cybersecurity-Skills)
中基于 ATT&CK 的组织方式，但不会执行真实攻击。它把攻击者战术转换为防御验证、
证据要求、禁止动作列表和安全计划元数据。

```bash
npm run aegis -- attacks list
npm run aegis -- attacks show credential_access_defense
npm run aegis -- plan --mode passive --target frontend --attack-pack recon_exposure_review
```

当前 pack 覆盖侦察暴露检查、初始访问加固、凭据访问防御、执行/LOLBin 检测、
持久化狩猎准备、权限提升控制、防御规避遥测、横向移动准备、收集/外传监控、
C2 检测、勒索软件韧性和欺诈/滥用监控。

设计上阻止的内容：exploit payload、phishing delivery、password guessing、
credential dumping、persistence creation、C2 traffic、data exfiltration、
destructive write activity。

## 常用命令

```bash
aegis init
aegis profiles list
aegis profiles show saas_b2b
aegis attacks list
aegis attacks show credential_access_defense
aegis scope verify
aegis catalog generate
aegis docs generate --lang all
aegis plan --mode passive --target frontend --profile saas_b2b --attack-pack initial_access_hardening
aegis run --mode passive --target frontend --dry-run
aegis report --format html
aegis report --format sarif
```

Workspace 集成说明见 [`docs/WORKSPACE_INTEGRATION.md`](./docs/WORKSPACE_INTEGRATION.md)。
