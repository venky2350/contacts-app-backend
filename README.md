# Contact Management Application Backend

## Project Overview

This is a Contact Management Application built using **Node.js** and **Express.js**. The backend provides RESTful API endpoints to perform basic CRUD operations for contact management, ensuring data validation, error handling, and following clean code practices.

---

## Database Structure

### Contacts Table

| Column     | Type    |
| ---------- | ------- |
| id         | INTEGER |
| name       | TEXT    |
| email      | TEXT    |
| phone      | TEXT    |
| address    | TEXT    |
| created_at | TEXT    |

---

## API Endpoints

### 1. **GET /contacts/**

#### Description:

Returns a list of all contacts.

#### Sample Response:

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "9876543210",
    "address": "123 Main St, City",
    "created_at": "2025-02-08"
  },
  ...
]

2. POST /contacts/
Description:
Create a new contact.

Request:
json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "phone": "1234567890",
  "address": "456 Elm St, City"
}
Response:
Contact Successfully Added
3. GET /contacts/:id
Description:
Fetch a specific contact by ID.

Sample Response:
json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "9876543210",
  "address": "123 Main St, City",
  "created_at": "2025-02-08"
}
4. PUT /contacts/:id
Description:
Update contact details.

Request:
json
{
  "email": "updated.email@example.com"
}
Response:
Contact Updated
5. DELETE /contacts/:id
Description:
Delete a contact by ID.

Response:
Contact Deleted
Features
Search Contacts: Use query parameters to search by name, email, or phone number (/contacts?search=name).
Advanced Validation: Ensures valid email format and correct phone number pattern using express-validator.
Error Handling: Handles scenarios like invalid input, missing fields, and contact not found.
Clean Code Practices: Well-structured codebase with modular functions.
Setup Instructions
Clone this repository:

bash
git clone <repository-url>
cd contact-management-app
Install dependencies:

bash
npm install
Start the server:

bash
node app.js
The server will run at http://localhost:3000/.

Dependencies
express
sqlite3
express-validator
Unit Tests
Unit tests are written using Jest. To run the tests, use:

bash
npm test
Version Control
This project demonstrates version control through Git, ensuring consistent collaboration and version management.

License
This project is licensed under the MIT License.



```
