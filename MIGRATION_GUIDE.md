# WordPress-Style Database Migration Guide

## Overview

Database Anda telah direstrukturisasi dari banyak tabel terpisah menjadi arsitektur WordPress-style dengan:

- **1 tabel utama (Post)** untuk semua konten (Project, TaskColumn, Task, ChecklistItem)
- **1 tabel metadata (PostMeta)** untuk data fleksibel (labels, attachments, assignee, dll)
- **1 tabel terpisah (CommentTask)** untuk komentar

## Model Baru

### Post Model

Menggantikan: `Project`, `TaskColumn`, `Task`, `ChecklistItem`

```java
// Membuat Project
Post project = new Post();
project.setPostType("project");
project.setPostTitle("My Project");
project.setPostContent("Project description");
project.setPostContentType("text");
project.setAuthorId(userId);
postService.createPost(project);

// Membuat TaskColumn
Post column = new Post();
column.setPostType("column");
column.setPostTitle("To Do");
column.setPostParent(projectId);
column.setPostOrder(0);
postService.createPost(column);

// Membuat Task
Post task = new Post();
task.setPostType("task");
task.setPostTitle("Task Title");
task.setPostContent("{\"description\":\"Task details\"}");
task.setPostContentType("json");
task.setPostParent(columnId);
task.setPostOrder(0);
postService.createPost(task);

// Membuat ChecklistItem
Post checklistItem = new Post();
checklistItem.setPostType("checklist_item");
checklistItem.setPostTitle("Checklist item text");
checklistItem.setPostContent("{\"completed\":false}");
checklistItem.setPostContentType("json");
checklistItem.setPostParent(taskId);
postService.createPost(checklistItem);
```

### PostMeta Model

Untuk metadata fleksibel seperti labels, attachments, assignee, dll.

```java
// Menambah label ke task
postService.addLabel(taskId, "urgent");
postService.addLabel(taskId, "bug");

// Set assignee
postService.setAssignee(taskId, assigneeUserId);

// Set due date
postService.setDueDate(taskId, LocalDateTime.now().plusDays(7));

// Add attachment
postService.addAttachment(taskId, "/uploads/file.pdf");

// Set cover image
postService.setCoverImage(taskId, "/uploads/cover.jpg");

// Get metadata
List<String> labels = postService.getLabels(taskId);
Optional<UUID> assignee = postService.getAssignee(taskId);
Optional<LocalDateTime> dueDate = postService.getDueDate(taskId);
List<String> attachments = postService.getAttachments(taskId);
Optional<String> coverImage = postService.getCoverImage(taskId);
```

## PostService Methods

### CRUD Operations

```java
// Create
Post post = postService.createPost(newPost);

// Read
Optional<Post> post = postService.getPostById(postId);
List<Post> posts = postService.getAllPosts();

// Update
post.setPostTitle("Updated Title");
postService.updatePost(post);

// Delete (cascade - deletes children and metadata)
postService.deletePost(postId);
```

### Query by Type

```java
// Get all projects
List<Post> projects = postService.getProjects();

// Get columns by project
List<Post> columns = postService.getColumnsByProject(projectId);

// Get tasks by column
List<Post> tasks = postService.getTasksByColumn(columnId);

// Get checklist items by task
List<Post> items = postService.getChecklistItemsByTask(taskId);
```

### Metadata Operations

```java
// Add metadata
PostMeta meta = postService.addMeta(postId, "custom_field", "value", "string");

// Get all metadata for a post
List<PostMeta> allMeta = postService.getMeta(postId);

// Get specific metadata
Optional<PostMeta> meta = postService.getMetaByKey(postId, "custom_field");

// Update metadata
postService.updateMeta(postId, "custom_field", "new value");

// Delete metadata
postService.deleteMeta(postId, "custom_field");
```

### Ordering

```java
// Update order
postService.updatePostOrder(postId, 5);

// Reorder multiple posts
List<UUID> orderedIds = Arrays.asList(id1, id2, id3);
postService.reorderPosts(orderedIds);
```

## Database Schema

### Post Table

```sql
CREATE TABLE post (
    id UUID PRIMARY KEY,
    post_type VARCHAR(50) NOT NULL,  -- 'project', 'task', 'column', 'checklist_item'
    post_title VARCHAR(255),
    post_content TEXT,
    post_content_type VARCHAR(20),   -- 'text', 'json', 'html', 'code'
    post_status VARCHAR(20),         -- 'publish', 'draft', 'trash'
    post_parent UUID,
    post_order INTEGER,
    author_id UUID,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### PostMeta Table

```sql
CREATE TABLE post_meta (
    id UUID PRIMARY KEY,
    post_id UUID NOT NULL,
    meta_key VARCHAR(255) NOT NULL,
    meta_value TEXT,
    meta_type VARCHAR(20)  -- 'string', 'json', 'date', 'uuid', 'number'
);
```

### CommentTask Table

```sql
CREATE TABLE comment (
    id UUID PRIMARY KEY,
    post_id UUID NOT NULL,  -- Changed from task_id
    text TEXT,
    author_id UUID,
    created_at TIMESTAMP
);
```

## Migration Notes

### Old vs New Structure

**OLD:**

- Tabel terpisah: `project`, `task_column`, `task`, `checklist_item`
- Data tersebar di banyak tabel
- Sulit menambah tipe konten baru

**NEW:**

- 1 tabel: `post` (untuk semua konten)
- Metadata fleksibel di `post_meta`
- Mudah extend dengan post type baru

### Keuntungan

1. **Simplified Schema**: Hanya 3 tabel utama
2. **Flexibility**: Tambah tipe konten tanpa ALTER TABLE
3. **Extensibility**: Custom fields via metadata
4. **Scalability**: Pattern yang proven (WordPress)
5. **Maintainability**: Lebih sedikit kode untuk maintain

### Cara Menggunakan dengan Frontend

Frontend masih bisa menggunakan `ProjectService` yang existing untuk backward compatibility. Untuk fitur baru, gunakan `PostService` langsung:

```typescript
// Di TypeScript/Hilla
import { PostService } from 'Frontend/generated/endpoints';

// Get projects
const projects = await PostService.getProjects();

// Get tasks
const tasks = await PostService.getTasksByColumn(columnId);

// Add label
await PostService.addLabel(taskId, 'urgent');
```

## Next Steps

1. **Test the new models**: Jalankan aplikasi dan test CRUD operations
2. **Update frontend**: Gradually migrate frontend to use PostService
3. **Data migration**: Jika ada data lama, buat migration script
4. **Remove old models**: Setelah yakin, hapus Task.java, TaskColumn.java, ChecklistItem.java

## Important Notes

- Model lama (`Task`, `TaskColumn`, `ChecklistItem`) masih ada untuk backward compatibility
- `ProjectService` sudah diupdate untuk compatibility dengan `CommentTask` model baru
- Anda bisa mulai menggunakan `PostService` untuk fitur baru
- Untuk migration data lama, buat script terpisah jika diperlukan
