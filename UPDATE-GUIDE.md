# 上传这次的动漫风更新

1. 解压本包，进入 `infinite-tau-blog` 文件夹。
2. 打开 https://github.com/qawozeixructyv/qawozeixructyv.github.io ，确认在 `main` 分支、仓库根目录。
3. 点 **Add file → Upload files**，把文件夹**里面的文件和子目录**拖进去。不要上传压缩包，不要拖最外层的文件夹。
4. 填写提交说明，例如「更新动漫风博客」，点 **Commit changes**。同名的主题文件会更新，你现有的文章请保留。
5. 在 **Actions** 查看 Pages 构建是否成功，然后访问 https://qawozeixructyv.github.io/ 。如果仍显示旧页面，刷新浏览器缓存。

原有 Pages 设置保持 `main` 与 `/(root)` 即可。旧的 `infinite-tau-blog (1)` 文件夹已在配置中排除，无须为这次更新专门删除。

## 这次改动

浅粉与淡紫配色，动漫大封面，文章列表与作者侧栏，八张图片组成可放大的画廊；游记、随笔、归档和写作页继续保留。没有放入虚构文章。

## 图片在哪里

全部在 `assets/anime/`：六张水印图经 AI 编辑，可能有少量细节变化；`flower-crown.jpg` 与 `petals.jpg` 是原图。

如需文章封面，在 Markdown 顶部的两行 `---` 之间加：

```yaml
cover: "/assets/anime/sunset.png"
```

## 开始写

双击 `write.html`，写完点击「导出文章 .md」。把导出的文件上传到仓库的 `_posts/` 并提交，才会公开发布。请定期备份草稿。

双击 `preview.html` 可看静态外观预览；它没有运行 Jekyll，真实构建以 GitHub Actions 为准。
