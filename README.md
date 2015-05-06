# blog
一个个人博客

启动项目前需要安装nodejs、mongodb

项目启动后需要对数据库建立三个索引
使用以下语句创建：
db.articles.ensureIndex({create_time:1});
db.articles.ensureIndex({create_time:-1});
db.categories.ensureIndex({name:1},{unique:true});
