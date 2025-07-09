import {
  Project,
  ProjectRequest,
  ProjectMember,
} from "../common/models/project";

/**
 * Convert project members with pending status to project requests
 * Since the API only provides PUT/DELETE for members, we derive join requests
 * from project members with 'pending' status
 */
export const getPendingJoinRequests = (project: Project): ProjectRequest[] => {
  if (!project.members) return [];

  const pendingMembers = project.members.filter((member) => {
    const status = member.approvedStatus || member.status;
    const isPending = status === "pending" || status === "PENDING";
    return isPending;
  });

  const requests = pendingMembers.map((member) => ({
    id: member.id || member.userId, // Use member ID or userId as fallback
    projectId: project.id,
    userId: member.userId,
    userName: member.userName,
    requestMessage: "Wants to join this project", // Default message since API doesn't provide this
    status: "pending" as const,
    appliedAt:
      member.appliedAt ||
      member.joinedAt ||
      member.approvedUpdateDate ||
      new Date().toISOString(),
    reviewedAt: undefined,
    reviewedBy: undefined,
    rejectionReason: undefined,
  }));

  return requests;
};

/**
 * Get only approved members from the project
 */
export const getApprovedMembers = (project: Project): ProjectMember[] => {
  if (!project.members) return [];

  return project.members.filter((member) => {
    const status = member.approvedStatus || member.status;
    return (
      (status === "approved" || status === "APPROVED") && !member.isRemoved
    );
  });
};

/**
 * Get all active members (approved + pending) from the project
 */
export const getActiveMembers = (project: Project): ProjectMember[] => {
  if (!project.members) return [];

  return project.members.filter((member) => {
    const status = member.approvedStatus || member.status;
    return status && !member.isRemoved;
  });
};

/**
 * Get member count by status
 */
export const getMemberCountByStatus = (
  project: Project,
  includeStatus: ("approved" | "pending" | "rejected")[]
): number => {
  if (!project.members) return 0;

  return project.members.filter((member) => {
    if (member.isRemoved) return false;

    const status = member.approvedStatus || member.status;
    if (!status) return false;

    const normalizedStatus = status.toLowerCase() as
      | "approved"
      | "pending"
      | "rejected";
    return includeStatus.includes(normalizedStatus);
  }).length;
};

/**
 * Get all join requests including pending, approved, and rejected
 */
export const getAllJoinRequests = (project: Project): ProjectRequest[] => {
  if (!project.members) return [];

  return project.members
    .filter((member) => {
      const status = member.approvedStatus || member.status;
      return status && !member.isRemoved; // Only include members with status and not removed
    })
    .map((member) => {
      const status = member.approvedStatus || member.status;
      return {
        id: member.id || member.userId,
        projectId: project.id,
        userId: member.userId,
        userName: member.userName,
        requestMessage: "Join request", // Default message
        status: (status === "PENDING"
          ? "pending"
          : status === "APPROVED"
          ? "approved"
          : status === "REJECTED"
          ? "rejected"
          : status?.toLowerCase()) as "pending" | "approved" | "rejected",
        appliedAt:
          member.appliedAt ||
          member.joinedAt ||
          member.approvedUpdateDate ||
          new Date().toISOString(),
        reviewedAt: member.approvedUpdateDate,
        reviewedBy: project.ownerId,
        rejectionReason: undefined,
      };
    });
};

/**
 * Check if current user is owner or admin of the project
 */
export const canManageJoinRequests = (
  project: Project,
  currentUserId: string
): boolean => {
  if (project.ownerId === currentUserId) return true;

  const currentMember = project.members?.find(
    (m) => m.userId === currentUserId
  );
  if (!currentMember) return false;

  return (
    currentMember.role === "admin" ||
    currentMember.role === "ADMIN" ||
    currentMember.role === "owner" ||
    currentMember.role === "OWNER"
  );
};

// Note: getUserDisplayName function has been moved to userService.ts
// Use import { getUserDisplayName } from '../utils/userService' instead
