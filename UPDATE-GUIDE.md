# 本次需要替换的文件

隐藏写作入口：
- `_layouts/default.html`
- `_includes/sidebar.html`
- `_includes/list.html`

如果还没上传直接发布功能，同时替换：
- `write.html`
- `assets/editor.js`
- `assets/editor.css`

根目录文件放到仓库根目录；其余文件进入对应文件夹后上传同名文件，点击 Commit changes。其他文件不用重传。

公开页面不再显示写作按钮，也不显示空白写作卡片。你可以直接打开 https://qawozeixructyv.github.io/write.html 写作并发布。隐藏入口不是访问控制；知道地址的人仍能打开工具，但没有你的仓库授权不能发布。

文章列表来自 Jekyll 的 site.posts；草稿、未来日期文章与 published: false 文章不会在正常构建中展示。公开仓库中的源文件仍可被查看。
