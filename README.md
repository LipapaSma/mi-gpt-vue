# MiGPT 可视化配置界面

基于 Vue 的 MiGPT 可视化配置界面，提供直观的服务管理和参数配置能力。

## 🌟 特性

- 💻 支持 PC 端和移动端自适应布局
- 🎨 清晰直观的配置界面
- 🚀 一键启动/停止服务
- ⚙️ 可视化参数配置
- 🔄 实时状态监控

## 📱 界面预览

### PC 端

#### 主页面

<img width="1064" alt="image" src="https://github.com/user-attachments/assets/9a86f85b-189e-461d-ba6d-bf320a7f7c78" />

#### 配置界面

<img width="1020" alt="image" src="https://github.com/user-attachments/assets/6d45700f-d25c-464b-bf75-cfb6b02f3981" />

### 移动端

<div style="display: flex; gap: 20px;">
  <img src="https://github.com/user-attachments/assets/08612c74-bdab-445d-bd0b-d98f750f931d" alt="移动端主页面" width="200"/>
  <img src="https://github.com/user-attachments/assets/7ba06c3a-8ba2-4213-ba58-2e35da23eb8b" alt="移动端配置界面" width="200"/>
</div>

## 🛠️ 服务管理

### 启动服务

<img width="735" alt="image" src="https://github.com/user-attachments/assets/377b1969-20f2-4cf5-8bd2-ba0f31a1fa3b" />

### 停止服务

<img width="702" alt="image" src="https://github.com/user-attachments/assets/9cebab47-9367-43a2-acd8-1ecdd59724ef" />

## 🙏 致谢

特别感谢 [@idootop](https://github.com/idootop) 提供的接口和服务能力支持。

## 📝 配置说明

### 基础配置

- 支持服务启动/停止
- 支持参数可视化配置
- 实时状态反馈

### 高级配置

- 自定义模型参数
- 系统性能监控
- 日志实时查看

## 💡 使用提示

1. 确保系统环境已正确配置
2. 访问配置界面进行参数设置
3. 使用启动按钮开启服务
4. 可随时查看服务状态
5. 需要时可一键停止服务

## 🚀 部署指南

本项目提供了 Docker 容器化部署方式，适合不同技术水平的用户：

### 📦 无代码基础用户部署方案

#### 一键式 Docker 部署（推荐）

我们提供了简单的一键安装脚本，自动完成 Docker 安装和应用部署：

- **Linux/Mac 用户**：

  ```bash
  # 赋予脚本执行权限
  chmod +x install.sh
  # 运行安装脚本
  ./install.sh
  ```

- **Windows 用户**：
  直接双击运行`install.bat`文件

安装成功后，在浏览器中访问：`http://localhost:3000`

### 🧑‍💻 开发者部署方案

请参考[DEPLOYMENT.md](./DEPLOYMENT.md)文档了解更多高级部署选项。
