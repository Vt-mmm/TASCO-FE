import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "../../../redux/configStore";

interface User {
  userId: string;
  email: string;
  userName?: string;
  fullName?: string;
}

export const useProjectMembers = (projectId: string) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Get project data from Redux store
  const project = useAppSelector((state) => state.projects.currentProject);
  const projectLoading = useAppSelector((state) => state.projects.isLoading);

  const processProjectMembers = useCallback(() => {
    if (!project || project.id !== projectId) {
      setUsers([]);
      setError("");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // Convert project members to user format
      const userList: User[] = project.members
        .filter(
          (member) =>
            member.approvedStatus === "approved" ||
            member.approvedStatus === "APPROVED" ||
            !member.isRemoved
        ) // Only include approved members
        .map((member) => {
          return {
            userId: member.userId,
            email:
              member.userGmail ||
              member.userEmail ||
              `${member.userId.substring(0, 8)}@example.com`,
            userName:
              member.userName || `User_${member.userId.substring(0, 8)}`,
            fullName:
              member.userName || `User_${member.userId.substring(0, 8)}`,
          };
        });

      setUsers(userList);
    } catch {
      setError("Lỗi khi xử lý danh sách thành viên project");
    } finally {
      setIsLoading(false);
    }
  }, [project, projectId]);

  useEffect(() => {
    processProjectMembers();
  }, [processProjectMembers]);

  // Set loading state based on project loading
  useEffect(() => {
    setIsLoading(projectLoading);
  }, [projectLoading]);

  return {
    users,
    isLoading,
    error,
    refetch: processProjectMembers,
  };
};
