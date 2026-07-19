import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import toast from "react-hot-toast";

export const uploadResume = createAsyncThunk("resume/upload", async (file, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("resume", file);
    const { data } = await api.post("/resumes/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    toast.success("Resume uploaded and parsed successfully");
    return data.data;
  } catch (err) {
    toast.error(err.response?.data?.message || "Upload failed");
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchMyResumes = createAsyncThunk("resume/fetchMine", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/resumes/mine");
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const deleteResume = createAsyncThunk("resume/delete", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/resumes/${id}`);
    toast.success("Resume deleted");
    return id;
  } catch (err) {
    toast.error("Delete failed");
    return rejectWithValue(err.response?.data?.message);
  }
});

const resumeSlice = createSlice({
  name: "resume",
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(uploadResume.pending, (state) => { state.loading = true; })
      .addCase(uploadResume.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
      })
      .addCase(uploadResume.rejected, (state) => { state.loading = false; })
      .addCase(fetchMyResumes.fulfilled, (state, action) => {
        state.list = action.payload;
      })
      .addCase(deleteResume.fulfilled, (state, action) => {
        state.list = state.list.filter((r) => r._id !== action.payload);
      });
  },
});

export default resumeSlice.reducer;
