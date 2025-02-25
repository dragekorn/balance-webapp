#!/bin/bash

# Обновление пакетов
echo "Обновление списка пакетов..."
sudo apt update

# Установка Node.js
echo "Установка Node.js и npm..."
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Проверка установки Node.js и npm
node -v
npm -v

# Установка PostgreSQL
echo "Установка PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Запуск PostgreSQL
echo "Запуск сервиса PostgreSQL..."
sudo service postgresql start

# Создание пользователя и базы данных
echo "Настройка базы данных PostgreSQL..."
sudo -u postgres psql -c "CREATE USER balance_user WITH PASSWORD 'password';"
sudo -u postgres psql -c "CREATE DATABASE balance_db;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE balance_db TO balance_user;"
sudo -u postgres psql -c "ALTER USER balance_user WITH SUPERUSER;"

# Настройка проекта
echo "Настройка проекта..."
npm init -y
npm install express pg pg-hstore sequelize umzug express-validator dotenv

# Создание .env файла
echo "Создание .env файла..."
cat > .env << EOL
DATABASE_URL=postgres://balance_user:password@localhost:5432/balance_db
PORT=3000
EOL

echo "Окружение настроено успешно!"
echo "Теперь вы можете запустить миграции: npm run migrate"
echo "И затем запустить приложение: npm start"