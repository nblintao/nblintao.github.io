# Claude 项目指南

这是一个基于 Jekyll 的个人网站项目。

## 构建网站

```bash
bundle exec jekyll build
```

构建完成后,静态文件会生成在 `_site/` 目录下。

## 本地预览

构建后启动本地服务器:

```bash
cd _site && python3 -m http.server 8000
```

然后在浏览器访问:
- 英文版: http://localhost:8000
- 中文版: http://localhost:8000/zh/

## 修改内容

### 修改文本内容

编辑以下文件:
- 英文内容: `_i18n/en.yml`
- 中文内容: `_i18n/zh.yml`

### 修改 HTML 结构

编辑 `_includes/home.html` 文件来修改页面结构。

### 修改样式

**重要**: 网站使用压缩的 CSS 文件 `css/agency.min.css`，而不是 `css/agency.css`。

修改样式的正确流程:
1. 编辑 `css/agency.css` (方便阅读和维护)
2. 同步修改 `css/agency.min.css` (网站实际使用的文件)
3. 运行 `bundle exec jekyll build` 重新构建
4. 刷新浏览器时按 `Cmd + Shift + R` 强制清除缓存

**注意**:
- HTML 中引用的是 `agency.min.css`，所以必须同时更新这个文件
- 本项目的 gulp 构建工具版本较旧，无法在新版 Node.js 上运行，因此需要手动同步两个 CSS 文件
- 浏览器会缓存 CSS，修改后务必强制刷新才能看到效果

修改后重新构建网站即可看到效果。
