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

export default function TaskManager() {
  const router = useRouter();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [selectedView, setSelectedView] = React.useState("list");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [loading, setLoading] = React.useState(true);

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
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="cursor-pointer">
                      <Inbox className="h-4 w-4 text-blue-500" />
                      <span>Tasks</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Bot className="h-4 w-4 text-purple-500" />
                      <span>Agents</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Users className="h-4 w-4 text-green-500" />
                      <span>Teams</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Tags className="h-4 w-4 text-orange-500" />
                      <span>Projects</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Teams</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>NLP Team</SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Research Team</SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Support Team</SidebarMenuButton>
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
              <Button>
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedTask(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
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
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
}
