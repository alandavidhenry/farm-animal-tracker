-- Manual Database Setup Script for Farm Animal Tracker
-- Use this script if Terraform/Prisma deployment fails
-- Run this against your Azure SQL Database using SQL Server Management Studio or sqlcmd

-- Instructions:
-- 1. Connect to your Azure SQL Database: sql-farm-animal-tracker-dev.database.windows.net
-- 2. Use database: sqldb-farm-animal-tracker-dev
-- 3. Run this entire script

USE [sqldb-farm-animal-tracker-dev];
GO

PRINT '🚀 Starting manual database setup for Farm Animal Tracker...';

-- Drop existing tables if they exist (uncomment if you need to recreate)
/*
DROP TABLE IF EXISTS [dbo].[feed_records];
DROP TABLE IF EXISTS [dbo].[weight_records];
DROP TABLE IF EXISTS [dbo].[animals];
DROP TABLE IF EXISTS [dbo].[_prisma_migrations];
PRINT '🗑️  Dropped existing tables';
*/

-- Create animals table
CREATE TABLE [dbo].[animals] (
    [id] int NOT NULL IDENTITY(1,1),
    [tagNumber] nvarchar(450) NOT NULL,
    [type] nvarchar(50) NOT NULL,
    [motherId] int NULL,
    [birthDate] datetime2 NULL,
    [createdAt] datetime2 NOT NULL CONSTRAINT [DF_animals_createdAt] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] datetime2 NOT NULL CONSTRAINT [DF_animals_updatedAt] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PK_animals] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UQ_animals_tagNumber] UNIQUE NONCLUSTERED ([tagNumber])
);

-- Add self-referential foreign key
ALTER TABLE [dbo].[animals] 
ADD CONSTRAINT [FK_animals_motherId] FOREIGN KEY ([motherId]) 
REFERENCES [dbo].[animals] ([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

PRINT '✅ Created animals table with self-referential foreign key';

-- Create weight_records table
CREATE TABLE [dbo].[weight_records] (
    [id] int NOT NULL IDENTITY(1,1),
    [animalId] int NOT NULL,
    [weight] decimal(5,2) NOT NULL,
    [recordedAt] datetime2 NOT NULL CONSTRAINT [DF_weight_records_recordedAt] DEFAULT CURRENT_TIMESTAMP,
    [notes] nvarchar(1000) NULL,
    CONSTRAINT [PK_weight_records] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [FK_weight_records_animalId] FOREIGN KEY ([animalId]) 
    REFERENCES [dbo].[animals] ([id]) ON DELETE CASCADE ON UPDATE CASCADE
);

PRINT '✅ Created weight_records table';

-- Create feed_records table
CREATE TABLE [dbo].[feed_records] (
    [id] int NOT NULL IDENTITY(1,1),
    [animalId] int NOT NULL,
    [feedType] nvarchar(100) NOT NULL,
    [amount] decimal(5,2) NOT NULL,
    [feedDate] datetime2 NOT NULL,
    CONSTRAINT [PK_feed_records] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [FK_feed_records_animalId] FOREIGN KEY ([animalId]) 
    REFERENCES [dbo].[animals] ([id]) ON DELETE CASCADE ON UPDATE CASCADE
);

PRINT '✅ Created feed_records table';

-- Create performance indexes
CREATE NONCLUSTERED INDEX [IX_weight_records_animalId] ON [dbo].[weight_records] ([animalId]);
CREATE NONCLUSTERED INDEX [IX_feed_records_animalId] ON [dbo].[feed_records] ([animalId]);
CREATE NONCLUSTERED INDEX [IX_animals_motherId] ON [dbo].[animals] ([motherId]);

PRINT '✅ Created performance indexes';

-- Create trigger for updatedAt timestamp
CREATE TRIGGER [dbo].[TR_animals_updatedAt] 
ON [dbo].[animals]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[animals] 
    SET [updatedAt] = CURRENT_TIMESTAMP 
    FROM [dbo].[animals] a
    INNER JOIN inserted i ON a.id = i.id;
END;

PRINT '✅ Created updatedAt trigger for animals table';

-- Create Prisma migration tracking table
CREATE TABLE [dbo].[_prisma_migrations] (
    [id] nvarchar(36) NOT NULL,
    [checksum] nvarchar(64) NOT NULL,
    [finished_at] datetime2 NULL,
    [migration_name] nvarchar(255) NOT NULL,
    [logs] nvarchar(max) NULL,
    [rolled_back_at] datetime2 NULL,
    [started_at] datetime2 NOT NULL CONSTRAINT [DF__prisma_migrations_started_at] DEFAULT CURRENT_TIMESTAMP,
    [applied_steps_count] int NOT NULL CONSTRAINT [DF__prisma_migrations_applied_steps_count] DEFAULT 0,
    CONSTRAINT [PK__prisma_migrations] PRIMARY KEY CLUSTERED ([id])
);

-- Insert initial migration record
INSERT INTO [dbo].[_prisma_migrations] ([id], [checksum], [finished_at], [migration_name], [logs], [applied_steps_count])
VALUES (
    NEWID(),
    '0000000000000000000000000000000000000000000000000000000000000000',
    CURRENT_TIMESTAMP,
    '00000000000000_init',
    'Manual database setup',
    1
);

PRINT '✅ Created Prisma migration tracking table';

-- Insert sample data (optional - uncomment if needed)
/*
INSERT INTO [dbo].[animals] ([tagNumber], [type], [birthDate]) VALUES
('001', 'SHEEP', '2024-01-15'),
('002', 'LAMB', '2024-03-10'),
('003', 'GOAT', '2023-12-05');

INSERT INTO [dbo].[weight_records] ([animalId], [weight], [notes]) VALUES
(1, 75.50, 'Healthy weight'),
(2, 25.25, 'Growing well'),
(3, 45.75, 'Good condition');

PRINT '✅ Inserted sample data';
*/

-- Verify table creation
SELECT 
    t.name AS TableName,
    c.column_count AS ColumnCount
FROM sys.tables t
CROSS APPLY (
    SELECT COUNT(*) as column_count 
    FROM sys.columns 
    WHERE object_id = t.object_id
) c
WHERE t.name IN ('animals', 'weight_records', 'feed_records', '_prisma_migrations')
ORDER BY t.name;

PRINT '🎉 Manual database setup completed successfully!';
PRINT '📋 Summary: Created 4 tables with proper relationships, indexes, and triggers';
PRINT '🔗 Tables: animals, weight_records, feed_records, _prisma_migrations';

GO