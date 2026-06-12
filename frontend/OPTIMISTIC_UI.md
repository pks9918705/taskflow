# Optimistic UI — How It Works

## What Is Optimistic UI?

Optimistic UI is a UX pattern where you **update the interface immediately** when the user takes an action, *before* the server confirms the change. You assume the server will succeed. If it fails, you **roll back** to the previous state and show an error.

**Without optimistic UI:**
```
User clicks Delete → Dialog closes → Spinner shows → API call → Response arrives → Card disappears
                                    [~200–500ms of nothing]
```

**With optimistic UI:**
```
User clicks Delete → Card disappears instantly → API call fires in background
                    [0ms — immediate feedback]       ↓ (if fails) → Card reappears + error toast
```

---

## The Core Pattern — Snapshot → Mutate → Rollback

Every optimistic operation follows three steps:

```
1. SNAPSHOT  — save a copy of current state before touching it
2. MUTATE    — update state immediately (what the user sees)
3. ROLLBACK  — if the API fails, restore the snapshot
```

The rollback function is a **closure** — it captures the snapshot at the moment it was created, so it can always restore exactly what was there before.

---

## Implementation in This App

### Step 1: The Helpers (`hooks/useTasks.ts`)

Two helper functions are added to `useTasksQuery`:

```ts
// Removes a task from local state immediately, returns a rollback function
const optimisticRemove = useCallback(
  (id: string): (() => void) => {
    const snapshot = tasks           // 1. capture snapshot
    setTasks(prev => prev.filter(t => t.id !== id))  // 2. mutate immediately
    return () => setTasks(snapshot)  // 3. return rollback closure
  },
  [tasks]
)

// Patches a task's fields locally, returns a rollback function
const optimisticPatch = useCallback(
  (id: string, changes: Partial<Task>): (() => void) => {
    const snapshot = tasks
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...changes } : t))
    return () => setTasks(snapshot)
  },
  [tasks]
)
```

These are returned alongside `tasks`, `isLoading`, etc. from the hook.

---

### Step 2: Optimistic Delete (`tasks/page.tsx`)

```ts
const handleDelete = async () => {
  setDeleteTarget(null)          // close the dialog immediately

  const rollback = optimisticRemove(deleteTarget.id)  // card vanishes NOW

  try {
    await deleteTask(deleteTarget.id)   // fire API in background
    toast({ title: 'Task deleted' })
  } catch (err) {
    rollback()                          // API failed — bring the card back
    toast({ title: 'Could not delete task', variant: 'destructive' })
  }
}
```

**Before:** User had to wait for the API response for the card to disappear.  
**After:** Card vanishes the instant the user confirms. If the server rejects it (e.g. 403 or network error), the card reappears with an error message.

---

### Step 3: Optimistic Status Cycling (`TaskCard.tsx` + `tasks/page.tsx`)

Clicking the status badge on a card **cycles** the task through statuses without opening any modal:

```
PENDING → IN_PROGRESS → DONE → PENDING → ...
```

```ts
// In TaskCard — clicking the badge calls onStatusChange
const STATUS_CYCLE = { PENDING: 'IN_PROGRESS', IN_PROGRESS: 'DONE', DONE: 'PENDING' }

<button onClick={() => onStatusChange?.(task, STATUS_CYCLE[task.status])}>
  <TaskStatusBadge status={task.status} />
</button>
```

```ts
// In tasks/page — optimistically patch, roll back on failure
const handleStatusChange = async (task: Task, next: TaskStatus) => {
  const rollback = optimisticPatch(task.id, { status: next })  // badge flips NOW

  try {
    await updateTask(task.id, { status: next })
  } catch (err) {
    rollback()                                                  // badge reverts
    toast({ title: 'Could not update status', variant: 'destructive' })
  }
}
```

---

## Data Flow Diagram

```
User Action (click)
       │
       ▼
optimisticRemove / optimisticPatch
       │
       ├─── captures snapshot (closure)
       ├─── calls setTasks() → React re-renders instantly
       └─── returns rollback()
                  │
                  ▼
           API call fires (background)
                  │
          ┌───────┴───────┐
          │ SUCCESS       │ FAILURE
          │               │
          ▼               ▼
    show success      rollback()
    toast (or         ──────────
    nothing)          setTasks(snapshot)
                      show error toast
```

---

## Why Use a Closure for Rollback?

A closure is the right tool here because:

1. **It captures state at a specific point in time.** The snapshot is frozen at the moment the user clicked. Even if other state changes happen between the click and the API response, the rollback will always restore that exact snapshot.

2. **No external variable needed.** The snapshot doesn't need to live in a `useRef` or a separate `useState` — it lives inside the function created by `useCallback`.

3. **It's composable.** Multiple optimistic operations can be in-flight at the same time, each with its own independent rollback.

---

## Interview Talking Points

**Q: What is optimistic UI?**
> Update the client state before the server confirms, assume success. If the server fails, roll back and inform the user. This makes the UI feel instant instead of sluggish.

**Q: How do you handle rollback?**
> Before mutating state, I snapshot the current value. I then return a rollback closure that closes over that snapshot. If the API call throws, I call `rollback()` which calls `setState(snapshot)`, restoring the previous value atomically.

**Q: What are the risks?**
> 1. **Inconsistency**: if the server rejects the change, the user briefly sees a wrong state. Mitigated by fast rollback + clear error toast.
> 2. **Race conditions**: if two mutations happen quickly, rollback might overwrite a valid intermediate state. For this app the risk is low (single user, non-concurrent mutations per item).
> 3. **Stale state in rollback closure**: the closure captures `tasks` at click time. Since `optimisticRemove` / `optimisticPatch` are wrapped in `useCallback([tasks])`, they always capture the latest snapshot.

**Q: Why not just refetch after every mutation?**
> A refetch requires a round-trip to the server before the UI updates — typically 100–500ms. With optimistic UI, the change is visible in 0ms. For a CRUD app used constantly, that latency compounds into a noticeably sluggish experience.

**Q: What's the difference between optimistic UI and just updating local state?**
> They look the same on the happy path. The difference is that optimistic UI has an explicit contract: the local update is *provisional*, and if the server disagrees, you must revert it. Without that rollback contract, you end up with stale local data that diverges from the server.
