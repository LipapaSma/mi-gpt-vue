# MI-GPT 部署说明

本文档提供了在不同平台部署 MI-GPT 应用的简易指南。

## 使用 Docker 部署（推荐）

Docker 提供了简单的应用容器化方案，让你可以在几乎任何支持 Docker 的平台上运行 MI-GPT。

### 前置条件

- 安装 Docker
  - Windows/Mac: 下载并安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/)
  - Linux: 按照[官方指南](https://docs.docker.com/engine/install/)安装 Docker

### 自动部署

选择适合你操作系统的部署脚本:

#### Windows 用户

1. 确保 Docker Desktop 已启动
2. 双击运行`deploy.bat`文件
3. 按照脚本提示完成部署

#### Linux/Mac 用户

1. 确保 Docker 服务已启动
2. 打开终端，进入项目根目录
3. 执行以下命令:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### 访问应用

成功部署后，在浏览器中访问:

```
http://localhost:3000
```

### 常用 Docker 命令

- 查看应用状态: `docker ps`
- 停止应用: `docker stop mi-gpt-vue`
- 启动应用: `docker start mi-gpt-vue`
- 查看日志: `docker logs mi-gpt-vue`
- 移除应用: `docker rm mi-gpt-vue`

## 常见问题

### Docker 安装问题

- Windows 用户: 确保已启用 WSL2 和 Hyper-V
- Linux 用户: 可能需要将用户添加到 docker 组: `sudo usermod -aG docker $USER`

### 端口被占用

如果 3000 端口已被其他应用占用，可以修改`deploy.sh`或`deploy.bat`中的端口映射:

```
docker run -d -p 自定义端口:3000 --name mi-gpt-vue mi-gpt-vue:latest
```

例如，使用 8080 端口: `-p 8080:3000`

### 其他问题

如遇其他问题，请参考[GitHub 项目主页](https://github.com/idootop/mi-gpt)或提交 issue。
