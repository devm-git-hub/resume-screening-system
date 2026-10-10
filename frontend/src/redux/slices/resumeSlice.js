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

    const resume = data.data;
    const matches = data.matches || [];

    if (resume.status === "failed") {
      toast.error(`Resume uploaded, but AI parsing failed: ${resume.parsingError || "unknown error"}`);
    } else if (resume.status === "parsed") {
      toast.success(
        matches.length
          ? `Resume parsed and matched against ${matches.length} job${matches.length === 1 ? "" : "s"}`
          : "Resume parsed successfully"
      );
    } else {
      toast.success("Resume uploaded, parsing in progress...");
    }

    return { resume, matches };
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
  // lastMatches = the job matches returned by the most recent upload
  initialState: { list: [], lastMatches: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(uploadResume.pending, (state) => {
        state.loading = true;
        state.lastMatches = [];
      })
      .addCase(uploadResume.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload.resume);
        state.lastMatches = action.payload.matches;
      })
      .addCase(uploadResume.rejected, (state) => { state.loading = false; })
      .addCase(fetchMyResumes.fulfilled, (state, action) => {
        state.list = action.payload;
      })
      .addCase(deleteResume.fulfilled, (state, action) => {
        state.list = state.list.filter((r) => r._id !== action.payload);
        state.lastMatches = state.lastMatches.filter((m) => String(m.resume) !== String(action.payload));
      });
  },
});

export default resumeSlice.reducer;