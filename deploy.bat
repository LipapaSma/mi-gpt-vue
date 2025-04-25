@echo off
echo === MI-GPT 自动部署脚本 ===
echo 该脚本将帮助你部署MI-GPT Vue应用到Docker
echo.

REM 检查Docker是否安装
where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 错误: 未检测到Docker安装，请先安装Docker
    echo 安装指南: https://docs.docker.com/get-docker/
    exit /b 1
)

REM 检查Docker是否运行
docker info >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 错误: Docker未运行，请启动Docker服务
    exit /b 1
)

echo Docker已准备就绪，开始构建镜像...

REM 构建Docker镜像
docker build -t mi-gpt-vue:latest .

REM 检查构建是否成功
if %ERRORLEVEL% neq 0 (
    echo 错误: Docker镜像构建失败
    exit /b 1
)

echo Docker镜像构建成功！

REM 检查是否已有容器运行
FOR /F "tokens=*" %%i IN ('docker ps -q -f name^=mi-gpt-vue') DO SET CONTAINER_ID=%%i
if not "%CONTAINER_ID%"=="" (
    echo 检测到已有MI-GPT容器运行，将停止并移除...
    docker stop %CONTAINER_ID%
    docker rm %CONTAINER_ID%
)

REM 启动容器
echo 正在启动MI-GPT容器...
docker run -d -p 3000:3000 --name mi-gpt-vue mi-gpt-vue:latest

REM 检查启动是否成功
if %ERRORLEVEL% neq 0 (
    echo 错误: 容器启动失败
    exit /b 1
)

echo === 部署成功 ===
echo MI-GPT应用已成功部署到Docker
echo 访问地址: http://localhost:3000
echo.
echo 常用命令:
echo   停止应用: docker stop mi-gpt-vue
echo   启动应用: docker start mi-gpt-vue
echo   查看日志: docker logs mi-gpt-vue
echo   移除应用: docker rm mi-gpt-vue

pause 