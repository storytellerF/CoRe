# CoRe

## 介绍

全称为`code reference`，中文名的话就叫`核`

基于SpringBoot，React 构建

可以添加代码片段，设置标题，然后通过lucene 搜索，方便代码的取用

内容支持markdown 格式（通过[Marked](https://github.com/chjj/marked) 渲染）

* 支持数学公式（通过katex 渲染）
* 支持mermaid

效果

![mobile](mobile_demo.png)

## 使用

1. 创建根证书

```shell
sh scripts/generate_root_ca.sh
```

根证书会保存到 `~/ca`

2. 创建服务器证书

```shell
sh scripts/generate_ca.sh
```

服务器证书会保存到ssl 目录中

3. 使用docker-compose 部署

```shell
docker compose up -d
#or
docker compose up -d --build
```

## 开发

开发环境不需要caddy，可以直接在本地运行

```shell
sh scripts/start-dev.sh
```

会同时打开服务端和客户端。

> 推荐使用 dev container 开发