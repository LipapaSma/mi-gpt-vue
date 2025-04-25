# MI-GPT 部署方案总结

本文档简要总结了 MI-GPT 前端 Vue 应用的部署方案，适用于各类用户。

## 方案概览

1. **Docker 容器化部署** - 推荐给大多数用户的最简便部署方式
2. **开发者自定义部署** - 适合有编程经验的用户进行高级定制

## 文件说明

| 文件名          | 用途                                           |
| --------------- | ---------------------------------------------- |
| `install.sh`    | Linux/Mac 用户一键安装 Docker 并部署应用的脚本 |
| `install.bat`   | Windows 用户一键安装 Docker 并部署应用的脚本   |
| `deploy.sh`     | Linux/Mac 用户部署 Docker 容器的脚本           |
| `deploy.bat`    | Windows 用户部署 Docker 容器的脚本             |
| `DEPLOYMENT.md` | 开发者部署说明文档                             |

## 使用方法

### 对于无代码基础用户

#### Docker 部署（推荐）

1. 安装 Docker：

   - Windows/Mac: 下载安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/)
   - Linux: 使用`install.sh`脚本自动安装

2. 一键部署:

   - Linux/Mac: `./install.sh`
   - Windows: 双击运行`install.bat`

3. 访问应用: 浏览器打开`http://localhost:3000`

### 对于开发者

详细参考`DEPLOYMENT.md`文档获取更多高级配置选项和定制化部署信息。

## 故障排除

如遇部署问题，请按以下步骤排查:

1. 确认 Docker 已正确安装并运行
2. 检查端口 3000 是否被占用
3. 查看 Docker 日志: `docker logs mi-gpt-vue`
4. 参考 GitHub 项目 issues 或提交新 issue

## 联系方式

如有任何问题，欢迎在 GitHub 项目中提交 issue 或讨论。
