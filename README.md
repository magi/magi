<!-- PROJECT SHIELDS -->
![GitHub go.mod Go version](https://img.shields.io/github/go-mod/go-version/magi/magi?style=flat-square)
[![LICENSE](https://img.shields.io/github/license/magi/magi.svg?style=flat-square)](/LICENSE)
[![Releases](https://img.shields.io/github/release/magi/magi/all.svg?style=flat-square)](https://github.com/magi/magi/releases)
![GitHub Repo stars](https://img.shields.io/github/stars/magi/magi?style=social)

English / [中文](README.zh_CN.md)

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a>
    <img src="https://raw.githubusercontent.com/magi/files/main/logo.svg" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Magi</h3>

  <p align="center">
    A GitOps PaaS based on FluxCD and Kustomize.
    <br />
  </p>
</div>


<!-- Introduction -->

## Introduction

![Screen Shot](https://github.com/magi/files/blob/main/projects-english.png)

Magi is a K8s GitOps PaaS. Your projects, applications, environments, variables can be managed, configured and published through UI, and all changes will be recorded in git ,then synchronized to the
K8s cluster by FluxCD. Magi uses Kustomize to manage K8s yaml files, providing rich extensions without introducing too many concepts, reducing additional learning costs, and easily deploying your
project with tools such as kubectl even with yaml files in git repository.

Feature：

* GitOps，all yaml files will store in git repository，all change will be versioned by git.
* Multi cluster， multi environment ,multi variable support.
* Support config management.
* Internationalization support.

## Demo

[Magi Demo](https://demo.magicloud.org/)

* Username: demo
* Password: Magi@1

<!-- GETTING STARTED -->

## Getting Started

Prefix: You need to have a K8s cluster, an environment with docker & docker-compose installed.

1. Install FluxCD onto your K8s cluster. You can follow FluxCD docs to do this.

   [Install flux](https://fluxcd.io/flux/installation/)

   > Note:
   > * only support GitHub now.
   > * only support FluxCD monorepo mode.
   > * only support Kustomize, so [Helm Controller] is not necessary.
   > * path must be clusters/<foo> , foo must be cluster code when you add cluster in Magi.

   Your command may like:

    ```shell
    flux bootstrap github \
      --owner=you \
      --repository=magi-flux \
      --path=clusters/cluster-01 \
      --private=true \
      --personal=true \
      --components=source-controller,kustomize-controller
    ```
2. Clone Project

    ```shell
    git clone https://github.com/magi/magi.git
    ```

3. Go to docker compose file

    ```shell
    cd magi/hack/deploy/docker-compose
    ```

4. Change Magi config with file `config/magi-config`, git repo need to set the repository configured by FluxCD above

5. Run Magi

    ```shell
    docker-compose -p magi up -d
    ```

   When all container started, you can open Magi in browser by default port 8086.

   Default user & password are `admin`, `admin`

<!-- ROADMAP -->

## Roadmap

- [ ] Add permission control for resources
- [ ] Add LDAP support
- [ ] Add FluxCD status view
- [ ] Support GitLab

<!-- LICENSE -->

## License

Magi is licensed under the Apache License Version 2.0 , please refer to the [license](LICENSE) for details.
