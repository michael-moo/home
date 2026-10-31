# Git 常用操作

## 凭据配置

### windows 下保存用户名和密码

```
git config credential.helper store
```

### windows 下清理已保存的用户名和密码

```
git config --system --unset credential.helper
```

## 换行符配置

### windows 下不自动转换换行符

```
git config --global core.eol lf
git config --global core.autocrlf input
git config --global core.safecrlf true
git rm -rf --cached .
git reset --hard
```

### core.autocrlf 取值说明

```
# 提交时转换为 LF，检出时转换为 CRLF
git config --global core.autocrlf true

# 提交时转换为 LF，检出时不转换
git config --global core.autocrlf input

# 提交检出均不转换
git config --global core.autocrlf false

# 拒绝提交包含混合换行符的文件
git config --global core.safecrlf true

# 允许提交包含混合换行符的文件
git config --global core.safecrlf false

# 提交包含混合换行符的文件时给出警告
git config --global core.safecrlf warn
```

### 多平台统一提交换行符

```
git config --global core.autocrlf input
git config --global core.safecrlf true
```

详见：[GitHub 第一坑：换行符自动转换](https://github.com/cssmagic/blog/issues/22 "点击访问")

## 配置别名

```
git config --global alias.co checkout
git config --global --replace-all alias.un "reset HEAD"
```

## 分支与 Tag 管理

### 删除远程分支

```
git push origin --delete <branchName>
```

### 删除远程 Tag

```
git push origin --delete tag <tagname>
```

### 批量删除远程 Tag

```
git show-ref --tag | awk '/201808/ {print ":"$2}' |xargs git push origin
```

### 清理本地分支（远程已被删除的）

```
git fetch -p
```

### 清理本地 Tag（远程已被删除的）

```
git tag -l | xargs git tag -d && git fetch -t
```

## 子模块

[点击查看](https://git-scm.com/book/zh/v1/Git-%E5%B7%A5%E5%85%B7-%E5%AD%90%E6%A8%A1%E5%9D%97)

## 提交规范

使用 commitizen 提交：

```
npm install -g commitizen cz-conventional-changelog
echo { "path": "cz-conventional-changelog" } > ~/.czrc
```
