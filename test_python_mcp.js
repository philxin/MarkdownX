#!/usr/bin/env node

const { spawn } = require('child_process');

// 启动 MCP 服务器
const server = spawn('node', ['mcp_server.js'], {
  cwd: require('path').join(__dirname, 'server')
});

const pythonMarkdown = `# Python 爬虫技术栈

## 一、基础库

### 1. requests 库
\`\`\`python
import requests

# 基本请求
response = requests.get('https://api.example.com')
data = response.json()

# 带参数请求
params = {'key': 'value', 'page': 1}
response = requests.get('https://api.example.com', params=params)

# POST 请求
data = {'username': 'user', 'password': 'pass'}
response = requests.post('https://api.example.com/login', json=data)
\`\`\`

### 2. urllib 库
- Python 内置库
- 适合简单的 HTTP 请求
- 支持 URL 解析、编码处理

## 二、解析库

### 1. BeautifulSoup
\`\`\`python
from bs4 import BeautifulSoup
import requests

html = requests.get('https://example.com').text
soup = BeautifulSoup(html, 'html.parser')

# 查找元素
title = soup.find('h1').text
links = soup.find_all('a', href=True)

# CSS 选择器
content = soup.select_one('.content p')
\`\`\`

### 2. lxml
- 高性能解析器
- 支持 XPath 和 CSS 选择器
- 处理大型 HTML 文档更高效

### 3. pyquery
- jQuery 风格的解析库
- 语法简洁易用

## 三、爬虫框架

### 1. Scrapy 框架
\`\`\`python
import scrapy

class BlogSpider(scrapy.Spider):
    name = 'blog'
    start_urls = ['https://blog.example.com']

    def parse(self, response):
        for article in response.css('article'):
            yield {
                'title': article.css('h2::text').get(),
                'url': article.css('a::attr(href)').get(),
                'summary': article.css('p::text').get()
            }
\`\`\`

**特点：**
- 异步网络框架
- 内置数据管道
- 强大的选择器系统
- 中间件机制

### 2. Scrapy-Redis
- 分布式爬虫
- Redis 去重
- 任务队列管理

## 四、动态页面渲染

### 1. Selenium
\`\`\`python
from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
driver.get('https://example.com')

# 等待元素加载
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

element = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.ID, 'content'))
)

print(element.text)
driver.quit()
\`\`\`

### 2. Playwright
- 现代化的浏览器自动化工具
- 支持多浏览器 (Chrome, Firefox, Safari)
- 异步 API，性能更好
- 自动等待元素

### 3. Pyppeteer
- Puppeteer 的 Python 版本
- 基于 Chrome DevTools Protocol
- 无头浏览器操作

## 五、数据存储

### 1. 数据库存储
\`\`\`python
import pymongo
import sqlite3

# MongoDB
client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client['spider']
collection = db['articles']

# SQLite
conn = sqlite3.connect('spider.db')
cursor = conn.cursor()
\`\`\`

### 2. 文件存储
- CSV 格式：适合表格数据
- JSON 格式：适合结构化数据
- Excel 格式：便于数据分析

## 六、反爬策略

### 1. User-Agent 轮换
\`\`\`python
import random

user_agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
]

headers = {
    'User-Agent': random.choice(user_agents)
}
\`\`\`

### 2. IP 代理池
- 付费代理服务
- 免费代理网站
- 自建代理服务器

### 3. 请求频率控制
\`\`\`python
import time
import random

# 随机延迟
time.sleep(random.uniform(1, 3))

# 使用限流器
from ratelimit import limits

@limits(calls=10, period=60)
def fetch_page(url):
    return requests.get(url)
\`\`\`

### 4. Cookie 处理
- Session 管理
- Cookie 池轮换
- 登录状态保持

## 七、验证码处理

### 1. OCR 识别
- Tesseract OCR
- 百度 OCR API
- 腾讯云 OCR

### 2. 打码平台
- 超级鹰
- 打码兔
- 2captcha

### 3. 机器学习
- CNN 图像识别
- 训练自己的模型

## 八、最佳实践

### 1. robots.txt 遵守
\`\`\`python
import urllib.robotparser

rp = urllib.robotparser.RobotFileParser()
rp.set_url('https://example.com/robots.txt')
rp.read()

if rp.can_fetch('MyBot', 'https://example.com/page'):
    # 进行爬取
    pass
\`\`\`

### 2. 异常处理
\`\`\`python
import time
from requests.exceptions import RequestException

def safe_fetch(url, max_retries=3):
    for i in range(max_retries):
        try:
            response = requests.get(url, timeout=10)
            return response
        except RequestException as e:
            if i < max_retries - 1:
                time.sleep(2 ** i)  # 指数退避
            else:
                raise
\`\`\`

### 3. 日志记录
\`\`\`python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='spider.log'
)

logging.info('开始爬取: %s', url)
\`\`\`

---

> 💡 **温馨提示**: 爬虫开发要遵守网站的服务条款，尊重 robots.txt 规则，合理控制爬取频率，避免对目标网站造成压力。`;

console.log('🚀 正在调用 MCP 工具生成 Python 爬虫技术图片...\n');

server.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(l => l.trim());
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      if (response.result && response.result.content) {
        console.log('\n✅ MCP 工具调用成功！');
        console.log('\n' + '='.repeat(60));
        console.log(response.result.content[0].text);
        console.log('='.repeat(60) + '\n');
        process.exit(0);
      }
    } catch (e) {}
  });
});

server.stderr.on('data', (data) => {
  const msg = data.toString().trim();
  if (msg && !msg.includes('profile') && !msg.includes('运行中')) {
    console.log('🔴', msg);
  }
});

setTimeout(() => {
  // 直接调用工具
  const request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'markdown-to-image',
      arguments: {
        markdown: pythonMarkdown,
        theme: 'notion',
        width: 900,
        height: 1800,
        quality: 95
      }
    }
  };

  console.log('📤 发送 MCP 请求...');
  server.stdin.write(JSON.stringify(request) + '\n');

  setTimeout(() => {
    server.kill();
  }, 25000);
}, 500);
