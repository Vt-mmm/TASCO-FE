import React from "react";
import {
  Typography,
  Card,
  Avatar,
  Chip,
  IconButton,
  Stack,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { ProjectMember } from "../../../common/models/project";
import { useAppDispatch, useAppSelector } from "../../../redux/configStore";
import { updateMemberStatusThunk } from "../../../redux/projectMembers/projectMembersThunks";
import { getProjectByIdThunk } from "../../../redux/projects/projectsThunks";

interface Props {
  projectId: string;
  members: ProjectMember[];
}

const MembersSection: React.FC<Props> = ({ projectId, members }) => {
  const dispatch = useAppDispatch();
  const { isUpdating } = useAppSelector((s) => s.projectMembers);

  const pending = members.filter(
    (m) => (m.status || m.status || "").toUpperCase() === "PENDING"
  );
  const approved = members.filter(
    (m) =>
      (m.status || m.status || "APPROVED").toUpperCase() === "APPROVED"
  );

  const handleApprove = async (memberId: string, approved: boolean) => {
    await dispatch(
      updateMemberStatusThunk({
        projectId,
        memberId,
        approvedStatus: approved ? "APPROVED" : "REJECTED",
        ownerId: "",
      })
    ).unwrap();
    dispatch(getProjectByIdThunk(projectId));
  };

  return (
    <Stack spacing={3} sx={{ mt: 4 }}>
      {/* Pending Requests */}
      <Typography variant="h6">Pending Requests ({pending.length})</Typography>
      {pending.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No pending requests.
        </Typography>
      ) : (
        pending.map((m) => (
          <Card key={m.userId} sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar>{m.userId.charAt(0).toUpperCase()}</Avatar>
              <Typography sx={{ flexGrow: 1 }}>{m.userId}</Typography>
              <IconButton
                color="success"
                disabled={isUpdating}
                onClick={() => handleApprove(m.userId, true)}
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                color="error"
                disabled={isUpdating}
                onClick={() => handleApprove(m.userId, false)}
              >
                <CloseIcon />
              </IconButton>
            </Stack>
          </Card>
        ))
      )}

      {/* Approved Members */}
      <Typography variant="h6" sx={{ mt: 4 }}>
        Members ({approved.length})
      </Typography>
      {approved.map((m) => (
        <Card key={m.userId} sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar>{m.userId.charAt(0).toUpperCase()}</Avatar>
            <Typography sx={{ flexGrow: 1 }}>{m.userId}</Typography>
            <Chip label={m.role ?? "MEMBER"} size="small" />
          </Stack>
        </Card>
      ))}
    </Stack>
  );
};

export default MembersSection;
