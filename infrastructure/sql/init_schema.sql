-- Initial database schema for Farm Animal Tracker
-- This script creates the core tables for the application

-- Create animals table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='animals' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[animals] (
        [id] int NOT NULL IDENTITY(1,1),
        [tagNumber] nvarchar(450) NOT NULL,  -- Reduced size for unique index
        [type] nvarchar(50) NOT NULL,
        [motherId] int,
        [birthDate] datetime2,
        [createdAt] datetime2 NOT NULL CONSTRAINT [DF_animals_createdAt] DEFAULT CURRENT_TIMESTAMP,
        [updatedAt] datetime2 NOT NULL CONSTRAINT [DF_animals_updatedAt] DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT [PK_animals] PRIMARY KEY CLUSTERED ([id]),
        CONSTRAINT [UQ_animals_tagNumber] UNIQUE NONCLUSTERED ([tagNumber])
    );
    
    -- Add self-referential foreign key after table creation
    ALTER TABLE [dbo].[animals] 
    ADD CONSTRAINT [FK_animals_motherId] FOREIGN KEY ([motherId]) 
    REFERENCES [dbo].[animals] ([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
    
    PRINT 'Created animals table';
END
ELSE
BEGIN
    PRINT 'Animals table already exists, skipping...';
END

-- Create weight_records table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='weight_records' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[weight_records] (
        [id] int NOT NULL IDENTITY(1,1),
        [animalId] int NOT NULL,
        [weight] decimal(5,2) NOT NULL,
        [recordedAt] datetime2 NOT NULL CONSTRAINT [DF_weight_records_recordedAt] DEFAULT CURRENT_TIMESTAMP,
        [notes] nvarchar(1000),
        CONSTRAINT [PK_weight_records] PRIMARY KEY CLUSTERED ([id]),
        CONSTRAINT [FK_weight_records_animalId] FOREIGN KEY ([animalId]) 
        REFERENCES [dbo].[animals] ([id]) ON DELETE CASCADE ON UPDATE CASCADE
    );
    
    PRINT 'Created weight_records table';
END
ELSE
BEGIN
    PRINT 'Weight_records table already exists, skipping...';
END

-- Create feed_records table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='feed_records' AND xtype='U')
BEGIN
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
    
    PRINT 'Created feed_records table';
END
ELSE
BEGIN
    PRINT 'Feed_records table already exists, skipping...';
END

-- Create indexes for performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_weight_records_animalId')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_weight_records_animalId] ON [dbo].[weight_records] ([animalId]);
    PRINT 'Created index IX_weight_records_animalId';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_feed_records_animalId')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_feed_records_animalId] ON [dbo].[feed_records] ([animalId]);
    PRINT 'Created index IX_feed_records_animalId';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_animals_motherId')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_animals_motherId] ON [dbo].[animals] ([motherId]);
    PRINT 'Created index IX_animals_motherId';
END

-- Create triggers for updatedAt timestamp
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_animals_updatedAt')
BEGIN
    EXEC('
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
    END
    ');
    PRINT 'Created trigger TR_animals_updatedAt';
END

PRINT 'Database schema initialization completed successfully!';