## UPSA Connect Admin

This app manages UPSA Connect content uploads:

- Departments
- Programs
- Classes
- Courses
- Slides/notes/images
- Posts/news

All records are tagged with department, program, class, year, and semester.

## Setup

1. Install dependencies and start dev server:

```bash
pnpm install
pnpm dev
```

2. Optional: create `.env.local` to override defaults:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The admin app already defaults to the same Supabase project keys used by the mobile app.

3. Run the SQL in `../UPSA-Connect/supabase/schema_and_seed.sql` to create:

- `student_profiles`
- `department_catalog`
- `program_catalog`
- `class_catalog`
- `course_catalog`
- `learning_materials`
- `campus_posts`
- storage buckets `course-materials` and `news-media`

## Main Files

- `app/page.tsx`: Admin dashboard UI (departments/programs/classes/courses/materials/posts)
- `lib/supabase.ts`: Supabase client

## Notes

- Upload paths are grouped as `year/semester/department/program/class/...`.
- Use authenticated Supabase users with insert permissions for admin uploads.
