# PNG 转 WebP 工具

一个现代化的在线图片格式转换工具，支持将 PNG 图片快速转换为 WebP 格式，完全在浏览器中处理，保护用户隐私。


## ✨ 功能特性

- **🚀 快速转换**: 纯前端处理，无需上传到服务器，转换速度快
- **📁 批量处理**: 支持同时转换多个 PNG 文件，提高工作效率
- **🎛️ 质量调节**: 可自定义 WebP 图片质量 (10%-100%)，平衡文件大小和图片质量
- **🔒 隐私安全**: 所有处理都在本地浏览器中完成，不会上传任何文件到服务器
- **📱 响应式设计**: 支持桌面端和移动端，提供良好的用户体验
- **🌙 深色模式**: 支持明暗主题切换，适应不同使用环境
- **📊 压缩统计**: 实时显示文件大小对比和压缩比例

## 🛠️ 技术栈

- **前端框架**: Next.js
- **开发语言**: TypeScript
- **样式方案**: Tailwind CSS
- **UI 组件**: Radix UI + shadcn/ui
- **图标库**: Lucide React
- **部署平台**: Vercel

## 🚀 快速开始

### 在线使用

直接访问部署的网站：[https://www.png2webp.site/](https://www.png2webp.site/)

### 本地开发

1. **克隆仓库**
   ```bash
   git clone https://github.com/wengxiaoxiong/png2webp.git
   cd png2webp
   ```

2. **安装依赖**
   ```bash
   pnpm install
   # 或者使用 npm
   npm install
   # 或者使用 yarn
   yarn install
   ```

3. **启动开发服务器**
   ```bash
   pnpm dev
   # 或者使用 npm
   npm run dev
   # 或者使用 yarn
   yarn dev
   ```

4. **打开浏览器**
   访问 [http://localhost:3000](http://localhost:3000)

## 📖 使用说明

1. **上传图片**: 拖拽 PNG 文件到上传区域，或点击按钮选择文件
2. **调整质量**: 使用滑块调整 WebP 图片质量 (推荐 80-90%)
3. **开始转换**: 点击"开始转换"按钮，等待处理完成
4. **下载结果**: 可以单独下载每个文件，或批量下载所有转换后的文件

## 🎯 为什么选择 WebP？

- **文件更小**: 相比 PNG，WebP 格式通常可以减少 25-35% 的文件大小
- **质量更好**: 在相同文件大小下，WebP 提供更好的图片质量
- **广泛支持**: 现代浏览器都支持 WebP 格式
- **加载更快**: 更小的文件大小意味着更快的网页加载速度

## 🔧 开发说明

### 项目结构

```
png2webp/
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
├── components/            # React 组件
│   ├── ui/               # UI 组件库
│   └── theme-provider.tsx # 主题提供者
├── lib/                  # 工具函数
│   └── utils.ts          # 通用工具
└── public/               # 静态资源
```

### 核心功能实现

- **图片转换**: 使用 HTML5 Canvas API 进行格式转换
- **文件处理**: 支持拖拽上传和批量处理
- **质量控制**: 可调节的 WebP 压缩质量
- **进度显示**: 实时显示转换进度

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 📞 联系方式

- 项目地址: [https://github.com/wengxiaoxiong/png2webp](https://github.com/wengxiaoxiong/png2webp)
- 在线演示: [https://vercel.com/wengxiaoxiongs-projects/v0-png-to-web-p-tool](https://vercel.com/wengxiaoxiongs-projects/v0-png-to-web-p-tool)

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
