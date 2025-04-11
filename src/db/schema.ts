import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const Users = pgTable("Users", {
    id: serial("id").primaryKey(),
    firstname: varchar("firstname", { length: 255 }).notNull(),
    lastname: varchar("lastname", { length: 255 }),
    email: varchar("email", { length: 255 }).unique('user-email-unique'),
});
