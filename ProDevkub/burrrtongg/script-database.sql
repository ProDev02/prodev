----- Please add script to create schema + insert initial data
-- Create database and user
CREATE DATABASE burrrtongg_db;

CREATE USER admin WITH ENCRYPTED PASSWORD 'admin';

GRANT ALL PRIVILEGES ON DATABASE burrrtongg_db TO admin;
-- Switch to database
\c burrrtongg_db;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;


-- ===========================
-- Tables & Sequences
-- ===========================

-- Categories
CREATE SEQUENCE public.categories_id_seq START 1;

CREATE TABLE public.categories (
    id bigint NOT NULL DEFAULT nextval('public.categories_id_seq'),
    name varchar(255) NOT NULL,
    CONSTRAINT categories_pkey PRIMARY KEY (id),
    CONSTRAINT categories_name_unique UNIQUE (name)
);

-- Users
CREATE SEQUENCE public.users_user_id_seq START 1;

CREATE TABLE public.users (
    user_id bigint NOT NULL DEFAULT nextval('public.users_user_id_seq'),
    password varchar(255) NOT NULL,
    role varchar(255) NOT NULL CHECK (role IN ('CUSTOMER','SELLER','ADMIN')),
    username varchar(255) NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (user_id),
    CONSTRAINT users_username_unique UNIQUE (username)
);

-- Products
CREATE SEQUENCE public.products_id_seq START 1;

CREATE TABLE public.products (
    id bigint NOT NULL DEFAULT nextval('public.products_id_seq'),
    description varchar(255),
    image_url varchar(255),
    name varchar(255) NOT NULL,
    price double precision,
    size varchar(255),
    stock integer,
    category_id bigint,
    seller_id bigint NOT NULL,
    CONSTRAINT products_pkey PRIMARY KEY (id),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES public.categories(id),
    CONSTRAINT fk_products_seller FOREIGN KEY (seller_id) REFERENCES public.users(user_id)
);

-- Orders
CREATE SEQUENCE public.orders_id_seq START 1;

CREATE TABLE public.orders (
    id bigint NOT NULL DEFAULT nextval('public.orders_id_seq'),
    order_date timestamp NOT NULL,
    status varchar(255) NOT NULL CHECK (status IN ('PENDING','PROCESSING','SHIPPED','DELIVERED','CANCELED')),
    total_price double precision,
    customer_id bigint NOT NULL,
    CONSTRAINT orders_pkey PRIMARY KEY (id),
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES public.users(user_id)
);

-- Order Items
CREATE SEQUENCE public.order_items_id_seq START 1;

CREATE TABLE public.order_items (
    id bigint NOT NULL DEFAULT nextval('public.order_items_id_seq'),
    price double precision,
    quantity integer NOT NULL,
    order_id bigint NOT NULL,
    product_id bigint NOT NULL,
    CONSTRAINT order_items_pkey PRIMARY KEY (id),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES public.orders(id),
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES public.products(id)
);

-- Payments
CREATE SEQUENCE public.payments_id_seq START 1;

CREATE TABLE public.payments (
    id bigint NOT NULL DEFAULT nextval('public.payments_id_seq'),
    amount double precision,
    payment_date timestamp,
    status varchar(255) CHECK (status IN ('PENDING','COMPLETED','FAILED')),
    order_id bigint NOT NULL,
    CONSTRAINT payments_pkey PRIMARY KEY (id),
    CONSTRAINT payments_order_unique UNIQUE (order_id),
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES public.orders(id)
);

-- ===========================
-- Insert Initial Data
-- ===========================

INSERT INTO public.categories (id, name) VALUES
    (1, 'Electronics'),
    (2, 'Books'),
    (3, 'Clothing');

INSERT INTO public.users (user_id, password, role, username) VALUES
    (1, '$2a$10$pHA38KeEpizRdsq1FVo9Re8hz2Qad1ZmU63qw2OYrzH.17DmJvgZe', 'CUSTOMER', 'tester@example.com');

INSERT INTO public.orders (id, order_date, status, total_price, customer_id) VALUES
    (7, '2025-10-17 00:02:15.509688', 'DELIVERED', 999, 1),
    (8, '2025-10-17 00:06:55.974884', 'CANCELED', 999, 1);

-- Adjust sequences based on existing data
SELECT pg_catalog.setval('public.categories_id_seq', 3, true);
SELECT pg_catalog.setval('public.users_user_id_seq', 1, true);
SELECT pg_catalog.setval('public.products_id_seq', 1, false);
SELECT pg_catalog.setval('public.orders_id_seq', 8, true);
SELECT pg_catalog.setval('public.order_items_id_seq', 1, false);
SELECT pg_catalog.setval('public.payments_id_seq', 1, false);
