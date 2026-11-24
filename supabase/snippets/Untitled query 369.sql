INSERT INTO "User" ("Id", "username", "First Name", "Last Name", "password", "Role")
VALUES (
  gen_random_uuid(),
  'YS-2024-0001',
  'HR',
  'Test',
  '$2b$10$5dpa4ID4fTgtjPSQqIlWMuwbPGe0f8wBJpPMuelaY2C2ToC9FcqJy',
  'HR'
);

-- Sets password to:  Password123
-- UPDATE "User"
-- SET password = '$2b$10$fkCYrEzBqz3n7l06H3yR.uC1YkTG7g0YtQjG0Mz9CzOX5l/0uhsYS'
-- WHERE username = 'YS-2024-0042';
