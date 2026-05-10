'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { BookOpen, Search, Plus, ChevronDown, ChevronRight, Clock, CheckCircle2, Circle, Trash2, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { Course, CourseModule, Lesson } from '@/lib/types'
import type { LessonSearchResult } from '@/lib/pinecone'
import {
  getCourses,
  getCourseWithModules,
  getLessonProgress,
  markLessonComplete,
  markLessonIncomplete,
  createCourse,
  deleteCourse,
  createModule,
  createLesson,
  deleteLesson,
} from '@/app/actions/classroom'

const ADMIN_EMAILS = ['bugra@bugrakarsli.com', 'bugra@xeref.ai']

interface Props {
  userEmail: string
  userId: string
}

type View = { type: 'browse' } | { type: 'course'; courseId: string } | { type: 'lesson'; lesson: Lesson; courseId: string; moduleTitle: string; courseTitle: string }

export function ClassroomView({ userEmail, userId }: Props) {
  const isAdmin = ADMIN_EMAILS.includes(userEmail)
  const [view, setView] = useState<View>({ type: 'browse' })
  const [courses, setCourses] = useState<Course[]>([])
  const [courseDetail, setCourseDetail] = useState<{ course: Course; modules: (CourseModule & { lessons: Lesson[] })[] } | null>(null)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<LessonSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Admin form state
  const [newCourseTitle, setNewCourseTitle] = useState('')
  const [newCourseDesc, setNewCourseDesc] = useState('')
  const [showNewCourse, setShowNewCourse] = useState(false)
  const [newModuleTitle, setNewModuleTitle] = useState('')
  const [addingModuleTo, setAddingModuleTo] = useState<string | null>(null)
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null)
  const [newLessonTitle, setNewLessonTitle] = useState('')
  const [newLessonContent, setNewLessonContent] = useState('')
  const [newLessonDuration, setNewLessonDuration] = useState('')

  useEffect(() => {
    getCourses().then(setCourses).catch(() => {})
    getLessonProgress(userId).then((ids) => setCompletedIds(new Set(ids))).catch(() => {})
  }, [userId])

  useEffect(() => {
    if (view.type === 'course') {
      getCourseWithModules(view.courseId).then((d) => {
        setCourseDetail(d)
        setExpandedModules(new Set(d.modules.map((m) => m.id)))
      }).catch(() => {})
    }
  }, [view])

  // Debounced semantic search
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/classroom/search?q=${encodeURIComponent(searchQuery)}`)
        const json = await res.json() as { results: LessonSearchResult[] }
        setSearchResults(json.results)
      } catch { /* ignore */ } finally {
        setSearching(false)
      }
    }, 400)
    return () => clearTimeout(t)
  }, [searchQuery])

  const totalLessons = useCallback((modules: (CourseModule & { lessons: Lesson[] })[]) =>
    modules.reduce((acc, m) => acc + m.lessons.length, 0), [])

  const completedInCourse = useCallback((modules: (CourseModule & { lessons: Lesson[] })[]) =>
    modules.reduce((acc, m) => acc + m.lessons.filter((l) => completedIds.has(l.id)).length, 0), [completedIds])

  // ── Progress ring ──────────────────────────────────────────────────────────
  function ProgressRing({ done, total }: { done: number; total: number }) {
    const r = 16; const c = 2 * Math.PI * r
    const pct = total > 0 ? done / total : 0
    return (
      <svg width="40" height="40" className="shrink-0">
        <circle cx="20" cy="20" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
        <circle cx="20" cy="20" r={r} fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round" transform="rotate(-90 20 20)" />
        <text x="20" y="24" textAnchor="middle" fontSize="10" fill="hsl(var(--foreground))">{done}/{total}</text>
      </svg>
    )
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  function toggleLesson(lessonId: string) {
    const wasCompleted = completedIds.has(lessonId)
    const next = new Set(completedIds)
    if (wasCompleted) { next.delete(lessonId); setCompletedIds(next) } else { next.add(lessonId); setCompletedIds(next) }
    startTransition(async () => {
      try {
        if (wasCompleted) await markLessonIncomplete(lessonId)
        else await markLessonComplete(lessonId)
      } catch { toast.error('Failed to update progress') }
    })
  }

  async function handleCreateCourse() {
    if (!newCourseTitle.trim()) return
    try {
      const c = await createCourse({ title: newCourseTitle.trim(), description: newCourseDesc.trim() || null, cover_image_url: null })
      setCourses((prev) => [...prev, c])
      setNewCourseTitle(''); setNewCourseDesc(''); setShowNewCourse(false)
      toast.success('Course created')
    } catch { toast.error('Failed to create course') }
  }

  async function handleDeleteCourse(id: string) {
    try {
      await deleteCourse(id)
      setCourses((prev) => prev.filter((c) => c.id !== id))
      toast.success('Course deleted')
    } catch { toast.error('Failed to delete') }
  }

  async function handleAddModule(courseId: string) {
    if (!newModuleTitle.trim() || !courseDetail) return
    try {
      const m = await createModule(courseId, newModuleTitle.trim(), courseDetail.modules.length)
      setCourseDetail((prev) => prev ? { ...prev, modules: [...prev.modules, { ...m, lessons: [] }] } : prev)
      setExpandedModules((s) => new Set([...s, m.id]))
      setNewModuleTitle(''); setAddingModuleTo(null)
      toast.success('Module added')
    } catch { toast.error('Failed to add module') }
  }

  async function handleAddLesson(moduleId: string, courseId: string) {
    if (!newLessonTitle.trim() || !newLessonContent.trim() || !courseDetail) return
    const mod = courseDetail.modules.find((m) => m.id === moduleId)
    if (!mod) return
    try {
      const l = await createLesson(moduleId, courseId, {
        title: newLessonTitle.trim(),
        content: newLessonContent.trim(),
        duration_minutes: newLessonDuration ? parseInt(newLessonDuration) : null,
        order_index: mod.lessons.length,
      })
      setCourseDetail((prev) => prev ? {
        ...prev,
        modules: prev.modules.map((m) => m.id === moduleId ? { ...m, lessons: [...m.lessons, l] } : m),
      } : prev)
      setNewLessonTitle(''); setNewLessonContent(''); setNewLessonDuration(''); setAddingLessonTo(null)
      toast.success('Lesson added and indexed')
    } catch { toast.error('Failed to add lesson') }
  }

  async function handleDeleteLesson(lessonId: string, moduleId: string) {
    try {
      await deleteLesson(lessonId)
      setCourseDetail((prev) => prev ? {
        ...prev,
        modules: prev.modules.map((m) => m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m),
      } : prev)
      toast.success('Lesson deleted')
    } catch { toast.error('Failed to delete lesson') }
  }

  // ── Lesson reader ──────────────────────────────────────────────────────────
  if (view.type === 'lesson') {
    const { lesson, courseTitle, moduleTitle } = view
    const isComplete = completedIds.has(lesson.id)
    return (
      <section className="flex flex-col flex-1 p-6 md:p-8 max-w-4xl w-full mx-auto">
        <button
          onClick={() => setView({ type: 'course', courseId: view.courseId })}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {courseTitle} / {moduleTitle}
        </button>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{lesson.title}</h1>
            {lesson.duration_minutes && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />{lesson.duration_minutes} min
              </p>
            )}
          </div>
          <Button
            variant={isComplete ? 'outline' : 'default'}
            size="sm"
            onClick={() => toggleLesson(lesson.id)}
            disabled={isPending}
            className="shrink-0"
          >
            {isComplete ? <><CheckCircle2 className="h-4 w-4 mr-1.5 text-green-500" />Completed</> : 'Mark complete'}
          </Button>
        </div>

        <div className="prose prose-sm prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content}</ReactMarkdown>
        </div>
      </section>
    )
  }

  // ── Course detail ──────────────────────────────────────────────────────────
  if (view.type === 'course') {
    const courseId = view.courseId
    return (
      <section className="flex flex-col flex-1 p-6 md:p-8 max-w-4xl w-full mx-auto">
        <button
          onClick={() => setView({ type: 'browse' })}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> All Courses
        </button>

        {!courseDetail ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{courseDetail.course.title}</h1>
                {courseDetail.course.description && (
                  <p className="text-sm text-muted-foreground mt-1">{courseDetail.course.description}</p>
                )}
              </div>
              <ProgressRing done={completedInCourse(courseDetail.modules)} total={totalLessons(courseDetail.modules)} />
            </div>

            <div className="flex flex-col gap-3">
              {courseDetail.modules.map((mod) => (
                <div key={mod.id} className="rounded-xl border bg-card overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
                    onClick={() => setExpandedModules((s) => { const n = new Set(s); if (n.has(mod.id)) n.delete(mod.id); else n.add(mod.id); return n })}
                  >
                    <span className="text-sm font-semibold">{mod.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{mod.lessons.length} lessons</span>
                      {expandedModules.has(mod.id) ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {expandedModules.has(mod.id) && (
                    <div className="border-t divide-y">
                      {mod.lessons.map((lesson) => {
                        const done = completedIds.has(lesson.id)
                        return (
                          <div key={lesson.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 group transition-colors">
                            <button onClick={() => toggleLesson(lesson.id)} className="shrink-0">
                              {done
                                ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                                : <Circle className="h-4 w-4 text-muted-foreground" />}
                            </button>
                            <button
                              className="flex-1 text-left text-sm"
                              onClick={() => setView({ type: 'lesson', lesson, courseId, moduleTitle: mod.title, courseTitle: courseDetail.course.title })}
                            >
                              {lesson.title}
                            </button>
                            {lesson.duration_minutes && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                                <Clock className="h-3 w-3" />{lesson.duration_minutes}m
                              </span>
                            )}
                            {isAdmin && (
                              <button onClick={() => handleDeleteLesson(lesson.id, mod.id)} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                              </button>
                            )}
                          </div>
                        )
                      })}

                      {isAdmin && (
                        addingLessonTo === mod.id ? (
                          <div className="px-4 py-3 flex flex-col gap-2 bg-muted/30">
                            <Input placeholder="Lesson title" value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} className="h-8 text-sm" />
                            <textarea placeholder="Content (markdown)" value={newLessonContent} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewLessonContent(e.target.value)} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[120px] resize-y" />
                            <Input placeholder="Duration (minutes, optional)" value={newLessonDuration} onChange={(e) => setNewLessonDuration(e.target.value)} className="h-8 text-sm" type="number" />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleAddLesson(mod.id, courseId)}>Add Lesson</Button>
                              <Button size="sm" variant="ghost" onClick={() => setAddingLessonTo(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <button
                            className="w-full flex items-center gap-1.5 px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setAddingLessonTo(mod.id)}
                          >
                            <Plus className="h-3.5 w-3.5" /> Add lesson
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isAdmin && (
                addingModuleTo === courseId ? (
                  <div className="rounded-xl border bg-card px-4 py-3 flex flex-col gap-2">
                    <Input placeholder="Module title" value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} className="h-8 text-sm" />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAddModule(courseId)}>Add Module</Button>
                      <Button size="sm" variant="ghost" onClick={() => setAddingModuleTo(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                    onClick={() => setAddingModuleTo(courseId)}
                  >
                    <Plus className="h-4 w-4" /> Add module
                  </button>
                )
              )}
            </div>
          </>
        )}
      </section>
    )
  }

  // ── Browse mode ────────────────────────────────────────────────────────────
  const isSearching = searchQuery.length >= 2

  return (
    <section className="flex flex-col flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Classroom</h1>
          <p className="text-sm text-muted-foreground mt-1">Structured courses — learn at your own pace.</p>
        </div>
        {isAdmin && !showNewCourse && (
          <Button size="sm" onClick={() => setShowNewCourse(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> New Course
          </Button>
        )}
      </div>

      {/* Admin: new course form */}
      {isAdmin && showNewCourse && (
        <div className="rounded-xl border bg-card px-5 py-4 flex flex-col gap-3 mb-6">
          <Input placeholder="Course title" value={newCourseTitle} onChange={(e) => setNewCourseTitle(e.target.value)} />
          <Input placeholder="Description (optional)" value={newCourseDesc} onChange={(e) => setNewCourseDesc(e.target.value)} />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreateCourse}>Create</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowNewCourse(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-9"
          placeholder="Search lessons…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {/* Search results */}
      {isSearching && (
        <div className="rounded-xl border bg-card overflow-hidden mb-6">
          <div className="px-4 py-3 border-b">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Search Results</span>
          </div>
          {searchResults.length === 0 && !searching && (
            <p className="px-4 py-6 text-sm text-muted-foreground text-center">No matching lessons found.</p>
          )}
          {searchResults.map((r) => (
            <button
              key={r.lessonId}
              className="w-full flex flex-col items-start px-4 py-3 border-b last:border-0 hover:bg-muted/30 transition-colors text-left"
              onClick={async () => {
                const detail = await getCourseWithModules(r.courseId)
                const mod = detail.modules.find((m) => m.id === r.moduleId)
                const lesson = mod?.lessons.find((l) => l.id === r.lessonId)
                if (lesson && mod) {
                  setView({ type: 'lesson', lesson, courseId: r.courseId, moduleTitle: mod.title, courseTitle: detail.course.title })
                }
              }}
            >
              <span className="text-sm font-medium">{r.title}</span>
              <span className="text-xs text-muted-foreground mt-0.5">Relevance: {(r.score * 100).toFixed(0)}%</span>
            </button>
          ))}
        </div>
      )}

      {/* Course grid */}
      {!isSearching && (
        courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16 text-center rounded-xl border bg-card">
            <div className="rounded-full bg-muted p-4">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No courses yet</p>
            {isAdmin && <p className="text-xs text-muted-foreground">Click &ldquo;New Course&rdquo; to get started.</p>}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const mods = courseDetail?.course.id === course.id ? courseDetail.modules : []
              const done = completedInCourse(mods)
              const total = totalLessons(mods)
              return (
                <div
                  key={course.id}
                  className="relative group flex flex-col rounded-xl border bg-card p-5 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => setView({ type: 'course', courseId: course.id })}
                >
                  {isAdmin && (
                    <button
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id) }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    {total > 0 && <ProgressRing done={done} total={total} />}
                  </div>
                  <h3 className="text-sm font-semibold mb-1">{course.title}</h3>
                  {course.description && <p className="text-xs text-muted-foreground leading-snug flex-1">{course.description}</p>}
                  <div className="mt-3 flex items-center gap-2">
                    {!course.published && isAdmin && (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">Draft</Badge>
                    )}
                    <button
                      className="text-xs text-primary hover:underline"
                      onClick={(e) => { e.stopPropagation(); setView({ type: 'course', courseId: course.id }) }}
                    >
                      Open →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}
    </section>
  )
}
