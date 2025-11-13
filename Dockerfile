# Estágio 1: Build com Node.js
FROM node:20-alpine AS build

# Define o diretório de trabalho
WORKDIR /app

# Copia o package.json e package-lock.json
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o resto dos arquivos da aplicação
COPY . .

# Adicione esta linha para dar permissão de execução
RUN chmod +x ./node_modules/.bin/vite

# Argumento para a URL da API
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Builda a aplicação para produção
RUN npm run build

# Estágio 2: Servir com Nginx
FROM nginx:stable-alpine

# Copia os arquivos de build do estágio anterior para o diretório do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia o novo arquivo de configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d

# Expõe a porta 80
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
