"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Archive,
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
  AlignLeft,
  Info,
  Flag,
  Folder,
  Trash2,
  ExternalLink,
  Link,
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
import { Project } from "@/types/project";
import { Agent } from "@/types/agent";

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
    status: "draft",
    priority: "medium",
    project_id: "none",
    project: "",
    agent_id: "none",
    team: "",
    tags: [] as string[],
  });
  const [newTagInput, setNewTagInput] = React.useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [taskToDelete, setTaskToDelete] = React.useState<Task | null>(null);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [selectedSection, setSelectedSection] = React.useState<
    "tasks" | "projects" | "agents"
  >("tasks");
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] =
    React.useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] =
    React.useState(false);
  const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] =
    React.useState(false);
  const [projectToDelete, setProjectToDelete] = React.useState<Project | null>(
    null
  );
  const [editingProject, setEditingProject] = React.useState<Project | null>(
    null
  );
  const [newProject, setNewProject] = React.useState({
    name: "",
    key: "",
    github_url: "",
  });
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [isNewAgentModalOpen, setIsNewAgentModalOpen] = React.useState(false);
  const [isEditAgentModalOpen, setIsEditAgentModalOpen] = React.useState(false);
  const [isDeleteAgentDialogOpen, setIsDeleteAgentDialogOpen] =
    React.useState(false);
  const [agentToDelete, setAgentToDelete] = React.useState<Agent | null>(null);
  const [editingAgent, setEditingAgent] = React.useState<Agent | null>(null);
  const [newAgent, setNewAgent] = React.useState({
    name: "",
    url: "",
    description: "",
  });

  React.useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchAgents();
  }, []);

  React.useEffect(() => {
    if (selectedSection === "projects") {
      fetchProjects();
    }
  }, [selectedSection]);

  React.useEffect(() => {
    if (isNewTaskModalOpen) {
      fetchProjects();
    }
  }, [isNewTaskModalOpen]);

  React.useEffect(() => {
    if (isEditTaskModalOpen) {
      fetchProjects();
    }
  }, [isEditTaskModalOpen]);

  React.useEffect(() => {
    if (isNewTaskModalOpen || isEditTaskModalOpen) {
      fetchAgents();
    }
  }, [isNewTaskModalOpen, isEditTaskModalOpen]);

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

  async function fetchProjects() {
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
        .from("projects")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("archived", false)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      if (data) {
        setProjects(data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }

  async function fetchAgents() {
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
        .from("agents")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("archived", false)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      if (data) {
        setAgents(data);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
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

  async function getNextTaskNumber(projectId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc("get_next_task_number", {
        p_project_id: projectId,
      });

      if (error) {
        console.error("Error getting next task number:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error getting next task number:", error);
      throw error;
    }
  }

  async function handleCreateTask() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/auth");
        return;
      }

      const project = projects.find((p) => p.id === newTask.project_id);
      if (!project) {
        console.error("No project selected");
        return;
      }

      const nextNumber = await getNextTaskNumber(project.id);
      const taskId = `${project.key}-${String(nextNumber).padStart(3, "0")}`;

      const { error } = await supabase.from("tasks").insert([
        {
          user_id: session.user.id,
          task_id: taskId,
          title: newTask.title,
          description: newTask.description,
          status: newTask.status,
          priority: newTask.priority,
          project_id: project.id,
          project: project.name,
          agent_id: newTask.agent_id || null,
          team: newTask.team,
          tags: newTask.tags,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      fetchTasks();
      setNewTask({
        title: "",
        description: "",
        status: "draft",
        priority: "medium",
        project_id: "none",
        project: "",
        agent_id: "none",
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
          title: editingTask.title,
          description: editingTask.description,
          status: editingTask.status,
          priority: editingTask.priority,
          project_id: editingTask.project_id,
          project: editingTask.project,
          agent_id: editingTask.agent_id,
          team: editingTask.team,
          tags: editingTask.tags,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingTask.id)
        .eq("user_id", session.user.id);

      if (error) throw error;

      fetchTasks();
      setIsEditTaskModalOpen(false);
      setEditingTask(null);
      if (selectedTask?.id === editingTask.id) {
        const updatedTask = { ...selectedTask, ...editingTask };
        setSelectedTask(updatedTask);
      }
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

  async function handleCreateProject() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/auth");
        return;
      }

      const { error } = await supabase.from("projects").insert([
        {
          user_id: session.user.id,
          name: newProject.name,
          key: newProject.key.toUpperCase(),
          github_url: newProject.github_url || null,
          archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      fetchProjects();
      setNewProject({ name: "", key: "", github_url: "" });
      setIsNewProjectModalOpen(false);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  }

  async function handleUpdateProject() {
    if (!editingProject) return;

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          name: editingProject.name,
          github_url: editingProject.github_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingProject.id);

      if (error) throw error;

      fetchProjects();
      setIsEditProjectModalOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error("Error updating project:", error);
    }
  }

  async function handleArchiveProject() {
    if (!projectToDelete) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/auth");
        return;
      }

      const { error } = await supabase
        .from("projects")
        .update({ archived: true, updated_at: new Date().toISOString() })
        .eq("id", projectToDelete.id)
        .eq("user_id", session.user.id);

      if (error) throw error;

      fetchProjects();
      setIsDeleteProjectDialogOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error("Error archiving project:", error);
    }
  }

  function handleSidebarItemClick(section: "tasks" | "projects" | "agents") {
    setSelectedSection(section);
  }

  async function handleCreateAgent() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/auth");
        return;
      }

      const { error } = await supabase.from("agents").insert([
        {
          user_id: session.user.id,
          name: newAgent.name,
          url: newAgent.url,
          description: newAgent.description || null,
          archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      fetchAgents();
      setNewAgent({ name: "", url: "", description: "" });
      setIsNewAgentModalOpen(false);
    } catch (error) {
      console.error("Error creating agent:", error);
    }
  }

  async function handleUpdateAgent() {
    if (!editingAgent) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/auth");
        return;
      }

      const { error } = await supabase
        .from("agents")
        .update({
          name: editingAgent.name,
          url: editingAgent.url,
          description: editingAgent.description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingAgent.id)
        .eq("user_id", session.user.id);

      if (error) throw error;

      fetchAgents();
      setIsEditAgentModalOpen(false);
      setEditingAgent(null);
    } catch (error) {
      console.error("Error updating agent:", error);
    }
  }

  async function handleArchiveAgent() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/auth");
        return;
      }

      const { error } = await supabase
        .from("agents")
        .update({ archived: true, updated_at: new Date().toISOString() })
        .eq("id", agentToDelete?.id)
        .eq("user_id", session.user.id);

      if (error) throw error;

      fetchAgents();
      setIsDeleteAgentDialogOpen(false);
      setAgentToDelete(null);
    } catch (error) {
      console.error("Error archiving agent:", error);
    }
  }

  const getAgentName = (agentId: string | null) => {
    if (!agentId) return "Unassigned";
    const agent = agents.find((a) => a.id === agentId);
    return agent ? agent.name : "Unassigned";
  };

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
                    <SidebarMenuButton
                      className={`w-full hover:bg-accent/50 ${
                        selectedSection === "tasks" ? "bg-accent/50" : ""
                      }`}
                      onClick={() => handleSidebarItemClick("tasks")}
                    >
                      <Inbox className="h-4 w-4 text-blue-500" />
                      <span>Tasks</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className={`w-full hover:bg-accent/50 ${
                        selectedSection === "projects" ? "bg-accent/50" : ""
                      }`}
                      onClick={() => handleSidebarItemClick("projects")}
                    >
                      <Tags className="h-4 w-4 text-orange-500" />
                      <span>Projects</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className={`w-full hover:bg-accent/50 ${
                        selectedSection === "agents" ? "bg-accent/50" : ""
                      }`}
                      onClick={() => handleSidebarItemClick("agents")}
                    >
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
          {selectedSection === "tasks" ? (
            <>
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
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
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
                                  : task.status === "draft"
                                  ? "border-purple-500 text-purple-500"
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
                                {status.charAt(0).toUpperCase() +
                                  status.slice(1)}
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
                                              : task.status === "draft"
                                              ? "border-purple-500 text-purple-500"
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
            </>
          ) : selectedSection === "projects" ? (
            <>
              <header className="flex items-center justify-between border-b px-6 py-3">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-xl font-semibold pr-40">Projects</h1>
                </div>
                <Button onClick={() => setIsNewProjectModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </header>

              <div className="flex-grow overflow-auto">
                <div className="p-6">
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between rounded-lg border bg-card p-4"
                      >
                        <div>
                          <h3 className="font-medium">{project.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Key: {project.key}
                          </p>
                          {project.github_url && (
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1 mt-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              GitHub Repo
                            </a>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEditingProject(project);
                              setIsEditProjectModalOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              setProjectToDelete(project);
                              setIsDeleteProjectDialogOpen(true);
                            }}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : selectedSection === "agents" ? (
            <>
              <header className="flex items-center justify-between border-b px-6 py-3">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-xl font-semibold pr-40">Agents</h1>
                </div>
                <Button onClick={() => setIsNewAgentModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Agent
                </Button>
              </header>

              <div className="flex-grow overflow-auto">
                <div className="p-6">
                  <div className="space-y-4">
                    {agents.map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center justify-between rounded-lg border bg-card p-4"
                      >
                        <div>
                          <h3 className="font-medium">{agent.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {agent.url}
                          </p>
                          {agent.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {agent.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEditingAgent(agent);
                              setIsEditAgentModalOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              setAgentToDelete(agent);
                              setIsDeleteAgentDialogOpen(true);
                            }}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
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
              <Select
                value={newTask.project_id}
                onValueChange={(value) => {
                  const project = projects.find((p) => p.id === value);
                  setNewTask((prev) => ({
                    ...prev,
                    project_id: value,
                    project: project?.name || "",
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select a project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="agent">Agent</Label>
              <Select
                value={newTask.agent_id}
                onValueChange={(value) =>
                  setNewTask((prev) => ({ ...prev, agent_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Button
              onClick={handleCreateTask}
              disabled={!newTask.title || !newTask.project_id}
            >
              Create Task
            </Button>
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
                  <SelectItem value="draft">Draft</SelectItem>
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
              <Select
                value={editingTask?.project_id || "none"}
                onValueChange={(value) => {
                  const project = projects.find((p) => p.id === value);
                  setEditingTask((prev) =>
                    prev
                      ? {
                          ...prev,
                          project_id: value,
                          project: project?.name || "",
                        }
                      : null
                  );
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select a project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-agent">Agent</Label>
              <Select
                value={editingTask?.agent_id || "none"}
                onValueChange={(value) =>
                  setEditingTask((prev) =>
                    prev ? { ...prev, agent_id: value } : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      <Dialog
        open={isNewProjectModalOpen}
        onOpenChange={setIsNewProjectModalOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={newProject.name}
                onChange={(e) => {
                  const name = e.target.value;
                  // Auto-generate key from first 3 characters of name, uppercase
                  const autoKey = name.slice(0, 3).toUpperCase();
                  setNewProject((prev) => ({
                    ...prev,
                    name,
                    // Only auto-update key if it hasn't been manually modified
                    key: prev.key === "" ? autoKey : prev.key,
                  }));
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-key">Project Key (2-6 characters)</Label>
              <Input
                id="project-key"
                value={newProject.key}
                onChange={(e) =>
                  setNewProject((prev) => ({
                    ...prev,
                    key: e.target.value.slice(0, 6).toUpperCase(),
                  }))
                }
                maxLength={6}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-github">GitHub Repo URL (Optional)</Label>
              <Input
                id="project-github"
                value={newProject.github_url}
                onChange={(e) =>
                  setNewProject((prev) => ({
                    ...prev,
                    github_url: e.target.value,
                  }))
                }
                placeholder="https://github.com/username/repo"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewProjectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={!newProject.name || newProject.key.length < 2}
            >
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditProjectModalOpen}
        onOpenChange={setIsEditProjectModalOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-project-name">Project Name</Label>
              <Input
                id="edit-project-name"
                value={editingProject?.name ?? ""}
                onChange={(e) =>
                  setEditingProject((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-project-key">Project Key</Label>
              <Input
                id="edit-project-key"
                value={editingProject?.key ?? ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-project-github">GitHub Repo URL</Label>
              <Input
                id="edit-project-github"
                value={editingProject?.github_url ?? ""}
                onChange={(e) =>
                  setEditingProject((prev) =>
                    prev ? { ...prev, github_url: e.target.value } : null
                  )
                }
                placeholder="https://github.com/username/repo"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditProjectModalOpen(false);
                setEditingProject(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProject}
              disabled={!editingProject?.name || editingProject.key.length < 2}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteProjectDialogOpen}
        onOpenChange={setIsDeleteProjectDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Archive Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive this project? Archived projects
              will no longer appear in task creation, but existing tasks will be
              preserved.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-6">
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-medium">{projectToDelete?.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Key: {projectToDelete?.key}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteProjectDialogOpen(false);
                setProjectToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleArchiveProject}>
              Archive Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewAgentModalOpen} onOpenChange={setIsNewAgentModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Agent</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="agent-name">Agent Name</Label>
              <Input
                id="agent-name"
                value={newAgent.name}
                onChange={(e) =>
                  setNewAgent((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="agent-url">URL</Label>
              <Input
                id="agent-url"
                value={newAgent.url}
                onChange={(e) =>
                  setNewAgent((prev) => ({ ...prev, url: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="agent-description">Description (Optional)</Label>
              <Textarea
                id="agent-description"
                value={newAgent.description}
                onChange={(e) =>
                  setNewAgent((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewAgentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAgent}
              disabled={!newAgent.name || !newAgent.url}
            >
              Create Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditAgentModalOpen}
        onOpenChange={setIsEditAgentModalOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-agent-name">Agent Name</Label>
              <Input
                id="edit-agent-name"
                value={editingAgent?.name ?? ""}
                onChange={(e) =>
                  setEditingAgent((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-agent-url">URL</Label>
              <Input
                id="edit-agent-url"
                value={editingAgent?.url ?? ""}
                onChange={(e) =>
                  setEditingAgent((prev) =>
                    prev ? { ...prev, url: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-agent-description">Description</Label>
              <Textarea
                id="edit-agent-description"
                value={editingAgent?.description ?? ""}
                onChange={(e) =>
                  setEditingAgent((prev) =>
                    prev ? { ...prev, description: e.target.value } : null
                  )
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditAgentModalOpen(false);
                setEditingAgent(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAgent}
              disabled={!editingAgent?.name || !editingAgent.url}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteAgentDialogOpen}
        onOpenChange={setIsDeleteAgentDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Archive Agent</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive this agent? Archived agents will
              no longer appear in task assignment, but existing task assignments
              will be preserved.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-6">
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-medium">{agentToDelete?.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {agentToDelete?.url}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteAgentDialogOpen(false);
                setAgentToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleArchiveAgent}>
              Archive Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedTask && (
        <div className="w-96 border-l overflow-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
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
            <div className="space-y-6">
              <div className="bg-accent/50 rounded-lg p-4">
                <h3 className="font-medium text-lg">{selectedTask.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{selectedTask.task_id}</Badge>
                  <Badge
                    variant="outline"
                    className={`
                      ${
                        selectedTask.status === "complete"
                          ? "border-green-500 text-green-500"
                          : selectedTask.status === "in-progress"
                          ? "border-yellow-500 text-yellow-500"
                          : selectedTask.status === "draft"
                          ? "border-purple-500 text-purple-500"
                          : "border-gray-500 text-gray-500"
                      }
                    `}
                  >
                    {selectedTask.status}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlignLeft className="h-4 w-4 text-muted-foreground" />
                  Description
                </h4>
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  {selectedTask.description || "No description provided"}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      Priority
                    </div>
                    <div className="flex items-center gap-2">
                      <Flag
                        className={`h-4 w-4 ${
                          selectedTask.priority === "high"
                            ? "text-red-500"
                            : selectedTask.priority === "medium"
                            ? "text-yellow-500"
                            : "text-blue-500"
                        }`}
                      />
                      <span className="text-sm capitalize">
                        {selectedTask.priority}
                      </span>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      Project
                    </div>
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">{selectedTask.project}</span>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      Agent
                    </div>
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">
                        {getAgentName(selectedTask.agent_id)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      Code
                    </div>
                    <div className="flex items-center gap-2">
                      <Link className="h-4 w-4 text-blue-500" />
                      {selectedTask.feature_branch ? (
                        <a
                          href={`${
                            projects.find(
                              (p) => p.id === selectedTask.project_id
                            )?.github_url
                          }/tree/${selectedTask.feature_branch}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:text-blue-600"
                        >
                          Feature branch
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No branch
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Tags className="h-4 w-4 text-muted-foreground" />
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTask.tags.length > 0 ? (
                    selectedTask.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-blue-500/10 text-blue-500"
                      >
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No tags
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleDeleteTask(selectedTask)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Task
              </Button>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
