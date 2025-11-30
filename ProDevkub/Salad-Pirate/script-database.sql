-- CREATE DATABASE saladpirate_db;
-- CREATE USER saladpirate_user WITH PASSWORD 'saladpirate_pass';
-- GRANT ALL PRIVILEGES ON DATABASE saladpirate_db TO saladpirate_user;

-- \c saladpirate_db saladpirate_user

-- create table if not exists public.users(
-- 	user_id int generated always as identity primary key,
-- 	email varchar(255) not null unique,
-- 	password_hash varchar(255) not null,
-- 	display_name varchar(255) not null,
-- 	created_at timestamptz default now() not null,
-- 	updated_at timestamptz default now() not null
-- );

-- insert into users (email,password_hash,display_name) values
-- (
-- 	'alice@example.com', 'alicethymefield', 'Alice'
-- ),
-- (
--     'yuzuha@example.com', 'ukinamiyuzuha', 'yuzuha'
-- );

-- select * from users;

-- create table if not exists public.categories(
-- 	category_id int generated always as identity primary key,
-- 	user_id int not null references public.users(user_id) on delete cascade,
-- 	category_name varchar(255) not null,
-- 	category_type varchar(15) not null,
-- 	color_hex varchar(7) not null,
-- 	created_at timestamptz default now() not null,

-- 	-- Prevent same category name in the same user
-- 	unique (user_id, category_name),
-- 	constraint uniques_categories_user_pair unique(user_id,category_id)
-- );

-- insert into categories (user_id, category_name, category_type, color_hex) values
-- (
-- 	1,'Food', 'Income','#000000'
-- ),
-- (
--     2,'Game', 'Expense','#000000'
-- );

-- select * from categories;create table if not exists public.payment_methods(
-- 	payment_method_id int generated always as identity primary key,
-- 	user_id int not null references public.users(user_id) on delete cascade,
-- 	payment_method_name varchar(255) not null,
-- 	color_hex varchar(7) not null,
-- 	created_at timestamptz default now() not null,

-- 	-- Prevent same payment method name in the same user
-- 	unique (user_id,payment_method_name),
-- 	constraint unique_payment_methods_user_pair unique(user_id, payment_method_id)
-- );

-- insert into payment_methods (user_id, payment_method_name, color_hex) values
-- (
-- 	1,'Cash','#000000'
-- ),
-- (
--     2,'Visa', '#000000'
-- );

-- select * from payment_methods;create table if not exists public.wallets(
-- 	wallet_id int generated always as identity primary key,
-- 	user_id int not null references public.users(user_id) on delete cascade,
-- 	wallet_name varchar(255) not null,
-- 	starting_balance numeric(12,2) not null default 0,
-- 	wallet_type varchar(255) not null,
-- 	color_hex varchar(7) not null,
-- 	created_at timestamptz default now() not null,

-- 	-- Prevent same wallet name in the same user
-- 	unique (user_id, wallet_name),
-- 	constraint unique_wallets_user_pair unique(user_id, wallet_id)
-- );

-- insert into wallets(user_id, wallet_name, wallet_type, color_hex) values
-- (
-- 	1,'Wallet_1','Cash', '#000000'
-- ),
-- (
--     2,'first_wallet','Savings', '#000000'
-- );

-- select * from wallets;create table if not exists public.transactions(
-- 	transaction_id int generated always as identity primary key,
-- 	user_id int not null references public.users(user_id),

-- 	category_id int not null,
-- 	payment_method_id int not null,
-- 	wallet_id int not null,

-- 	amount numeric(12,2) not null,
-- 	transaction_type varchar(15) not null 
-- 		check(transaction_type in ('Income', 'Expense')),
	

-- 	occured_at timestamptz not null,
-- 	transaction_location varchar(255),
-- 	note varchar(255),

-- 	-- Prevent user use category, payment_method, wallet form other user
-- 	constraint fk_transactions_categories
-- 		foreign key (user_id, category_id)
-- 		references public.categories(user_id, category_id)
-- 		on delete cascade,

-- 	constraint fk_transactions_payment_methods
-- 		foreign key (user_id, payment_method_id)
-- 		references public.payment_methods(user_id, payment_method_id)
-- 		on delete cascade,

-- 	constraint fk_transactions_wallets
-- 		foreign key (user_id, wallet_id)
-- 		references public.wallets(user_id, wallet_id)
-- 		on delete cascade,

-- 	constraint chk_transactions_amount_positive check (amount > 0)
-- );

-- insert into transactions(
-- 	user_id, category_id, payment_method_id, wallet_id,
-- 	transaction_type, occured_at, amount
-- ) values
-- (
-- 	1, 1, 1, 1, 'Income','2025-09-22 00:05:47.391999+07', 50
-- ),
-- (
--     2, 2, 2, 2, 'Income','2025-09-22 00:05:47.391999+07', 200
-- );

