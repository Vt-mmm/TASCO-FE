import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  TablePagination,
} from "@mui/material";
import { AdminProject } from "../../../common/models";
import { fDate } from "../../../utils/formatTime";

interface ProjectListTableProps {
  projects: AdminProject[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProjectListTable: React.FC<ProjectListTableProps> = ({
  projects,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  return (
    <Paper sx={{ borderRadius: 2, boxShadow: "0 8px 24px rgba(0,0,0,0.05)" }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell>Owner ID</TableCell>
              <TableCell>Members</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <Typography variant="subtitle2">{project.name}</Typography>
                </TableCell>
                <TableCell>{project.ownerId}</TableCell>
                <TableCell>{project.members.length}</TableCell>
                <TableCell>{fDate(project.createdAt)}</TableCell>
                <TableCell>
                  <Chip
                    label={project.isDeleted ? "Deleted" : "Active"}
                    color={project.isDeleted ? "error" : "success"}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </Paper>
  );
};

export default ProjectListTable;
