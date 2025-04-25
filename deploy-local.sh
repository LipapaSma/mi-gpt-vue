#!/bin/bash

echo "=== MI-GPT 本地镜像部署脚本 ==="
echo "该脚本使用本地已有的Node.js镜像，避免从Docker Hub拉取"
echo ""

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "错误: 未检测到Docker安装，请先安装Docker"
    echo "安装指南: https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查Docker是否运行
if ! docker info &> /dev/null; then
    echo "错误: Docker未运行，请启动Docker服务"
    exit 1
fi

# 检查本地是否有node:18.20.4-alpine镜像
if ! docker images | grep -q "node.*18.20.4-alpine"; then
    echo "错误: 本地没有找到node:18.20.4-alpine镜像"
    echo "请先手动导入镜像或尝试其他部署方法"
    exit 1
fi

# 检查dist目录是否存在
if [ ! -d "dist" ]; then
    echo "警告: dist目录不存在，可能需要先在本地构建项目"
    echo "是否继续？(y/n)"
    read answer
    if [ "$answer" != "y" ]; then
        echo "部署已取消"
        exit 1
    fi
fi

echo "Docker已准备就绪，开始构建镜像..."

# 构建Docker镜像
docker build -t mi-gpt-vue:local -f Dockerfile.local .

# 检查构建是否成功
if [ $? -ne 0 ]; then
    echo "错误: Docker镜像构建失败"
    exit 1
fi

echo "Docker镜像构建成功！"

# 检查是否已有容器运行
CONTAINER_ID=$(docker ps -q -f name=mi-gpt-vue)
if [ ! -z "$CONTAINER_ID" ]; then
    echo "检测到已有MI-GPT容器运行，将停止并移除..."
    docker stop $CONTAINER_ID
    docker rm $CONTAINER_ID
fi

# 启动容器
echo "正在启动MI-GPT容器..."
docker run -d -p 3000:3000 --name mi-gpt-vue mi-gpt-vue:local

# 检查启动是否成功
if [ $? -ne 0 ]; then
    echo "错误: 容器启动失败"
    exit 1
fi

echo "=== 部署成功 ==="
echo "MI-GPT应用已成功部署到Docker"
echo "访问地址: http://localhost:3000"
echo ""
echo "常用命令:"
echo "  停止应用: docker stop mi-gpt-vue"
echo "  启动应用: docker start mi-gpt-vue"
echo "  查看日志: docker logs mi-gpt-vue"
echo "  移除应用: docker rm mi-gpt-vue" 