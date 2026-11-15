-- CreateTable
CREATE TABLE "OpeningHour" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "days" TEXT NOT NULL,
    "hours" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);
