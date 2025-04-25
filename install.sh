#!/bin/bash

echo "==============================================="
echo "MI-GPT 一键安装脚本"
echo "该脚本将自动安装所需依赖并部署MI-GPT应用"
echo "==============================================="
echo ""

# 检测操作系统
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    *)          MACHINE="UNKNOWN"
esac

echo "检测到操作系统: $MACHINE"
echo ""

# 检测是否已安装Docker
if ! command -v docker &> /dev/null; then
    echo "未检测到Docker，正在尝试安装..."
    
    # 在不同系统上安装Docker
    if [ "$MACHINE" = "Linux" ]; then
        echo "在Linux上安装Docker..."
        
        # 检测发行版
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            DISTRO=$ID
        fi
        
        case $DISTRO in
            ubuntu|debian)
                # 移除旧版本
                sudo apt-get remove -y docker docker-engine docker.io containerd runc || true
                
                # 安装依赖
                sudo apt-get update
                sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
                
                # 添加Docker官方GPG密钥
                curl -fsSL https://download.docker.com/linux/$DISTRO/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
                
                # 设置稳定版仓库
                echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/$DISTRO $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
                
                # 安装Docker引擎
                sudo apt-get update
                sudo apt-get install -y docker-ce docker-ce-cli containerd.io
                
                # 添加当前用户到docker组
                sudo usermod -aG docker $USER
                echo "请注意: 您需要重新登录以使docker组生效"
                ;;
                
            centos|fedora|rhel)
                # 移除旧版本
                sudo yum remove -y docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine || true
                
                # 安装依赖
                sudo yum install -y yum-utils
                
                # 添加Docker仓库
                sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
                
                # 安装Docker引擎
                sudo yum install -y docker-ce docker-ce-cli containerd.io
                
                # 启动Docker
                sudo systemctl start docker
                sudo systemctl enable docker
                
                # 添加当前用户到docker组
                sudo usermod -aG docker $USER
                echo "请注意: 您需要重新登录以使docker组生效"
                ;;
                
            *)
                echo "不支持的Linux发行版: $DISTRO"
                echo "请手动安装Docker: https://docs.docker.com/engine/install/"
                exit 1
                ;;
        esac
        
    elif [ "$MACHINE" = "Mac" ]; then
        echo "在Mac上安装Docker..."
        echo "请手动从以下链接下载并安装Docker Desktop:"
        echo "https://www.docker.com/products/docker-desktop/"
        echo "安装完成后，请重新运行此脚本"
        exit 1
    else
        echo "不支持的操作系统"
        echo "请手动安装Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    echo "Docker安装完成!"
else
    echo "Docker已安装，跳过安装步骤"
fi

# 检查Docker是否运行
if ! docker info &> /dev/null; then
    echo "Docker服务未运行，正在尝试启动..."
    
    if [ "$MACHINE" = "Linux" ]; then
        sudo systemctl start docker
    else
        echo "请手动启动Docker，然后重新运行此脚本"
        exit 1
    fi
fi

echo "Docker服务已运行!"
echo ""

# 构建并运行Docker镜像
echo "开始构建MI-GPT Docker镜像..."
docker build -t mi-gpt-vue:latest .

# 检查构建是否成功
if [ $? -ne 0 ]; then
    echo "Docker镜像构建失败，请检查错误信息"
    exit 1
fi

echo "Docker镜像构建成功!"
echo ""

# 检查是否有已存在的容器
CONTAINER_ID=$(docker ps -q -f name=mi-gpt-vue)
if [ ! -z "$CONTAINER_ID" ]; then
    echo "检测到已有MI-GPT容器运行，将停止并移除..."
    docker stop $CONTAINER_ID
    docker rm $CONTAINER_ID
fi

# 运行容器
echo "正在启动MI-GPT容器..."
docker run -d -p 3000:3000 --name mi-gpt-vue mi-gpt-vue:latest

# 检查启动是否成功
if [ $? -ne 0 ]; then
    echo "容器启动失败，请检查错误信息"
    exit 1
fi

echo ""
echo "==============================================="
echo "MI-GPT安装成功!"
echo "请在浏览器中访问: http://localhost:3000"
echo ""
echo "常用命令:"
echo "  查看应用状态: docker ps"
echo "  停止应用: docker stop mi-gpt-vue"
echo "  启动应用: docker start mi-gpt-vue"
echo "  查看日志: docker logs mi-gpt-vue"
echo "===============================================" 