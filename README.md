# Trade Daily

一个面向复盘场景的多市场看图工具，界面偏极简，适合在桌面端或 iPad 上沉浸式查看单个标的的 K 线和成交量。

## 项目简介

- 首页只保留当前时间、`开始复盘` 和 `市场配置`
- 点击 `开始复盘` 后，进入单标的沉浸式复盘模式
- 支持 `A股`、`美股`、`区块链`、`HyperLiquid` 四个市场
- 每次只展示一个标的，支持市场切换、标的切换、上一个/下一个循环浏览
- 后端统一聚合不同市场的数据源，并转换成统一的 K 线结构供前端展示

## 数据来源

### A股

- 主数据源：新浪公开 K 线接口
- 后备数据源：东方财富历史 K 线接口
- 当前默认标的：20 只 AI 相关沪深主板股票

### 美股

- 数据源：Yahoo Finance `v8/finance/chart`
- 当前默认标的：美股七姐妹、台积电、`CRCL`、`COIN`、`PLTR`，以及纳指、标普、道琼斯

### 区块链

- 主数据源：Binance Spot Klines
- 特殊品种：`HYPEUSDT` 使用 Binance USD-M Futures Klines
- 当前默认标的：`BTC`、`ETH`、`SOL`、`HYPE`、`SUI`、`BNB`

### HyperLiquid

- 数据源：HyperLiquid 官方 `/info` 接口的 `candleSnapshot`
- 当前默认品种：`Gold`、`Silver`、`WTI Crude`、`Brent Oil`、`Copper`、`Natural Gas`

## 数据级别

- `A股`：`1d`，默认展示最近 `360` 根 K 线
- `美股`：`1d`，默认展示最近 `360` 根 K 线
- `区块链`：`4h`，默认展示最近 `360` 根 K 线
- `HyperLiquid`：`1h`，默认展示最近 `360` 根 K 线
- 所有市场均展示 K 线和成交量

## 代理说明

- 默认代理关闭
- 默认代理地址：`127.0.0.1:13004`
- 可在页面的 `市场配置` 面板中直接开启或关闭
- 本地访问 Binance 或其他需要代理的数据源时，可统一走该代理

## 本地开发

```bash
npm install
npm run dev
```

- 前端地址：`http://localhost:5173`
- 后端地址：`http://localhost:3001`

## 常用命令

```bash
npm run dev
npm run check
npm run test
npm run verify:data
```

## 项目结构

```text
src/            前端页面、组件、状态管理
api/            Express 聚合接口与各市场 provider
shared/         前后端共享类型、市场配置、K 线常量
scripts/        真实数据拉取验证脚本
```

## 补充说明

- `npm run verify:data` 会直接通过服务层校验默认市场配置是否能拿到真实数据
- 部分新上市美股标的如果历史长度不足，实际返回的 K 线数量可能小于 `360`
- 项目当前以公开接口为主，若第三方接口策略变化，可能需要调整 provider 实现
