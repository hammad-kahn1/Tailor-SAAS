FROM php:8.3-fpm-alpine

# System deps
RUN apk add --no-cache \
    bash curl git unzip libpng-dev libjpeg-turbo-dev \
    libzip-dev oniguruma-dev icu-dev freetype-dev \
    libxml2-dev zlib-dev nodejs npm

# PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install \
    pdo_mysql mbstring zip gd intl xml opcache pcntl bcmath

# Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

# Install PHP deps
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Permissions
RUN chown -R www-data:www-data storage bootstrap/cache \
 && chmod -R 775 storage bootstrap/cache

COPY docker/php.ini /usr/local/etc/php/conf.d/custom.ini

EXPOSE 9000

CMD ["php-fpm"]
