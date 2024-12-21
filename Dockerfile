# Используем официальный образ Node.js
FROM node:20.11.1

# Рабочая директория в контейнере
WORKDIR /usr/src/app

# Копируем package.json и yarn.lock
COPY package.json yarn.lock ./

# Устанавливаем зависимости
RUN yarn install --frozen-lockfile

# Копируем все файлы в контейнер
COPY . .

# Собираем приложение для production
RUN yarn build

# Указываем команду для запуска приложения
CMD ["yarn", "start:prod"]
