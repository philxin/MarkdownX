# Markdown Snapper 示例文档

## 欢迎使用 Markdown Snapper

这是一个示例 Markdown 文档，用于展示 **Markdown Snapper** 的功能。

### 主要特点

* 将 Markdown 转换为精美图片
* 支持多种主题风格
* 简单易用的 API 接口

### 代码示例

```javascript
// 使用 Markdown Snapper API 生成图片
fetch('http://localhost:3000/api/generate-image', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log('图片生成成功:', data.imageUrl);
})
.catch(error => {
  console.error('错误:', error);
});
```

### 表格示例

| 主题名称 | 风格特点 | 适用场景 |
|---------|---------|---------|
| Notion  | 简洁现代 | 笔记、文档 |
| Terminal | 终端风格 | 代码展示 |
| Paper   | 纸张效果 | 正式文档 |

> Markdown Snapper 让你的文档更具视觉吸引力！

---

了解更多信息，请访问我们的[项目主页](https://github.com/yourusername/markdown-snapper-mcp)。
