import React from "react";
import {
  Box,
  TextField,
  Typography,
  Stack,
} from "@mui/material";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { CreateProjectFormData, UserAuth } from "./types";

interface ProjectFormFieldsProps {
  control: Control<CreateProjectFormData>;
  errors: FieldErrors<CreateProjectFormData>;
  isCreating: boolean;
  userAuth: UserAuth | null;
}

const ProjectFormFields: React.FC<ProjectFormFieldsProps> = ({
  control,
  errors,
  isCreating,
  userAuth,
}) => {
  return (
    <Stack spacing={3}>
      {/* Project Name */}
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Project Name"
            placeholder="Enter project name"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
            disabled={isCreating}
            InputProps={{
              sx: {
                backgroundColor: "#FAFAFA",
                border: "1px solid #E8DDD0",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "&:hover": {
                  backgroundColor: "#F8F8F8",
                  borderColor: "#D4C4B0",
                },
                "&.Mui-focused": {
                  backgroundColor: "#FFFFFF",
                  borderColor: "#2C2C2C",
                  boxShadow: "0 0 0 2px rgba(44, 44, 44, 0.1)",
                },
              },
            }}
            InputLabelProps={{
              sx: {
                color: "#2C2C2C",
                fontWeight: 500,
              },
            }}
          />
        )}
      />

      {/* Project Description */}
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Project Description"
            placeholder="Describe what this project is about"
            fullWidth
            multiline
            rows={4}
            error={!!errors.description}
            helperText={errors.description?.message}
            disabled={isCreating}
            InputProps={{
              sx: {
                backgroundColor: "#FAFAFA",
                border: "1px solid #E8DDD0",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "&:hover": {
                  backgroundColor: "#F8F8F8",
                  borderColor: "#D4C4B0",
                },
                "&.Mui-focused": {
                  backgroundColor: "#FFFFFF",
                  borderColor: "#2C2C2C",
                  boxShadow: "0 0 0 2px rgba(44, 44, 44, 0.1)",
                },
              },
            }}
            InputLabelProps={{
              sx: {
                color: "#2C2C2C",
                fontWeight: 500,
              },
            }}
          />
        )}
      />

      {/* Project Owner Info */}
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: "#E8DDD0", 
          borderRadius: 2,
          border: "1px solid #D4C4B0" 
        }}
      >
        <Typography 
          variant="subtitle2" 
          sx={{ 
            mb: 1,
            color: "#2C2C2C",
            fontWeight: 600 
          }}
        >
          Project Owner
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ color: "#666666" }}
        >
          {userAuth?.username || userAuth?.email}
        </Typography>
      </Box>
    </Stack>
  );
};

export default ProjectFormFields;
