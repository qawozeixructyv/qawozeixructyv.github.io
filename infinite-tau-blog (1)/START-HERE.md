# 生活在别处 · 开始写作

副标题：不存在十全十美的文章，一如不存在彻头彻尾的绝望。

作者：qawozeixructyv

## 现在就开始写

解压后双击 `write.html`。填写标题、分类、正文，点击「导出文章 .md」。

这是本机写作工具，不用登录。草稿尝试自动保存到当前浏览器；不同浏览器、隐私模式或清理浏览数据可能导致草稿丢失。请定期点击「备份草稿 .json」，备份后可从「导入草稿」恢复。

网页并不是在线内容管理系统：导出只会下载文件，上传到 GitHub 并提交后才会公开发布。

## 第一次上线

1. 在 GitHub 创建一个公开仓库，名字准确填写 `qawozeixructyv.github.io`。地址：https://github.com/new 。当前连接无法代你创建仓库；仓库是否存在需要 GitHub 实际返回确认。
2. 在空仓库上传本压缩包**里面**的文件与目录，不要上传 zip，不要再套一层父文件夹。确保 `_config.yml`、`index.html`、`_layouts/`、`_includes/` 和 `assets/` 在根目录。
3. Settings → Pages → Build and deployment → Source 选 Deploy from a branch，选 main 和 /(root)，保存。
4. 在 Actions 查看 Pages 构建结果。成功后 GitHub 给出网址 `https://qawozeixructyv.github.io/`。

如果仓库已经有内容，先检查，不要覆盖原有文件。

## 发布一篇文章

写作页导出的文件名例如 `2026-10-11-france.md`。

上传到仓库的 `_posts/` 文件夹，提交后自动重新构建。第一次若网页没有保留空的 `_posts/` 目录，可用 Add file → Create new file，文件名填 `_posts/2026-10-11-france.md`，把导出的全部文本粘贴进去并提交。

游记 / 随笔分别自动进入对应栏目。归档支持搜索标题、简介和分类。

将来的日期默认不会显示；想现在发布就选择今天或过去的日期。

## 照片

将照片上传到 `assets/images/`，建议使用简短英文文件名，例如 `strasbourg-morning.jpg`。文章中：

```liquid
![斯堡的清晨]({{ '/assets/images/strasbourg-morning.jpg' | relative_url }})
```

写作页「照片格式」按钮会插入这段格式，需要自己替换路径和说明。照片不会自动上传。

建议把单张照片压缩到 1–2 MB，避免文章加载过慢。浏览器里的写作预览只显示图片路径提示，不会读取未上传的本机照片。

## 手写 Markdown

复制 `templates/article.md`，替换标题、日期、分类、简介和正文。另存为 `_posts/年-月-日-英文短标题.md`。

未准备公开的文章可以放在 `_drafts/`，但公开仓库里的源文件仍然可见。私人草稿请保留在本机。

## 修改博客

- 标题、作者、副标题、网址：`_config.yml`
- 首页句子：`index.html`
- 自我介绍：`about.md`
- 配色与排版：`assets/style.css`
- 文章：`_posts/`

## 验证说明

本版本检查了配置和页面元数据、JavaScript 语法、文章导出与不安全文本的预览处理、文件链接及压缩包完整性。

制作环境没有 Ruby / Jekyll 和可用浏览器预览，尚未执行 Jekyll 构建或浏览器交互测试；博客也尚未上线。首次发布后以 GitHub Pages 构建结果为准。

官方上线说明：https://docs.github.com/en/pages/quickstart