-- select * from transactions;

-- --- Database and User Setup ---
CREATE DATABASE saladpirate_db;
CREATE USER saladpirate_user WITH PASSWORD 'saladpirate_pass';
GRANT ALL PRIVILEGES ON DATABASE saladpirate_db TO saladpirate_user;

-- --- Connect to the new database as the new user ---
-- (You may need to run this command manually in psql)
\c saladpirate_db saladpirate_user

-- --- Table: users ---
CREATE TABLE IF NOT EXISTS public.users(
    user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

INSERT INTO users (email, password_hash, display_name) VALUES
(
    'alice@example.com', 'alicethymefield', 'Alice'
),
(
    'yuzuha@example.com', 'ukinamiyuzuha', 'yuzuha'
);

SELECT * FROM users;

-- --- Table: categories ---
CREATE TABLE IF NOT EXISTS public.categories(
    category_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    category_name VARCHAR(255) NOT NULL,
    category_type VARCHAR(15) NOT NULL,
    color_hex VARCHAR(7) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Prevent same category name in the same user
    UNIQUE (user_id, category_name),
    CONSTRAINT uniques_categories_user_pair UNIQUE(user_id, category_id)
);

INSERT INTO categories (user_id, category_name, category_type, color_hex) VALUES
(
    1,'Food', 'Income','#000000'
),
(
    2,'Game', 'Expense','#000000'
);

SELECT * FROM categories;

-- --- Table: payment_methods ---
CREATE TABLE IF NOT EXISTS public.payment_methods(
    payment_method_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    payment_method_name VARCHAR(255) NOT NULL,
    color_hex VARCHAR(7) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Prevent same payment method name in the same user
    UNIQUE (user_id, payment_method_name),
    CONSTRAINT unique_payment_methods_user_pair UNIQUE(user_id, payment_method_id)
);

INSERT INTO payment_methods (user_id, payment_method_name, color_hex) VALUES
(
    1,'Cash','#000000'
),
(
    2,'Visa', '#000000'
);

SELECT * FROM payment_methods;

-- --- Table: wallets ---
CREATE TABLE IF NOT EXISTS public.wallets(
    wallet_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    wallet_name VARCHAR(255) NOT NULL,
    starting_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
    wallet_type VARCHAR(255) NOT NULL,
    color_hex VARCHAR(7) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Prevent same wallet name in the same user
    UNIQUE (user_id, wallet_name),
    CONSTRAINT unique_wallets_user_pair UNIQUE(user_id, wallet_id)
);

INSERT INTO wallets(user_id, wallet_name, wallet_type, color_hex) VALUES
(
    1,'Wallet_1','Cash', '#000000'
),
(
    2,'first_wallet','Savings', '#000000'
);

SELECT * FROM wallets;

-- --- Table: transactions (Updated Version) ---
CREATE TABLE IF NOT EXISTS public.transactions(
    transaction_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL REFERENCES public.users(user_id),

    category_id INT NOT NULL,
    payment_method_id INT NOT NULL,
    wallet_id INT NOT NULL,

    amount NUMERIC(12,2) NOT NULL,
    transaction_type VARCHAR(15) NOT NULL 
        CHECK(transaction_type IN ('Income', 'Expense')),
    
    occured_at TIMESTAMPTZ NOT NULL,
    transaction_location VARCHAR(255),
    latitude DOUBLE PRECISION,  -- Added column
    longitude DOUBLE PRECISION, -- Added column
    note VARCHAR(255),

    -- Prevent user use category, payment_method, wallet form other user
    CONSTRAINT fk_transactions_categories
        FOREIGN KEY (user_id, category_id)
        REFERENCES public.categories(user_id, category_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_transactions_payment_methods
        FOREIGN KEY (user_id, payment_method_id)
        REFERENCES public.payment_methods(user_id, payment_method_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_transactions_wallets
        FOREIGN KEY (user_id, wallet_id)
        REFERENCES public.wallets(user_id, wallet_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_transactions_amount_positive CHECK (amount > 0)
);

-- Updated INSERT statement with latitude and longitude
INSERT INTO transactions(
    user_id, category_id, payment_method_id, wallet_id,
    transaction_type, occured_at, amount, latitude, longitude
) VALUES
(
    1, 1, 1, 1, 'Income','2025-09-22 00:05:47.391999+07', 50, 13.7462, 100.5347
),
(
    2, 2, 2, 2, 'Income','2025-09-22 00:05:47.391999+07', 200, 13.7371, 100.5606
);

SELECT * FROM transactions;