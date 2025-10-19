# Databases in Known

Known includes a powerful database feature inspired by Notion, allowing you to organize and visualize your data in multiple ways.

## What are Databases?

Databases in Known are structured collections of data that can be displayed in different views. Each database consists of:

- **Properties**: Columns that define the type of data (text, number, date, select, etc.)
- **Rows**: Individual entries in your database
- **Views**: Different ways to visualize and filter your data

## Creating a Database

There are two ways to create a database:

### 1. Using Slash Commands

1. In any page, type `/` to open the slash menu
2. Type "database" or scroll to find the "📊 Database" option
3. Press Enter to insert a new database

### 2. From the Block Menu

1. Click the `+` button in the editor
2. Select "Database" from the menu

## Property Types

Known supports various property types to organize your data:

| Property Type | Description | Example Use Case |
|--------------|-------------|------------------|
| **Text** | Single line of text | Names, titles, descriptions |
| **Number** | Numeric values | Prices, quantities, scores |
| **Select** | Single choice from predefined options | Status, priority, category |
| **Multi-select** | Multiple choices from predefined options | Tags, labels |
| **Date** | Date picker | Deadlines, birthdays, events |
| **Checkbox** | True/false toggle | Completed, active, published |
| **URL** | Web link | Website, documentation |
| **Email** | Email address | Contact information |
| **Phone** | Phone number | Contact information |

## Managing Properties

### Adding a Property

1. Click the "+ Add Property" button in the database toolbar
2. Enter the property name
3. Select the property type from the dropdown
4. Click "Add"

### Editing a Property

1. Click on the property header
2. The name becomes editable - type to rename
3. Press Enter or click outside to save

### Deleting a Property

1. Click the `⋮` menu button on the property header
2. Select "🗑️ Delete"
3. Confirm the deletion

## Working with Rows

### Adding Rows

Click the "+ New Row" button at the bottom of the table to add a new entry.

### Editing Cells

Click on any cell to edit its value. The editing experience depends on the property type:

- **Text/Number/URL/Email/Phone**: Click and type directly
- **Date**: Click to open the date picker
- **Checkbox**: Click to toggle
- **Select/Multi-select**: Click to open the dropdown menu

### Deleting Rows

Click the 🗑️ button on the right side of any row to delete it.

## Views

Views allow you to see your data in different ways. Each view can have its own filters, sorts, and visible properties.

### Available View Types

- **Table** ✅ (Currently available)
- **Board** 🚧 (Coming soon - Kanban-style)
- **List** 🚧 (Coming soon)
- **Calendar** 🚧 (Coming soon)
- **Gallery** 🚧 (Coming soon)

### Creating a View

1. Click "+ Add View" in the views toolbar
2. Enter a name for your view
3. The new view will be created with default settings

### Switching Views

Click on any view tab to switch between different views of your data.

## Filtering Data

Filters allow you to show only rows that match certain criteria.

### Adding a Filter

1. Click on a property header's `⋮` menu
2. The filter options will appear based on the property type
3. Select your filter criteria

### Available Filter Operators

Different property types support different filter operators:

**Text Properties:**
- Equals / Not equals
- Contains / Not contains
- Starts with / Ends with
- Is empty / Is not empty

**Number Properties:**
- Equals / Not equals
- Greater than / Less than
- Greater than or equal / Less than or equal
- Is empty / Is not empty

**Date Properties:**
- Equals
- Before / After
- Is empty / Is not empty

**Checkbox Properties:**
- Is checked / Is not checked

**Select Properties:**
- Equals / Not equals
- Contains / Not contains
- Is empty / Is not empty

## Sorting Data

Sorting allows you to order your rows by property values.

### Adding a Sort

1. Click on a property header's `⋮` menu
2. Select "↑ Sort Ascending" or "↓ Sort Descending"
3. The data will be sorted immediately

### Removing a Sort

1. Click on the property header's `⋮` menu
2. Select "✕ Clear Sort"

### Multiple Sorts

You can add multiple sorts. The data will be sorted by the first sort, then by the second sort for rows with equal values, and so on.

## Select Options

For Select and Multi-select properties, you can customize the available options.

### Default Options

When you create a Select or Multi-select property, it comes with three default options:
- Option 1 (Red)
- Option 2 (Teal)
- Option 3 (Blue)

### Customizing Options

Currently, options are created with the property. Future updates will allow:
- Adding new options
- Editing option names and colors
- Deleting options

## Tips and Best Practices

1. **Start Simple**: Begin with a few essential properties and add more as needed
2. **Use Meaningful Names**: Give your properties clear, descriptive names
3. **Choose the Right Type**: Select the appropriate property type for your data
4. **Create Multiple Views**: Use different views for different purposes (e.g., "All Tasks", "Completed", "High Priority")
5. **Combine Filters**: Use multiple filters to narrow down your data precisely
6. **Sort Strategically**: Sort by date for timelines, by priority for task lists, etc.

## Data Storage

All database data is stored locally in your browser using IndexedDB. This means:

- ✅ Your data is private and stays on your device
- ✅ No internet connection required
- ✅ Fast performance
- ⚠️ Data is tied to your browser - clearing browser data will delete your databases
- ⚠️ Data is not synced across devices (yet)

## Exporting Data

Currently, database data is stored within the page content. Future updates will include:
- Export to CSV
- Export to JSON
- Import from CSV/JSON
- Backup and restore functionality

## Roadmap

Upcoming features for databases:

- [ ] Board view (Kanban)
- [ ] List view
- [ ] Calendar view
- [ ] Gallery view
- [ ] Customizable select options
- [ ] Relations between databases
- [ ] Formulas and calculations
- [ ] Rollups and aggregations
- [ ] Database templates
- [ ] CSV import/export
- [ ] Advanced filtering (AND/OR logic)
- [ ] Grouping
- [ ] Database-level permissions

## Troubleshooting

### Database not saving

Make sure you're not in private/incognito mode, as IndexedDB may be restricted.

### Data disappeared

Check if you've cleared your browser data. Database data is stored in IndexedDB and will be deleted if you clear site data.

### Performance issues

If you have a very large database (1000+ rows), performance may degrade. Consider splitting into multiple databases or using filters to show fewer rows at once.

## Need Help?

If you encounter issues or have questions:

1. Check the [GitHub Issues](https://github.com/Eric-Hei/known/issues)
2. Open a new issue with details about your problem
3. Include your browser version and any error messages

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-19

