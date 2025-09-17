# PNG to WebP Converter / PNG 转 WebP 工具

<div align="center">

![PNG to WebP Converter](https://img.shields.io/badge/PNG%20to%20WebP-Converter-orange?style=for-the-badge&logo=webp)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)

A modern online image format conversion tool that supports fast conversion of PNG images to WebP format, completely processed in the browser to protect user privacy.

一个现代化的在线图片格式转换工具，支持将 PNG 图片快速转换为 WebP 格式，完全在浏览器中处理，保护用户隐私。

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-green?style=for-the-badge)](https://www.png2webp.site/)
[![GitHub](https://img.shields.io/badge/GitHub-View%20Source-black?style=for-the-badge&logo=github)](https://github.com/wengxiaoxiong/png2webp)

</div>

---

## 🌟 Features / 功能特性

### English
- **🚀 Fast Conversion**: Pure frontend processing, no server upload required, fast conversion speed
- **📁 Batch Processing**: Support converting multiple PNG files simultaneously, improving work efficiency
- **🎛️ Quality Control**: Customizable WebP image quality (10%-100%), balancing file size and image quality
- **🔒 Privacy & Security**: All processing is done locally in the browser, no files uploaded to server
- **📱 Responsive Design**: Support desktop and mobile, providing excellent user experience
- **🌙 Dark Mode**: Support light/dark theme switching, adapting to different usage environments
- **📊 Compression Stats**: Real-time display of file size comparison and compression ratio
- **🌍 Internationalization**: Support for English and Chinese languages

### 中文
- **🚀 快速转换**: 纯前端处理，无需上传到服务器，转换速度快
- **📁 批量处理**: 支持同时转换多个 PNG 文件，提高工作效率
- **🎛️ 质量调节**: 可自定义 WebP 图片质量 (10%-100%)，平衡文件大小和图片质量
- **🔒 隐私安全**: 所有处理都在本地浏览器中完成，不会上传任何文件到服务器
- **📱 响应式设计**: 支持桌面端和移动端，提供良好的用户体验
- **🌙 深色模式**: 支持明暗主题切换，适应不同使用环境
- **📊 压缩统计**: 实时显示文件大小对比和压缩比例
- **🌍 国际化**: 支持英文和中文语言

---

## 🛠️ Tech Stack / 技术栈

| Category / 分类 | Technology / 技术 |
|----------------|------------------|
| **Frontend Framework / 前端框架** | Next.js 14 |
| **Development Language / 开发语言** | TypeScript 5 |
| **Styling / 样式方案** | Tailwind CSS 3 |
| **UI Components / UI 组件** | Radix UI + shadcn/ui |
| **Icons / 图标库** | Lucide React |
| **Deployment / 部署平台** | Vercel |
| **Internationalization / 国际化** | react-i18next |

---

## 🚀 Quick Start / 快速开始

### Online Usage / 在线使用

**English**: Visit the deployed website: [https://www.png2webp.site/](https://www.png2webp.site/)

**中文**: 直接访问部署的网站：[https://www.png2webp.site/](https://www.png2webp.site/)

### Local Development / 本地开发

1. **Clone Repository / 克隆仓库**
   ```bash
   git clone https://github.com/wengxiaoxiong/png2webp.git
   cd png2webp
   ```

2. **Install Dependencies / 安装依赖**
   ```bash
   # Using pnpm (recommended)
   pnpm install
   
   # Or using npm
   npm install
   
   # Or using yarn
   yarn install
   ```

3. **Start Development Server / 启动开发服务器**
   ```bash
   # Using pnpm
   pnpm dev
   
   # Or using npm
   npm run dev
   
   # Or using yarn
   yarn dev
   ```

4. **Open Browser / 打开浏览器**
   
   **English**: Visit [http://localhost:3000](http://localhost:3000)
   
   **中文**: 访问 [http://localhost:3000](http://localhost:3000)

---

## 📖 Usage Instructions / 使用说明

### English
1. **Upload Images**: Drag PNG files to the upload area, or click the button to select files
2. **Adjust Quality**: Use the slider to adjust WebP image quality (recommended 80-90%)
3. **Start Conversion**: Click the "Start Conversion" button and wait for processing to complete
4. **Download Results**: Download individual files or batch download all converted files

### 中文
1. **上传图片**: 拖拽 PNG 文件到上传区域，或点击按钮选择文件
2. **调整质量**: 使用滑块调整 WebP 图片质量 (推荐 80-90%)
3. **开始转换**: 点击"开始转换"按钮，等待处理完成
4. **下载结果**: 可以单独下载每个文件，或批量下载所有转换后的文件

---

## 🎯 Why Choose WebP? / 为什么选择 WebP？

### English
- **Smaller Files**: Compared to PNG, WebP format typically reduces file size by 25-35%
- **Better Quality**: At the same file size, WebP provides better image quality
- **Wide Support**: Modern browsers all support WebP format
- **Faster Loading**: Smaller file size means faster webpage loading speed

### 中文
- **文件更小**: 相比 PNG，WebP 格式通常可以减少 25-35% 的文件大小
- **质量更好**: 在相同文件大小下，WebP 提供更好的图片质量
- **广泛支持**: 现代浏览器都支持 WebP 格式
- **加载更快**: 更小的文件大小意味着更快的网页加载速度

---

## 🔧 Development / 开发说明

### Project Structure / 项目结构

```
png2webp/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles / 全局样式
│   ├── layout.tsx         # Root layout / 根布局
│   └── page.tsx           # Main page / 主页面
├── components/            # React components / React 组件
│   ├── ui/               # UI component library / UI 组件库
│   ├── i18n-provider.tsx # i18n provider / 国际化提供者
│   ├── language-switcher.tsx # Language switcher / 语言切换器
│   └── theme-provider.tsx # Theme provider / 主题提供者
├── lib/                  # Utility functions / 工具函数
│   ├── locales/          # Language files / 语言文件
│   │   ├── en.json       # English translations / 英文翻译
│   │   └── zh.json       # Chinese translations / 中文翻译
│   ├── i18n.ts          # i18n configuration / 国际化配置
│   └── utils.ts         # Common utilities / 通用工具
└── public/               # Static assets / 静态资源
```

### Core Features Implementation / 核心功能实现

**English**:
- **Image Conversion**: Uses HTML5 Canvas API for format conversion
- **File Processing**: Supports drag-and-drop upload and batch processing
- **Quality Control**: Adjustable WebP compression quality
- **Progress Display**: Real-time conversion progress display
- **Internationalization**: Multi-language support with react-i18next

**中文**:
- **图片转换**: 使用 HTML5 Canvas API 进行格式转换
- **文件处理**: 支持拖拽上传和批量处理
- **质量控制**: 可调节的 WebP 压缩质量
- **进度显示**: 实时显示转换进度
- **国际化**: 使用 react-i18next 实现多语言支持

---

## 📝 License / 许可证

**English**: This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**中文**: 本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 🤝 Contributing / 贡献

**English**: Welcome to submit Issues and Pull Requests to improve this project!

**中文**: 欢迎提交 Issue 和 Pull Request 来改进这个项目！

---

## 📞 Contact / 联系方式

| Platform / 平台 | Link / 链接 |
|----------------|------------|
| **GitHub Repository / GitHub 仓库** | [https://github.com/wengxiaoxiong/png2webp](https://github.com/wengxiaoxiong/png2webp) |
| **Live Demo / 在线演示** | [https://www.png2webp.site/](https://www.png2webp.site/) |
| **Personal Website / 个人网站** | [https://wengxiaoxiong.com](https://wengxiaoxiong.com) |
| **Bear Agent / 熊代理** | [https://bear-agent.com](https://bear-agent.com) |

---

<div align="center">

**⭐ If this project helps you, please give it a star! / 如果这个项目对你有帮助，请给它一个星标！**

Made with ❤️ by [wengxiaoxiong](https://github.com/wengxiaoxiong)

</div>
