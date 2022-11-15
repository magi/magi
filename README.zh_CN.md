<!-- PROJECT SHIELDS -->
![GitHub go.mod Go version](https://img.shields.io/github/go-mod/go-version/magi/magi?style=flat-square)
[![LICENSE](https://img.shields.io/github/license/magi/magi.svg?style=flat-square)](/LICENSE)
[![Releases](https://img.shields.io/github/release/magi/magi/all.svg?style=flat-square)](https://github.com/magi/magi/releases)
![GitHub Repo stars](https://img.shields.io/github/stars/magi/magi?style=social)

[English](README.md) / 中文

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a>
    <img src="https://raw.githubusercontent.com/magi/files/main/logo.svg" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Magi</h3>

  <p align="center">
    一个基于 FluxCD 和 Kustomize 的 GitOps PaaS。
    <br />
  </p>
</div>

<!-- Introduction -->

## 简介

![Screen Shot](https://github.com/magi/files/blob/main/projects-chinese.png)

Magi 是一个基于 K8s 的 GitOps PaaS。可以通过可视化的页面对项目、应用、环境变量等进行管理，配置及发布，所有变更会记录在 git 中，并通过 FluxCD 同步到 K8s 集群。Magi 使用了 Kustomize 来管理 K8s yaml
文件，提供了丰富的扩展功能的同时，没有引入过多的概念，减少了额外的学习成本，即使脱离 Magi 使用 git 仓库中的 yaml 文件依然可以用 kubectl 等工具轻松部署你的项目。

功能：

* GitOps，所有的 yaml 文件均保存在 git 仓库中，所有的变更会使用 git 记录。
* 支持多集群，多环境，多变量管理。
* 支持配置文件版本管理。
* 支持国际化。

## 在线体验

[在线体验 Magi](https://demo.magicloud.org/)

* 用户名: demo
* 密码: Magi@1

<!-- GETTING STARTED -->

## 快速开始

前置条件: 一个 K8s 集群, 一个安装了 docker 和 docker-compose 的环境

1. 在 K8s 集群中安装 FluxCD。具体操作可以参照官方文档。

   [安装 flux](https://fluxcd.io/flux/installation/)

   > 注意:
   > * 现在只支持 GitHub 仓库。
   > * 只支持 FluxCD 的单仓库模式。
   > * 只支持 Kustomize, 所以可以不需要 [Helm Controller] 组件。
   > * path 参数必须是 clusters/<foo> , foo 需要与在 Magi 中添加集群时的 code 一致。

   安装命令与下面类似:

    ```shell
    flux bootstrap github \
      --owner=you \
      --repository=magi-flux \
      --path=clusters/cluster-01 \
      --private=true \
      --personal=true \
      --components=source-controller,kustomize-controller
    ```

2. 克隆项目

    ```shell
    git clone https://github.com/magi/magi.git
    ```

3. 跳转到 docker compose 目录

    ```shell
    cd magi/hack/docker-compose
    ```

4. 修改 Magi 的配置文件 `config/magi-config.yaml`, git 仓库需要配置为上面 FluxCD 的仓库

5. 运行 Magi

    ```shell
    docker-compose -p magi up -d
    ```

   当所有容器启动后，可以在浏览器中使用默认的 8086 端口访问。

   默认的用户名和密码为 `admin`, `admin`。

<!-- ROADMAP -->

## 路线图

- [ ] 添加对资源的权限管理
- [ ] 添加 LDAP 支持
- [ ] 添加 FluxCD 状态查看页面
- [ ] 支持 GitLab

<!-- LICENSE -->

## 版权声明

Magi 是基于 Apache License 2.0 协议， 详情请参考 [license](LICENSE)。
