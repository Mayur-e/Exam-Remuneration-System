# Database Setup & Seeding

This directory contains the final SQL scripts required to set up the ERMS database on a new PC or server.

## Files
- `01_schema.sql`: Contains the complete structure of all tables, views, triggers, and foreign key constraints.
- `02_seed_data.sql`: Contains essential configuration data such as remuneration rates, batch sizes, staff roles, and the initial admin user account.

## How to Set Up the Database on a New PC

1. **Create the Database:**
   First, create a new PostgreSQL database called `ERMS`. You can do this via pgAdmin or the command line:
   ```bash
   psql -U postgres -c "CREATE DATABASE \"ERMS\";"
   ```

2. **Run the Schema Script:**
   Apply the table structures and constraints:
   ```bash
   psql -U postgres -d ERMS -f 01_schema.sql
   ```

3. **Run the Seed Data Script:**
   Insert the mandatory configuration data and admin user:
   ```bash
   psql -U postgres -d ERMS -f 02_seed_data.sql
   ```

## Initial Login
The `02_seed_data.sql` script creates the default admin user. Use these credentials to log into the frontend for the first time:
- **Email/Username**: (The admin email you used locally)
- **Password**: (The admin password you used locally)

Once logged in, the admin can begin uploading the faculty directory via Excel and the system is ready to use.
