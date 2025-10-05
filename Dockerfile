# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装所有依赖（包括 devDependencies，因为构建需要）
RUN npm ci

# 复制源代码
COPY . .

# 设置 node_modules 权限并构建
RUN chmod -R +x node_modules/.bin && npm run build

# 生产阶段 - 使用精简的 nginx 镜像
FROM nginx:1.25-alpine

# 移除默认的 nginx 静态文件
RUN rm -rf /usr/share/nginx/html/*

# 复制构建产物到 nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 5174

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
