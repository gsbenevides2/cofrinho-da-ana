import { SQL } from "bun";

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: Date;
}

export class Database {
  static instance: Database = new Database();
  static getInstance(): Database {
    return Database.instance;
  }
  private constructor() {
    if (Database.instance) {
      throw new Error(
        "Use Database.getInstance() to get the singleton instance.",
      );
    }
  }

  migrationsApplied = false;
  con: SQL | null = null;

  private async getDatabaseConnection() {
    const connectionString = Bun.env.DATABASE_URL;
    if (this.con) {
      return this.con;
    }
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set.");
    }
    const con = new SQL(connectionString);
    this.con = con;
    if (!this.migrationsApplied) {
      await this.applyMigrations(con);
    }
    return con;
  }

  async applyMigrations(db: SQL) {
    await db`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await db`CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        description TEXT NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`;

    this.migrationsApplied = true;
  }

  async getTransactions(
    limit: number = 10,
    offset: number = 0,
  ): Promise<Transaction[]> {
    const db = await this.getDatabaseConnection();
    const result = await db<
      Transaction[]
    >`SELECT * FROM transactions ORDER BY date DESC LIMIT ${limit} OFFSET ${offset}`;
    return result;
  }

  private closeConnection() {
    if (this.con) {
      this.con.close();
      this.con = null;
    }
  }

  async getTotalTransactions(): Promise<number> {
    const db = await this.getDatabaseConnection();
    const result = await db<{ count: number }[]>`
      SELECT COUNT(*) as count FROM transactions
    `;
    await this.closeConnection();
    return Number(result[0]?.count || 0);
  }

  async getBalance(): Promise<number> {
    const db = await this.getDatabaseConnection();
    const result = await db<{ balance: number }[]>`
      SELECT COALESCE(SUM(amount), 0) AS balance FROM transactions
    `;
    await this.closeConnection();
    return Number(result[0]?.balance || 0);
  }

  async addTransaction(
    description: string,
    amount: number,
  ): Promise<Transaction> {
    const db = await this.getDatabaseConnection();
    const result = await db<Transaction[]>`
      INSERT INTO transactions (description, amount)
      VALUES (${description}, ${amount})
      RETURNING *
    `;
    await this.closeConnection();
    return result[0];
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const db = await this.getDatabaseConnection();
    await db`DELETE FROM transactions WHERE id = ${id}`;
    await this.closeConnection();
    return true;
  }
}
