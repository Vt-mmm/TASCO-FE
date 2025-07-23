import React, { useState } from "react";
import {
  Box,
  Container,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAppDispatch, useAppSelector } from "../../redux/configStore";
import { createProjectThunk } from "../../redux/projects/projectsThunks";
import { createWorkAreaThunk } from "../../redux/workAreas/workAreasThunks";
import { Header } from "../../layout/components/header";
import { CreateProjectRequest } from "../../common/models/project";
import { PATH_USER } from "../../routes/paths";
import {
  ProjectFormHeader,
  ProjectFormFields,
  ProjectFormActions,
  ProjectFormHelpText,
  ProjectFormErrorDisplay,
} from "../../sections/user/createProject";

// Form data interface
interface CreateProjectFormData {
  name: string;
  description: string;
  ownerId: string;
}

// Validation schema
const validationSchema = yup.object({
  name: yup
    .string()
    .required("Project name is required")
    .min(3, "Project name must be at least 3 characters")
    .max(100, "Project name must not exceed 100 characters"),
  description: yup
    .string()
    .required("Project description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters"),
  ownerId: yup.string().required("Owner ID is required"),
});

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isCreating, error } = useAppSelector((state) => state.projects);
  const { userAuth } = useAppSelector((state) => state.auth);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      ownerId: userAuth?.userId || "",
    },
  });

  const onSubmit = async (data: CreateProjectFormData) => {
    try {
      setSubmitError(null);

      // Ensure ownerId is set
      if (!userAuth?.userId) {
        setSubmitError("User not authenticated. Please login again.");
        return;
      }

      const projectData: CreateProjectRequest = {
        name: data.name,
        description: data.description,
        ownerId: userAuth.userId,
      };

      const result = await dispatch(createProjectThunk(projectData)).unwrap();

      const newProjectId =
        (result as { id?: string; projectId?: string }).id ??
        (result as { id?: string; projectId?: string }).projectId;

      if (newProjectId) {
        // Create default work area then navigate
        await dispatch(
          createWorkAreaThunk({
            projectId: newProjectId,
            workAreaData: {
              name: "Backlog",
              description: "Default area for new tasks",
              displayOrder: 1,
            },
          })
        )
          .unwrap()
          .catch(() => {
            // Ignore work area creation errors, not critical
          });

        navigate(PATH_USER.projectDetail(newProjectId));
      } else {
        navigate(PATH_USER.dashboard);
      }
    } catch (error) {
      setSubmitError(error as string);
    }
  };

  const handleCancel = () => {
    navigate(PATH_USER.dashboard);
  };

  const handleReset = () => {
    reset();
    setSubmitError(null);
  };

  return (
    <Box sx={{ bgcolor: "#FAFAFA", minHeight: "100vh" }}>
      <Header />

      <Container maxWidth="md" sx={{ py: 4, mt: 8 }}>
        <ProjectFormHeader onCancel={handleCancel} />

        <ProjectFormErrorDisplay 
          error={error} 
          submitError={submitError} 
        />

        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(44, 44, 44, 0.08)",
            border: "1px solid rgba(44, 44, 44, 0.1)",
            backgroundColor: "white",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={3}>
                <ProjectFormFields
                  control={control}
                  errors={errors}
                  isCreating={isCreating}
                  userAuth={userAuth}
                />
                
                <ProjectFormActions
                  isCreating={isCreating}
                  isValid={isValid}
                  onReset={handleReset}
                  onCancel={handleCancel}
                />
              </Stack>
            </form>
          </CardContent>
        </Card>

        <ProjectFormHelpText />
      </Container>
    </Box>
  );
};

export default CreateProjectPage;
