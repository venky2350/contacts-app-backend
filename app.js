const express = require("express");
const { open } = require("sqlite");
require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const path = require("path");
const { body, query, validationResult } = require("express-validator");

const databasePath = path.join(__dirname, "contacts.db");
const app = express();
app.use(express.json());
let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({ filename: databasePath, driver: sqlite3.Database });
    await database.run(
      `CREATE TABLE IF NOT EXISTS contact (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    );
    app.listen(3000, () =>
      console.log("Server running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /contacts: Fetch all contacts, supports search by name or email
app.get("/contacts", async (req, res) => {
  try {
    const { search_q = "" } = req.query;
    const getContactsQuery = `
      SELECT * FROM contact
      WHERE name LIKE '%${search_q}%'
      OR email LIKE '%${search_q}%';
    `;
    const contacts = await database.all(getContactsQuery);
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /contacts/:id: Fetch a specific contact
app.get("/contacts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const contact = await database.get(
      `SELECT * FROM contact WHERE id = ?;`,
      id
    );
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /contacts: Create a new contact
app.post(
  "/contacts",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("phone")
      .matches(/^\d{10}$/)
      .withMessage("Phone must be a 10-digit number"),
    body("address").optional().isString(),
  ],
  handleValidationErrors,
  async (req, res) => {
    const { name, email, phone, address } = req.body;
    try {
      const postContactQuery = `
        INSERT INTO contact (name, email, phone, address)
        VALUES (?, ?, ?, ?);
      `;
      await database.run(postContactQuery, [name, email, phone, address]);
      res.status(201).json({ message: "Contact successfully added" });
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT") {
        res.status(400).json({ error: "Email must be unique" });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }
);

// PUT /contacts/:id: Update a contact
app.put(
  "/contacts/:id",
  [
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("email").optional().isEmail().withMessage("Invalid email format"),
    body("phone")
      .optional()
      .matches(/^\d{10}$/)
      .withMessage("Phone must be a 10-digit number"),
    body("address").optional().isString(),
  ],
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;
    try {
      const contact = await database.get(
        `SELECT * FROM contact WHERE id = ?;`,
        id
      );
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      const updateContactQuery = `
        UPDATE contact
        SET 
          name = COALESCE(?, name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address)
        WHERE id = ?;
      `;
      await database.run(updateContactQuery, [name, email, phone, address, id]);
      res.status(200).json({ message: "Contact updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// DELETE /contacts/:id: Delete a contact
app.delete("/contacts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const contact = await database.get(
      `SELECT * FROM contact WHERE id = ?;`,
      id
    );
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    await database.run(`DELETE FROM contact WHERE id = ?;`, id);
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = app;
