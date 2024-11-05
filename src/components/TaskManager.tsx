"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Bell,
  Bot,
  Clock,
  Inbox,
  LayoutGrid,
  List,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  Tags,
  Users,
  X,
  Pencil,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandInput } from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Task } from "@/types/task";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function TaskManager() {
  const router = useRouter();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [selectedView, setSelectedView] = React.useState("list");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = React.useState(false);
  const [newTask, setNewTask] = React.useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    project: "",
    agent: "",
    team: "",
    tags: [] as string[],
  });
  const [newTagInput, setNewTagInput] = React.useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [taskToDelete, setTaskToDelete] = React.useState<Task | null>(null);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);

  React.useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        console.log("No active session");
        router.push("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      if (data) {
        setTasks(data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const filteredTasks = React.useMemo(() => {
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (statusFilter === "all" || task.status === statusFilter)
    );
  }, [tasks, searchQuery, statusFilter]);

  const groupedTasks = React.useMemo(() => {
    return filteredTasks.reduce((acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = [];
      }
      acc[task.status].push(task);
      return acc;
    }, {} as Record<string, typeof tasks>);
  }, [filteredTasks]);

  async function handleCreateTask() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/auth");
        return;
      }

      const task_id = `TASK-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`;

      const { data, error } = await supabase.from("tasks").insert([
        {
          task_id,
          user_id: session.user.id,
          ...newTask,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      // Refresh tasks list
      fetchTasks();

      // Reset form and close modal
      setNewTask({
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        project: "",
        agent: "",
        team: "",
        tags: [],
      });
      setIsNewTaskModalOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  }

  function handleAddTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && newTagInput.trim()) {
      e.preventDefault();
      if (!newTask.tags.includes(newTagInput.trim())) {
        setNewTask((prev) => ({
          ...prev,
          tags: [...prev.tags, newTagInput.trim()],
        }));
      }
      setNewTagInput("");
    }
  }

  function handleRemoveTag(tagToRemove: string) {
    setNewTask((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  }

  async function handleDeleteTask(task: Task) {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  }

  async function confirmDeleteTask() {
    if (!taskToDelete) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/auth");
        return;
      }

      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskToDelete.id)
        .eq("user_id", session.user.id);

      if (error) throw error;

      // Refresh tasks list and close panels
      fetchTasks();
      setSelectedTask(null);
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }

  function handleEditTask(task: Task) {
    setEditingTask({
      ...task,
      tags: [...task.tags],
    });
    setIsEditTaskModalOpen(true);
  }

  async function handleUpdateTask() {
    if (!editingTask) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/auth");
        return;
      }

      const { error } = await supabase
        .from("tasks")
        .update({
          ...editingTask,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingTask.id)
        .eq("user_id", session.user.id);

      if (error) throw error;

      // Refresh tasks list and update selected task
      fetchTasks();
      setSelectedTask(editingTask);
      setIsEditTaskModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }

  function handleEditTagAdd(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && newTagInput.trim() && editingTask) {
      e.preventDefault();
      if (!editingTask.tags.includes(newTagInput.trim())) {
        setEditingTask((prev) => ({
          ...prev!,
          tags: [...prev!.tags, newTagInput.trim()],
        }));
      }
      setNewTagInput("");
    }
  }

  function handleEditTagRemove(tagToRemove: string) {
    if (!editingTask) return;
    setEditingTask((prev) => ({
      ...prev!,
      tags: prev!.tags.filter((tag) => tag !== tagToRemove),
    }));
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <Sidebar className="border-r">
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-blue-500" />
              <h2 className="text-lg font-semibold">AI Task Manager</h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="w-full hover:bg-accent/50">
                      <Inbox className="h-4 w-4 text-blue-500" />
                      <span>Inbox</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="w-full hover:bg-accent/50">
                      <Bot className="h-4 w-4 text-purple-500" />
                      <span>Agents</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="w-full hover:bg-accent/50">
                      <Users className="h-4 w-4 text-green-500" />
                      <span>Teams</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="w-full hover:bg-accent/50">
                      <Tags className="h-4 w-4 text-orange-500" />
                      <span>Projects</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="w-full hover:bg-accent/50">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">
                Teams
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="w-full hover:bg-accent/50">
                      NLP Team
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="w-full hover:bg-accent/50">
                      Research Team
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="w-full hover:bg-accent/50">
                      Support Team
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-grow overflow-hidden">
          <header className="flex items-center justify-between border-b px-6 py-3">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold pr-40">Tasks</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer"
              >
                <Bell className="h-4 w-4" />
              </Button>
              <Select value={selectedView} onValueChange={setSelectedView}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="list">
                    <div className="flex items-center">
                      <List className="mr-2 h-4 w-4" />
                      List
                    </div>
                  </SelectItem>
                  <SelectItem value="board">
                    <div className="flex items-center">
                      <LayoutGrid className="mr-2 h-4 w-4" />
                      Board
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              <Button onClick={() => setIsNewTaskModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </div>
          </header>

          <div className="flex-grow overflow-auto">
            <div className="px-6 py-4">
              <div className="flex gap-4 mb-4">
                <Command className="flex-grow">
                  <CommandInput
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                </Command>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedView === "list" ? (
                <div className="space-y-4 max-w-[1200px]">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-lg border bg-card px-6 py-5 hover:bg-accent/50 cursor-pointer"
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="flex items-center gap-4">
                        <Clock
                          className={`h-4 w-4 ${
                            task.status === "in-progress"
                              ? "text-yellow-500"
                              : task.status === "complete"
                              ? "text-green-500"
                              : "text-gray-500"
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              {task.task_id}
                            </span>
                            <h3 className="font-medium">{task.title}</h3>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {task.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="bg-blue-500/10 text-blue-500"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`
                          ${
                            task.status === "complete"
                              ? "border-green-500 text-green-500"
                              : task.status === "in-progress"
                              ? "border-yellow-500 text-yellow-500"
                              : "border-gray-500 text-gray-500"
                          }
                        `}
                      >
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.keys(groupedTasks).length > 0 ? (
                    Object.entries(groupedTasks).map(([status, tasks]) => (
                      <Card key={status}>
                        <CardHeader>
                          <CardTitle>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {tasks.map((task) => (
                              <div
                                key={task.id}
                                className="rounded-lg border bg-card p-4 hover:bg-accent/50 cursor-pointer"
                                onClick={() => setSelectedTask(task)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-muted-foreground">
                                    {task.task_id}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={`
                                      ${
                                        task.status === "complete"
                                          ? "border-green-500 text-green-500"
                                          : task.status === "in-progress"
                                          ? "border-yellow-500 text-yellow-500"
                                          : "border-gray-500 text-gray-500"
                                      }
                                    `}
                                  >
                                    {task.status}
                                  </Badge>
                                </div>
                                <h3 className="font-medium mb-1">
                                  {task.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                  {task.tags.map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="secondary"
                                      className="bg-blue-500/10 text-blue-500"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-3 text-center text-muted-foreground">
                      No tasks found matching the current filters.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedTask && (
          <div className="w-96 border-l overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Task Details</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditTask(selectedTask)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedTask(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{selectedTask.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedTask.task_id}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm">{selectedTask.description}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Details</h4>
                  <ul className="text-sm space-y-1">
                    <li>
                      <span className="font-medium">Status:</span>{" "}
                      {selectedTask.status}
                    </li>
                    <li>
                      <span className="font-medium">Priority:</span>{" "}
                      {selectedTask.priority}
                    </li>
                    <li>
                      <span className="font-medium">Project:</span>{" "}
                      {selectedTask.project}
                    </li>
                    <li>
                      <span className="font-medium">Agent:</span>{" "}
                      {selectedTask.agent}
                    </li>
                    <li>
                      <span className="font-medium">Team:</span>{" "}
                      {selectedTask.team}
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-blue-500/10 text-blue-500"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleDeleteTask(selectedTask)}
                >
                  Delete Task
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Dialog open={isNewTaskModalOpen} onOpenChange={setIsNewTaskModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newTask.priority}
                onValueChange={(value) =>
                  setNewTask((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project">Project</Label>
              <Input
                id="project"
                value={newTask.project}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, project: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newTask.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-blue-500/10 text-blue-500"
                  >
                    {tag}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <Input
                id="tags"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type and press Enter to add tags"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewTaskModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-6">
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-medium">{taskToDelete?.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {taskToDelete?.task_id}
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setTaskToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditTaskModalOpen} onOpenChange={setIsEditTaskModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editingTask?.title ?? ""}
                onChange={(e) =>
                  setEditingTask((prev) =>
                    prev ? { ...prev, title: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editingTask?.description ?? ""}
                onChange={(e) =>
                  setEditingTask((prev) =>
                    prev ? { ...prev, description: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editingTask?.status}
                onValueChange={(value) =>
                  setEditingTask((prev) =>
                    prev ? { ...prev, status: value as Task["status"] } : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-priority">Priority</Label>
              <Select
                value={editingTask?.priority}
                onValueChange={(value) =>
                  setEditingTask((prev) =>
                    prev
                      ? { ...prev, priority: value as Task["priority"] }
                      : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-project">Project</Label>
              <Input
                id="edit-project"
                value={editingTask?.project ?? ""}
                onChange={(e) =>
                  setEditingTask((prev) =>
                    prev ? { ...prev, project: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-tags">Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {editingTask?.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-blue-500/10 text-blue-500"
                  >
                    {tag}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleEditTagRemove(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <Input
                id="edit-tags"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleEditTagAdd}
                placeholder="Type and press Enter to add tags"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditTaskModalOpen(false);
                setEditingTask(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateTask}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
