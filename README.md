<h1 align="center">zusheng's blog</h1>

<p align="center">
    <a href="https://blog.zusheng.club">
        <img src="https://img.shields.io/badge/项目地址-blog.zusheng.club-green.svg?style=flat-square" alt="项目地址">
    </a>
    <a href="https://zusheng.club">
        <img src="https://img.shields.io/badge/主页-home-blue.svg?style=flat-square" alt="主页地址">
    </a>
</p>

### 介绍

* 基于vue3、markdown、ant-design、chart.js、nodejs、mongodb搭建的博客系
* 后台可视化，支持上传markdown转html并生成文章目录
* 适应PC/移动端

### 项目展示

>#####   1. 主页

![主页](https://demo.zusheng.club/README/home-01.png)

>#####   2. 切换主题

![切换主题](https://demo.zusheng.club/README/setting-01.png)

>#####   3. 留言

![留言](https://demo.zusheng.club/README/home-03.png)

>#####   4. 博客详情、生成目录

![博客详情](https://demo.zusheng.club/README/detail-01.png)

>#####   4. 代码块过长自动折叠

![代码块过长自动折叠](https://demo.zusheng.club/README/detail-02.png)

>#####   5. 搜索

![搜索](https://demo.zusheng.club/README/search-01.png)

>#####   6. 后台-可视化

![后台](https://demo.zusheng.club/README/pro-09.png)
![后台](https://demo.zusheng.club/README/pro-01.png)

>#####   7. 其他面板

![其他面板](https://demo.zusheng.club/README/pro-02.png)

>#####   8. 编辑-可上传markdown

![编辑](https://demo.zusheng.club/README/pro-03.png)

>#####   9. 评论

![评论](https://demo.zusheng.club/README/pro-04.png)

>#####   10. log日志及详情

![log日志及详情](https://demo.zusheng.club/README/pro-05.png)
![log日志及详情](https://demo.zusheng.club/README/pro-06.png)

>#####   11. 设置

![设置](https://demo.zusheng.club/README/pro-07.png)
![设置](https://demo.zusheng.club/README/pro-08.png)

>#####   12. 移动端界面
> 
![移动端界面](https://demo.zusheng.club/README/phone-01.jpg)
![移动端界面](https://demo.zusheng.club/README/phone-02.jpg)
![移动端界面](https://demo.zusheng.club/README/phone-03.jpg)

### 目录结构

>   1. server 是服务器目录
>   2. public 是静态文件
>   4. src 是项目文件夹

### 运行流程

>   1. 克隆项目```git clone https://gitee.com/imzusheng/zusheng_s_blog.git```
>   2. `./server/config`，是服务器配置文件，需要更改的有mongodb的链接url，聚合数据的apiKey
>   4. `cd ./server`，再安装服务器依赖 `npm i`
>   6. 运行服务器 `nodemon index`, 需要安装nodemon
>   2. `cd 项目根目录`，安装依赖 `npm i`
>   3. 运行服务 `npm run serve`

### 测试账号

首次进入`localhost:8080/pro`时会提示初始化
自动生成账号`admin`，密码`123456`

### 相关技术栈

* **Vue3**
* **VueCli4**
* **Node.js**
* **Ant Design Vue**
* **MongoDB**
* **koa2**
* **chart.js**
* **markdown-it**
* **jsonwebtoken**

### 一起学习

[comment]: <> (feat: 添加新特性)

[comment]: <> (fix: 修复bug)

[comment]: <> (docs: 仅仅修改了文档)

[comment]: <> (style: 仅仅修改了空格、格式缩进、都好等等，不改变代码逻辑)

[comment]: <> (refactor: 代码重构，没有加新功能或者修复bug)

[comment]: <> (perf: 增加代码进行性能测试)

[comment]: <> (test: 增加测试用例)

[comment]: <> (chore: 改变构建流程、或者增加依赖库、工具等)
