@echo off
echo ===============================================
echo MI-GPT 一键安装脚本
echo 该脚本将自动安装所需依赖并部署MI-GPT应用
echo ===============================================
echo.

REM 检测是否已安装Docker
where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 未检测到Docker，请先安装Docker Desktop
    echo 请从以下链接下载并安装Docker Desktop:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    echo 安装完成后，请重新运行此脚本
    echo.
    pause
    exit /b 1
)

REM 检查Docker是否运行
docker info >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Docker服务未运行，请启动Docker Desktop
    echo.
    echo 启动Docker Desktop后，请重新运行此脚本
    echo.
    pause
    exit /b 1
)

echo Docker服务已运行!
echo.

REM 构建并运行Docker镜像
echo 开始构建MI-GPT Docker镜像...
docker build -t mi-gpt-vue:latest .

REM 检查构建是否成功
if %ERRORLEVEL% neq 0 (
    echo Docker镜像构建失败，请检查错误信息
    pause
    exit /b 1
)

echo Docker镜像构建成功!
echo.

REM 检查是否有已存在的容器
FOR /F "tokens=*" %%i IN ('docker ps -q -f name^=mi-gpt-vue') DO SET CONTAINER_ID=%%i
if not "%CONTAINER_ID%"=="" (
    echo 检测到已有MI-GPT容器运行，将停止并移除...
    docker stop %CONTAINER_ID%
    docker rm %CONTAINER_ID%
)

REM 运行容器
echo 正在启动MI-GPT容器...
docker run -d -p 3000:3000 --name mi-gpt-vue mi-gpt-vue:latest

REM 检查启动是否成功
if %ERRORLEVEL% neq 0 (
    echo 容器启动失败，请检查错误信息
    pause
    exit /b 1
)

echo.
echo ===============================================
echo MI-GPT安装成功!
echo 请在浏览器中访问: http://localhost:3000
echo.
echo 常用命令:
echo   查看应用状态: docker ps
echo   停止应用: docker stop mi-gpt-vue
echo   启动应用: docker start mi-gpt-vue
echo   查看日志: docker logs mi-gpt-vue
echo ===============================================

pause 