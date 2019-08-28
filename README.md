# 极简node-server

## 如何开始

```sql
create database mydb;
\c mydb;
create table if not exists "user" (
    id serial primary key not null,
    username text unique not null,
    password text,
    ctime timestamptz default now(),
    mtime timestamptz default now()
);
insert into "user"(username, password ) VALUES('xjp', '1234');
```

```bash
yarn 
node-dev server
```
